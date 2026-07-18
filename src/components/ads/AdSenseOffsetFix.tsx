"use client";

import { useEffect } from "react";

/**
 * Dynamic layout correction for Google AdSense top and bottom anchor overlay ads.
 *
 * This component uses a dual-strategy to resolve overlaps:
 * 1. It directly scans the DOM for fixed AdSense containers (ins, google-auto-placed, iframes)
 *    and measures their heights.
 * 2. It checks for margin-top/padding-top/margin-bottom/padding-bottom styles injected on
 *    <html> or <body> tags.
 *
 * It exposes two CSS variables on the root:
 * - `--adsense-top-offset` (used to push down sticky header navigation)
 * - `--adsense-bottom-offset` (used to push up bottom PWA install prompts / widgets)
 *
 * It listens to both style mutations and childList modifications on <body> to handle
 * ads injected dynamically and asynchronously.
 */
export default function AdSenseOffsetFix() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    const updateOffset = () => {
      let topOffset = 0;
      let bottomOffset = 0;

      // Strategy 1: Scan DOM directly for fixed Google AdSense elements
      try {
        const elements = document.querySelectorAll(
          "ins.adsbygoogle, .google-auto-placed, iframe[id^='google_ads']"
        );
        for (const el of Array.from(elements)) {
          const computedStyle = window.getComputedStyle(el);
          const position = computedStyle.position;
          
          if (position === "fixed") {
            const rect = el.getBoundingClientRect();
            if (rect.height > 0 && rect.width > 0) {
              const top = computedStyle.top;
              const bottom = computedStyle.bottom;
              
              if (top === "0px" || top.startsWith("0")) {
                topOffset = Math.max(topOffset, rect.height);
              } else if (bottom === "0px" || bottom.startsWith("0")) {
                bottomOffset = Math.max(bottomOffset, rect.height);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error scanning DOM for AdSense elements:", err);
      }

      // Strategy 2: Fallback to html style properties (margin-top / padding-top / margin-bottom / padding-bottom)
      if (topOffset === 0) {
        const htmlMarginTop = html.style.marginTop || getComputedStyle(html).marginTop;
        if (htmlMarginTop && htmlMarginTop !== "0px") {
          const parsed = parseInt(htmlMarginTop, 10);
          if (!isNaN(parsed) && parsed > 0) topOffset = parsed;
        }
      }
      if (topOffset === 0) {
        const htmlPaddingTop = html.style.paddingTop || getComputedStyle(html).paddingTop;
        if (htmlPaddingTop && htmlPaddingTop !== "0px") {
          const parsed = parseInt(htmlPaddingTop, 10);
          if (!isNaN(parsed) && parsed > 0) topOffset = parsed;
        }
      }

      if (bottomOffset === 0) {
        const htmlMarginBottom = html.style.marginBottom || getComputedStyle(html).marginBottom;
        if (htmlMarginBottom && htmlMarginBottom !== "0px") {
          const parsed = parseInt(htmlMarginBottom, 10);
          if (!isNaN(parsed) && parsed > 0) bottomOffset = parsed;
        }
      }
      if (bottomOffset === 0) {
        const htmlPaddingBottom = html.style.paddingBottom || getComputedStyle(html).paddingBottom;
        if (htmlPaddingBottom && htmlPaddingBottom !== "0px") {
          const parsed = parseInt(htmlPaddingBottom, 10);
          if (!isNaN(parsed) && parsed > 0) bottomOffset = parsed;
        }
      }

      // Strategy 3: Fallback to body style properties
      if (body) {
        if (topOffset === 0) {
          const bodyPaddingTop = body.style.paddingTop || getComputedStyle(body).paddingTop;
          if (bodyPaddingTop && bodyPaddingTop !== "0px") {
            const parsed = parseInt(bodyPaddingTop, 10);
            if (!isNaN(parsed) && parsed > 0) topOffset = parsed;
          }

          const bodyMarginTop = body.style.marginTop || getComputedStyle(body).marginTop;
          if (bodyMarginTop && bodyMarginTop !== "0px") {
            const parsed = parseInt(bodyMarginTop, 10);
            if (!isNaN(parsed) && parsed > 0) topOffset = parsed;
          }
        }

        if (bottomOffset === 0) {
          const bodyPaddingBottom = body.style.paddingBottom || getComputedStyle(body).paddingBottom;
          if (bodyPaddingBottom && bodyPaddingBottom !== "0px") {
            const parsed = parseInt(bodyPaddingBottom, 10);
            if (!isNaN(parsed) && parsed > 0) bottomOffset = parsed;
          }

          const bodyMarginBottom = body.style.marginBottom || getComputedStyle(body).marginBottom;
          if (bodyMarginBottom && bodyMarginBottom !== "0px") {
            const parsed = parseInt(bodyMarginBottom, 10);
            if (!isNaN(parsed) && parsed > 0) bottomOffset = parsed;
          }
        }
      }

      // Apply dynamic CSS variable offsets to html element
      if (topOffset > 0) {
        html.style.setProperty("--adsense-top-offset", `${topOffset}px`);
      } else {
        html.style.removeProperty("--adsense-top-offset");
      }

      if (bottomOffset > 0) {
        html.style.setProperty("--adsense-bottom-offset", `${bottomOffset}px`);
      } else {
        html.style.removeProperty("--adsense-bottom-offset");
      }
    };

    // Run initial scan
    updateOffset();

    // Set up MutationObserver to react to style changes and added DOM ad nodes
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (const mutation of mutations) {
        if (mutation.attributeName === "style") {
          shouldUpdate = true;
          break;
        }
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) {
        updateOffset();
      }
    });

    observer.observe(html, { attributes: true, attributeFilter: ["style"] });
    if (body) {
      observer.observe(body, { attributes: true, attributeFilter: ["style"], childList: true });
    }

    // Occasional polling verification (handles any delayed lazy iframe sizing transitions)
    const interval = setInterval(updateOffset, 2000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}
