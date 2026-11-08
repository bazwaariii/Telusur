"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  formatScore,
  GraphNode,
  GRAPHS_BY_CLUSTER,
  validateWalletOrNodeInput,
} from "@/lib/demo-data";
import { RiskChip } from "@/components/RiskChip";
import { ShapBars } from "@/components/ShapBars";
import { HashBadge } from "@/components/HashBadge";

export default function CekDompetPage() {
  const [networkMode, setNetworkMode] = useState<"tron" | "evm" | "node">("tron");
  const [inputValue, setInputValue] = useState("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [matchedNode, setMatchedNode] = useState<GraphNode | null>(
    GRAPHS_BY_CLUSTER["kluster-t43-23"].nodes.find(
      (n) => n.id === "tx_230488910"
    ) ?? null
  );
  const [clusterSummaryText, setClusterSummaryText] = useState<string>(
    "Siap memeriksa struktur aliran dana 2-lompatan untuk TRON (USDT TRC-20), Ethereum (EVM), dan Bitcoin."
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusNotice(null);

    const validation = validateWalletOrNodeInput(inputValue, networkMode);
    if (!validation.valid) {
      setErrorMessage(validation.error ?? null);
      return;
    }

    const q = inputValue.trim();

    // Cek apakah cocok dengan node benchmark Elliptic
    if (networkMode === "node") {
      for (const g of Object.values(GRAPHS_BY_CLUSTER)) {
        const found = g.nodes.find((n) => n.id.toLowerCase() === q.toLowerCase());
        if (found) {
          setMatchedNode(found);
          setClusterSummaryText(
            `Ditemukan pada himpunan benchmark Elliptic (timestep t${found.timestep}) dengan derajat masuk ${found.in_degree} dan derajat keluar ${found.out_degree}.`
          );
          setStatusNotice(
            "Pemeriksaan selesai. Subjek dievaluasi menggunakan fitur struktur graf 2-lompatan dan atribusi SHAP."
          );
          return;
        }
      }
    }

    // Inspeksi dinamis 2-lompatan untuk TRON, EVM, atau alamat Bitcoin baru
    setIsLoading(true);
    try {
      const chainParam =
        networkMode === "tron"
          ? "tron"
          : networkMode === "evm"
          ? "evm"
          : "bitcoin";
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "inspect_address",
          address: q,
          chain: chainParam,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const sink = data.graph?.nodes?.find(
          (n: GraphNode) => n.id === data.cluster?.focal_node_id
        );
        if (sink) {
          setMatchedNode(sink);
          setClusterSummaryText(data.cluster?.summary ?? "");
          setStatusNotice(
            `Subgraf 2-lompatan berhasil dipetakan (${data.graph.nodes.length} simpul, ${data.graph.edges.length} aliran transaksi) dan ditambahkan ke Penjelajah.`
          );
        }
      } else {
        setErrorMessage("Gagal memetakan alamat pada jaringan tersebut.");
      }
    } catch {
      setErrorMessage("Gagal menghubungi layanan pemindaian graf.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="wadah-konten"
      style={{
        paddingTop: "48px",
        paddingBottom: "88px",
        maxWidth: "860px",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.65rem)", marginBottom: "12px" }}>
          Inspeksi risiko dompet dan transaksi multi-chain.
        </h1>
        <p className="teks-naratif teks-sekunder" style={{ marginBottom: 0 }}>
          Periksa alamat dompet atau hash transaksi pada jaringan TRON (USDT TRC-20), Ethereum (EVM), maupun Bitcoin. Setiap pemeriksaan melewati tiga gerbang kepatuhan agar tidak menimbulkan salah tuduh terhadap pemilik dompet yang sah.
        </p>
      </div>

      {/* Tiga Gerbang Validasi Aktif */}
      <div className="panel-kerja" style={{ padding: "20px", marginBottom: "28px" }}>
        <div style={{ fontWeight: 700, marginBottom: "12px" }}>
          Status tiga gerbang kepatuhan permukaan publik dan korporasi:
        </div>
        <table className="tabel-data">
          <thead>
            <tr>
              <th scope="col">Gerbang</th>
              <th scope="col">Syarat wajib</th>
              <th scope="col">Status operasional</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 700 }}>1</td>
              <td>
                Ekstraksi fitur struktur graf 2-lompatan (derajat pemecahan, waktu singgah, konvergensi) pada Bitcoin, TRON, dan EVM
              </td>
              <td
                className="teks-kecil"
                style={{ fontWeight: 600, color: "var(--teal-tua)" }}
              >
                Aktif dan tervalidasi
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700 }}>2</td>
              <td>
                Kepatuhan pelindungan data pribadi (UU PDP) tanpa menyimpan identitas pemilik dompet
              </td>
              <td
                className="teks-kecil"
                style={{ fontWeight: 600, color: "var(--teal-tua)" }}
              >
                Aktif dan terverifikasi
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700 }}>3</td>
              <td>
                Keluaran berupa skor risiko, himpunan prediksi konformal, dan alasan SHAP (bukan vonis bersalah)
              </td>
              <td
                className="teks-kecil"
                style={{ fontWeight: 600, color: "var(--teal-tua)" }}
              >
                Aktif di seluruh permukaan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCheck} className="panel-kerja" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "var(--teks-kecil)",
              marginBottom: "8px",
            }}
          >
            Pilih jaringan blockchain yang ingin diperiksa:
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="tombol-sekunder"
              aria-pressed={networkMode === "tron"}
              onClick={() => {
                setNetworkMode("tron");
                setInputValue("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL");
                setErrorMessage(null);
                setStatusNotice(null);
              }}
              style={{ minHeight: "38px", padding: "6px 14px", fontSize: "13px" }}
            >
              Jaringan TRON (USDT TRC-20)
            </button>
            <button
              type="button"
              className="tombol-sekunder"
              aria-pressed={networkMode === "evm"}
              onClick={() => {
                setNetworkMode("evm");
                setInputValue("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
                setErrorMessage(null);
                setStatusNotice(null);
              }}
              style={{ minHeight: "38px", padding: "6px 14px", fontSize: "13px" }}
            >
              Jaringan Ethereum (EVM)
            </button>
            <button
              type="button"
              className="tombol-sekunder"
              aria-pressed={networkMode === "node"}
              onClick={() => {
                setNetworkMode("node");
                setInputValue("tx_230488910");
                setErrorMessage(null);
                setStatusNotice(null);
              }}
              style={{ minHeight: "38px", padding: "6px 14px", fontSize: "13px" }}
            >
              Jaringan Bitcoin (Alamat / ID Transaksi)
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label
            htmlFor="input-cek-alamat"
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: "var(--teks-kecil)",
              marginBottom: "6px",
            }}
          >
            {networkMode === "tron"
              ? "Alamat dompet TRON (diawali T dan terdiri atas 34 karakter Base58)"
              : networkMode === "evm"
              ? "Alamat dompet EVM (diawali 0x dan diikuti 40 karakter heksadesimal)"
              : "Alamat dompet Bitcoin (bc1q...) atau ID transaksi (tx_230488910)"}
          </label>
          <input
            id="input-cek-alamat"
            type="text"
            className="input-teks font-mono"
            placeholder={
              networkMode === "tron"
                ? "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL"
                : networkMode === "evm"
                ? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                : "tx_230488910"
            }
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
          />
        </div>

        {errorMessage && (
          <p
            role="alert"
            style={{
              color: "var(--bahaya)",
              fontSize: "var(--teks-kecil)",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            {errorMessage}
          </p>
        )}

        {statusNotice && (
          <div
            role="status"
            style={{
              padding: "12px",
              backgroundColor: "var(--kertas)",
              border: "1px solid var(--teal-tua)",
              borderRadius: "6px",
              fontSize: "var(--teks-kecil)",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            {statusNotice}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button type="submit" disabled={isLoading} className="tombol-utama">
            {isLoading ? "Memindai graf 2-lompatan..." : "Periksa format dan skor"}
          </button>
          <Link href="/jelajah" className="tombol-sekunder">
            Buka Penjelajah Graf Interaktif
          </Link>
        </div>
      </form>

      {matchedNode && (
        <div
          className="panel-kerja"
          style={{ padding: "24px", marginTop: "24px" }}
          aria-live="polite"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "4px" }}>
                {matchedNode.role}
              </div>
              <HashBadge value={matchedNode.id} startChars={10} endChars={8} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  marginBottom: "4px",
                }}
              >
                Skor {formatScore(matchedNode.score)}
              </div>
              <RiskChip band={matchedNode.band} status={matchedNode.status} />
            </div>
          </div>

          {clusterSummaryText && (
            <p className="teks-kecil" style={{ marginBottom: "14px", color: "var(--tinta)" }}>
              {clusterSummaryText}
            </p>
          )}

          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--kertas)",
              borderLeft: "3px solid var(--tinta)",
              fontSize: "var(--teks-kecil)",
              fontWeight: 600,
              marginBottom: "18px",
            }}
          >
            Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.
          </div>

          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
            Alasan kontribusi fitur (SHAP)
          </h2>
          <ShapBars features={matchedNode.features_top} />

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/jelajah" className="tombol-utama">
              Buka graf kluster ini di Penjelajah
            </Link>
            <Link href="/app" className="tombol-sekunder">
              Tinjau di Dasbor Kepatuhan
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
