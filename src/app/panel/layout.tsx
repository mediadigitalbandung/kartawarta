"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Megaphone,
  Flag,
  FolderOpen,
  History,
  ChevronLeft,
  Menu,
  X,
  UserCircle,
  ClipboardCheck,
  Bell,
  Settings,
  BarChart3,
  Sparkles,
  LogOut,
  MessageCircle,
  ImageIcon,
  XCircle,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const roleLabelsMap: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CHIEF_EDITOR: "Editor Kepala",
  EDITOR: "Editor",
  SENIOR_JOURNALIST: "Jurnalis Senior",
  JOURNALIST: "Jurnalis",
  CONTRIBUTOR: "Kontributor",
};

const EDITOR_ROLES = ["EDITOR", "CHIEF_EDITOR", "SUPER_ADMIN"];
const CREATOR_ROLES = ["JOURNALIST", "SENIOR_JOURNALIST", "CONTRIBUTOR"];

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  editorOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/panel/dashboard", icon: LayoutDashboard },
  { name: "Artikel", href: "/panel/artikel", icon: FileText },
  { name: "Kategori", href: "/panel/kategori", icon: FolderOpen, adminOnly: true },
  { name: "Riwayat Review", href: "/panel/riwayat-review", icon: ClipboardCheck, editorOnly: true },
  { name: "Komentar", href: "/panel/komentar", icon: MessageCircle, adminOnly: true },
  { name: "Media", href: "/panel/media", icon: ImageIcon, adminOnly: true },
  { name: "Laporan", href: "/panel/laporan", icon: Flag },
  { name: "Aktivitas", href: "/panel/aktivitas", icon: History, adminOnly: true },
  { name: "Iklan", href: "/panel/iklan", icon: Megaphone, adminOnly: true },
  { name: "Log AI", href: "/panel/ai-log", icon: Sparkles, adminOnly: true },
  { name: "Pengguna", href: "/panel/pengguna", icon: Users, adminOnly: true },
  { name: "Statistik", href: "/panel/statistik-editor", icon: BarChart3, editorOnly: true },
  { name: "Pengaturan", href: "/panel/pengaturan", icon: Settings, adminOnly: true },
  { name: "Profil", href: "/panel/profil", icon: UserCircle },
];

type NotifType = "rejected" | "review" | "comment" | "approved";

interface NotificationItem {
  id: string;
  type: NotifType;
  label: string;
  message: string;
  count: number;
  href: string;
  time: string;
  read: boolean;
}

const NOTIF_ICON_MAP: Record<NotifType, { icon: React.ElementType; bg: string; color: string }> = {
  rejected: { icon: XCircle, bg: "bg-red-50", color: "text-red-500" },
  review: { icon: ClipboardCheck, bg: "bg-yellow-50", color: "text-yellow-500" },
  comment: { icon: MessageCircle, bg: "bg-blue-50", color: "text-blue-500" },
  approved: { icon: CheckCircle, bg: "bg-green-50", color: "text-goto-green" },
};

function getReadNotifIds(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`notif_read_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setReadNotifIds(userId: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`notif_read_${userId}`, JSON.stringify(ids));
  } catch {
    // localStorage not available
  }
}

function timeAgoShort(): string {
  return "Baru saja";
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const userRole = session?.user?.role || "";
  const userId = session?.user?.id || "";
  const isAdmin = userRole === "SUPER_ADMIN";
  const isEditor = EDITOR_ROLES.includes(userRole);
  const isCreator = CREATOR_ROLES.includes(userRole);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    try {
      const items: NotificationItem[] = [];
      const readIds = getReadNotifIds(userId);

      if (isCreator) {
        // Count rejected articles for this creator
        const res = await fetch(`/api/articles?status=REJECTED&authorId=${session.user.id}&limit=100`);
        if (res.ok) {
          const json = await res.json();
          const count = json.data?.pagination?.total || 0;
          if (count > 0) {
            const id = `rejected_${count}`;
            items.push({
              id,
              type: "rejected",
              label: "Artikel Ditolak",
              message: `${count} artikel Anda ditolak oleh editor`,
              count,
              href: "/panel/artikel",
              time: timeAgoShort(),
              read: readIds.includes(id),
            });
          }
        }

        // Count approved articles for this creator
        const resApproved = await fetch(`/api/articles?status=APPROVED&authorId=${session.user.id}&limit=100`);
        if (resApproved.ok) {
          const json = await resApproved.json();
          const count = json.data?.pagination?.total || 0;
          if (count > 0) {
            const id = `approved_${count}`;
            items.push({
              id,
              type: "approved",
              label: "Artikel Disetujui",
              message: `${count} artikel Anda telah disetujui`,
              count,
              href: "/panel/artikel",
              time: timeAgoShort(),
              read: readIds.includes(id),
            });
          }
        }
      }

      if (isEditor) {
        // Count articles pending review
        const res = await fetch("/api/articles?status=IN_REVIEW&limit=1");
        if (res.ok) {
          const json = await res.json();
          const count = json.data?.pagination?.total || 0;
          if (count > 0) {
            const id = `review_${count}`;
            items.push({
              id,
              type: "review",
              label: "Artikel Baru untuk Review",
              message: `${count} artikel menunggu review Anda`,
              count,
              href: "/panel/artikel",
              time: timeAgoShort(),
              read: readIds.includes(id),
            });
          }
        }
      }

      if (isAdmin) {
        // Count pending reports
        const res = await fetch("/api/reports?status=PENDING&limit=1");
        if (res.ok) {
          const json = await res.json();
          const count = json.data?.pagination?.total || json.data?.reports?.length || 0;
          if (count > 0) {
            const id = `report_${count}`;
            items.push({
              id,
              type: "comment",
              label: "Komentar Baru",
              message: `${count} laporan menunggu ditinjau`,
              count,
              href: "/panel/laporan",
              time: timeAgoShort(),
              read: readIds.includes(id),
            });
          }
        }
      }

      setNotifications(items);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [session?.user, userId, isCreator, isEditor, isAdmin]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-goto-green border-t-transparent" />
      </div>
    );
  }

  if (!session || (session.user as Record<string, unknown>)?.invalid) {
    if (typeof window !== "undefined") {
      signOut({ callbackUrl: "/login?reason=session_expired" });
    }
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalNotifCount = notifications.reduce((sum, n) => sum + n.count, 0);

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(userId, allIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    const readIds = getReadNotifIds(userId);
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadNotifIds(userId, updated);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const filteredMenu = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.editorOnly && !isEditor) return false;
    return true;
  });

  const sidebarContent = (
    <div className="flex h-full flex-col px-3 py-4 overflow-y-auto overscroll-contain">
      <a
        href="/"
        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5"
      >
        <ChevronLeft size={16} />
        Kembali ke Situs
      </a>

      <nav className="flex-1 space-y-1">
        {filteredMenu.map((item) => {
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
              {roleLabelsMap[session.user.role] || session.user.role.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            signOut({ callbackUrl: "/login" });
          }}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Keluar"
        >
          <LogOut size={16} />
          Keluar
        </button>
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
            aria-label="Tutup menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSidebarOpen(false); }}
          />
        )}

        {/* Sidebar — desktop: always visible, mobile: slide-in */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-[100dvh] w-60 bg-surface-dark pt-16 transition-transform duration-200 overflow-hidden",
            "lg:translate-x-0 lg:z-40",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-4 rounded-lg p-1 text-white/60 hover:text-white lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X size={20} />
          </button>
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-60 min-w-0" style={{ overflowX: "clip" }}>
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between bg-surface border-b border-border h-14 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-1.5 text-txt-primary hover:bg-surface-secondary lg:hidden"
                aria-label="Buka menu navigasi"
              >
                <Menu size={22} />
              </button>
              <span className="ml-3 text-sm font-semibold text-txt-primary lg:ml-0">Panel Admin</span>
            </div>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-lg p-2 text-txt-secondary hover:bg-surface-secondary hover:text-txt-primary transition-colors"
                aria-label="Notifikasi"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-[12px] border border-border bg-surface shadow-lg">
                  {/* Header */}
                  <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-txt-primary">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-medium text-goto-green hover:text-goto-dark transition-colors"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell size={32} className="mx-auto text-border mb-2" />
                      <p className="text-sm text-txt-muted">Tidak ada notifikasi baru</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => {
                        const config = NOTIF_ICON_MAP[notif.type];
                        const Icon = config.icon;
                        return (
                          <Link
                            key={notif.id}
                            href={notif.href}
                            onClick={() => {
                              markOneRead(notif.id);
                              setNotifOpen(false);
                            }}
                            className={cn(
                              "flex items-start gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors border-b border-border last:border-b-0",
                              !notif.read && "bg-goto-50/50"
                            )}
                          >
                            <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full", config.bg)}>
                              <Icon size={16} className={config.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-txt-primary truncate">{notif.label}</p>
                                {!notif.read && (
                                  <span className="h-2 w-2 rounded-full bg-goto-green flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-txt-secondary mt-0.5">{notif.message}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={10} className="text-txt-muted" />
                                <span className="text-[10px] text-txt-muted">{notif.time}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Warning: login attempt from another device */}
          {!!((session as unknown as Record<string, boolean>)?.loginAttempt) && (
            <div className="mx-4 mt-4 sm:mx-6 rounded-[12px] bg-yellow-50 border border-yellow-200 px-4 py-3 flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Percobaan login dari perangkat lain</p>
                <p className="text-xs text-yellow-600 mt-0.5">Seseorang mencoba masuk ke akun Anda dari perangkat lain. Jika bukan Anda, segera ubah password.</p>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
