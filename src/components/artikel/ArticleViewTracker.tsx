"use client";

import { useEffect } from "react";

interface ArticleViewTrackerProps {
  articleId: string;
}

/**
 * Client-side view tracker component for articles.
 * Triggers a beacon/fetch ping ONLY when a real human browser loads and renders
 * the article page, ensuring view counts align accurately with Google Search Console
 * and Google AdSense pageviews.
 */
export default function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  useEffect(() => {
    if (!articleId) return;

    try {
      const storageKey = `kw_view_${articleId}`;
      // Prevent duplicate count within the same browser session
      if (sessionStorage.getItem(storageKey)) return;

      sessionStorage.setItem(storageKey, "1");

      const payload = JSON.stringify({ articleId });

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/articles/view", blob);
      } else {
        fetch("/api/articles/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Ignore storage restricted or privacy mode errors
    }
  }, [articleId]);

  return null;
}
