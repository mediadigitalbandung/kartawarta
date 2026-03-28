"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import TrendingTags from "./TrendingTags";

export default function PublicNav() {
  const pathname = usePathname();
  const isPanel = pathname.startsWith("/panel");

  if (isPanel) return null;

  return (
    <>
      <Header />
      <TrendingTags />
    </>
  );
}
