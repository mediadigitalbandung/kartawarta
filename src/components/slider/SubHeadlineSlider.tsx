"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SubHeadlineItem {
  title: string;
  slug: string;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  publishedAt: Date | string | null;
}

interface SubHeadlineSliderProps {
  items: SubHeadlineItem[];
}

export default function SubHeadlineSlider({ items }: SubHeadlineSliderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Show 2 items per page
  const perPage = 2;
  const totalPages = Math.ceil(items.length / perPage);

  const goToPage = useCallback((page: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrentPage(page);
    setTimeout(() => setTransitioning(false), 500);
  }, [transitioning]);

  const next = useCallback(() => {
    goToPage((currentPage + 1) % totalPages);
  }, [currentPage, totalPages, goToPage]);

  const prev = useCallback(() => {
    goToPage((currentPage - 1 + totalPages) % totalPages);
  }, [currentPage, totalPages, goToPage]);

  // Auto-advance every 5s
  useEffect(() => {
    if (totalPages <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goToPage(((currentPage) + 1) % totalPages);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentPage, totalPages, goToPage]);

  if (items.length === 0) return null;

  const formatDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

  const currentItems = items.slice(currentPage * perPage, currentPage * perPage + perPage);

  return (
    <div className="relative group">
      <div className="grid grid-cols-2 gap-4">
        {currentItems.map((article) => (
          <article key={article.slug} className="group/card relative overflow-hidden rounded-lg bg-surface-dark">
            <Link href={`/berita/${article.slug}`} className="block">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900" />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                    {article.category.name}
                  </span>
                  <h3 className="mt-1 text-sm font-bold leading-snug text-white line-clamp-2">
                    {article.title}
                  </h3>
                  <span className="mt-1.5 block text-[10px] text-white/40">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Navigation arrows */}
      {totalPages > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-black/50 hover:text-white hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-black/50 hover:text-white hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentPage
                  ? "h-2 w-2 bg-txt-primary"
                  : "h-1.5 w-1.5 bg-txt-muted/30 hover:bg-txt-muted/50"
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
