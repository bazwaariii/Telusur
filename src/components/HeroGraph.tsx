"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HashBadge } from "@/components/HashBadge";
import { RiskChip } from "@/components/RiskChip";
import { ShapBars } from "@/components/ShapBars";
import { formatScore, NodeStatus, RiskBand, ShapFeature } from "@/lib/demo-data";

interface HeroNode {
  id: string;
  code: string;
  walletId: string;
  roleLabel: string;
  status: NodeStatus;
  band: RiskBand;
  score: number;
  predSet: string[];
  stage: 0 | 1 | 2 | 3;
  x: number;
  y: number;
  volumeBtc: number;
  reasons: ShapFeature[];
}

interface HeroEdge {
  id: string;
  source: string;
  target: string;
  type: "inti" | "penyamaran";
  stage: 1 | 2 | 3;
  amountBtc: string;
}

const INITIAL_HERO_NODES: HeroNode[] = [
  {
    id: "S",
    code: "S",
    walletId: "tx_901100248",
    roleLabel: "Sumber",
    status: "sumber",
    band: "Tinggi",
    score: 0.79,
    predSet: ["Ilegal"],
    stage: 0,
    x: 95,
    y: 235,
    volumeBtc: 16.0,
    reasons: [
      {
        name: "Dana langsung dipecah ke empat dompet perantara dalam satu blok",
        technical_name: "local_out_degree_burst_ratio",
        contribution: 0.25,
      },
      {
        name: "Nominal pecahan seragam pada setiap cabang keluar",
        technical_name: "split_output_variance_inv",
        contribution: 0.17,
      },
      {
        name: "Tidak menyisakan saldo kembalian pada transaksi asal",
        technical_name: "self_change_retention_ratio",
        contribution: 0.11,
      },
      {
        name: "Jalur hilir menyatu kembali pada lompatan ketiga",
        technical_name: "downstream_3hop_reconvergence",
        contribution: 0.09,
      },
      {
        name: "Biaya transaksi sedikit di atas median blok",
        technical_name: "block_fee_median_deviation",
        contribution: -0.04,
      },
    ],
  },
  {
    id: "M1",
    code: "M1",
    walletId: "tx_901104101",
    roleLabel: "Perantara M1",
    status: "perantara",
    band: "Sedang",
    score: 0.58,
    predSet: ["Ilegal", "Legal (ambang batas)"],
    stage: 1,
    x: 325,
    y: 90,
    volumeBtc: 4.0,
    reasons: [
      {
        name: "Dana hanya singgah 1 blok sebelum diteruskan ke P1",
        technical_name: "relay_passthrough_velocity",
        contribution: 0.15,
      },
      {
        name: "Menerima aliran langsung dari node sumber berisiko tinggi",
        technical_name: "upstream_source_risk_prop",
        contribution: 0.13,
      },
      {
        name: "Derajat transaksi lokal masih menyerupai dompet transit",
        technical_name: "total_degree_log_norm",
        contribution: -0.06,
      },
    ],
  },
  {
    id: "M2",
    code: "M2",
    walletId: "tx_901104102",
    roleLabel: "Perantara M2",
    status: "perantara",
    band: "Sedang",
    score: 0.41,
    predSet: ["Ilegal", "Legal (ambang batas)"],
    stage: 1,
    x: 325,
    y: 180,
    volumeBtc: 4.0,
    reasons: [
      {
        name: "Menerima pecahan nominal seragam dari node S",
        technical_name: "split_input_uniformity_score",
        contribution: 0.14,
      },
      {
        name: "Diteruskan melalui jalur penyamaran berlapis ke P2 dan P3",
        technical_name: "peel_layer_branching_factor",
        contribution: 0.11,
      },
      {
        name: "Frekuensi historis dompet rendah",
        technical_name: "historical_tx_rate_norm",
        contribution: -0.08,
      },
    ],
  },
  {
    id: "M3",
    code: "M3",
    walletId: "tx_901104103",
    roleLabel: "Perantara M3",
    status: "perantara",
    band: "Sedang",
    score: 0.52,
    predSet: ["Ilegal", "Legal (ambang batas)"],
    stage: 1,
    x: 325,
    y: 270,
    volumeBtc: 4.0,
    reasons: [
      {
        name: "Dana diteruskan serentak bersama cabang perantara lain",
        technical_name: "synchronized_hop1_timestamp",
        contribution: 0.16,
      },
      {
        name: "Terhubung ke rantai pengelupasan P3",
        technical_name: "downstream_peeling_link",
        contribution: 0.10,
      },
      {
        name: "Jumlah tetangga langsung terbatas (2 koneksi)",
        technical_name: "local_degree_count",
        contribution: -0.05,
      },
    ],
  },
  {
    id: "M4",
    code: "M4",
    walletId: "tx_901104104",
    roleLabel: "Perantara M4",
    status: "perantara",
    band: "Sedang",
    score: 0.49,
    predSet: ["Ilegal", "Legal (ambang batas)"],
    stage: 1,
    x: 325,
    y: 360,
    volumeBtc: 4.0,
    reasons: [
      {
        name: "Sebagian besar dana (3,6 BTC) masuk ke rantai pengelupasan P4",
        technical_name: "major_output_peeling_share",
        contribution: 0.14,
      },
      {
        name: "Memiliki satu keluaran ritel kecil ke node normal P5",
        technical_name: "minor_retail_branch_ratio",
        contribution: -0.07,
      },
      {
        name: "Waktu singgah dana di bawah 2 blok",
        technical_name: "block_dwell_time_min_ratio",
        contribution: 0.11,
      },
    ],
  },
  {
    id: "P1",
    code: "P1",
    walletId: "tx_901108301",
    roleLabel: "Rantai pengelupasan P1",
    status: "perantara",
    band: "Tinggi",
    score: 0.71,
    predSet: ["Ilegal"],
    stage: 2,
    x: 575,
    y: 80,
    volumeBtc: 3.9,
    reasons: [
      {
        name: "Bagian dari rantai pengelupasan yang langsung menyatu ke titik pencairan",
        technical_name: "sink_convergence_1hop_flag",
        contribution: 0.21,
      },
      {
        name: "Potongan biaya pengelupasan konsisten dengan P2 sampai P4",
        technical_name: "peel_fraction_consistency",
        contribution: 0.13,
      },
      {
        name: "Waktu eksekusi berimpitan dengan tiga jalur paralel lain",
        technical_name: "parallel_chain_time_sync",
        contribution: 0.09,
      },
    ],
  },
  {
    id: "P2",
    code: "P2",
    walletId: "tx_901108302",
    roleLabel: "Rantai pengelupasan P2",
    status: "perantara",
    band: "Tinggi",
    score: 0.74,
    predSet: ["Ilegal"],
    stage: 2,
    x: 575,
    y: 170,
    volumeBtc: 3.85,
    reasons: [
      {
        name: "Menggabungkan pecahan dari M1 dan M2 sebelum menuju titik pencairan",
        technical_name: "cross_branch_mixing_ratio",
        contribution: 0.22,
      },
      {
        name: "Waktu singgah dana kurang dari 1 blok",
        technical_name: "relay_passthrough_velocity",
        contribution: 0.15,
      },
      {
        name: "Seluruh dana keluar bermuara ke node AGG",
        technical_name: "single_sink_exclusivity",
        contribution: 0.12,
      },
    ],
  },
  {
    id: "P3",
    code: "P3",
    walletId: "tx_901108303",
    roleLabel: "Rantai pengelupasan P3",
    status: "perantara",
    band: "Tinggi",
    score: 0.72,
    predSet: ["Ilegal"],
    stage: 2,
    x: 575,
    y: 260,
    volumeBtc: 3.9,
    reasons: [
      {
        name: "Menerima aliran penyamaran dari M2 dan M3 lalu meneruskan ke AGG",
        technical_name: "layered_peel_to_sink_score",
        contribution: 0.20,
      },
      {
        name: "Tetangga satu lompatan memiliki rata-rata skor risiko tinggi",
        technical_name: "neighbor_1hop_mean_risk_score",
        contribution: 0.14,
      },
      {
        name: "Tidak ada penyimpanan saldo di dompet perantara",
        technical_name: "zero_balance_retention_flag",
        contribution: 0.09,
      },
    ],
  },
  {
    id: "P4",
    code: "P4",
    walletId: "tx_901108304",
    roleLabel: "Rantai pengelupasan P4",
    status: "perantara",
    band: "Tinggi",
    score: 0.69,
    predSet: ["Ilegal"],
    stage: 2,
    x: 575,
    y: 350,
    volumeBtc: 3.55,
    reasons: [
      {
        name: "Jalur pengelupasan keempat yang bermuara ke titik pencairan yang sama",
        technical_name: "fan_in_contributor_index",
        contribution: 0.19,
      },
      {
        name: "Selang waktu transaksi sinkron dengan P1 sampai P3",
        technical_name: "temporal_sync_with_sink_score",
        contribution: 0.13,
      },
      {
        name: "Volume sedikit lebih kecil karena pemisahan ke P5",
        technical_name: "tx_volume_relative_share",
        contribution: -0.04,
      },
    ],
  },
  {
    id: "P5",
    code: "P5",
    walletId: "tx_901109995",
    roleLabel: "Transaksi normal P5",
    status: "normal",
    band: "Rendah",
    score: 0.12,
    predSet: ["Legal"],
    stage: 2,
    x: 575,
    y: 445,
    volumeBtc: 0.4,
    reasons: [
      {
        name: "Tidak menyatu kembali ke titik pencairan AGG",
        technical_name: "sink_reconvergence_indicator",
        contribution: -0.22,
      },
      {
        name: "Dana bertahan di dompet tujuan lebih dari 48 blok",
        technical_name: "holding_period_blocks_log",
        contribution: -0.15,
      },
      {
        name: "Pola transaksi sesuai pembayaran ritel satu kali",
        technical_name: "standard_2out_payment_pattern",
        contribution: -0.09,
      },
    ],
  },
  {
    id: "AGG",
    code: "AGG",
    walletId: "tx_901199001",
    roleLabel: "Titik pencairan",
    status: "titik_pencairan",
    band: "Sangat tinggi",
    score: 0.94,
    predSet: ["Ilegal"],
    stage: 3,
    x: 835,
    y: 215,
    volumeBtc: 15.1,
    reasons: [
      {
        name: "Empat jalur rantai pengelupasan bermuara ke satu dompet ini dalam waktu berdekatan",
        technical_name: "fan_in_peeling_convergence_ratio_t0",
        contribution: 0.29,
      },
      {
        name: "Dana langsung diteruskan dari sumber melalui 2 lompatan cepat",
        technical_name: "upstream_2hop_velocity_score",
        contribution: 0.21,
      },
      {
        name: "94,4% total dana yang dipecah di S terkumpul kembali di titik ini",
        technical_name: "source_to_sink_recovery_fraction",
        contribution: 0.18,
      },
      {
        name: "Tetangga satu lompatan (P1 sampai P4) semuanya berstatus risiko tinggi",
        technical_name: "neighbor_1hop_risk_q90_mean",
        contribution: 0.14,
      },
      {
        name: "Rasio biaya transaksi di atas kebiasaan kluster normal",
        technical_name: "fee_to_volume_zscore_local",
        contribution: -0.05,
      },
      {
        name: "Pola alamat penerima konsisten dengan deposit bursa terpusat",
        technical_name: "exchange_deposit_structural_signature",
        contribution: 0.08,
      },
    ],
  },
];

const HERO_EDGES: HeroEdge[] = [
  { id: "e-s-m1", source: "S", target: "M1", type: "inti", stage: 1, amountBtc: "4,00 BTC" },
  { id: "e-s-m2", source: "S", target: "M2", type: "inti", stage: 1, amountBtc: "4,00 BTC" },
  { id: "e-s-m3", source: "S", target: "M3", type: "inti", stage: 1, amountBtc: "4,00 BTC" },
  { id: "e-s-m4", source: "S", target: "M4", type: "inti", stage: 1, amountBtc: "4,00 BTC" },
  { id: "e-m1-p1", source: "M1", target: "P1", type: "penyamaran", stage: 2, amountBtc: "3,90 BTC" },
  { id: "e-m1-p2", source: "M1", target: "P2", type: "penyamaran", stage: 2, amountBtc: "0,10 BTC" },
  { id: "e-m2-p2", source: "M2", target: "P2", type: "penyamaran", stage: 2, amountBtc: "3,75 BTC" },
  { id: "e-m2-p3", source: "M2", target: "P3", type: "penyamaran", stage: 2, amountBtc: "0,25 BTC" },
  { id: "e-m3-p3", source: "M3", target: "P3", type: "penyamaran", stage: 2, amountBtc: "3,65 BTC" },
  { id: "e-m4-p4", source: "M4", target: "P4", type: "penyamaran", stage: 2, amountBtc: "3,55 BTC" },
  { id: "e-m4-p5", source: "M4", target: "P5", type: "penyamaran", stage: 2, amountBtc: "0,40 BTC" },
  { id: "e-p1-agg", source: "P1", target: "AGG", type: "inti", stage: 3, amountBtc: "3,88 BTC" },
  { id: "e-p2-agg", source: "P2", target: "AGG", type: "inti", stage: 3, amountBtc: "3,82 BTC" },
  { id: "e-p3-agg", source: "P3", target: "AGG", type: "inti", stage: 3, amountBtc: "3,87 BTC" },
  { id: "e-p4-agg", source: "P4", target: "AGG", type: "inti", stage: 3, amountBtc: "3,53 BTC" },
];

export function HeroGraph() {
  const [nodes, setNodes] = useState<HeroNode[]>(INITIAL_HERO_NODES);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [isTracing, setIsTracing] = useState(false);
  const [viewMode, setViewMode] = useState<"graf" | "daftar">("graf");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("AGG");
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) {
        setPhase(3);
      }
    }
  }, []);

  const startTrace = () => {
    if (isTracing) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setPhase(3);
      setSelectedNodeId("AGG");
      return;
    }
    setIsTracing(true);
    setPhase(1);
    setTimeout(() => {
      setPhase(2);
    }, 800);
    setTimeout(() => {
      setPhase(3);
      setSelectedNodeId("AGG");
      setIsTracing(false);
    }, 2400);
  };

  const replayTrace = () => {
    setPhase(0);
    setTimeout(() => {
      startTrace();
    }, 150);
  };

  const resetPositions = () => {
    setNodes(INITIAL_HERO_NODES);
  };

  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    if (phase < 3) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraggingNodeId(nodeId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 500 / rect.height;
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;
    const clampedX = Math.max(55, Math.min(945, rawX));
    const clampedY = Math.max(50, Math.min(460, rawY));
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: clampedX, y: clampedY } : n))
    );
  };

  const handlePointerUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  const handleNodeKeyDown = (node: HeroNode, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (node.id === "S" && phase === 0) {
        startTrace();
      } else {
        setSelectedNodeId(node.id);
      }
      return;
    }

    if (phase < 3) return;
    const order = ["S", "M1", "M2", "M3", "M4", "P1", "P2", "P3", "P4", "P5", "AGG"];
    const idx = order.indexOf(node.id);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextId = order[(idx + 1) % order.length];
      setSelectedNodeId(nextId);
      document.getElementById(`hero-node-${nextId}`)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevId = order[(idx - 1 + order.length) % order.length];
      setSelectedNodeId(prevId);
      document.getElementById(`hero-node-${prevId}`)?.focus();
    }
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const hoveredNode = hoveredNodeId ? nodeMap.get(hoveredNodeId) ?? null : null;
  const selectedNode = nodeMap.get(selectedNodeId) ?? nodes[nodes.length - 1];

  return (
    <section
      aria-label="Peraga graf penelusuran aliran dana"
      className="panel-kerja"
      style={{
        backgroundColor: "var(--putih)",
        overflow: "hidden",
      }}
    >
      {/* Bilah kendali atas kanvas */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "14px 20px",
          borderBottom: "1px solid var(--rute)",
          backgroundColor: "var(--putih)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: "var(--tinta)",
              padding: "3px 10px",
              backgroundColor: "var(--kertas)",
              border: "1px solid var(--rute)",
              borderRadius: "var(--r-kontrol)",
            }}
          >
            Data ilustrasi, bukan kasus nyata.
          </span>
          <span className="teks-kecil">
            {phase === 0
              ? "Tekan Lacak aliran dana untuk menelusuri 16,0 BTC dari dompet sumber S."
              : phase < 3
              ? "Menelusuri aliran melalui perantara dan rantai pengelupasan..."
              : "Graf siap dioperasikan: geser simpul atau klik simpul untuk memeriksa kontribusi fitur SHAP."}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {phase === 0 ? (
            <button
              type="button"
              className="tombol-utama"
              onClick={startTrace}
              style={{ minHeight: "38px", padding: "6px 16px", fontSize: "13px" }}
            >
              Lacak aliran dana
            </button>
          ) : (
            <>
              <button
                type="button"
                className="tombol-sekunder"
                onClick={replayTrace}
                disabled={isTracing}
                style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
              >
                Ulangi penelusuran
              </button>
              <button
                type="button"
                className="tombol-sekunder"
                onClick={resetPositions}
                style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
              >
                Atur ulang posisi
              </button>
            </>
          )}

          <div
            role="group"
            aria-label="Mode tampilan"
            style={{ display: "inline-flex", gap: "4px" }}
          >
            <button
              type="button"
              className="tombol-sekunder"
              aria-pressed={viewMode === "graf"}
              onClick={() => setViewMode("graf")}
              style={{ minHeight: "36px", padding: "6px 14px", fontSize: "13px" }}
            >
              Graf
            </button>
            <button
              type="button"
              className="tombol-sekunder"
              aria-pressed={viewMode === "daftar"}
              onClick={() => {
                setPhase(3);
                setViewMode("daftar");
              }}
              style={{ minHeight: "36px", padding: "6px 14px", fontSize: "13px" }}
            >
              Daftar
            </button>
          </div>
        </div>
      </div>

      {viewMode === "graf" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: phase === 3 ? "minmax(0, 1fr) 360px" : "minmax(0, 1fr)",
          }}
          className="hero-grid-internal"
        >
          <style>{`
            @media (max-width: 1020px) {
              .hero-grid-internal {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>

          {/* Kanvas SVG */}
          <div
            style={{
              position: "relative",
              backgroundColor: "var(--kertas)",
              borderRight: phase === 3 ? "1px solid var(--rute)" : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 1000 500"
              role="img"
              aria-label="Graf penelusuran dana dari Sumber S melalui perantara M1 sampai M4 dan rantai P1 sampai P4 yang bermuara ke Titik pencairan AGG dengan skor 0,94, serta satu cabang normal P5 dengan skor 0,12."
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                width: "100%",
                height: "auto",
                minHeight: "390px",
                display: "block",
                userSelect: "none",
                touchAction: "none",
              }}
            >
              <defs>
                <marker
                  id="arrow-inti"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--tinta)" />
                </marker>
                <marker
                  id="arrow-penyamaran"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--rute)" />
                </marker>
              </defs>

              {/* Garis pandu kolom vertikal tipis */}
              <g aria-hidden="true">
                <line x1="95" y1="42" x2="95" y2="465" stroke="var(--garis)" strokeDasharray="3 3" />
                {phase >= 1 && (
                  <line x1="325" y1="42" x2="325" y2="465" stroke="var(--garis)" strokeDasharray="3 3" />
                )}
                {phase >= 2 && (
                  <line x1="575" y1="42" x2="575" y2="465" stroke="var(--garis)" strokeDasharray="3 3" />
                )}
                {phase >= 3 && (
                  <line x1="835" y1="42" x2="835" y2="465" stroke="var(--garis)" strokeDasharray="3 3" />
                )}
              </g>

              {/* Label kolom tahap di bagian atas */}
              <g aria-hidden="true" style={{ fontSize: "12px", fill: "var(--tinta-redup)" }}>
                <text x="55" y="28" fontWeight="600">
                  1. Sumber dana
                </text>
                {phase >= 1 && (
                  <text x="255" y="28" fontWeight="600">
                    2. Perantara (M1 sampai M4)
                  </text>
                )}
                {phase >= 2 && (
                  <text x="495" y="28" fontWeight="600">
                    3. Rantai pengelupasan (P1 sampai P5)
                  </text>
                )}
                {phase >= 3 && (
                  <text x="765" y="28" fontWeight="600">
                    4. Titik pencairan
                  </text>
                )}
              </g>

              {/* Garis aliran (edges) */}
              {HERO_EDGES.map((edge) => {
                if (phase < edge.stage) return null;
                const src = nodeMap.get(edge.source);
                const tgt = nodeMap.get(edge.target);
                if (!src || !tgt) return null;

                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const dist = Math.hypot(dx, dy) || 1;
                const padStart = 20;
                const padEnd = tgt.id === "AGG" ? 26 : 22;
                const x1 = src.x + (dx / dist) * padStart;
                const y1 = src.y + (dy / dist) * padStart;
                const x2 = tgt.x - (dx / dist) * padEnd;
                const y2 = tgt.y - (dy / dist) * padEnd;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const isInti = edge.type === "inti";
                const isHovered = hoveredEdgeId === edge.id;

                return (
                  <g
                    key={edge.id}
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="transparent"
                      strokeWidth="14"
                    />
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isInti ? "var(--tinta)" : "var(--rute)"}
                      strokeWidth={isHovered ? 3.2 : isInti ? 2.3 : 1.75}
                      strokeDasharray={isInti ? undefined : "6 4"}
                      markerEnd={
                        isInti ? "url(#arrow-inti)" : "url(#arrow-penyamaran)"
                      }
                    />
                    {isHovered && (
                      <g transform={`translate(${midX}, ${midY - 12})`}>
                        <rect
                          x="-44"
                          y="-14"
                          width="88"
                          height="22"
                          rx="4"
                          fill="var(--putih)"
                          stroke="var(--rute)"
                        />
                        <text
                          x="0"
                          y="1"
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="600"
                          fill="var(--tinta)"
                        >
                          {edge.amountBtc}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Tombol interaktif di dekat simpul S langsung di dalam ruang koordinat SVG saat phase === 0 */}
              {phase === 0 && (
                <g
                  onClick={startTrace}
                  style={{ cursor: "pointer" }}
                  transform="translate(145, 200)"
                >
                  <line
                    x1="-28"
                    y1="35"
                    x2="0"
                    y2="35"
                    stroke="var(--tinta)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <rect
                    x="0"
                    y="0"
                    width="290"
                    height="72"
                    rx="8"
                    fill="var(--putih)"
                    stroke="var(--tinta)"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="156"
                    height="30"
                    rx="5"
                    fill="var(--tinta)"
                  />
                  <text
                    x="92"
                    y="33"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#FFFFFF"
                  >
                    Lacak aliran dana
                  </text>
                  <text x="14" y="59" fontSize="11.5" fill="var(--tinta-redup)">
                    Klik untuk menelusuri 16,0 BTC yang dipecah
                  </text>
                </g>
              )}

              {/* Simpul (nodes) */}
              {nodes.map((node) => {
                if (phase < node.stage) return null;
                const isSelected = selectedNodeId === node.id && phase === 3;
                const isHovered = hoveredNodeId === node.id;
                const accessibleLabel = `Node ${node.code} (${node.roleLabel}), skor ${formatScore(
                  node.score
                )}, risiko ${node.band.toLowerCase()}`;

                return (
                  <g
                    key={node.id}
                    id={`hero-node-${node.id}`}
                    tabIndex={0}
                    role="button"
                    aria-label={accessibleLabel}
                    transform={`translate(${node.x}, ${node.y})`}
                    onPointerDown={(e) => handlePointerDown(node.id, e)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onFocus={() => setHoveredNodeId(node.id)}
                    onBlur={() => setHoveredNodeId(null)}
                    onClick={() => {
                      if (phase === 0 && node.id === "S") {
                        startTrace();
                      } else {
                        setSelectedNodeId(node.id);
                      }
                    }}
                    onKeyDown={(e) => handleNodeKeyDown(node, e)}
                    style={{
                      cursor: phase === 3 ? "grab" : "pointer",
                    }}
                  >
                    {(isSelected || isHovered) && (
                      <circle
                        cx="0"
                        cy="0"
                        r={node.status === "titik_pencairan" ? 26 : 22}
                        fill="none"
                        stroke="var(--sinyal)"
                        strokeWidth="2.5"
                      />
                    )}

                    {node.status === "titik_pencairan" ? (
                      <polygon
                        points="0,-20 20,0 0,20 -20,0"
                        fill="var(--sinyal)"
                        stroke="var(--tinta)"
                        strokeWidth="1.5"
                      />
                    ) : node.status === "normal" ? (
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="var(--putih)"
                        stroke="var(--rute)"
                        strokeWidth="2"
                      />
                    ) : node.status === "sumber" ? (
                      <circle cx="0" cy="0" r="18" fill="var(--tinta)" />
                    ) : (
                      <circle cx="0" cy="0" r="16" fill="var(--teal)" />
                    )}

                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill={
                        node.status === "titik_pencairan" || node.status === "normal"
                          ? "var(--tinta)"
                          : "#FFFFFF"
                      }
                    >
                      {node.code}
                    </text>

                    {node.id === "S" && (
                      <text
                        x="0"
                        y="34"
                        textAnchor="middle"
                        fontSize="11.5"
                        fontWeight="600"
                        fill="var(--tinta)"
                      >
                        Sumber (16,0 BTC)
                      </text>
                    )}

                    {node.id === "P5" && (
                      <g transform="translate(24, -15)">
                        <rect
                          x="0"
                          y="0"
                          width="235"
                          height="32"
                          rx="4"
                          fill="var(--putih)"
                          stroke="var(--rute)"
                        />
                        <text x="10" y="14" fontSize="11" fontWeight="600" fill="var(--tinta)">
                          Transaksi normal P5, skor 0,12
                        </text>
                        <text x="10" y="26" fontSize="10" fill="var(--tinta-redup)">
                          Tidak menyatu ke AGG, tidak ikut dicurigai
                        </text>
                      </g>
                    )}

                    {node.id === "AGG" && phase === 3 && (
                      <g transform="translate(-88, 28)">
                        <rect
                          x="0"
                          y="0"
                          width="176"
                          height="40"
                          rx="6"
                          fill="var(--putih)"
                          stroke="var(--tinta)"
                          strokeWidth="1.5"
                        />
                        <text x="10" y="17" fontSize="12" fontWeight="700" fill="var(--tinta)">
                          Titik pencairan, skor 0,94
                        </text>
                        <text
                          x="10"
                          y="32"
                          fontSize="10.5"
                          fill="var(--sinyal-teks)"
                          fontWeight="600"
                        >
                          94,4% dana berkumpul kembali
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tooltip ringkas saat simpul disorot */}
            {hoveredNode && phase === 3 && (
              <div
                role="status"
                aria-live="polite"
                className="elemen-apung"
                style={{
                  position: "absolute",
                  left: "16px",
                  bottom: "52px",
                  padding: "12px 14px",
                  maxWidth: "360px",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <strong style={{ fontSize: "13px", color: "var(--tinta)" }}>
                    {hoveredNode.roleLabel} ({hoveredNode.code})
                  </strong>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color:
                        hoveredNode.score >= 0.8
                          ? "var(--sinyal-teks)"
                          : "var(--tinta)",
                    }}
                  >
                    Skor {formatScore(hoveredNode.score)}
                  </span>
                </div>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: "16px",
                    fontSize: "12px",
                    color: "var(--tinta)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  {hoveredNode.reasons.slice(0, 3).map((r) => (
                    <li key={r.technical_name}>{r.name}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Baris penyandian bentuk dan garis di bagian bawah kanvas */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                padding: "10px 18px",
                backgroundColor: "var(--putih)",
                borderTop: "1px solid var(--garis)",
                fontSize: "12px",
                color: "var(--tinta-redup)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <circle cx="6" cy="6" r="5" fill="var(--tinta)" />
                </svg>
                Sumber
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <circle cx="6" cy="6" r="5" fill="var(--teal)" />
                </svg>
                Perantara dan rantai
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <circle
                    cx="6"
                    cy="6"
                    r="4.5"
                    fill="var(--putih)"
                    stroke="var(--rute)"
                    strokeWidth="1.5"
                  />
                </svg>
                Normal (skor rendah)
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <polygon points="6,1 11,6 6,11 1,6" fill="var(--sinyal)" />
                </svg>
                Titik pencairan (ditandai)
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
                  <line x1="0" y1="5" x2="22" y2="5" stroke="var(--tinta)" strokeWidth="2.2" />
                </svg>
                Aliran inti
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
                  <line
                    x1="0"
                    y1="5"
                    x2="22"
                    y2="5"
                    stroke="var(--rute)"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                  />
                </svg>
                Penyamaran berlapis
              </span>
            </div>
          </div>

          {/* Panel Detail Samping saat penelusuran selesai */}
          {phase === 3 && (
            <aside
              aria-label={`Detail simpul ${selectedNode.code}`}
              style={{
                padding: "20px",
                backgroundColor: "var(--putih)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--tinta)" }}>
                    {selectedNode.roleLabel} ({selectedNode.code})
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <HashBadge value={selectedNode.walletId} />
                  </div>
                </div>
                <RiskChip band={selectedNode.band} status={selectedNode.status} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  padding: "12px",
                  backgroundColor: "var(--kertas)",
                  borderRadius: "6px",
                  border: "1px solid var(--garis)",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <div className="teks-kecil">Skor risiko</div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--tinta)",
                    }}
                  >
                    {formatScore(selectedNode.score)}
                  </div>
                </div>
                <div>
                  <div className="teks-kecil">Volume aliran</div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--tinta)",
                      marginTop: "4px",
                    }}
                  >
                    {selectedNode.volumeBtc.toFixed(2).replace(".", ",")} BTC
                  </div>
                </div>
              </div>

              <div className="teks-kecil" style={{ marginBottom: "12px" }}>
                <strong>Himpunan prediksi conformal:</strong>{" "}
                {selectedNode.predSet.join(", ")}
              </div>

              <div
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: "var(--tinta)",
                }}
              >
                Alasan penandaan (kontribusi SHAP)
              </div>
              <ShapBars features={selectedNode.reasons} />

              <p
                className="teks-kecil"
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--garis)",
                  marginBottom: "12px",
                }}
              >
                Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.
              </p>

              <Link
                href="/jelajah"
                className="tombol-utama"
                style={{ width: "100%", fontSize: "14px" }}
              >
                Buka Penjelajah dan Pemantau Jaringan
              </Link>
            </aside>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="tabel-data" aria-label="Daftar node dan aliran pada graf ilustrasi">
            <thead>
              <tr>
                <th scope="col">Simpul</th>
                <th scope="col">ID transaksi</th>
                <th scope="col">Peran</th>
                <th scope="col">Volume</th>
                <th scope="col">Skor risiko</th>
                <th scope="col">Band risiko</th>
                <th scope="col">Alasan utama</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.id}>
                  <td style={{ fontWeight: 700 }}>{node.code}</td>
                  <td>
                    <HashBadge value={node.walletId} />
                  </td>
                  <td>{node.roleLabel}</td>
                  <td>{node.volumeBtc.toFixed(2).replace(".", ",")} BTC</td>
                  <td style={{ fontWeight: 700 }}>{formatScore(node.score)}</td>
                  <td>
                    <RiskChip band={node.band} status={node.status} />
                  </td>
                  <td className="teks-kecil">{node.reasons[0]?.name}</td>
                  <td>
                    <button
                      type="button"
                      className="tombol-sekunder"
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setViewMode("graf");
                      }}
                      style={{ minHeight: "34px", padding: "4px 10px", fontSize: "12px" }}
                    >
                      Periksa alasan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
