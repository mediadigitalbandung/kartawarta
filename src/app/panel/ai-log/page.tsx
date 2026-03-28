"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Sparkles, Cpu, Hash, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface AILog {
  id: string;
  userId: string;
  userName: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  articleTitle: string | null;
  createdAt: string;
}

interface UserStat {
  userId: string;
  name: string;
  tokens: number;
  requests: number;
}

interface Stats {
  totalTokens: number;
  totalRequests: number;
  byUser: UserStat[];
  byFeature: { feature: string; tokens: number; requests: number }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const FEATURE_LABELS: Record<string, string> = {
  tags: "Generate Tag",
  summary: "Ringkasan",
  seo_title: "SEO Title",
  meta_description: "Meta Description",
};

export default function AILogPage() {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = session?.user?.role || "";

  const [logs, setLogs] = useState<AILog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filterUser, setFilterUser] = useState("");
  const [loading, setLoading] = useState(true);

  if (
    sessionStatus !== "loading" &&
    session &&
    userRole !== "SUPER_ADMIN" &&
    userRole !== "CHIEF_EDITOR"
  ) {
    redirect("/panel/dashboard");
  }

  const fetchData = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (filterUser) params.set("userId", filterUser);

        const res = await fetch(`/api/ai/usage?${params}`);
        if (res.ok) {
          const json = await res.json();
          setLogs(json.data.logs);
          setPagination(json.data.pagination);
          setStats(json.data.stats);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    },
    [filterUser]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (n: number) => n.toLocaleString("id-ID");

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-goto-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles size={24} className="text-goto-green" />
          <h1 className="text-lg sm:text-2xl font-bold text-txt-primary">
            Log Penggunaan AI
          </h1>
        </div>
        <p className="mt-1 text-sm text-txt-secondary">
          Monitor penggunaan fitur AI dan konsumsi token
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-goto-green/10">
                <Cpu size={20} className="text-goto-green" />
              </div>
              <div>
                <p className="text-xs text-txt-muted">Total Token</p>
                <p className="text-xl font-bold text-txt-primary">
                  {formatNumber(stats.totalTokens)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                <Hash size={20} className="text-gold" />
              </div>
              <div>
                <p className="text-xs text-txt-muted">Total Request</p>
                <p className="text-xl font-bold text-txt-primary">
                  {formatNumber(stats.totalRequests)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-txt-muted">Pengguna Aktif</p>
                <p className="text-xl font-bold text-txt-primary">
                  {stats.byUser.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per User Breakdown */}
      {stats && stats.byUser.length > 0 && (
        <div className="mb-6 rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-txt-primary">
            Penggunaan Per Pengguna
          </h2>
          <div className="space-y-2">
            {stats.byUser.map((u) => (
              <div
                key={u.userId}
                className="flex items-center justify-between rounded-lg bg-surface-secondary px-4 py-2.5"
              >
                <button
                  onClick={() =>
                    setFilterUser(filterUser === u.userId ? "" : u.userId)
                  }
                  className={`text-sm font-medium transition-colors ${
                    filterUser === u.userId
                      ? "text-goto-green"
                      : "text-txt-primary hover:text-goto-green"
                  }`}
                >
                  {u.name}
                </button>
                <div className="flex items-center gap-4 text-xs text-txt-muted">
                  <span>{formatNumber(u.requests)} req</span>
                  <span>{formatNumber(u.tokens)} token</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter indicator */}
      {filterUser && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-txt-secondary">
            Filter: {stats?.byUser.find((u) => u.userId === filterUser)?.name}
          </span>
          <button
            onClick={() => setFilterUser("")}
            className="text-xs text-gold hover:underline"
          >
            Hapus filter
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[12px] border border-border bg-surface shadow-card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-txt-muted">
                Waktu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-txt-muted">
                Pengguna
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-txt-muted">
                Fitur
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-txt-muted">
                Token Digunakan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-txt-muted">
                Artikel
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-txt-muted"
                >
                  Belum ada data penggunaan AI
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-txt-secondary whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-txt-primary">
                    {log.userName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-goto-green/10 px-2.5 py-0.5 text-xs font-medium text-goto-green">
                      {FEATURE_LABELS[log.feature] || log.feature}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-txt-primary">
                    {formatNumber(log.totalTokens)}
                  </td>
                  <td className="px-4 py-3 text-sm text-txt-secondary max-w-[200px] truncate">
                    {log.articleTitle || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-txt-muted">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg p-1.5 text-txt-secondary hover:bg-surface-secondary disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-txt-primary">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchData(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg p-1.5 text-txt-secondary hover:bg-surface-secondary disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
