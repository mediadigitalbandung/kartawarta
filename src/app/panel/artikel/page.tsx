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
  PUBLISHED: { label: "Dipublikasikan", icon: CheckCircle, color: "bg-goto-light text-goto-green" },
  IN_REVIEW: { label: "Dalam Review", icon: Clock, color: "bg-yellow-50 text-yellow-600" },
  DRAFT: { label: "Draft", icon: FileText, color: "bg-surface-tertiary text-txt-secondary" },
  APPROVED: { label: "Disetujui", icon: CheckCircle, color: "bg-blue-50 text-blue-600" },
  REJECTED: { label: "Ditolak", icon: XCircle, color: "bg-red-50 text-red-600" },
  ARCHIVED: { label: "Diarsipkan", icon: FileText, color: "bg-surface-tertiary text-txt-muted" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[12px] border border-border bg-surface shadow-card">
      <div className="border-b border-border bg-surface-secondary px-5 py-3">
        <div className="h-4 w-full rounded bg-surface-tertiary" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-3">
          <div className="h-4 w-1/3 rounded bg-surface-tertiary" />
          <div className="h-4 w-1/6 rounded bg-surface-tertiary" />
          <div className="h-4 w-1/6 rounded bg-surface-tertiary" />
          <div className="h-4 w-16 rounded-full bg-surface-tertiary" />
          <div className="h-4 w-10 rounded bg-surface-tertiary" />
          <div className="h-4 w-20 rounded bg-surface-tertiary" />
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
          <h1 className="text-2xl font-bold text-txt-primary">Artikel</h1>
          <p className="text-sm text-txt-secondary">Kelola semua artikel Anda</p>
        </div>
        <Link
          href="/panel/artikel/baru"
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} />
          Tulis Artikel
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-txt-muted" />
          {["ALL", "DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === status
                  ? "bg-goto-green text-white"
                  : "bg-surface-tertiary text-txt-secondary hover:bg-border"
              }`}
            >
              {status === "ALL" ? "Semua" : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-hidden rounded-[12px] border border-border bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface-secondary">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Judul</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Kategori</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Penulis</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Views</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Tanggal</th>
                    <th className="px-5 py-3 text-right font-medium text-txt-secondary">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((article) => {
                    const config = statusConfig[article.status] || statusConfig.DRAFT;
                    const StatusIcon = config.icon;
                    return (
                      <tr key={article.id} className="hover:bg-surface-secondary">
                        <td className="max-w-[300px] px-5 py-3">
                          <p className="truncate font-medium text-txt-primary">
                            {article.title}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-txt-secondary">
                          {article.category?.name || "\u2014"}
                        </td>
                        <td className="px-5 py-3 text-txt-secondary">
                          {article.author?.name || "\u2014"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                            <StatusIcon size={12} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-txt-secondary">
                          {article.viewCount > 0 ? article.viewCount.toLocaleString("id-ID") : "\u2014"}
                        </td>
                        <td className="px-5 py-3 text-txt-secondary">
                          {formatDate(article.publishedAt || article.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/berita/${article.slug}`)}
                              className="btn-ghost rounded p-1"
                              title="Lihat"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => router.push(`/panel/artikel/${article.id}/edit`)}
                              className="btn-ghost rounded p-1"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(article.id, article.title)}
                              disabled={deleting === article.id}
                              className="btn-ghost rounded p-1 hover:text-red-500 disabled:opacity-50"
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
              <div className="py-12 text-center text-txt-secondary">
                Tidak ada artikel ditemukan.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
