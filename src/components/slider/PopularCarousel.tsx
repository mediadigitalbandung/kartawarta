"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PopularItem {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt: Date | string | null;
  viewCount?: number;
}

interface PopularCarouselProps {
  items: PopularItem[];
}

export default function PopularCarousel({ items }: PopularCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by roughly 1 card width + gap
    const cardWidth = el.clientWidth / 4 + 20;
    el.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" });
  }, []);

  // Auto-scroll right every 4s
  useEffect(() => {
    autoRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        // Reset to start
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [scroll]);

  // Pause auto on hover
  const pauseAuto = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const resumeAuto = () => {
    autoRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, 4000);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  if (items.length === 0) return null;

  const formatDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "";

  return (
    <div
      className="relative group"
      onMouseEnter={pauseAuto}
      onMouseLeave={resumeAuto}
    >
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((article, i) => (
          <article
            key={article.slug}
            className="w-[calc(25%-15px)] min-w-[240px] shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Image */}
            <Link href={`/berita/${article.slug}`} className="block">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm">
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-surface-tertiary" />
                )}
                {/* Rank badge */}
                <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-goto-green text-[11px] font-bold text-white">
                  {i + 1}
                </div>
              </div>
            </Link>
            {/* Content */}
            <div className="mt-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-goto-green">
                {article.category.name}
              </span>
              <Link href={`/berita/${article.slug}`}>
                <h3 className="mt-1 text-sm font-bold leading-snug text-txt-primary line-clamp-2 hover:underline">
                  {article.title}
                </h3>
              </Link>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-txt-muted">
                <span>{formatDate(article.publishedAt)}</span>
                {article.viewCount !== undefined && article.viewCount > 0 && (
                  <>
                    <span className="h-2.5 w-px bg-border" />
                    <span>{article.viewCount.toLocaleString("id-ID")} views</span>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-[30%] -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-txt-secondary shadow-card transition-all duration-200 hover:border-txt-muted hover:text-txt-primary hover:shadow-card-hover hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-[30%] -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-txt-secondary shadow-card transition-all duration-200 hover:border-txt-muted hover:text-txt-primary hover:shadow-card-hover hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
