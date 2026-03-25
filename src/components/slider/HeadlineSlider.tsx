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
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const total = items.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection("next");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % total);
        setIsAnimating(false);
      }, 600);
    }, 6000);
  }, [total]);

  const goTo = useCallback((index: number) => {
    if (isAnimating || index === current) return;
    setDirection(index > current ? "next" : "prev");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setIsAnimating(false);
    }, 600);
    resetTimer();
  }, [current, isAnimating, resetTimer]);

  const next = useCallback(() => {
    if (isAnimating) return;
    setDirection("next");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % total);
      setIsAnimating(false);
    }, 600);
    resetTimer();
  }, [isAnimating, total, resetTimer]);

  const prev = useCallback(() => {
    if (isAnimating) return;
    setDirection("prev");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + total) % total);
      setIsAnimating(false);
    }, 600);
    resetTimer();
  }, [isAnimating, total, resetTimer]);

  useEffect(() => {
    if (total <= 1) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer, total]);

  if (total === 0) return null;

  const article = items[current];
  const timeAgo = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "";

  // Arc rotation: rotateY for semicircle flip effect
  const animClass = isAnimating
    ? direction === "next"
      ? "animate-arc-out-left"
      : "animate-arc-out-right"
    : "animate-arc-in";

  return (
    <div className="relative overflow-hidden rounded-lg bg-surface-dark" style={{ perspective: "1200px" }}>
      {/* Slide with arc rotation */}
      <div
        className={`relative aspect-[2/1] sm:aspect-[2.2/1] w-full transition-none ${animClass}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-goto-green/20 to-surface-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <Link
            href={`/kategori/${article.category.slug}`}
            className="text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors"
          >
            {article.category.name}
          </Link>
          <Link href={`/berita/${article.slug}`}>
            <h2 className="mt-1.5 text-xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl hover:underline decoration-2 underline-offset-4">
              {article.title}
            </h2>
          </Link>
          {article.excerpt && (
            <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-white/60 sm:block line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
            <span>{article.author.name}</span>
            <span className="h-3 w-px bg-white/20" />
            <span>{timeAgo}</span>
            {article.readTime && (
              <>
                <span className="h-3 w-px bg-white/20" />
                <span>{article.readTime} menit baca</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 right-5 sm:right-8 flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* CSS for arc rotation animation */}
      <style jsx>{`
        @keyframes arcOutLeft {
          0% { transform: rotateY(0deg) scale(1); opacity: 1; }
          50% { transform: rotateY(-90deg) scale(0.92); opacity: 0.3; }
          100% { transform: rotateY(-180deg) scale(0.85); opacity: 0; }
        }
        @keyframes arcOutRight {
          0% { transform: rotateY(0deg) scale(1); opacity: 1; }
          50% { transform: rotateY(90deg) scale(0.92); opacity: 0.3; }
          100% { transform: rotateY(180deg) scale(0.85); opacity: 0; }
        }
        @keyframes arcIn {
          0% { transform: rotateY(90deg) scale(0.9); opacity: 0; }
          50% { transform: rotateY(30deg) scale(0.95); opacity: 0.6; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        .animate-arc-out-left {
          animation: arcOutLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: left center;
        }
        .animate-arc-out-right {
          animation: arcOutRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: right center;
        }
        .animate-arc-in {
          animation: arcIn 0.5s cubic-bezier(0, 0, 0.2, 1) forwards;
          transform-origin: center center;
        }
      `}</style>
    </div>
  );
}
