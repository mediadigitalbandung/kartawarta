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
    <div className="border-b border-gray-200 bg-accent text-white dark:border-gray-800">
      <div className="container-main flex items-center">
        <div className="flex shrink-0 items-center gap-1.5 bg-accent-dark px-3 py-2 text-xs font-bold uppercase">
          <AlertCircle size={14} />
          Breaking
        </div>
        <div className="news-ticker ml-3 flex-1 py-2">
          <div className="news-ticker-content">
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/berita/${item.slug}`}
                className="mx-8 text-sm hover:underline"
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
