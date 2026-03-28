"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Megaphone,
  XCircle,
  Send,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  author?: { name: string };
  category?: { name: string };
}

interface StatsItem {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

const CREATOR_ROLES = ["JOURNALIST", "SENIOR_JOURNALIST", "CONTRIBUTOR"];
const EDITOR_ROLES = ["EDITOR", "CHIEF_EDITOR"];

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-goto-light text-goto-green",
  IN_REVIEW: "bg-yellow-50 text-yellow-600",
  DRAFT: "bg-surface-tertiary text-txt-secondary",
  REJECTED: "bg-red-50 text-red-600",
  APPROVED: "bg-blue-50 text-blue-600",
  ARCHIVED: "bg-surface-tertiary text-txt-muted",
};

const statusLabels: Record<string, string> = {
  PUBLISHED: "Dipublikasi",
  IN_REVIEW: "Menunggu Review",
  DRAFT: "Draf",
  REJECTED: "Ditolak",
  APPROVED: "Disetujui",
  ARCHIVED: "Diarsipkan",
};

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[12px] border border-border bg-surface p-4 shadow-card"
          >
            <div className="h-8 w-8 rounded-[12px] bg-surface-tertiary" />
            <div className="mt-2 h-7 w-16 rounded bg-surface-tertiary" />
            <div className="mt-1 h-3 w-20 rounded bg-surface-secondary" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[12px] border border-border bg-surface shadow-card">
          <div className="border-b border-border px-5 py-4">
            <div className="h-5 w-32 rounded bg-surface-tertiary" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded bg-surface-tertiary" />
                <div className="mt-1 h-3 w-24 rounded bg-surface-secondary" />
              </div>
              <div className="ml-4 h-5 w-20 rounded-full bg-surface-tertiary" />
            </div>
          ))}
        </div>
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <div className="h-5 w-24 rounded bg-surface-tertiary" />
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const userId = session?.user?.id || "";
  const isCreator = CREATOR_ROLES.includes(userRole);
  const isEditorRole = EDITOR_ROLES.includes(userRole);
  const isAdmin = userRole === "SUPER_ADMIN";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsItem[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  const fetchData = useCallback(async () => {
      if (!session?.user) return;
      try {
        setLoading(true);
        setError(null);

        // Creators fetch only their articles; editors/admins fetch all
        const articlesUrl = isCreator
          ? `/api/articles?limit=100&status=ALL&authorId=${userId}`
          : `/api/articles?limit=100&status=ALL`;

        const fetches: Promise<Response>[] = [fetch(articlesUrl)];
        // Only admins/editors see reports
        if (!isCreator) {
          fetches.push(fetch("/api/reports"));
        }

        const results = await Promise.all(fetches);

        let allArticles: Article[] = [];
        let reportsPending = 0;

        if (results[0].ok) {
          const articlesJson = await results[0].json();
          allArticles = articlesJson.data?.articles || [];
        }

        if (!isCreator && results[1]?.ok) {
          const reportsJson = await results[1].json();
          const reports = reportsJson.data || [];
          reportsPending = reports.filter(
            (r: { status: string }) => r.status === "PENDING"
          ).length;
        }

        // Build stats based on role
        if (isCreator) {
          // Creator stats: my articles, my drafts, pending review, published
          const myTotal = allArticles.length;
          const myDrafts = allArticles.filter((a) => a.status === "DRAFT").length;
          const myPendingReview = allArticles.filter((a) => a.status === "IN_REVIEW").length;
          const myPublished = allArticles.filter((a) => a.status === "PUBLISHED").length;

          setStats([
            { label: "Artikel Saya", value: formatNumber(myTotal), icon: FileText, color: "text-blue-500 bg-blue-50" },
            { label: "Draf Saya", value: myDrafts.toString(), icon: FileText, color: "text-surface-tertiary bg-surface-secondary" },
            { label: "Menunggu Review", value: myPendingReview.toString(), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
            { label: "Dipublikasi", value: formatNumber(myPublished), icon: CheckCircle, color: "text-goto-green bg-goto-light" },
          ]);

          // Recent: my articles sorted by createdAt
          const sorted = [...allArticles].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentArticles(sorted.slice(0, 5));
        } else if (isEditorRole) {
          // Editor stats: review queue, approved today, rejected, total
          const reviewQueue = allArticles.filter((a) => a.status === "IN_REVIEW").length;
          const today = new Date().toDateString();
          const approvedToday = allArticles.filter(
            (a) => a.status === "APPROVED" || (a.status === "PUBLISHED" && a.publishedAt && new Date(a.publishedAt).toDateString() === today)
          ).length;
          const rejected = allArticles.filter((a) => a.status === "REJECTED").length;
          const totalArticles = allArticles.length;

          setStats([
            { label: "Antrean Review", value: reviewQueue.toString(), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
            { label: "Disetujui Hari Ini", value: approvedToday.toString(), icon: CheckCircle, color: "text-goto-green bg-goto-light" },
            { label: "Ditolak", value: rejected.toString(), icon: XCircle, color: "text-red-500 bg-red-50" },
            { label: "Total Artikel", value: formatNumber(totalArticles), icon: FileText, color: "text-blue-500 bg-blue-50" },
          ]);

          // Recent: IN_REVIEW first, then by createdAt
          const sorted = [...allArticles].sort((a, b) => {
            if (a.status === "IN_REVIEW" && b.status !== "IN_REVIEW") return -1;
            if (a.status !== "IN_REVIEW" && b.status === "IN_REVIEW") return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setRecentArticles(sorted.slice(0, 5));
        } else {
          // Admin (SUPER_ADMIN): full stats
          const totalArticles = allArticles.length;
          const totalViews = allArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
          const pendingReview = allArticles.filter((a) => a.status === "IN_REVIEW").length;
          const published = allArticles.filter((a) => a.status === "PUBLISHED").length;
          const today = new Date().toDateString();
          const todayViews = allArticles
            .filter((a) => a.publishedAt && new Date(a.publishedAt).toDateString() === today)
            .reduce((sum, a) => sum + (a.viewCount || 0), 0);

          setStats([
            { label: "Total Artikel", value: formatNumber(totalArticles), icon: FileText, color: "text-blue-500 bg-blue-50" },
            { label: "Total Tayangan", value: formatNumber(totalViews), icon: Eye, color: "text-goto-green bg-goto-light" },
            { label: "Menunggu Review", value: pendingReview.toString(), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
            { label: "Dipublikasi", value: formatNumber(published), icon: CheckCircle, color: "text-goto-green bg-goto-light" },
            { label: "Laporan Masuk", value: reportsPending.toString(), icon: AlertTriangle, color: "text-red-500 bg-red-50" },
            { label: "Tayangan Hari Ini", value: formatNumber(todayViews), icon: TrendingUp, color: "text-purple-500 bg-purple-50" },
          ]);

          const sorted = [...allArticles].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentArticles(sorted.slice(0, 5));
        }
      } catch (err) {
        setError("Gagal memuat data dashboard. Silakan coba lagi.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
  }, [session?.user, isCreator, isEditorRole, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-lg sm:text-2xl font-bold text-txt-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-txt-secondary">
            Selamat datang kembali, {session?.user?.name}!
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-lg sm:text-2xl font-bold text-txt-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-txt-secondary">
            Selamat datang kembali, {session?.user?.name}!
          </p>
        </div>
        <div className="rounded-[12px] border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 rounded-[12px] bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            aria-label="Coba muat ulang data"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-txt-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-txt-secondary">
          Selamat datang kembali, {session?.user?.name}!
        </p>
      </div>

      {/* Stats grid */}
      <div className={`mb-8 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 sm:grid-cols-3 ${isAdmin ? "md:grid-cols-4 lg:grid-cols-6" : "md:grid-cols-4"}`}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-[12px] border border-border bg-surface p-4 shadow-card"
            >
              <div className={`inline-flex rounded-[12px] p-2 ${stat.color}`}>
                <Icon size={18} />
              </div>
              <p className="mt-2 text-xl sm:text-3xl font-extrabold text-txt-primary">
                {stat.value}
              </p>
              <p className="text-xs text-txt-secondary">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent articles */}
        <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
          <div className="border-b border-border bg-surface-secondary px-5 py-4">
            <h2 className="font-semibold text-txt-primary">
              {isCreator ? "Artikel Saya Terbaru" : isEditorRole ? "Antrean Review" : "Artikel Terbaru"}
            </h2>
          </div>
          <div className="overflow-x-auto">
          <div className="divide-y divide-border">
            {recentArticles.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-txt-secondary">
                {isCreator ? "Anda belum memiliki artikel." : "Belum ada artikel."}
              </div>
            ) : (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/panel/artikel/${article.id}/edit`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-surface-secondary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-txt-primary">
                      {article.title}
                    </p>
                    <p className="text-xs text-txt-secondary">
                      {isEditorRole && article.author?.name ? `${article.author.name} — ` : ""}
                      {formatDate(article.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    {article.viewCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-txt-muted">
                        <Eye size={12} /> {article.viewCount}
                      </span>
                    )}
                    <span className={`badge ${statusColors[article.status] || "bg-surface-tertiary text-txt-secondary"}`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
          <div className="border-b border-border bg-surface-secondary px-5 py-4">
            <h2 className="font-semibold text-txt-primary">
              Aksi Cepat
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            <Link
              href="/panel/artikel/baru"
              className="flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-border p-6 text-center transition-colors hover:border-goto-green hover:bg-goto-50"
              aria-label="Tulis artikel baru"
            >
              <FileText size={24} className="text-goto-green" />
              <span className="text-sm font-medium text-txt-secondary">
                Tulis Artikel Baru
              </span>
            </Link>
            {(isEditorRole || isAdmin) && (
              <Link
                href="/panel/artikel"
                className="flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-border p-6 text-center transition-colors hover:border-goto-green hover:bg-goto-50"
                aria-label="Review artikel"
              >
                <Clock size={24} className="text-yellow-500" />
                <span className="text-sm font-medium text-txt-secondary">
                  Review Artikel
                </span>
              </Link>
            )}
            {isCreator && (
              <Link
                href="/panel/artikel"
                className="flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-border p-6 text-center transition-colors hover:border-goto-green hover:bg-goto-50"
                aria-label="Lihat artikel saya"
              >
                <Send size={24} className="text-blue-500" />
                <span className="text-sm font-medium text-txt-secondary">
                  Artikel Saya
                </span>
              </Link>
            )}
            {!isCreator && (
              <Link
                href="/panel/laporan"
                className="flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-border p-6 text-center transition-colors hover:border-goto-green hover:bg-goto-50"
                aria-label="Cek laporan masuk"
              >
                <AlertTriangle size={24} className="text-red-500" />
                <span className="text-sm font-medium text-txt-secondary">
                  Cek Laporan
                </span>
              </Link>
            )}
            {(isAdmin || userRole === "CHIEF_EDITOR") && (
              <>
                <Link
                  href="/panel/pengguna"
                  className="flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-border p-6 text-center transition-colors hover:border-goto-green hover:bg-goto-50"
                  aria-label="Kelola pengguna"
                >
                  <Users size={24} className="text-purple-500" />
                  <span className="text-sm font-medium text-txt-secondary">
                    Kelola Pengguna
                  </span>
                </Link>
                <Link
                  href="/panel/iklan"
                  className="flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-border p-6 text-center transition-colors hover:border-goto-green hover:bg-goto-50"
                  aria-label="Kelola iklan"
                >
                  <Megaphone size={24} className="text-blue-500" />
                  <span className="text-sm font-medium text-txt-secondary">
                    Kelola Iklan
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editorial checklist reminder */}
      <div className="mt-6 rounded-[12px] border border-goto-green/20 bg-goto-50 p-5">
        <h3 className="flex items-center gap-2 font-semibold text-goto-dark">
          <CheckCircle size={18} />
          Pengingat Standar Jurnalistik
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-goto-green">
          <li>&#10003; Pastikan setiap artikel memiliki minimal 1 sumber terverifikasi</li>
          <li>&#10003; Judul tidak clickbait atau sensasional berlebihan</li>
          <li>&#10003; Cover both sides — berikan perspektif berimbang</li>
          <li>&#10003; Tidak mengandung unsur SARA</li>
          <li>&#10003; Gunakan bahasa sesuai PUEBI</li>
        </ul>
      </div>
    </div>
  );
}
