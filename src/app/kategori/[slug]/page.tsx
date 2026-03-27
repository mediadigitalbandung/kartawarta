export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronRight, Vote } from "lucide-react";
import ArticleCard from "@/components/artikel/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import BannerAd, { SidebarAd } from "@/components/ads/BannerAd";

const categoryPolling: Record<string, { question: string; options: { label: string; percentage: number }[]; totalVotes: number }> = {
  "hukum-pidana": {
    question: "Apakah hukuman mati masih relevan dalam sistem hukum pidana Indonesia?",
    options: [
      { label: "Sangat Relevan", percentage: 38 },
      { label: "Relevan", percentage: 24 },
      { label: "Netral", percentage: 16 },
      { label: "Tidak Relevan", percentage: 15 },
      { label: "Sangat Tidak Relevan", percentage: 7 },
    ],
    totalVotes: 3842,
  },
  "hukum-perdata": {
    question: "Apakah proses mediasi wajib di pengadilan efektif menyelesaikan sengketa perdata?",
    options: [
      { label: "Sangat Efektif", percentage: 22 },
      { label: "Efektif", percentage: 31 },
      { label: "Cukup", percentage: 25 },
      { label: "Tidak Efektif", percentage: 16 },
      { label: "Sangat Tidak Efektif", percentage: 6 },
    ],
    totalVotes: 2156,
  },
  "hukum-tata-negara": {
    question: "Perlukah perubahan (amandemen) kelima terhadap UUD 1945?",
    options: [
      { label: "Sangat Perlu", percentage: 35 },
      { label: "Perlu", percentage: 28 },
      { label: "Netral", percentage: 18 },
      { label: "Tidak Perlu", percentage: 13 },
      { label: "Sangat Tidak Perlu", percentage: 6 },
    ],
    totalVotes: 5230,
  },
  "ham": {
    question: "Apakah Indonesia sudah cukup serius dalam menangani kasus pelanggaran HAM berat?",
    options: [
      { label: "Sangat Serius", percentage: 8 },
      { label: "Cukup Serius", percentage: 18 },
      { label: "Netral", percentage: 20 },
      { label: "Kurang Serius", percentage: 32 },
      { label: "Sangat Kurang", percentage: 22 },
    ],
    totalVotes: 4710,
  },
  "hukum-bisnis": {
    question: "Apakah regulasi bisnis di Indonesia sudah mendukung pertumbuhan UMKM?",
    options: [
      { label: "Sangat Mendukung", percentage: 12 },
      { label: "Mendukung", percentage: 25 },
      { label: "Netral", percentage: 28 },
      { label: "Kurang Mendukung", percentage: 25 },
      { label: "Tidak Mendukung", percentage: 10 },
    ],
    totalVotes: 1890,
  },
  "hukum-lingkungan": {
    question: "Apakah sanksi hukum terhadap perusahaan pencemar lingkungan sudah cukup berat?",
    options: [
      { label: "Sudah Berat", percentage: 8 },
      { label: "Cukup", percentage: 15 },
      { label: "Netral", percentage: 18 },
      { label: "Kurang Berat", percentage: 35 },
      { label: "Sangat Kurang", percentage: 24 },
    ],
    totalVotes: 3120,
  },
  "ketenagakerjaan": {
    question: "Apakah UU Cipta Kerja sudah melindungi hak-hak pekerja secara memadai?",
    options: [
      { label: "Sangat Memadai", percentage: 10 },
      { label: "Memadai", percentage: 18 },
      { label: "Netral", percentage: 22 },
      { label: "Kurang Memadai", percentage: 30 },
      { label: "Tidak Memadai", percentage: 20 },
    ],
    totalVotes: 5680,
  },
  "opini": {
    question: "Apakah media di Indonesia sudah cukup independen dalam memberitakan isu hukum?",
    options: [
      { label: "Sangat Independen", percentage: 10 },
      { label: "Independen", percentage: 22 },
      { label: "Netral", percentage: 25 },
      { label: "Kurang Independen", percentage: 28 },
      { label: "Tidak Independen", percentage: 15 },
    ],
    totalVotes: 2940,
  },
  "berita-bandung": {
    question: "Bagaimana penilaian Anda terhadap penegakan hukum di Kota Bandung saat ini?",
    options: [
      { label: "Sangat Baik", percentage: 12 },
      { label: "Baik", percentage: 28 },
      { label: "Cukup", percentage: 30 },
      { label: "Buruk", percentage: 20 },
      { label: "Sangat Buruk", percentage: 10 },
    ],
    totalVotes: 4350,
  },
  "infografis": {
    question: "Format konten hukum apa yang paling Anda sukai?",
    options: [
      { label: "Infografis Visual", percentage: 42 },
      { label: "Artikel Panjang", percentage: 20 },
      { label: "Video Pendek", percentage: 22 },
      { label: "Podcast", percentage: 10 },
      { label: "Thread/Ringkasan", percentage: 6 },
    ],
    totalVotes: 1580,
  },
};
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) return { title: "Kategori Tidak Ditemukan" };

  return {
    title: `${category.name} - Berita Hukum Terkini`,
    description: `Kumpulan berita ${category.name.toLowerCase()} terbaru dari Jurnalis Hukum Bandung.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const [articles, trendingArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", categoryId: category.id },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
  ]);

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
    <div className="bg-surface min-h-screen">
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-txt-muted">
          <Link href="/" className="hover:text-goto-green">Beranda</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-txt-primary">{category.name}</span>
        </nav>

        <div className="mb-6">
          <h1 className="flex items-center gap-3 text-xl font-bold text-txt-primary sm:text-2xl lg:text-3xl">
            <span className="block h-7 w-[3px] rounded-full bg-goto-green" />
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-txt-muted">
            Kumpulan berita {category.name.toLowerCase()} terbaru dan terpercaya
          </p>
        </div>

        {/* Banner Ad — Leaderboard */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ height: "270px" }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
          <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* First 6 articles */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {articles.slice(0, 6).map((article) => (
                <ArticleCard key={article.slug} {...article} />
              ))}
            </div>

            {/* Inline ad between rows */}
            {articles.length > 6 && (
              <div className="my-6">
                <div className="rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ height: "120px" }}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                  <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
                </div>
              </div>
            )}

            {/* Remaining articles */}
            {articles.length > 6 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.slice(6).map((article) => (
                  <ArticleCard key={article.slug} {...article} />
                ))}
              </div>
            )}

            {articles.length === 0 && (
              <div className="rounded-[12px] border-2 border-dashed border-border py-16 text-center">
                <p className="text-txt-muted">Belum ada artikel di kategori ini.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Sidebar trending={sidebarTrending} />
            {/* Sidebar Ad */}
            <div className="mt-5">
              <SidebarAd />
            </div>
          </div>
        </div>

        {/* Banner Ad — Bottom split 70/30 */}
        <div className="mt-8">
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

        {/* Polling */}
        {categoryPolling[params.slug] && (
          <div className="mt-8">
            <div className="flex items-center mb-5">
              <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary flex items-center">
                <Vote size={18} className="mr-2 text-goto-green" />
                Polling {category.name}
              </h2>
            </div>
            <div className="rounded-[12px] border border-border bg-surface-secondary p-6 max-w-xl">
              <p className="text-sm font-semibold text-txt-primary mb-5">{categoryPolling[params.slug].question}</p>
              <div className="space-y-3">
                {categoryPolling[params.slug].options.map((opt) => (
                  <div key={opt.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-txt-primary text-xs">{opt.label}</span>
                      <span className="font-bold text-txt-primary text-xs">{opt.percentage}%</span>
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
              <p className="text-[11px] text-txt-muted mt-4">{categoryPolling[params.slug].totalVotes.toLocaleString("id-ID")} suara</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
