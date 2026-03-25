import Link from "next/link";
import Image from "next/image";

interface PopularItem {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt: Date | string | null;
  viewCount?: number;
}

interface PopularCarouselProps {
  items: PopularItem[];
}

export default function PopularCarousel({ items }: PopularCarouselProps) {
  if (items.length === 0) return null;

  const formatDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.slice(0, 8).map((article, i) => (
        <article key={article.slug} className="group flex gap-3">
          {/* Rank number — large elegant typography */}
          <span className="shrink-0 w-8 text-right font-serif text-[2.5rem] font-bold leading-none text-border select-none">
            {i + 1}
          </span>

          <div className="flex-1 min-w-0">
            {/* Image */}
            <Link href={`/berita/${article.slug}`} className="block">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm">
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-surface-tertiary" />
                )}
              </div>
            </Link>
            {/* Content */}
            <div className="mt-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-goto-green">
                {article.category.name}
              </span>
              <Link href={`/berita/${article.slug}`}>
                <h3 className="mt-0.5 text-sm font-bold leading-snug text-txt-primary line-clamp-2 group-hover:underline">
                  {article.title}
                </h3>
              </Link>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-txt-muted">
                <span>{formatDate(article.publishedAt)}</span>
                {article.viewCount !== undefined && article.viewCount > 0 && (
                  <>
                    <span className="h-2.5 w-px bg-border" />
                    <span>{article.viewCount.toLocaleString("id-ID")} views</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
