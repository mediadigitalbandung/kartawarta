export const dynamic = "force-dynamic";

import { Metadata } from "next";
import ArticleCard from "@/components/artikel/ArticleCard";
import { FileText, Eye, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { slugify } from "@/lib/utils";

async function getAuthorBySlug(slug: string) {
  const users = await prisma.user.findMany({ where: { isActive: true } });
  return users.find((u) => slugify(u.name) === slug) || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const author = await getAuthorBySlug(params.slug);
  if (!author) return { title: "Penulis Tidak Ditemukan" };

  return {
    title: `${author.name} - Penulis`,
    description: author.bio || `Profil penulis ${author.name} di Jurnalis Hukum Bandung.`,
  };
}

export default async function PenulisPage({ params }: { params: { slug: string } }) {
  const author = await getAuthorBySlug(params.slug);
  if (!author) notFound();

  const [articles, viewAgg] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", authorId: author.id },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.aggregate({
      where: { status: "PUBLISHED", authorId: author.id },
      _sum: { viewCount: true },
    }),
  ]);

  const totalArticles = articles.length;
  const totalViews = viewAgg._sum.viewCount || 0;
  const joinedDate = author.createdAt.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container-main py-8">
      {/* Author profile */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-100 text-4xl font-bold text-primary-500">
            {author.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {author.name}
            </h1>
            <p className="mt-1 text-sm text-primary-500">{author.role.replace(/_/g, " ")}</p>
            {author.specialization && (
              <p className="text-sm text-gray-500">
                Spesialisasi: {author.specialization}
              </p>
            )}
            <p className="mt-3 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              {author.bio}
            </p>

            <div className="mt-4 flex justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <FileText size={14} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalArticles}
                </span>{" "}
                artikel
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Eye size={14} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalViews.toLocaleString("id-ID")}
                </span>{" "}
                views
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar size={14} />
                Bergabung {joinedDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles by author */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Artikel oleh {author.name}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
}
