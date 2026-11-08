import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const chain = req.nextUrl.searchParams.get("chain") ?? "bitcoin";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    if (chain === "bitcoin") {
      const res = await fetch("https://mempool.space/api/mempool/recent", {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          source: "mempool.space (live)",
          live: true,
          transactions: (data as any[]).slice(0, 6).map((tx) => ({
            txid: tx.txid,
            valueBtc: Number(((tx.value ?? 0) / 1e8).toFixed(4)),
            feeSat: tx.fee,
            vsize: tx.vsize,
          })),
        });
      }
    } else if (chain === "tron") {
      const res = await fetch(
        "https://apilist.tronscanapi.com/api/transaction?sort=-timestamp&count=true&limit=6&start=0",
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          source: "tronscan.org (live)",
          live: true,
          transactions: ((data?.data as any[]) ?? []).slice(0, 6).map((tx) => ({
            txid: tx.hash,
            from: tx.ownerAddress,
            to: tx.toAddress,
            block: tx.block,
          })),
        });
      }
    }
  } catch {
    clearTimeout(timeout);
  }

  return NextResponse.json({
    source: "simulasi-lokal-tahan-gangguan",
    live: false,
    transactions: [],
  });
}

