"use client";

import { useState, useEffect, useCallback } from "react";
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
  const total = items.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (total === 0) return null;

  const article = items[current];
  const timeAgo = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className="relative overflow-hidden rounded-lg bg-surface-dark">
      {/* Image */}
      <div className="relative aspect-[2/1] sm:aspect-[2.2/1] w-full">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-all duration-700"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-goto-green/20 to-surface-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <Link
          href={`/kategori/${article.category.slug}`}
          className="inline-block rounded-full bg-goto-green px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
        >
          {article.category.name}
        </Link>
        <Link href={`/berita/${article.slug}`}>
          <h2 className="mt-2 text-xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl hover:underline decoration-2 underline-offset-4">
            {article.title}
          </h2>
        </Link>
        {article.excerpt && (
          <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-white/70 sm:block line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
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

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
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
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-goto-green" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
