"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  isApproved: boolean;
  articleId: string;
  parentId: string | null;
  createdAt: string;
  article?: {
    title: string;
    slug: string;
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[12px] border border-border bg-surface p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-16 rounded-full bg-surface-tertiary" />
            <div className="h-4 w-20 rounded bg-surface-tertiary" />
          </div>
          <div className="h-5 w-2/3 rounded bg-surface-tertiary" />
          <div className="mt-2 h-4 w-full rounded bg-surface-secondary" />
        </div>
      ))}
    </div>
  );
}

export default function KomentarPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all articles that have comments — we need article info
      // We'll fetch comments grouped by fetching all articles with comments
      const res = await fetch("/api/articles?limit=500&status=PUBLISHED");
      if (!res.ok) throw new Error("Gagal memuat artikel");
      const articlesJson = await res.json();
      const articles = articlesJson.data?.articles || [];

      const allComments: Comment[] = [];

      // Fetch comments for each article
      for (const article of articles) {
        try {
          const cRes = await fetch(`/api/articles/${article.id}/comments`);
          if (cRes.ok) {
            const cJson = await cRes.json();
            const articleComments = (cJson.data || []).map((c: Comment) => ({
              ...c,
              article: { title: article.title, slug: article.slug },
            }));
            allComments.push(...articleComments);
          }
        } catch {
          // Skip failed fetches
        }
      }

      // Sort by createdAt desc
      allComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setComments(allComments);
    } catch (err) {
      setError("Gagal memuat daftar komentar. Silakan coba lagi.");
      // Error handled by state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleApprove(id: string) {
    try {
      setUpdating(id);
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menyetujui komentar");
      }
      // Update local state
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isApproved: true } : c))
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal menyetujui komentar");
    } finally {
      setUpdating(null);
    }
  }

  async function handleReject(id: string) {
    try {
      setUpdating(id);
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menolak komentar");
      }
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isApproved: false } : c))
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal menolak komentar");
    } finally {
      setUpdating(null);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ message: "Hapus komentar ini secara permanen?", variant: "danger", title: "Konfirmasi" });
    if (!ok) return;
    try {
      setUpdating(id);
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus komentar");
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal menghapus komentar");
    } finally {
      setUpdating(null);
    }
  }

  const filteredComments = comments.filter((c) => {
    if (filter === "pending") return !c.isApproved;
    if (filter === "approved") return c.isApproved;
    return true;
  });

  const pendingCount = comments.filter((c) => !c.isApproved).length;
  const approvedCount = comments.filter((c) => c.isApproved).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-txt-primary flex items-center gap-2">
          <MessageCircle size={24} />
          Komentar
        </h1>
        <p className="text-sm text-txt-secondary">
          {loading
            ? "Memuat..."
            : `${pendingCount} komentar menunggu moderasi`}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={fetchComments}
            className="mt-2 rounded-[12px] bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-txt-secondary">
                <MessageCircle size={16} /> Total
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-txt-primary">
                {comments.length}
              </p>
            </div>
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <Clock size={16} /> Menunggu
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-txt-primary">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-goto-green">
                <CheckCircle size={16} /> Disetujui
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-txt-primary">
                {approvedCount}
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4 flex items-center gap-2">
            <Filter size={16} className="text-txt-muted" />
            {(
              [
                { key: "pending", label: "Menunggu" },
                { key: "approved", label: "Disetujui" },
                { key: "all", label: "Semua" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-goto-green text-white"
                    : "bg-surface-tertiary text-txt-secondary hover:bg-border"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Comments list */}
          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <div className="rounded-[12px] border border-border bg-surface p-8 text-center text-txt-secondary shadow-card">
                Tidak ada komentar
                {filter === "pending"
                  ? " yang menunggu moderasi"
                  : filter === "approved"
                    ? " yang disetujui"
                    : ""}
                .
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-[12px] border border-border bg-surface p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Status + meta */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`badge text-xs ${
                            comment.isApproved
                              ? "bg-goto-light text-goto-green"
                              : "bg-yellow-50 text-yellow-600"
                          }`}
                        >
                          {comment.isApproved ? (
                            <>
                              <CheckCircle size={10} className="mr-1" />
                              Disetujui
                            </>
                          ) : (
                            <>
                              <Clock size={10} className="mr-1" />
                              Menunggu
                            </>
                          )}
                        </span>
                        <span className="text-xs text-txt-muted">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      {/* Article title */}
                      {comment.article && (
                        <p className="mb-1 text-xs text-txt-muted">
                          Pada:{" "}
                          <a
                            href={`/berita/${comment.article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-goto-green hover:underline"
                          >
                            {comment.article.title}
                          </a>
                        </p>
                      )}

                      {/* Author info */}
                      <p className="text-sm font-semibold text-txt-primary">
                        {comment.authorName}
                        <span className="ml-2 text-xs font-normal text-txt-muted">
                          ({comment.authorEmail})
                        </span>
                      </p>

                      {/* Comment content */}
                      <p className="mt-1 text-sm text-txt-secondary leading-relaxed">
                        {comment.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 gap-1.5">
                      {!comment.isApproved && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          disabled={updating === comment.id}
                          className="rounded-lg bg-goto-light p-2 text-goto-green hover:bg-goto-green/20 disabled:opacity-50"
                          title="Setujui"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {comment.isApproved && (
                        <button
                          onClick={() => handleReject(comment.id)}
                          disabled={updating === comment.id}
                          className="rounded-lg bg-yellow-50 p-2 text-yellow-600 hover:bg-yellow-100 disabled:opacity-50"
                          title="Batalkan persetujuan"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={updating === comment.id}
                        className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 disabled:opacity-50"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
