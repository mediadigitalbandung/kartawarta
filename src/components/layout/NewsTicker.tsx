"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, ChevronLeft, ChevronRight } from "lucide-react";

/* ── Types ── */
interface TickerItem { title: string; href: string; hot?: boolean }
interface StockItem {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
}

/* ── Stock symbols ── */
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
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch("/api/stocks", { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      const data = json.data || [];

      if (data.length > 0) {
        setStocks(data.map((s: StockItem) => ({
          ...s,
          direction: s.change > 0.001 ? "up" as const : s.change < -0.001 ? "down" as const : "flat" as const,
        })));
        setLastUpdate(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch {
      // Keep existing data
    }
  }, []);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [fetchStocks]);

  return { stocks, lastUpdate };
}

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

/* ── Stock Carousel ── */
function StockCarousel({ stocks, lastUpdate }: { stocks: StockItem[]; lastUpdate: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => { if (el) el.removeEventListener("scroll", checkScroll); };
  }, [checkScroll, stocks]);

  // Auto-scroll carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let direction = 1;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 2) direction = -1;
      if (el.scrollLeft <= 2) direction = 1;
      el.scrollBy({ left: direction * 1, behavior: "auto" });
    }, 30);
    return () => clearInterval(interval);
  }, [stocks]);

  function scroll(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  }

  if (stocks.length === 0) return null;

  return (
    <div className="bg-on-surface">
      <div className="container-main py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-label-md font-bold uppercase tracking-widest text-white/50">Market</span>
            <span className="hidden sm:inline text-label-sm text-white/20">Live</span>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-label-sm text-white/20 font-mono">
                Update {lastUpdate} WIB
              </span>
            )}
            {/* Nav arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scroll(-1)}
                disabled={!canScrollLeft}
                className="flex h-7 w-7 items-center justify-center rounded-sm bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => scroll(1)}
                disabled={!canScrollRight}
                className="flex h-7 w-7 items-center justify-center rounded-sm bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Cards carousel */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {stocks.map((s) => (
            <div
              key={s.symbol}
              className={`shrink-0 rounded-sm px-4 py-3 min-w-[150px] sm:min-w-[165px] transition-colors ${
                s.direction === "up"
                  ? "bg-emerald-500/10 hover:bg-emerald-500/15"
                  : s.direction === "down"
                  ? "bg-red-500/10 hover:bg-red-500/15"
                  : "bg-white/5 hover:bg-white/8"
              }`}
            >
              {/* Symbol + arrow */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-label-md font-bold text-white/70">{s.symbol}</span>
                {s.direction === "up" ? (
                  <ArrowUpRight size={16} className="text-emerald-400" />
                ) : s.direction === "down" ? (
                  <ArrowDownRight size={16} className="text-red-400" />
                ) : (
                  <Minus size={14} className="text-white/30" />
                )}
              </div>
              {/* Price */}
              <div className="text-title-lg font-mono font-bold text-white leading-none">
                {fmtPrice(s.price, s.symbol)}
              </div>
              {/* Change */}
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`text-label-md font-mono font-semibold ${
                  s.direction === "up" ? "text-emerald-400" : s.direction === "down" ? "text-red-400" : "text-white/40"
                }`}>
                  {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}
                </span>
                <span className={`text-label-sm font-mono ${
                  s.direction === "up" ? "text-emerald-400/60" : s.direction === "down" ? "text-red-400/60" : "text-white/20"
                }`}>
                  ({s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
  const { stocks, lastUpdate } = useStocks();
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
      {/* ═══ MARKET CAROUSEL ═══ */}
      <StockCarousel stocks={stocks} lastUpdate={lastUpdate} />

      {/* ═══ TRENDING INDONESIA ═══ */}
      {looped.length > 0 && (
        <div className="bg-surface-container-lowest">
          <div className="flex items-center py-2.5">
            <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse shrink-0" />
              <span className="text-label-md font-bold tracking-widest text-secondary uppercase whitespace-nowrap">
                Trending Indonesia
              </span>
            </div>
            <div
              ref={trackRef}
              className="news-ticker flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            >
              <div className="news-ticker-content" style={{ animationPlayState: paused ? "paused" : "running" }}>
                {looped.map((item, i) => (
                  <Link key={i} href={item.href} onClick={onLinkClick}
                    className="mx-4 sm:mx-6 inline-flex items-center gap-2 text-body-md font-medium text-on-surface/60 transition-colors duration-200 hover:text-primary whitespace-nowrap">
                    {item.hot && (
                      <span className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wider">HOT</span>
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
