export const revalidate = 60;

import Link from "next/link";
import Image from "next/image";
import ArticleCard from "@/components/artikel/ArticleCard";
import NewsTicker from "@/components/layout/NewsTicker";
import HeadlineSlider from "@/components/slider/HeadlineSlider";
import BreakingSlider from "@/components/slider/BreakingSlider";
import SubHeadlineSlider from "@/components/slider/SubHeadlineSlider";
import PollingCarousel from "@/components/slider/PollingCarousel";
import BannerAd, { SidebarAd } from "@/components/ads/BannerAd";
import { Scale, Briefcase, Trophy, Film, Heart, Wheat, Cpu, Vote as VoteIcon, GraduationCap, Leaf, Compass, BookOpen, TrendingUp, LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";

const categoryIconMap: Record<string, LucideIcon> = {
  "hukum": Scale,
  "bisnis-ekonomi": Briefcase,
  "olahraga": Trophy,
  "hiburan": Film,
  "kesehatan": Heart,
  "pertanian-peternakan": Wheat,
  "teknologi": Cpu,
  "politik": VoteIcon,
  "pendidikan": GraduationCap,
  "lingkungan": Leaf,
  "gaya-hidup": Compass,
  "opini": BookOpen,
};

export default async function HomePage() {
  const [articles, categories, trendingArticles, tickerArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    }),
    prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { viewCount: "desc" },
      take: 10,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);

  const headlineArticles = articles.slice(0, 5);
  const subHeadlines = articles.slice(5, 11);
  const breakingArticles = articles.slice(11, 16);
  const terkiniArticles = articles.slice(16, 24);
  const restArticles = articles.slice(24);

  const tickerItems = tickerArticles.map((a) => ({ title: a.title, slug: a.slug }));

  // Group remaining articles by category
  const articlesByCategory: Record<string, { categorySlug: string; articles: typeof restArticles }> = {};
  for (const article of restArticles) {
    const catName = article.category.name;
    if (!articlesByCategory[catName]) {
      articlesByCategory[catName] = { categorySlug: article.category.slug, articles: [] };
    }
    if (articlesByCategory[catName].articles.length < 6) {
      articlesByCategory[catName].articles.push(article);
    }
  }
  const categoryEntries = Object.entries(articlesByCategory);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            name: "Kartawarta",
            url: "https://kartawarta.com",
            logo: { "@type": "ImageObject", url: "https://kartawarta.com/logo-kartawarta.png" },
            description: "Portal berita digital terpercaya. Menyajikan berita terkini, analisis mendalam, dan informasi akurat.",
          }),
        }}
      />

      <NewsTicker items={tickerItems} />

      {/* ═══════════════════════════════════════════
          SECTION 1: Hero — Headline + Breaking
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-lowest py-8">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Headline + Sub-headline */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <HeadlineSlider items={JSON.parse(JSON.stringify(headlineArticles))} />
              {subHeadlines.length > 0 && (
                <SubHeadlineSlider items={JSON.parse(JSON.stringify(subHeadlines))} />
              )}
            </div>
            {/* Right: Breaking + Sidebar Ad */}
            <div className="lg:col-span-1 grid grid-cols-7 lg:grid-cols-1 gap-4">
              <div className="col-span-4 lg:col-span-1">
                <BreakingSlider items={JSON.parse(JSON.stringify(breakingArticles))} />
              </div>
              <div className="col-span-3 lg:col-span-1 flex items-stretch">
                <SidebarAd />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: Berita Terkini + Terpopuler
          ═══════════════════════════════════════════ */}
      <section className="bg-surface py-12">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left 2/3: Berita Terkini */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-headline-sm text-on-surface">
                  Berita Terkini
                </h2>
                <Link href="/berita" className="text-label-md uppercase tracking-wider font-semibold text-primary hover:text-primary-dark transition-colors">
                  Lihat Semua
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {terkiniArticles.map((a) => (
                  <ArticleCard key={a.slug} {...a} variant="standard" />
                ))}
              </div>
            </div>

            {/* Right 1/3: Terpopuler */}
            {trendingArticles.length > 0 && (
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-headline-sm text-on-surface flex items-center gap-2">
                    <TrendingUp size={20} className="text-secondary" />
                    Terpopuler
                  </h2>
                </div>
                <div className="flex flex-col gap-5">
                  {trendingArticles.slice(0, 8).map((article, i) => (
                    <div key={article.slug} className="group flex items-start gap-4">
                      {/* Rank */}
                      <span className="shrink-0 font-serif text-display-sm text-primary/20 leading-none select-none w-8 text-right">
                        {i + 1}
                      </span>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/berita/${article.slug}`}>
                          <h3 className="text-title-sm leading-snug text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                        </Link>
                        <div className="mt-1.5 flex items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
                          <span className="text-primary font-semibold">{article.category.name}</span>
                          <span className="text-on-surface-variant/30">/</span>
                          <span>{article.viewCount?.toLocaleString("id-ID")} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Banner Ad */}
      <BannerAd size="leaderboard" className="bg-surface-container-low" />

      {/* ═══════════════════════════════════════════
          SECTION 3: Polling
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-lowest py-12">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-headline-sm text-on-surface">
              Polling
            </h2>
          </div>
          <PollingCarousel />
        </div>
      </section>

      {/* Banner Ad */}
      <BannerAd slot="IN_ARTICLE" className="bg-surface" />

      {/* ═══════════════════════════════════════════
          SECTION 4: Category Sections
          ═══════════════════════════════════════════ */}
      {categoryEntries.map(([categoryName, { categorySlug, articles: catArticles }], idx) => {
        const featured = catArticles[0];
        const rest = catArticles.slice(1, 5);

        return (
          <section
            key={categorySlug}
            className={`py-12 ${idx % 2 === 0 ? "bg-surface" : "bg-surface-container-low"}`}
          >
            <div className="container-main">
              {/* Section header */}
              <div className="flex items-center justify-between mb-8">
                <Link href={`/kategori/${categorySlug}`} className="font-serif text-headline-sm text-on-surface hover:text-primary transition-colors">
                  {categoryName}
                </Link>
                <Link
                  href={`/kategori/${categorySlug}`}
                  className="text-label-md uppercase tracking-wider font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Featured article */}
                {featured && (
                  <div>
                    <Link href={`/berita/${featured.slug}`} className="group block">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm">
                        {featured.featuredImage ? (
                          <Image
                            src={featured.featuredImage}
                            alt={featured.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="h-full w-full bg-surface-container-low" />
                        )}
                      </div>
                    </Link>
                    <div className="mt-4">
                      <Link href={`/berita/${featured.slug}`}>
                        <h3 className="font-serif text-headline-md leading-tight text-on-surface group-hover:text-primary transition-colors">
                          {featured.title}
                        </h3>
                      </Link>
                      {featured.excerpt && (
                        <p className="mt-3 text-body-md text-on-surface-variant line-clamp-2">
                          {featured.excerpt}
                        </p>
                      )}
                      <p className="mt-3 text-label-md uppercase tracking-wider text-on-surface-variant">
                        {featured.author.name}
                        <span className="mx-2 text-on-surface-variant/30">/</span>
                        {featured.publishedAt
                          ? new Date(featured.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long" })
                          : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Right: Article list */}
                {rest.length > 0 && (
                  <div className="flex flex-col gap-6">
                    {rest.map((a) => (
                      <div key={a.slug} className="group flex gap-4">
                        {a.featuredImage && (
                          <Link href={`/berita/${a.slug}`} className="shrink-0">
                            <div className="relative h-20 w-28 sm:h-24 sm:w-36 overflow-hidden rounded-sm">
                              <Image src={a.featuredImage} alt={a.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                          </Link>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <Link href={`/berita/${a.slug}`}>
                            <h4 className="text-title-sm leading-snug text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                              {a.title}
                            </h4>
                          </Link>
                          <p className="mt-1.5 text-label-sm uppercase tracking-wider text-on-surface-variant">
                            {a.author.name}
                            <span className="mx-2 text-on-surface-variant/30">/</span>
                            {a.publishedAt
                              ? new Date(a.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* Banner Ad — Footer */}
      <BannerAd slot="FOOTER" className="bg-surface" />

      {/* ═══════════════════════════════════════════
          SECTION 5: Category Grid
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-low py-12">
        <div className="container-main">
          <div className="mb-8">
            <h2 className="font-serif text-headline-sm text-on-surface">
              Jelajahi Kategori
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || Scale;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="group flex items-center gap-4 rounded-sm bg-surface-container-lowest p-4 transition-all duration-200 hover:shadow-ambient"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary-light text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-title-sm text-on-surface truncate group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                    <span className="block text-label-sm text-on-surface-variant uppercase tracking-wider">
                      {cat._count.articles} artikel
                    </span>
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
