"use client";

import { useState, useEffect } from "react";

interface ScrollableContainerProps {
  children: React.ReactNode;
  maxHeight?: number;
  mobileOnly?: boolean;
  className?: string;
}

export default function ScrollableContainer({
  children,
  maxHeight = 900,
  mobileOnly = true,
  className = "",
}: ScrollableContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const shouldScroll = mobileOnly ? isMobile : true;

  if (!shouldScroll) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`overflow-y-auto overscroll-contain scrollbar-hide ${className}`}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      {children}
    </div>
  );
}
