"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { name: "Beranda", href: "/" },
  { name: "Hukum Pidana", href: "/kategori/hukum-pidana" },
  { name: "Hukum Perdata", href: "/kategori/hukum-perdata" },
  { name: "Hukum Tata Negara", href: "/kategori/hukum-tata-negara" },
  { name: "HAM", href: "/kategori/ham" },
  { name: "Opini", href: "/kategori/opini" },
];

const moreItems = [
  { name: "Berita Bandung", href: "/kategori/berita-bandung" },
  { name: "Analisis", href: "/kategori/analisis" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="container-main">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white">
              JH
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold leading-tight text-text-primary">
                Jurnalis Hukum
              </span>
              <span className="ml-1.5 text-sm text-text-muted">Bandung</span>
            </div>
          </Link>

          {/* Center nav - desktop */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {/* Lainnya dropdown */}
              <li className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-white"
                >
                  Lainnya
                  <ChevronDown size={14} />
                </button>
                {moreOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMoreOpen(false)}
                    />
                    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-bg-card py-1 shadow-lg">
                      {moreItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-white"
                          onClick={() => setMoreOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </li>
            </ul>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-lg p-2 transition-colors duration-200 ${
                searchOpen
                  ? "bg-bg-hover text-white"
                  : "text-text-secondary hover:bg-bg-hover hover:text-white"
              }`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* User area */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-border bg-bg-card py-1 shadow-lg">
                      <div className="border-b border-border px-4 py-2">
                        <p className="text-sm font-medium text-white">
                          {session.user?.name || "User"}
                        </p>
                      </div>
                      <Link
                        href="/panel/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-white"
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
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-white"
                      >
                        <LogOut size={14} />
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Masuk
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover hover:text-white lg:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar slide-down */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          searchOpen ? "max-h-16" : "max-h-0"
        }`}
      >
        <div className="container-main pb-3">
          <form action="/search" className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              name="q"
              placeholder="Cari berita hukum..."
              className="w-full rounded-lg border border-border bg-bg-secondary py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              autoFocus={searchOpen}
            />
          </form>
        </div>
      </div>

      {/* Mobile slide-in panel */}
      <div
        className={`fixed inset-0 top-0 z-40 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-bg-card transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                JH
              </div>
              <span className="text-sm font-bold text-white">Menu</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile nav items */}
          <ul className="space-y-0.5 px-3 py-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <ChevronRight size={16} className="text-text-muted" />
                </Link>
              </li>
            ))}
            {moreItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <ChevronRight size={16} className="text-text-muted" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border px-5 py-4">
            <span className="text-xs text-text-muted">
              Jurnalis Hukum Bandung
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
