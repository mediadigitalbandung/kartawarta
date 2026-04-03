"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function PublicNav() {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/panel") || pathname === "/login";

  if (hideNav) return null;

  return (
    <>
      <Header />
    </>
  );
}
