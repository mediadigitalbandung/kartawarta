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
    <header className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-900">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-primary-900 text-white dark:border-gray-800">
        <div className="container-main flex items-center justify-between py-1.5 text-xs">
          <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/panel/dashboard" className="flex items-center gap-1 hover:text-gray-300">
                  <LayoutDashboard size={12} />
                  Panel
                </Link>
                <button onClick={() => signOut()} className="flex items-center gap-1 hover:text-gray-300">
                  <LogOut size={12} />
                  Keluar
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1 hover:text-gray-300">
                <User size={12} />
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-main py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-lg font-bold text-white">
              JH
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-primary-900 dark:text-white">
                Jurnalis Hukum
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bandung</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={toggleDarkMode}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <form action="/search" className="mt-3">
            <input
              type="text"
              name="q"
              placeholder="Cari berita hukum..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              autoFocus
            />
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container-main">
          <ul className="hidden items-center gap-1 md:flex">
            <li>
              <Link
                href="/"
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300"
              >
                Beranda
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden dark:border-gray-800 dark:bg-gray-900">
          <ul className="container-main py-2">
            <li>
              <Link
                href="/"
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Beranda
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
