"use client";

import { useState, useEffect } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const articleEl = document.querySelector(".article-content");
      if (!articleEl) return;

      const rect = articleEl.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Calculate how far into the article the user has scrolled
      const start = articleTop;
      const end = articleTop + articleHeight - windowHeight;

      if (scrollY <= start) {
        setProgress(0);
      } else if (scrollY >= end) {
        setProgress(100);
      } else {
        const pct = ((scrollY - start) / (end - start)) * 100;
        setProgress(Math.min(100, Math.max(0, pct)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[110] h-[2px] bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progres membaca artikel"
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
