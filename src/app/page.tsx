export const dynamic = "force-dynamic";

import Link from "next/link";
import ArticleCard from "@/components/artikel/ArticleCard";
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

  return (
    <>
      <NewsTicker items={tickerItems} />

      {/* Hero Banner */}
      {featured && (
        <section className="bg-bg">
          <div className="container-main py-6">
            <ArticleCard {...featured} variant="featured" />
          </div>
        </section>
      )}

      {/* Berita Terkini */}
      <section className="bg-bg-secondary py-6">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Berita Terkini</h2>
            <Link href="/berita" className="section-link">Lihat Semua</Link>
          </div>
          {restArticles.length > 0 ? (
            <div className="scroll-row">
              {restArticles.map((a) => (
                <ArticleCard key={a.slug} {...a} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-bg-card">
                <Newspaper className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-base font-semibold text-white">Belum ada berita</h3>
              <p className="mt-1 text-sm text-text-muted">Berita terbaru akan segera hadir.</p>
            </div>
          )}
        </div>
      </section>

      {/* Kategori Hukum */}
      <section className="bg-bg py-6">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Kategori Hukum</h2>
          </div>
          <div className="scroll-row">
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || defaultIcon;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="flex w-[160px] shrink-0 flex-col items-center gap-2 rounded-lg bg-bg-card p-4 transition-colors hover:bg-bg-hover"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-medium text-white">{cat.name}</span>
                  <span className="text-xs text-text-muted">{cat._count.articles} artikel</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="bg-bg-secondary py-6">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Trending</h2>
          </div>
          <div className="scroll-row">
            {trendingArticles.map((a) => (
              <ArticleCard key={a.slug} {...a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
