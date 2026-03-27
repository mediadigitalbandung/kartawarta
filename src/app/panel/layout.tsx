"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Megaphone,
  Flag,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/panel/dashboard", icon: LayoutDashboard },
  { name: "Artikel", href: "/panel/artikel", icon: FileText },
  { name: "Laporan", href: "/panel/laporan", icon: Flag },
  { name: "Iklan", href: "/panel/iklan", icon: Megaphone, adminOnly: true },
  { name: "Pengguna", href: "/panel/pengguna", icon: Users, adminOnly: true },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-goto-green border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "CHIEF_EDITOR";

  const sidebarContent = (
    <div className="flex h-full flex-col px-3 py-4">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5"
      >
        <ChevronLeft size={16} />
        Kembali ke Situs
      </Link>

      <nav className="flex-1 space-y-1">
        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-goto-green/10 text-goto-green"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-goto-green text-sm font-bold text-white">
            {session.user.name?.charAt(0)}
          </div>
          <div className="truncate">
            <p className="truncate text-sm font-medium text-white">
              {session.user.name}
            </p>
            <p className="text-xs text-white/50">
              {session.user.role.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop: always visible, mobile: slide-in */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-60 bg-surface-dark pt-16 transition-transform duration-200",
            "lg:translate-x-0 lg:z-40",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-4 rounded-lg p-1 text-white/60 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-60">
          {/* Top bar — mobile only */}
          <div className="sticky top-0 z-30 flex items-center bg-surface border-b border-border h-14 px-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-txt-primary hover:bg-surface-secondary"
            >
              <Menu size={22} />
            </button>
            <span className="ml-3 text-sm font-semibold text-txt-primary">Panel Admin</span>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
