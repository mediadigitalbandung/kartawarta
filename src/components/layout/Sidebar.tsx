import Link from "next/link";
import { Eye } from "lucide-react";

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
        <div className="rounded-lg bg-bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            <span className="h-4 w-1 rounded-full bg-brand" />
            Trending
          </h3>
          <ul>
            {trending.map((article, i) => (
              <li
                key={article.slug}
                className={`flex gap-3 py-3 ${
                  i < trending.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="shrink-0 text-2xl font-bold leading-none text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <Link
                    href={`/berita/${article.slug}`}
                    className="text-sm text-text-secondary transition-colors duration-200 hover:text-white"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-xs text-text-muted">{article.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terbaru */}
      {recent.length > 0 && (
        <div className="rounded-lg bg-bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            <span className="h-4 w-1 rounded-full bg-brand" />
            Terbaru
          </h3>
          <ul>
            {recent.map((article, i) => (
              <li
                key={article.slug}
                className={`py-3 ${
                  i < recent.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className="text-sm text-text-secondary transition-colors duration-200 hover:text-white"
                >
                  {article.title}
                </Link>
                <p className="mt-1 text-xs text-text-muted">{article.publishedAt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paling Dibaca */}
      {popular.length > 0 && (
        <div className="rounded-lg bg-bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            <span className="h-4 w-1 rounded-full bg-brand" />
            Paling Dibaca
          </h3>
          <ul>
            {popular.map((article, i) => (
              <li
                key={article.slug}
                className={`py-3 ${
                  i < popular.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className="text-sm text-text-secondary transition-colors duration-200 hover:text-white"
                >
                  {article.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                  <span>{article.category}</span>
                  {article.viewCount && (
                    <>
                      <span className="h-3 w-px bg-border" />
                      <span className="flex items-center gap-1">
                        <Eye size={11} />
                        {article.viewCount.toLocaleString("id-ID")} views
                      </span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
