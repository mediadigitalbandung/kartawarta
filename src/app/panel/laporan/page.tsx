"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle, Clock, Eye, XCircle } from "lucide-react";

interface Report {
  id: string;
  reason: string;
  detail?: string;
  email?: string | null;
  status: string;
  createdAt: string;
  article?: {
    id: string;
    title: string;
    slug: string;
    author?: { name: string };
  };
}

const reasonLabels: Record<string, { label: string; color: string }> = {
  HOAX: { label: "Hoax", color: "bg-red-100 text-red-700" },
  INACCURATE: { label: "Tidak Akurat", color: "bg-yellow-100 text-yellow-700" },
  SARA: { label: "SARA", color: "bg-orange-100 text-orange-700" },
  DEFAMATION: { label: "Pencemaran Nama Baik", color: "bg-purple-100 text-purple-700" },
  OTHER: { label: "Lainnya", color: "bg-gray-100 text-gray-700" },
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Menunggu", icon: Clock, color: "text-yellow-600" },
  REVIEWED: { label: "Sedang Ditinjau", icon: Eye, color: "text-blue-600" },
  RESOLVED: { label: "Selesai", icon: CheckCircle, color: "text-green-600" },
  DISMISSED: { label: "Ditolak", icon: XCircle, color: "text-gray-500" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-7 w-8 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LaporanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/reports");
      if (!res.ok) {
        throw new Error("Gagal memuat laporan");
      }

      const json = await res.json();
      setReports(json.data || []);
    } catch (err) {
      setError("Gagal memuat daftar laporan. Silakan coba lagi.");
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function handleUpdateStatus(id: string, newStatus: string) {
    try {
      setUpdating(id);
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal mengubah status laporan");
      }

      alert(`Laporan berhasil diubah ke status: ${statusConfig[newStatus]?.label || newStatus}`);
      fetchReports();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status laporan.");
      console.error("Update report error:", err);
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Laporan Berita
        </h1>
        <p className="text-sm text-gray-500">
          {loading ? "Memuat..." : `${pendingCount} laporan menunggu ditinjau`}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = reports.filter((r) => r.status === key).length;
              return (
                <div key={key} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className={`flex items-center gap-2 text-sm ${config.color}`}>
                    <Icon size={16} /> {config.label}
                  </div>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Reports list */}
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                Belum ada laporan.
              </div>
            ) : (
              reports.map((report) => {
                const reason = reasonLabels[report.reason] || { label: report.reason, color: "bg-gray-100 text-gray-700" };
                const status = statusConfig[report.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={report.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`badge ${reason.color}`}>
                            <AlertTriangle size={10} className="mr-1" />
                            {reason.label}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(report.createdAt)}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {report.article?.title || "Artikel tidak ditemukan"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {report.detail || "Tidak ada detail."}
                        </p>
                        {report.email && (
                          <p className="mt-1 text-xs text-gray-400">
                            Pelapor: {report.email}
                          </p>
                        )}
                      </div>
                      {report.status === "PENDING" && (
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(report.id, "REVIEWED")}
                            disabled={updating === report.id}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                          >
                            {updating === report.id ? "..." : "Tinjau"}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                            disabled={updating === report.id}
                            className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            {updating === report.id ? "..." : "Tolak"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
