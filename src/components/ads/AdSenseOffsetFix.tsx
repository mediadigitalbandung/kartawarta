"use client";

import { useEffect } from "react";

/**
 * Dynamic layout offset correction for Google AdSense top and bottom anchor overlay ads.
 *
 * This component resolves navigation and widget overlap issues by:
 * 1. Scanning the DOM for fixed AdSense elements (ins, google-auto-placed, iframes)
 *    and reading their bounding box dimensions.
 * 2. Parsing margins/paddings injected on <html> or <body> tags.
 * 3. Exposing `--adsense-top-offset` and `--adsense-bottom-offset` CSS variables.
 *
 * Optimization: It compares values before calling `style.setProperty` to prevent
 * infinite recursion loops with the MutationObserver.
 */
export default function AdSenseOffsetFix() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    const updateOffset = () => {
      let topOffset = 0;
      let bottomOffset = 0;

      // Strategy 1: Scan DOM directly for fixed/absolute Google AdSense elements near edges
      try {
        const elements = document.querySelectorAll(
          "ins.adsbygoogle, .google-auto-placed, iframe[id^='google_ads'], iframe[id^='aswift']"
        );
        
        const viewportHeight = window.innerHeight;

        for (const el of Array.from(elements)) {
          const rect = el.getBoundingClientRect();
          
          if (rect.height > 0 && rect.width > 0) {
            // Check if element is visually flush with the top of the viewport
            if (rect.top >= -5 && rect.top <= 10) {
              const computedStyle = window.getComputedStyle(el);
              const position = computedStyle.position;
              
              let isFloating = position === "fixed" || position === "absolute";
              let parent = el.parentElement;
              
              // Traverse up to see if any parent element is fixed/absolute
              while (parent && !isFloating && parent !== document.body) {
                const parentStyle = window.getComputedStyle(parent);
                if (parentStyle.position === "fixed" || parentStyle.position === "absolute") {
                  isFloating = true;
                }
                parent = parent.parentElement;
              }
              
              if (isFloating) {
                topOffset = Math.max(topOffset, rect.height);
              }
            }
            
            // Check if element is visually flush with the bottom of the viewport
            if (rect.bottom >= viewportHeight - 10 && rect.bottom <= viewportHeight + 5) {
              const computedStyle = window.getComputedStyle(el);
              const position = computedStyle.position;
              
              let isFloating = position === "fixed" || position === "absolute";
              let parent = el.parentElement;
              
              while (parent && !isFloating && parent !== document.body) {
                const parentStyle = window.getComputedStyle(parent);
                if (parentStyle.position === "fixed" || parentStyle.position === "absolute") {
                  isFloating = true;
                }
                parent = parent.parentElement;
              }
              
              if (isFloating) {
                bottomOffset = Math.max(bottomOffset, rect.height);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error scanning DOM for AdSense elements:", err);
      }

      // Strategy 2: Fallback to html style properties (margin/padding top/bottom)
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

      // Apply dynamic CSS variable offsets to html element ONLY if values changed
      const currentTop = html.style.getPropertyValue("--adsense-top-offset");
      const newTop = topOffset > 0 ? `${topOffset}px` : "";
      if (currentTop !== newTop) {
        if (newTop) {
          html.style.setProperty("--adsense-top-offset", newTop);
        } else {
          html.style.removeProperty("--adsense-top-offset");
        }
      }

      const currentBottom = html.style.getPropertyValue("--adsense-bottom-offset");
      const newBottom = bottomOffset > 0 ? `${bottomOffset}px` : "";
      if (currentBottom !== newBottom) {
        if (newBottom) {
          html.style.setProperty("--adsense-bottom-offset", newBottom);
        } else {
          html.style.removeProperty("--adsense-bottom-offset");
        }
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

    observer.observe(html, { attributes: true, attributeFilter: ["style"], childList: true });
    if (body) {
      observer.observe(body, { attributes: true, attributeFilter: ["style"], childList: true });
    }

    // Polling verification to handle delayed dynamic transitions
    const interval = setInterval(updateOffset, 1500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}
