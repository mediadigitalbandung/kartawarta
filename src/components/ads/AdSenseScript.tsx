"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

interface AdSenseScriptProps {
  adsenseClientId: string;
}

/**
 * Conditional Google AdSense Loader.
 *
 * Excludes `adsbygoogle.js` from loading inside CMS Admin Panel (`/panel/*`)
 * to prevent Auto-Ads from rendering inside admin management pages, while
 * ensuring AdSense loads smoothly on all public website pages.
 */
export default function AdSenseScript({ adsenseClientId }: AdSenseScriptProps) {
  const pathname = usePathname();

  // Do NOT load Google AdSense inside the CMS Admin Panel
  if (pathname?.startsWith("/panel")) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
      crossOrigin="anonymous"
      data-cfasync="false"
      strategy="beforeInteractive"
    />
  );
}
