"use client";

import { useState, useEffect } from "react";

const SIZES = [
  { label: "A-", value: 15 },
  { label: "A", value: 17 },
  { label: "A+", value: 20 },
];

const STORAGE_KEY = "jhb-font-size";

export default function FontSizeControl() {
  const [activeIndex, setActiveIndex] = useState(1); // default: normal (17px)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const idx = SIZES.findIndex((s) => s.value === Number(saved));
      if (idx !== -1) {
        setActiveIndex(idx);
        applySize(SIZES[idx].value);
      }
    }
  }, []);

  function applySize(px: number) {
    const el = document.querySelector(".article-content") as HTMLElement | null;
    if (el) {
      el.style.fontSize = `${px}px`;
    }
  }

  function handleChange(index: number) {
    setActiveIndex(index);
    const size = SIZES[index].value;
    applySize(size);
    localStorage.setItem(STORAGE_KEY, String(size));
  }

  return (
    <div
      className="no-print fixed right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-1 rounded-full border border-border bg-surface p-1 shadow-card"
      role="group"
      aria-label="Ukuran font artikel"
    >
      {SIZES.map((size, i) => (
        <button
          key={size.label}
          onClick={() => handleChange(i)}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            activeIndex === i
              ? "bg-goto-green text-white"
              : "text-txt-secondary hover:bg-surface-secondary hover:text-txt-primary"
          }`}
          title={`Ukuran font ${size.label}`}
          aria-label={`Ukuran font ${size.label} (${size.value}px)`}
          aria-pressed={activeIndex === i}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}
