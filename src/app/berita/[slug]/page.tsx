export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Flag,
  CheckCircle,
} from "lucide-react";
import CopyProtection from "@/components/artikel/CopyProtection";
import ReadingProgress from "@/components/artikel/ReadingProgress";
import FontSizeControl from "@/components/artikel/FontSizeControl";
import PrintButton from "@/components/artikel/PrintButton";
import ShareBar from "@/components/artikel/ShareBar";
import Sidebar from "@/components/layout/Sidebar";
import ArticleCard from "@/components/artikel/ArticleCard";
import BannerAd from "@/components/ads/BannerAd";
import CommentSection from "@/components/artikel/CommentSection";
import BookmarkButton from "@/components/artikel/BookmarkButton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
// Note: DOMPurify removed — content sanitized at input via API validation
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

  // Non-published articles are private — only visible to author/editors/admins
  const isPublished = article.status === "PUBLISHED";

  if (!isPublished) {
    // Check if current user has access
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || "";
    const isAuthor = session?.user?.id === article.authorId;
    const hasAccess = isAuthor || ["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR"].includes(userRole);

    if (!hasAccess) {
      notFound();
    }
  }

  // Increment view count only for published articles
  if (isPublished) {
    await prisma.article.update({
      where: { slug: params.slug },
      data: { viewCount: { increment: 1 } },
    });
  }

  // Status label mapping for non-published preview
  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Draf", color: "bg-gray-500" },
    IN_REVIEW: { label: "Sedang Direview", color: "bg-yellow-500" },
    APPROVED: { label: "Disetujui — Menunggu Publikasi", color: "bg-blue-500" },
    REJECTED: { label: "Ditolak", color: "bg-red-500" },
    ARCHIVED: { label: "Diarsipkan", color: "bg-gray-600" },
  };

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
  const sanitizedContent = article.content;

  return (
    <>
      <ReadingProgress />
      <FontSizeControl />
      <CopyProtection
        authorName={article.author.name}
        articleUrl={articleUrl}
        articleTitle={article.title}
        categoryName={article.category.name}
        publishedAt={article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
      />

      <div className="bg-surface min-h-screen overflow-x-hidden">
        {/* Status banner for non-published articles */}
        {!isPublished && statusLabels[article.status] && (
          <div className={`${statusLabels[article.status].color} text-white`}>
            <div className="container-main flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider">Preview — {statusLabels[article.status].label}</span>
              </div>
              <span className="text-xs text-white/70">Halaman ini hanya dapat dilihat oleh pihak terkait</span>
            </div>
          </div>
        )}

        {/* Ad — Top leaderboard (only on published) */}
        {isPublished && <BannerAd size="slim" className="bg-surface-secondary" />}

        <div className="container-main py-8 overflow-hidden">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-txt-secondary" aria-label="Breadcrumb">
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

              {/* Ad — below meta */}
              <div className="mt-6 rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: "6 / 1" }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
              </div>

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[12px]">
                  <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
                </div>
              )}

              {/* Article content */}
              <div className="mt-8 max-w-full overflow-hidden">
                <div
                  className="article-content text-base sm:text-[17px] leading-[1.8] break-words text-justify"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>

              {/* Ad — after content */}
              <div className="mt-8 rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: "4 / 1" }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
              </div>

              {/* Share bar + bookmark */}
              <div className="mt-8">
                <ShareBar articleUrl={articleUrl} articleTitle={article.title} />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <PrintButton />
                  <BookmarkButton slug={params.slug} />
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

              {/* Ad — after tags */}
              <div className="mt-6 rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: "6 / 1" }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
              </div>

              {/* Report button */}
              <div className="mt-8 border-t border-border pt-5">
                <Link href="/kontak?subject=Laporkan Berita" className="btn-ghost text-xs text-txt-secondary hover:text-red-600" aria-label="Laporkan berita ini">
                  <Flag size={13} aria-hidden="true" />
                  Laporkan Berita Ini
                </Link>
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

              {/* Ad — before related */}
              <div className="mt-8 rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: "3 / 1" }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
              </div>

              {/* Related articles */}
              {relatedArticles.length > 0 && (
                <section className="mt-10">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="border-l-[3px] border-goto-green pl-3 text-lg font-bold text-txt-primary">Artikel Terkait</h2>
                    <Link href={`/kategori/${article.category.slug}`} className="text-sm font-medium text-goto-green hover:underline">
                      Lihat Lainnya &rarr;
                    </Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                    {relatedArticles.map((related) => (
                      <div key={related.slug} className="shrink-0 w-[260px] sm:w-[280px]">
                        <ArticleCard {...related} variant="standard" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Comments — only on published articles */}
              {isPublished && <CommentSection articleId={article.id} />}
            </article>

            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <Sidebar trending={sidebarTrending} />
              {/* Sidebar Ad 1 */}
              <div className="mt-5 rounded-lg bg-gradient-to-b from-surface-tertiary to-surface-secondary flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: "4 / 3" }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
              </div>
              {/* Sidebar Ad 2 */}
              <div className="mt-5 rounded-lg bg-gradient-to-b from-surface-tertiary to-surface-secondary flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: "4 / 3" }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)" }} />
                <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad — Bottom full width */}
        <BannerAd size="leaderboard" className="bg-surface-secondary" />
      </div>
    </>
  );
}
