"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, CheckCircle, AlertTriangle, XCircle, ExternalLink, Globe, FileText, Image, Type, Tag, RefreshCw, TrendingUp } from "lucide-react";

interface SeoData {
  overview: {
    seoScore: number;
    totalArticles: number;
    publishedArticles: number;
    articlesWithSeo: number;
    articlesWithImage: number;
    articlesWithExcerpt: number;
    categories: number;
    tags: number;
    sitemapPages: number;
  };
  coverage: { seoTitle: number; image: number; excerpt: number };
  urls: { sitemap: string; newsSitemap: string; robots: string; searchConsole: string; publisherCenter: string };
  articleAudit: {
    title: string; slug: string; url: string; seoTitle: string | null; seoDescription: string | null;
    hasImage: boolean; hasExcerpt: boolean; issues: string[]; score: number; views: number; publishedAt: string;
  }[];
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
  const bgColor = score >= 80 ? "bg-green-50" : score >= 50 ? "bg-yellow-50" : "bg-red-50";
  const ringColor = score >= 80 ? "ring-green-100" : score >= 50 ? "ring-yellow-100" : "ring-red-100";
  return (
    <div className={`flex h-28 w-28 items-center justify-center rounded-full ${bgColor} ring-4 ${ringColor}`}>
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
    </div>
  );
}

function CoverageBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-txt-secondary"><Icon size={14} /> {label}</span>
        <span className="font-bold text-txt-primary">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-tertiary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function SeoDashboardPage() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/panel/seo");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-surface-tertiary" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl bg-surface-tertiary" />)}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-txt-muted">Gagal memuat data SEO.</p>;

  const { overview, coverage, urls, articleAudit } = data;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-txt-primary">SEO Dashboard</h1>
          <p className="text-base text-txt-secondary">Monitor kesehatan SEO website Kartawarta</p>
        </div>
        <button onClick={fetchData} className="btn-ghost flex items-center gap-2 px-3 py-2.5 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Score + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* SEO Score */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col items-center justify-center">
          <ScoreCircle score={overview.seoScore} />
          <p className="mt-3 text-sm font-bold text-txt-primary">Skor SEO</p>
          <p className="text-xs text-txt-muted">dari 100</p>
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-1.5"><FileText size={14} className="text-primary" /> Konten</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-txt-secondary">Artikel Dipublikasi</span><span className="font-bold">{overview.publishedArticles}</span></div>
            <div className="flex justify-between"><span className="text-txt-secondary">Total Artikel</span><span className="font-bold">{overview.totalArticles}</span></div>
            <div className="flex justify-between"><span className="text-txt-secondary">Kategori</span><span className="font-bold">{overview.categories}</span></div>
            <div className="flex justify-between"><span className="text-txt-secondary">Tags</span><span className="font-bold">{overview.tags}</span></div>
          </div>
        </div>

        {/* Coverage */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500" /> Coverage</h3>
          <CoverageBar label="SEO Title" value={coverage.seoTitle} icon={Type} />
          <CoverageBar label="Gambar" value={coverage.image} icon={Image} />
          <CoverageBar label="Excerpt" value={coverage.excerpt} icon={FileText} />
        </div>

        {/* Sitemap & Links */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-1.5"><Globe size={14} className="text-primary" /> Sitemap & Tools</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-txt-secondary">Halaman di Sitemap</span>
              <span className="font-bold">{overview.sitemapPages}</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <a href={urls.sitemap} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink size={10} /> sitemap.xml</a>
            <a href={urls.newsSitemap} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink size={10} /> news-sitemap.xml</a>
            <a href={urls.robots} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink size={10} /> robots.txt</a>
            <a href={urls.searchConsole} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink size={10} /> Google Search Console</a>
            <a href={urls.publisherCenter} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink size={10} /> Google News Publisher</a>
          </div>
        </div>
      </div>

      {/* SEO Features */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card mb-6">
        <h3 className="text-sm font-bold text-txt-primary mb-4 flex items-center gap-1.5"><TrendingUp size={14} className="text-primary" /> Fitur SEO Aktif</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: "JSON-LD NewsArticle", ok: true },
            { name: "OpenGraph Tags", ok: true },
            { name: "Twitter Cards", ok: true },
            { name: "Canonical URLs", ok: true },
            { name: "Google News Sitemap", ok: true },
            { name: "IndexNow Auto-Ping", ok: true },
            { name: "Auto SEO Title", ok: true },
            { name: "Auto Meta Description", ok: true },
            { name: "Breadcrumb Schema", ok: true },
            { name: "Search Console Verified", ok: true },
            { name: "Publisher Center", ok: true },
            { name: "Cloudflare CDN", ok: true },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-2 rounded-lg bg-surface-secondary px-3 py-2.5 text-xs">
              <CheckCircle size={12} className="text-green-500 shrink-0" />
              <span className="text-txt-primary font-medium">{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Article SEO Audit */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-1.5"><Search size={14} className="text-primary" /> Audit SEO Artikel (20 Terbaru)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-txt-secondary">Artikel</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-txt-secondary">Skor</th>
                <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-medium text-txt-secondary">SEO Title</th>
                <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-medium text-txt-secondary">Meta Desc</th>
                <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-medium text-txt-secondary">Gambar</th>
                <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-medium text-txt-secondary">Excerpt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-txt-secondary">Masalah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articleAudit.map((a) => (
                <tr key={a.slug} className="hover:bg-surface-secondary">
                  <td className="px-4 py-3 max-w-[200px]">
                    <a href={a.url} target="_blank" rel="noopener" className="text-sm font-medium text-txt-primary hover:text-primary truncate block">{a.title}</a>
                    <span className="text-xs text-txt-muted">{a.views.toLocaleString("id-ID")} views</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold ${
                      a.score >= 80 ? "bg-green-50 text-green-600" : a.score >= 50 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                    }`}>{a.score}</span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-center">
                    {a.seoTitle ? <CheckCircle size={14} className="mx-auto text-green-500" /> : <XCircle size={14} className="mx-auto text-red-400" />}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-center">
                    {a.seoDescription ? <CheckCircle size={14} className="mx-auto text-green-500" /> : <XCircle size={14} className="mx-auto text-red-400" />}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-center">
                    {a.hasImage ? <CheckCircle size={14} className="mx-auto text-green-500" /> : <XCircle size={14} className="mx-auto text-red-400" />}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-center">
                    {a.hasExcerpt ? <CheckCircle size={14} className="mx-auto text-green-500" /> : <XCircle size={14} className="mx-auto text-red-400" />}
                  </td>
                  <td className="px-4 py-3">
                    {a.issues.length === 0 ? (
                      <span className="text-xs text-green-500 font-medium">Sempurna</span>
                    ) : (
                      <div className="space-y-0.5">
                        {a.issues.map((issue, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs text-yellow-600">
                            <AlertTriangle size={10} className="shrink-0" /> {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
