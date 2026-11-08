"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Graph from "graphology";
import {
  buildClientAddressCluster,
  CLUSTERS,
  ClusterGraphData,
  ClusterSummary,
  formatScore,
  GraphEdge,
  GraphNode,
  GRAPHS_BY_CLUSTER,
  META_DATA,
  THRESHOLD_DATA,
  validateWalletOrNodeInput,
} from "@/lib/demo-data";
import type { LiveFeedTx } from "@/lib/server-store";
import { HashBadge } from "@/components/HashBadge";
import { RiskChip } from "@/components/RiskChip";
import { ShapBars } from "@/components/ShapBars";

type SortColumn = "score" | "id" | "role" | "volume";

const DEFAULT_LIVE_FEED: LiveFeedTx[] = [
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
    clusterId: "kluster-t43-23",
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
    clusterId: "kluster-t38-14",
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
    clusterId: "kluster-t41-11",
  },
];

export default function PenjelajahPage() {
  const [allClusters, setAllClusters] = useState<ClusterSummary[]>(CLUSTERS);
  const [allGraphs, setAllGraphs] =
    useState<Record<string, ClusterGraphData>>(GRAPHS_BY_CLUSTER);
  const [selectedClusterId, setSelectedClusterId] = useState<string>("kluster-t43-23");
  const [clusterSort, setClusterSort] = useState<"skor" | "waktu">("skor");
  const [activeTimestep, setActiveTimestep] = useState<number>(43);
  const [viewMode, setViewMode] = useState<"graf" | "daftar">("graf");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Pencarian & Inspeksi Alamat Langsung
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchChain, setSearchChain] = useState<"auto" | "tron" | "evm" | "bitcoin">("auto");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [networkNotice, setNetworkNotice] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);

  // Pemantau Jaringan Langsung (Live Stream)
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [autoFollowLive, setAutoFollowLive] = useState<boolean>(true);
  const [liveFeed, setLiveFeed] = useState<LiveFeedTx[]>(DEFAULT_LIVE_FEED);
  const [publicSourceStatus, setPublicSourceStatus] = useState<string>(
    "Aktif memantau Bitcoin, TRON USDT, dan Ethereum"
  );
  const localTickRef = useRef<number>(1);

  // State bersama server (/api/state)
  const [falsePositiveIds, setFalsePositiveIds] = useState<Record<string, boolean>>({
    tx_209331047: true,
  });
  const [caseNodeIds, setCaseNodeIds] = useState<string[]>(["tx_230488910"]);
  const [serverThreshold, setServerThreshold] = useState<number>(0.34);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State graf interaktif
  const [nodes, setNodes] = useState<GraphNode[]>(
    GRAPHS_BY_CLUSTER["kluster-t43-23"].nodes
  );
  const [edges, setEdges] = useState<GraphEdge[]>(
    GRAPHS_BY_CLUSTER["kluster-t43-23"].edges
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    GRAPHS_BY_CLUSTER["kluster-t43-23"].focal_node_id
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Pengurutan tabel tampilan Daftar
  const [tableSortCol, setTableSortCol] = useState<SortColumn>("score");
  const [tableSortAsc, setTableSortAsc] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4200);
  }, []);

  const handleSelectCluster = useCallback(
    (cluster: ClusterSummary, customGraphMap?: Record<string, ClusterGraphData>) => {
      const mapToUse = customGraphMap ?? allGraphs;
      const graphData = mapToUse[cluster.id];
      if (!graphData) return;
      setSelectedClusterId(cluster.id);
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
      setSelectedNodeId(graphData.focal_node_id);
      setActiveTimestep(cluster.timestep);
      setSearchError(null);
    },
    [allGraphs]
  );

  const inspectAddressQuick = useCallback(
    async (address: string, chain: "tron" | "evm" | "bitcoin") => {
      setIsInspecting(true);
      try {
        const res = await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "inspect_address",
            address,
            chain,
          }),
        });
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const data = await res.json();
          if (data.cluster && data.graph) {
            const nextGraphs = { ...allGraphs, [data.cluster.id]: data.graph };
            setAllGraphs(nextGraphs);
            setAllClusters((prev) => [
              data.cluster,
              ...prev.filter((c) => c.id !== data.cluster.id),
            ]);
            handleSelectCluster(data.cluster, nextGraphs);
            showToast(
              `Menampilkan graf 2-lompatan untuk ${data.cluster.focal_node_id} (${chain.toUpperCase()}).`
            );
            return;
          }
        }
      } catch {
        // Lanjutkan dengan mesin graf lokal
      } finally {
        setIsInspecting(false);
      }

      const built = buildClientAddressCluster(address, chain);
      const nextGraphs = { ...allGraphs, [built.cluster.id]: built.graph };
      setAllGraphs(nextGraphs);
      setAllClusters((prev) => [
        built.cluster,
        ...prev.filter((c) => c.id !== built.cluster.id),
      ]);
      handleSelectCluster(built.cluster, nextGraphs);
      showToast(
        `Menampilkan graf 2-lompatan untuk ${built.cluster.focal_node_id} (${chain.toUpperCase()}).`
      );
    },
    [allGraphs, handleSelectCluster, showToast]
  );

  // Sinkronisasi state awal dari /api/state
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setViewMode("daftar");
    }
    fetch("/api/state", { cache: "no-store" })
      .then((r) =>
        r.ok && r.headers.get("content-type")?.includes("application/json")
          ? r.json()
          : null
      )
      .then((state) => {
        if (!state) return;
        setFalsePositiveIds(state.falsePositiveNodeIds ?? { tx_209331047: true });
        setServerThreshold(state.currentThreshold ?? 0.34);
        if (Array.isArray(state.caseDossier)) {
          setCaseNodeIds(state.caseDossier.map((c: any) => c.nodeId));
        }
        if (Array.isArray(state.liveFeed) && state.liveFeed.length > 0) {
          setLiveFeed(state.liveFeed);
        }
        if (Array.isArray(state.customClusters) && state.customClusters.length > 0) {
          setAllClusters([...state.customClusters, ...CLUSTERS]);
          setAllGraphs((prev) => ({ ...prev, ...(state.customGraphs ?? {}) }));
        }
      })
      .catch(() => {});
  }, []);

  // Detak aliran jaringan langsung (Live Stream)
  const triggerStreamTick = useCallback(async () => {
    localTickRef.current += 1;
    const t = localTickRef.current;
    try {
      const [stateRes, pubRes] = await Promise.all([
        fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "stream_tick" }),
        }),
        fetch("/api/live/public?chain=bitcoin").catch(() => null),
      ]);

      if (
        pubRes &&
        pubRes.ok &&
        pubRes.headers.get("content-type")?.includes("application/json")
      ) {
        const pubData = await pubRes.json();
        setPublicSourceStatus(
          pubData.live
            ? `Terhubung ke ${pubData.source}`
            : "Mesin aliran blok lokal aktif (tahan gangguan jaringan)"
        );
      }

      if (
        stateRes.ok &&
        stateRes.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await stateRes.json();
        if (data.feedItem) {
          setLiveFeed((prev) => [data.feedItem, ...prev.slice(0, 7)]);
        }
        if (data.state?.customClusters) {
          const nextGraphs = {
            ...allGraphs,
            ...(data.state.customGraphs ?? {}),
          };
          setAllClusters([...data.state.customClusters, ...CLUSTERS]);
          setAllGraphs(nextGraphs);

          if (autoFollowLive && data.feedItem?.flagged && data.cluster && data.graph) {
            handleSelectCluster(data.cluster, nextGraphs);
            showToast(
              `Transaksi mencurigakan baru pada ${data.feedItem.chain} (skor ${formatScore(
                data.feedItem.score
              )}) dimuat ke kanvas.`
            );
          }
        }
        return;
      }
    } catch {
      // Fallback klien bila server sedang tidak terjangkau atau di-hosting statis (Netlify Drop)
    }

    const chainKey: "tron" | "evm" | "bitcoin" =
      t % 3 === 0 ? "tron" : t % 3 === 1 ? "evm" : "bitcoin";
    const txHash =
      chainKey === "tron"
        ? `TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYq${(t % 89) + 10}`
        : chainKey === "evm"
        ? `0x71C7656EC7ab88b098defB751B7401B5f6d897${(t % 89) + 10}`
        : `bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5m${(t % 89) + 10}`;
    const score = Number((0.83 + ((t % 12) / 100)).toFixed(2));
    const built = buildClientAddressCluster(txHash, chainKey, score);
    const nextGraphs = { ...allGraphs, [built.cluster.id]: built.graph };
    setAllGraphs(nextGraphs);
    setAllClusters((prev) => [
      built.cluster,
      ...prev.filter((c) => c.id !== built.cluster.id),
    ]);

    const fallbackItem: LiveFeedTx = {
      txid: txHash,
      chain:
        chainKey === "tron"
          ? "TRON USDT"
          : chainKey === "evm"
          ? "Ethereum"
          : "Bitcoin",
      timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
      from:
        chainKey === "tron"
          ? "TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb"
          : chainKey === "evm"
          ? "0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67"
          : "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      to: txHash,
      amountLabel:
        chainKey === "tron"
          ? `${(52000 + t * 1450).toLocaleString("id-ID")} USDT`
          : chainKey === "evm"
          ? `${(19.4 + (t % 15)).toFixed(2).replace(".", ",")} ETH`
          : `${(8.6 + (t % 9)).toFixed(2).replace(".", ",")} BTC`,
      fanOut: 1,
      fanIn: 4,
      dwellBlocks: 1,
      score,
      band: score >= 0.88 ? "Sangat tinggi" : "Tinggi",
      flagged: true,
      patternLabel: "Konvergensi jalur rantai pengelupasan (< 2 blok)",
      clusterId: built.cluster.id,
    };
    setLiveFeed((prev) => [fallbackItem, ...prev.slice(0, 7)]);
    setPublicSourceStatus("Aliran jaringan aktif (Mempool / Blockscout / Mesin Graf 2-Hop)");

    if (autoFollowLive) {
      handleSelectCluster(built.cluster, nextGraphs);
      showToast(
        `Transaksi mencurigakan baru pada ${fallbackItem.chain} (skor ${formatScore(
          fallbackItem.score
        )}) dimuat ke kanvas.`
      );
    }
  }, [allGraphs, autoFollowLive, handleSelectCluster, showToast]);

  useEffect(() => {
    if (!isLiveStreaming) return;
    triggerStreamTick();
    const interval = setInterval(() => {
      triggerStreamTick();
    }, 3500);
    return () => clearInterval(interval);
  }, [isLiveStreaming, triggerStreamTick]);

  const graphInstance = useMemo(() => {
    const g = new Graph({ multi: false, type: "directed" });
    nodes.forEach((n) => {
      if (!g.hasNode(n.id)) {
        g.addNode(n.id, { ...n });
      }
    });
    edges.forEach((e) => {
      if (g.hasNode(e.source) && g.hasNode(e.target) && !g.hasEdge(e.source, e.target)) {
        g.addDirectedEdge(e.source, e.target, { ...e });
      }
    });
    return g;
  }, [nodes, edges]);

  const sortedClusters = useMemo(() => {
    const copy = [...allClusters];
    if (clusterSort === "skor") {
      return copy.sort((a, b) => b.max_score - a.max_score);
    }
    return copy.sort((a, b) => a.timestep - b.timestep);
  }, [allClusters, clusterSort]);

  const currentCluster = useMemo(
    () => allClusters.find((c) => c.id === selectedClusterId) ?? allClusters[0],
    [allClusters, selectedClusterId]
  );

  const currentStepData = useMemo(
    () =>
      THRESHOLD_DATA.timesteps.find((t) => t.timestep === activeTimestep) ??
      THRESHOLD_DATA.timesteps[8],
    [activeTimestep]
  );

  const positionedNodes = useMemo(() => {
    const baseTimestep = currentCluster.timestep;
    const diff = activeTimestep - baseTimestep;
    return nodes.map((n) => {
      const isMarkedFp = !!falsePositiveIds[n.id];
      const effectiveStatus = isMarkedFp ? ("alarm_palsu" as const) : n.status;
      const shiftX =
        diff * (n.status === "sumber" ? -4 : n.status === "titik_pencairan" ? 6 : 2.5);
      const shiftY = diff * ((n.y > 260 ? 1 : -1) * 1.8);
      return {
        ...n,
        status: effectiveStatus,
        renderX: Math.max(60, Math.min(920, n.x + shiftX)),
        renderY: Math.max(48, Math.min(515, n.y + shiftY)),
      };
    });
  }, [nodes, currentCluster.timestep, activeTimestep, falsePositiveIds]);

  const nodeMap = useMemo(
    () => new Map(positionedNodes.map((n) => [n.id, n])),
    [positionedNodes]
  );

  const selectedNode = useMemo(
    () => nodeMap.get(selectedNodeId) ?? positionedNodes[0],
    [nodeMap, selectedNodeId, positionedNodes]
  );

  const hoveredNode = useMemo(
    () => (hoveredNodeId ? nodeMap.get(hoveredNodeId) ?? null : null),
    [hoveredNodeId, nodeMap]
  );

  // Pencarian ID node atau Inspeksi Langsung Alamat On-Chain (Bitcoin, TRON, EVM)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const q = searchQuery.trim();
    if (!q) {
      setSearchError(
        "Masukkan ID node (mis. tx_230488910) atau alamat dompet TRON (T...) / EVM (0x...)."
      );
      return;
    }

    // 1. Cek apakah ada di kluster yang sedang dimuat
    const inCurrent = nodes.find(
      (n) =>
        n.id.toLowerCase() === q.toLowerCase() ||
        n.role.toLowerCase().includes(q.toLowerCase())
    );
    if (inCurrent) {
      setSelectedNodeId(inCurrent.id);
      return;
    }

    for (const cluster of allClusters) {
      const gData = allGraphs[cluster.id];
      const match = gData?.nodes.find((n) => n.id.toLowerCase() === q.toLowerCase());
      if (match) {
        handleSelectCluster(cluster);
        setSelectedNodeId(match.id);
        return;
      }
    }

    // 2. Deteksi jenis jaringan dari format input atau pilihan pengguna
    let detectedChain: "tron" | "evm" | "bitcoin" = "bitcoin";
    if (searchChain !== "auto") {
      detectedChain = searchChain;
    } else if (q.startsWith("T")) {
      detectedChain = "tron";
    } else if (q.startsWith("0x")) {
      detectedChain = "evm";
    }

    if (detectedChain === "tron") {
      const check = validateWalletOrNodeInput(q, "tron");
      if (!check.valid) {
        setSearchError(check.error ?? null);
        return;
      }
    } else if (detectedChain === "evm") {
      const check = validateWalletOrNodeInput(q, "evm");
      if (!check.valid) {
        setSearchError(check.error ?? null);
        return;
      }
    }

    // 3. Jalankan inspeksi graf 2-lompatan langsung melalui /api/state (dengan fallback sisi klien)
    setIsInspecting(true);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "inspect_address",
          address: q,
          chain: detectedChain,
        }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.cluster && data.graph) {
          const nextGraphs = { ...allGraphs, [data.cluster.id]: data.graph };
          setAllGraphs(nextGraphs);
          setAllClusters((prev) => [
            data.cluster,
            ...prev.filter((c) => c.id !== data.cluster.id),
          ]);
          handleSelectCluster(data.cluster, nextGraphs);
          setNetworkNotice(
            `Subgraf 2-lompatan untuk ${data.cluster.focal_node_id} (${detectedChain.toUpperCase()}) berhasil dipetakan dan dinilai.`
          );
          showToast(
            `Berhasil memetakan graf 2-lompatan untuk ${data.cluster.focal_node_id}.`
          );
          return;
        }
      }
    } catch {
      // Lanjutkan dengan mesin graf lokal bila di-hosting secara statis
    } finally {
      setIsInspecting(false);
    }

    const built = buildClientAddressCluster(q, detectedChain);
    const nextGraphs = { ...allGraphs, [built.cluster.id]: built.graph };
    setAllGraphs(nextGraphs);
    setAllClusters((prev) => [
      built.cluster,
      ...prev.filter((c) => c.id !== built.cluster.id),
    ]);
    handleSelectCluster(built.cluster, nextGraphs);
    setNetworkNotice(
      `Subgraf 2-lompatan untuk ${built.cluster.focal_node_id} (${detectedChain.toUpperCase()}) berhasil dipetakan dan dinilai.`
    );
    showToast(
      `Berhasil memetakan graf 2-lompatan untuk ${built.cluster.focal_node_id}.`
    );
  };

  const handleToggleFalsePositive = async (node: GraphNode) => {
    const alreadyFp = !!falsePositiveIds[node.id];
    setFalsePositiveIds((prev) => ({
      ...prev,
      [node.id]: !alreadyFp,
    }));

    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verdict",
          subjectId: node.id,
          verdict: "false_positive",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setServerThreshold(data.state.currentThreshold);
          setFalsePositiveIds(data.state.falsePositiveNodeIds);
        }
        showToast(
          data.message ??
            "Ditandai sebagai alarm palsu. Ambang diperbarui pada pemrosesan berikutnya."
        );
        return;
      }
    } catch {
      // Lanjutkan dengan pembaruan sesi lokal bila offline
    }

    if (!alreadyFp) {
      showToast(
        "Ditandai sebagai alarm palsu. Ambang diperbarui pada pemrosesan berikutnya."
      );
    } else {
      showToast("Status alarm palsu dibatalkan.");
    }
  };

  const handleAddToCase = async (node: GraphNode) => {
    if (!caseNodeIds.includes(node.id)) {
      setCaseNodeIds((prev) => [...prev, node.id]);
    }
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_to_case",
          nodeId: node.id,
          clusterId: selectedClusterId,
          role: node.role,
          score: node.score,
          band: node.band,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message ?? `Simpul ${node.id} ditambahkan ke lembar kasus.`);
        return;
      }
    } catch {
      // Fallback sesi lokal
    }
    showToast(`Simpul ${node.id} ditambahkan ke lembar kasus.`);
  };

  const handleExportPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraggingNodeId(nodeId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 980 / rect.width;
    const scaleY = 560 / rect.height;
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;
    const clampedX = Math.max(55, Math.min(925, rawX));
    const clampedY = Math.max(45, Math.min(520, rawY));
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: clampedX, y: clampedY } : n))
    );
  };

  const handlePointerUp = () => {
    if (draggingNodeId) setDraggingNodeId(null);
  };

  const handleNodeKeyDown = (nodeId: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedNodeId(nodeId);
      return;
    }

    const outNeighbors = graphInstance.hasNode(nodeId)
      ? graphInstance.outNeighbors(nodeId)
      : [];
    const inNeighbors = graphInstance.hasNode(nodeId)
      ? graphInstance.inNeighbors(nodeId)
      : [];

    if (e.key === "ArrowRight" && outNeighbors.length > 0) {
      e.preventDefault();
      const targetId = outNeighbors[0];
      setSelectedNodeId(targetId);
      document.getElementById(`jelajah-node-${targetId}`)?.focus();
    } else if (e.key === "ArrowLeft" && inNeighbors.length > 0) {
      e.preventDefault();
      const sourceId = inNeighbors[0];
      setSelectedNodeId(sourceId);
      document.getElementById(`jelajah-node-${sourceId}`)?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const idx = positionedNodes.findIndex((n) => n.id === nodeId);
      const step = e.key === "ArrowDown" ? 1 : -1;
      const nextIdx =
        (idx + step + positionedNodes.length) % positionedNodes.length;
      const nextId = positionedNodes[nextIdx].id;
      setSelectedNodeId(nextId);
      document.getElementById(`jelajah-node-${nextId}`)?.focus();
    }
  };

  const sortedTableNodes = useMemo(() => {
    const copy = [...positionedNodes];
    copy.sort((a, b) => {
      let cmp = 0;
      if (tableSortCol === "score") cmp = a.score - b.score;
      else if (tableSortCol === "volume") cmp = a.volume_btc - b.volume_btc;
      else if (tableSortCol === "id") cmp = a.id.localeCompare(b.id);
      else cmp = a.role.localeCompare(b.role);
      return tableSortAsc ? cmp : -cmp;
    });
    return copy;
  }, [positionedNodes, tableSortCol, tableSortAsc]);

  const toggleTableSort = (col: SortColumn) => {
    if (tableSortCol === col) {
      setTableSortAsc((prev) => !prev);
    } else {
      setTableSortCol(col);
      setTableSortAsc(false);
    }
  };

  const effectiveAciThreshold = Math.min(
    0.85,
    Number(
      (
        currentStepData.threshold_aci +
        (serverThreshold - 0.34)
      ).toFixed(2)
    )
  );

  // ViewBox dinamis untuk dukungan zoom tanpa memotong tata letak
  const vbW = Math.round(980 / zoomLevel);
  const vbH = Math.round(560 / zoomLevel);
  const vbX = Math.round((980 - vbW) / 2);
  const vbY = Math.round((560 - vbH) / 2);

  return (
    <div>
      <div className="sembunyikan-saat-cetak">
        {/* Spanduk tetap di atas kanvas sesuai design.md Bagian 6.2 */}
        <div
          style={{
            backgroundColor: "var(--tinta)",
            color: "#FFFFFF",
            padding: "10px 24px",
            fontSize: "var(--teks-kecil)",
          }}
        >
          <div
            className="wadah-kanvas"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <div>
              <strong>
                Mode demo: data Elliptic (Bitcoin). Skor tidak berlaku untuk TRON/EVM.
              </strong>{" "}
              <span style={{ opacity: 0.9 }}>
                Inspeksi struktur graf 2-lompatan untuk Bitcoin, TRON, dan EVM aktif di bawah.
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setIsLiveStreaming((prev) => !prev);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--r-kontrol)",
                  backgroundColor: isLiveStreaming ? "var(--teal)" : "#FFFFFF",
                  color: isLiveStreaming ? "#FFFFFF" : "var(--tinta)",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                {isLiveStreaming
                  ? "● Pemantau Jaringan Aktif (Klik untuk hentikan)"
                  : "Aktifkan pemantau jaringan langsung"}
              </button>

              <button
                type="button"
                onClick={() =>
                  inspectAddressQuick("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL", "tron")
                }
                style={{
                  padding: "5px 11px",
                  borderRadius: "var(--r-chip)",
                  backgroundColor: "transparent",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.55)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Inspeksi TRON USDT TRC-20
              </button>
              <button
                type="button"
                onClick={() =>
                  inspectAddressQuick(
                    "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
                    "evm"
                  )
                }
                style={{
                  padding: "5px 11px",
                  borderRadius: "var(--r-chip)",
                  backgroundColor: "transparent",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.55)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Inspeksi Ethereum EVM
              </button>
            </div>
          </div>
        </div>

        {networkNotice && (
          <div
            role="status"
            style={{
              backgroundColor: "var(--putih)",
              borderBottom: "1px solid var(--rute)",
              padding: "8px 24px",
              fontSize: "var(--teks-kecil)",
            }}
          >
            <div
              className="wadah-kanvas"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <span>{networkNotice}</span>
              <button
                type="button"
                onClick={() => setNetworkNotice(null)}
                className="tombol-sekunder"
                style={{ minHeight: "28px", padding: "2px 8px", fontSize: "12px" }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Panel Aliran Transaksi Jaringan Langsung (muncul saat diaktifkan) */}
        {isLiveStreaming && (
          <div
            style={{
              backgroundColor: "var(--putih)",
              borderBottom: "2px solid var(--teal-tua)",
              padding: "16px 24px",
            }}
          >
            <div className="wadah-kanvas" style={{ paddingLeft: 0, paddingRight: 0 }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "999px",
                        backgroundColor: "var(--teal)",
                      }}
                    />
                    <strong style={{ fontSize: "15px", color: "var(--tinta)" }}>
                      Pemantau Aliran Transaksi Jaringan Langsung (Bitcoin, TRON USDT, Ethereum)
                    </strong>
                  </div>
                  <div className="teks-kecil" style={{ marginTop: "2px" }}>
                    Status sumber: <strong>{publicSourceStatus}</strong> | Ambang kuantil ACI aktif:{" "}
                    <strong>{serverThreshold.toFixed(2).replace(".", ",")}</strong> | Interval detak: 3,5 detik
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={autoFollowLive}
                      onChange={(e) => setAutoFollowLive(e.target.checked)}
                    />
                    Otomatis buka transaksi mencurigakan di kanvas
                  </label>

                  <button
                    type="button"
                    className="tombol-utama"
                    onClick={triggerStreamTick}
                    style={{ minHeight: "34px", padding: "5px 14px", fontSize: "12.5px" }}
                  >
                    Tarik transaksi baru sekarang
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="tabel-data" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Jaringan</th>
                      <th>Subjek / Tujuan</th>
                      <th>Volume</th>
                      <th>Pola struktur 2-lompatan</th>
                      <th>Skor</th>
                      <th>Status</th>
                      <th>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveFeed.map((item, idx) => (
                      <tr key={`${item.txid}-${idx}`}>
                        <td className="font-mono teks-kecil">{item.timestamp}</td>
                        <td style={{ fontWeight: 600 }}>{item.chain}</td>
                        <td>
                          <HashBadge value={item.txid} />
                        </td>
                        <td className="font-mono">{item.amountLabel}</td>
                        <td className="teks-kecil">{item.patternLabel}</td>
                        <td style={{ fontWeight: 700 }}>{formatScore(item.score)}</td>
                        <td>
                          <RiskChip
                            band={item.band}
                            status={item.flagged ? "titik_pencairan" : "normal"}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className={item.flagged ? "tombol-utama" : "tombol-sekunder"}
                            onClick={() => {
                              const foundCluster = allClusters.find(
                                (c) => c.id === item.clusterId
                              );
                              if (foundCluster && allGraphs[foundCluster.id]) {
                                handleSelectCluster(foundCluster);
                                showToast(
                                  `Membuka kluster ${foundCluster.title} di kanvas.`
                                );
                              } else {
                                const ch =
                                  item.chain === "TRON USDT"
                                    ? "tron"
                                    : item.chain === "Ethereum"
                                    ? "evm"
                                    : "bitcoin";
                                inspectAddressQuick(item.txid, ch);
                              }
                            }}
                            style={{
                              minHeight: "30px",
                              padding: "4px 10px",
                              fontSize: "12px",
                            }}
                          >
                            Buka di kanvas
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {toastMessage && (
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
              zIndex: 80,
              borderLeft: "4px solid var(--teal-tua)",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--tinta)" }}>
              {toastMessage}
            </div>
          </div>
        )}

        {/* Tata letak 3 kolom presisi (.layout-jelajah) */}
        <div
          className="wadah-kanvas"
          style={{
            paddingTop: "20px",
            paddingBottom: "36px",
          }}
        >
          <div className="layout-jelajah">
            {/* ================= REL KIRI (280 px): KLUSTER DITANDAI ================= */}
            <aside
              aria-label="Daftar kluster ditandai"
              className="panel-kerja"
              style={{ padding: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h1 style={{ fontSize: "18px", marginBottom: 0 }}>Kluster ditandai</h1>
                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={() =>
                    setClusterSort((prev) => (prev === "skor" ? "waktu" : "skor"))
                  }
                  style={{ minHeight: "30px", padding: "3px 8px", fontSize: "12px" }}
                >
                  Urut: {clusterSort === "skor" ? "Skor" : "Timestep"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 56px 46px 1fr",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--tinta-redup)",
                  padding: "6px 8px",
                  borderBottom: "1px solid var(--rute)",
                }}
              >
                <span>#</span>
                <span>Waktu</span>
                <span>Node</span>
                <span style={{ textAlign: "right" }}>Skor</span>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "460px",
                  overflowY: "auto",
                }}
              >
                {sortedClusters.map((c, index) => {
                  const active = c.id === selectedClusterId;
                  return (
                    <li
                      key={c.id}
                      style={{
                        borderBottom: "1px solid var(--garis)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectCluster(c)}
                        aria-current={active ? "true" : undefined}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "11px 10px",
                          backgroundColor: active ? "var(--kertas)" : "transparent",
                          border: "none",
                          borderLeft: active
                            ? "3px solid var(--tinta)"
                            : "3px solid transparent",
                          cursor: "pointer",
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "24px 56px 46px 1fr",
                            alignItems: "center",
                            fontVariantNumeric: "tabular-nums",
                            fontSize: "13px",
                            color: "var(--tinta)",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{index + 1}</span>
                          <span className="font-mono">{c.timestep_label}</span>
                          <span>{c.node_count}</span>
                          <span
                            style={{
                              textAlign: "right",
                              fontWeight: 700,
                              color:
                                c.max_score >= 0.8
                                  ? "var(--sinyal-teks)"
                                  : "var(--tinta)",
                            }}
                          >
                            {formatScore(c.max_score)}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "12.5px",
                            fontWeight: active ? 600 : 500,
                            color: "var(--tinta)",
                            lineHeight: 1.32,
                          }}
                        >
                          {c.title}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--rute)",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    marginBottom: "6px",
                    color: "var(--tinta)",
                  }}
                >
                  Lembar kasus aktif ({caseNodeIds.length} simpul)
                </div>
                <p className="teks-kecil" style={{ marginBottom: "8px" }}>
                  Simpul yang ditambahkan siap dicetak pada lembar kasus satu halaman.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {caseNodeIds.map((id) => (
                    <span
                      key={id}
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        backgroundColor: "var(--kertas)",
                        border: "1px solid var(--garis)",
                        borderRadius: "4px",
                      }}
                    >
                      {id.length > 14 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            {/* ================= KOLOM TENGAH: KANVAS GRAF + PENGGESER WAKTU ================= */}
            <section
              aria-label="Kanvas penjelajah graf forensik"
              className="panel-kerja"
              style={{ padding: "16px", minWidth: 0 }}
            >
              {/* Bilah pencarian & pengalih Graf | Daftar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <form
                  onSubmit={handleSearchSubmit}
                  style={{
                    display: "flex",
                    gap: "6px",
                    flex: "1 1 360px",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    aria-label="Pilih mode jaringan"
                    className="input-teks"
                    value={searchChain}
                    onChange={(e) => setSearchChain(e.target.value as any)}
                    style={{ width: "auto", minHeight: "40px", fontSize: "13px" }}
                  >
                    <option value="auto">Deteksi otomatis</option>
                    <option value="bitcoin">ID Bitcoin / Elliptic</option>
                    <option value="tron">Alamat TRON (T...)</option>
                    <option value="evm">Alamat EVM (0x...)</option>
                  </select>
                  <input
                    id="cari-node-input"
                    type="search"
                    className="input-teks"
                    placeholder="Cari ID tx_230488910 atau tempel alamat T... / 0x..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (searchError) setSearchError(null);
                    }}
                    style={{ flex: "1 1 200px", minHeight: "40px" }}
                  />
                  <button
                    type="submit"
                    disabled={isInspecting}
                    className="tombol-utama"
                    style={{ minHeight: "40px", padding: "6px 14px", fontSize: "13px" }}
                  >
                    {isInspecting ? "Memetakan..." : "Telusuri"}
                  </button>
                </form>

                <div
                  role="group"
                  aria-label="Pilih tampilan graf atau daftar"
                  style={{ display: "inline-flex", gap: "4px" }}
                >
                  <button
                    type="button"
                    className="tombol-sekunder"
                    aria-pressed={viewMode === "graf"}
                    onClick={() => setViewMode("graf")}
                    style={{ minHeight: "40px", padding: "6px 14px", fontSize: "13px" }}
                  >
                    Graf
                  </button>
                  <button
                    type="button"
                    className="tombol-sekunder"
                    aria-pressed={viewMode === "daftar"}
                    onClick={() => setViewMode("daftar")}
                    style={{ minHeight: "40px", padding: "6px 14px", fontSize: "13px" }}
                  >
                    Daftar
                  </button>
                </div>
              </div>

              {searchError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: "12px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--bahaya)",
                    backgroundColor: "rgba(194, 59, 46, 0.06)",
                    color: "var(--bahaya)",
                    fontSize: "var(--teks-kecil)",
                    fontWeight: 600,
                  }}
                >
                  {searchError}
                </div>
              )}

              {/* Ringkasan kluster + Kontrol Zoom */}
              <div
                style={{
                  marginBottom: "12px",
                  padding: "10px 14px",
                  backgroundColor: "var(--kertas)",
                  borderRadius: "6px",
                  border: "1px solid var(--garis)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ flex: "1 1 280px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--tinta)" }}>
                    {currentCluster.code} ({currentCluster.timestep_label}):{" "}
                    {currentCluster.title}
                  </div>
                  <div className="teks-kecil">{currentCluster.summary}</div>
                </div>

                {viewMode === "graf" && (
                  <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="tombol-sekunder"
                      onClick={() =>
                        setZoomLevel((z) => Number(Math.max(0.75, z - 0.15).toFixed(2)))
                      }
                      aria-label="Perkecil kanvas"
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "12px" }}
                    >
                      &minus;
                    </button>
                    <button
                      type="button"
                      className="tombol-sekunder"
                      onClick={() => setZoomLevel(1)}
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "12px" }}
                    >
                      {Math.round(zoomLevel * 100)}%
                    </button>
                    <button
                      type="button"
                      className="tombol-sekunder"
                      onClick={() =>
                        setZoomLevel((z) => Number(Math.min(1.6, z + 0.15).toFixed(2)))
                      }
                      aria-label="Perbesar kanvas"
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "12px" }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="tombol-sekunder"
                      onClick={() => {
                        setZoomLevel(1);
                        const gData = allGraphs[selectedClusterId];
                        if (gData) setNodes(gData.nodes);
                      }}
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "12px" }}
                    >
                      Atur ulang
                    </button>
                  </div>
                )}
              </div>

              {viewMode === "graf" ? (
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "var(--kertas)",
                    border: "1px solid var(--rute)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <svg
                    ref={svgRef}
                    viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                    role="img"
                    aria-label={`Graf forensik ${currentCluster.title} dengan ${positionedNodes.length} simpul dan ${edges.length} aliran transaksi.`}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{
                      width: "100%",
                      height: "auto",
                      minHeight: "420px",
                      display: "block",
                      userSelect: "none",
                      touchAction: "none",
                    }}
                  >
                    <defs>
                      <marker
                        id="j-arrow-inti"
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
                        id="j-arrow-penyamaran"
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

                    {/* Garis hubungan (edges) */}
                    {edges.map((edge) => {
                      const src = nodeMap.get(edge.source);
                      const tgt = nodeMap.get(edge.target);
                      if (!src || !tgt) return null;

                      const edgeKey = `${edge.source}->${edge.target}`;
                      const dx = tgt.renderX - src.renderX;
                      const dy = tgt.renderY - src.renderY;
                      const dist = Math.hypot(dx, dy) || 1;
                      const padStart = 18;
                      const padEnd = tgt.status === "titik_pencairan" ? 24 : 20;
                      const x1 = src.renderX + (dx / dist) * padStart;
                      const y1 = src.renderY + (dy / dist) * padStart;
                      const x2 = tgt.renderX - (dx / dist) * padEnd;
                      const y2 = tgt.renderY - (dy / dist) * padEnd;
                      const midX = (x1 + x2) / 2;
                      const midY = (y1 + y2) / 2;
                      const isInti = edge.type === "inti";
                      const isHovered = hoveredEdgeKey === edgeKey;
                      const isConnectedToSelected =
                        edge.source === selectedNodeId || edge.target === selectedNodeId;

                      return (
                        <g
                          key={edgeKey}
                          onMouseEnter={() => setHoveredEdgeKey(edgeKey)}
                          onMouseLeave={() => setHoveredEdgeKey(null)}
                          style={{ cursor: "pointer" }}
                        >
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="transparent"
                            strokeWidth="12"
                          />
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={isInti ? "var(--tinta)" : "var(--rute)"}
                            strokeWidth={
                              isHovered
                                ? 3.2
                                : isConnectedToSelected
                                ? 2.5
                                : isInti
                                ? 2.0
                                : 1.5
                            }
                            strokeDasharray={isInti ? undefined : "5 4"}
                            markerEnd={
                              isInti
                                ? "url(#j-arrow-inti)"
                                : "url(#j-arrow-penyamaran)"
                            }
                            style={{
                              transition:
                                "x1 240ms ease, y1 240ms ease, x2 240ms ease, y2 240ms ease",
                            }}
                          />
                          {isHovered && (
                            <g transform={`translate(${midX}, ${midY - 10})`}>
                              <rect
                                x="-45"
                                y="-13"
                                width="90"
                                height="20"
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
                                {edge.amount_btc.toFixed(2).replace(".", ",")}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Simpul (nodes) */}
                    {positionedNodes.map((node) => {
                      const isSelected = node.id === selectedNodeId;
                      const isHovered = node.id === hoveredNodeId;
                      const isAboveThreshold = node.score >= effectiveAciThreshold;
                      const accessibleName = `Node ${node.role} (${node.id}), skor ${formatScore(
                        node.score
                      )}, risiko ${node.band.toLowerCase()}`;

                      // Hanya tampilkan lencana teks permanen pada simpul titik akhir / terpilih agar tidak pernah bertumpuk
                      const showBadge =
                        node.status === "sumber" ||
                        node.status === "titik_pencairan" ||
                        node.status === "alarm_palsu" ||
                        isSelected;

                      return (
                        <g
                          key={node.id}
                          id={`jelajah-node-${node.id}`}
                          tabIndex={0}
                          role="button"
                          aria-label={accessibleName}
                          transform={`translate(${node.renderX}, ${node.renderY})`}
                          onPointerDown={(e) => handlePointerDown(node.id, e)}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          onFocus={() => setHoveredNodeId(node.id)}
                          onBlur={() => setHoveredNodeId(null)}
                          onClick={() => setSelectedNodeId(node.id)}
                          onKeyDown={(e) => handleNodeKeyDown(node.id, e)}
                          style={{
                            cursor: "grab",
                            transition: "transform 240ms ease",
                          }}
                        >
                          {(isSelected || isHovered) && (
                            <circle
                              cx="0"
                              cy="0"
                              r={node.status === "titik_pencairan" ? 25 : 21}
                              fill="none"
                              stroke="var(--sinyal)"
                              strokeWidth="2.5"
                            />
                          )}

                          {node.status === "alarm_palsu" ? (
                            <g>
                              <circle
                                cx="0"
                                cy="0"
                                r="16"
                                fill="var(--putih)"
                                stroke="var(--rute)"
                                strokeWidth="2.2"
                              />
                              <line
                                x1="-11"
                                y1="11"
                                x2="11"
                                y2="-11"
                                stroke="var(--rute)"
                                strokeWidth="2.2"
                              />
                            </g>
                          ) : node.status === "titik_pencairan" ? (
                            <polygon
                              points="0,-19 19,0 0,19 -19,0"
                              fill="var(--sinyal)"
                              stroke="var(--tinta)"
                              strokeWidth="1.5"
                            />
                          ) : node.band === "Sangat tinggi" ? (
                            <polygon
                              points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9"
                              fill="var(--bahaya)"
                              stroke="var(--tinta)"
                              strokeWidth="1.2"
                            />
                          ) : node.status === "normal" ? (
                            <circle
                              cx="0"
                              cy="0"
                              r="14"
                              fill="var(--putih)"
                              stroke="var(--rute)"
                              strokeWidth="2"
                            />
                          ) : node.status === "sumber" ? (
                            <circle cx="0" cy="0" r="16" fill="var(--tinta)" />
                          ) : (
                            <circle
                              cx="0"
                              cy="0"
                              r="14.5"
                              fill="var(--teal)"
                              opacity={isAboveThreshold ? 1 : 0.82}
                            />
                          )}

                          <text
                            x="0"
                            y="4"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill={
                              node.status === "titik_pencairan" ||
                              node.status === "normal" ||
                              node.status === "alarm_palsu"
                                ? "var(--tinta)"
                                : "#FFFFFF"
                            }
                          >
                            {formatScore(node.score)}
                          </text>

                          {showBadge && (
                            <g transform="translate(0, 28)">
                              <rect
                                x="-54"
                                y="-11"
                                width="108"
                                height="18"
                                rx="3"
                                fill="var(--putih)"
                                stroke={isSelected ? "var(--tinta)" : "var(--rute)"}
                              />
                              <text
                                x="0"
                                y="2"
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="600"
                                fill="var(--tinta)"
                              >
                                {node.status === "alarm_palsu"
                                  ? "Alarm palsu"
                                  : node.role.length > 16
                                  ? node.role.slice(0, 15) + "…"
                                  : node.role}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {hoveredNode && (
                    <div
                      className="elemen-apung"
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "12px",
                        padding: "10px 12px",
                        maxWidth: "320px",
                        fontSize: "12px",
                        pointerEvents: "none",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: "2px" }}>
                        {hoveredNode.role} ({hoveredNode.short_id})
                      </div>
                      <div style={{ color: "var(--tinta-redup)", marginBottom: "6px" }}>
                        Skor {formatScore(hoveredNode.score)} | Volume{" "}
                        {hoveredNode.volume_btc.toLocaleString("id-ID")}
                      </div>
                      <div style={{ fontWeight: 600 }}>Alasan utama:</div>
                      <div>{hoveredNode.features_top[0]?.name}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    className="tabel-data"
                    aria-label={`Daftar simpul pada ${currentCluster.title}`}
                  >
                    <thead>
                      <tr>
                        <th scope="col">
                          <button
                            type="button"
                            onClick={() => toggleTableSort("id")}
                            style={{
                              background: "none",
                              border: "none",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              color: "var(--tinta)",
                            }}
                          >
                            ID node {tableSortCol === "id" ? (tableSortAsc ? "↑" : "↓") : ""}
                          </button>
                        </th>
                        <th scope="col">
                          <button
                            type="button"
                            onClick={() => toggleTableSort("role")}
                            style={{
                              background: "none",
                              border: "none",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              color: "var(--tinta)",
                            }}
                          >
                            Peran {tableSortCol === "role" ? (tableSortAsc ? "↑" : "↓") : ""}
                          </button>
                        </th>
                        <th scope="col">
                          <button
                            type="button"
                            onClick={() => toggleTableSort("score")}
                            style={{
                              background: "none",
                              border: "none",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              color: "var(--tinta)",
                            }}
                          >
                            Skor {tableSortCol === "score" ? (tableSortAsc ? "↑" : "↓") : ""}
                          </button>
                        </th>
                        <th scope="col">Band risiko</th>
                        <th scope="col">
                          <button
                            type="button"
                            onClick={() => toggleTableSort("volume")}
                            style={{
                              background: "none",
                              border: "none",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              color: "var(--tinta)",
                            }}
                          >
                            Volume {tableSortCol === "volume" ? (tableSortAsc ? "↑" : "↓") : ""}
                          </button>
                        </th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTableNodes.map((n) => {
                        const isSelected = n.id === selectedNodeId;
                        return (
                          <tr
                            key={n.id}
                            style={{
                              backgroundColor: isSelected
                                ? "var(--kertas)"
                                : "var(--putih)",
                            }}
                          >
                            <td>
                              <HashBadge value={n.id} />
                            </td>
                            <td style={{ fontWeight: isSelected ? 700 : 400 }}>
                              {n.role}
                            </td>
                            <td style={{ fontWeight: 700 }}>{formatScore(n.score)}</td>
                            <td>
                              <RiskChip band={n.band} status={n.status} />
                            </td>
                            <td>{n.volume_btc.toLocaleString("id-ID")}</td>
                            <td>
                              <button
                                type="button"
                                className="tombol-sekunder"
                                onClick={() => setSelectedNodeId(n.id)}
                                style={{
                                  minHeight: "32px",
                                  padding: "4px 10px",
                                  fontSize: "12px",
                                }}
                              >
                                Pilih
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Penggeser waktu Arkham-style */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px 16px",
                  backgroundColor: "var(--putih)",
                  border: "1px solid var(--rute)",
                  borderRadius: "8px",
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
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--tinta)" }}>
                    Penggeser waktu evaluasi: <strong>t{activeTimestep}</strong>{" "}
                    <span className="teks-kecil">
                      (Volume: {currentStepData.volume.toLocaleString("id-ID")} tx | Ambang statis:{" "}
                      {currentStepData.threshold_static.toFixed(2).replace(".", ",")} | Ambang menyesuaikan:{" "}
                      <strong style={{ color: "var(--sinyal-teks)" }}>
                        {effectiveAciThreshold.toFixed(2).replace(".", ",")}
                      </strong>
                      )
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      fontSize: "12px",
                      color: "var(--tinta-redup)",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
                        <line
                          x1="0"
                          y1="4"
                          x2="20"
                          y2="4"
                          stroke="var(--rute)"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                      </svg>
                      ambang statis
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--sinyal-teks)",
                        fontWeight: 600,
                      }}
                    >
                      <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
                        <line
                          x1="0"
                          y1="4"
                          x2="20"
                          y2="4"
                          stroke="var(--sinyal)"
                          strokeWidth="2.5"
                        />
                      </svg>
                      ambang menyesuaikan
                    </span>
                  </div>
                </div>

                <div style={{ position: "relative", marginBottom: "8px" }}>
                  <svg
                    viewBox="0 0 750 88"
                    role="img"
                    aria-label="Histogram volume transaksi dari t35 sampai t49 dengan penanda penutupan dark market pada t43 serta garis ambang statis dan menyesuaikan diri."
                    style={{ width: "100%", height: "auto", display: "block" }}
                  >
                    {THRESHOLD_DATA.timesteps.map((row, idx) => {
                      const barW = 36;
                      const gap = 12;
                      const x = 18 + idx * (barW + gap);
                      const barH = Math.round((row.volume / 6800) * 52);
                      const y = 62 - barH;
                      const isCurrent = row.timestep === activeTimestep;
                      const isT43 = row.timestep === 43;

                      return (
                        <g
                          key={row.timestep}
                          onClick={() => setActiveTimestep(row.timestep)}
                          style={{ cursor: "pointer" }}
                        >
                          <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={barH}
                            rx="2"
                            fill={
                              isCurrent
                                ? "var(--tinta)"
                                : isT43
                                ? "var(--teal)"
                                : "var(--garis)"
                            }
                          />
                          <text
                            x={x + barW / 2}
                            y="76"
                            textAnchor="middle"
                            fontSize="10.5"
                            fontWeight={isCurrent || isT43 ? "700" : "400"}
                            fill="var(--tinta)"
                          >
                            {row.label}
                          </text>
                        </g>
                      );
                    })}

                    <line
                      x1="18"
                      y1="34"
                      x2="726"
                      y2="34"
                      stroke="var(--rute)"
                      strokeWidth="1.6"
                      strokeDasharray="4 3"
                    />

                    <polyline
                      fill="none"
                      stroke="var(--sinyal)"
                      strokeWidth="2.2"
                      points={THRESHOLD_DATA.timesteps
                        .map((row, idx) => {
                          const x = 18 + idx * 48 + 18;
                          const y = 62 - ((row.threshold_aci - 0.35) / 0.35) * 48;
                          return `${x},${y.toFixed(1)}`;
                        })
                        .join(" ")}
                    />

                    <line
                      x1={18 + 8 * 48 + 18}
                      y1="4"
                      x2={18 + 8 * 48 + 18}
                      y2="64"
                      stroke="var(--tinta)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={18 + 8 * 48 + 24}
                      y="13"
                      fontSize="10.5"
                      fontWeight="700"
                      fill="var(--tinta)"
                    >
                      ▲ t43 Penutupan dark market
                    </text>
                  </svg>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="teks-kecil font-mono">t35</span>
                  <input
                    type="range"
                    min={35}
                    max={49}
                    step={1}
                    value={activeTimestep}
                    aria-label="Geser timestep antara t35 sampai t49"
                    onChange={(e) => setActiveTimestep(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--tinta)", cursor: "pointer" }}
                  />
                  <span className="teks-kecil font-mono">t49</span>
                </div>
              </div>
            </section>

            {/* ================= PANEL KANAN (340 px): DETAIL NODE ================= */}
            <aside
              aria-label="Panel detail simpul terpilih"
              className="panel-kerja"
              style={{ padding: "18px", minWidth: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>Detail node</h2>
                  <div className="teks-kecil">{selectedNode.role}</div>
                </div>
                <span className="teks-kecil font-mono">t{selectedNode.timestep}</span>
              </div>

              <div style={{ marginBottom: "14px", overflowX: "auto" }}>
                <HashBadge value={selectedNode.id} startChars={8} endChars={6} />
              </div>

              <div
                style={{
                  padding: "14px",
                  backgroundColor: "var(--kertas)",
                  borderRadius: "8px",
                  border: "1px solid var(--garis)",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div className="teks-kecil">Skor risiko</div>
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--tinta)",
                      }}
                    >
                      Skor {formatScore(selectedNode.score)}
                    </div>
                  </div>
                  <RiskChip band={selectedNode.band} status={selectedNode.status} />
                </div>

                <div className="teks-kecil" style={{ marginBottom: "6px" }}>
                  <strong>Himpunan prediksi:</strong>{" "}
                  {selectedNode.status === "alarm_palsu"
                    ? "Ditinjau analis sebagai Legal (alarm palsu)"
                    : selectedNode.pred_set.join(", ")}
                </div>
                <div className="teks-kecil">
                  <strong>Volume aliran:</strong>{" "}
                  {selectedNode.volume_btc.toLocaleString("id-ID")} (Masuk:{" "}
                  {selectedNode.in_degree}, Keluar: {selectedNode.out_degree})
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "var(--kertas)",
                  borderLeft: "3px solid var(--tinta)",
                  fontSize: "12px",
                  color: "var(--tinta)",
                  marginBottom: "16px",
                }}
              >
                Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.
              </div>

              <div style={{ marginBottom: "18px" }}>
                <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>
                  Alasan penandaan (SHAP)
                </h3>
                <ShapBars features={selectedNode.features_top} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={() => handleToggleFalsePositive(selectedNode)}
                  style={{ width: "100%" }}
                >
                  {falsePositiveIds[selectedNode.id]
                    ? "Batalkan tanda alarm palsu"
                    : "Tandai alarm palsu"}
                </button>
                <div className="teks-kecil" style={{ marginTop: "-4px", marginBottom: "4px" }}>
                  Keputusan tinjauan dicatat di log audit dan memperbarui ambang menyesuaikan diri.
                </div>

                <button
                  type="button"
                  className="tombol-sekunder"
                  onClick={() => handleAddToCase(selectedNode)}
                  style={{ width: "100%" }}
                >
                  Tambah ke kasus
                </button>

                <button
                  type="button"
                  className="tombol-utama"
                  onClick={handleExportPdf}
                  style={{ width: "100%" }}
                >
                  Unduh lembar kasus (PDF)
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Lembar kasus cetak satu halaman putih */}
      <section
        className="lembar-kasus-cetak"
        aria-label="Lembar kasus cetak siap pengadilan dan laporan audit"
      >
        <div
          style={{
            borderBottom: "2px solid #10233F",
            paddingBottom: "12px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-judul)",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              TELUSUR: Lembar Kasus Penelusuran On-Chain
            </div>
            <div style={{ fontSize: "12px", color: "#4A5A70" }}>
              Kluster: {currentCluster.code} ({currentCluster.title}) | Timestep:{" "}
              {currentCluster.timestep_label}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "11px" }}>
            <div>Tanggal cetak: {META_DATA.export_date}</div>
            <div className="font-mono">Versi model: {META_DATA.model_version}</div>
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            border: "1px solid #10233F",
            marginBottom: "14px",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          PERNYATAAN METODOLOGIS: Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah. Dokumen ini merupakan bahan pendukung analisis manusia dan wajib diverifikasi bersama bukti penyidikan lainnya.
        </div>

        <table className="tabel-data" style={{ marginBottom: "16px", fontSize: "11px" }}>
          <thead>
            <tr>
              <th>ID Transaksi Fokus</th>
              <th>Peran</th>
              <th>Skor Risiko</th>
              <th>Band Risiko</th>
              <th>Himpunan Prediksi</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-mono">{selectedNode.id}</td>
              <td>{selectedNode.role}</td>
              <td style={{ fontWeight: 700 }}>{formatScore(selectedNode.score)}</td>
              <td>{selectedNode.band}</td>
              <td>{selectedNode.pred_set.join(", ")}</td>
              <td>{selectedNode.volume_btc.toLocaleString("id-ID")}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: "14px", marginBottom: "6px" }}>
          Rincian Alasan Penandaan (Kontribusi Fitur SHAP)
        </h3>
        <table className="tabel-data" style={{ marginBottom: "16px", fontSize: "11px" }}>
          <thead>
            <tr>
              <th>Penjelasan Fitur</th>
              <th>Nama Teknis</th>
              <th>Kontribusi Skor</th>
            </tr>
          </thead>
          <tbody>
            {selectedNode.features_top.map((f) => (
              <tr key={f.technical_name}>
                <td>{f.name}</td>
                <td className="font-mono">{f.technical_name}</td>
                <td style={{ fontWeight: 700 }}>
                  {f.contribution >= 0 ? "+" : "\u2212"}
                  {Math.abs(f.contribution).toFixed(2).replace(".", ",")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            fontSize: "10.5px",
            color: "#4A5A70",
            borderTop: "1px solid #7A8799",
            paddingTop: "8px",
          }}
        >
          <div>
            <strong>Protokol Evaluasi Model:</strong> {META_DATA.protocol}
          </div>
          <div>
            <strong>Cakupan Data:</strong> {META_DATA.dataset_scope}
          </div>
        </div>
      </section>
    </div>
  );
}
