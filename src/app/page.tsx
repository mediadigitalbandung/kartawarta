export const dynamic = "force-dynamic";

import Link from "next/link";
import ArticleCard from "@/components/artikel/ArticleCard";
import NewsTicker from "@/components/layout/NewsTicker";
import Sidebar from "@/components/layout/Sidebar";
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

      {/* Gold accent line */}
      <div className="h-[2px] bg-gold" />

      {/* Hero: Featured Article */}
      {featured && (
        <section className="bg-press py-10">
          <div className="container-main">
            <ArticleCard {...featured} variant="featured" />
          </div>
        </section>
      )}

      <div className="section-divider" />

      {/* Main Content: Two-column layout */}
      <section className="bg-newsprint py-10">
        <div className="container-main">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2">
              <div className="section-header">
                <h2 className="section-title">Berita Terkini</h2>
                <Link href="/berita" className="section-link">Lihat Semua</Link>
              </div>

              {restArticles.length > 0 ? (
                <div className="flex flex-col">
                  {restArticles.map((a, i) => (
                    <div key={a.slug}>
                      <ArticleCard {...a} />
                      {i < restArticles.length - 1 && (
                        <div className="my-6 h-px bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-paper">
                    <Newspaper className="h-8 w-8 text-ink" />
                  </div>
                  <h3 className="text-base font-semibold text-press">Belum ada berita</h3>
                  <p className="mt-1 text-sm text-ink">Berita terbaru akan segera hadir.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar trending={sidebarTrending} />
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Kategori */}
      <section className="bg-newsprint py-10">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Kategori</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || defaultIcon;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-card bg-paper p-5 transition-colors hover:bg-border/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-newsprint">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="font-mono text-kicker uppercase tracking-widest text-forest">
                      {cat.name}
                    </span>
                    <span className="block text-meta text-ink">{cat._count.articles} artikel</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
