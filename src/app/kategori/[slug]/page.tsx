export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ArticleCard from "@/components/artikel/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import BannerAd, { SidebarAd } from "@/components/ads/BannerAd";
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
        <BannerAd size="slim" className="mb-6" />

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
      </div>
    </div>
  );
}
