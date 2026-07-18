"use client";

import { useEffect } from "react";

/**
 * Dynamic layout correction for Google AdSense top anchor overlay ads.
 *
 * Google's top anchor ads dynamically inject an inline `margin-top` or `padding-top`
 * on the <html> or <body> tags. Since sticky/fixed headers are positioned relative
 * to the viewport (top: 0), they ignore these page margins and end up overlapping
 * the ad.
 *
 * This component uses a MutationObserver to watch for style changes on the html/body
 * elements, parses the pixel offset, and sets a CSS variable `--adsense-top-offset`
 * which we use in globals.css to push the sticky header down safely.
 */
export default function AdSenseOffsetFix() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    const updateOffset = () => {
      let offset = 0;

      // 1. Check html margin-top (Google AdSense standard top anchor behaviour)
      const htmlMarginTop = html.style.marginTop || getComputedStyle(html).marginTop;
      if (htmlMarginTop && htmlMarginTop !== "0px") {
        const parsed = parseInt(htmlMarginTop, 10);
        if (!isNaN(parsed) && parsed > 0) {
          offset = parsed;
        }
      }

      // 2. Check body padding-top or margin-top (fallback layout modes)
      if (offset === 0 && body) {
        const bodyPaddingTop = body.style.paddingTop || getComputedStyle(body).paddingTop;
        if (bodyPaddingTop && bodyPaddingTop !== "0px") {
          const parsed = parseInt(bodyPaddingTop, 10);
          if (!isNaN(parsed) && parsed > 0) {
            offset = parsed;
          }
        }

        const bodyMarginTop = body.style.marginTop || getComputedStyle(body).marginTop;
        if (offset === 0 && bodyMarginTop && bodyMarginTop !== "0px") {
          const parsed = parseInt(bodyMarginTop, 10);
          if (!isNaN(parsed) && parsed > 0) {
            offset = parsed;
          }
        }
      }

      // Apply detected height offset to root variable
      if (offset > 0) {
        html.style.setProperty("--adsense-top-offset", `${offset}px`);
      } else {
        html.style.removeProperty("--adsense-top-offset");
      }
    };

    // Run initial scan
    updateOffset();

    // Set up MutationObserver to detect style adjustments made by AdSense scripts
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "style") {
          updateOffset();
        }
      }
    });

    observer.observe(html, { attributes: true, attributeFilter: ["style"] });
    if (body) {
      observer.observe(body, { attributes: true, attributeFilter: ["style"] });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
