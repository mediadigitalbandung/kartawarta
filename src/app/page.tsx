export const dynamic = "force-dynamic";

import Link from "next/link";
import ArticleCard from "@/components/artikel/ArticleCard";
import NewsTicker from "@/components/layout/NewsTicker";
import { Scale, BookOpen, Gavel, Shield, Users, Landmark, LucideIcon, Globe, Monitor, Building2, FileText, AlertTriangle } from "lucide-react";
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
  const heroSidebar = articles.slice(1, 4);
  const restArticles = articles.slice(1);

  const tickerItems = tickerArticles.map((a) => ({
    title: a.title,
    slug: a.slug,
  }));

  // Group remaining articles by category for category sections
  const articlesByCategory: Record<string, { categorySlug: string; articles: typeof restArticles }> = {};
  for (const article of restArticles) {
    const catName = article.category.name;
    if (!articlesByCategory[catName]) {
      articlesByCategory[catName] = {
        categorySlug: article.category.slug,
        articles: [],
      };
    }
    articlesByCategory[catName].articles.push(article);
  }

  const categoryEntries = Object.entries(articlesByCategory);

  return (
    <>
      <NewsTicker items={tickerItems} />

      {/* Hero Section */}
      {featured && (
        <section className="bg-surface py-8">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Hero article */}
              <div className="lg:col-span-2">
                <ArticleCard {...featured} variant="hero" />
              </div>
              {/* Right: Compact stacked cards */}
              {heroSidebar.length > 0 && (
                <div className="lg:col-span-1 divide-y divide-border">
                  {heroSidebar.map((a) => (
                    <ArticleCard key={a.slug} {...a} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Thin separator */}
      <div className="border-b border-border" />

      {/* Category Sections */}
      {categoryEntries.map(([categoryName, { categorySlug, articles: catArticles }], idx) => (
        <section
          key={categorySlug}
          className={`py-8 ${idx % 2 === 0 ? "bg-surface" : "bg-surface-secondary"}`}
        >
          <div className="container-main">
            {/* Section header with green left border */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary">
                {categoryName}
              </h2>
              <Link
                href={`/kategori/${categorySlug}`}
                className="text-sm font-medium text-goto-green hover:underline"
              >
                Selengkapnya
              </Link>
            </div>
            {/* Grid of standard cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catArticles.map((a) => (
                <ArticleCard key={a.slug} {...a} variant="standard" />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Thin separator */}
      <div className="border-b border-border" />

      {/* Kategori Links */}
      <section className="bg-surface py-8">
        <div className="container-main">
          <div className="flex items-center justify-between mb-5">
            <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary">
              Kategori
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || defaultIcon;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-all duration-200 hover:border-goto-green/40 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-goto-light text-goto-green">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-txt-primary truncate group-hover:text-goto-green transition-colors">
                      {cat.name}
                    </span>
                    <span className="block text-xs text-txt-muted">{cat._count.articles} artikel</span>
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
