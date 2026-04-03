"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

/* ── Stock Ticker — Yahoo Finance (realtime, no API key) ── */
const STOCK_SYMBOLS = [
  { symbol: "^JKSE", label: "IHSG" },
  { symbol: "BBCA.JK", label: "BBCA" },
  { symbol: "BBRI.JK", label: "BBRI" },
  { symbol: "TLKM.JK", label: "TLKM" },
  { symbol: "ASII.JK", label: "ASII" },
  { symbol: "BMRI.JK", label: "BMRI" },
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
      if (!res.ok) throw new Error("Yahoo Finance error");
      const data = await res.json();
      const results = data.quoteResponse?.result || [];

      const mapped: StockItem[] = results.map((q: Record<string, number | string>) => {
        const sym = STOCK_SYMBOLS.find((s) => s.symbol === q.symbol);
        const change = Number(q.regularMarketChange || 0);
        const price = Number(q.regularMarketPrice || 0);
        const pct = Number(q.regularMarketChangePercent || 0);

        return {
          symbol: sym?.label || String(q.symbol),
          price: price > 10000 ? price.toLocaleString("id-ID", { maximumFractionDigits: 0 }) : price.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: (change >= 0 ? "+" : "") + change.toFixed(2),
          changePercent: (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%",
          direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
        } as StockItem;
      });

      setStocks(mapped);
    } catch {
      // Fallback static data
      setStocks([
        { symbol: "IHSG", price: "7.432", change: "+32.15", changePercent: "+0.43%", direction: "up" },
        { symbol: "BBCA", price: "9.850", change: "+75.00", changePercent: "+0.77%", direction: "up" },
        { symbol: "BBRI", price: "4.920", change: "-30.00", changePercent: "-0.61%", direction: "down" },
        { symbol: "TLKM", price: "3.680", change: "+20.00", changePercent: "+0.55%", direction: "up" },
        { symbol: "USD/IDR", price: "15.845", change: "-25.00", changePercent: "-0.16%", direction: "down" },
        { symbol: "EMAS", price: "2.348", change: "+12.30", changePercent: "+0.53%", direction: "up" },
        { symbol: "BTC", price: "68.432", change: "+1.205", changePercent: "+1.79%", direction: "up" },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStocks]);

  return stocks;
}

/* ── Trending Topics ── */
function useTrending() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => r.json())
      .then((json) => {
        const data = json.data || json || [];
        if (Array.isArray(data) && data.length > 0) {
          setItems(
            data.map((t: { label?: string; title?: string; href?: string; slug?: string; hot?: boolean }) => ({
              title: t.label || t.title || "",
              href: t.href || (t.slug ? `/berita/${t.slug}` : "/search"),
              hot: t.hot || false,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return items;
}

/* ── Main Component ── */
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

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true; didDrag.current = false;
    startX.current = e.pageX;
    if (trackRef.current) scrollLeftVal.current = trackRef.current.scrollLeft;
    setPaused(true);
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    if (Math.abs(e.pageX - startX.current) > 3) didDrag.current = true;
    if (trackRef.current) trackRef.current.scrollLeft = scrollLeftVal.current - (e.pageX - startX.current);
  }
  function onMouseUp() { isDragging.current = false; setPaused(false); }
  function onTouchStart(e: React.TouchEvent) {
    isDragging.current = true; didDrag.current = false;
    startX.current = e.touches[0].pageX;
    if (trackRef.current) scrollLeftVal.current = trackRef.current.scrollLeft;
    setPaused(true);
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current) return;
    if (Math.abs(e.touches[0].pageX - startX.current) > 3) didDrag.current = true;
    if (trackRef.current) trackRef.current.scrollLeft = scrollLeftVal.current - (e.touches[0].pageX - startX.current);
  }
  function onTouchEnd() { isDragging.current = false; setPaused(false); }
  function onLinkClick(e: React.MouseEvent) { if (didDrag.current) e.preventDefault(); }

  return (
    <div className="bg-on-surface text-white">
      {/* Row 1: Stock Ticker */}
      {stocks.length > 0 && (
        <div className="border-b border-white/5">
          <div className="container-main">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide py-1.5">
              <span className="shrink-0 text-label-sm font-bold uppercase tracking-widest text-white/30 mr-4">
                Market
              </span>
              {stocks.map((s) => (
                <div key={s.symbol} className="shrink-0 flex items-center gap-2 px-3 border-r border-white/5 last:border-0">
                  <span className="text-label-sm font-bold text-white/60">{s.symbol}</span>
                  <span className="text-label-sm text-white/90 font-mono">{s.price}</span>
                  <span className={`flex items-center gap-0.5 text-label-sm font-mono font-semibold ${
                    s.direction === "up" ? "text-emerald-400" : s.direction === "down" ? "text-red-400" : "text-white/40"
                  }`}>
                    {s.direction === "up" ? <TrendingUp size={10} /> : s.direction === "down" ? <TrendingDown size={10} /> : <Minus size={10} />}
                    {s.changePercent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Trending News */}
      {looped.length > 0 && (
        <div>
          <div className="flex items-center py-2">
            {/* Label */}
            <div className="shrink-0 flex items-center gap-1.5 px-4 sm:px-6">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse shrink-0" />
              <span className="text-label-sm font-bold tracking-widest text-secondary uppercase whitespace-nowrap">
                Trending
              </span>
            </div>

            {/* Scrolling ticker */}
            <div
              ref={trackRef}
              className="news-ticker flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="news-ticker-content"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              >
                {looped.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={onLinkClick}
                    className="mx-4 sm:mx-6 inline-flex items-center gap-2 text-body-sm font-medium text-white/50 transition-colors duration-200 hover:text-white whitespace-nowrap"
                  >
                    {item.hot && (
                      <span className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wider">
                        HOT
                      </span>
                    )}
                    <span className="h-1 w-1 rounded-full bg-white/20 shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
