import { NextResponse } from "next/server";
import { META_DATA } from "@/lib/demo-data";
import { getRuntimeState } from "@/lib/server-store";

export async function GET() {
  const state = getRuntimeState();
  return NextResponse.json({
    organization: "Bursa Aset Kripto Nusantara (Sandbox)",
    plan_quota_monthly: 50000,
    used_calls: 14280 + (state.liveCounter ?? 0),
    remaining_calls: Math.max(0, 50000 - (14280 + (state.liveCounter ?? 0))),
    active_threshold: state.currentThreshold,
    model_version: META_DATA.model_version,
  });
}

