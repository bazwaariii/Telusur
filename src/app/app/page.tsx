"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HashBadge } from "@/components/HashBadge";
import { RiskChip } from "@/components/RiskChip";
import { formatScore, NodeStatus, THRESHOLD_DATA } from "@/lib/demo-data";
import type {
  AlertRecord,
  AuditRecord,
  LiveFeedTx,
  UserRole,
} from "@/lib/server-store";

type ReviewStatus = "Belum ditinjau" | "Alarm palsu" | "Terkonfirmasi";
type ActiveSection =
  | "antrean"
  | "drift"
  | "apikey"
  | "webhook"
  | "telegram"
  | "audit";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  institution: string;
  role: UserRole;
}

const INITIAL_CLIENT_ALERTS: AlertRecord[] = [
  {
    id: "alrt-01",
    createdAt: "2026-11-07 14:22:10 WIB",
    timestepLabel: "t43",
    chain: "Bitcoin (Elliptic)",
    walletHash: "tx_230488910",
    score: 0.94,
    band: "Sangat tinggi",
    reason: "Arus masuk terkonsentrasi dari empat jalur rantai pengelupasan dalam satu timestep",
    status: "Belum ditinjau",
    clusterId: "kluster-t43-23",
    volumeLabel: "23,45 BTC",
  },
  {
    id: "alrt-02",
    createdAt: "2026-11-07 09:15:42 WIB",
    timestepLabel: "t38",
    chain: "Bitcoin (Elliptic)",
    walletHash: "tx_184920311",
    score: 0.89,
    band: "Tinggi",
    reason: "Konvergensi 17,15 BTC setelah melewati tiga lompatan pemecahan nominal seragam",
    status: "Belum ditinjau",
    clusterId: "kluster-t38-14",
    volumeLabel: "17,15 BTC",
  },
  {
    id: "alrt-03",
    createdAt: "2026-11-07 14:19:05 WIB",
    timestepLabel: "t43",
    chain: "Bitcoin (Elliptic)",
    walletHash: "tx_230471302",
    score: 0.85,
    band: "Tinggi",
    reason: "Pengumpul pra-pencairan dengan waktu singgah dana kurang dari 2 blok",
    status: "Belum ditinjau",
    clusterId: "kluster-t43-23",
    volumeLabel: "7,20 BTC",
  },
  {
    id: "alrt-04",
    createdAt: "2026-11-07 14:18:11 WIB",
    timestepLabel: "t43",
    chain: "Bitcoin (Elliptic)",
    walletHash: "tx_230471301",
    score: 0.83,
    band: "Tinggi",
    reason: "Tetangga satu lompatan memiliki skor risiko di atas kuartil ke-90",
    status: "Belum ditinjau",
    clusterId: "kluster-t43-23",
    volumeLabel: "7,40 BTC",
  },
  {
    id: "alrt-05",
    createdAt: "2026-11-07 18:04:33 WIB",
    timestepLabel: "t46",
    chain: "Bitcoin (Elliptic)",
    walletHash: "tx_291044812",
    score: 0.81,
    band: "Tinggi",
    reason: "Pencairan jalur pendek pasca-pergeseran rezim dari tiga dompet perantara",
    status: "Belum ditinjau",
    clusterId: "kluster-t46-09",
    volumeLabel: "9,10 BTC",
  },
  {
    id: "alrt-12",
    createdAt: "2026-11-07 11:10:27 WIB",
    timestepLabel: "t41",
    chain: "Bitcoin (Elliptic)",
    walletHash: "tx_209331047",
    score: 0.56,
    band: "Sedang",
    reason: "Dana langsung diteruskan ke banyak dompet penerima sekaligus (kandidat pembayaran batch)",
    status: "Belum ditinjau",
    clusterId: "kluster-t41-11",
    volumeLabel: "10,00 BTC",
  },
];

export default function DasborAppPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [alerts, setAlerts] = useState<AlertRecord[]>(INITIAL_CLIENT_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    {
      id: "aud-1001",
      timestamp: "2026-11-07 22:10:04 WIB",
      actorName: "Muhammad Bazwa Arigusna",
      actorEmail: "analis@telusur.id",
      actorRole: "analis",
      action: "INISIALISASI_MODEL_DAN_ANTREAN",
      subject: "telusur-lgbm-aci-v0.4.2-elliptic",
      detail: "Memuat 12 alert awal pada ambang menyesuaikan diri 0,34 (batas atas 0,85).",
    },
  ]);
  const [liveFeed, setLiveFeed] = useState<LiveFeedTx[]>([]);
  const [currentThreshold, setCurrentThreshold] = useState<number>(0.34);
  const [activeSection, setActiveSection] = useState<ActiveSection>("antrean");
  const [filterStatus, setFilterStatus] = useState<"Semua" | ReviewStatus>("Semua");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [liveMonitor, setLiveMonitor] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState(
    "https://kepatuhan.bursa-mitra.id/webhooks/telusur"
  );
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [telegramChatId, setTelegramChatId] = useState("-100194827411");

  const triggerToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const localUserRaw = localStorage.getItem("telusur_session_user");
      if (localUserRaw) {
        setUser(JSON.parse(localUserRaw));
      }
    } catch {}

    try {
      const [authRes, stateRes] = await Promise.all([
        fetch("/api/auth", { cache: "no-store" }),
        fetch("/api/state", { cache: "no-store" }),
      ]);
      if (authRes.ok && authRes.headers.get("content-type")?.includes("application/json")) {
        const authData = await authRes.json();
        if (authData.authenticated && authData.user) {
          setUser(authData.user);
        }
      }
      if (stateRes.ok && stateRes.headers.get("content-type")?.includes("application/json")) {
        const st = await stateRes.json();
        if (Array.isArray(st.alerts) && st.alerts.length > 0) {
          setAlerts(st.alerts);
        }
        if (Array.isArray(st.auditLogs) && st.auditLogs.length > 0) {
          setAuditLogs(st.auditLogs);
        }
        if (Array.isArray(st.liveFeed)) {
          setLiveFeed(st.liveFeed);
        }
        setCurrentThreshold(st.currentThreshold ?? 0.34);
      }
    } catch {
      // Tetap aman bila di-hosting secara statis
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mode gelap khusus saat berada di /app sesuai design.md Bagian 3 & 6.3
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [darkMode]);

  // Pemantau alert langsung di latar belakang saat diaktifkan
  const pullLiveTick = useCallback(async () => {
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stream_tick" }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.state) {
          setAlerts(data.state.alerts ?? []);
          setAuditLogs(data.state.auditLogs ?? []);
          setLiveFeed(data.state.liveFeed ?? []);
          setCurrentThreshold(data.state.currentThreshold ?? 0.34);
        }
        if (data.feedItem?.flagged) {
          triggerToast(
            `Alert baru terdeteksi pada ${data.feedItem.chain}: ${data.feedItem.txid.slice(
              0,
              10
            )}… (skor ${formatScore(data.feedItem.score)})`
          );
        }
        return;
      }
    } catch {
      // Lanjutkan dengan pembangkitan aliran langsung sisi klien
    }

    // Fallback untuk penayangan statis (Netlify Drop)
    const idx = Math.floor(Date.now() / 3500) % 3;
    const sampleFeed: LiveFeedTx =
      idx === 0
        ? {
            txid: `TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYq${(Math.floor(Date.now() / 1000) % 89) + 10}`,
            chain: "TRON USDT",
            timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
            from: "TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb",
            to: "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL",
            amountLabel: "64.800 USDT",
            fanOut: 1,
            fanIn: 4,
            dwellBlocks: 1,
            score: 0.91,
            band: "Sangat tinggi",
            flagged: true,
            patternLabel: "Konvergensi 4 jalur rantai pengelupasan TRC-20 (< 2 blok)",
            clusterId: "kluster-t43-23",
          }
        : idx === 1
        ? {
            txid: `0x71C7656EC7ab88b098defB751B7401B5f6d897${(Math.floor(Date.now() / 1000) % 89) + 10}`,
            chain: "Ethereum",
            timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
            from: "0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67",
            to: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            amountLabel: "29,40 ETH",
            fanOut: 1,
            fanIn: 3,
            dwellBlocks: 1,
            score: 0.86,
            band: "Tinggi",
            flagged: true,
            patternLabel: "Pengumpulan cepat dari 3 dompet perantara pasca-pemecahan",
            clusterId: "kluster-t38-14",
          }
        : {
            txid: `bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5m${(Math.floor(Date.now() / 1000) % 89) + 10}`,
            chain: "Bitcoin",
            timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
            from: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            to: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
            amountLabel: "14,20 BTC",
            fanOut: 1,
            fanIn: 3,
            dwellBlocks: 1,
            score: 0.89,
            band: "Sangat tinggi",
            flagged: true,
            patternLabel: "Penyatuan kembali 3 cabang pengelupasan menuju titik pencairan",
            clusterId: "kluster-t43-23",
          };

    setLiveFeed((prev) => [sampleFeed, ...prev.slice(0, 7)]);
    triggerToast(
      `Alert baru terdeteksi pada ${sampleFeed.chain}: ${sampleFeed.txid.slice(
        0,
        10
      )}… (skor ${formatScore(sampleFeed.score)})`
    );
  }, [triggerToast]);

  useEffect(() => {
    if (!liveMonitor) return;
    pullLiveTick();
    const timer = setInterval(() => {
      pullLiveTick();
    }, 3500);
    return () => clearInterval(timer);
  }, [liveMonitor, pullLiveTick]);

  const handleVerdict = async (
    alertItem: AlertRecord,
    verdict: "false_positive" | "confirmed"
  ) => {
    if (user?.role === "pembaca") {
      triggerToast(
        "Peran pembaca hanya memiliki akses baca dan tidak dapat mengubah status tinjauan."
      );
      return;
    }

    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verdict",
          subjectId: alertItem.walletHash,
          verdict,
        }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.state) {
          setAlerts(data.state.alerts ?? []);
          setAuditLogs(data.state.auditLogs ?? []);
          setCurrentThreshold(data.state.currentThreshold ?? 0.34);
        }
        triggerToast(
          data.message ??
            "Ditandai sebagai alarm palsu. Ambang diperbarui pada pemrosesan berikutnya."
        );
        return;
      }
    } catch {
      // Fallback klien untuk penayangan statis
    }

    const nextStatus: ReviewStatus =
      verdict === "false_positive" ? "Alarm palsu" : "Terkonfirmasi";
    const nextThresh =
      verdict === "false_positive"
        ? Math.min(0.85, Number((currentThreshold + 0.02).toFixed(2)))
        : Math.max(0.25, Number((currentThreshold - 0.01).toFixed(2)));

    setAlerts((prev) =>
      prev.map((a) =>
        a.walletHash === alertItem.walletHash ? { ...a, status: nextStatus } : a
      )
    );
    setCurrentThreshold(nextThresh);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
        actorName: user?.name ?? "Muhammad Bazwa Arigusna",
        actorEmail: user?.email ?? "analis@telusur.id",
        actorRole: user?.role ?? "analis",
        action:
          verdict === "false_positive"
            ? "TANDAI_ALARM_PALSU"
            : "KONFIRMASI_TEMUAN",
        subject: alertItem.walletHash,
        detail: `Status diubah menjadi ${nextStatus}. Ambang disesuaikan menjadi ${formatScore(
          nextThresh
        )}.`,
      },
      ...prev,
    ]);
    triggerToast(
      verdict === "false_positive"
        ? `Ditandai sebagai alarm palsu. Ambang diperbarui menjadi ${formatScore(nextThresh)}.`
        : `Temuan dikonfirmasi. Ambang diperbarui menjadi ${formatScore(nextThresh)}.`
    );
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        setAlerts(data.state.alerts ?? []);
        setAuditLogs(data.state.auditLogs ?? []);
        setLiveFeed(data.state.liveFeed ?? []);
        setCurrentThreshold(data.state.currentThreshold ?? 0.34);
        triggerToast(
          "Antrean alert dan ambang dikembalikan ke kondisi awal (12 alert, ambang 0,34)."
        );
        return;
      }
    } catch {
      // Fallback klien
    }

    setAlerts(INITIAL_CLIENT_ALERTS);
    setCurrentThreshold(0.34);
    triggerToast(
      "Antrean alert dan ambang dikembalikan ke kondisi awal (ambang 0,34)."
    );
  };

  const handleTestWebhook = async () => {
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_webhook",
          webhookUrl,
        }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        setWebhookResult(
          JSON.stringify(
            {
              headers: {
                "X-Telusur-Signature": data.signature,
                "X-Telusur-Timestamp": data.timestamp,
              },
              body: data.payload,
            },
            null,
            2
          )
        );
        if (data.state?.auditLogs) {
          setAuditLogs(data.state.auditLogs);
        }
        triggerToast(
          `Payload webhook bertanda tangan HMAC dikirim dan dicatat ke log audit.`
        );
        return;
      }
    } catch {
      // Fallback klien
    }

    const ts = new Date().toISOString();
    const payload = {
      event: "alert.cashout_sink_detected",
      timestamp: ts,
      target_url: webhookUrl,
      subject: "tx_230488910",
      chain: "bitcoin-elliptic",
      score: 0.94,
      band: "Sangat tinggi",
      prediction_set: ["Ilegal"],
      threshold: currentThreshold,
    };
    const sig = "sha256=be16f47cea88c3a9021d4e77b8103c5f9a2e41d08c73b619f02a4e81c3d59b12";
    setWebhookResult(
      JSON.stringify(
        {
          headers: {
            "X-Telusur-Signature": sig,
            "X-Telusur-Timestamp": ts,
          },
          body: payload,
        },
        null,
        2
      )
    );
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
        actorName: user?.name ?? "Muhammad Bazwa Arigusna",
        actorEmail: user?.email ?? "analis@telusur.id",
        actorRole: user?.role ?? "analis",
        action: "UJI_PENGIRIMAN_WEBHOOK_HMAC",
        subject: webhookUrl,
        detail: `Payload bertanda tangan ${sig.slice(0, 24)}... berhasil diuji.`,
      },
      ...prev,
    ]);
    triggerToast(
      `Payload webhook bertanda tangan HMAC dikirim dan dicatat ke log audit.`
    );
  };

  const handleDownloadAuditCsv = () => {
    const header = "id,timestamp,actorName,actorEmail,actorRole,action,subject,detail\n";
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorEmail}","${l.actorRole}","${l.action}","${l.subject}","${l.detail.replace(
            /"/g,
            '""'
          )}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telusur-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unreviewedCount = alerts.filter((a) => a.status === "Belum ditinjau").length;
  const visibleAlerts =
    filterStatus === "Semua"
      ? alerts
      : alerts.filter((a) => a.status === filterStatus);

  return (
    <div
      className="wadah-kanvas"
      style={{
        paddingTop: "24px",
        paddingBottom: "64px",
      }}
    >
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="elemen-apung"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "14px 18px",
            maxWidth: "420px",
            zIndex: 90,
            borderLeft: "4px solid var(--teal-tua)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "14px" }}>{toast}</div>
        </div>
      )}

      {/* Bilah status sesi pengguna */}
      <div
        className="panel-kerja"
        style={{
          padding: "12px 18px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          {user ? (
            <div style={{ fontSize: "14px" }}>
              Sesi aktif: <strong>{user.name}</strong> ({user.email}) | Peran:{" "}
              <code className="font-mono" style={{ fontWeight: 700 }}>
                {user.role}
              </code>{" "}
              | Institusi: {user.institution}
            </div>
          ) : (
            <div style={{ fontSize: "14px" }}>
              Sesi kerja analis aktif (<strong>Muhammad Bazwa Arigusna</strong>).{" "}
              <Link href="/masuk" style={{ fontWeight: 600 }}>
                Beralih akun peran (analis / admin / mitra-api / pembaca)
              </Link>{" "}
              untuk menguji pembatasan hak akses.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={liveMonitor ? "tombol-utama" : "tombol-sekunder"}
            onClick={() => setLiveMonitor((prev) => !prev)}
            style={{ minHeight: "36px", padding: "6px 12px", fontSize: "12.5px" }}
          >
            {liveMonitor
              ? "● Pemantau Alert Langsung Aktif (Hentikan)"
              : "Pantau alert jaringan langsung"}
          </button>
          <button
            type="button"
            className="tombol-sekunder"
            onClick={handleResetDemo}
            style={{ minHeight: "36px", padding: "6px 12px", fontSize: "12.5px" }}
          >
            Atur ulang antrean (12 alert)
          </button>
        </div>
      </div>

      {/* Panel Umpan Langsung saat Pemantau Alert Aktif */}
      {liveMonitor && (
        <div
          className="panel-kerja"
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderLeft: "4px solid var(--teal)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <div>
              <strong style={{ fontSize: "14px" }}>
                Aliran Deteksi Jaringan Langsung (Bitcoin, TRON USDT TRC-20, Ethereum)
              </strong>
              <span className="teks-kecil" style={{ marginLeft: "10px" }}>
                Transaksi dengan skor di atas ambang {currentThreshold.toFixed(2).replace(".", ",")}{" "}
                otomatis masuk ke antrean tinjauan di bawah.
              </span>
            </div>
            <button
              type="button"
              className="tombol-utama"
              onClick={pullLiveTick}
              style={{ minHeight: "32px", padding: "4px 12px", fontSize: "12px" }}
            >
              Tarik transaksi baru sekarang
            </button>
          </div>
          {liveFeed.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {liveFeed.slice(0, 3).map((item, idx) => (
                <div
                  key={`${item.txid}-${idx}`}
                  style={{
                    flex: "1 1 260px",
                    padding: "10px 12px",
                    backgroundColor: "var(--kertas)",
                    border: "1px solid var(--garis)",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{item.chain}</strong>
                    <span className="font-mono teks-kecil">{item.timestamp}</span>
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <HashBadge value={item.txid} />
                  </div>
                  <div className="teks-kecil">
                    Volume: <strong>{item.amountLabel}</strong> | Skor:{" "}
                    <strong>{formatScore(item.score)}</strong> ({item.band})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="layout-dasbor">
        {/* Navigasi samping yang tenang sesuai design.md Bagian 6.3 */}
        <aside
          aria-label="Navigasi pengaturan dasbor"
          className="panel-kerja"
          style={{ padding: "16px" }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--tinta-redup)",
              marginBottom: "10px",
            }}
          >
            Navigasi Meja Kerja
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              { id: "antrean", label: `Antrean tinjauan (${unreviewedCount})` },
              { id: "drift", label: "Pemantau drift (PSI dan KS)" },
              { id: "apikey", label: "API key dan kuota" },
              { id: "webhook", label: "Webhook (HMAC)" },
              { id: "telegram", label: "Notifikasi Telegram" },
              { id: "audit", label: `Audit log (${auditLogs.length})` },
            ].map((tab) => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as ActiveSection)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    minHeight: "42px",
                    borderRadius: "var(--r-kontrol)",
                    border: "none",
                    backgroundColor: active ? "var(--kertas)" : "transparent",
                    color: "var(--tinta)",
                    fontWeight: active ? 700 : 500,
                    fontFamily: "var(--font-ui)",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--garis)",
            }}
          >
            <button
              type="button"
              className="tombol-sekunder"
              aria-pressed={darkMode}
              onClick={() => setDarkMode((prev) => !prev)}
              style={{ width: "100%", fontSize: "13px", minHeight: "40px" }}
            >
              {darkMode
                ? "Kembali ke mode kertas terang"
                : "Aktifkan mode gelap sesi panjang"}
            </button>
          </div>
        </aside>

        {/* Area Utama Dasbor */}
        <section style={{ minWidth: 0 }}>
          {activeSection === "antrean" && (
            <div>
              {/* Satu kalimat ringkasan di atasnya sesuai design.md Bagian 6.3 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h1 style={{ fontSize: "26px", marginBottom: "6px" }}>
                    {unreviewedCount} alert belum ditinjau. Ambang saat ini{" "}
                    {currentThreshold.toFixed(2).replace(".", ",")}.
                  </h1>
                  <p className="teks-kecil" style={{ marginBottom: 0 }}>
                    Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah. Setiap keputusan tinjauan tercatat di audit log dan memperbarui ambang menyesuaikan diri.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {(
                    ["Semua", "Belum ditinjau", "Alarm palsu", "Terkonfirmasi"] as const
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      className="tombol-sekunder"
                      aria-pressed={filterStatus === st}
                      onClick={() => setFilterStatus(st)}
                      style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {visibleAlerts.length === 0 ? (
                <div className="panel-kerja" style={{ padding: "32px" }}>
                  <p style={{ fontWeight: 600, marginBottom: "8px" }}>
                    Belum ada alert yang perlu ditinjau. Alert baru muncul di sini saat skor melewati ambang.
                  </p>
                  <button
                    type="button"
                    className="tombol-sekunder"
                    onClick={() => setFilterStatus("Semua")}
                  >
                    Tampilkan semua riwayat alert
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    className="tabel-data"
                    aria-label="Tabel antrean tinjauan alert"
                  >
                    <thead>
                      <tr>
                        <th scope="col">Waktu</th>
                        <th scope="col">Hash dompet / ID</th>
                        <th scope="col">Band risiko</th>
                        <th scope="col">Alasan utama</th>
                        <th scope="col">Status</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAlerts.map((item) => {
                        const chipStatus: NodeStatus | undefined =
                          item.status === "Alarm palsu"
                            ? "alarm_palsu"
                            : item.band === "Sangat tinggi"
                            ? "sangat_tinggi"
                            : item.band === "Tinggi"
                            ? "titik_pencairan"
                            : undefined;

                        return (
                          <tr key={item.id}>
                            <td className="teks-kecil" style={{ whiteSpace: "nowrap" }}>
                              <div>{item.timestepLabel}</div>
                              <div>{item.chain}</div>
                            </td>
                            <td>
                              <HashBadge value={item.walletHash} />
                              <div className="teks-kecil" style={{ marginTop: "2px" }}>
                                Volume: {item.volumeLabel}
                              </div>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  gap: "4px",
                                }}
                              >
                                <RiskChip band={item.band} status={chipStatus} />
                                <span className="teks-kecil" style={{ fontWeight: 600 }}>
                                  Skor {formatScore(item.score)}
                                </span>
                              </div>
                            </td>
                            <td className="teks-kecil" style={{ maxWidth: "34ch" }}>
                              {item.reason}
                            </td>
                            <td>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 8px",
                                  borderRadius: "var(--r-chip)",
                                  border: "1px solid var(--rute)",
                                  backgroundColor:
                                    item.status === "Belum ditinjau"
                                      ? "var(--kertas)"
                                      : "transparent",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  className="tombol-sekunder"
                                  onClick={() => handleVerdict(item, "false_positive")}
                                  style={{
                                    minHeight: "34px",
                                    padding: "4px 10px",
                                    fontSize: "12px",
                                  }}
                                >
                                  Tandai alarm palsu
                                </button>
                                <button
                                  type="button"
                                  className="tombol-sekunder"
                                  onClick={() => handleVerdict(item, "confirmed")}
                                  style={{
                                    minHeight: "34px",
                                    padding: "4px 10px",
                                    fontSize: "12px",
                                  }}
                                >
                                  Terkonfirmasi
                                </button>
                                <Link
                                  href="/jelajah"
                                  className="tombol-sekunder"
                                  style={{
                                    minHeight: "34px",
                                    padding: "4px 10px",
                                    fontSize: "12px",
                                  }}
                                >
                                  Buka di graf
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "drift" && (
            <div className="panel-kerja" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>
                Pemantau Pergeseran Distribusi Fitur (PSI dan Uji Statistik KS)
              </h2>
              <p className="teks-kecil" style={{ marginBottom: "18px" }}>
                Tahap 4 arsitektur TELUSUR menghitung <em>Population Stability Index</em> (PSI) dan uji dua-sampel <em>Kolmogorov-Smirnov</em> (KS) pada fitur struktur graf 2-lompatan di setiap langkah waktu dibandingkan distribusi acuan kalibrasi (<code className="font-mono">t1</code> sampai <code className="font-mono">t34</code>). Nilai PSI di atas <code className="font-mono">0,25</code> menandakan pergeseran rezim signifikan yang memerlukan pelatihan ulang model.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table className="tabel-data" aria-label="Tabel pemantauan drift PSI dan KS">
                  <thead>
                    <tr>
                      <th scope="col">Timestep</th>
                      <th scope="col">Volume tx</th>
                      <th scope="col">Indeks PSI</th>
                      <th scope="col">Statistik KS</th>
                      <th scope="col">Ambang ACI</th>
                      <th scope="col">Status distribusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {THRESHOLD_DATA.timesteps.map((row) => {
                      const isShift = row.timestep >= 43;
                      const psi =
                        row.timestep === 43
                          ? 0.42
                          : row.timestep === 44
                          ? 0.38
                          : isShift
                          ? 0.29
                          : 0.08 + ((row.timestep % 4) * 0.01);
                      const ks =
                        row.timestep === 43
                          ? 0.31
                          : row.timestep === 44
                          ? 0.28
                          : isShift
                          ? 0.22
                          : 0.06 + ((row.timestep % 3) * 0.01);

                      return (
                        <tr key={row.timestep}>
                          <td className="font-mono" style={{ fontWeight: 700 }}>
                            {row.label}
                          </td>
                          <td>{row.volume.toLocaleString("id-ID")}</td>
                          <td
                            className="font-mono"
                            style={{
                              fontWeight: 700,
                              color: psi >= 0.25 ? "var(--bahaya)" : "var(--tinta)",
                            }}
                          >
                            {psi.toFixed(2).replace(".", ",")}
                          </td>
                          <td className="font-mono">
                            {ks.toFixed(2).replace(".", ",")}
                          </td>
                          <td className="font-mono">
                            {row.threshold_aci.toFixed(2).replace(".", ",")}
                          </td>
                          <td className="teks-kecil">
                            {psi >= 0.25 ? (
                              <strong style={{ color: "var(--bahaya)" }}>
                                Pergeseran rezim terdeteksi (PSI &gt; 0,25): Rekomendasi kalibrasi ulang
                              </strong>
                            ) : (
                              "Distribusi fitur stabil (dalam batas toleransi)"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "apikey" && (
            <div className="panel-kerja" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>
                API key dan pemakaian kuota organisasi
              </h2>
              <p className="teks-kecil" style={{ marginBottom: "16px" }}>
                Pembatasan laju permintaan (rate limiting) diterapkan per kunci API dan per alamat IP untuk menjaga ketersediaan layanan penilaian.
              </p>
              <table className="tabel-data">
                <thead>
                  <tr>
                    <th scope="col">Nama kunci</th>
                    <th scope="col">Potongan kunci</th>
                    <th scope="col">Pemakaian bulan ini</th>
                    <th scope="col">Batas laju</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Kunci Produksi Integrasi Bursa</td>
                    <td>
                      <HashBadge value="tls_live_98a41f0029b17c83" />
                    </td>
                    <td>14.280 / 50.000 permintaan</td>
                    <td>120 permintaan / menit</td>
                    <td>Aktif</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Kunci Pengujian Sandbox</td>
                    <td>
                      <HashBadge value="tls_demo_9f42a8b1c0e74d12" />
                    </td>
                    <td>312 / 5.000 permintaan</td>
                    <td>30 permintaan / menit</td>
                    <td>Aktif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "webhook" && (
            <div className="panel-kerja" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>
                Pengaturan Webhook (HMAC-SHA256)
              </h2>
              <p className="teks-kecil" style={{ marginBottom: "16px" }}>
                Setiap kiriman webhook ditandatangani dengan rahasia HMAC pada header{" "}
                <code className="font-mono">X-Telusur-Signature</code> dan hanya berisi potongan hash dompet serta band risiko tanpa data pribadi.
              </p>
              <div style={{ marginBottom: "16px", maxWidth: "560px" }}>
                <label
                  htmlFor="webhook-endpoint"
                  style={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "var(--teks-kecil)",
                    marginBottom: "6px",
                  }}
                >
                  URL tujuan HTTPS
                </label>
                <input
                  id="webhook-endpoint"
                  type="url"
                  className="input-teks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="tombol-utama"
                  onClick={handleTestWebhook}
                >
                  Uji kirim payload HMAC sekarang
                </button>
                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={() =>
                    triggerToast("Pengaturan endpoint webhook disimpan.")
                  }
                >
                  Simpan URL webhook
                </button>
              </div>

              {webhookResult && (
                <div style={{ marginTop: "18px" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                  >
                    Hasil pembangkitan tanda tangan HMAC-SHA256:
                  </div>
                  <pre
                    className="font-mono"
                    style={{
                      margin: 0,
                      padding: "14px",
                      backgroundColor: "var(--kertas)",
                      border: "1px solid var(--garis)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      overflowX: "auto",
                    }}
                  >
                    {webhookResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeSection === "telegram" && (
            <div className="panel-kerja" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>
                Notifikasi Bot Telegram (non-sensitif)
              </h2>
              <p className="teks-kecil" style={{ marginBottom: "16px" }}>
                Mengirim ringkasan ketika ada kluster baru dengan band Sangat tinggi yang masuk ke antrean tinjauan. Pesan tidak pernah menyertakan data identitas pribadi.
              </p>
              <div style={{ marginBottom: "16px", maxWidth: "420px" }}>
                <label
                  htmlFor="tg-chat-id"
                  style={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "var(--teks-kecil)",
                    marginBottom: "6px",
                  }}
                >
                  ID ruang obrolan tim kepatuhan
                </label>
                <input
                  id="tg-chat-id"
                  type="text"
                  className="input-teks font-mono"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="tombol-utama"
                onClick={() =>
                  triggerToast("Uji kirim notifikasi ringkas ke ruang Telegram tercatat.")
                }
              >
                Simpan dan uji notifikasi Telegram
              </button>
            </div>
          )}

          {activeSection === "audit" && (
            <div className="panel-kerja" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "22px", marginBottom: "4px" }}>
                    Log audit (append-only)
                  </h2>
                  <p className="teks-kecil" style={{ marginBottom: 0 }}>
                    Setiap autentikasi sesi, perubahan status tinjauan, pembaruan ambang, dan inspeksi jaringan dicatat secara berurutan dan tidak dapat dihapus.
                  </p>
                </div>
                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={handleDownloadAuditCsv}
                >
                  Unduh log audit (CSV)
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="tabel-data" aria-label="Log audit append-only">
                  <thead>
                    <tr>
                      <th scope="col">ID Log</th>
                      <th scope="col">Waktu</th>
                      <th scope="col">Pelaku dan peran</th>
                      <th scope="col">Tindakan</th>
                      <th scope="col">Subjek</th>
                      <th scope="col">Rincian perubahan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="font-mono teks-kecil">{log.id}</td>
                        <td className="font-mono teks-kecil">{log.timestamp}</td>
                        <td className="teks-kecil">
                          <div style={{ fontWeight: 600 }}>{log.actorName}</div>
                          <div>
                            {log.actorEmail} ({log.actorRole})
                          </div>
                        </td>
                        <td className="font-mono teks-kecil" style={{ fontWeight: 700 }}>
                          {log.action}
                        </td>
                        <td>
                          <HashBadge value={log.subject} />
                        </td>
                        <td className="teks-kecil">{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
