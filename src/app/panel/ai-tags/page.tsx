"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, Tag } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AITagsPage() {
  const [loading, setLoading] = useState(false);
const [result, setResult] = useState<any>(null);
  const { success, error: showError } = useToast();

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/bulk-tags", { method: "POST" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal generate tags");
      }
      const json = await res.json();
      setResult(json.data);
      success(`Berhasil generate tags untuk ${json.data.processed} artikel`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal generate tags");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-txt-primary">Auto Generate Tags AI</h1>
        <p className="text-base text-txt-secondary mt-1">Generate tag SEO otomatis untuk semua artikel menggunakan DeepSeek AI</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-goto-light shrink-0">
            <Sparkles size={24} className="text-goto-green" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-txt-primary">Bulk Generate Tags</h3>
            <p className="text-sm text-txt-secondary mt-1 mb-4">
              AI akan menganalisis setiap artikel yang memiliki kurang dari 5 tag,
              lalu generate 8-10 tag SEO-friendly secara otomatis. Tag baru akan langsung
              membuat halaman /tag/[slug] yang terindex Google.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Sedang memproses..." : "Generate Tags Sekarang"}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="border-b border-border px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-txt-primary">
              <CheckCircle size={16} className="text-goto-green" />
              Hasil Generate
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-xl bg-surface-secondary p-3 text-center">
                <p className="text-2xl font-extrabold text-txt-primary">{result.processed}</p>
                <p className="text-xs text-txt-muted">Artikel Diproses</p>
              </div>
              <div className="rounded-xl bg-surface-secondary p-3 text-center">
                <p className="text-2xl font-extrabold text-goto-green">{result.totalTagsAdded}</p>
                <p className="text-xs text-txt-muted">Tags Baru Ditambahkan</p>
              </div>
              <div className="rounded-xl bg-surface-secondary p-3 text-center">
                <p className="text-2xl font-extrabold text-txt-primary">{result.totalArticles}</p>
                <p className="text-xs text-txt-muted">Total Artikel</p>
              </div>
              <div className="rounded-xl bg-surface-secondary p-3 text-center">
                <p className="text-2xl font-extrabold text-txt-muted">{result.articlesSkipped}</p>
                <p className="text-xs text-txt-muted">Sudah Cukup Tags</p>
              </div>
            </div>

            {result.results?.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-txt-secondary">Detail per Artikel:</p>
{result.results.map((r: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-semibold text-txt-primary mb-2">{r.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-goto-light px-2.5 py-0.5 text-xs font-medium text-goto-green">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
