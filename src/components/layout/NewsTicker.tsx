"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

interface TickerItem {
  title: string;
  href: string;
  hot?: boolean;
}

export default function NewsTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const [paused, setPaused] = useState(false);
  const didDrag = useRef(false);
  const [items, setItems] = useState<TickerItem[]>([]);

  // Fetch trending topics
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

  if (!items.length) return null;

  const looped = [...items, ...items];

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    didDrag.current = false;
    startX.current = e.pageX;
    const el = trackRef.current;
    if (el) scrollLeftVal.current = el.scrollLeft;
    setPaused(true);
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 3) didDrag.current = true;
    const el = trackRef.current;
    if (el) el.scrollLeft = scrollLeftVal.current - dx;
  }
  function onMouseUp() { isDragging.current = false; setPaused(false); }
  function onTouchStart(e: React.TouchEvent) {
    isDragging.current = true; didDrag.current = false;
    startX.current = e.touches[0].pageX;
    const el = trackRef.current;
    if (el) scrollLeftVal.current = el.scrollLeft;
    setPaused(true);
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current) return;
    const dx = e.touches[0].pageX - startX.current;
    if (Math.abs(dx) > 3) didDrag.current = true;
    const el = trackRef.current;
    if (el) el.scrollLeft = scrollLeftVal.current - dx;
  }
  function onTouchEnd() { isDragging.current = false; setPaused(false); }
  function onLinkClick(e: React.MouseEvent) { if (didDrag.current) e.preventDefault(); }

  return (
    <div className="relative bg-surface-container-lowest overflow-hidden">
      <div className="flex items-center py-2 sm:py-2.5">
        {/* TRENDING label */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 sm:px-5 mr-2">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse shrink-0" />
          <span className="text-label-sm font-bold tracking-widest text-secondary uppercase whitespace-nowrap">
            Trending
          </span>
        </div>

        {/* Ticker */}
        <div
          ref={trackRef}
          className="news-ticker flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ animationPlayState: paused ? "paused" : undefined }}
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
                className="mx-5 sm:mx-8 inline-flex items-center gap-2 text-body-sm font-medium text-on-surface/70 transition-colors duration-200 hover:text-primary whitespace-nowrap"
              >
                {item.hot && (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-secondary/10 px-1.5 py-0.5 text-label-sm font-bold text-secondary">
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
  );
}
