import { NextRequest, NextResponse } from "next/server";
import { META_DATA } from "@/lib/demo-data";
import { getRuntimeState } from "@/lib/server-store";

export async function GET(req: NextRequest) {
  const statusFilter = req.nextUrl.searchParams.get("status");
  const state = getRuntimeState();

  const filtered =
    statusFilter === "unreviewed"
      ? state.alerts.filter((a) => a.status === "Belum ditinjau")
      : state.alerts;

  return NextResponse.json({
    count: filtered.length,
    threshold_applied: state.currentThreshold,
    threshold_cap: state.thresholdCap,
    model_version: META_DATA.model_version,
    notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
    alerts: filtered,
  });
}

