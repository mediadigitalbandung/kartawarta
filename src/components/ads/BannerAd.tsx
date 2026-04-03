"use client";

import { useEffect, useState, useRef } from "react";

interface Ad {
  id: string;
  type: string;
  imageUrl?: string | null;
  htmlCode?: string | null;
  targetUrl?: string | null;
}

const sizeToSlot: Record<string, string> = {
  leaderboard: "HEADER",
  banner: "BETWEEN_SECTIONS",
  rectangle: "SIDEBAR",
  inline: "IN_ARTICLE",
  footer: "FOOTER",
  floating: "FLOATING_BOTTOM",
};

const sizeStyles: Record<string, { width: string; height: string; label: string }> = {
  leaderboard: { width: "728px", height: "90px", label: "728 × 90" },
  banner: { width: "100%", height: "90px", label: "Responsive × 90" },
  rectangle: { width: "300px", height: "250px", label: "300 × 250" },
  "large-rectangle": { width: "336px", height: "280px", label: "336 × 280" },
  inline: { width: "100%", height: "120px", label: "Responsive × 120" },
  "native-card": { width: "100%", height: "auto", label: "Native" },
  footer: { width: "100%", height: "90px", label: "Responsive × 90" },
  billboard: { width: "100%", height: "250px", label: "Billboard" },
};

interface BannerAdProps {
  size?: keyof typeof sizeStyles | "slim";
  slot?: string;
  className?: string;
  noWrapper?: boolean;
  showPlaceholder?: boolean;
}

function useAd(adSlot: string) {
  const [ad, setAd] = useState<Ad | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    tracked.current = false;
    fetch(`/api/ads?slot=${adSlot}`)
      .then((r) => r.json())
      .then((json) => {
        const ads: Ad[] = json.data || [];
        if (ads.length > 0) {
          setAd(ads[Math.floor(Math.random() * ads.length)]);
        }
      })
      .catch(() => {});
  }, [adSlot]);

  useEffect(() => {
    if (ad && !tracked.current) {
      tracked.current = true;
      fetch(`/api/ads/${ad.id}/track?type=impression`, { method: "POST" }).catch(() => {});
    }
  }, [ad]);

  return ad;
}

function handleClick(ad: Ad) {
  fetch(`/api/ads/${ad.id}/track?type=click`, { method: "POST" }).catch(() => {});
}

function AdContent({ ad }: { ad: Ad }) {
  const content =
    ad.type === "HTML" && ad.htmlCode ? (
      <div dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
    ) : ad.imageUrl ? (
      <img src={ad.imageUrl} alt="Iklan" className="w-full h-auto block" loading="lazy" />
    ) : null;

  if (!content) return null;

  if (ad.targetUrl) {
    return (
      <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={() => handleClick(ad)} className="block">
        {content}
      </a>
    );
  }
  return content;
}

function AdPlaceholder({ size = "banner", className = "" }: { size?: string; className?: string }) {
  const s = sizeStyles[size] || sizeStyles.banner;
  return (
    <div
      className={`flex items-center justify-center bg-surface-container-low rounded-sm ${className}`}
      style={{ maxWidth: s.width, height: s.height, width: "100%", margin: "0 auto" }}
    >
      <div className="flex flex-col items-center gap-1 opacity-30">
        <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">Iklan</span>
        <span className="text-label-sm text-on-surface-variant">{s.label}</span>
      </div>
    </div>
  );
}

export default function BannerAd({ size = "banner", slot, className = "", noWrapper, showPlaceholder = true }: BannerAdProps) {
  const resolvedSlot = slot || sizeToSlot[size] || "BETWEEN_SECTIONS";
  const ad = useAd(resolvedSlot);

  const inner = ad ? <AdContent ad={ad} /> : showPlaceholder ? <AdPlaceholder size={size} /> : null;

  if (!inner) return null;

  if (noWrapper) return inner;

  return (
    <div className={`py-4 ${className}`}>
      <div className="container-main">
        {inner}
      </div>
    </div>
  );
}

export function SidebarAd({ slot = "SIDEBAR", size = "rectangle" }: { slot?: string; size?: string }) {
  const ad = useAd(slot);

  if (ad) {
    const content =
      ad.type === "HTML" && ad.htmlCode ? (
        <div dangerouslySetInnerHTML={{ __html: ad.htmlCode }} className="w-full h-full" />
      ) : ad.imageUrl ? (
        <img src={ad.imageUrl} alt="Iklan" className="w-full h-full object-cover block rounded-sm" loading="lazy" />
      ) : null;

    if (!content) return null;

    if (ad.targetUrl) {
      return (
        <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={() => handleClick(ad)} className="block w-full h-full">
          {content}
        </a>
      );
    }
    return content;
  }

  // Placeholder
  const s = sizeStyles[size] || sizeStyles.rectangle;
  return (
    <div
      className="flex items-center justify-center bg-surface-container-low rounded-sm w-full"
      style={{ height: s.height }}
    >
      <div className="flex flex-col items-center gap-1 opacity-30">
        <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">Iklan</span>
        <span className="text-label-sm text-on-surface-variant">{s.label}</span>
      </div>
    </div>
  );
}

export function InlineAd({ className = "" }: { className?: string }) {
  const ad = useAd("IN_ARTICLE");

  return (
    <div className={`py-3 ${className}`}>
      <div className="container-main">
        {ad ? (
          <AdContent ad={ad} />
        ) : (
          <div className="flex items-center justify-center bg-surface-container-low rounded-sm py-6">
            <div className="flex flex-col items-center gap-1 opacity-30">
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">Iklan</span>
              <span className="text-label-sm text-on-surface-variant">Sponsored Content</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function NativeAd({ className = "" }: { className?: string }) {
  const ad = useAd("IN_ARTICLE");

  return (
    <div className={`rounded-sm bg-surface-container-low p-4 ${className}`}>
      <span className="text-label-sm uppercase tracking-wider text-on-surface-variant/50 mb-2 block">Sponsored</span>
      {ad ? (
        <AdContent ad={ad} />
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-16 w-24 shrink-0 rounded-sm bg-surface-container animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-surface-container animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-surface-container animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
