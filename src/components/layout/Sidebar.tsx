import Link from "next/link";

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
    <aside className="space-y-5">
      {/* Trending */}
      {trending.length > 0 && (
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-txt-primary">
              Trending
            </h3>
            <div className="mt-1.5 h-0.5 w-8 rounded-full bg-goto-green" />
          </div>
          <ul>
            {trending.map((article, i) => (
              <li
                key={article.slug}
                className={`flex gap-3 py-3 ${
                  i < trending.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="shrink-0 text-2xl font-extrabold leading-none text-goto-green/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <Link
                    href={`/berita/${article.slug}`}
                    className="text-sm font-semibold leading-snug text-txt-primary transition-colors duration-200 hover:text-goto-green"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-xs text-txt-secondary">{article.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terbaru */}
      {recent.length > 0 && (
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-txt-primary">
              Terbaru
            </h3>
            <div className="mt-1.5 h-0.5 w-8 rounded-full bg-goto-green" />
          </div>
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
                  className="text-sm font-semibold leading-snug text-txt-primary transition-colors duration-200 hover:text-goto-green"
                >
                  {article.title}
                </Link>
                <p className="mt-1 text-xs text-txt-secondary">{article.publishedAt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paling Dibaca */}
      {popular.length > 0 && (
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-txt-primary">
              Paling Dibaca
            </h3>
            <div className="mt-1.5 h-0.5 w-8 rounded-full bg-goto-green" />
          </div>
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
                  className="text-sm font-semibold leading-snug text-txt-primary transition-colors duration-200 hover:text-goto-green"
                >
                  {article.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-txt-secondary">
                  <span>{article.category}</span>
                  {article.viewCount && (
                    <>
                      <span className="h-3 w-px bg-border" />
                      <span>
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
