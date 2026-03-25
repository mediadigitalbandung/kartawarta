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

function kickerSuffix(verificationLabel?: string): React.ReactNode {
  if (verificationLabel === "OPINION") {
    return <span className="italic"> (Opini)</span>;
  }
  if (verificationLabel === "CORRECTION") {
    return <span className="text-red-600"> (Koreksi)</span>;
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
  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-card">
        <div className="aspect-[16/7] w-full">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-paper" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-press/70 via-press/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="mb-3">
            <Link
              href={`/kategori/${category.slug}`}
              className="font-mono text-kicker uppercase tracking-widest text-wheat"
            >
              {category.name}
              {kickerSuffix(verificationLabel)}
            </Link>
          </div>
          <Link href={`/berita/${slug}`}>
            <h2 className="font-serif text-3xl font-bold leading-tight text-newsprint sm:text-4xl">
              {title}
            </h2>
          </Link>
          {excerpt && (
            <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-newsprint/70 sm:block">
              {truncate(excerpt, 150)}
            </p>
          )}
          <div className="mt-3 font-mono text-meta text-newsprint/50">
            {formatDate(publishedAt)}
            {readTime && <span> &middot; {readTime} menit baca</span>}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-3">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-card">
          {featuredImage ? (
            <Image src={featuredImage} alt={title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-paper" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <Link
            href={`/berita/${slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-press transition-colors duration-200 group-hover:text-forest"
          >
            {title}
          </Link>
          <p className="mt-1 font-mono text-meta text-ink">
            {formatDate(publishedAt)}
          </p>
        </div>
      </article>
    );
  }

  // Default variant — horizontal editorial list card
  return (
    <article className="group flex gap-4 border-b border-border pb-5 mb-5">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-[240px] shrink-0 overflow-hidden rounded-card">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-paper" />
        )}
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col justify-center">
        <Link
          href={`/kategori/${category.slug}`}
          className="font-mono text-kicker uppercase tracking-widest text-forest mb-1.5"
        >
          {category.name}
          {kickerSuffix(verificationLabel)}
        </Link>
        <Link href={`/berita/${slug}`}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-press transition-colors duration-200 group-hover:text-forest">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm text-ink">
            {truncate(excerpt, 120)}
          </p>
        )}
        <div className="mt-2 font-mono text-meta text-ink">
          {formatDate(publishedAt)}
          {readTime && <span> &middot; {readTime} menit baca</span>}
        </div>
      </div>
    </article>
  );
}
