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
    <aside className="space-y-6">
      {/* Trending */}
      {trending.length > 0 && (
        <div className="rounded-card border border-border bg-paper p-5">
          <div className="mb-4">
            <h3 className="font-mono text-kicker uppercase tracking-widest text-forest">
              Trending
            </h3>
            <div className="mt-1 h-px w-8 bg-forest" />
          </div>
          <ul>
            {trending.map((article, i) => (
              <li
                key={article.slug}
                className={`flex gap-3 py-3 ${
                  i < trending.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="shrink-0 font-serif text-2xl font-bold leading-none text-forest/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <Link
                    href={`/berita/${article.slug}`}
                    className="text-sm font-semibold leading-snug text-press transition-colors duration-200 hover:text-forest"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 font-mono text-meta text-ink">{article.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terbaru */}
      {recent.length > 0 && (
        <div className="rounded-card border border-border bg-paper p-5">
          <div className="mb-4">
            <h3 className="font-mono text-kicker uppercase tracking-widest text-forest">
              Terbaru
            </h3>
            <div className="mt-1 h-px w-8 bg-forest" />
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
                  className="text-sm font-semibold leading-snug text-press transition-colors duration-200 hover:text-forest"
                >
                  {article.title}
                </Link>
                <p className="mt-1 font-mono text-meta text-ink">{article.publishedAt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paling Dibaca */}
      {popular.length > 0 && (
        <div className="rounded-card border border-border bg-paper p-5">
          <div className="mb-4">
            <h3 className="font-mono text-kicker uppercase tracking-widest text-forest">
              Paling Dibaca
            </h3>
            <div className="mt-1 h-px w-8 bg-forest" />
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
                  className="text-sm font-semibold leading-snug text-press transition-colors duration-200 hover:text-forest"
                >
                  {article.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 font-mono text-meta text-ink">
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
