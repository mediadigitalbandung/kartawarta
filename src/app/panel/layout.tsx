"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  BarChart3,
  Settings,
  Megaphone,
  Flag,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/panel/dashboard", icon: LayoutDashboard },
  { name: "Artikel", href: "/panel/artikel", icon: FileText },
  { name: "Media", href: "/panel/media", icon: Image },
  { name: "Laporan", href: "/panel/laporan", icon: Flag },
  { name: "Iklan", href: "/panel/iklan", icon: Megaphone, adminOnly: true },
  { name: "Pengguna", href: "/panel/pengguna", icon: Users, adminOnly: true },
  { name: "Statistik", href: "/panel/statistik", icon: BarChart3 },
  { name: "Pengaturan", href: "/panel/pengaturan", icon: Settings },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 bg-surface-dark pt-16 lg:block">
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
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-60">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-surface border-b border-border h-14 lg:hidden" />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
