import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, User } from "lucide-react";
import { timeAgo, truncate } from "@/lib/utils";

interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt: Date | string;
  readTime?: number | null;
  viewCount?: number;
  verificationLabel?: string;
  variant?: "default" | "featured" | "compact";
}

const verificationBadge: Record<string, { label: string; class: string }> = {
  VERIFIED: { label: "Terverifikasi", class: "badge-verified" },
  UNVERIFIED: { label: "Belum Diverifikasi", class: "badge-unverified" },
  OPINION: { label: "Opini", class: "badge-opinion" },
  CORRECTION: { label: "Koreksi", class: "badge-correction" },
};

export default function ArticleCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
  readTime,
  viewCount,
  verificationLabel = "UNVERIFIED",
  variant = "default",
}: ArticleCardProps) {
  const badge = verificationBadge[verificationLabel];

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-xl bg-gray-900">
        <div className="aspect-[16/9] w-full">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-500 to-primary-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={`/kategori/${category.slug}`}
              className="rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase text-white"
            >
              {category.name}
            </Link>
            {badge && <span className={`badge ${badge.class}`}>{badge.label}</span>}
          </div>
          <Link href={`/berita/${slug}`}>
            <h2 className="text-xl font-bold leading-tight text-white transition-colors group-hover:text-gray-200 sm:text-2xl">
              {title}
            </h2>
          </Link>
          {excerpt && (
            <p className="mt-2 hidden text-sm text-gray-300 sm:block">
              {truncate(excerpt, 150)}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User size={12} /> {author.name}
            </span>
            <span>{timeAgo(publishedAt)}</span>
            {readTime && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {readTime} menit
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          {featuredImage ? (
            <Image src={featuredImage} alt={title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700" />
          )}
        </div>
        <div className="flex-1">
          <Link
            href={`/berita/${slug}`}
            className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-primary-500 dark:text-white"
          >
            {title}
          </Link>
          <p className="mt-1 text-xs text-gray-500">{timeAgo(publishedAt)}</p>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        )}
        <Link
          href={`/kategori/${category.slug}`}
          className="absolute left-3 top-3 rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase text-white"
        >
          {category.name}
        </Link>
      </div>
      <div className="p-4">
        <div className="mb-2">
          {badge && <span className={`badge ${badge.class}`}>{badge.label}</span>}
        </div>
        <Link href={`/berita/${slug}`}>
          <h3 className="font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-500 dark:text-white">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {truncate(excerpt, 120)}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <User size={12} /> {author.name}
            </span>
            <span>&middot;</span>
            <span>{timeAgo(publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {readTime && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {readTime} min
              </span>
            )}
            {viewCount !== undefined && viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={12} /> {viewCount.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
