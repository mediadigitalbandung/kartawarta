"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  BarChart3,
  Award,
  Layers,
  Timer,
  CalendarClock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  publishedAt: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  author?: { name: string };
  category?: { name: string; id: string };
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

// --- Analytics Components ---

function WeeklyArticleTrend({ articles }: { articles: Article[] }) {
  const weekData = useMemo(() => {
    const now = new Date();
    const days: { label: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });

      const count = articles.filter((a) => {
        const created = new Date(a.createdAt).toISOString().split("T")[0];
        return created === dayStr;
      }).length;

      days.push({ label, count });
    }
    return days;
  }, [articles]);

  const maxCount = Math.max(...weekData.map((d) => d.count), 1);

  return (
    <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border bg-surface-secondary px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-txt-primary">
          <BarChart3 size={18} className="text-goto-green" />
          Tren Artikel Mingguan
        </h2>
      </div>
      <div className="p-5 space-y-2.5">
        {weekData.map((day, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 text-xs text-txt-secondary text-right shrink-0">
              {day.label}
            </span>
            <div className="flex-1 h-6 bg-surface-secondary rounded-[6px] overflow-hidden">
              <div
                className="h-full bg-goto-green rounded-[6px] transition-all duration-500"
                style={{ width: `${(day.count / maxCount) * 100}%`, minWidth: day.count > 0 ? "8px" : "0px" }}
              />
            </div>
            <span className="w-8 text-xs font-bold text-txt-primary text-right">
              {day.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopArticlesByViews({ articles }: { articles: Article[] }) {
  const topArticles = useMemo(() => {
    return [...articles]
      .filter((a) => a.status === "PUBLISHED")
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5);
  }, [articles]);

  return (
    <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border bg-surface-secondary px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-txt-primary">
          <Award size={18} className="text-gold" />
          Top 5 Artikel by Views
        </h2>
      </div>
      <div className="divide-y divide-border">
        {topArticles.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-txt-secondary">
            Belum ada artikel yang dipublikasi.
          </div>
        ) : (
          topArticles.map((article, i) => (
            <Link
              key={article.id}
              href={`/panel/artikel/${article.id}/edit`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-secondary transition-colors"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-goto-light text-xs font-bold text-goto-green">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-txt-primary">
                  {article.title}
                </p>
                <p className="text-xs text-txt-muted">
                  {article.category?.name || "—"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gold shrink-0">
                <Eye size={12} />
                {formatNumber(article.viewCount)}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryPerformance({ articles }: { articles: Article[] }) {
  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; count: number; views: number }>();

    articles.forEach((a) => {
      const catName = a.category?.name || "Tanpa Kategori";
      const existing = map.get(catName) || { name: catName, count: 0, views: 0 };
      existing.count += 1;
      existing.views += a.viewCount || 0;
      map.set(catName, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.views - a.views);
  }, [articles]);

  return (
    <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border bg-surface-secondary px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-txt-primary">
          <Layers size={18} className="text-blue-500" />
          Performa per Kategori
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-secondary/50">
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Artikel
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Total Views
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categoryData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-txt-secondary">
                  Belum ada data.
                </td>
              </tr>
            ) : (
              categoryData.map((cat) => (
                <tr key={cat.name} className="hover:bg-surface-secondary/50">
                  <td className="px-5 py-2.5 font-medium text-txt-primary">{cat.name}</td>
                  <td className="px-5 py-2.5 text-right text-txt-secondary">{cat.count}</td>
                  <td className="px-5 py-2.5 text-right font-semibold text-gold">
                    {formatNumber(cat.views)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AverageReviewTime({ articles }: { articles: Article[] }) {
  const avgTime = useMemo(() => {
    // Calculate average time between articles entering IN_REVIEW (using createdAt or updatedAt)
    // and being APPROVED/REJECTED (reviewedAt is in updatedAt)
    // We look at articles that have been reviewed (status APPROVED, REJECTED, PUBLISHED)
    const reviewed = articles.filter(
      (a) =>
        ["APPROVED", "REJECTED", "PUBLISHED"].includes(a.status) &&
        a.reviewedAt &&
        a.createdAt
    );

    if (reviewed.length === 0) return null;

    let totalMs = 0;
    let count = 0;

    reviewed.forEach((a) => {
      if (a.reviewedAt) {
        const created = new Date(a.createdAt).getTime();
        const reviewedAt = new Date(a.reviewedAt).getTime();
        const diff = reviewedAt - created;
        if (diff > 0) {
          totalMs += diff;
          count += 1;
        }
      }
    });

    if (count === 0) return null;

    const avgMs = totalMs / count;
    const hours = avgMs / (1000 * 60 * 60);

    if (hours < 1) {
      const mins = Math.round(avgMs / (1000 * 60));
      return `${mins} menit`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} jam`;
    } else {
      const days = hours / 24;
      return `${days.toFixed(1)} hari`;
    }
  }, [articles]);

  return (
    <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border bg-surface-secondary px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-txt-primary">
          <Timer size={18} className="text-purple-500" />
          Rata-rata Waktu Review
        </h2>
      </div>
      <div className="flex items-center justify-center p-8">
        {avgTime ? (
          <div className="text-center">
            <p className="text-3xl font-extrabold text-txt-primary">{avgTime}</p>
            <p className="mt-1 text-xs text-txt-secondary">
              dari artikel dikirim hingga direview
            </p>
          </div>
        ) : (
          <p className="text-sm text-txt-secondary">Belum ada data review.</p>
        )}
      </div>
    </div>
  );
}

function ArticleCalendar({ articles }: { articles: Article[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // Map: day number -> articles for that day
  const dayArticles = useMemo(() => {
    const map = new Map<number, Article[]>();
    articles.forEach((a) => {
      const dateStr = a.publishedAt || a.scheduledAt || a.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const arr = map.get(day) || [];
        arr.push(a);
        map.set(day, arr);
      }
    });
    return map;
  }, [articles, year, month]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedArticles = selectedDay ? dayArticles.get(selectedDay) || [] : [];

  return (
    <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border bg-surface-secondary px-5 py-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-txt-primary">
          <Calendar size={18} className="text-goto-green" />
          Kalender Artikel
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="btn-ghost rounded p-1" aria-label="Bulan sebelumnya">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-txt-primary min-w-[140px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="btn-ghost rounded p-1" aria-label="Bulan berikutnya">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((dn) => (
            <div key={dn} className="text-center text-[10px] font-semibold text-txt-muted uppercase tracking-wider py-1">
              {dn}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-10" />;
            }
            const count = dayArticles.get(day)?.length || 0;
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex flex-col items-center justify-center h-10 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-goto-green text-white"
                    : isToday
                      ? "bg-goto-light text-goto-green font-bold"
                      : count > 0
                        ? "bg-surface-secondary text-txt-primary hover:bg-goto-light"
                        : "text-txt-muted hover:bg-surface-secondary"
                }`}
                aria-label={`${day} ${monthName}${count > 0 ? `, ${count} artikel` : ""}`}
              >
                {day}
                {count > 0 && (
                  <span
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${
                      isSelected ? "bg-white" : "bg-goto-green"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* Selected day articles */}
        {selectedDay !== null && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-semibold text-txt-secondary mb-2">
              Artikel tanggal {selectedDay} {monthName}
            </p>
            {selectedArticles.length === 0 ? (
              <p className="text-xs text-txt-muted">Tidak ada artikel pada tanggal ini.</p>
            ) : (
              <ul className="space-y-1.5">
                {selectedArticles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/panel/artikel/${a.id}/edit`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-secondary transition-colors"
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                          a.status === "PUBLISHED"
                            ? "bg-goto-green"
                            : a.status === "APPROVED"
                              ? "bg-blue-500"
                              : a.status === "IN_REVIEW"
                                ? "bg-yellow-500"
                                : "bg-surface-tertiary"
                        }`}
                      />
                      <span className="truncate font-medium text-txt-primary">{a.title}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-txt-muted">
                        {statusLabels[a.status] || a.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
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
  const [allArticles, setAllArticles] = useState<Article[]>([]);

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

        let fetchedArticles: Article[] = [];
        let reportsPending = 0;

        if (results[0].ok) {
          const articlesJson = await results[0].json();
          fetchedArticles = articlesJson.data?.articles || [];
        }

        if (!isCreator && results[1]?.ok) {
          const reportsJson = await results[1].json();
          const reports = reportsJson.data || [];
          reportsPending = reports.filter(
            (r: { status: string }) => r.status === "PENDING"
          ).length;
        }

        // Store all articles for analytics
        setAllArticles(fetchedArticles);

        // Build stats based on role
        if (isCreator) {
          // Creator stats: my articles, my drafts, pending review, published
          const myTotal = fetchedArticles.length;
          const myDrafts = fetchedArticles.filter((a) => a.status === "DRAFT").length;
          const myPendingReview = fetchedArticles.filter((a) => a.status === "IN_REVIEW").length;
          const myPublished = fetchedArticles.filter((a) => a.status === "PUBLISHED").length;

          setStats([
            { label: "Artikel Saya", value: formatNumber(myTotal), icon: FileText, color: "text-blue-500 bg-blue-50" },
            { label: "Draf Saya", value: myDrafts.toString(), icon: FileText, color: "text-surface-tertiary bg-surface-secondary" },
            { label: "Menunggu Review", value: myPendingReview.toString(), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
            { label: "Dipublikasi", value: formatNumber(myPublished), icon: CheckCircle, color: "text-goto-green bg-goto-light" },
          ]);

          // Recent: my articles sorted by createdAt
          const sorted = [...fetchedArticles].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentArticles(sorted.slice(0, 5));
        } else if (isEditorRole) {
          // Editor stats: review queue, approved today, rejected, total
          const reviewQueue = fetchedArticles.filter((a) => a.status === "IN_REVIEW").length;
          const today = new Date().toDateString();
          const approvedToday = fetchedArticles.filter(
            (a) => a.status === "APPROVED" || (a.status === "PUBLISHED" && a.publishedAt && new Date(a.publishedAt).toDateString() === today)
          ).length;
          const rejected = fetchedArticles.filter((a) => a.status === "REJECTED").length;
          const totalArticles = fetchedArticles.length;

          setStats([
            { label: "Antrean Review", value: reviewQueue.toString(), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
            { label: "Disetujui Hari Ini", value: approvedToday.toString(), icon: CheckCircle, color: "text-goto-green bg-goto-light" },
            { label: "Ditolak", value: rejected.toString(), icon: XCircle, color: "text-red-500 bg-red-50" },
            { label: "Total Artikel", value: formatNumber(totalArticles), icon: FileText, color: "text-blue-500 bg-blue-50" },
          ]);

          // Recent: IN_REVIEW first, then by createdAt
          const sorted = [...fetchedArticles].sort((a, b) => {
            if (a.status === "IN_REVIEW" && b.status !== "IN_REVIEW") return -1;
            if (a.status !== "IN_REVIEW" && b.status === "IN_REVIEW") return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setRecentArticles(sorted.slice(0, 5));
        } else {
          // Admin (SUPER_ADMIN): full stats
          const totalArticles = fetchedArticles.length;
          const totalViews = fetchedArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
          const pendingReview = fetchedArticles.filter((a) => a.status === "IN_REVIEW").length;
          const published = fetchedArticles.filter((a) => a.status === "PUBLISHED").length;
          const scheduled = fetchedArticles.filter((a) => a.scheduledAt && a.status === "APPROVED").length;
          const today = new Date().toDateString();
          const todayViews = fetchedArticles
            .filter((a) => a.publishedAt && new Date(a.publishedAt).toDateString() === today)
            .reduce((sum, a) => sum + (a.viewCount || 0), 0);

          setStats([
            { label: "Total Artikel", value: formatNumber(totalArticles), icon: FileText, color: "text-blue-500 bg-blue-50" },
            { label: "Total Tayangan", value: formatNumber(totalViews), icon: Eye, color: "text-goto-green bg-goto-light" },
            { label: "Menunggu Review", value: pendingReview.toString(), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
            { label: "Dipublikasi", value: formatNumber(published), icon: CheckCircle, color: "text-goto-green bg-goto-light" },
            { label: "Dijadwalkan", value: scheduled.toString(), icon: CalendarClock, color: "text-blue-500 bg-blue-50" },
            { label: "Laporan Masuk", value: reportsPending.toString(), icon: AlertTriangle, color: "text-red-500 bg-red-50" },
            { label: "Tayangan Hari Ini", value: formatNumber(todayViews), icon: TrendingUp, color: "text-purple-500 bg-purple-50" },
          ]);

          const sorted = [...fetchedArticles].sort(
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
      <div className={`mb-8 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 sm:grid-cols-3 ${isAdmin ? "md:grid-cols-4 lg:grid-cols-7" : "md:grid-cols-4"}`}>
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

      {/* Analytics Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyArticleTrend articles={allArticles} />
        <TopArticlesByViews articles={allArticles} />
        <CategoryPerformance articles={allArticles} />
        <AverageReviewTime articles={allArticles} />
        <ArticleCalendar articles={allArticles} />
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
