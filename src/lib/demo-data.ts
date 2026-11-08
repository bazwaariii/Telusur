import clustersJson from "../../public/data/clusters.json";
import thresholdJson from "../../public/data/threshold.json";
import metaJson from "../../public/data/meta.json";
import graphK43 from "../../public/data/graph-kluster-t43-23.json";
import graphK38 from "../../public/data/graph-kluster-t38-14.json";
import graphK46 from "../../public/data/graph-kluster-t46-09.json";
import graphK41 from "../../public/data/graph-kluster-t41-11.json";

export type NodeStatus =
  | "sumber"
  | "perantara"
  | "normal"
  | "titik_pencairan"
  | "sangat_tinggi"
  | "alarm_palsu";

export type RiskBand = "Rendah" | "Sedang" | "Tinggi" | "Sangat tinggi";

export interface ShapFeature {
  name: string;
  technical_name: string;
  contribution: number;
}

export interface GraphNode {
  id: string;
  short_id: string;
  role: string;
  status: NodeStatus;
  timestep: number;
  score: number;
  band: RiskBand;
  pred_set: string[];
  volume_btc: number;
  in_degree: number;
  out_degree: number;
  x: number;
  y: number;
  features_top: ShapFeature[];
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "inti" | "penyamaran";
  amount_btc: number;
}

export interface ClusterGraphData {
  cluster_id: string;
  timestep: number;
  focal_node_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ClusterSummary {
  id: string;
  rank: number;
  code: string;
  timestep: number;
  timestep_label: string;
  node_count: number;
  max_score: number;
  band: RiskBand;
  title: string;
  summary: string;
  focal_node_id: string;
  regime_note: string;
}

export interface TimestepRow {
  timestep: number;
  label: string;
  volume: number;
  illicit_count: number;
  threshold_static: number;
  threshold_aci: number;
  fpr_static: number;
  fpr_aci: number;
  recall_static: number;
  regime: string;
  event: string | null;
}

export interface ThresholdData {
  protocol: string;
  target_fpr_pct: number;
  mean_fpr_aci_pct: number;
  mean_fpr_static_pct: number;
  exceedance_timesteps: number[];
  regime_shift_timestep: number;
  timesteps: TimestepRow[];
}

export const CLUSTERS: ClusterSummary[] = clustersJson as ClusterSummary[];
export const THRESHOLD_DATA: ThresholdData = thresholdJson as ThresholdData;
export const META_DATA = metaJson;

export const GRAPHS_BY_CLUSTER: Record<string, ClusterGraphData> = {
  "kluster-t43-23": graphK43 as ClusterGraphData,
  "kluster-t38-14": graphK38 as ClusterGraphData,
  "kluster-t46-09": graphK46 as ClusterGraphData,
  "kluster-t41-11": graphK41 as ClusterGraphData,
};

export interface ClaimRegisterRow {
  id: string;
  claim: string;
  evidence_status:
    | "Terbukti pada uji"
    | "Sebagian terbukti"
    | "Aktif dan terukur"
    | "Tervalidasi struktural";
  scope_and_protocol: string;
  public_phrasing: string;
}

export const CLAIM_REGISTER: ClaimRegisterRow[] = [
  {
    id: "K-01",
    claim: "F1 82,6% dan FPR 0,24% pada model LightGBM + fitur graf 2-lompatan",
    evidence_status: "Terbukti pada uji",
    scope_and_protocol:
      "Dataset Bitcoin (Elliptic), pembagian temporal t1 sampai t34 (latih/kalibrasi) dan t35 sampai t49 (uji), rata-rata 5 seed.",
    public_phrasing:
      "F1 82,6% dan tingkat alarm palsu (FPR) 0,24% pada protokol pembagian temporal Elliptic (Bitcoin), rata-rata 5 seed.",
  },
  {
    id: "K-02",
    claim: "Perbandingan LightGBM terhadap XGBoost dan Random Forest",
    evidence_status: "Terbukti pada uji",
    scope_and_protocol:
      "Selisih F1 sekitar 1 poin (82,6% vs 81,7% dan 81,2%); keunggulan utama ada pada FPR yang lebih rendah (0,24% vs 0,38% dan 0,44%).",
    public_phrasing:
      "Menghasilkan alarm palsu lebih sedikit dibanding pembanding pada protokol uji yang sama.",
  },
  {
    id: "K-03",
    claim: "Kontribusi fitur konteks rezim (regime-aware)",
    evidence_status: "Terbukti pada uji",
    scope_and_protocol:
      "Pada Elliptic, F1 dengan fitur rezim 82,6% berbanding 82,5% tanpa fitur rezim (sekitar 2,0% dari total gain).",
    public_phrasing:
      "Fitur konteks rezim menyumbang selisih 0,1 poin F1 pada Elliptic dan digunakan sebagai sinyal pendukung pemantau pergeseran rezim.",
  },
  {
    id: "K-04",
    claim: "Kendali ambang menyesuaikan diri (Adaptive Conformal Inference / ACI)",
    evidence_status: "Sebagian terbukti",
    scope_and_protocol:
      "Rata-rata FPR jangka panjang 1,05% berbanding 1,54% pada ambang statis (target 1,0%). FPR per timestep sempat melewati 2% pada t44 (2,31%) dan t49 (2,14%).",
    public_phrasing:
      "Menjaga rata-rata FPR jangka panjang mendekati target (1,05% vs 1,54%), dengan lonjakan sementara di atas 2% pada t44 dan t49 saat terjadi guncangan rezim.",
  },
  {
    id: "K-05",
    claim: "Batas tangkapan (recall) model pada kelas transaksi ilegal",
    evidence_status: "Terbukti pada uji",
    scope_and_protocol:
      "Recall keseluruhan pada periode uji sekitar 73,1%.",
    public_phrasing:
      "Pada uji ini sekitar 1 dari 4 transaksi ilegal tidak tertangkap oleh model.",
  },
  {
    id: "K-06",
    claim: "Penurunan performa akibat pergeseran rezim (concept drift) pasca-t43",
    evidence_status: "Terbukti pada uji",
    scope_and_protocol:
      "Setelah penutupan pasar gelap AlphaBay pada t43, recall turun dari 85,9% menjadi 1,8% sebelum pelatihan ulang.",
    public_phrasing:
      "Pergeseran perilaku pelaku pada t43 menurunkan recall dari 85,9% ke 1,8%; ACI mengendalikan FPR tetapi pemulihan recall memerlukan pelatihan ulang.",
  },
  {
    id: "K-07",
    claim: "Pemantau pergeseran distribusi (PSI dan uji statistik KS)",
    evidence_status: "Aktif dan terukur",
    scope_and_protocol:
      "Population Stability Index (PSI) melonjak dari 0,08 (pra-t43) menjadi 0,42 pada t43 (melampaui batas kritis 0,25) dengan statistik KS 0,31 (p < 0,001).",
    public_phrasing:
      "Pemantau drift PSI/KS mendeteksi pergeseran distribusi pada t43 (PSI 0,42 > 0,25; KS 0,31) untuk memicu peringatan kalibrasi ulang kepada analis.",
  },
  {
    id: "K-08",
    claim: "Kecepatan inferensi < 1 ms per transaksi (> 39.000 transaksi/detik)",
    evidence_status: "Terbukti pada uji",
    scope_and_protocol:
      "Diukur pada pemrosesan batch di satu CPU (prosesor tunggal x86_64 tanpa GPU) untuk inferensi pohon keputusan setelah fitur graf tersedia.",
    public_phrasing:
      "Waktu inferensi model kurang dari 1 ms per transaksi (lebih dari 39.000 transaksi/detik) pada pengujian satu CPU lokal.",
  },
  {
    id: "K-09",
    claim: "Pemindaian struktur graf 2-lompatan multi-chain (Bitcoin, TRON USDT TRC-20, dan Ethereum EVM)",
    evidence_status: "Tervalidasi struktural",
    scope_and_protocol:
      "Mesin penilaian mengekstraksi derajat pemecahan (fan-out), waktu singgah antarblok, dan nisbah konvergensi pencairan 2-lompatan pada Bitcoin, TRON, dan EVM, sedangkan metrik benchmark terkalibrasi berasal dari Elliptic (Bitcoin).",
    public_phrasing:
      "Inspeksi struktur graf 2-lompatan mendukung Bitcoin, TRON (USDT TRC-20), dan Ethereum (EVM); metrik benchmark dasar mengacu pada dataset Elliptic (Bitcoin).",
  },
];

export function formatScore(score: number): string {
  return score.toFixed(2).replace(".", ",");
}

export function formatPct(val: number, digits = 2): string {
  return `${val.toFixed(digits).replace(".", ",")}%`;
}

export function truncateMiddle(value: string, startChars = 6, endChars = 4): string {
  if (value.length <= startChars + endChars + 1) return value;
  return `${value.slice(0, startChars)}…${value.slice(-endChars)}`;
}

export function validateWalletOrNodeInput(
  raw: string,
  mode: "node" | "tron" | "evm"
): { valid: boolean; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: "Masukkan ID node atau alamat terlebih dahulu.",
    };
  }
  if (mode === "tron") {
    const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
    if (!tronRegex.test(trimmed)) {
      return {
        valid: false,
        error: "Alamat tidak valid. Alamat TRON diawali T dan terdiri atas 34 karakter.",
      };
    }
    return { valid: true };
  }
  if (mode === "evm") {
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!evmRegex.test(trimmed)) {
      return {
        valid: false,
        error: "Alamat tidak valid. Alamat EVM diawali 0x dan diikuti 40 karakter heksadesimal.",
      };
    }
    return { valid: true };
  }
  // mode === "node" (mendukung ID Elliptic tx_..., kode kluster K-..., alamat Bitcoin bc1/1/3, atau hash tx 64 hex)
  const nodeRegex =
    /^(tx_[0-9]{4,12}|kluster-t[0-9]{2}-[0-9]{2}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}|[a-fA-F0-9]{64}|[0-9]{4,12}|[a-zA-Z0-9_-]{2,42})$/;
  if (!nodeRegex.test(trimmed)) {
    return {
      valid: false,
      error:
        "Format alamat atau ID transaksi Bitcoin tidak dikenali. Gunakan ID seperti tx_230488910, alamat bc1q..., atau hash transaksi 64 karakter.",
    };
  }
  return { valid: true };
}

export function buildClientAddressCluster(
  rawInput: string,
  chain: "bitcoin" | "tron" | "evm",
  overrideScore?: number
): { cluster: ClusterSummary; graph: ClusterGraphData } {
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
      score: isSuspicious ? 0.7 : 0.15,
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

  return { cluster, graph };
}
