"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchResults = async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setTotal(0);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
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

  return (
    <>
      <form onSubmit={handleSearch} className="mt-4">
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berita hukum..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-900"
            autoFocus
          />
        </div>
      </form>

      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      )}

      {!loading && searched && query && (
        <p className="mt-4 text-sm text-gray-500">
          {total} hasil ditemukan untuk &quot;{query}&quot;
        </p>
      )}

      {!loading && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      )}

      {!loading && results.length === 0 && searched && query && (
        <div className="py-16 text-center">
          <SearchIcon size={48} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">
            Tidak ada hasil untuk &quot;{query}&quot;
          </p>
          <p className="text-sm text-gray-400">
            Coba kata kunci lain atau periksa ejaan
          </p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Pencarian
      </h1>
      <Suspense
        fallback={
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </div>
  );
}
