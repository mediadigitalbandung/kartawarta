import Link from "next/link";
import { TrendingUp, Clock, Eye } from "lucide-react";

interface SidebarArticle {
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  viewCount?: number;
}

interface SidebarProps {
  trending?: SidebarArticle[];
  recent?: SidebarArticle[];
  popular?: SidebarArticle[];
}

export default function Sidebar({ trending = [], recent = [], popular = [] }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Trending */}
      {trending.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            <TrendingUp size={16} className="text-accent" />
            Trending
          </h3>
          <ul className="space-y-3">
            {trending.map((article, i) => (
              <li key={article.slug} className="flex gap-3">
                <span className="shrink-0 text-2xl font-bold text-gray-200 dark:text-gray-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <Link
                    href={`/berita/${article.slug}`}
                    className="text-sm font-medium leading-snug text-gray-800 hover:text-primary-500 dark:text-gray-200"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">{article.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terbaru */}
      {recent.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            <Clock size={16} className="text-primary-500" />
            Terbaru
          </h3>
          <ul className="space-y-3">
            {recent.map((article) => (
              <li key={article.slug} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
                <Link
                  href={`/berita/${article.slug}`}
                  className="text-sm font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200"
                >
                  {article.title}
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">{article.publishedAt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Populer */}
      {popular.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            <Eye size={16} className="text-green-500" />
            Paling Dibaca
          </h3>
          <ul className="space-y-3">
            {popular.map((article) => (
              <li key={article.slug} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
                <Link
                  href={`/berita/${article.slug}`}
                  className="text-sm font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200"
                >
                  {article.title}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                  <span>{article.category}</span>
                  {article.viewCount && (
                    <>
                      <span>&middot;</span>
                      <span>{article.viewCount.toLocaleString("id-ID")} views</span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ad slot - Sidebar */}
      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-400">IKLAN - 300x250</p>
        <div className="mx-auto mt-2 h-[250px] w-[300px] bg-gray-200 dark:bg-gray-700" />
      </div>
    </aside>
  );
}
