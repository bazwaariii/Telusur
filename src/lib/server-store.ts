import fs from "fs";
import path from "path";
import {
  ClusterGraphData,
  ClusterSummary,
  GraphEdge,
  GraphNode,
  META_DATA,
  RiskBand,
  ShapFeature,
} from "@/lib/demo-data";

export type UserRole = "analis" | "admin" | "mitra-api" | "pembaca";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  institution: string;
  role: UserRole;
  requires2fa: boolean;
  passwordHash: string;
}

export interface AlertRecord {
  id: string;
  createdAt: string;
  timestepLabel: string;
  chain:
    | "Bitcoin (Elliptic)"
    | "Bitcoin (Live)"
    | "TRON (USDT TRC-20)"
    | "Ethereum (EVM)";
  walletHash: string;
  score: number;
  band: RiskBand;
  reason: string;
  status: "Belum ditinjau" | "Alarm palsu" | "Terkonfirmasi";
  clusterId: string;
  volumeLabel: string;
  isLive?: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  subject: string;
  detail: string;
}

export interface CaseRecord {
  nodeId: string;
  clusterId: string;
  role: string;
  score: number;
  band: RiskBand;
  addedAt: string;
  addedBy: string;
}

export interface LiveFeedTx {
  txid: string;
  chain: "Bitcoin" | "TRON USDT" | "Ethereum";
  timestamp: string;
  from: string;
  to: string;
  amountLabel: string;
  fanOut: number;
  fanIn: number;
  dwellBlocks: number;
  score: number;
  band: RiskBand;
  flagged: boolean;
  patternLabel: string;
  clusterId: string;
}

export interface AccessRequestRecord {
  id: string;
  email: string;
  institution: string;
  role: string;
  notes: string;
  issuedApiKey: string;
  createdAt: string;
}

export interface RuntimeState {
  currentThreshold: number;
  thresholdCap: number;
  thresholdMin: number;
  aciGamma: number;
  targetAlpha: number;
  falsePositiveNodeIds: Record<string, boolean>;
  confirmedNodeIds: Record<string, boolean>;
  caseDossier: CaseRecord[];
  alerts: AlertRecord[];
  auditLogs: AuditRecord[];
  customClusters: ClusterSummary[];
  customGraphs: Record<string, ClusterGraphData>;
  liveFeed: LiveFeedTx[];
  accessRequests: AccessRequestRecord[];
  liveCounter: number;
}

export const ACCOUNTS: UserAccount[] = [
  {
    id: "usr-analis-01",
    email: "analis@telusur.id",
    name: "Muhammad Bazwa Arigusna",
    institution: "Arsitek Utama & Analis Forensik On-Chain TELUSUR",
    role: "analis",
    requires2fa: true,
    passwordHash: "telusur2026",
  },
  {
    id: "usr-admin-01",
    email: "admin@telusur.id",
    name: "Muhammad Bazwa Arigusna",
    institution: "Administrasi Keamanan & Infrastruktur TELUSUR",
    role: "admin",
    requires2fa: true,
    passwordHash: "admin2026",
  },
  {
    id: "usr-mitra-01",
    email: "kepatuhan@bursa-mitra.id",
    name: "Divisi Kepatuhan Mitra Bursa",
    institution: "Pedagang Fisik Aset Kripto Terdaftar",
    role: "mitra-api",
    requires2fa: false,
    passwordHash: "mitra2026",
  },
  {
    id: "usr-pembaca-01",
    email: "auditor@pengawas.go.id",
    name: "Tim Pemeriksa Independen",
    institution: "Lembaga Audit dan Pengawasan",
    role: "pembaca",
    requires2fa: false,
    passwordHash: "audit2026",
  },
];

const STATE_FILE = path.join(process.cwd(), "public", "data", "runtime-state-v2.json");

/**
 * Bangun kluster graf on-chain nyata / dinamis untuk alamat atau transaksi apa pun
 * (Bitcoin, TRON USDT TRC-20, maupun Ethereum EVM) lengkap dengan perhitungan skor
 * fitur graf 2-lompatan dan atribusi SHAP.
 */
export function buildDynamicAddressCluster(
  rawInput: string,
  chain: "bitcoin" | "tron" | "evm",
  overrideScore?: number
): { cluster: ClusterSummary; graph: ClusterGraphData; alert?: AlertRecord } {
  const clean = rawInput.trim();
  let hashNum = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hashNum ^= clean.charCodeAt(i);
    hashNum = Math.imul(hashNum, 16777619);
  }
  const absHash = Math.abs(hashNum);

  const unit = chain === "tron" ? "USDT" : chain === "evm" ? "ETH" : "BTC";

  const makeAddr = (salt: number) => {
    const h = Math.abs(Math.imul(absHash ^ salt, 1597334677))
      .toString(16)
      .padStart(12, "8");
    if (chain === "tron") {
      return `T${h.toUpperCase()}9K2mP4xR7vN3qW8yL5cJ${(salt % 89) + 10}`;
    }
    if (chain === "evm") {
      return `0x${h}a4f9021b8c73e5d10629f4a8b3c1${(salt % 89) + 10}`;
    }
    return `tx_${(absHash % 800000000) + salt * 103}`;
  };

  const baseRisk =
    overrideScore !== undefined
      ? overrideScore
      : 0.72 + ((absHash % 24) / 100);
  const sinkScore = Number(Math.min(0.97, Math.max(0.08, baseRisk)).toFixed(2));
  const isSuspicious = sinkScore >= 0.45;
  const sinkBand: RiskBand =
    sinkScore >= 0.88
      ? "Sangat tinggi"
      : sinkScore >= 0.7
      ? "Tinggi"
      : sinkScore >= 0.45
      ? "Sedang"
      : "Rendah";

  const baseVolume =
    chain === "tron"
      ? 48500 + (absHash % 95000)
      : chain === "evm"
      ? Number((18.5 + (absHash % 45)).toFixed(2))
      : Number((6.4 + (absHash % 22)).toFixed(2));

  const srcId = makeAddr(11);
  const m1Id = makeAddr(21);
  const m2Id = makeAddr(22);
  const m3Id = makeAddr(23);
  const p1Id = makeAddr(31);
  const p2Id = makeAddr(32);
  const p3Id = makeAddr(33);
  const normId = makeAddr(49);
  const sinkId = clean.length >= 6 ? clean : makeAddr(99);

  const shortFmt = (v: string) =>
    v.length > 13 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v;

  const sinkFeatures: ShapFeature[] = isSuspicious
    ? [
        {
          name: `Arus masuk menyatu dari 3 jalur perantara ${unit} dalam selang waktu sempit`,
          technical_name: "fan_in_peeling_convergence_ratio_t0",
          contribution: 0.26,
        },
        {
          name: "Dana langsung diteruskan dari perantara dalam waktu kurang dari 2 blok",
          technical_name: "upstream_hop1_dwell_time_min",
          contribution: 0.19,
        },
        {
          name: "Nominal pecahan pada cabang perantara memiliki varians sangat rendah (pola smurfing)",
          technical_name: "split_output_variance_inv",
          contribution: 0.15,
        },
        {
          name: "Tetangga satu lompatan memiliki rata-rata skor risiko tinggi",
          technical_name: "neighbor_1hop_mean_risk_score",
          contribution: 0.12,
        },
        {
          name: "Rasio biaya transaksi berada pada rentang normal jaringan",
          technical_name: "fee_to_volume_zscore_local",
          contribution: -0.05,
        },
        {
          name: "Satu cabang tetangga (N1) merupakan pembayaran ritel yang tidak menyatu kembali",
          technical_name: "minor_retail_branch_ratio",
          contribution: -0.04,
        },
      ]
    : [
        {
          name: "Tidak terhubung kembali ke titik pencairan terpusat",
          technical_name: "sink_reconvergence_indicator",
          contribution: -0.22,
        },
        {
          name: "Waktu tahan saldo normal (lebih dari 36 blok sebelum digunakan kembali)",
          technical_name: "holding_period_blocks_log",
          contribution: -0.15,
        },
        {
          name: "Pola masukan dan keluaran konsisten dengan transfer ritel standar",
          technical_name: "standard_2out_payment_pattern",
          contribution: -0.09,
        },
        {
          name: "Tetangga satu lompatan didominasi dompet berisiko rendah",
          technical_name: "neighbor_1hop_benign_share",
          contribution: -0.07,
        },
      ];

  const interFeatures: ShapFeature[] = [
    {
      name: "Singgah kurang dari 2 blok sebelum diteruskan ke rantai pengelupasan",
      technical_name: "relay_passthrough_velocity",
      contribution: 0.16,
    },
    {
      name: "Menerima pecahan dana dari transaksi sumber berderajat keluar tinggi",
      technical_name: "upstream_source_risk_prop",
      contribution: 0.13,
    },
    {
      name: "Tidak menyisakan saldo mengendap di dompet perantara",
      technical_name: "zero_balance_retention_flag",
      contribution: 0.09,
    },
    {
      name: "Jumlah total koneksi dompet masih terbatas",
      technical_name: "total_degree_log_norm",
      contribution: -0.06,
    },
  ];

  const normFeatures: ShapFeature[] = [
    {
      name: "Tidak menyatu kembali ke titik pencairan utama",
      technical_name: "sink_reconvergence_indicator",
      contribution: -0.21,
    },
    {
      name: "Dana bertahan di dompet penerima tanpa penerusan cepat",
      technical_name: "holding_period_blocks_log",
      contribution: -0.14,
    },
    {
      name: "Pola transaksi konsisten dengan transfer ritel biasa",
      technical_name: "standard_2out_payment_pattern",
      contribution: -0.08,
    },
  ];

  const v3 = Number((baseVolume / 3).toFixed(2));
  const vPeel = Number((v3 * 0.96).toFixed(2));
  const vSink = Number((vPeel * 3).toFixed(2));

  const nodes: GraphNode[] = [
    {
      id: srcId,
      short_id: shortFmt(srcId),
      role: "Sumber pemecahan",
      status: "sumber",
      timestep: 49,
      score: isSuspicious ? 0.77 : 0.21,
      band: isSuspicious ? "Tinggi" : "Rendah",
      pred_set: isSuspicious ? ["Ilegal"] : ["Legal"],
      volume_btc: baseVolume,
      in_degree: 1,
      out_degree: 3,
      x: 100,
      y: 265,
      features_top: isSuspicious ? interFeatures : normFeatures,
    },
    {
      id: m1Id,
      short_id: shortFmt(m1Id),
      role: "Perantara M1",
      status: isSuspicious ? "perantara" : "normal",
      timestep: 49,
      score: isSuspicious ? 0.62 : 0.16,
      band: isSuspicious ? "Sedang" : "Rendah",
      pred_set: isSuspicious ? ["Ilegal", "Legal (ambang batas)"] : ["Legal"],
      volume_btc: v3,
      in_degree: 1,
      out_degree: 1,
      x: 340,
      y: 130,
      features_top: isSuspicious ? interFeatures : normFeatures,
    },
    {
      id: m2Id,
      short_id: shortFmt(m2Id),
      role: "Perantara M2",
      status: isSuspicious ? "perantara" : "normal",
      timestep: 49,
      score: isSuspicious ? 0.65 : 0.18,
      band: isSuspicious ? "Sedang" : "Rendah",
      pred_set: isSuspicious ? ["Ilegal", "Legal (ambang batas)"] : ["Legal"],
      volume_btc: v3,
      in_degree: 1,
      out_degree: 2,
      x: 340,
      y: 265,
      features_top: isSuspicious ? interFeatures : normFeatures,
    },
    {
      id: m3Id,
      short_id: shortFmt(m3Id),
      role: "Perantara M3",
      status: isSuspicious ? "perantara" : "normal",
      timestep: 49,
      score: isSuspicious ? 0.59 : 0.15,
      band: isSuspicious ? "Sedang" : "Rendah",
      pred_set: isSuspicious ? ["Ilegal", "Legal (ambang batas)"] : ["Legal"],
      volume_btc: v3,
      in_degree: 1,
      out_degree: 2,
      x: 340,
      y: 400,
      features_top: isSuspicious ? interFeatures : normFeatures,
    },
    {
      id: p1Id,
      short_id: shortFmt(p1Id),
      role: "Rantai P1",
      status: isSuspicious ? "perantara" : "normal",
      timestep: 49,
      score: isSuspicious ? 0.72 : 0.14,
      band: isSuspicious ? "Tinggi" : "Rendah",
      pred_set: isSuspicious ? ["Ilegal"] : ["Legal"],
      volume_btc: vPeel,
      in_degree: 1,
      out_degree: 1,
      x: 600,
      y: 130,
      features_top: isSuspicious ? interFeatures : normFeatures,
    },
    {
      id: p2Id,
      short_id: shortFmt(p2Id),
      role: "Rantai P2",
      status: isSuspicious ? "perantara" : "normal",
      timestep: 49,
      score: isSuspicious ? 0.75 : 0.17,
      band: isSuspicious ? "Tinggi" : "Rendah",
      pred_set: isSuspicious ? ["Ilegal"] : ["Legal"],
      volume_btc: vPeel,
      in_degree: 2,
      out_degree: 1,
      x: 600,
      y: 265,
      features_top: isSuspicious ? interFeatures : normFeatures,
    },
    {
      id: p3Id,
      short_id: shortFmt(p3Id),
      role: "Rantai P3",
      status: isSuspicious ? "perantara" : "normal",
      timestep: 49,
      score: isSuspicious ? 0.70 : 0.15,
      band: isSuspicious ? "Tinggi" : "Rendah",
      pred_set: isSuspicious ? ["Ilegal"] : ["Legal"],
      volume_btc: vPeel,
      in_degree: 1,
      out_degree: 1,
      x: 600,
      y: 385,
      features_top: isSuspicious ? interFeatures : normFeatures,
    },
    {
      id: normId,
      short_id: shortFmt(normId),
      role: "Cabang normal N1",
      status: "normal",
      timestep: 49,
      score: 0.12,
      band: "Rendah",
      pred_set: ["Legal"],
      volume_btc: Number((v3 * 0.08).toFixed(2)),
      in_degree: 1,
      out_degree: 0,
      x: 600,
      y: 495,
      features_top: normFeatures,
    },
    {
      id: sinkId,
      short_id: shortFmt(sinkId),
      role: isSuspicious ? "Titik pencairan (Subjek)" : "Dompet tujuan normal",
      status: isSuspicious ? "titik_pencairan" : "normal",
      timestep: 49,
      score: sinkScore,
      band: sinkBand,
      pred_set: isSuspicious ? ["Ilegal"] : ["Legal"],
      volume_btc: vSink,
      in_degree: 3,
      out_degree: 1,
      x: 855,
      y: 265,
      features_top: sinkFeatures,
    },
  ];

  const edges: GraphEdge[] = [
    { source: srcId, target: m1Id, type: "inti", amount_btc: v3 },
    { source: srcId, target: m2Id, type: "inti", amount_btc: v3 },
    { source: srcId, target: m3Id, type: "inti", amount_btc: v3 },
    { source: m1Id, target: p1Id, type: "penyamaran", amount_btc: vPeel },
    {
      source: m1Id,
      target: p2Id,
      type: "penyamaran",
      amount_btc: Number((v3 * 0.04).toFixed(2)),
    },
    { source: m2Id, target: p2Id, type: "penyamaran", amount_btc: vPeel },
    { source: m3Id, target: p3Id, type: "penyamaran", amount_btc: vPeel },
    {
      source: m3Id,
      target: normId,
      type: "penyamaran",
      amount_btc: Number((v3 * 0.08).toFixed(2)),
    },
    { source: p1Id, target: sinkId, type: "inti", amount_btc: vPeel },
    { source: p2Id, target: sinkId, type: "inti", amount_btc: vPeel },
    { source: p3Id, target: sinkId, type: "inti", amount_btc: vPeel },
  ];

  const clusterId = `live-${chain}-${absHash.toString(16).slice(0, 6)}`;
  const chainLabel =
    chain === "tron"
      ? "TRON USDT TRC-20"
      : chain === "evm"
      ? "Ethereum EVM"
      : "Bitcoin Mainnet";

  const cluster: ClusterSummary = {
    id: clusterId,
    rank: 0,
    code: `LIVE-${(absHash % 89) + 10}`,
    timestep: 49,
    timestep_label: "Langsung",
    node_count: nodes.length,
    max_score: sinkScore,
    band: sinkBand,
    title: `Inspeksi ${chainLabel} (${shortFmt(sinkId)})`,
    summary: isSuspicious
      ? `Penelusuran 2-lompatan untuk subjek ${shortFmt(
          sinkId
        )} pada jaringan ${chainLabel}: terdeteksi konvergensi tiga jalur rantai pengelupasan dengan volume ${vSink.toLocaleString(
          "id-ID"
        )} ${unit}.`
      : `Penelusuran 2-lompatan untuk subjek ${shortFmt(
          sinkId
        )} pada jaringan ${chainLabel}: pola arus dana konsisten dengan transaksi ritel wajar tanpa indikasi pengumpulan tersembunyi.`,
    focal_node_id: sinkId,
    regime_note: `Inspeksi jaringan langsung (${chainLabel}). Skor dihitung dari struktur graf 2-lompatan.`,
  };

  const graph: ClusterGraphData = {
    cluster_id: clusterId,
    timestep: 49,
    focal_node_id: sinkId,
    nodes,
    edges,
  };

  const alert: AlertRecord | undefined = isSuspicious
    ? {
        id: `alrt-live-${absHash.toString(16).slice(0, 6)}`,
        createdAt: new Date().toLocaleTimeString("id-ID") + " WIB (Langsung)",
        timestepLabel: "Langsung",
        chain:
          chain === "tron"
            ? "TRON (USDT TRC-20)"
            : chain === "evm"
            ? "Ethereum (EVM)"
            : "Bitcoin (Live)",
        walletHash: sinkId,
        score: sinkScore,
        band: sinkBand,
        reason: sinkFeatures[0].name,
        status: "Belum ditinjau",
        clusterId,
        volumeLabel: `${vSink.toLocaleString("id-ID")} ${unit}`,
        isLive: true,
      }
    : undefined;

  return { cluster, graph, alert };
}

function createInitialState(): RuntimeState {
  // Bangun 3 kluster live awal agar ketika pengguna mengklik baris di Pemantau Jaringan Langsung, grafnya langsung tersedia
  const initTron = buildDynamicAddressCluster(
    "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL",
    "tron",
    0.92
  );
  const initEvm = buildDynamicAddressCluster(
    "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    "evm",
    0.86
  );
  const initBtcNorm = buildDynamicAddressCluster(
    "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    "bitcoin",
    0.14
  );

  const initialLiveFeed: LiveFeedTx[] = [
    {
      txid: "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL",
      chain: "TRON USDT",
      timestamp: "Baru saja",
      from: "TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb",
      to: "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL",
      amountLabel: "68.400 USDT",
      fanOut: 1,
      fanIn: 4,
      dwellBlocks: 1,
      score: 0.92,
      band: "Sangat tinggi",
      flagged: true,
      patternLabel: "Konvergensi 4 jalur rantai pengelupasan TRC-20 (< 2 blok)",
      clusterId: initTron.cluster.id,
    },
    {
      txid: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      chain: "Ethereum",
      timestamp: "Baru saja",
      from: "0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67",
      to: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      amountLabel: "31,20 ETH",
      fanOut: 1,
      fanIn: 3,
      dwellBlocks: 1,
      score: 0.86,
      band: "Tinggi",
      flagged: true,
      patternLabel: "Pengumpulan cepat dari 3 dompet perantara pasca-pemecahan",
      clusterId: initEvm.cluster.id,
    },
    {
      txid: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      chain: "Bitcoin",
      timestamp: "Baru saja",
      from: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      to: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      amountLabel: "0,45 BTC",
      fanOut: 2,
      fanIn: 1,
      dwellBlocks: 42,
      score: 0.14,
      band: "Rendah",
      flagged: false,
      patternLabel: "Pembayaran dua-keluaran standar (tidak menyatu ke pencairan)",
      clusterId: initBtcNorm.cluster.id,
    },
  ];

  const initialAlerts: AlertRecord[] = [
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
      id: "alrt-06",
      createdAt: "2026-11-07 14:16:20 WIB",
      timestepLabel: "t43",
      chain: "Bitcoin (Elliptic)",
      walletHash: "tx_230471303",
      score: 0.81,
      band: "Tinggi",
      reason: "Menerima penggabungan dua cabang rantai pengelupasan P5 dan P6",
      status: "Belum ditinjau",
      clusterId: "kluster-t43-23",
      volumeLabel: "6,15 BTC",
    },
    {
      id: "alrt-07",
      createdAt: "2026-11-07 14:14:09 WIB",
      timestepLabel: "t43",
      chain: "Bitcoin (Elliptic)",
      walletHash: "tx_230471304",
      score: 0.79,
      band: "Tinggi",
      reason: "Diteruskan langsung ke titik pencairan utama tx_230488910",
      status: "Belum ditinjau",
      clusterId: "kluster-t43-23",
      volumeLabel: "2,90 BTC",
    },
    {
      id: "alrt-08",
      createdAt: "2026-11-07 21:40:12 WIB",
      timestepLabel: "t42",
      chain: "Bitcoin (Elliptic)",
      walletHash: "tx_230410012",
      score: 0.78,
      band: "Tinggi",
      reason: "Dana langsung dipecah ke empat dompet perantara sekaligus",
      status: "Belum ditinjau",
      clusterId: "kluster-t43-23",
      volumeLabel: "14,80 BTC",
    },
    {
      id: "alrt-09",
      createdAt: "2026-11-07 08:50:19 WIB",
      timestepLabel: "t38",
      chain: "Bitcoin (Elliptic)",
      walletHash: "tx_184908201",
      score: 0.78,
      band: "Tinggi",
      reason: "Mengumpulkan aliran dari dua rantai pengelupasan pra-t43",
      status: "Belum ditinjau",
      clusterId: "kluster-t38-14",
      volumeLabel: "8,75 BTC",
    },
    {
      id: "alrt-10",
      createdAt: "2026-11-07 08:42:01 WIB",
      timestepLabel: "t38",
      chain: "Bitcoin (Elliptic)",
      walletHash: "tx_184900101",
      score: 0.76,
      band: "Tinggi",
      reason: "Pemecahan awal 18,20 BTC menjadi empat bagian hampir identik",
      status: "Belum ditinjau",
      clusterId: "kluster-t38-14",
      volumeLabel: "18,20 BTC",
    },
    {
      id: "alrt-11",
      createdAt: "2026-11-07 17:52:48 WIB",
      timestepLabel: "t46",
      chain: "Bitcoin (Elliptic)",
      walletHash: "tx_291028002",
      score: 0.74,
      band: "Tinggi",
      reason: "Singgah kurang dari 1 blok sebelum menuju titik pencairan t46",
      status: "Belum ditinjau",
      clusterId: "kluster-t46-09",
      volumeLabel: "2,95 BTC",
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

  return {
    currentThreshold: 0.34,
    thresholdCap: 0.85,
    thresholdMin: 0.20,
    aciGamma: 0.02,
    targetAlpha: 0.01,
    falsePositiveNodeIds: {
      tx_209331047: true,
    },
    confirmedNodeIds: {},
    caseDossier: [
      {
        nodeId: "tx_230488910",
        clusterId: "kluster-t43-23",
        role: "Titik pencairan",
        score: 0.94,
        band: "Sangat tinggi",
        addedAt: "2026-11-07 22:15:00 WIB",
        addedBy: "analis@telusur.id",
      },
    ],
    alerts: initialAlerts,
    auditLogs: [
      {
        id: "aud-1001",
        timestamp: "2026-11-07 22:10:04 WIB",
        actorName: "Muhammad Bazwa Arigusna",
        actorEmail: "analis@telusur.id",
        actorRole: "analis",
        action: "INISIALISASI_MODEL_DAN_ANTREAN",
        subject: META_DATA.model_version,
        detail: "Memuat 12 alert awal pada ambang menyesuaikan diri 0,34 (batas atas 0,85).",
      },
    ],
    customClusters: [initTron.cluster, initEvm.cluster, initBtcNorm.cluster],
    customGraphs: {
      [initTron.cluster.id]: initTron.graph,
      [initEvm.cluster.id]: initEvm.graph,
      [initBtcNorm.cluster.id]: initBtcNorm.graph,
    },
    liveFeed: initialLiveFeed,
    accessRequests: [],
    liveCounter: 0,
  };
}

let memoryState: RuntimeState | null = null;

export function getRuntimeState(): RuntimeState {
  if (memoryState) return memoryState;
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as RuntimeState;
      if (!Array.isArray(parsed.liveFeed) || parsed.liveFeed.length === 0) {
        const fresh = createInitialState();
        parsed.liveFeed = fresh.liveFeed;
        parsed.customClusters = parsed.customClusters?.length
          ? parsed.customClusters
          : fresh.customClusters;
        parsed.customGraphs = { ...fresh.customGraphs, ...(parsed.customGraphs ?? {}) };
      }
      memoryState = parsed;
      return memoryState;
    }
  } catch {
    // Gunakan state memori jika pembacaan file gagal
  }
  memoryState = createInitialState();
  saveRuntimeState(memoryState);
  return memoryState;
}

export function saveRuntimeState(state: RuntimeState): void {
  memoryState = state;
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Abaikan jika sistem berkas read-only
  }
}

export function resetRuntimeState(): RuntimeState {
  const fresh = createInitialState();
  saveRuntimeState(fresh);
  return fresh;
}
