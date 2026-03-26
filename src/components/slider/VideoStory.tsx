"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

interface VideoStoryItem {
  title: string;
  slug: string;
  thumbnail: string;
  duration: string;
  source: string;
}

interface VideoStoryProps {
  items: VideoStoryItem[];
}

export default function VideoStory({ items }: VideoStoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("article");
    const cardWidth = card ? card.offsetWidth + 16 : 200;
    const distance = cardWidth * 3;
    el.scrollBy({ left: dir === "right" ? distance : -distance, behavior: "smooth" });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Scrollable horizontal row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
      >
        {items.map((item) => (
          <article
            key={item.slug}
            className="group w-[180px] sm:w-[200px] shrink-0"
          >
            <Link href={`/berita/${item.slug}`} className="block">
              {/* Vertical thumbnail — portrait ratio like video story */}
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-surface-dark">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                {/* Play button */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play size={12} className="text-white ml-0.5" fill="white" />
                  </div>
                  <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {item.duration}
                  </span>
                </div>
              </div>
            </Link>

            {/* Title + source below */}
            <div className="mt-2 flex items-start gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-goto-green mt-0.5">
                <Play size={8} className="text-white ml-px" fill="white" />
              </div>
              <div className="min-w-0">
                <Link href={`/berita/${item.slug}`}>
                  <h3 className="text-xs font-bold leading-snug text-txt-primary line-clamp-2 group-hover:underline">
                    {item.title}
                  </h3>
                </Link>
                <p className="mt-0.5 text-[10px] text-txt-muted flex items-center gap-1">
                  {item.source}
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-goto-green">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.28 5.78l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06L6.75 8.19l3.47-3.47a.75.75 0 111.06 1.06z" />
                  </svg>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-[30%] -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-txt-secondary shadow-card transition-all duration-200 hover:border-txt-muted hover:text-txt-primary hover:shadow-card-hover hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-[30%] -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-txt-secondary shadow-card transition-all duration-200 hover:border-txt-muted hover:text-txt-primary hover:shadow-card-hover hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}