"use client";

import Link from "next/link";

interface TickerItem {
  title: string;
  slug: string;
}

interface NewsTickerProps {
  items: TickerItem[];
}

export default function NewsTicker({ items }: NewsTickerProps) {
  if (!items.length) return null;

  // Duplicate for seamless loop
  const looped = [...items, ...items];

  return (
    <div className="relative bg-surface border-b border-border overflow-hidden">
      <div className="flex items-center py-2 sm:py-2.5">
        {/* TRENDING label */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 border-r border-border mr-2">
          <span className="h-1.5 w-1.5 rounded-full bg-goto-green animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-goto-green uppercase whitespace-nowrap">
            Trending
          </span>
        </div>
        {/* Scrolling ticker */}
        <div className="news-ticker flex-1 overflow-hidden">
          <div className="news-ticker-content">
            {looped.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-6 sm:mx-10 inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-txt-primary/75 transition-colors duration-200 hover:text-goto-green whitespace-nowrap"
              >
                <span className="h-1 w-1 rounded-full bg-goto-green/50 shrink-0" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
