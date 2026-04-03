import { NextResponse } from "next/server";

export const revalidate = 15; // ISR: revalidate every 15 seconds

const SYMBOLS = [
  { id: "^JKSE", label: "IHSG" },
  { id: "BBCA.JK", label: "BBCA" },
  { id: "BBRI.JK", label: "BBRI" },
  { id: "BMRI.JK", label: "BMRI" },
  { id: "TLKM.JK", label: "TLKM" },
  { id: "ASII.JK", label: "ASII" },
  { id: "UNVR.JK", label: "UNVR" },
  { id: "GOTO.JK", label: "GOTO" },
  { id: "USDIDR=X", label: "USD/IDR" },
  { id: "GC=F", label: "EMAS" },
  { id: "CL=F", label: "MINYAK" },
  { id: "BTC-USD", label: "BTC" },
];

export async function GET() {
  try {
    const ids = SYMBOLS.map((s) => s.id).join(",");
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/spark?symbols=${ids}&range=1d&interval=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Kartawarta/1.0)" },
        next: { revalidate: 15 },
      }
    );

    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);

    const data = await res.json();

    const stocks = SYMBOLS.map((s) => {
      const q = data[s.id];
      if (!q) return null;
      const close = q.close?.[q.close.length - 1] || 0;
      const prev = q.chartPreviousClose || close;
      const change = close - prev;
      const pct = prev > 0 ? (change / prev) * 100 : 0;
      return {
        symbol: s.label,
        price: close,
        prevClose: prev,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(pct * 100) / 100,
        direction: change > 0.001 ? "up" : change < -0.001 ? "down" : "flat",
      };
    }).filter(Boolean);

    return NextResponse.json({ data: stocks, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ data: [], error: String(e) }, { status: 500 });
  }
}
