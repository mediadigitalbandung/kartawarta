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

  return (
    <div className="bg-goto-green text-white">
      <div className="container-main flex items-center py-2">
        <div className="flex shrink-0 items-center gap-2 pr-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-white">
            Terkini
          </span>
        </div>
        <div className="h-4 w-px bg-white/30" />
        <div className="news-ticker ml-3 flex-1 overflow-hidden">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-6 text-sm text-white transition-opacity duration-200 hover:opacity-80 hover:underline"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
