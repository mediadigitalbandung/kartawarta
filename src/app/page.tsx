export const revalidate = 60;

import Link from "next/link";
import Image from "next/image";
import NewsTicker from "@/components/layout/NewsTicker";
import HeroCarousel from "@/components/slider/HeroCarousel";
import PollingCarousel from "@/components/slider/PollingCarousel";
import BannerAd, { SidebarAd, InlineAd, NativeAd } from "@/components/ads/BannerAd";
import { Scale, Briefcase, Trophy, Film, Heart, Wheat, Cpu, Vote as VoteIcon, GraduationCap, Leaf, Compass, BookOpen, TrendingUp, LucideIcon, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

const categoryIconMap: Record<string, LucideIcon> = {
  "hukum": Scale, "bisnis-ekonomi": Briefcase, "olahraga": Trophy, "hiburan": Film,
  "kesehatan": Heart, "pertanian-peternakan": Wheat, "teknologi": Cpu, "politik": VoteIcon,
  "pendidikan": GraduationCap, "lingkungan": Leaf, "gaya-hidup": Compass, "opini": BookOpen,
};

function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default async function HomePage() {
  const [articles, categories, trendingArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 60,
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
  ]);

  const heroMain = articles.slice(0, 5);  // 5 articles rotate in hero
  const heroSide = articles.slice(5, 8);  // 3 side stories
  const editorsPickArticles = articles.slice(8, 12);
  const terkiniArticles = articles.slice(12, 24);
  const restArticles = articles.slice(24);

  // Group by category
  const articlesByCategory: Record<string, { slug: string; articles: typeof restArticles }> = {};
  for (const a of restArticles) {
    const name = a.category.name;
    if (!articlesByCategory[name]) articlesByCategory[name] = { slug: a.category.slug, articles: [] };
    if (articlesByCategory[name].articles.length < 5) articlesByCategory[name].articles.push(a);
  }
  const catEntries = Object.entries(articlesByCategory);

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
            logo: { "@type": "ImageObject", url: "https://kartawarta.com/kartawarta-icon.png" },
          }),
        }}
      />

      <NewsTicker />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” Auto-rotating carousel + side stories
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <HeroCarousel
        main={JSON.parse(JSON.stringify(heroMain))}
        side={JSON.parse(JSON.stringify(heroSide))}
      />

      {/* AD: Header */}
      <BannerAd size="leaderboard" slot="HEADER" className="bg-surface" />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          EDITOR'S PICK â€” 4 cards horizontal
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {editorsPickArticles.length > 0 && (
        <section className="bg-surface py-14">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-label-md uppercase tracking-widest text-secondary font-bold">Pilihan Editor</span>
                <h2 className="font-serif text-headline-md text-on-surface mt-1">
                  Wajib Dibaca Hari Ini
                </h2>
              </div>
              <Link href="/berita" className="hidden sm:flex items-center gap-1.5 text-label-md uppercase tracking-wider font-semibold text-primary hover:text-primary-dark transition-colors">
                Semua Berita <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {editorsPickArticles.map((a) => (
                <article key={a.slug} className="group">
                  <Link href={`/berita/${a.slug}`} className="block">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-sm">
                      {a.featuredImage ? (
                        <Image src={a.featuredImage} alt={a.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="h-full w-full bg-surface-container-low" />
                      )}
                    </div>
                  </Link>
                  <div className="mt-3">
                    <span className="text-label-sm font-bold uppercase tracking-widest text-primary">{a.category.name}</span>
                    <Link href={`/berita/${a.slug}`}>
                      <h3 className="mt-1 font-serif text-title-lg leading-snug text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                    </Link>
                    <p className="mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
                      {a.author.name} <span className="text-on-surface-variant/30 mx-1">/</span> {timeAgo(a.publishedAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TERKINI + TERPOPULER + SIDEBAR AD
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="bg-surface-container-low py-14">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Berita Terkini â€” 7 cols */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-headline-md text-on-surface">Berita Terkini</h2>
                <Link href="/berita" className="text-label-md uppercase tracking-wider font-semibold text-primary hover:text-primary-dark transition-colors">
                  Lihat Semua
                </Link>
              </div>
              {/* First article large */}
              {terkiniArticles[0] && (
                <article className="group mb-8">
                  <Link href={`/berita/${terkiniArticles[0].slug}`} className="block">
                    <div className="relative aspect-[2/1] overflow-hidden rounded-sm">
                      {terkiniArticles[0].featuredImage ? (
                        <Image src={terkiniArticles[0].featuredImage} alt={terkiniArticles[0].title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                      ) : (
                        <div className="h-full w-full bg-surface-container" />
                      )}
                    </div>
                  </Link>
                  <div className="mt-4">
                    <span className="text-label-sm font-bold uppercase tracking-widest text-primary">{terkiniArticles[0].category.name}</span>
                    <Link href={`/berita/${terkiniArticles[0].slug}`}>
                      <h3 className="mt-1 font-serif text-headline-md leading-tight text-on-surface group-hover:text-primary transition-colors">
                        {terkiniArticles[0].title}
                      </h3>
                    </Link>
                    {terkiniArticles[0].excerpt && (
                      <p className="mt-2 text-body-md text-on-surface-variant line-clamp-2">{terkiniArticles[0].excerpt}</p>
                    )}
                  </div>
                </article>
              )}
              {/* Rest as compact list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {terkiniArticles.slice(1).map((a) => (
                  <article key={a.slug} className="group flex gap-4">
                    {a.featuredImage && (
                      <Link href={`/berita/${a.slug}`} className="shrink-0">
                        <div className="relative h-20 w-28 overflow-hidden rounded-sm">
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
                      <p className="mt-1 text-label-sm uppercase tracking-wider text-on-surface-variant">
                        {timeAgo(a.publishedAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar â€” 5 cols: Terpopuler + Ads */}
            <aside className="lg:col-span-5">
              {/* Terpopuler */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={18} className="text-secondary" />
                  <h2 className="font-serif text-headline-sm text-on-surface">Terpopuler</h2>
                </div>
                <div className="flex flex-col">
                  {trendingArticles.slice(0, 6).map((a, i) => (
                    <div key={a.slug} className={`group flex items-start gap-4 py-4 ${i > 0 ? "border-t border-on-surface/5" : ""}`}>
                      <span className="shrink-0 font-serif text-3xl font-bold text-primary/15 leading-none select-none w-7 text-right mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/berita/${a.slug}`}>
                          <h3 className="text-title-sm leading-snug text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                            {a.title}
                          </h3>
                        </Link>
                        <p className="mt-1.5 text-label-sm uppercase tracking-wider text-on-surface-variant">
                          <span className="text-primary font-semibold">{a.category.name}</span>
                          <span className="mx-1.5 text-on-surface-variant/20">/</span>
                          {a.viewCount?.toLocaleString("id-ID")} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AD: Sidebar */}
              <SidebarAd />

              {/* AD: 2nd sidebar */}
              <div className="mt-6">
                <SidebarAd />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* AD: Between sections */}
      <BannerAd size="banner" slot="BETWEEN_SECTIONS" className="bg-surface" />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          POLLING
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="bg-surface py-14">
        <div className="container-main">
          <div className="mb-8">
            <span className="text-label-md uppercase tracking-widest text-secondary font-bold">Suara Pembaca</span>
            <h2 className="font-serif text-headline-md text-on-surface mt-1">Polling</h2>
          </div>
          <PollingCarousel />
        </div>
      </section>

      {/* AD: Inline */}
      <InlineAd className="bg-surface-container-low" />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CATEGORY SECTIONS â€” alternating layouts
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {catEntries.map(([catName, { slug: catSlug, articles: catArticles }], idx) => {
        const main = catArticles[0];
        const side = catArticles.slice(1);
        const isEven = idx % 2 === 0;

        return (
          <div key={catSlug}>
            <section className={`py-14 ${isEven ? "bg-surface" : "bg-surface-container-low"}`}>
              <div className="container-main">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link href={`/kategori/${catSlug}`} className="group flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    <h2 className="font-serif text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                      {catName}
                    </h2>
                  </Link>
                  <Link href={`/kategori/${catSlug}`} className="flex items-center gap-1.5 text-label-md uppercase tracking-wider font-semibold text-primary hover:text-primary-dark transition-colors">
                    Lihat Semua <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Layout A (even): Large left + list right */}
                {isEven ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {main && (
                      <div className="lg:col-span-7">
                        <Link href={`/berita/${main.slug}`} className="group block">
                          <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                            {main.featuredImage ? (
                              <Image src={main.featuredImage} alt={main.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                            ) : (
                              <div className="h-full w-full bg-surface-container" />
                            )}
                          </div>
                        </Link>
                        <div className="mt-5">
                          <Link href={`/berita/${main.slug}`}>
                            <h3 className="font-serif text-headline-md leading-tight text-on-surface group-hover:text-primary transition-colors">
                              {main.title}
                            </h3>
                          </Link>
                          {main.excerpt && <p className="mt-3 text-body-md text-on-surface-variant line-clamp-2">{main.excerpt}</p>}
                          <p className="mt-3 text-label-sm uppercase tracking-wider text-on-surface-variant">
                            {main.author.name} <span className="mx-1.5 text-on-surface-variant/20">/</span> {timeAgo(main.publishedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {side.length > 0 && (
                      <div className="lg:col-span-5 flex flex-col gap-5">
                        {side.map((a) => (
                          <article key={a.slug} className="group flex gap-4">
                            {a.featuredImage && (
                              <Link href={`/berita/${a.slug}`} className="shrink-0">
                                <div className="relative h-20 w-28 overflow-hidden rounded-sm">
                                  <Image src={a.featuredImage} alt={a.title} fill className="object-cover" />
                                </div>
                              </Link>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <Link href={`/berita/${a.slug}`}>
                                <h4 className="text-title-sm leading-snug text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h4>
                              </Link>
                              <p className="mt-1 text-label-sm uppercase tracking-wider text-on-surface-variant">{timeAgo(a.publishedAt)}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Layout B (odd): Grid of cards */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catArticles.slice(0, 3).map((a) => (
                      <article key={a.slug} className="group">
                        <Link href={`/berita/${a.slug}`} className="block">
                          <div className="relative aspect-[3/2] overflow-hidden rounded-sm">
                            {a.featuredImage ? (
                              <Image src={a.featuredImage} alt={a.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            ) : (
                              <div className="h-full w-full bg-surface-container" />
                            )}
                          </div>
                        </Link>
                        <div className="mt-3">
                          <Link href={`/berita/${a.slug}`}>
                            <h3 className="font-serif text-title-lg leading-snug text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
                          </Link>
                          <p className="mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
                            {a.author.name} <span className="mx-1.5 text-on-surface-variant/20">/</span> {timeAgo(a.publishedAt)}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {idx === 1 && <div className="container-main mt-8"><NativeAd /></div>}
            </section>

            {idx > 0 && idx % 3 === 2 && (
              <BannerAd size="banner" slot="BETWEEN_SECTIONS" className={isEven ? "bg-surface-container-low" : "bg-surface"} />
            )}
          </div>
        );
      })}

      {/* AD: Footer */}
      <BannerAd size="leaderboard" slot="FOOTER" className="bg-surface" />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CATEGORY GRID
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="bg-primary py-14">
        <div className="container-main">
          <div className="mb-8">
            <h2 className="font-serif text-headline-md text-white">Jelajahi Kategori</h2>
            <p className="mt-1 text-body-sm text-white/40">Temukan berita berdasarkan topik yang Anda minati</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || Scale;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-sm bg-white/5 p-4 transition-all duration-200 hover:bg-white/10"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-title-sm text-white truncate">{cat.name}</span>
                    <span className="block text-label-sm text-white/30 uppercase tracking-wider">{cat._count.articles} artikel</span>
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
