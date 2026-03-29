"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  History,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Revision {
  id: string;
  title: string;
  content: string;
  changedBy: string;
  createdAt: string;
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="mb-6">
        <div className="h-4 w-32 rounded bg-surface-tertiary" />
        <div className="mt-2 h-7 w-64 rounded bg-surface-tertiary" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-4 rounded-[12px] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-surface-tertiary" />
              <div>
                <div className="h-4 w-48 rounded bg-surface-tertiary" />
                <div className="mt-1 h-3 w-32 rounded bg-surface-secondary" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-[8px] bg-surface-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RevisionsPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [articleTitle, setArticleTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRevisions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [revRes, articleRes] = await Promise.all([
        fetch(`/api/articles/${articleId}/revisions`),
        fetch(`/api/articles/${articleId}`),
      ]);

      if (!revRes.ok) {
        setError("Gagal memuat riwayat revisi.");
        return;
      }

      const revJson = await revRes.json();
      setRevisions(revJson.data || []);

      if (articleRes.ok) {
        const articleJson = await articleRes.json();
        setArticleTitle(articleJson.data?.title || "");
      }
    } catch {
      setError("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/panel/artikel/${articleId}/edit`)}
          className="mb-1 flex items-center gap-1 text-xs text-txt-secondary hover:text-txt-primary"
        >
          <ArrowLeft size={14} /> Kembali ke Editor
        </button>
        <h1 className="flex items-center gap-2 text-lg sm:text-2xl font-bold text-txt-primary">
          <History size={24} className="text-goto-green" />
          Riwayat Revisi
        </h1>
        {articleTitle && (
          <p className="mt-1 text-sm text-txt-secondary">
            Artikel: <span className="font-medium text-txt-primary">{articleTitle}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {revisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-surface p-12 text-center">
          <FileText size={48} className="mb-4 text-txt-muted" />
          <h2 className="text-lg font-semibold text-txt-primary">Belum Ada Revisi</h2>
          <p className="mt-1 text-sm text-txt-secondary">
            Riwayat revisi akan muncul setelah artikel diedit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {revisions.map((rev, index) => {
            const isExpanded = expandedId === rev.id;
            const revDate = new Date(rev.createdAt);

            return (
              <div
                key={rev.id}
                className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden"
              >
                {/* Revision header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-goto-light text-xs font-bold text-goto-green">
                      v{revisions.length - index}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-txt-primary">
                        {rev.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-txt-muted mt-0.5">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {rev.changedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {revDate.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-3 shrink-0">
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-txt-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-txt-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4">
                    <label className="mb-2 block text-xs font-semibold text-txt-muted uppercase tracking-wider">
                      Konten pada revisi ini
                    </label>
                    <div
                      className="prose prose-sm max-w-none text-txt-primary text-justify rounded-[8px] border border-border bg-surface-secondary p-4 max-h-[500px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: rev.content }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
