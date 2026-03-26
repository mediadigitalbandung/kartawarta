"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

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

  return (
    <div className="relative bg-gradient-to-r from-surface-dark via-surface-dark/95 to-surface-dark overflow-hidden">
      {/* Subtle animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-goto-green/50 to-transparent" />

      <div className="container-main flex items-center py-1.5">
        {/* Badge */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-goto-green/10 border border-goto-green/20 px-3 py-1 mr-3">
          <Zap size={10} className="text-goto-green fill-goto-green" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-goto-green">
            Terkini
          </span>
        </div>

        {/* Scrolling content */}
        <div className="news-ticker flex-1 overflow-hidden">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-8 inline-flex items-center gap-2 text-[13px] text-white/60 transition-colors duration-200 hover:text-white"
              >
                <span className="h-1 w-1 rounded-full bg-goto-green/40 shrink-0" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
    </div>
  );
}
