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
    <aside className="space-y-8">
      {/* Trending */}
      {trending.length > 0 && (
        <div className="card-flat p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            Trending
          </h3>
          <ul className="space-y-0">
            {trending.map((article, i) => (
              <li key={article.slug}>
                <div className="flex gap-4 py-4">
                  <span className="shrink-0 text-3xl font-extrabold text-gradient leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <Link
                      href={`/berita/${article.slug}`}
                      className="text-sm font-semibold leading-snug text-gray-800 transition-colors duration-200 hover:text-primary-500 dark:text-gray-200"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500">{article.category}</p>
                  </div>
                </div>
                {i < trending.length - 1 && <div className="divider-gradient" />}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terbaru */}
      {recent.length > 0 && (
        <div className="card-flat p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <Clock size={18} className="text-primary-500" />
            Terbaru
          </h3>
          <ul className="space-y-0">
            {recent.map((article, i) => (
              <li key={article.slug}>
                <div className="py-4">
                  <Link
                    href={`/berita/${article.slug}`}
                    className="text-sm font-semibold text-gray-800 transition-colors duration-200 hover:text-primary-500 dark:text-gray-200"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">{article.publishedAt}</p>
                </div>
                {i < recent.length - 1 && <div className="divider-gradient" />}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paling Dibaca */}
      {popular.length > 0 && (
        <div className="card-flat p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <Eye size={18} className="text-emerald-500" />
            Paling Dibaca
          </h3>
          <ul className="space-y-0">
            {popular.map((article, i) => (
              <li key={article.slug}>
                <div className="flex gap-4 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-xs font-bold text-white shadow-md shadow-primary-500/20">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/berita/${article.slug}`}
                      className="text-sm font-semibold text-gray-800 transition-colors duration-200 hover:text-primary-500 dark:text-gray-200"
                    >
                      {article.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>{article.category}</span>
                      {article.viewCount && (
                        <>
                          <span className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                          <span>{article.viewCount.toLocaleString("id-ID")} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {i < popular.length - 1 && <div className="divider-gradient" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
