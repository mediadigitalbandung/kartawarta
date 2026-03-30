"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PollOption {
  label: string;
  percentage: number;
}

interface Poll {
  question: string;
  image?: string;
  options: PollOption[];
  totalVotes: number;
}

export default function PollingCarousel({ items }: { items: Poll[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 340;
    const gap = 16;
    const amount = (cardWidth + gap) * (direction === "left" ? -1 : 1);
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  return (
    <div className="relative group">
      {/* Navigation arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-lg border border-border text-txt-primary hover:bg-surface-secondary transition-all opacity-0 group-hover:opacity-100"
          aria-label="Geser kiri"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-lg border border-border text-txt-primary hover:bg-surface-secondary transition-all opacity-0 group-hover:opacity-100"
          aria-label="Geser kanan"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
      >
        {items.map((poll, idx) => (
          <div
            key={idx}
            className="shrink-0 w-[300px] sm:w-[340px] rounded-xl border border-border bg-surface-secondary overflow-hidden hover:shadow-card-hover transition-shadow"
          >
            {poll.image && (
              <div className="relative w-full aspect-[2/1]">
                <Image
                  src={poll.image}
                  alt={poll.question}
                  fill
                  className="object-cover"
                  sizes="340px"
                />
              </div>
            )}
            <div className="p-5">
              <p className="text-sm font-semibold text-txt-primary mb-4 leading-snug">
                {poll.question}
              </p>
              <div className="space-y-2.5">
                {poll.options.map((opt) => {
                  const isTop = opt.percentage === Math.max(...poll.options.map(o => o.percentage));
                  return (
                    <div key={opt.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-txt-primary text-xs">{opt.label}</span>
                        <span className={`font-bold text-xs ${isTop ? "text-goto-green" : "text-txt-primary"}`}>
                          {opt.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isTop ? "bg-goto-green" : "bg-goto-green/40"}`}
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-txt-muted mt-3">
                {poll.totalVotes.toLocaleString("id-ID")} suara
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!scrollRef.current) return;
              const cardWidth = 340 + 16;
              scrollRef.current.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
              setTimeout(checkScroll, 400);
            }}
            className="h-1.5 w-1.5 rounded-full bg-border hover:bg-goto-green transition-colors"
            aria-label={`Polling ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
