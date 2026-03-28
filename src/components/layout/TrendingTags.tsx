"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Flame, Hash } from "lucide-react";

interface TrendingTag {
  label: string;
  href: string;
  hot?: boolean;
}

// Fetch trending topics from Google Trends RSS + fallback static tags
async function fetchTrendingTags(): Promise<TrendingTag[]> {
  try {
    // Try Google Trends RSS via proxy
    const res = await fetch("/api/trending", { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.data?.length > 0) return data.data;
    }
  } catch {
    // Fallback silently
  }

  // Fallback: curated trending tags relevant to hukum Indonesia
  return [
    { label: "Omnibus Law", href: "/search?q=omnibus+law", hot: true },
    { label: "KPK", href: "/search?q=KPK" },
    { label: "Pilkada 2026", href: "/search?q=pilkada+2026", hot: true },
    { label: "UU ITE", href: "/search?q=UU+ITE" },
    { label: "Korupsi Jabar", href: "/search?q=korupsi+jabar" },
    { label: "MK Putusan", href: "/search?q=mahkamah+konstitusi" },
    { label: "Hukum Digital", href: "/search?q=hukum+digital" },
    { label: "HAM Indonesia", href: "/search?q=HAM+Indonesia", hot: true },
    { label: "Tipikor", href: "/search?q=tipikor" },
    { label: "Sengketa Lahan", href: "/search?q=sengketa+lahan" },
    { label: "UMK 2027", href: "/search?q=UMK+2027" },
    { label: "Citarum", href: "/search?q=citarum" },
  ];
}

export default function TrendingTags() {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchTrendingTags().then((t) => {
      setTags(t);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  return (
    <div className="bg-surface border-b border-border">
      <div className="container-main py-2">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Label */}
          <div className="flex shrink-0 items-center gap-1.5 text-txt-muted">
            <TrendingUp size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Trending</span>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />

          {/* Tags */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {tags.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
                  tag.hot
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-surface-secondary text-txt-secondary hover:bg-surface-tertiary hover:text-txt-primary"
                }`}
              >
                {tag.hot ? (
                  <Flame size={10} className="text-red-500" />
                ) : (
                  <Hash size={10} className="text-txt-muted" />
                )}
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
