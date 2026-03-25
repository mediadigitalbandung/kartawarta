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
      <article className="group relative overflow-hidden rounded-lg">
        <div className="aspect-[2/1] w-full">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-bg-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <Link
              href={`/kategori/${category.slug}`}
              className="rounded bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur"
            >
              {category.name}
            </Link>
            {badge && (
              <span className={`rounded px-2 py-0.5 text-[11px] font-medium text-white ${badge.class}`}>
                {badge.label}
              </span>
            )}
          </div>
          <Link href={`/berita/${slug}`}>
            <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {title}
            </h2>
          </Link>
          {excerpt && (
            <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-text-muted sm:block">
              {truncate(excerpt, 150)}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <User size={12} /> {author.name}
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span>{publishedAt ? timeAgo(publishedAt) : "-"}</span>
            {readTime && (
              <>
                <span className="h-3 w-px bg-white/20" />
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {readTime} menit
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded">
          {featuredImage ? (
            <Image src={featuredImage} alt={title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-bg-card" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <Link
            href={`/berita/${slug}`}
            className="line-clamp-2 text-sm text-text-secondary transition-colors duration-200 group-hover:text-white"
          >
            {title}
          </Link>
          <p className="mt-1 text-xs text-text-muted">
            {publishedAt ? timeAgo(publishedAt) : "-"}
          </p>
        </div>
      </article>
    );
  }

  // Default variant — landscape card for scroll rows
  return (
    <article className="group w-[280px] shrink-0 overflow-hidden rounded-lg bg-bg-card transition-colors duration-200 hover:bg-bg-hover sm:w-[300px]">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-bg-secondary" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] text-text-muted">
          <Link
            href={`/kategori/${category.slug}`}
            className="transition-colors hover:text-white"
          >
            {category.name}
          </Link>
          <span className="h-3 w-px bg-border" />
          <span>{publishedAt ? timeAgo(publishedAt) : "-"}</span>
        </div>
        <Link href={`/berita/${slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-white">
            {title}
          </h3>
        </Link>
      </div>
    </article>
  );
}
