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
  slim: "HEADER",
  leaderboard: "BETWEEN_SECTIONS",
  billboard: "BETWEEN_SECTIONS",
  sidebar: "SIDEBAR",
  inline: "IN_ARTICLE",
};

interface BannerAdProps {
  size?: "leaderboard" | "billboard" | "sidebar" | "inline" | "slim";
  slot?: string;
  className?: string;
}

export default function BannerAd({ size, slot, className = "" }: BannerAdProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const tracked = useRef(false);
  const adSlot = slot || (size ? sizeToSlot[size] : "HEADER");

  useEffect(() => {
    tracked.current = false;
    fetch(`/api/ads?slot=${adSlot}`)
      .then((r) => r.json())
      .then((json) => {
        const ads: Ad[] = json.data || [];
        if (ads.length > 0) {
          // Pick random ad from active ones for variety
          const picked = ads[Math.floor(Math.random() * ads.length)];
          setAd(picked);
        }
      })
      .catch(() => {});
  }, [adSlot]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (ad && !tracked.current) {
      tracked.current = true;
      fetch(`/api/ads/${ad.id}/track?type=impression`, { method: "POST" }).catch(() => {});
    }
  }, [ad]);

  if (!ad) return null;

  function handleClick() {
    if (ad) {
      fetch(`/api/ads/${ad.id}/track?type=click`, { method: "POST" }).catch(() => {});
    }
  }

  const adContent =
    ad.type === "HTML" && ad.htmlCode ? (
      <div dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
    ) : ad.imageUrl ? (
      <img
        src={ad.imageUrl}
        alt="Iklan"
        className="w-full h-auto rounded-lg"
        loading="lazy"
      />
    ) : null;

  if (!adContent) return null;

  return (
    <div className={`py-2 ${className}`}>
      <div className="container-main">
        {ad.targetUrl ? (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="block"
          >
            {adContent}
          </a>
        ) : (
          adContent
        )}
      </div>
    </div>
  );
}

export function SidebarAd({ slot = "SIDEBAR" }: { slot?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    tracked.current = false;
    fetch(`/api/ads?slot=${slot}`)
      .then((r) => r.json())
      .then((json) => {
        const ads: Ad[] = json.data || [];
        if (ads.length > 0) {
          setAd(ads[Math.floor(Math.random() * ads.length)]);
        }
      })
      .catch(() => {});
  }, [slot]);

  useEffect(() => {
    if (ad && !tracked.current) {
      tracked.current = true;
      fetch(`/api/ads/${ad.id}/track?type=impression`, { method: "POST" }).catch(() => {});
    }
  }, [ad]);

  if (!ad) return null;

  function handleClick() {
    if (ad) {
      fetch(`/api/ads/${ad.id}/track?type=click`, { method: "POST" }).catch(() => {});
    }
  }

  const adContent =
    ad.type === "HTML" && ad.htmlCode ? (
      <div dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
    ) : ad.imageUrl ? (
      <img
        src={ad.imageUrl}
        alt="Iklan"
        className="w-full h-auto rounded-lg"
        loading="lazy"
      />
    ) : null;

  if (!adContent) return null;

  return ad.targetUrl ? (
    <a
      href={ad.targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="block"
    >
      {adContent}
    </a>
  ) : (
    adContent
  );
}
