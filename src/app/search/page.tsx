"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import ArticleCard from "@/components/artikel/ArticleCard";

const demoResults = [
  {
    title: "Mahkamah Konstitusi Putuskan Uji Materi UU Cipta Kerja",
    slug: "mk-putuskan-uji-materi-uu-cipta-kerja",
    excerpt: "MK memutuskan hasil uji materi terhadap beberapa pasal dalam UU Cipta Kerja.",
    featuredImage: null,
    category: { name: "Hukum Tata Negara", slug: "hukum-tata-negara" },
    author: { name: "Ahmad Fauzi" },
    publishedAt: new Date().toISOString(),
    readTime: 5,
    viewCount: 1250,
    verificationLabel: "VERIFIED",
  },
  {
    title: "Kasus Penipuan Online di Bandung Meningkat 40%",
    slug: "kasus-penipuan-online-bandung-meningkat",
    excerpt: "Data Polrestabes Bandung menunjukkan peningkatan signifikan kasus penipuan online.",
    featuredImage: null,
    category: { name: "Hukum Pidana", slug: "hukum-pidana" },
    author: { name: "Siti Nurhaliza" },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    readTime: 4,
    viewCount: 890,
    verificationLabel: "VERIFIED",
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(demoResults);

  useEffect(() => {
    if (initialQuery) {
      setResults(
        demoResults.filter((a) =>
          a.title.toLowerCase().includes(initialQuery.toLowerCase())
        )
      );
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(
      demoResults.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase())
      )
    );
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

      {query && (
        <p className="mt-4 text-sm text-gray-500">
          {results.length} hasil ditemukan untuk &quot;{query}&quot;
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </div>

      {results.length === 0 && query && (
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
