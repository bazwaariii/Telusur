import { NextRequest, NextResponse } from "next/server";
import { META_DATA } from "@/lib/demo-data";
import { getRuntimeState, saveRuntimeState } from "@/lib/server-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const alertId = String(body?.alert_id ?? "").trim();
    const verdict = String(body?.verdict ?? "").trim();
    const reviewerNote = String(body?.reviewer_note ?? "").trim();

    if (!alertId) {
      return NextResponse.json(
        { error: "missing_alert_id", message: "Parameter alert_id wajib diisi." },
        { status: 400 }
      );
    }

    if (verdict !== "false_positive" && verdict !== "confirmed") {
      return NextResponse.json(
        {
          error: "invalid_verdict",
          message:
            'Nilai verdict hanya menerima "false_positive" atau "confirmed".',
        },
        { status: 400 }
      );
    }

    const state = getRuntimeState();
    const errT = verdict === "false_positive" ? 1 : 0;

    if (verdict === "false_positive") {
      state.falsePositiveNodeIds[alertId] = true;
      delete state.confirmedNodeIds[alertId];
      state.currentThreshold = Number(
        Math.min(state.thresholdCap, state.currentThreshold + state.aciGamma).toFixed(2)
      );
      state.alerts = state.alerts.map((a) =>
        a.id === alertId || a.walletHash === alertId
          ? { ...a, status: "Alarm palsu" }
          : a
      );
    } else {
      state.confirmedNodeIds[alertId] = true;
      delete state.falsePositiveNodeIds[alertId];
      state.currentThreshold = Number(
        Math.max(state.thresholdMin, state.currentThreshold - 0.01).toFixed(2)
      );
      state.alerts = state.alerts.map((a) =>
        a.id === alertId || a.walletHash === alertId
          ? { ...a, status: "Terkonfirmasi" }
          : a
      );
    }

    const auditLogId = `aud-${1001 + state.auditLogs.length + 1}`;
    state.auditLogs.unshift({
      id: auditLogId,
      timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
      actorName: "API Mitra Kepatuhan",
      actorEmail: "api-webhook@bursa-mitra.id",
      actorRole: "analis",
      action:
        verdict === "false_positive"
          ? "API_FEEDBACK_ALARM_PALSU"
          : "API_FEEDBACK_TERKONFIRMASI",
      subject: alertId,
      detail:
        reviewerNote ||
        `Umpan balik POST /api/v1/feedback (${verdict}, err_t = ${errT}). Ambang ACI kini ${state.currentThreshold
          .toFixed(2)
          .replace(".", ",")}.`,
    });

    saveRuntimeState(state);

    return NextResponse.json({
      alert_id: alertId,
      status:
        verdict === "false_positive"
          ? "reviewed_false_positive"
          : "reviewed_confirmed",
      verdict,
      aci_err_t_recorded: errT,
      next_threshold_preview: state.currentThreshold,
      threshold_cap: state.thresholdCap,
      audit_log_id: auditLogId,
      message:
        verdict === "false_positive"
          ? "Ditandai sebagai alarm palsu. Ambang diperbarui pada pemrosesan berikutnya."
          : "Status tinjauan terkonfirmasi dicatat ke log audit append-only.",
      model_version: META_DATA.model_version,
    });
  } catch {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Permintaan harus berformat JSON yang valid.",
      },
      { status: 400 }
    );
  }
}
