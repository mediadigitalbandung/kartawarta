"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeadlineItem {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt: Date | string | null;
  readTime?: number | null;
}

interface HeadlineSliderProps {
  items: HeadlineItem[];
}

export default function HeadlineSlider({ items }: HeadlineSliderProps) {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(-1);
  const [transitioning, setTransitioning] = useState(false);
  const total = items.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const goToSlide = useCallback((index: number) => {
    if (transitioning || index === current) return;
    setPrevious(current);
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => {
      setTransitioning(false);
      setPrevious(-1);
    }, 900);
  }, [current, transitioning]);

  const next = useCallback(() => {
    goToSlide((current + 1) % total);
  }, [current, total, goToSlide]);

  const prev = useCallback(() => {
    goToSlide((current - 1 + total) % total);
  }, [current, total, goToSlide]);

  // Auto-advance
  useEffect(() => {
    if (total <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goToSlide(((current) + 1) % total);
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, total, goToSlide]);

  if (total === 0) return null;

  const formatDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div className="group relative overflow-hidden rounded-lg bg-surface-dark">
      {/* All slides stacked — crossfade + ken burns */}
      <div className="relative aspect-[2/1] sm:aspect-[2.2/1] w-full">
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
                transition: isActive
                  ? "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)"
                  : isLeaving
                    ? "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)"
                    : "none",
              }}
            >
              {/* Image with Ken Burns slow zoom */}
              <div
                className="absolute inset-0"
                style={{
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  transition: isActive ? "transform 8s ease-out" : "none",
                }}
              >
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-surface-dark to-gray-800" />
                )}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              {/* Content — slides up on enter */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5 sm:p-8"
                style={{
                  transform: isActive && transitioning ? "translateY(0)" : isActive ? "translateY(0)" : "translateY(20px)",
                  opacity: isActive ? 1 : 0,
                  transition: isActive
                    ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 0.6s ease 0.15s"
                    : "transform 0.4s ease, opacity 0.3s ease",
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  {article.category.name}
                </span>

                <Link href={`/berita/${article.slug}`}>
                  <h2 className="mt-2 text-xl font-extrabold leading-[1.15] text-white sm:text-2xl lg:text-[2.1rem] max-w-[90%]">
                    {article.title}
                  </h2>
                </Link>

                {article.excerpt && (
                  <p className="mt-2.5 hidden max-w-xl text-[13px] leading-relaxed text-white/50 sm:block line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/35">
                  <span>{article.author.name}</span>
                  <span className="h-2.5 w-px bg-white/15" />
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.readTime && (
                    <>
                      <span className="h-2.5 w-px bg-white/15" />
                      <span>{article.readTime} min</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrows — appear on hover */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 hover:text-white"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 hover:text-white"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Bottom progress bar + dots */}
      {total > 1 && (
        <div className="absolute bottom-0 left-0 right-0">
          {/* Thin progress segments */}
          <div className="flex gap-px">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="relative h-[3px] flex-1 bg-white/10 overflow-hidden"
                aria-label={`Slide ${i + 1}`}
              >
                <div
                  className={`absolute inset-y-0 left-0 bg-white/70 ${
                    i === current ? "animate-progress" : i < current ? "w-full" : "w-0"
                  }`}
                  ref={i === current ? progressRef : undefined}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar animation */}
      <style jsx>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progressFill 7s linear forwards;
        }
      `}</style>
    </div>
  );
}
