"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GRAPHS_BY_CLUSTER, META_DATA } from "@/lib/demo-data";

const SAMPLE_SUBJECTS = [
  {
    id: "tx_230488910",
    chain: "bitcoin-elliptic" as const,
    label: "tx_230488910 : Titik pencairan Bitcoin t43 (skor 0,94)",
  },
  {
    id: "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL",
    chain: "tron" as const,
    label: "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL : Titik pencairan TRON USDT TRC-20",
  },
  {
    id: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    chain: "evm" as const,
    label: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F : Pengumpul Ethereum EVM",
  },
  {
    id: "tx_209331047",
    chain: "bitcoin-elliptic" as const,
    label: "tx_209331047 : Distribusi batch Bitcoin t41 (skor 0,56, alarm palsu)",
  },
  {
    id: "tx_230490011",
    chain: "bitcoin-elliptic" as const,
    label: "tx_230490011 : Transaksi normal Bitcoin (skor 0,12)",
  },
];

export default function DokumentasiApiPage() {
  const [selectedSubject, setSelectedSubject] = useState(SAMPLE_SUBJECTS[0].id);
  const [selectedChain, setSelectedChain] = useState<"bitcoin-elliptic" | "tron" | "evm">(
    "bitcoin-elliptic"
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sandboxKey, setSandboxKey] = useState("tls_live_9f42a8b1c0e74d12");
  const [responseOutput, setResponseOutput] = useState<string>(() =>
    buildFallbackScoreResponse("bitcoin-elliptic", "tx_230488910")
  );
  const [isCallingApi, setIsCallingApi] = useState(false);

  function buildFallbackScoreResponse(chain: string, subjectId: string): string {
    for (const g of Object.values(GRAPHS_BY_CLUSTER)) {
      const found = g.nodes.find((n) => n.id === subjectId);
      if (found) {
        return JSON.stringify(
          {
            subject: found.id,
            chain,
            score: found.score,
            band: found.band,
            prediction_set: found.pred_set,
            threshold: 0.34,
            model_version: META_DATA.model_version,
            as_of: `t${found.timestep} (${META_DATA.export_date})`,
            notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
            explanation: found.features_top.slice(0, 5).map((f) => ({
              feature: f.technical_name,
              description_id: f.name,
              contribution: f.contribution,
            })),
          },
          null,
          2
        );
      }
    }

    return JSON.stringify(
      {
        subject: subjectId,
        chain,
        score: 0.91,
        band: "Sangat tinggi",
        prediction_set: ["Ilegal"],
        threshold: 0.34,
        model_version: META_DATA.model_version,
        notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
      },
      null,
      2
    );
  }

  const handleRunScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCallingApi(true);
    try {
      const res = await fetch("/api/v1/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sandboxKey}`,
        },
        body: JSON.stringify({
          chain: selectedChain,
          subject: selectedSubject,
        }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        setResponseOutput(JSON.stringify(data, null, 2));
      } else {
        setResponseOutput(buildFallbackScoreResponse(selectedChain, selectedSubject));
      }
    } catch {
      setResponseOutput(buildFallbackScoreResponse(selectedChain, selectedSubject));
    } finally {
      setIsCallingApi(false);
    }
  };

  const copyBlock = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Abaikan bila izin clipboard tidak tersedia
    }
    setCopiedKey(id);
    setTimeout(() => setCopiedKey((prev) => (prev === id ? null : prev)), 1800);
  };

  const curlScoreSnippet = `curl -X POST http://localhost:3001/api/v1/score \\
  -H "Authorization: Bearer ${sandboxKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chain": "${selectedChain}",
    "subject": "${selectedSubject}"
  }'`;

  const feedbackSnippet = `POST /api/v1/feedback
Authorization: Bearer ${sandboxKey}
Content-Type: application/json

{
  "alert_id": "tx_209331047",
  "verdict": "false_positive",
  "reviewer_note": "Distribusi pembayaran rutin kolam tambang, tidak menyatu kembali ke titik pencairan."
}

// Respons 200 OK
{
  "alert_id": "tx_209331047",
  "status": "reviewed_false_positive",
  "aci_err_t_recorded": 1,
  "next_threshold_preview": 0.36,
  "threshold_cap": 0.85,
  "audit_log_id": "aud-1002",
  "model_version": "${META_DATA.model_version}"
}`;

  const webhookSnippet = `// Header HTTP Webhook
X-Telusur-Signature: sha256=7b52009b64fd0a2a49e6d8a939753077792b0554
X-Telusur-Timestamp: 1762534800

// Payload (tanpa data pribadi sensitif)
{
  "event": "alert.flagged_for_review",
  "alert_id": "alrt-01",
  "subject_hash": "tx_2304…8910",
  "band": "Sangat tinggi",
  "threshold_applied": 0.34,
  "model_version": "${META_DATA.model_version}",
  "notice": "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah."
}`;

  return (
    <div
      className="wadah-konten"
      style={{
        paddingTop: "48px",
        paddingBottom: "88px",
      }}
    >
      <div style={{ maxWidth: "68ch", marginBottom: "40px" }}>
        <h1 style={{ marginBottom: "14px" }}>
          Dokumentasi kontrak REST API untuk mitra bursa dan perusahaan.
        </h1>
        <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
          Dirancang untuk memeriksa transaksi masuk pada jaringan Bitcoin, TRON (USDT TRC-20), dan Ethereum (EVM) sebelum penarikan disetujui, serta mengirimkan umpan balik hasil tinjauan analis kembali ke pengatur ambang.
        </p>
      </div>

      {/* ================= BAGIAN 1: DAPATKAN API KEY & CONTOH INTERAKTIF POST /v1/score ================= */}
      <section
        className="layout-2-kolom"
        style={{
          paddingBottom: "56px",
          marginBottom: "56px",
          borderBottom: "1px solid var(--rute)",
        }}
      >
        {/* Kolom Kiri: Penjelasan */}
        <div>
          <h2 style={{ fontSize: "26px", marginBottom: "12px" }}>
            1. Dapatkan API key dan uji endpoint skor multi-chain
          </h2>
          <p className="teks-naratif" style={{ marginBottom: "16px" }}>
            Setiap permintaan ke layanan penilaian wajib menyertakan kunci API pada header{" "}
            <code className="font-mono">Authorization</code>. Anda dapat menyalin kunci aktif di bawah ini dan langsung menjalankan permintaan{" "}
            <code className="font-mono">POST /api/v1/score</code> untuk jaringan Bitcoin, TRON, maupun EVM.
          </p>

          <div
            className="panel-kerja"
            style={{
              padding: "16px",
              marginBottom: "20px",
              backgroundColor: "var(--putih)",
            }}
          >
            <div className="teks-kecil" style={{ fontWeight: 600, marginBottom: "6px" }}>
              Kunci API aktif sesi Anda
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <code
                className="font-mono"
                style={{
                  padding: "8px 12px",
                  backgroundColor: "var(--kertas)",
                  border: "1px solid var(--garis)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  flex: 1,
                }}
              >
                {sandboxKey}
              </code>
              <button
                type="button"
                className="tombol-sekunder"
                onClick={() => copyBlock("apikey", sandboxKey)}
                style={{ minHeight: "38px", padding: "6px 12px", fontSize: "13px" }}
              >
                {copiedKey === "apikey" ? "Disalin" : "Salin kunci"}
              </button>
              <button
                type="button"
                className="tombol-sekunder"
                onClick={() =>
                  setSandboxKey(
                    `tls_live_${Math.random().toString(16).slice(2, 10)}c0e74d`
                  )
                }
                style={{ minHeight: "38px", padding: "6px 12px", fontSize: "13px" }}
              >
                Putar ulang kunci
              </button>
            </div>
          </div>

          <form onSubmit={handleRunScore} className="panel-kerja" style={{ padding: "18px" }}>
            <div style={{ fontWeight: 700, marginBottom: "12px" }}>
              Uji langsung <code className="font-mono">POST /api/v1/score</code>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="api-chain"
                style={{
                  display: "block",
                  fontSize: "var(--teks-kecil)",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Jaringan (<code className="font-mono">chain</code>)
              </label>
              <select
                id="api-chain"
                className="input-teks"
                value={selectedChain}
                onChange={(e) => {
                  const nextChain = e.target.value as
                    | "bitcoin-elliptic"
                    | "tron"
                    | "evm";
                  setSelectedChain(nextChain);
                  if (nextChain === "tron") {
                    setSelectedSubject("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL");
                  } else if (nextChain === "evm") {
                    setSelectedSubject("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
                  } else {
                    setSelectedSubject("tx_230488910");
                  }
                }}
              >
                <option value="bitcoin-elliptic">
                  bitcoin-elliptic : Jaringan Bitcoin (Aktif)
                </option>
                <option value="tron">
                  tron : Jaringan TRON USDT TRC-20 (Aktif)
                </option>
                <option value="evm">
                  evm : Jaringan Ethereum dan L2 EVM (Aktif)
                </option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="api-subject-preset"
                style={{
                  display: "block",
                  fontSize: "var(--teks-kecil)",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Pilih contoh subjek atau ketik alamat sendiri (<code className="font-mono">subject</code>)
              </label>
              <select
                id="api-subject-preset"
                className="input-teks"
                value={
                  SAMPLE_SUBJECTS.some((s) => s.id === selectedSubject)
                    ? selectedSubject
                    : "custom"
                }
                onChange={(e) => {
                  if (e.target.value === "custom") return;
                  const found = SAMPLE_SUBJECTS.find((s) => s.id === e.target.value);
                  if (found) {
                    setSelectedSubject(found.id);
                    setSelectedChain(found.chain);
                  }
                }}
                style={{ marginBottom: "8px" }}
              >
                {SAMPLE_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
                <option value="custom">Input kustom di bawah</option>
              </select>

              <input
                type="text"
                aria-label="Subjek transaksi atau alamat dompet"
                className="input-teks font-mono"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="tombol-utama"
              disabled={isCallingApi}
              style={{ width: "100%" }}
            >
              {isCallingApi ? "Memanggil endpoint..." : "Jalankan POST /v1/score"}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Contoh Permintaan & Respons dengan Tombol Salin */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="panel-kerja" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "13px" }}>
                Permintaan (<code className="font-mono">POST /api/v1/score</code>)
              </span>
              <button
                type="button"
                className="tombol-sekunder"
                onClick={() => copyBlock("curl-score", curlScoreSnippet)}
                style={{ minHeight: "30px", padding: "3px 10px", fontSize: "12px" }}
              >
                {copiedKey === "curl-score" ? "Kode disalin" : "Salin"}
              </button>
            </div>
            <pre
              className="font-mono"
              style={{
                margin: 0,
                padding: "14px",
                backgroundColor: "var(--kertas)",
                border: "1px solid var(--garis)",
                borderRadius: "6px",
                fontSize: "12.5px",
                overflowX: "auto",
                lineHeight: 1.5,
              }}
            >
              {curlScoreSnippet}
            </pre>
          </div>

          <div className="panel-kerja" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "13px" }}>
                Respons JSON (memuat <code className="font-mono">model_version</code> dan alasan SHAP)
              </span>
              <button
                type="button"
                className="tombol-sekunder"
                onClick={() => copyBlock("resp-score", responseOutput)}
                style={{ minHeight: "30px", padding: "3px 10px", fontSize: "12px" }}
              >
                {copiedKey === "resp-score" ? "Respons disalin" : "Salin"}
              </button>
            </div>
            <pre
              className="font-mono"
              style={{
                margin: 0,
                padding: "14px",
                backgroundColor: "var(--kertas)",
                border: "1px solid var(--garis)",
                borderRadius: "6px",
                fontSize: "12.5px",
                overflowX: "auto",
                lineHeight: 1.5,
              }}
            >
              {responseOutput}
            </pre>
          </div>
        </div>
      </section>

      {/* ================= BAGIAN 2: POST /v1/feedback & KALIBRASI ACI ================= */}
      <section
        className="layout-2-kolom"
        style={{
          paddingBottom: "56px",
          marginBottom: "56px",
          borderBottom: "1px solid var(--rute)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "26px", marginBottom: "12px" }}>
            2. Umpan balik analis (<code className="font-mono">POST /api/v1/feedback</code>)
          </h2>
          <p className="teks-naratif" style={{ marginBottom: "16px" }}>
            Sinyal kesalahan <code className="font-mono">err_t</code> untuk pembaruan ambang menyesuaikan diri (ACI) hanya dihitung dari alert yang telah ditinjau oleh analis manusia. Keputusan dikirim melalui endpoint ini dan dicatat secara permanen ke dalam log audit <em>append-only</em>.
          </p>
          <ul className="teks-kecil" style={{ color: "var(--tinta)", paddingLeft: "18px" }}>
            <li style={{ marginBottom: "6px" }}>
              Nilai <code className="font-mono">verdict</code> hanya menerima{" "}
              <code className="font-mono">&quot;false_positive&quot;</code> atau{" "}
              <code className="font-mono">&quot;confirmed&quot;</code>.
            </li>
            <li style={{ marginBottom: "6px" }}>
              Ambang kuantil dibatasi oleh batas atas (<code className="font-mono">threshold_cap = 0,85</code>) untuk mencegah manipulasi pelonggaran ambang secara paksa.
            </li>
            <li>
              Tinjau cara kerjanya secara visual pada{" "}
              <Link href="/app">Dasbor Analis</Link>.
            </li>
          </ul>
        </div>

        <div className="panel-kerja" style={{ padding: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "13px" }}>
              Contoh <code className="font-mono">POST /api/v1/feedback</code>
            </span>
            <button
              type="button"
              className="tombol-sekunder"
              onClick={() => copyBlock("feedback", feedbackSnippet)}
              style={{ minHeight: "30px", padding: "3px 10px", fontSize: "12px" }}
            >
              {copiedKey === "feedback" ? "Disalin" : "Salin"}
            </button>
          </div>
          <pre
            className="font-mono"
            style={{
              margin: 0,
              padding: "14px",
              backgroundColor: "var(--kertas)",
              border: "1px solid var(--garis)",
              borderRadius: "6px",
              fontSize: "12.5px",
              overflowX: "auto",
              lineHeight: 1.5,
            }}
          >
            {feedbackSnippet}
          </pre>
        </div>
      </section>

      {/* ================= BAGIAN 3: GET /v1/alerts, GET /v1/usage, DAN WEBHOOK HMAC ================= */}
      <section className="layout-2-kolom">
        <div>
          <h2 style={{ fontSize: "26px", marginBottom: "12px" }}>
            3. Antrean alert, kuota, dan webhook bertanda tangan HMAC
          </h2>
          <p className="teks-naratif" style={{ marginBottom: "16px" }}>
            Mitra bursa dapat menarik antrean alert yang belum ditinjau melalui{" "}
            <code className="font-mono">GET /api/v1/alerts?status=unreviewed</code>, memantau pemakaian kuota lewat <code className="font-mono">GET /api/v1/usage</code>, atau menerima pemberitahuan waktu nyata melalui webhook.
          </p>
          <p className="teks-kecil" style={{ color: "var(--tinta)" }}>
            Demi keamanan dan kepatuhan pelindungan data, payload webhook ditandatangani dengan{" "}
            <code className="font-mono">HMAC-SHA256</code> dan hanya memuat ID/hash transaksi yang dipotong beserta band risiko, tanpa menyertakan identitas pribadi nasabah.
          </p>
        </div>

        <div className="panel-kerja" style={{ padding: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "13px" }}>
              Payload Webhook (<code className="font-mono">X-Telusur-Signature</code>)
            </span>
            <button
              type="button"
              className="tombol-sekunder"
              onClick={() => copyBlock("webhook", webhookSnippet)}
              style={{ minHeight: "30px", padding: "3px 10px", fontSize: "12px" }}
            >
              {copiedKey === "webhook" ? "Disalin" : "Salin"}
            </button>
          </div>
          <pre
            className="font-mono"
            style={{
              margin: 0,
              padding: "14px",
              backgroundColor: "var(--kertas)",
              border: "1px solid var(--garis)",
              borderRadius: "6px",
              fontSize: "12.5px",
              overflowX: "auto",
              lineHeight: 1.5,
            }}
          >
            {webhookSnippet}
          </pre>
        </div>
      </section>
    </div>
  );
}
