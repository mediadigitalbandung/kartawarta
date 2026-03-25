"use client";

import Link from "next/link";

interface TickerItem {
  title: string;
  slug: string;
  isLive?: boolean;
}

interface NewsTickerProps {
  items: TickerItem[];
}

export default function NewsTicker({ items }: NewsTickerProps) {
  if (!items.length) return null;

  const hasLive = items.some((item) => item.isLive);

  return (
    <div className="bg-goto-green text-white">
      <div className="container-main flex items-center py-2">
        <div className="flex shrink-0 items-center gap-2 pr-4">
          {hasLive ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                LIVE
              </span>
            </>
          ) : (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Terkini
              </span>
            </>
          )}
        </div>
        <div className="h-4 w-px bg-white/30" />
        <div className="news-ticker ml-3 flex-1 overflow-hidden">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-6 inline-flex items-center gap-2 text-sm text-white transition-opacity duration-200 hover:opacity-80 hover:underline"
              >
                {item.isLive && (
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                )}
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
