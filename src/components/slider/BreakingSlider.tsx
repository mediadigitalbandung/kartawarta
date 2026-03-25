"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

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
  const total = items.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide every 4 seconds (faster for breaking news)
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (total === 0) return null;

  const article = items[current];
  const timeAgo = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : "";

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-red-600 px-4 py-2">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Breaking News
          </span>
          <span className="flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        </div>
        <span className="text-[10px] font-medium text-white/70">
          {current + 1} / {total}
        </span>
      </div>

      {/* Content */}
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        {article.featuredImage && (
          <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded sm:block">
            <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/kategori/${article.category.slug}`}
            className="text-[10px] font-bold uppercase tracking-wider text-red-600"
          >
            {article.category.name}
          </Link>
          <Link href={`/berita/${article.slug}`}>
            <h3 className="mt-0.5 text-sm font-bold text-txt-primary leading-snug hover:underline line-clamp-2">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="mt-1 text-xs text-txt-secondary line-clamp-1 hidden sm:block">{article.excerpt}</p>
          )}
          <span className="mt-1.5 block text-[10px] text-txt-muted">{timeAgo}</span>
        </div>

        {/* Navigation */}
        {total > 1 && (
          <div className="flex flex-col items-center justify-center gap-1 shrink-0">
            <button
              onClick={prev}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
              aria-label="Previous"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
              aria-label="Next"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Progress dots */}
      {total > 1 && (
        <div className="flex gap-1 px-4 pb-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i === current ? "bg-red-500" : "bg-red-200 hover:bg-red-300"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
