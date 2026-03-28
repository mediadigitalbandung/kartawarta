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

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m yang lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}j yang lalu`;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-l-[3px] border-goto-green pl-3 text-sm font-bold uppercase tracking-wide text-txt-primary">
      {children}
    </h3>
  );
}

export default function Sidebar({ trending = [], recent = [], popular = [] }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Trending */}
      {trending.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <SectionTitle>Trending</SectionTitle>
            <Link href="/berita?sort=popular" className="text-xs font-medium text-goto-green hover:underline">
              Lihat Semua &rarr;
            </Link>
          </div>
          <ul className="mt-4">
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
                    className="text-sm font-semibold leading-snug text-txt-primary hover:underline"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-xs text-txt-muted">{article.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terbaru */}
      {recent.length > 0 && (
        <div>
          <SectionTitle>Terbaru</SectionTitle>
          <ul className="mt-4">
            {recent.map((article, i) => (
              <li
                key={article.slug}
                className={`py-3 ${
                  i < recent.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className="text-sm font-semibold leading-snug text-txt-primary hover:underline"
                >
                  {article.title}
                </Link>
                <p className="mt-1 text-xs text-txt-muted">
                  {formatTime(article.publishedAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paling Dibaca */}
      {popular.length > 0 && (
        <div>
          <SectionTitle>Paling Dibaca</SectionTitle>
          <ul className="mt-4">
            {popular.map((article, i) => (
              <li
                key={article.slug}
                className={`py-3 ${
                  i < popular.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className="text-sm font-semibold leading-snug text-txt-primary hover:underline"
                >
                  {article.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-txt-muted">
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
