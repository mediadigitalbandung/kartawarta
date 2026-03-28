"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal, Clock, Calendar, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import ArticleCard from "@/components/artikel/ArticleCard";

interface SearchResult {
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt: string;
  readTime: number | null;
  viewCount: number;
  verificationLabel: string;
}

type SortBy = "terbaru" | "terlama" | "terpopuler";
type TimeRange = "semua" | "minggu" | "bulan" | "tahun";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("terbaru");
  const [timeRange, setTimeRange] = useState<TimeRange>("semua");
  const [page, setPage] = useState(0);
  const perPage = 9;

  const fetchResults = async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setTotal(0);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=100`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data.articles || []);
        setTotal(json.data.pagination?.total || json.data.articles?.length || 0);
      } else {
        setResults([]);
        setTotal(0);
      }
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setSearched(true);
      setPage(0);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchResults(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    fetchResults(query);
  };

  // Filter & sort results
  const filtered = useMemo(() => {
    let data = [...results];

    // Time range filter
    if (timeRange !== "semua") {
      const now = new Date();
      let cutoff: Date;
      if (timeRange === "minggu") cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (timeRange === "bulan") cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      else cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      data = data.filter((a) => new Date(a.publishedAt) >= cutoff);
    }

    // Sort
    if (sortBy === "terpopuler") data.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    else if (sortBy === "terlama") data.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    else data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return data;
  }, [results, sortBy, timeRange]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  const sortOptions: { value: SortBy; label: string; icon: typeof Clock }[] = [
    { value: "terbaru", label: "Terbaru", icon: Clock },
    { value: "terlama", label: "Terlama", icon: Calendar },
    { value: "terpopuler", label: "Terpopuler", icon: TrendingUp },
  ];

  const timeOptions: { value: TimeRange; label: string }[] = [
    { value: "semua", label: "Semua Waktu" },
    { value: "minggu", label: "1 Minggu" },
    { value: "bulan", label: "1 Bulan" },
    { value: "tahun", label: "1 Tahun" },
  ];

  return (
    <>
      {/* Search input */}
      <form onSubmit={handleSearch} className="mt-4">
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berita hukum..."
            className="input w-full py-3 pl-12 pr-4 text-lg"
            autoFocus
          />
        </div>
      </form>

      {/* Filters — only show after search */}
      {searched && results.length > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Sort by */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal size={14} className="text-txt-muted shrink-0" />
            <span className="text-xs text-txt-muted shrink-0">Urutan:</span>
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setPage(0); }}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  sortBy === opt.value
                    ? "bg-goto-green text-white"
                    : "bg-surface-secondary text-txt-secondary hover:bg-surface-tertiary"
                }`}
              >
                <opt.icon size={12} />
                {opt.label}
              </button>
            ))}
          </div>

          {/* Time range */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar size={14} className="text-txt-muted shrink-0" />
            <span className="text-xs text-txt-muted shrink-0">Periode:</span>
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setTimeRange(opt.value); setPage(0); }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  timeRange === opt.value
                    ? "bg-goto-green text-white"
                    : "bg-surface-secondary text-txt-secondary hover:bg-surface-tertiary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-goto-green border-t-transparent" />
        </div>
      )}

      {/* Results count */}
      {!loading && searched && query && (
        <p className="mt-4 text-sm text-txt-muted">
          {filtered.length} hasil ditemukan untuk &quot;{query}&quot;
          {timeRange !== "semua" && ` (${timeOptions.find(t => t.value === timeRange)?.label})`}
        </p>
      )}

      {/* Results grid */}
      {!loading && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-txt-primary transition-all hover:border-goto-green hover:text-goto-green disabled:opacity-30 disabled:hover:border-border disabled:hover:text-txt-primary"
          >
            <ChevronLeft size={16} />
            Sebelumnya
          </button>
          <span className="text-sm text-txt-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-txt-primary transition-all hover:border-goto-green hover:text-goto-green disabled:opacity-30 disabled:hover:border-border disabled:hover:text-txt-primary"
          >
            Selanjutnya
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && searched && query && (
        <div className="py-16 text-center">
          <SearchIcon size={48} className="mx-auto text-border" />
          <p className="mt-4 text-txt-secondary">
            Tidak ada hasil untuk &quot;{query}&quot;
          </p>
          <p className="text-sm text-txt-muted">
            Coba kata kunci lain, ubah filter, atau periksa ejaan
          </p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="container-main py-8">
        <h1 className="flex items-center gap-3 text-xl font-bold text-txt-primary sm:text-2xl lg:text-3xl">
          <span className="block h-7 w-[3px] rounded-full bg-goto-green" />
          Pencarian
        </h1>
        <Suspense
          fallback={
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-goto-green border-t-transparent" />
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
