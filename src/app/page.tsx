export const dynamic = "force-dynamic";

import Link from "next/link";
import ArticleCard from "@/components/artikel/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import NewsTicker from "@/components/layout/NewsTicker";
import { Scale, BookOpen, Gavel, Shield, Users, Landmark, LucideIcon } from "lucide-react";
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

      {/* Header Banner Ad Slot */}
      {headerAds.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50 py-3 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="container-main">
            <div className="mx-auto h-[90px] max-w-[728px] rounded border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center dark:border-gray-600 dark:bg-gray-800">
              <span className="text-xs text-gray-400">IKLAN BANNER - 728x90</span>
            </div>
          </div>
        </div>
      )}

      <div className="container-main py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Featured article */}
            {featured && (
              <section className="mb-8">
                <ArticleCard {...featured} variant="featured" />
              </section>
            )}

            {/* Latest articles grid */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Berita Terkini
                </h2>
                <Link
                  href="/berita"
                  className="text-sm text-primary-500 hover:underline"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {restArticles.map((article) => (
                  <ArticleCard key={article.slug} {...article} />
                ))}
              </div>
            </section>

            {/* In-article ad */}
            <div className="my-8 rounded border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <span className="text-xs text-gray-400">IKLAN IN-ARTICLE - 728x90</span>
              <div className="mx-auto mt-2 h-[90px] max-w-[728px] bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Categories section */}
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Kategori Hukum
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((cat) => {
                  const Icon = categoryIconMap[cat.slug] || defaultIcon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/kategori/${cat.slug}`}
                      className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-500 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-900/30">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-gray-500">{cat._count.articles} artikel</p>
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
