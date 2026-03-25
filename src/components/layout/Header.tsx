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
  { name: "Terkini", href: "/terkini" },
  { name: "Laporan Utama", href: "/laporan-utama" },
  { name: "Analisis & Opini", href: "/kategori/analisis" },
  { name: "Live Sidang", href: "/live-sidang" },
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
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <header className="sticky top-0 z-50 bg-forest border-b-2 border-gold">
        <div className="container-main">
          <div className="flex items-center justify-between py-3">
            {/* Logo — text logotype only */}
            <Link href="/" className="group flex shrink-0 items-center">
              <span className="font-sans text-lg text-newsprint font-normal">
                Jurnalis Hukum
              </span>
              <span className="ml-1.5 font-sans text-lg text-newsprint font-bold">
                Bandung
              </span>
            </Link>

            {/* Center nav — desktop */}
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="px-3 py-1.5 text-sm font-medium text-newsprint/70 transition-colors duration-200 hover:text-newsprint"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                {/* Kategori dropdown */}
                <li className="relative">
                  <button
                    onClick={() => setKategoriOpen(!kategoriOpen)}
                    onMouseEnter={() => setKategoriOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-newsprint/70 transition-colors duration-200 hover:text-newsprint"
                  >
                    Kategori
                    <ChevronDown size={14} />
                  </button>
                  {kategoriOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setKategoriOpen(false)}
                      />
                      <div
                        className="absolute left-0 top-full z-20 mt-1 w-56 rounded-card bg-newsprint py-2 shadow-lg"
                        onMouseLeave={() => setKategoriOpen(false)}
                      >
                        {kategoriItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2 text-sm text-press transition-colors hover:bg-paper hover:text-forest"
                            onClick={() => setKategoriOpen(false)}
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
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`rounded-card p-2 transition-colors duration-200 ${
                  searchOpen
                    ? "bg-canopy text-newsprint"
                    : "text-newsprint/70 hover:text-newsprint"
                }`}
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Berlangganan button */}
              <Link
                href="/berlangganan"
                className="hidden sm:inline-flex rounded-card bg-gold px-4 py-1.5 text-sm font-semibold text-press transition-colors hover:bg-wheat"
              >
                Berlangganan
              </Link>

              {/* User area */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-canopy text-xs font-bold text-newsprint transition-opacity hover:opacity-90"
                  >
                    {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-card bg-newsprint py-1 shadow-lg">
                        <div className="border-b border-border px-4 py-2">
                          <p className="text-sm font-medium text-press">
                            {session.user?.name || "User"}
                          </p>
                        </div>
                        <Link
                          href="/panel/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-paper hover:text-forest"
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
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-paper hover:text-forest"
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
                  className="rounded-card p-2 text-newsprint/70 transition-colors hover:text-newsprint"
                >
                  <User size={18} />
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-card p-2 text-newsprint/70 transition-colors hover:text-newsprint lg:hidden"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink"
              />
              <input
                type="text"
                name="q"
                placeholder="Cari berita hukum..."
                className="w-full rounded-card border border-border bg-paper py-2 pl-10 pr-4 text-sm text-press placeholder:text-ink focus:border-forest focus:outline-none"
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
            className={`absolute inset-0 bg-press/40 transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-newsprint transition-transform duration-300 ease-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-sans text-sm font-bold text-press">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-card p-1.5 text-ink transition-colors hover:bg-paper hover:text-press"
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
                    className="flex items-center justify-between rounded-card px-3 py-2.5 text-sm font-medium text-press transition-colors hover:bg-paper hover:text-forest"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    <ChevronRight size={16} className="text-ink" />
                  </Link>
                </li>
              ))}
              {/* Kategori section in mobile */}
              <li className="pt-2">
                <span className="px-3 font-mono text-kicker uppercase tracking-widest text-forest">
                  Kategori
                </span>
              </li>
              {kategoriItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-card px-3 py-2.5 text-sm font-medium text-press transition-colors hover:bg-paper hover:text-forest"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    <ChevronRight size={16} className="text-ink" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border px-5 py-4">
              <Link
                href="/berlangganan"
                className="block w-full rounded-card bg-gold px-4 py-2 text-center text-sm font-semibold text-press transition-colors hover:bg-wheat"
                onClick={() => setMobileMenuOpen(false)}
              >
                Berlangganan
              </Link>
              <span className="mt-2 block text-center font-mono text-meta text-ink">
                Jurnalis Hukum Bandung
              </span>
            </div>
          </div>
        </div>
      </header>
      {/* Thin gold accent line below header */}
      <div className="h-[2px] bg-gold" />
    </>
  );
}
