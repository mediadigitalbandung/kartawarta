export const dynamic = "force-dynamic";

import Link from "next/link";
import ArticleCard from "@/components/artikel/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import NewsTicker from "@/components/layout/NewsTicker";
import { Scale, BookOpen, Gavel, Shield, Users, Landmark, LucideIcon, Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";

const categoryIconMap: Record<string, LucideIcon> = {
  "hukum-pidana": Gavel,
  "hukum-perdata": Scale,
  "hukum-tata-negara": Landmark,
  "ham": Shield,
  "opini": BookOpen,
  "berita-bandung": Users,
};

const defaultIcon = Scale;

export default async function HomePage() {
  const [articles, categories, trendingArticles, tickerArticles, headerAds] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 7,
    }),
    prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.ad.findMany({
      where: { isActive: true, slot: "HEADER" },
    }),
  ]);

  const featured = articles[0];
  const restArticles = articles.slice(1);

  const tickerItems = tickerArticles.map((a) => ({
    title: a.title,
    slug: a.slug,
  }));

  const sidebarTrending = trendingArticles.map((a) => ({
    title: a.title,
    slug: a.slug,
    category: a.category.name,
    publishedAt: a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString("id-ID")
      : "",
    viewCount: a.viewCount,
  }));

  return (
    <>
      <NewsTicker items={tickerItems} />

      {/* Hero gradient section */}
      <div className="relative overflow-hidden bg-primary-gradient">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container-main relative py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Jurnalis Hukum Bandung
              </h1>
              <p className="text-sm text-white/70">Portal berita hukum terpercaya</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner Ad Slot */}
      {headerAds.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50 py-3 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="container-main">
            <div className="mx-auto h-[90px] max-w-[728px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center dark:border-gray-600 dark:bg-gray-800">
              <span className="text-xs text-gray-400">IKLAN BANNER - 728x90</span>
            </div>
          </div>
        </div>
      )}

      <div className="container-main py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Featured article */}
            {featured && (
              <section className="mb-10 animate-fade-up">
                <ArticleCard {...featured} variant="featured" />
              </section>
            )}

            <div className="divider-gradient mb-10" />

            {/* Latest articles grid */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="section-title">
                  Berita Terkini
                </h2>
                <Link
                  href="/berita"
                  className="btn-ghost text-primary-500 text-sm"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>

              {restArticles.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {restArticles.map((article, index) => (
                    <div
                      key={article.slug}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                    >
                      <ArticleCard {...article} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-flat flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <Newspaper className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Belum ada berita
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Berita terbaru akan segera hadir.
                  </p>
                </div>
              )}
            </section>

            <div className="divider-gradient my-10" />

            {/* Categories section */}
            <section>
              <h2 className="section-title mb-6">
                Kategori Hukum
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {categories.map((cat, index) => {
                  const Icon = categoryIconMap[cat.slug] || defaultIcon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/kategori/${cat.slug}`}
                      className="group card-flat flex flex-col items-center gap-3 p-6 text-center transition-all duration-300 hover:shadow-glow hover:border-primary-300 dark:hover:border-primary-700 animate-fade-up"
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-gradient text-white shadow-md shadow-primary-500/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">{cat._count.articles} artikel</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              trending={sidebarTrending}
              recent={sidebarTrending.slice(0, 4)}
              popular={sidebarTrending}
            />
          </div>
        </div>
      </div>
    </>
  );
}
