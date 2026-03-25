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
    <div className="bg-forest text-wheat">
      <div className="container-main flex items-center py-1.5">
        <div className="flex shrink-0 items-center gap-2 pr-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          <span className="font-mono text-kicker uppercase tracking-widest text-wheat">
            Terkini
          </span>
        </div>
        <div className="h-4 w-px bg-newsprint/20" />
        <div className="news-ticker ml-3 flex-1 overflow-hidden">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-6 text-sm text-newsprint transition-opacity duration-200 hover:opacity-80 hover:underline"
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
