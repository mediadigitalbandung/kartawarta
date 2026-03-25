"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  verificationLabel: string;
  createdAt: string;
  publishedAt: string | null;
  author?: { id: string; name: string; avatar?: string };
  category?: { id: string; name: string; slug: string };
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PUBLISHED: { label: "Dipublikasikan", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  IN_REVIEW: { label: "Dalam Review", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  DRAFT: { label: "Draft", icon: FileText, color: "text-gray-600 bg-gray-100" },
  APPROVED: { label: "Disetujui", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
  REJECTED: { label: "Ditolak", icon: XCircle, color: "text-red-600 bg-red-50" },
  ARCHIVED: { label: "Diarsipkan", icon: FileText, color: "text-gray-500 bg-gray-50" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-1/6 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-1/6 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

export default function ArtikelPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all statuses for the admin panel
      const statusParam = "ALL";
      const res = await fetch(`/api/articles?limit=50&status=${statusParam}`);

      if (!res.ok) {
        throw new Error("Gagal memuat artikel");
      }

      const json = await res.json();
      setArticles(json.data?.articles || []);
    } catch (err) {
      setError("Gagal memuat daftar artikel. Silakan coba lagi.");
      console.error("Fetch articles error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Yakin ingin menghapus artikel "${title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    try {
      setDeleting(id);
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus artikel");
      }

      alert("Artikel berhasil dihapus.");
      fetchArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus artikel.");
      console.error("Delete article error:", err);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = articles.filter((a) => {
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artikel</h1>
          <p className="text-sm text-gray-500">Kelola semua artikel Anda</p>
        </div>
        <Link
          href="/panel/artikel/baru"
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} />
          Tulis Artikel
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          {["ALL", "DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === status
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {status === "ALL" ? "Semua" : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
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
          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Judul</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Kategori</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Penulis</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Views</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Tanggal</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((article) => {
                    const config = statusConfig[article.status] || statusConfig.DRAFT;
                    const StatusIcon = config.icon;
                    return (
                      <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="max-w-[300px] px-5 py-3">
                          <p className="truncate font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {article.category?.name || "—"}
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {article.author?.name || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                            <StatusIcon size={12} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {article.viewCount > 0 ? article.viewCount.toLocaleString("id-ID") : "\u2014"}
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {formatDate(article.publishedAt || article.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/berita/${article.slug}`)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-gray-800"
                              title="Lihat"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => router.push(`/panel/artikel/${article.id}/edit`)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-500 dark:hover:bg-gray-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(article.id, article.title)}
                              disabled={deleting === article.id}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 disabled:opacity-50"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Tidak ada artikel ditemukan.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
