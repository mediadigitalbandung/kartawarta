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

  return (
    <>
      <CopyProtection
        authorName={article.author.name}
        articleUrl={articleUrl}
        articleTitle={article.title}
      />

      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-500">Beranda</Link>
          <ChevronRight size={14} />
          <Link href={`/kategori/${article.category.slug}`} className="hover:text-primary-500">
            {article.category.name}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-400 truncate max-w-[200px]">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Category & verification */}
            <div className="mb-3 flex items-center gap-2">
              <Link
                href={`/kategori/${article.category.slug}`}
                className="rounded bg-accent px-2.5 py-1 text-xs font-bold uppercase text-white"
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
            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl dark:text-white">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                <Link href="#author" className="font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300">
                  {article.author.name}
                </Link>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                  : "-"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {article.readTime ?? 0} menit baca
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> {article.viewCount.toLocaleString("id-ID")} views
              </span>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl">
                <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
              </div>
            )}

            {/* Share buttons */}
            <div className="mt-6 flex items-center gap-2 border-y border-gray-200 py-3 dark:border-gray-800">
              <Share2 size={14} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-500">BAGIKAN:</span>
              <div className="flex gap-1.5">
                {(Object.entries(shareLinks) as [string, string][]).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-primary-500 hover:text-white dark:bg-gray-800 dark:text-gray-400"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>

            {/* Article content */}
            <div
              className="article-content mt-6 font-serif text-[17px] leading-[1.8] text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            {/* Sources */}
            {article.sources.length > 0 && (
              <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Sumber & Narasumber
                </h3>
                <ul className="space-y-1.5">
                  {article.sources.map((source, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>{source.name}</strong>
                      {source.title && ` — ${source.title}`}
                      {source.institution && `, ${source.institution}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500">TAGS:</span>
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-primary-500 hover:text-white dark:bg-gray-800 dark:text-gray-400"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>

            {/* Report button */}
            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent">
                <Flag size={12} />
                Laporkan Berita Ini
              </button>
            </div>

            {/* Author box */}
            <div id="author" className="mt-8 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-500">
                  {article.author.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{article.author.name}</h3>
                  <p className="text-sm text-primary-500">Jurnalis</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {article.author.bio}
                  </p>
                  <Link
                    href={`/penulis/${slugify(article.author.name)}`}
                    className="mt-2 inline-block text-sm text-primary-500 hover:underline"
                  >
                    Lihat semua artikel &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Berita Terkait
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <ArticleCard key={related.slug} {...related} />
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
