"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading on route change
    setLoading(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(60), 150);
    const t2 = setTimeout(() => setProgress(80), 400);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div
        className="h-full bg-goto-green shadow-[0_0_10px_rgba(0,170,19,0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}
