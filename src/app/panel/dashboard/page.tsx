"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
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

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  DRAFT: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
  APPROVED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<string, string> = {
  PUBLISHED: "Dipublikasikan",
  IN_REVIEW: "Dalam Review",
  DRAFT: "Draft",
  REJECTED: "Ditolak",
  APPROVED: "Disetujui",
  ARCHIVED: "Diarsipkan",
};

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-1 h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-1 h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="ml-4 h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsItem[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [articlesRes, reportsRes] = await Promise.all([
          fetch("/api/articles?limit=100&status=ALL"),
          fetch("/api/reports"),
        ]);

        let allArticles: Article[] = [];
        let reportsPending = 0;

        if (articlesRes.ok) {
          const articlesJson = await articlesRes.json();
          allArticles = articlesJson.data?.articles || [];
        }

        if (reportsRes.ok) {
          const reportsJson = await reportsRes.json();
          const reports = reportsJson.data || [];
          reportsPending = reports.filter(
            (r: { status: string }) => r.status === "PENDING"
          ).length;
        }

        // Calculate stats
        const totalArticles = allArticles.length;
        const totalViews = allArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
        const pendingReview = allArticles.filter((a) => a.status === "IN_REVIEW").length;
        const published = allArticles.filter((a) => a.status === "PUBLISHED").length;

        // Today's views approximation: sum views of articles published today
        const today = new Date().toDateString();
        const todayViews = allArticles
          .filter((a) => a.publishedAt && new Date(a.publishedAt).toDateString() === today)
          .reduce((sum, a) => sum + (a.viewCount || 0), 0);

        setStats([
          { label: "Total Artikel", value: formatNumber(totalArticles), icon: FileText, color: "text-blue-500 bg-blue-50" },
          { label: "Total Views", value: formatNumber(totalViews), icon: Eye, color: "text-green-500 bg-green-50" },
          { label: "Menunggu Review", value: pendingReview.toString(), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
          { label: "Dipublikasikan", value: formatNumber(published), icon: CheckCircle, color: "text-emerald-500 bg-emerald-50" },
          { label: "Laporan Masuk", value: reportsPending.toString(), icon: AlertTriangle, color: "text-red-500 bg-red-50" },
          { label: "Views Hari Ini", value: formatNumber(todayViews), icon: TrendingUp, color: "text-purple-500 bg-purple-50" },
        ]);

        // Recent articles (last 5 by createdAt)
        const sorted = [...allArticles].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentArticles(sorted.slice(0, 5));
      } catch (err) {
        setError("Gagal memuat data dashboard. Silakan coba lagi.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Selamat datang kembali, {session?.user?.name}!
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Selamat datang kembali, {session?.user?.name}!
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>
                <Icon size={18} />
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent articles */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Artikel Terbaru
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentArticles.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                Belum ada artikel.
              </div>
            ) : (
              recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(article.createdAt)}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    {article.viewCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye size={12} /> {article.viewCount}
                      </span>
                    )}
                    <span className={`badge ${statusColors[article.status] || "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Aksi Cepat
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            <a
              href="/panel/artikel/baru"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <FileText size={24} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tulis Artikel Baru
              </span>
            </a>
            <a
              href="/panel/artikel"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <Clock size={24} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Review Artikel
              </span>
            </a>
            <a
              href="/panel/statistik"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <TrendingUp size={24} className="text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Lihat Statistik
              </span>
            </a>
            <a
              href="/panel/laporan"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <AlertTriangle size={24} className="text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cek Laporan
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Editorial checklist reminder */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
        <h3 className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300">
          <CheckCircle size={18} />
          Pengingat Standar Jurnalistik
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
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
