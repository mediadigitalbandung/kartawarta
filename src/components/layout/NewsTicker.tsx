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
    <div className="relative bg-surface border-b border-border overflow-hidden">
      <div className="container-main flex items-center py-3.5">
        <div className="news-ticker flex-1 overflow-hidden">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-12 inline-flex items-center gap-2.5 text-base font-medium text-txt-primary/70 transition-colors duration-300 hover:text-goto-green"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-goto-green shrink-0" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
