import Link from "next/link";
import Image from "next/image";
import { truncate } from "@/lib/utils";

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

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function VerificationBadge({ label }: { label?: string }) {
  if (!label || label === "UNVERIFIED") return null;
  if (label === "VERIFIED") {
    return (
      <span className="inline-flex items-center rounded-full bg-goto-light px-2 py-0.5 text-[10px] font-semibold text-goto-green">
        Terverifikasi
      </span>
    );
  }
  if (label === "OPINION") {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-txt-secondary">
        Opini
      </span>
    );
  }
  if (label === "CORRECTION") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
        Koreksi
      </span>
    );
  }
  return null;
}

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
  /* ── Featured variant (hero banner) ── */
  if (variant === "featured") {
    return (
      <article className="group relative w-full overflow-hidden rounded-[16px]">
        <div className="aspect-[2.2/1] w-full">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-surface-tertiary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/70 via-surface-dark/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <Link
              href={`/kategori/${category.slug}`}
              className="inline-flex rounded-full bg-goto-light px-3 py-1 text-xs font-semibold text-goto-green"
            >
              {category.name}
            </Link>
            <VerificationBadge label={verificationLabel} />
          </div>
          <Link href={`/berita/${slug}`}>
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {title}
            </h2>
          </Link>
          {excerpt && (
            <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-white/70 sm:block">
              {truncate(excerpt, 150)}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-white/50">
            <span>{author.name}</span>
            <span>&middot;</span>
            <span>{formatDate(publishedAt)}</span>
            {readTime && (
              <>
                <span>&middot;</span>
                <span>{readTime} menit baca</span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  /* ── Compact variant ── */
  if (variant === "compact") {
    return (
      <article className="group flex gap-3">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm">
          {featuredImage ? (
            <Image src={featuredImage} alt={title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-surface-tertiary" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <Link
            href={`/berita/${slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-txt-primary transition-colors duration-200 group-hover:text-goto-green"
          >
            {title}
          </Link>
          <p className="mt-1 text-xs text-txt-muted">
            {formatDate(publishedAt)}
          </p>
        </div>
      </article>
    );
  }

  /* ── Default variant (clean vertical card) ── */
  return (
    <article className="group overflow-hidden rounded-[12px] border border-border bg-surface shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[12px]">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-surface-tertiary" />
        )}
      </div>
      {/* Content */}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Link
            href={`/kategori/${category.slug}`}
            className="inline-flex rounded-full bg-goto-light px-3 py-1 text-xs font-semibold text-goto-green transition-colors hover:bg-goto-green hover:text-white"
          >
            {category.name}
          </Link>
          <VerificationBadge label={verificationLabel} />
        </div>
        <Link href={`/berita/${slug}`}>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-txt-primary transition-colors duration-200 group-hover:text-goto-green">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-txt-secondary">
            {truncate(excerpt, 120)}
          </p>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-txt-muted">
          <span>{author.name}</span>
          <span>&middot;</span>
          <span>{formatDate(publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}
