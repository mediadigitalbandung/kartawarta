"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/* ── Types ── */
interface TickerItem { title: string; href: string; hot?: boolean; category?: string | null }
interface StockItem {
  symbol: string; price: number; prevClose: number;
  change: number; changePercent: number; direction: "up" | "down" | "flat";
}

/* ── Stock symbols ── */
const SYMBOLS = [
  { id: "^JKSE", label: "IHSG" }, { id: "BBCA.JK", label: "BBCA" },
  { id: "BBRI.JK", label: "BBRI" }, { id: "BMRI.JK", label: "BMRI" },
  { id: "TLKM.JK", label: "TLKM" }, { id: "ASII.JK", label: "ASII" },
  { id: "UNVR.JK", label: "UNVR" }, { id: "GOTO.JK", label: "GOTO" },
  { id: "USDIDR=X", label: "USD/IDR" }, { id: "GC=F", label: "EMAS" },
  { id: "CL=F", label: "MINYAK" }, { id: "BTC-USD", label: "BTC" },
];

function fmtPrice(p: number, sym: string): string {
  if (sym === "BTC") return "$" + p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (sym === "EMAS" || sym === "MINYAK") return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (sym === "USD/IDR") return "Rp " + p.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  if (p >= 1000) return p.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  return p.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Hooks ── */
function useStocks() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState("");

  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch("/api/stocks", { cache: "no-store" });
      if (!res.ok) throw new Error("err");
      const json = await res.json();
      const data = json.data || [];
      if (data.length > 0) {
        setStocks(data.map((s: StockItem) => ({
          ...s,
          direction: s.change > 0.001 ? "up" as const : s.change < -0.001 ? "down" as const : "flat" as const,
        })));
        setLastUpdate(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch { /* keep existing */ }
  }, []);

  useEffect(() => { fetchStocks(); const i = setInterval(fetchStocks, 15000); return () => clearInterval(i); }, [fetchStocks]);
  return { stocks, lastUpdate };
}

function useTrending() {
  const [items, setItems] = useState<TickerItem[]>([]);
  useEffect(() => {
    fetch("/api/trending").then((r) => r.json()).then((json) => {
      const data = json.data || json || [];
      if (Array.isArray(data) && data.length > 0) {
        setItems(data.map((t: { label?: string; href?: string; hot?: boolean; category?: string }) => ({
          title: t.label || "", href: t.href || "/search", hot: t.hot || false, category: t.category || null,
        })));
      }
    }).catch(() => {});
  }, []);
  return items;
}

/* ── Stock Card ── */
function StockCard({ s }: { s: StockItem }) {
  return (
    <div className={`shrink-0 rounded-[12px] px-4 py-3 min-w-[150px] sm:min-w-[165px] border ${
      s.direction === "up" ? "bg-emerald-50/50 border-emerald-100/50" : s.direction === "down" ? "bg-red-50/50 border-red-100/50" : "bg-gray-50/50 border-gray-100"
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label-md font-bold text-gray-600">{s.symbol}</span>
        {s.direction === "up" ? <ArrowUpRight size={16} className="text-emerald-500" /> :
         s.direction === "down" ? <ArrowDownRight size={16} className="text-red-500" /> :
         <Minus size={14} className="text-gray-400" />}
      </div>
      <div className="text-title-lg font-mono font-bold text-gray-900 leading-none">{fmtPrice(s.price, s.symbol)}</div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className={`text-label-md font-mono font-semibold ${
          s.direction === "up" ? "text-emerald-600" : s.direction === "down" ? "text-red-600" : "text-gray-500"
        }`}>{s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}</span>
        <span className={`text-label-sm font-mono ${
          s.direction === "up" ? "text-emerald-500" : s.direction === "down" ? "text-red-500" : "text-gray-400"
        }`}>({s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%)</span>
      </div>
    </div>
  );
}

/* ── Stock Carousel — CSS animation infinite loop ── */
function StockCarousel({ stocks, lastUpdate }: { stocks: StockItem[]; lastUpdate: string }) {
  const [paused, setPaused] = useState(false);

  if (stocks.length === 0) return null;

  // Total animation duration based on number of cards
  const duration = stocks.length * 15; // slow: ~15s per card

  return (
    <div
      className="bg-white border-b border-gray-100 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-main py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-label-md font-bold uppercase tracking-widest text-gray-500">Market</span>
            <span className="hidden sm:inline text-label-sm text-gray-400">Live</span>
          </div>
          {lastUpdate && <span className="text-label-sm text-gray-400 font-mono">Update {lastUpdate} WIB</span>}
        </div>
      </div>

      {/* Infinite CSS scroll — two identical sets side by side */}
      <div className="relative">
        <div
          className="flex gap-2.5 w-max"
          style={{
            animation: `stockScroll ${duration}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {/* Set 1 */}
          <div className="flex gap-2.5 pl-5 sm:pl-8">
            {stocks.map((s) => <StockCard key={`a-${s.symbol}`} s={s} />)}
          </div>
          {/* Set 2 (duplicate for seamless loop) */}
          <div className="flex gap-2.5">
            {stocks.map((s) => <StockCard key={`b-${s.symbol}`} s={s} />)}
          </div>
        </div>
      </div>

      <div className="h-3" />

      <style jsx>{`
        @keyframes stockScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ── Main Component ── */
export default function NewsTicker() {
  const trendingItems = useTrending();
  const { stocks, lastUpdate } = useStocks();

  // Trending: duplicate for CSS infinite scroll
  const looped = trendingItems.length > 0 ? [...trendingItems, ...trendingItems] : [];
  const trendDuration = Math.max(trendingItems.length * 10, 60); // slow: ~10s per tag

  return (
    <>
      {/* ═══ MARKET CAROUSEL ═══ */}
      <StockCarousel stocks={stocks} lastUpdate={lastUpdate} />

      {/* ═══ TRENDING INDONESIA ═══ */}
      {looped.length > 0 && (
        <div className="bg-surface-container-lowest overflow-hidden">
          <div className="flex items-center py-2.5">
            <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 z-10 bg-surface-container-lowest">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse shrink-0" />
              <span className="text-label-md font-bold tracking-widest text-secondary uppercase whitespace-nowrap">
                Trending
              </span>
            </div>

            {/* CSS infinite scroll */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex w-max hover:[animation-play-state:paused]"
                style={{ animation: `trendScroll ${trendDuration}s linear infinite` }}
              >
                {/* Set 1 */}
                <div className="flex items-center">
                  {trendingItems.map((item, i) => (
                    <Link key={`a-${i}`} href={item.href}
                      className="mx-3 sm:mx-5 inline-flex items-center gap-2 text-body-md font-medium text-on-surface/60 hover:text-primary whitespace-nowrap transition-colors">
                      {item.hot && (
                        <span className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wider">HOT</span>
                      )}
                      {item.category && (
                        <span className="text-label-sm font-bold text-primary/60 uppercase tracking-wider">{item.category}</span>
                      )}
                      <span className="h-1 w-1 rounded-full bg-on-surface-variant/20 shrink-0" />
                      {item.title}
                    </Link>
                  ))}
                </div>
                {/* Set 2 */}
                <div className="flex items-center">
                  {trendingItems.map((item, i) => (
                    <Link key={`b-${i}`} href={item.href}
                      className="mx-3 sm:mx-5 inline-flex items-center gap-2 text-body-md font-medium text-on-surface/60 hover:text-primary whitespace-nowrap transition-colors">
                      {item.hot && (
                        <span className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wider">HOT</span>
                      )}
                      {item.category && (
                        <span className="text-label-sm font-bold text-primary/60 uppercase tracking-wider">{item.category}</span>
                      )}
                      <span className="h-1 w-1 rounded-full bg-on-surface-variant/20 shrink-0" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes trendScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
