export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import ArticleCard from "@/components/artikel/ArticleCard";
import NewsTicker from "@/components/layout/NewsTicker";
import HeadlineSlider from "@/components/slider/HeadlineSlider";
import BreakingSlider from "@/components/slider/BreakingSlider";
import PopularCarousel from "@/components/slider/PopularCarousel";
import SubHeadlineSlider from "@/components/slider/SubHeadlineSlider";
import VideoStory from "@/components/slider/VideoStory";
import BannerAd, { SidebarAd } from "@/components/ads/BannerAd";
import { Scale, BookOpen, Gavel, Shield, Users, Landmark, LucideIcon, Globe, Monitor, Building2, FileText, AlertTriangle, Radio,Calendar, Play, Vote, TrendingUp } from "lucide-react";
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

const pollingData = [
  {
    question: "Apakah Anda setuju dengan revisi UU ITE terbaru?",
    options: [
      { label: "Sangat Setuju", percentage: 32 },
      { label: "Setuju", percentage: 28 },
      { label: "Netral", percentage: 18 },
      { label: "Tidak Setuju", percentage: 15 },
      { label: "Sangat Tidak Setuju", percentage: 7 },
    ],
    totalVotes: 2847,
  },
  {
    question: "Bagaimana penilaian Anda terhadap kinerja KPK saat ini?",
    options: [
      { label: "Sangat Baik", percentage: 18 },
      { label: "Baik", percentage: 25 },
      { label: "Cukup", percentage: 30 },
      { label: "Buruk", percentage: 20 },
      { label: "Sangat Buruk", percentage: 7 },
    ],
    totalVotes: 4213,
  },
  {
    question: "Perlukah hukuman mati untuk koruptor di Indonesia?",
    options: [
      { label: "Sangat Perlu", percentage: 45 },
      { label: "Perlu", percentage: 22 },
      { label: "Netral", percentage: 15 },
      { label: "Tidak Perlu", percentage: 12 },
      { label: "Sangat Tidak Perlu", percentage: 6 },
    ],
    totalVotes: 6521,
  },
];

const jadwalSidangData = [
  { date: "27 Mar", day: "Kamis", time: "09:00 WIB", cases: 12, highlight: "Sidang Tipikor Bupati Garut" },
  { date: "28 Mar", day: "Jumat", time: "10:00 WIB", cases: 8, highlight: "Putusan Sengketa Pilkada" },
  { date: "31 Mar", day: "Senin", time: "09:30 WIB", cases: 15, highlight: "Sidang Perdana Kasus Narkotika" },
  { date: "01 Apr", day: "Selasa", time: "13:00 WIB", cases: 10, highlight: "Mediasi Sengketa Tanah Lembang" },
];
const videoStoryData = [
  { title: "Sidang Tipikor Bupati Garut: Tuntutan Jaksa 12 Tahun Penjara", slug: "sidang-tipikor-bupati-garut", thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80", duration: "02:45", source: "JHB News" },
  { title: "Wawancara Eksklusif: Ketua PN Bandung Bicara Reformasi Peradilan", slug: "wawancara-ketua-pn-bandung", thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80", duration: "05:30", source: "JHB News" },
  { title: "Aksi Damai Buruh Bandung Tuntut Upah Layak di Depan Gedung Sate", slug: "aksi-damai-buruh-bandung", thumbnail: "https://images.unsplash.com/photo-1591901206069-ed60c4429a2e?w=400&q=80", duration: "03:12", source: "JHB News" },
  { title: "Pencemaran Sungai Citarum: Investigasi Pabrik Pencemar", slug: "pencemaran-citarum-investigasi", thumbnail: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&q=80", duration: "04:20", source: "JHB News" },
  { title: "Bedah Kasus: Sengketa Lahan di Kawasan Bandung Utara", slug: "bedah-kasus-sengketa-lahan", thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80", duration: "06:15", source: "JHB News" },
  { title: "Opini Hukum: Dampak Omnibus Law terhadap Pekerja Indonesia", slug: "opini-dampak-omnibus-law", thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80", duration: "03:48", source: "JHB News" },
  { title: "Profil Hakim: Sosok di Balik Putusan Kontroversial PN Bandung", slug: "profil-hakim-pn-bandung", thumbnail: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=400&q=80", duration: "04:55", source: "JHB News" },
  { title: "Live Report: OTT KPK di Kantor Dinas PUPR Jawa Barat", slug: "live-ott-kpk-pupr-jabar", thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", duration: "01:30", source: "JHB News" },
];
// --- END SIMULATION DATA ---

export default async function HomePage() {
  const [articles, categories, trendingArticles, tickerArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 80,
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
  const terkiniArticles = articles.slice(16, 24); // Berita Terkini: 2x4 grid = 8
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Berita Terkini */}
            <div>
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
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
                    <TrendingUp size={18} className="mr-2 text-goto-green" />
                    Terpopuler
                  </h2>
                  <Link href="/berita?sort=popular" className="text-sm font-medium text-goto-green hover:underline">
                    Lihat Semua
                  </Link>
                </div>
                <div className="space-y-0 divide-y divide-border flex-1">
                  {trendingArticles.slice(0, 8).map((article, i) => (
                    <div key={article.slug} className="group flex items-start gap-4 py-4 first:pt-0">
                      {/* Rank number */}
                      <span className="shrink-0 w-8 pt-2 text-center text-3xl font-extrabold text-goto-green select-none">
                        {i + 1}
                      </span>
                      {/* Thumbnail */}
                      <Link href={`/berita/${article.slug}`} className="shrink-0">
                        <div className="relative h-[100px] w-[150px] overflow-hidden rounded">
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
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-txt-muted">
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

      {/* Split Banner Ad — 70% / 30% */}
      <div className="bg-surface-secondary py-4">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-7 rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ height: "200px" }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
              <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
            </div>
            <div className="lg:col-span-3 rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ height: "200px" }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
              <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jadwal Sidang Mendatang */}
      <section className="bg-surface py-6">
        <div className="container-main">
          <div className="flex items-center justify-between mb-4">
            <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
              <Calendar size={18} className="mr-2 text-goto-green" />
              Jadwal Sidang Mendatang
            </h2>
            <Link href="/jadwal-sidang" className="text-sm font-medium text-goto-green hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {jadwalSidangData.map((j) => (
              <div key={j.date} className="rounded-lg border border-border bg-surface-secondary p-4 hover:border-goto-green/40 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-goto-green text-white">
                    <span className="text-lg font-extrabold leading-none">{j.date.split(" ")[0]}</span>
                    <span className="text-[9px] font-medium uppercase">{j.date.split(" ")[1]}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-txt-primary">{j.day}</span>
                    <span className="block text-xs text-txt-muted">{j.cases} perkara</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-txt-primary leading-snug line-clamp-2">{j.highlight}</p>
                <p className="text-xs font-semibold text-goto-green mt-1.5">{j.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-b border-border" />

      {/* Live Sidang — Video + Info Cards */}
      <section className="bg-surface-secondary py-6">
        <div className="container-main">
          <div className="flex items-center justify-between mb-4">
            <h2 className="border-l-[3px] border-red-500 pl-3 text-lg font-bold text-txt-primary flex items-center">
              <Radio size={18} className="mr-2 text-red-500 animate-pulse" />
              Live Sidang Hari Ini
            </h2>
            <Link href="/live-sidang" className="text-sm font-medium text-goto-green hover:underline">
              Lihat Semua
            </Link>
          </div>

          {/* Video Player */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-surface-dark mb-5">
            {/* Placeholder — ganti dengan iframe YouTube/embed nanti */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/30 cursor-pointer hover:bg-red-500 transition-colors">
                <Play size={28} className="text-white ml-1" />
              </div>
              <p className="mt-4 text-white font-bold text-lg">Sidang Praperadilan Kasus Korupsi Bandung Barat</p>
              <p className="mt-1 text-white/50 text-sm">PN Bandung &middot; Majelis Hakim: Dr. H. Ahmad S., S.H., M.H.</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
                <span className="text-xs text-white/40">Dimulai pukul 10:00 WIB</span>
              </div>
            </div>
          </div>

          {/* 3 Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Polling Hukum */}
      <section className="bg-surface py-8">
        <div className="container-main">
          <div className="flex items-center justify-between mb-5">
            <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
              <Vote size={18} className="mr-2 text-goto-green" />
              Polling Hukum
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pollingData.map((poll, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-surface-secondary p-5">
                <p className="text-sm font-semibold text-txt-primary mb-4">{poll.question}</p>
                <div className="space-y-2.5">
                  {poll.options.map((opt: { label: string; percentage: number }) => (
                    <div key={opt.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-txt-primary text-xs">{opt.label}</span>
                        <span className="font-bold text-txt-primary text-xs">{opt.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border">
                        <div
                          className="h-1.5 rounded-full bg-goto-green transition-all"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-txt-muted mt-3">{poll.totalVotes.toLocaleString("id-ID")} suara</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Ad — above Video Story */}
      <BannerAd size="leaderboard" className="bg-surface" />

      {/* Video Story — horizontal scroll */}
      <section className="bg-surface-secondary py-8">
        <div className="container-main">
          <div className="flex items-center justify-between mb-5">
            <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
              <Play size={18} className="mr-2 text-goto-green" />
              Video Story
            </h2>
            <Link href="/video" className="text-sm font-medium text-goto-green hover:underline flex items-center gap-1">
              Lihat Semua &rarr;
            </Link>
          </div>
          <VideoStory items={videoStoryData} />
        </div>
      </section>

      {/* 3 Banner Ads */}
      <div className="bg-surface py-4">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-lg bg-gradient-to-br from-surface-tertiary to-surface-secondary flex items-center justify-center overflow-hidden relative" style={{ height: "200px" }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan {n}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-border" />

      {/* Category Sections — Kumparan-style layout */}
      {categoryEntries.map(([categoryName, { categorySlug, articles: catArticles }], idx) => {
        const featured = catArticles[0];
        const trending = catArticles.slice(1, 3);
        const terbaru = catArticles.slice(3, 6);

        return (
          <section
            key={categorySlug}
            className={`py-8 ${idx % 2 === 0 ? "bg-surface" : "bg-surface-secondary"}`}
          >
            <div className="container-main">
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary">
                  {categoryName}
                </h2>
                <Link
                  href={`/kategori/${categorySlug}`}
                  className="text-sm font-medium text-goto-green hover:underline"
                >
                  Lihat lainnya &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Featured article — large card with image overlay */}
                {featured && (
                  <div className="lg:col-span-1">
                    <Link href={`/berita/${featured.slug}`} className="group block">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-dark">
                        {featured.featuredImage ? (
                          <Image
                            src={featured.featuredImage}
                            alt={featured.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-surface-tertiary" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="text-lg font-bold leading-tight text-white line-clamp-3">
                            {featured.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                            <span className="text-goto-green font-semibold">{featured.author.name}</span>
                            <span>{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : ""}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Center: Trending */}
                {trending.length > 0 && (
                  <div className="lg:col-span-1">
                    <h3 className="border-l-[3px] border-goto-green pl-3 text-sm font-bold text-txt-primary mb-4">
                      Trending di {categoryName}
                    </h3>
                    <div className="space-y-4">
                      {trending.map((a) => (
                        <div key={a.slug} className="group">
                          <span className="text-[11px] text-txt-muted">
                            {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : ""}
                          </span>
                          <div className="flex gap-3 mt-1">
                            <div className="flex-1 min-w-0">
                              <Link href={`/berita/${a.slug}`}>
                                <h4 className="text-sm font-bold text-txt-primary leading-snug line-clamp-3 group-hover:text-goto-green transition-colors">
                                  {a.title}
                                </h4>
                              </Link>
                              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-txt-muted">
                                <span className="text-goto-green font-semibold">{a.author.name}</span>
                              </div>
                            </div>
                            {a.featuredImage && (
                              <Link href={`/berita/${a.slug}`} className="shrink-0">
                                <div className="relative h-[72px] w-[100px] overflow-hidden rounded">
                                  <Image src={a.featuredImage} alt={a.title} fill className="object-cover" />
                                </div>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Right: Terbaru */}
                {terbaru.length > 0 && (
                  <div className="lg:col-span-1">
                    <h3 className="border-l-[3px] border-goto-green pl-3 text-sm font-bold text-txt-primary mb-4">
                      Terbaru di {categoryName}
                    </h3>
                    <div className="space-y-4">
                      {terbaru.map((a) => (
                        <div key={a.slug} className="group flex gap-3">
                          <div className="flex-1 min-w-0">
                            <Link href={`/berita/${a.slug}`}>
                              <h4 className="text-sm font-bold text-txt-primary leading-snug line-clamp-2 group-hover:text-goto-green transition-colors">
                                {a.title}
                              </h4>
                            </Link>
                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-txt-muted">
                              <span className="text-goto-green font-semibold">{a.author.name}</span>
                              <span>
                                {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : ""}
                              </span>
                            </div>
                          </div>
                          {a.featuredImage && (
                            <Link href={`/berita/${a.slug}`} className="shrink-0">
                              <div className="relative h-[64px] w-[90px] overflow-hidden rounded">
                                <Image src={a.featuredImage} alt={a.title} fill className="object-cover" />
                              </div>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* Banner Ad — Leaderboard */}
      <BannerAd size="leaderboard" className="bg-surface" />

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
