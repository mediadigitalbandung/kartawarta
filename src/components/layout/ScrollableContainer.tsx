"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScrollableContainerProps {
  children: React.ReactNode;
  maxItems?: number;
  mobileOnly?: boolean;
  className?: string;
  label?: string;
}

export default function ScrollableContainer({
  children,
  maxItems = 5,
  mobileOnly = true,
  className = "",
  label = "Lihat Lebih Banyak",
}: ScrollableContainerProps) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const collapsedHeight = maxItems * 120; // ~120px per item estimate

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsScroll(contentRef.current.scrollHeight > collapsedHeight);
    }
  }, [children, collapsedHeight]);

  const shouldLimit = mobileOnly ? isMobile && needsScroll : needsScroll;

  if (!shouldLimit) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {/* Scrollable content area */}
      <div
        ref={contentRef}
        className="relative overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: expanded ? `${contentRef.current?.scrollHeight || 9999}px` : `${collapsedHeight}px` }}
      >
        {children}

        {/* Fade overlay when collapsed */}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Toggle button */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-txt-secondary transition-all hover:border-goto-green hover:text-goto-green active:scale-95"
        >
          {expanded ? (
            <>
              Tampilkan Lebih Sedikit
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              {label}
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
