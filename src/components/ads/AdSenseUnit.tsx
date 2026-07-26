"use client";

import { useEffect, useRef } from "react";

interface AdSenseUnitProps {
  client?: string;
  slot?: string;
  format?: string;
  layout?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: string;
}

/**
 * Dedicated Google AdSense Responsive Unit component for Next.js App Router.
 *
 * Renders an `<ins className="adsbygoogle">` element and safely triggers
 * `(window.adsbygoogle = window.adsbygoogle || []).push({})` on mount.
 *
 * Prevents "AdSense tag already filled" errors during React client navigations
 * and guarantees proper display without clipping (`overflow: visible`).
 */
export default function AdSenseUnit({
  client,
  slot,
  format = "auto",
  layout,
  responsive = true,
  className = "",
  style,
  minHeight = "90px",
}: AdSenseUnitProps) {
  const initialized = useRef(false);
  const adsenseClientId =
    client ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
    "ca-pub-5936356841993880";

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      if (typeof window !== "undefined") {
        const adsbygoogle = ((window as any).adsbygoogle =
          (window as any).adsbygoogle || []);
        adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense initialization error:", err);
    }
  }, []);

  return (
    <div
      className={`w-full overflow-visible my-2 text-center ${className}`}
      style={{ minHeight, ...style }}
    >
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", ...style }}
        data-ad-client={adsenseClientId}
        {...(slot ? { "data-ad-slot": slot } : {})}
        {...(layout ? { "data-ad-layout": layout } : {})}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
