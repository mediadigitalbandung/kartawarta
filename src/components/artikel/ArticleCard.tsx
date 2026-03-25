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
  publishedAt: Date | string | null;
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
      <article className="group relative overflow-hidden rounded-2xl bg-gray-900 transition-transform duration-500 hover:scale-[1.02]">
        <div className="aspect-[21/9] w-full">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-primary-gradient" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <Link
              href={`/kategori/${category.slug}`}
              className="rounded-lg bg-accent-gradient px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/20"
            >
              {category.name}
            </Link>
            {badge && (
              <span className={`badge glass text-white ${badge.class}`}>
                {badge.label}
              </span>
            )}
          </div>
          <Link href={`/berita/${slug}`}>
            <h2 className="text-2xl font-extrabold leading-tight text-white transition-colors duration-300 group-hover:text-gray-100 sm:text-3xl">
              {title}
            </h2>
          </Link>
          {excerpt && (
            <p className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-gray-300/90 sm:block">
              {truncate(excerpt, 150)}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <User size={12} /> {author.name}
            </span>
            <span className="h-3 w-px bg-gray-600" />
            <span>{publishedAt ? timeAgo(publishedAt) : "-"}</span>
            {readTime && (
              <>
                <span className="h-3 w-px bg-gray-600" />
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {readTime} menit
                </span>
              </>
            )}
          </div>
          {/* Subtle gradient line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gradient opacity-60" />
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-4 transition-transform duration-200 hover:translate-x-1">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          {featuredImage ? (
            <Image src={featuredImage} alt={title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <Link
            href={`/berita/${slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-primary-500 dark:text-white"
          >
            {title}
          </Link>
          <p className="mt-1.5 text-xs text-gray-500">{publishedAt ? timeAgo(publishedAt) : "-"}</p>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="card group overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
        )}
        {/* Subtle bottom gradient for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        <Link
          href={`/kategori/${category.slug}`}
          className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-900 backdrop-blur"
        >
          {category.name}
        </Link>
      </div>
      <div className="p-5">
        <div className="mb-2">
          {badge && <span className={`badge ${badge.class}`}>{badge.label}</span>}
        </div>
        <Link href={`/berita/${slug}`}>
          <h3 className="line-clamp-2 font-bold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-primary-500 dark:text-white">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {truncate(excerpt, 120)}
          </p>
        )}
        <div className="divider-gradient my-4" />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-gradient text-[10px] font-bold text-white">
              {author.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">{author.name}</span>
            <span className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
            <span>{publishedAt ? timeAgo(publishedAt) : "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            {readTime && (
              <span className="flex items-center gap-1 text-gray-400">
                <Clock size={12} /> {readTime} min
              </span>
            )}
            {viewCount !== undefined && viewCount > 0 && (
              <span className="flex items-center gap-1 text-gray-400">
                <Eye size={12} /> {viewCount.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
