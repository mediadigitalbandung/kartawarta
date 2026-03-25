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

const mainNav = [
  { name: "Beranda", href: "/" },
  { name: "Hukum Pidana", href: "/kategori/hukum-pidana" },
  { name: "Hukum Perdata", href: "/kategori/hukum-perdata" },
  { name: "Hukum Tata Negara", href: "/kategori/hukum-tata-negara" },
  { name: "HAM", href: "/kategori/ham" },
  { name: "Opini", href: "/kategori/opini" },
];

const kategoriItems = [
  { name: "Hukum Pidana", href: "/kategori/hukum-pidana" },
  { name: "Hukum Perdata", href: "/kategori/hukum-perdata" },
  { name: "Hukum Tata Negara", href: "/kategori/hukum-tata-negara" },
  { name: "Hukum Administrasi", href: "/kategori/hukum-administrasi" },
  { name: "HAM", href: "/kategori/ham" },
  { name: "Hukum Bisnis", href: "/kategori/hukum-bisnis" },
  { name: "Hukum Lingkungan", href: "/kategori/hukum-lingkungan" },
  { name: "Berita Bandung", href: "/kategori/berita-bandung" },
  { name: "Opini", href: "/kategori/opini" },
  { name: "Koreksi & Klarifikasi", href: "/kode-etik" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-surface shadow-nav">
      <div className="container-main">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-goto-green text-sm font-bold text-white">
              JH
            </span>
            <span className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-txt-primary">
                Jurnalis Hukum
              </span>
              <span className="text-sm text-txt-secondary">Bandung</span>
            </span>
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-txt-secondary transition-colors duration-200 hover:text-goto-green"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-full p-2 transition-colors duration-200 ${
                searchOpen
                  ? "bg-goto-light text-goto-green"
                  : "text-txt-secondary hover:text-goto-green"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* User area */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-goto-green text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-[12px] border border-border bg-surface py-1 shadow-card-hover">
                      <div className="border-b border-border px-4 py-2.5">
                        <p className="text-sm font-medium text-txt-primary">
                          {session.user?.name || "User"}
                        </p>
                      </div>
                      <Link
                        href="/panel/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-surface-secondary hover:text-goto-green"
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
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-surface-secondary hover:text-goto-green"
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
                className="hidden sm:inline-flex items-center rounded-full border border-goto-green px-4 py-1.5 text-sm font-semibold text-goto-green transition-colors hover:bg-goto-green hover:text-white"
              >
                Masuk
              </Link>
            )}

            {/* Mobile: login icon fallback */}
            {!session && (
              <Link
                href="/login"
                className="rounded-full p-2 text-txt-secondary transition-colors hover:text-goto-green sm:hidden"
              >
                <User size={18} />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-txt-secondary transition-colors hover:text-goto-green lg:hidden"
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
        <div className="container-main pb-4">
          <form action="/search" className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted"
            />
            <input
              type="text"
              name="q"
              placeholder="Cari berita hukum..."
              className="w-full rounded-[12px] border border-border bg-surface-secondary py-2.5 pl-10 pr-4 text-sm text-txt-primary placeholder:text-txt-muted focus:border-goto-green focus:outline-none focus:ring-1 focus:ring-goto-green/20"
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
          className={`absolute inset-0 bg-surface-dark/40 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-surface transition-transform duration-300 ease-out shadow-card-hover ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-sm font-bold text-txt-primary">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full p-1.5 text-txt-secondary transition-colors hover:bg-surface-secondary hover:text-txt-primary"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile nav items */}
          <ul className="space-y-0.5 px-3 py-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-[12px] px-3 py-2.5 text-sm font-medium text-txt-primary transition-colors hover:bg-surface-secondary hover:text-goto-green"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <ChevronRight size={16} className="text-txt-muted" />
                </Link>
              </li>
            ))}
            {/* Kategori section in mobile */}
            <li className="pt-3">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-txt-muted">
                Kategori
              </span>
            </li>
            {kategoriItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-[12px] px-3 py-2.5 text-sm font-medium text-txt-primary transition-colors hover:bg-surface-secondary hover:text-goto-green"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <ChevronRight size={16} className="text-txt-muted" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border px-5 py-4">
            {!session && (
              <Link
                href="/login"
                className="block w-full rounded-full bg-goto-green px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-goto-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                Masuk
              </Link>
            )}
            <span className="mt-2 block text-center text-xs text-txt-muted">
              Jurnalis Hukum Bandung
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
