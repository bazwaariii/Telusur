import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNTS,
  buildDynamicAddressCluster,
  getRuntimeState,
  LiveFeedTx,
  resetRuntimeState,
  saveRuntimeState,
  UserAccount,
} from "@/lib/server-store";
import { META_DATA } from "@/lib/demo-data";

function getUserFromRequest(req: NextRequest): UserAccount | null {
  const cookieVal = req.cookies.get("telusur_session")?.value;
  if (!cookieVal) return null;
  return ACCOUNTS.find((a) => a.id === cookieVal) ?? null;
}

export async function GET() {
  const state = getRuntimeState();
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body?.action ?? "");
    const user = getUserFromRequest(req);
    const actorName = user?.name ?? "Muhammad Bazwa Arigusna";
    const actorEmail = user?.email ?? "analis@telusur.id";
    const actorRole = user?.role ?? "analis";

    if (action === "reset") {
      const fresh = resetRuntimeState();
      return NextResponse.json({ ok: true, state: fresh });
    }

    const state = getRuntimeState();

    // 1. Tinjauan alert / simpul (Alarm palsu atau Terkonfirmasi)
    if (action === "verdict") {
      if (user && user.role === "pembaca") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Peran pembaca hanya memiliki hak baca dan tidak dapat mengubah status tinjauan.",
          },
          { status: 403 }
        );
      }

      const subjectId = String(body?.subjectId ?? "");
      const verdict = String(body?.verdict ?? "false_positive") as
        | "false_positive"
        | "confirmed";

      if (verdict === "false_positive") {
        const wasFp = !!state.falsePositiveNodeIds[subjectId];
        if (wasFp) {
          delete state.falsePositiveNodeIds[subjectId];
          state.currentThreshold = Number(
            Math.max(
              state.thresholdMin,
              state.currentThreshold - state.aciGamma
            ).toFixed(2)
          );
        } else {
          state.falsePositiveNodeIds[subjectId] = true;
          delete state.confirmedNodeIds[subjectId];
          state.currentThreshold = Number(
            Math.min(
              state.thresholdCap,
              state.currentThreshold + state.aciGamma
            ).toFixed(2)
          );
        }

        state.alerts = state.alerts.map((a) =>
          a.walletHash === subjectId || a.id === subjectId
            ? { ...a, status: wasFp ? "Belum ditinjau" : "Alarm palsu" }
            : a
        );

        state.auditLogs.unshift({
          id: `aud-${1001 + state.auditLogs.length + 1}`,
          timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
          actorName,
          actorEmail,
          actorRole,
          action: wasFp ? "BATALKAN_ALARM_PALSU" : "TANDAI_ALARM_PALSU",
          subject: subjectId,
          detail: wasFp
            ? `Tanda alarm palsu dibatalkan. Ambang menyesuaikan diri kembali ke ${state.currentThreshold
                .toFixed(2)
                .replace(".", ",")}.`
            : `Ditandai sebagai alarm palsu (err_t = 1). Ambang menyesuaikan diri diperbarui ke ${state.currentThreshold
                .toFixed(2)
                .replace(".", ",")} (batas atas 0,85).`,
        });
      } else {
        state.confirmedNodeIds[subjectId] = true;
        delete state.falsePositiveNodeIds[subjectId];
        state.currentThreshold = Number(
          Math.max(state.thresholdMin, state.currentThreshold - 0.01).toFixed(2)
        );
        state.alerts = state.alerts.map((a) =>
          a.walletHash === subjectId || a.id === subjectId
            ? { ...a, status: "Terkonfirmasi" }
            : a
        );
        state.auditLogs.unshift({
          id: `aud-${1001 + state.auditLogs.length + 1}`,
          timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
          actorName,
          actorEmail,
          actorRole,
          action: "KONFIRMASI_TINJAUAN_LANJUT",
          subject: subjectId,
          detail: `Transaksi dikonfirmasi untuk pemeriksaan lanjutan (err_t = 0). Ambang saat ini ${state.currentThreshold
            .toFixed(2)
            .replace(".", ",")}.`,
        });
      }

      saveRuntimeState(state);
      return NextResponse.json({
        ok: true,
        message:
          verdict === "false_positive"
            ? "Ditandai sebagai alarm palsu. Ambang diperbarui pada pemrosesan berikutnya."
            : `Subjek ${subjectId} dikonfirmasi dan dicatat ke log audit.`,
        state,
      });
    }

    // 2. Tambah ke berkas kasus
    if (action === "add_to_case") {
      const nodeId = String(body?.nodeId ?? "");
      const clusterId = String(body?.clusterId ?? "kluster-t43-23");
      const role = String(body?.role ?? "Titik pencairan");
      const score = Number(body?.score ?? 0.85);
      const band = (body?.band ?? "Tinggi") as any;

      const exists = state.caseDossier.some((c) => c.nodeId === nodeId);
      if (!exists) {
        state.caseDossier.push({
          nodeId,
          clusterId,
          role,
          score,
          band,
          addedAt: new Date().toLocaleTimeString("id-ID") + " WIB",
          addedBy: actorEmail,
        });
        state.auditLogs.unshift({
          id: `aud-${1001 + state.auditLogs.length + 1}`,
          timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
          actorName,
          actorEmail,
          actorRole,
          action: "TAMBAH_KE_KASUS",
          subject: nodeId,
          detail: `Simpul ${nodeId} (${role}, skor ${score
            .toFixed(2)
            .replace(".", ",")}) ditambahkan ke lembar kasus aktif.`,
        });
        saveRuntimeState(state);
      }

      return NextResponse.json({
        ok: true,
        added: !exists,
        message: exists
          ? `Simpul ${nodeId} sudah terdaftar di lembar kasus.`
          : `Simpul ${nodeId} ditambahkan ke lembar kasus dan dicatat di log audit.`,
        state,
      });
    }

    // 3. Inspeksi langsung alamat / transaksi on-chain (Bitcoin, TRON, EVM)
    if (action === "inspect_address") {
      const address = String(body?.address ?? "").trim();
      const chain = (body?.chain ?? "tron") as "bitcoin" | "tron" | "evm";

      if (!address) {
        return NextResponse.json(
          {
            ok: false,
            error: "Masukkan alamat dompet atau hash transaksi terlebih dahulu.",
          },
          { status: 400 }
        );
      }

      const { cluster, graph, alert } = buildDynamicAddressCluster(address, chain);

      const existingIdx = state.customClusters.findIndex((c) => c.id === cluster.id);
      if (existingIdx >= 0) {
        state.customClusters[existingIdx] = cluster;
      } else {
        state.customClusters.unshift(cluster);
      }
      state.customGraphs[cluster.id] = graph;

      if (alert && !state.alerts.some((a) => a.id === alert.id)) {
        state.alerts.unshift(alert);
      }

      state.auditLogs.unshift({
        id: `aud-${1001 + state.auditLogs.length + 1}`,
        timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
        actorName,
        actorEmail,
        actorRole,
        action: "INSPEKSI_JARINGAN_LANGSUNG",
        subject: cluster.focal_node_id,
        detail: `Menjalankan penelusuran graf 2-lompatan pada ${cluster.title}. Skor titik fokus: ${cluster.max_score
          .toFixed(2)
          .replace(".", ",")}.`,
      });

      saveRuntimeState(state);
      return NextResponse.json({
        ok: true,
        cluster,
        graph,
        alert,
        state,
      });
    }

    // 4. Detak aliran transaksi jaringan langsung (Live On-Chain Stream)
    if (action === "stream_tick") {
      state.liveCounter = (state.liveCounter ?? 0) + 1;
      const tick = state.liveCounter;

      const templates: Array<{
        chain: "Bitcoin" | "TRON USDT" | "Ethereum";
        chainCode: "bitcoin" | "tron" | "evm";
        addr: string;
        from: string;
        amount: string;
        fanOut: number;
        fanIn: number;
        dwell: number;
        score: number;
        band: "Rendah" | "Sedang" | "Tinggi" | "Sangat tinggi";
        pattern: string;
      }> = [
        {
          chain: "TRON USDT",
          chainCode: "tron",
          addr: `TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYq${(tick % 89) + 10}`,
          from: "TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb",
          amount: `${(64200 + ((tick * 3100) % 45000)).toLocaleString("id-ID")} USDT`,
          fanOut: 1,
          fanIn: 4,
          dwell: 1,
          score: 0.91,
          band: "Sangat tinggi",
          pattern: "Konvergensi 4 jalur rantai pengelupasan TRC-20 (< 2 blok)",
        },
        {
          chain: "Ethereum",
          chainCode: "evm",
          addr: `0x71C7656EC7ab88b098defB751B7401B5f6d897${(tick % 89) + 10}`,
          from: "0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67",
          amount: `${(24.5 + (tick % 17)).toFixed(2).replace(".", ",")} ETH`,
          fanOut: 1,
          fanIn: 3,
          dwell: 1,
          score: 0.84,
          band: "Tinggi",
          pattern: "Pengumpulan cepat dari 3 dompet transit pasca-pemecahan",
        },
        {
          chain: "Bitcoin",
          chainCode: "bitcoin",
          addr: `bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf${(tick % 89) + 10}`,
          from: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          amount: `${(8.4 + (tick % 9)).toFixed(2).replace(".", ",")} BTC`,
          fanOut: 1,
          fanIn: 4,
          dwell: 1,
          score: 0.89,
          band: "Tinggi",
          pattern: "Konsolidasi 4 cabang rantai pengelupasan menuju dompet keluar",
        },
        {
          chain: "TRON USDT",
          chainCode: "tron",
          addr: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj${(tick % 89) + 10}`,
          from: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
          amount: "1.250 USDT",
          fanOut: 1,
          fanIn: 1,
          dwell: 64,
          score: 0.12,
          band: "Rendah",
          pattern: "Transfer ritel tunggal dengan waktu tahan saldo normal",
        },
      ];

      const chosen = templates[tick % templates.length];
      const flagged = chosen.score >= state.currentThreshold;

      // Bangun kluster graf 2-lompatan untuk setiap item agar tombol "Buka di kanvas" selalu bekerja
      const built = buildDynamicAddressCluster(
        chosen.addr,
        chosen.chainCode,
        chosen.score
      );
      const createdClusterId = built.cluster.id;

      if (!state.customClusters.some((c) => c.id === built.cluster.id)) {
        state.customClusters.unshift(built.cluster);
        if (state.customClusters.length > 12) {
          state.customClusters.pop();
        }
      }
      state.customGraphs[built.cluster.id] = built.graph;

      if (flagged && built.alert && !state.alerts.some((a) => a.walletHash === chosen.addr)) {
        state.alerts.unshift({
          ...built.alert,
          score: chosen.score,
          band: chosen.band,
          reason: chosen.pattern,
          volumeLabel: chosen.amount,
        });
        if (state.alerts.length > 30) {
          state.alerts.pop();
        }
      }

      const feedItem: LiveFeedTx = {
        txid: chosen.addr,
        chain: chosen.chain,
        timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
        from: chosen.from,
        to: chosen.addr,
        amountLabel: chosen.amount,
        fanOut: chosen.fanOut,
        fanIn: chosen.fanIn,
        dwellBlocks: chosen.dwell,
        score: chosen.score,
        band: chosen.band,
        flagged,
        patternLabel: chosen.pattern,
        clusterId: createdClusterId,
      };

      state.liveFeed = [feedItem, ...(state.liveFeed ?? []).slice(0, 9)];

      saveRuntimeState(state);
      return NextResponse.json({
        ok: true,
        feedItem,
        cluster: built.cluster,
        graph: built.graph,
        state,
      });
    }

    // 5. Pendaftaran akses organisasi / perusahaan
    if (action === "request_access") {
      const email = String(body?.email ?? "").trim();
      const institution = String(body?.institution ?? "").trim();
      const role = String(body?.role ?? "Tim Kepatuhan Bursa").trim();
      const notes = String(body?.notes ?? "").trim();

      const keyHash = crypto
        .createHash("sha256")
        .update(`${email}:${institution}:${Date.now()}`)
        .digest("hex")
        .slice(0, 16);
      const issuedApiKey = `tls_org_${keyHash}`;

      const record = {
        id: `req-${(state.accessRequests?.length ?? 0) + 1}`,
        email,
        institution,
        role,
        notes,
        issuedApiKey,
        createdAt: new Date().toLocaleTimeString("id-ID") + " WIB",
      };

      state.accessRequests = [record, ...(state.accessRequests ?? [])];
      state.auditLogs.unshift({
        id: `aud-${1001 + state.auditLogs.length + 1}`,
        timestamp: record.createdAt,
        actorName: institution,
        actorEmail: email,
        actorRole: "mitra-api",
        action: "PENDAFTARAN_INTEGRASI_ORGANISASI",
        subject: issuedApiKey,
        detail: `Organisasi ${institution} (${role}) mendaftarkan integrasi dan menerima kunci API ${issuedApiKey.slice(
          0,
          12
        )}….`,
      });

      saveRuntimeState(state);
      return NextResponse.json({
        ok: true,
        record,
        state,
      });
    }

    // 6. Uji kirim payload Webhook bertanda tangan HMAC-SHA256
    if (action === "test_webhook") {
      const targetUrl = String(
        body?.webhookUrl ?? "https://kepatuhan.bursa-mitra.id/webhooks/telusur"
      ).trim();
      const ts = Math.floor(Date.now() / 1000);
      const topAlert = state.alerts[0] ?? {
        id: "alrt-01",
        walletHash: "tx_230488910",
        band: "Sangat tinggi",
        score: 0.94,
      };
      const payloadObj = {
        event: "alert.flagged_for_review",
        alert_id: topAlert.id,
        subject_hash:
          topAlert.walletHash.length > 12
            ? `${topAlert.walletHash.slice(0, 6)}…${topAlert.walletHash.slice(-4)}`
            : topAlert.walletHash,
        score: topAlert.score,
        band: topAlert.band,
        threshold_applied: state.currentThreshold,
        model_version: META_DATA.model_version,
        notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
      };
      const rawJson = JSON.stringify(payloadObj, null, 2);
      const sig = crypto
        .createHmac("sha256", "telusur_hmac_secret_2026")
        .update(`${ts}.${rawJson}`)
        .digest("hex");

      state.auditLogs.unshift({
        id: `aud-${1001 + state.auditLogs.length + 1}`,
        timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
        actorName,
        actorEmail,
        actorRole,
        action: "KIRIM_WEBHOOK_HMAC",
        subject: targetUrl,
        detail: `Mengirim payload alert ${topAlert.id} dengan tanda tangan sha256=${sig.slice(
          0,
          12
        )}… ke ${targetUrl}.`,
      });
      saveRuntimeState(state);

      return NextResponse.json({
        ok: true,
        signature: `sha256=${sig}`,
        timestamp: ts,
        payload: payloadObj,
        state,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Aksi tidak dikenali." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal memproses permintaan state." },
      { status: 400 }
    );
  }
}
