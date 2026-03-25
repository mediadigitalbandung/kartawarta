"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

const categories = [
  { name: "Hukum Pidana", slug: "hukum-pidana" },
  { name: "Hukum Perdata", slug: "hukum-perdata" },
  { name: "Hukum Tata Negara", slug: "hukum-tata-negara" },
  { name: "HAM", slug: "ham" },
  { name: "Opini", slug: "opini" },
  { name: "Berita Bandung", slug: "berita-bandung" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { data: session } = useSession();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Gradient top bar */}
      <div className="bg-primary-gradient text-white">
        <div className="container-main flex items-center justify-between py-2 text-xs">
          <span className="font-medium tracking-wide opacity-90">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                {/* Avatar initial badge */}
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold backdrop-blur-sm">
                    {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden font-medium sm:inline">
                    {session.user?.name || "User"}
                  </span>
                </div>
                <div className="h-3 w-px bg-white/30" />
                <Link
                  href="/panel/dashboard"
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
                >
                  <LayoutDashboard size={12} />
                  Panel
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 rounded-full px-2 py-1 font-medium transition-all duration-200 hover:bg-white/10"
                >
                  <LogOut size={12} />
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
              >
                <User size={12} />
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header with glassmorphism */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-900/80">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            {/* Logo with gradient background */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary-gradient text-lg font-extrabold text-white shadow-md shadow-primary-500/25 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary-500/30 group-hover:-translate-y-0.5">
                JH
                <div className="absolute -inset-px rounded-xl bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
                  Jurnalis Hukum
                </h1>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-500 dark:text-primary-400">
                  Bandung
                </p>
              </div>
            </Link>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`rounded-xl p-2.5 transition-all duration-200 ${
                  searchOpen
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                }`}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={2.5} />
              </button>

              {/* Dark mode toggle with smooth icon transition */}
              <button
                onClick={toggleDarkMode}
                className="relative rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label="Toggle dark mode"
              >
                <div className="relative h-5 w-5">
                  <Sun
                    size={20}
                    strokeWidth={2.5}
                    className={`absolute inset-0 transition-all duration-300 ${
                      darkMode
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-90 scale-0 opacity-0"
                    }`}
                  />
                  <Moon
                    size={20}
                    strokeWidth={2.5}
                    className={`absolute inset-0 transition-all duration-300 ${
                      darkMode
                        ? "-rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                    }`}
                  />
                </div>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label="Menu"
              >
                <div className="relative h-5 w-5">
                  <X
                    size={20}
                    strokeWidth={2.5}
                    className={`absolute inset-0 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-90 scale-0 opacity-0"
                    }`}
                  />
                  <Menu
                    size={20}
                    strokeWidth={2.5}
                    className={`absolute inset-0 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "-rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Animated search bar */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              searchOpen
                ? "mt-4 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <form action="/search" className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="q"
                  placeholder="Cari berita hukum..."
                  className="input pl-11 pr-4"
                  autoFocus={searchOpen}
                />
              </form>
            </div>
          </div>
        </div>

        {/* Pill-shaped navigation */}
        <div className="container-main pb-3">
          <nav>
            <ul className="hidden items-center gap-1 md:flex">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                >
                  Beranda
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Modern mobile menu with slide-in animation */}
      <div
        className={`fixed inset-0 top-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-900 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile menu header */}
          <div className="flex items-center justify-between border-b border-gray-200/60 px-6 py-4 dark:border-gray-800/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-gradient text-sm font-extrabold text-white shadow-md shadow-primary-500/25">
                JH
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Menu
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Mobile menu items */}
          <ul className="space-y-1 px-4 py-4">
            <li>
              <Link
                href="/"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Beranda
                <ChevronRight
                  size={16}
                  className="text-gray-400 dark:text-gray-600"
                />
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                  <ChevronRight
                    size={16}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile menu footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200/60 px-6 py-4 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Jurnalis Hukum Bandung
              </span>
              <button
                onClick={toggleDarkMode}
                className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {darkMode ? (
                  <Sun size={18} strokeWidth={2.5} />
                ) : (
                  <Moon size={18} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
