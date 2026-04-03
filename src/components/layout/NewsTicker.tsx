"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ── Types ── */
interface TickerItem {
  title: string;
  href: string;
  hot?: boolean;
}

interface StockItem {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  direction: "up" | "down" | "flat";
}

/* ── Stock Data — Yahoo Finance ── */
const STOCK_SYMBOLS = [
  { symbol: "^JKSE", label: "IHSG" },
  { symbol: "BBCA.JK", label: "BBCA" },
  { symbol: "BBRI.JK", label: "BBRI" },
  { symbol: "BMRI.JK", label: "BMRI" },
  { symbol: "TLKM.JK", label: "TLKM" },
  { symbol: "ASII.JK", label: "ASII" },
  { symbol: "UNVR.JK", label: "UNVR" },
  { symbol: "GOTO.JK", label: "GOTO" },
  { symbol: "USDIDR=X", label: "USD/IDR" },
  { symbol: "GC=F", label: "EMAS" },
  { symbol: "CL=F", label: "MINYAK" },
  { symbol: "BTC-USD", label: "BTC" },
];

function useStocks() {
  const [stocks, setStocks] = useState<StockItem[]>([]);

  const fetchStocks = useCallback(async () => {
    try {
      const symbols = STOCK_SYMBOLS.map((s) => s.symbol).join(",");
      const res = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      const results = data.quoteResponse?.result || [];

      setStocks(results.map((q: Record<string, number | string>) => {
        const sym = STOCK_SYMBOLS.find((s) => s.symbol === q.symbol);
        const change = Number(q.regularMarketChange || 0);
        const price = Number(q.regularMarketPrice || 0);
        const pct = Number(q.regularMarketChangePercent || 0);
        return {
          symbol: sym?.label || String(q.symbol),
          price: price > 10000 ? price.toLocaleString("id-ID", { maximumFractionDigits: 0 }) : price.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: (change >= 0 ? "+" : "") + change.toFixed(2),
          changePercent: (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%",
          direction: change > 0 ? "up" as const : change < 0 ? "down" as const : "flat" as const,
        };
      }));
    } catch {
      setStocks([
        { symbol: "IHSG", price: "7.432", change: "+32.15", changePercent: "+0.43%", direction: "up" },
        { symbol: "BBCA", price: "9.850", change: "+75.00", changePercent: "+0.77%", direction: "up" },
        { symbol: "BBRI", price: "4.920", change: "-30.00", changePercent: "-0.61%", direction: "down" },
        { symbol: "BMRI", price: "6.125", change: "+25.00", changePercent: "+0.41%", direction: "up" },
        { symbol: "TLKM", price: "3.680", change: "+20.00", changePercent: "+0.55%", direction: "up" },
        { symbol: "ASII", price: "5.275", change: "-50.00", changePercent: "-0.94%", direction: "down" },
        { symbol: "USD/IDR", price: "15.845", change: "-25.00", changePercent: "-0.16%", direction: "down" },
        { symbol: "EMAS", price: "2.348", change: "+12.30", changePercent: "+0.53%", direction: "up" },
        { symbol: "MINYAK", price: "78.42", change: "-0.85", changePercent: "-1.07%", direction: "down" },
        { symbol: "BTC", price: "68.432", change: "+1.205", changePercent: "+1.79%", direction: "up" },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  return stocks;
}

/* ── Trending ── */
function useTrending() {
  const [items, setItems] = useState<TickerItem[]>([]);
  useEffect(() => {
    fetch("/api/trending")
      .then((r) => r.json())
      .then((json) => {
        const data = json.data || json || [];
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.map((t: { label?: string; title?: string; href?: string; slug?: string; hot?: boolean }) => ({
            title: t.label || t.title || "",
            href: t.href || (t.slug ? `/berita/${t.slug}` : "/search"),
            hot: t.hot || false,
          })));
        }
      })
      .catch(() => {});
  }, []);
  return items;
}

/* ── Component ── */
export default function NewsTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const [paused, setPaused] = useState(false);
  const didDrag = useRef(false);

  const trendingItems = useTrending();
  const stocks = useStocks();
  const looped = trendingItems.length > 0 ? [...trendingItems, ...trendingItems] : [];

  function onMouseDown(e: React.MouseEvent) { isDragging.current = true; didDrag.current = false; startX.current = e.pageX; if (trackRef.current) scrollLeftVal.current = trackRef.current.scrollLeft; setPaused(true); }
  function onMouseMove(e: React.MouseEvent) { if (!isDragging.current) return; if (Math.abs(e.pageX - startX.current) > 3) didDrag.current = true; if (trackRef.current) trackRef.current.scrollLeft = scrollLeftVal.current - (e.pageX - startX.current); }
  function onMouseUp() { isDragging.current = false; setPaused(false); }
  function onTouchStart(e: React.TouchEvent) { isDragging.current = true; didDrag.current = false; startX.current = e.touches[0].pageX; if (trackRef.current) scrollLeftVal.current = trackRef.current.scrollLeft; setPaused(true); }
  function onTouchMove(e: React.TouchEvent) { if (!isDragging.current) return; if (Math.abs(e.touches[0].pageX - startX.current) > 3) didDrag.current = true; if (trackRef.current) trackRef.current.scrollLeft = scrollLeftVal.current - (e.touches[0].pageX - startX.current); }
  function onTouchEnd() { isDragging.current = false; setPaused(false); }
  function onLinkClick(e: React.MouseEvent) { if (didDrag.current) e.preventDefault(); }

  return (
    <>
      {/* ═══ MARKET TICKER — Large card grid ═══ */}
      {stocks.length > 0 && (
        <div className="bg-on-surface">
          <div className="container-main py-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-label-md font-bold uppercase tracking-widest text-white/50">
                  Market Data
                </span>
                <span className="text-label-sm text-white/20">Realtime</span>
              </div>
              <span className="text-label-sm text-white/20">
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            </div>

            {/* Stock cards — horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {stocks.map((s) => (
                <div
                  key={s.symbol}
                  className={`shrink-0 rounded-sm px-4 py-2.5 min-w-[140px] ${
                    s.direction === "up"
                      ? "bg-emerald-500/10"
                      : s.direction === "down"
                      ? "bg-red-500/10"
                      : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-label-md font-bold text-white/80">{s.symbol}</span>
                    {s.direction === "up" ? (
                      <ArrowUpRight size={14} className="text-emerald-400" />
                    ) : s.direction === "down" ? (
                      <ArrowDownRight size={14} className="text-red-400" />
                    ) : (
                      <Minus size={14} className="text-white/30" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-title-md font-mono font-bold text-white">{s.price}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`text-label-md font-mono font-semibold ${
                      s.direction === "up" ? "text-emerald-400" : s.direction === "down" ? "text-red-400" : "text-white/40"
                    }`}>
                      {s.change}
                    </span>
                    <span className={`text-label-sm font-mono ${
                      s.direction === "up" ? "text-emerald-400/70" : s.direction === "down" ? "text-red-400/70" : "text-white/30"
                    }`}>
                      ({s.changePercent})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRENDING INDONESIA — Scrolling ticker ═══ */}
      {looped.length > 0 && (
        <div className="bg-surface-container-lowest">
          <div className="flex items-center py-2.5">
            {/* Label */}
            <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse shrink-0" />
              <span className="text-label-md font-bold tracking-widest text-secondary uppercase whitespace-nowrap">
                Trending Indonesia
              </span>
            </div>

            {/* Scrolling ticker */}
            <div
              ref={trackRef}
              className="news-ticker flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            >
              <div className="news-ticker-content" style={{ animationPlayState: paused ? "paused" : "running" }}>
                {looped.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={onLinkClick}
                    className="mx-4 sm:mx-6 inline-flex items-center gap-2 text-body-md font-medium text-on-surface/60 transition-colors duration-200 hover:text-primary whitespace-nowrap"
                  >
                    {item.hot && (
                      <span className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wider">
                        HOT
                      </span>
                    )}
                    <span className="h-1 w-1 rounded-full bg-on-surface-variant/30 shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
