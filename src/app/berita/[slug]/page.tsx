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

      <div className="bg-bg min-h-screen">
        <div className="container-main py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
            <Link href="/" className="transition-colors hover:text-white">Beranda</Link>
            <span>&gt;</span>
            <Link href={`/kategori/${article.category.slug}`} className="transition-colors hover:text-white">
              {article.category.name}
            </Link>
            <span>&gt;</span>
            <span className="truncate max-w-[200px] text-text-muted">{article.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Article */}
            <article className="lg:col-span-2">
              {/* Category & verification */}
              <div className="mb-4 flex items-center gap-3">
                <Link
                  href={`/kategori/${article.category.slug}`}
                  className="badge-live rounded px-3 py-1 text-xs font-bold uppercase tracking-wide"
                >
                  {article.category.name}
                </Link>
                {article.verificationLabel === "VERIFIED" && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle size={12} /> Terverifikasi
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-1 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {article.author.name}
                </span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                    : "-"}
                </span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {article.readTime ?? 0} menit baca
                </span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {article.viewCount.toLocaleString("id-ID")} views
                </span>
              </div>

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg">
                  <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
                </div>
              )}

              {/* Share buttons */}
              <div className="mt-6 flex items-center gap-3 rounded-lg bg-bg-card p-3">
                <div className="flex items-center gap-2 text-text-muted">
                  <Share2 size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Bagikan</span>
                </div>
                <div className="flex gap-2">
                  {(Object.entries(shareLinks) as [string, string][]).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost rounded-lg px-3 py-1.5 text-xs"
                      title={platform}
                    >
                      <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded bg-bg-secondary text-[10px] font-bold text-text-secondary">
                        {sharePlatformLetters[platform]}
                      </span>
                      {platform}
                    </a>
                  ))}
                </div>
              </div>

              {/* Article content */}
              <div className="mt-8">
                <div
                  className="article-content text-[17px] leading-[1.8]"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>

              {/* Sources */}
              {article.sources.length > 0 && (
                <div className="mt-8 rounded-lg bg-bg-card p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
                    Sumber &amp; Narasumber
                  </h3>
                  <ul className="space-y-2">
                    {article.sources.map((source, i) => (
                      <li key={i} className="rounded-lg bg-bg-secondary px-4 py-2.5 text-sm text-text-secondary">
                        <strong className="text-white">{source.name}</strong>
                        {source.title && ` — ${source.title}`}
                        {source.institution && `, ${source.institution}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Tags</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="rounded bg-bg-card px-3 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-white"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>

              {/* Report button */}
              <div className="mt-8 border-t border-border pt-5">
                <button className="btn-ghost text-xs text-text-muted hover:text-red-400">
                  <Flag size={13} />
                  Laporkan Berita Ini
                </button>
              </div>

              {/* Author box */}
              <div id="author" className="mt-8 rounded-lg bg-bg-card p-5">
                <div className="flex gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand text-2xl font-extrabold text-white">
                    {article.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{article.author.name}</h3>
                    <p className="text-sm text-gold">Jurnalis</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {article.author.bio}
                    </p>
                    <Link
                      href={`/penulis/${slugify(article.author.name)}`}
                      className="mt-3 inline-block text-sm font-semibold text-gold transition-colors hover:text-gold-light"
                    >
                      Lihat semua artikel &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Related articles */}
              {relatedArticles.length > 0 && (
                <section className="mt-10">
                  <div className="section-header">
                    <h2 className="section-title">Berita Terkait</h2>
                  </div>
                  <div className="scroll-row">
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
      </div>
    </>
  );
}
