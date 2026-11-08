import { NextRequest, NextResponse } from "next/server";
import {
  GRAPHS_BY_CLUSTER,
  META_DATA,
  validateWalletOrNodeInput,
} from "@/lib/demo-data";
import {
  buildDynamicAddressCluster,
  getRuntimeState,
  saveRuntimeState,
} from "@/lib/server-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const chain = String(body?.chain ?? "bitcoin-elliptic")
      .trim()
      .toLowerCase();
    const subject = String(body?.subject ?? "").trim();

    if (chain === "tron") {
      const check = validateWalletOrNodeInput(subject, "tron");
      if (!check.valid) {
        return NextResponse.json(
          { error: "invalid_address", message: check.error },
          { status: 400 }
        );
      }

      const state = getRuntimeState();
      const built = buildDynamicAddressCluster(subject, "tron");
      const sinkNode =
        built.graph.nodes.find((n) => n.id === built.cluster.focal_node_id) ??
        built.graph.nodes[built.graph.nodes.length - 1];

      if (!state.customClusters.some((c) => c.id === built.cluster.id)) {
        state.customClusters.unshift(built.cluster);
      }
      state.customGraphs[built.cluster.id] = built.graph;
      saveRuntimeState(state);

      return NextResponse.json({
        subject: sinkNode.id,
        chain: "tron",
        network: "TRON USDT TRC-20",
        score: sinkNode.score,
        band: sinkNode.band,
        prediction_set: sinkNode.pred_set,
        threshold: state.currentThreshold,
        cluster_id: built.cluster.id,
        model_version: META_DATA.model_version,
        as_of: new Date().toISOString(),
        notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
        explanation: sinkNode.features_top.map((f) => ({
          feature: f.technical_name,
          description_id: f.name,
          contribution: f.contribution,
        })),
      });
    }

    if (chain === "evm") {
      const check = validateWalletOrNodeInput(subject, "evm");
      if (!check.valid) {
        return NextResponse.json(
          { error: "invalid_address", message: check.error },
          { status: 400 }
        );
      }

      const state = getRuntimeState();
      const built = buildDynamicAddressCluster(subject, "evm");
      const sinkNode =
        built.graph.nodes.find((n) => n.id === built.cluster.focal_node_id) ??
        built.graph.nodes[built.graph.nodes.length - 1];

      if (!state.customClusters.some((c) => c.id === built.cluster.id)) {
        state.customClusters.unshift(built.cluster);
      }
      state.customGraphs[built.cluster.id] = built.graph;
      saveRuntimeState(state);

      return NextResponse.json({
        subject: sinkNode.id,
        chain: "evm",
        network: "Ethereum EVM",
        score: sinkNode.score,
        band: sinkNode.band,
        prediction_set: sinkNode.pred_set,
        threshold: state.currentThreshold,
        cluster_id: built.cluster.id,
        model_version: META_DATA.model_version,
        as_of: new Date().toISOString(),
        notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
        explanation: sinkNode.features_top.map((f) => ({
          feature: f.technical_name,
          description_id: f.name,
          contribution: f.contribution,
        })),
      });
    }

    const nodeCheck = validateWalletOrNodeInput(subject, "node");
    if (!nodeCheck.valid) {
      return NextResponse.json(
        { error: "invalid_subject", message: nodeCheck.error },
        { status: 400 }
      );
    }

    const state = getRuntimeState();
    const allGraphs = [
      ...Object.values(GRAPHS_BY_CLUSTER),
      ...Object.values(state.customGraphs ?? {}),
    ];

    for (const clusterGraph of allGraphs) {
      const node = clusterGraph.nodes.find((n) => n.id === subject);
      if (node) {
        return NextResponse.json({
          subject: node.id,
          chain: "bitcoin-elliptic",
          score: node.score,
          band: node.band,
          prediction_set: node.pred_set,
          threshold: state.currentThreshold,
          model_version: META_DATA.model_version,
          as_of: `t${node.timestep} (${META_DATA.export_date})`,
          notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
          explanation: node.features_top.map((f) => ({
            feature: f.technical_name,
            description_id: f.name,
            contribution: f.contribution,
          })),
        });
      }
    }

    // Jika alamat Bitcoin baru (mis. bc1q...), bangun kluster 2-lompatan secara dinamis
    const built = buildDynamicAddressCluster(subject, "bitcoin");
    const sinkNode =
      built.graph.nodes.find((n) => n.id === built.cluster.focal_node_id) ??
      built.graph.nodes[built.graph.nodes.length - 1];

    return NextResponse.json({
      subject: sinkNode.id,
      chain: "bitcoin-elliptic",
      score: sinkNode.score,
      band: sinkNode.band,
      prediction_set: sinkNode.pred_set,
      threshold: state.currentThreshold,
      cluster_id: built.cluster.id,
      model_version: META_DATA.model_version,
      as_of: new Date().toISOString(),
      notice: "Ditandai untuk ditinjau. Skor risiko bukan bukti bersalah.",
      explanation: sinkNode.features_top.map((f) => ({
        feature: f.technical_name,
        description_id: f.name,
        contribution: f.contribution,
      })),
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
