"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete the loading bar when route actually changes
  const completeLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 400);
  }, []);

  // Listen for route changes to complete
  useEffect(() => {
    if (loading) {
      completeLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Intercept all <a> clicks to start loading immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, anchors, and same-page links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank"
      ) return;

      // Skip if same page
      if (href === pathname) return;

      // Start loading immediately on click
      setLoading(true);
      setProgress(20);

      // Animate progress
      setTimeout(() => setProgress(45), 100);
      setTimeout(() => setProgress(65), 300);
      setTimeout(() => setProgress(80), 600);
      // Safety: auto-complete after 3s if route hasn't changed
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 400);
      }, 3000);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div
        className="h-full bg-goto-green transition-all ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
          transitionDuration: progress === 100 ? "400ms" : "300ms",
          boxShadow: "0 0 10px rgba(0,170,19,0.5), 0 0 5px rgba(0,170,19,0.3)",
        }}
      />
    </div>
  );
}
