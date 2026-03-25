"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
// no arrow icons needed

interface BreakingItem {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  publishedAt: Date | string | null;
}

interface BreakingSliderProps {
  items: BreakingItem[];
}

export default function BreakingSlider({ items }: BreakingSliderProps) {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(-1);
  const [transitioning, setTransitioning] = useState(false);
  const total = items.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (transitioning || index === current) return;
    setPrevious(current);
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => {
      setTransitioning(false);
      setPrevious(-1);
    }, 700);
  }, [current, transitioning]);

  const next = useCallback(() => {
    goToSlide((current + 1) % total);
  }, [current, total, goToSlide]);

  const prev = useCallback(() => {
    goToSlide((current - 1 + total) % total);
  }, [current, total, goToSlide]);

  useEffect(() => {
    if (total <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goToSlide((current + 1) % total);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, total, goToSlide]);

  if (total === 0) return null;

  const formatDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "";

  return (
    <div className="group relative overflow-hidden rounded-lg bg-surface-dark h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-dark border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white">
            Breaking News
          </span>
        </div>
      </div>

      {/* Slides — crossfade with image background */}
      <div className="relative flex-1 min-h-[280px]">
        {items.map((article, i) => {
          const isActive = i === current;
          const isLeaving = i === previous;
          const isVisible = isActive || isLeaving;

          return (
            <div
              key={article.slug}
              className="absolute inset-0"
              style={{
                zIndex: isActive ? 2 : isLeaving ? 1 : 0,
                opacity: isVisible ? 1 : 0,
                visibility: isVisible ? "visible" : "hidden",
                transition: "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Background image with Ken Burns */}
              <div
                className="absolute -inset-1"
                style={{
                  transform: isActive ? "scale(1.04)" : "scale(1.01)",
                  transition: isActive ? "transform 6s ease-out" : "none",
                }}
              >
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-surface-dark" />
                )}
              </div>

              {/* Dark overlay — single smooth gradient */}
              <div className="absolute -inset-1 bg-gradient-to-t from-black/90 from-10% via-black/50 via-50% to-black/20" />

              {/* Content — slide up */}
              <div
                className="absolute bottom-0 left-0 right-0 px-4 pt-4 pb-8"
                style={{
                  transform: isActive ? "translateY(0)" : "translateY(12px)",
                  opacity: isActive ? 1 : 0,
                  transition: isActive
                    ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 0.5s ease 0.1s"
                    : "transform 0.3s ease, opacity 0.2s ease",
                }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  {article.category.name}
                </span>
                <Link href={`/berita/${article.slug}`}>
                  <h3 className="mt-1 text-[15px] font-bold leading-snug text-white line-clamp-3">
                    {article.title}
                  </h3>
                </Link>
                {article.excerpt && (
                  <p className="mt-1.5 text-xs leading-relaxed text-white/40 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <span className="mt-2 block text-[10px] text-white/30">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "h-2 w-2 bg-white"
                    : "h-1.5 w-1.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
