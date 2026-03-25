"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

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
    <div className="bg-primary-gradient text-white">
      <div className="container-main flex items-center">
        <div className="flex shrink-0 items-center gap-2 py-2.5 pr-4">
          <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <AlertCircle size={13} />
            Breaking
          </span>
        </div>
        <div className="h-5 w-px bg-white/20" />
        <div className="news-ticker ml-4 flex-1 py-2.5">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-8 text-sm font-medium transition-opacity duration-200 hover:opacity-80 hover:underline"
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
