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

      <div className="bg-surface min-h-screen">
        <div className="container-main py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-txt-secondary">
            <Link href="/" className="transition-colors hover:text-goto-green">Beranda</Link>
            <span>&gt;</span>
            <Link href={`/kategori/${article.category.slug}`} className="transition-colors hover:text-goto-green">
              {article.category.name}
            </Link>
            <span>&gt;</span>
            <span className="truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[400px] text-txt-muted">{article.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Article */}
            <article className="lg:col-span-2">
              {/* Category badge & verification */}
              <div className="mb-4 flex items-center gap-3">
                <Link
                  href={`/kategori/${article.category.slug}`}
                  className="text-xs font-bold uppercase tracking-wide text-goto-green hover:underline"
                >
                  {article.category.name}
                </Link>
                {article.verificationLabel === "VERIFIED" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-goto-green">
                    <CheckCircle size={12} /> Terverifikasi
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-extrabold leading-tight text-txt-primary tracking-tight sm:text-3xl lg:text-4xl">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="mt-3 text-lg text-txt-secondary">
                  {article.excerpt}
                </p>
              )}

              {/* Meta bar */}
              <div className="mt-4 text-sm text-txt-muted">
                <span>{article.author.name}</span>
                <span className="mx-2">&middot;</span>
                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                    : "-"}
                </span>
                <span className="mx-2">&middot;</span>
                <span>{article.readTime ?? 0} menit baca</span>
              </div>

              {/* Divider */}
              <div className="mt-6 h-px bg-border" />

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[12px]">
                  <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
                </div>
              )}

              {/* Article content */}
              <div className="mt-8 max-w-3xl">
                <div
                  className="article-content text-[17px] leading-[1.8]"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>

              {/* Share bar */}
              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[12px] bg-surface-secondary p-3 sm:p-4">
                <div className="flex items-center gap-2 text-txt-secondary">
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
                      className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                      title={platform}
                    >
                      <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-txt-primary border border-border">
                        {sharePlatformLetters[platform]}
                      </span>
                      {platform}
                    </a>
                  ))}
                </div>
              </div>

              {/* Sources */}
              {article.sources.length > 0 && (
                <div className="mt-8 rounded-[12px] border border-border bg-surface p-6 shadow-card">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-txt-primary">
                    Sumber &amp; Narasumber
                  </h3>
                  <ul className="space-y-2">
                    {article.sources.map((source, i) => (
                      <li key={i} className="text-sm text-txt-secondary">
                        <strong className="text-txt-primary">{source.name}</strong>
                        {source.title && ` -- ${source.title}`}
                        {source.institution && `, ${source.institution}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-txt-secondary">Tags</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="text-xs font-medium text-goto-green border border-border rounded px-2 py-1 hover:bg-surface-secondary transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>

              {/* Report button */}
              <div className="mt-8 border-t border-border pt-5">
                <button className="btn-ghost text-xs text-txt-secondary hover:text-red-600">
                  <Flag size={13} />
                  Laporkan Berita Ini
                </button>
              </div>

              {/* Author box */}
              <div id="author" className="mt-8 rounded-[12px] border border-border bg-surface p-6 shadow-card">
                <div className="flex gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-goto-green text-xl font-bold text-white">
                    {article.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-txt-primary">{article.author.name}</h3>
                    <p className="text-sm text-goto-green font-medium">Jurnalis</p>
                    <p className="mt-2 text-sm leading-relaxed text-txt-secondary">
                      {article.author.bio}
                    </p>
                    <Link
                      href={`/penulis/${slugify(article.author.name)}`}
                      className="mt-3 inline-block text-sm font-medium text-goto-green transition-colors hover:text-goto-dark"
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
                    <h2 className="section-title">Artikel Terkait</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedArticles.map((related) => (
                      <ArticleCard key={related.slug} {...related} />
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <Sidebar trending={sidebarTrending} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
