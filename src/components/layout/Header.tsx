"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Search,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Bookmark,
} from "lucide-react";

const categoryNav = [
  { name: "Terkini", href: "/" },
  { name: "Hukum", href: "/kategori/hukum" },
  { name: "Bisnis", href: "/kategori/bisnis-ekonomi" },
  { name: "Olahraga", href: "/kategori/olahraga" },
  { name: "Hiburan", href: "/kategori/hiburan" },
  { name: "Kesehatan", href: "/kategori/kesehatan" },
  { name: "Pertanian", href: "/kategori/pertanian-peternakan" },
  { name: "Teknologi", href: "/kategori/teknologi" },
  { name: "Politik", href: "/kategori/politik" },
  { name: "Pendidikan", href: "/kategori/pendidikan" },
  { name: "Lingkungan", href: "/kategori/lingkungan" },
  { name: "Gaya Hidup", href: "/kategori/gaya-hidup" },
  { name: "Opini", href: "/kategori/opini" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 150 && y > lastY) {
        setScrolled(true);
      } else if (y < 100) {
        setScrolled(false);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Row 1: Top bar — White header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100" role="banner" aria-label="Header utama">
        <div className="container-main">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-3">
              <Image
                src="/kartawarta-icon.png"
                alt="Kartawarta"
                width={96}
                height={96}
                className="h-9 w-9 sm:h-12 sm:w-12 object-contain"
                quality={100}
                priority
              />
              <span className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-serif text-sm font-bold text-primary sm:text-2xl lg:text-3xl tracking-tight">
                  Kartawarta
                </span>
              </span>
            </Link>

            {/* Right: Date + Search + actions */}
            <div className="flex items-center gap-3">
            {/* Live date */}
            <span className="hidden text-label-sm text-gray-500 md:block uppercase tracking-wider">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <div className="hidden h-4 w-px bg-gray-200 md:block" />
            {/* Search */}
            <form action="/search" className="relative hidden md:block md:w-64 lg:w-80" role="search" aria-label="Pencarian artikel">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                name="q"
                placeholder="Cari berita..."
                aria-label="Cari artikel"
                className="w-full rounded-md bg-white border border-gray-200 py-2 pl-10 pr-4 text-body-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </form>

              {/* Bookmark link */}
              <Link
                href="/bookmark"
                className="hidden md:flex items-center gap-1.5 rounded-md px-3 py-1.5 text-label-sm font-medium text-gray-500 transition-colors hover:text-primary hover:bg-gray-50"
                title="Bookmark Saya"
              >
                <Bookmark size={14} />
                <span className="hidden lg:inline">Bookmark</span>
              </Link>

              {/* User area */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-label-lg font-bold text-primary transition-all hover:bg-gray-200"
                    aria-label="Menu pengguna"
                    aria-expanded={userMenuOpen}
                  >
                    {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-md bg-surface-container-lowest py-1 shadow-ambient">
                        <div className="px-4 py-2.5">
                          <p className="text-title-sm text-on-surface">
                            {session.user?.name || "User"}
                          </p>
                        </div>
                        <div className="h-px bg-surface-container" />
                        <Link
                          href="/panel/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={14} />
                          Panel
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                        >
                          <LogOut size={14} />
                          Keluar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-gray-500 transition-colors hover:text-primary hover:bg-gray-50 lg:hidden"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          {/* Mobile search bar */}
          <div className={`overflow-hidden md:hidden transition-all duration-500 ease-in-out ${scrolled || mobileMenuOpen ? "max-h-0 pb-0 opacity-0 -translate-y-2" : "max-h-14 pb-3 opacity-100 translate-y-0"}`}>
            <form action="/search" className="relative" role="search" aria-label="Pencarian artikel (mobile)">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                name="q"
                placeholder="Cari berita..."
                aria-label="Cari artikel"
                className="w-full rounded-md bg-white border border-gray-200 py-2 pl-10 pr-4 text-body-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </form>
          </div>
        </div>
      </header>

      {/* Row 2: Category navigation */}
      <nav className="bg-[#1C1C1E] relative border-b border-[#2C2C2E]" aria-label="Navigasi kategori">
        <div className="container-main">
          <ul className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {categoryNav.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={`relative inline-block px-2.5 sm:px-3 py-3 text-label-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-white font-bold after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-[2px] after:bg-primary"
                      : "text-white/70 font-medium hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile slide-in panel */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-surface-container-lowest transition-transform duration-300 ease-out shadow-ambient-lg ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-title-sm text-on-surface">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(100vh - 130px)" }}>
            <div className="px-3 py-2">
              <span className="px-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Kategori
              </span>
            </div>
            <ul className="space-y-0.5 px-3 pb-3">
              {categoryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 text-body-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    <ChevronRight size={16} className="text-on-surface-variant" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="px-3 py-2">
              <span className="px-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Lainnya
              </span>
            </div>
            <ul className="space-y-0.5 px-3 pb-3">
              <li>
                <Link
                  href="/bookmark"
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-body-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark size={16} className="text-primary" />
                  Bookmark Saya
                </Link>
              </li>
            </ul>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
            <span className="block text-center text-label-sm text-on-surface-variant">
              Kartawarta
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
