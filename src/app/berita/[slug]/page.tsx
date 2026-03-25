export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Calendar,
  Clock,
  Eye,
  User,
  Share2,
  Flag,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import CopyProtection from "@/components/artikel/CopyProtection";
import Sidebar from "@/components/layout/Sidebar";
import ArticleCard from "@/components/artikel/ArticleCard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { slugify } from "@/lib/utils";

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: true, category: true, sources: true, tags: true },
  });
  return article;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };

  return {
    title: article.title,
    description: article.excerpt || "",
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || "",
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  // Increment view count
  await prisma.article.update({
    where: { slug: params.slug },
    data: { viewCount: { increment: 1 } },
  });

  // Fetch related articles (same category, exclude current)
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    include: { author: true, category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // Fetch trending for sidebar
  const trendingArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { viewCount: "desc" },
    take: 5,
  });

  const sidebarTrending = trendingArticles.map((a) => ({
    title: a.title,
    slug: a.slug,
    category: a.category.name,
    publishedAt: a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString("id-ID")
      : "",
    viewCount: a.viewCount,
  }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jurnalishukumbandung.com";
  const articleUrl = `${appUrl}/berita/${params.slug}`;
  const sanitizedContent = DOMPurify.sanitize(article.content);

  const shareLinks = {
    WhatsApp: `https://wa.me/?text=${encodeURIComponent(article.title + " " + articleUrl)}`,
    Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    Telegram: `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`,
  };

  const sharePlatformLetters: Record<string, string> = {
    WhatsApp: "W",
    Twitter: "X",
    Facebook: "F",
    Telegram: "T",
  };

  return (
    <>
      <CopyProtection
        authorName={article.author.name}
        articleUrl={articleUrl}
        articleTitle={article.title}
      />

      <div className="container-main py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 animate-fade-in">
          <Link href="/" className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-primary-50 hover:text-primary-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400">
            Beranda
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link href={`/kategori/${article.category.slug}`} className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-primary-50 hover:text-primary-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400">
            {article.category.name}
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="truncate max-w-[200px] rounded-full bg-gray-50 px-3.5 py-1.5 text-xs text-gray-400 dark:bg-gray-800/50">
            {article.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Category & verification */}
            <div className="mb-4 flex items-center gap-3 animate-fade-up">
              <Link
                href={`/kategori/${article.category.slug}`}
                className="rounded-lg bg-accent-gradient px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm shadow-red-500/20 transition-all hover:shadow-md hover:shadow-red-500/30"
              >
                {article.category.name}
              </Link>
              {article.verificationLabel === "VERIFIED" && (
                <span className="badge badge-verified flex items-center gap-1">
                  <CheckCircle size={12} /> Terverifikasi
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl dark:text-white animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
              {article.title}
            </h1>

            {/* Meta */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
              <Link href="#author" className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-200/60 transition-all hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800/60">
                <User size={13} />
                {article.author.name}
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Calendar size={13} />
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                  : "-"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Clock size={13} /> {article.readTime ?? 0} menit baca
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Eye size={13} /> {article.viewCount.toLocaleString("id-ID")} views
              </span>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl shadow-soft animate-fade-up" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
                <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
              </div>
            )}

            {/* Share buttons */}
            <div className="mt-8 flex items-center gap-3 animate-fade-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
              <div className="flex items-center gap-2 text-gray-500">
                <Share2 size={15} />
                <span className="text-xs font-semibold uppercase tracking-wider">Bagikan</span>
              </div>
              <div className="divider-gradient flex-1" />
              <div className="flex gap-2">
                {(Object.entries(shareLinks) as [string, string][]).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost rounded-xl px-3.5 py-2 text-xs font-semibold hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
                    title={platform}
                  >
                    <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-md bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {sharePlatformLetters[platform]}
                    </span>
                    {platform}
                  </a>
                ))}
              </div>
            </div>

            {/* Article content */}
            <div className="card-flat mt-8 p-8 rounded-2xl animate-fade-up" style={{ animationDelay: "500ms", animationFillMode: "both" }}>
              <div
                className="article-content font-serif text-[17px] leading-[1.8] text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>

            {/* Sources */}
            {article.sources.length > 0 && (
              <div className="card mt-8 p-6 animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  <span className="inline-block h-1 w-6 rounded-full bg-primary-gradient" />
                  Sumber & Narasumber
                </h3>
                <ul className="space-y-2">
                  {article.sources.map((source, i) => (
                    <li key={i} className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
                      <strong className="text-gray-800 dark:text-gray-200">{source.name}</strong>
                      {source.title && ` — ${source.title}`}
                      {source.institution && `, ${source.institution}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            <div className="mt-8 flex flex-wrap items-center gap-2 animate-fade-up">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tags</span>
              <span className="mx-1 text-gray-300 dark:text-gray-700">|</span>
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 transition-all hover:ring-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-700 dark:hover:ring-primary-500 dark:hover:text-primary-400"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>

            {/* Report button */}
            <div className="mt-8 border-t border-gray-200/60 pt-5 dark:border-gray-800/60 animate-fade-up">
              <button className="btn-ghost rounded-xl text-xs text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                <Flag size={13} />
                Laporkan Berita Ini
              </button>
            </div>

            {/* Author box */}
            <div id="author" className="card mt-8 p-6 animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
              <div className="flex gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-gradient text-3xl font-extrabold text-white shadow-lg shadow-primary-500/25">
                  {article.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{article.author.name}</h3>
                  <p className="text-sm font-medium text-primary-500">Jurnalis</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {article.author.bio}
                  </p>
                  <Link
                    href={`/penulis/${slugify(article.author.name)}`}
                    className="btn-ghost mt-3 inline-flex px-0 text-sm font-semibold text-primary-500 hover:bg-transparent hover:text-primary-600"
                  >
                    Lihat semua artikel &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-10 animate-fade-up">
                <div className="divider-gradient mb-8" />
                <h2 className="section-title mb-6">
                  Berita Terkait
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {relatedArticles.map((related, index) => (
                    <div
                      key={related.slug}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                    >
                      <ArticleCard {...related} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar trending={sidebarTrending} />
          </div>
        </div>
      </div>
    </>
  );
}
