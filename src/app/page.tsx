export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import ArticleCard from "@/components/artikel/ArticleCard";
import NewsTicker from "@/components/layout/NewsTicker";
import HeadlineSlider from "@/components/slider/HeadlineSlider";
import BreakingSlider from "@/components/slider/BreakingSlider";
import PopularCarousel from "@/components/slider/PopularCarousel";
import SubHeadlineSlider from "@/components/slider/SubHeadlineSlider";
import BannerAd, { SidebarAd } from "@/components/ads/BannerAd";
import SimulationBadge from "@/components/SimulationBadge";
import { Scale, BookOpen, Gavel, Shield, Users, Landmark, LucideIcon, Globe, Monitor, Building2, FileText, AlertTriangle, Radio, BarChart3, Calendar, Play, Vote, TrendingUp } from "lucide-react";
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

// --- SIMULATION DATA ---
const liveSidangData = [
  { id: 1, title: "Sidang Praperadilan Kasus Korupsi Bandung Barat", court: "PN Bandung", time: "10:00 WIB", status: "Sedang Berlangsung", judge: "Majelis Hakim: Dr. H. Ahmad S., S.H., M.H." },
  { id: 2, title: "Sidang Lanjutan Sengketa Tanah Ciwidey", court: "PN Bale Bandung", time: "13:30 WIB", status: "Menunggu", judge: "Majelis Hakim: Hj. Siti R., S.H." },
  { id: 3, title: "Pembacaan Putusan Kasus Penipuan Online", court: "PN Bandung", time: "14:00 WIB", status: "Menunggu", judge: "Majelis Hakim: Drs. Bambang P., S.H., M.H." },
];

const pollingData = {
  question: "Apakah Anda setuju dengan revisi UU ITE terbaru?",
  options: [
    { label: "Sangat Setuju", percentage: 32 },
    { label: "Setuju", percentage: 28 },
    { label: "Netral", percentage: 18 },
    { label: "Tidak Setuju", percentage: 15 },
    { label: "Sangat Tidak Setuju", percentage: 7 },
  ],
  totalVotes: 2847,
};

const indeksHukumData = [
  { label: "Kepercayaan Publik terhadap Peradilan", value: 62, change: +3.2 },
  { label: "Indeks Penegakan Hukum Jabar", value: 71, change: +1.8 },
  { label: "Transparansi Kebijakan Kota Bandung", value: 58, change: -2.1 },
  { label: "Akses Bantuan Hukum", value: 45, change: +5.4 },
];

const jadwalSidangData = [
  { date: "27 Mar", day: "Kamis", cases: 12, highlight: "Sidang Tipikor Bupati Garut" },
  { date: "28 Mar", day: "Jumat", cases: 8, highlight: "Putusan Sengketa Pilkada" },
  { date: "31 Mar", day: "Senin", cases: 15, highlight: "Sidang Perdana Kasus Narkotika" },
  { date: "01 Apr", day: "Selasa", cases: 10, highlight: "Mediasi Sengketa Tanah Lembang" },
];

const videoData = [
  { title: "Wawancara Eksklusif: Ketua PN Bandung", duration: "12:34", views: "3.2rb" },
  { title: "Bedah Kasus: Sengketa Lahan di Jabar", duration: "18:21", views: "1.8rb" },
  { title: "Opini Hukum: Dampak Omnibus Law", duration: "15:07", views: "2.5rb" },
];
// --- END SIMULATION DATA ---

export default async function HomePage() {
  const [articles, categories, trendingArticles, tickerArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 30,
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

  const headlineArticles = articles.slice(0, 5);  // For headline slider
  const subHeadlines = articles.slice(5, 11);     // 6 items = 3 pages x 2 cards for sub-headline slider
  const breakingArticles = articles.slice(11, 16); // For breaking news slider
  const terkiniArticles = articles.slice(12, 18); // Berita Terkini: 2x3 grid = 6
  const restArticles = articles.slice(22);

  const tickerItems = tickerArticles.map((a) => ({
    title: a.title,
    slug: a.slug,
  }));

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
      <NewsTicker items={tickerItems} />

      {/* Banner Ad — Leaderboard (above headline) */}
      <BannerAd size="leaderboard" className="bg-surface" />

      {/* Headline News Slider + Breaking News */}
      <section className="bg-surface py-6">
        <div className="container-main">
          {/* Row 1: Headline + Breaking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HeadlineSlider items={JSON.parse(JSON.stringify(headlineArticles))} />
            </div>
            <div className="lg:col-span-1">
              <BreakingSlider items={JSON.parse(JSON.stringify(breakingArticles))} />
            </div>
          </div>
          {/* Row 2: Sub-headline + Sidebar Ad — aligned bottom */}
          {subHeadlines.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              <div className="lg:col-span-2">
                <SubHeadlineSlider items={JSON.parse(JSON.stringify(subHeadlines))} />
              </div>
              <div className="lg:col-span-1">
                <SidebarAd />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Berita Terkini + Terpopuler side by side */}
      <section className="bg-surface py-8">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Berita Terkini — 2 columns x 3 rows */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary">
                  Berita Terkini
                </h2>
                <Link href="/berita" className="text-sm font-medium text-goto-green hover:underline">
                  Lihat Semua
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {terkiniArticles.map((a) => (
                  <ArticleCard key={a.slug} {...a} variant="standard" />
                ))}
              </div>
            </div>

            {/* Right: Berita Terpopuler — vertical list */}
            {trendingArticles.length > 0 && (
              <div className="lg:col-span-1">
                <div className="flex items-center mb-5">
                  <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
                    <TrendingUp size={18} className="mr-2 text-goto-green" />
                    Terpopuler
                  </h2>
                </div>
                <div className="space-y-0 divide-y divide-border">
                  {trendingArticles.slice(0, 6).map((article, i) => (
                    <div key={article.slug} className="group flex items-start gap-3 py-4 first:pt-0">
                      {/* Rank number */}
                      <span className="shrink-0 w-7 pt-0.5 text-center text-2xl font-extrabold text-goto-green select-none">
                        {i + 1}
                      </span>
                      {/* Thumbnail */}
                      <Link href={`/berita/${article.slug}`} className="shrink-0">
                        <div className="relative h-[72px] w-[100px] overflow-hidden rounded-sm">
                          {article.featuredImage ? (
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-surface-tertiary" />
                          )}
                        </div>
                      </Link>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/berita/${article.slug}`}>
                          <h3 className="text-sm font-bold leading-snug text-txt-primary line-clamp-2 group-hover:text-goto-green transition-colors">
                            {article.title}
                          </h3>
                        </Link>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-txt-muted">
                          <span className="text-goto-green font-semibold">{article.category.name}</span>
                          <span className="h-2.5 w-px bg-border" />
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

      {/* Banner Ad — Billboard */}
      <BannerAd size="billboard" className="bg-surface-secondary" />

      {/* Live Sidang — SIMULASI */}
      <section className="bg-surface-secondary py-6">
        <div className="container-main">
          <div className="flex items-center justify-between mb-4">
            <h2 className="border-l-[3px] border-red-500 pl-3 text-lg font-bold text-txt-primary flex items-center">
              <Radio size={18} className="mr-2 text-red-500 animate-pulse" />
              Live Sidang Hari Ini
              <SimulationBadge />
            </h2>
            <Link href="/live-sidang" className="text-sm font-medium text-goto-green hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSidangData.map((sidang) => (
              <div key={sidang.id} className="rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-txt-secondary">{sidang.court}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    sidang.status === "Sedang Berlangsung"
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-txt-secondary"
                  }`}>
                    {sidang.status === "Sedang Berlangsung" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                    {sidang.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-txt-primary leading-snug">{sidang.title}</h3>
                <p className="text-xs text-txt-muted mt-1">{sidang.judge}</p>
                <p className="text-xs font-semibold text-goto-green mt-2">{sidang.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-b border-border" />

      {/* Category Sections — DATA REAL */}
      {categoryEntries.map(([categoryName, { categorySlug, articles: catArticles }], idx) => (
        <section
          key={categorySlug}
          className={`py-8 ${idx % 2 === 0 ? "bg-surface" : "bg-surface-secondary"}`}
        >
          <div className="container-main">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catArticles.map((a) => (
                <ArticleCard key={a.slug} {...a} variant="standard" />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Banner Ad — Leaderboard */}
      <BannerAd size="leaderboard" className="bg-surface" />

      {/* Polling Hukum — SIMULASI */}
      <section className="bg-surface py-8">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Polling */}
            <div>
              <div className="flex items-center mb-4">
                <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
                  <Vote size={18} className="mr-2 text-goto-green" />
                  Polling Hukum
                  <SimulationBadge />
                </h2>
              </div>
              <div className="rounded-lg border border-border bg-surface-secondary p-5">
                <p className="text-base font-semibold text-txt-primary mb-4">{pollingData.question}</p>
                <div className="space-y-3">
                  {pollingData.options.map((opt) => (
                    <div key={opt.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-txt-primary">{opt.label}</span>
                        <span className="font-bold text-txt-primary">{opt.percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-border">
                        <div
                          className="h-2 rounded-full bg-goto-green transition-all"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-txt-muted mt-4">{pollingData.totalVotes.toLocaleString("id-ID")} suara</p>
              </div>
            </div>

            {/* Indeks Hukum */}
            <div>
              <div className="flex items-center mb-4">
                <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
                  <BarChart3 size={18} className="mr-2 text-goto-green" />
                  Indeks Hukum
                  <SimulationBadge />
                </h2>
              </div>
              <div className="space-y-3">
                {indeksHukumData.map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-surface-secondary p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-txt-primary">{item.label}</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-border w-full">
                        <div className="h-1.5 rounded-full bg-goto-green" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                    <div className="ml-4 text-right shrink-0">
                      <span className="text-2xl font-extrabold text-txt-primary">{item.value}</span>
                      <span className={`block text-xs font-semibold ${item.change > 0 ? "text-green-600" : "text-red-500"}`}>
                        {item.change > 0 ? "+" : ""}{item.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-border" />

      {/* Jadwal Sidang + Video — SIMULASI */}
      <section className="bg-surface-secondary py-8">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Jadwal Sidang */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
                  <Calendar size={18} className="mr-2 text-goto-green" />
                  Jadwal Sidang
                  <SimulationBadge />
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jadwalSidangData.map((j) => (
                  <div key={j.date} className="rounded-lg border border-border bg-surface p-4 flex gap-4 items-start">
                    <div className="text-center shrink-0 w-14">
                      <span className="block text-xl font-extrabold text-goto-green leading-none">{j.date.split(" ")[0]}</span>
                      <span className="block text-[10px] font-medium text-txt-muted uppercase">{j.date.split(" ")[1]}</span>
                      <span className="block text-[10px] text-txt-muted">{j.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-txt-primary truncate">{j.highlight}</p>
                      <p className="text-xs text-txt-muted mt-1">+ {j.cases - 1} sidang lainnya</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
                  <Play size={18} className="mr-2 text-goto-green" />
                  Video
                  <SimulationBadge />
                </h2>
              </div>
              <div className="space-y-3">
                {videoData.map((v) => (
                  <div key={v.title} className="rounded-lg border border-border bg-surface p-4 group cursor-pointer transition-shadow hover:shadow-card">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-goto-light text-goto-green">
                        <Play size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-txt-primary group-hover:text-goto-green transition-colors leading-snug">{v.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-txt-muted">
                          <span>{v.duration}</span>
                          <span className="h-3 w-px bg-border" />
                          <span>{v.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-border" />

      {/* Kategori Links — DATA REAL */}
      <section className="bg-surface-secondary py-8">
        <div className="container-main">
          <div className="flex items-center justify-between mb-5">
            <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary">
              Kategori
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || defaultIcon;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-all duration-200 hover:border-goto-green/40 hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-goto-light text-goto-green">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-txt-primary truncate group-hover:text-goto-green transition-colors">
                      {cat.name}
                    </span>
                    <span className="block text-[10px] text-txt-muted">{cat._count.articles} artikel</span>
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
