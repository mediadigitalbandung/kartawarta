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
    <div className="relative bg-surface-dark border-t border-white/5 overflow-hidden">
      <div className="container-main flex items-center py-2.5">
        {/* Scrolling content — clean, no badge */}
        <div className="news-ticker flex-1 overflow-hidden">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-10 inline-flex items-center text-sm text-white/40 transition-colors duration-300 hover:text-white/80"
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
