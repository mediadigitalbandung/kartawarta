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
  reviewerName?: string | null;
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
  return num.toLocaleString("id-ID");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// --- Analytics Components ---

// Donut chart for article status distribution
function StatusDonutChart({ articles }: { articles: Article[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    const colors: Record<string, { stroke: string; bg: string; text: string }> = {
      PUBLISHED: { stroke: "#00AA13", bg: "bg-goto-light", text: "text-goto-green" },
      IN_REVIEW: { stroke: "#EAB308", bg: "bg-yellow-50", text: "text-yellow-600" },
      DRAFT: { stroke: "#9CA3AF", bg: "bg-surface-tertiary", text: "text-txt-secondary" },
      APPROVED: { stroke: "#3B82F6", bg: "bg-blue-50", text: "text-blue-600" },
      REJECTED: { stroke: "#EF4444", bg: "bg-red-50", text: "text-red-600" },
      ARCHIVED: { stroke: "#6B7280", bg: "bg-surface-tertiary", text: "text-txt-muted" },
    };
    return Object.entries(counts)
      .map(([status, count]) => ({ status, count, ...(colors[status] || colors.DRAFT) }))
      .sort((a, b) => b.count - a.count);
  }, [articles]);

  const total = articles.length;
  if (total === 0) return null;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h2 className="flex items-center gap-2.5 text-base font-bold text-txt-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
            <Layers size={16} className="text-purple-500" />
          </div>
          Distribusi Status
        </h2>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-8">
          <div className="relative shrink-0">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r={radius} fill="none" stroke="#F0F1F3" strokeWidth="14" />
              {data.map((d) => {
                const pct = d.count / total;
                const dash = pct * circumference;
                const off = -offset * circumference;
                offset += pct;
                return (
                  <circle
                    key={d.status}
                    cx="65" cy="65" r={radius}
                    fill="none"
                    stroke={d.stroke}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={off}
                    className="transition-all duration-700"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-txt-primary">{total}</span>
              <span className="text-xs text-txt-muted">Artikel</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {data.map((d) => {
              const pct = ((d.count / total) * 100).toFixed(0);
              return (
                <div key={d.status} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold ${d.bg} ${d.text}`}>
                        {statusLabels[d.status] || d.status}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-txt-primary">{d.count} <span className="text-xs font-normal text-txt-muted">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-tertiary overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: d.stroke }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sparkline chart for daily views (last 14 days)
function ViewsSparkline({ articles }: { articles: Article[] }) {
  const data = useMemo(() => {
    const published = articles.filter((a) => a.status === "PUBLISHED" && a.publishedAt);
    const now = new Date();
    const days: { label: string; views: number }[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

      const dayArticles = published.filter((a) => {
        const pubDate = new Date(a.publishedAt!).toISOString().split("T")[0];
        return pubDate === dayStr;
      });
      const views = dayArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
      days.push({ label, views });
    }
    return days;
  }, [articles]);

  const totalViews = articles.filter(a => a.status === "PUBLISHED").reduce((s, a) => s + (a.viewCount || 0), 0);
  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const height = 80;
  const width = 280;
  const stepX = width / (data.length - 1);

  // Build SVG path
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: height - (d.views / maxViews) * (height - 10) - 5,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const todayViews = data[data.length - 1]?.views || 0;
  const yesterdayViews = data[data.length - 2]?.views || 0;
  const change = yesterdayViews > 0 ? ((todayViews - yesterdayViews) / yesterdayViews) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h2 className="flex items-center gap-2.5 text-base font-bold text-txt-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-goto-light">
            <TrendingUp size={16} className="text-goto-green" />
          </div>
          Tren Tayangan
        </h2>
      </div>
      <div className="p-6">
        {/* Stats row */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-sm text-txt-muted mb-1">Total Tayangan</p>
            <p className="text-3xl font-extrabold text-txt-primary">{formatNumber(totalViews)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-txt-muted mb-1">Hari Ini</p>
            <p className="text-xl font-bold text-txt-primary">{formatNumber(todayViews)}</p>
            {change !== 0 && (
              <p className={`text-xs font-semibold ${change > 0 ? "text-goto-green" : "text-red-500"}`}>
                {change > 0 ? "+" : ""}{change.toFixed(0)}% dari kemarin
              </p>
            )}
          </div>
        </div>
        {/* Chart */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24" preserveAspectRatio="none">
          <defs>
            <linearGradient id="viewsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00AA13" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00AA13" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#viewsGradient)" />
          <path d={linePath} fill="none" stroke="#00AA13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#00AA13" strokeWidth="2">
              <title>{data[i].label}: {formatNumber(data[i].views)} tayangan</title>
            </circle>
          ))}
        </svg>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-txt-muted">{data[0].label}</span>
          <span className="text-xs text-txt-secondary font-medium">14 hari terakhir</span>
          <span className="text-xs text-txt-muted">{data[data.length - 1].label}</span>
        </div>
      </div>
    </div>
  );
}

// Publication rate ring
function PublicationRate({ articles }: { articles: Article[] }) {
  const { published, total, rate } = useMemo(() => {
    const pub = articles.filter((a) => a.status === "PUBLISHED").length;
    const all = articles.length;
    return { published: pub, total: all, rate: all > 0 ? (pub / all) * 100 : 0 };
  }, [articles]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashArray = (rate / 100) * circumference;

  const rejected = articles.filter((a) => a.status === "REJECTED").length;
  const inReview = articles.filter((a) => a.status === "IN_REVIEW").length;
  const draft = articles.filter((a) => a.status === "DRAFT").length;

  const breakdownData = [
    { label: "Dipublikasi", value: published, color: "bg-goto-green", textColor: "text-goto-green" },
    { label: "Menunggu Review", value: inReview, color: "bg-yellow-500", textColor: "text-yellow-600" },
    { label: "Draf", value: draft, color: "bg-gray-400", textColor: "text-txt-secondary" },
    { label: "Ditolak", value: rejected, color: "bg-red-500", textColor: "text-red-500" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h2 className="flex items-center gap-2.5 text-base font-bold text-txt-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-goto-light">
            <CheckCircle size={16} className="text-goto-green" />
          </div>
          Tingkat Publikasi
        </h2>
      </div>
      <div className="p-6">
        {/* Big rate display */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#F0F1F3" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius}
                fill="none" stroke="#00AA13" strokeWidth="8"
                strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                strokeDashoffset={circumference * 0.25}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-goto-green">{rate.toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-txt-muted">Dari total {total} artikel</p>
            <p className="text-lg font-bold text-txt-primary">{published} berhasil dipublikasi</p>
          </div>
        </div>
        {/* Breakdown bars */}
        <div className="space-y-3">
          {breakdownData.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-txt-secondary">{item.label}</span>
                <span className={`text-sm font-bold ${item.textColor}`}>{item.value}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-tertiary overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: total > 0 ? `${(item.value / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

  const totalWeek = weekData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="border-b border-border px-6 py-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-base font-bold text-txt-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <BarChart3 size={16} className="text-blue-500" />
          </div>
          Aktivitas Mingguan
        </h2>
        <span className="text-sm text-txt-muted">{totalWeek} artikel</span>
      </div>
      <div className="p-6 space-y-3">
        {weekData.map((day, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="w-20 text-sm text-txt-secondary text-right shrink-0 font-medium">
              {day.label}
            </span>
            <div className="flex-1 h-7 bg-surface-secondary rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-goto-green to-goto-dark rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${(day.count / maxCount) * 100}%`, minWidth: day.count > 0 ? "32px" : "0px" }}
              >
                {day.count > 0 && (
                  <span className="text-xs font-bold text-white">{day.count}</span>
                )}
              </div>
            </div>
            {day.count === 0 && (
              <span className="w-6 text-sm text-txt-muted text-right">0</span>
            )}
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

      {/* Quick actions FIRST */}
      <div className="mb-6 rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="border-b border-border px-6 py-5">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-txt-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-goto-light">
              <Layers size={16} className="text-goto-green" />
            </div>
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

      {/* Recent articles - full width, rich info */}
      <div className="mb-6 rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="border-b border-border px-6 py-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-txt-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={16} className="text-blue-500" />
            </div>
            {isCreator ? "Artikel Saya Terbaru" : isEditorRole ? "Antrean Review" : "Artikel Terbaru"}
          </h2>
          <Link href="/panel/artikel" className="text-sm font-semibold text-goto-green hover:text-goto-dark transition-colors">
            Lihat Semua &rarr;
          </Link>
        </div>
        {recentArticles.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText size={40} className="mx-auto text-border mb-3" />
            <p className="text-base text-txt-secondary">
              {isCreator ? "Anda belum memiliki artikel." : "Belum ada artikel."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/panel/artikel/${article.id}/edit`}
                className="block px-6 py-5 hover:bg-surface-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-txt-primary mb-2 line-clamp-1">
                      {article.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      {article.author?.name && (
                        <span className="flex items-center gap-1.5 text-sm text-txt-secondary">
                          <UserCheck size={14} className="text-txt-muted" />
                          {article.author.name}
                        </span>
                      )}
                      {article.category?.name && (
                        <span className="flex items-center gap-1.5 text-sm text-txt-secondary">
                          <Layers size={14} className="text-txt-muted" />
                          {article.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-sm text-txt-secondary">
                        <CalendarClock size={14} className="text-txt-muted" />
                        {formatDate(article.createdAt)}
                      </span>
                      {article.reviewerName && (
                        <span className="flex items-center gap-1.5 text-sm text-txt-secondary">
                          <UserCheck size={14} className="text-goto-green" />
                          Editor: {article.reviewerName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`badge text-sm ${statusColors[article.status] || "bg-surface-tertiary text-txt-secondary"}`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-txt-muted">
                      <Eye size={14} />
                      {formatNumber(article.viewCount)} tayangan
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ViewsSparkline articles={allArticles} />
        <StatusDonutChart articles={allArticles} />
        <WeeklyArticleTrend articles={allArticles} />
        <PublicationRate articles={allArticles} />
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
