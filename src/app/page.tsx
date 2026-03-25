export const dynamic = "force-dynamic";

import Link from "next/link";
import ArticleCard from "@/components/artikel/ArticleCard";
import NewsTicker from "@/components/layout/NewsTicker";
import { Scale, BookOpen, Gavel, Shield, Users, Landmark, LucideIcon, Newspaper, Globe, Monitor, Building2, FileText, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";

const categoryIconMap: Record<string, LucideIcon> = {
  "hukum-pidana": Gavel,
  "hukum-perdata": Scale,
  "hukum-tata-negara": Landmark,
  "administrasi-negara": Building2,
  "korupsi-antikorupsi": AlertTriangle,
  "ham": Shield,
  "regulasi-kebijakan": FileText,
  "peradilan-lembaga": Landmark,
  "hukum-internasional": Globe,
  "hukum-digital": Monitor,
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

  // Stats
  const totalArticles = await prisma.article.count({ where: { status: "PUBLISHED" } });
  const totalCategories = categories.length;
  const totalAuthors = await prisma.user.count({ where: { role: { in: ["SENIOR_JOURNALIST", "JOURNALIST", "CONTRIBUTOR", "EDITOR", "CHIEF_EDITOR"] } } });

  return (
    <>
      <NewsTicker items={tickerItems} />

      {/* Hero: Featured Article */}
      {featured && (
        <section className="bg-surface-dark py-12">
          <div className="container-main">
            <ArticleCard {...featured} variant="featured" />
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="bg-surface py-12">
        <div className="container-main">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="stat-number">{totalArticles}</div>
              <div className="stat-label">Total Artikel</div>
            </div>
            <div>
              <div className="stat-number">{totalCategories}</div>
              <div className="stat-label">Kategori</div>
            </div>
            <div>
              <div className="stat-number">{totalAuthors}</div>
              <div className="stat-label">Penulis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Berita Terkini */}
      <section className="bg-surface-secondary py-12">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Berita Terkini</h2>
            <Link href="/berita" className="section-link">Lihat Semua</Link>
          </div>

          {restArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restArticles.map((a) => (
                <ArticleCard key={a.slug} {...a} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
                <Newspaper className="h-8 w-8 text-txt-secondary" />
              </div>
              <h3 className="text-base font-semibold text-txt-primary">Belum ada berita</h3>
              <p className="mt-1 text-sm text-txt-secondary">Berita terbaru akan segera hadir.</p>
            </div>
          )}
        </div>
      </section>

      {/* Kategori */}
      <section className="bg-surface py-12">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Kategori</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || defaultIcon;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="group rounded-[12px] border border-border bg-surface p-6 transition-all duration-300 hover:shadow-card-hover hover:border-goto-green/30"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-goto-light text-goto-green">
                    <Icon size={20} />
                  </div>
                  <span className="block text-sm font-semibold text-txt-primary">
                    {cat.name}
                  </span>
                  <span className="block text-sm text-txt-secondary mt-1">{cat._count.articles} artikel</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
