/**
 * SEO Automation Utilities
 * - Ping Google & Bing when articles are published
 * - Auto-generate seoTitle & seoDescription from content
 * - Sitemap ping to search engines
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kartawarta.com";

// ─── Ping Search Engines ───────────────────────────────────────────

/** Ping Google & Bing sitemap update */
export async function pingSitemaps() {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const newsSitemapUrl = encodeURIComponent(`${SITE_URL}/news-sitemap.xml`);

  const urls = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.google.com/ping?sitemap=${newsSitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
  ];

  await Promise.allSettled(
    urls.map((url) =>
      fetch(url, { method: "GET", signal: AbortSignal.timeout(5000) }).catch(() => {})
    )
  );
}

/** Ping Google Indexing API via web ping (URL Inspection alternative) */
export async function pingArticleUrl(slug: string) {
  const articleUrl = `${SITE_URL}/berita/${slug}`;

  // Google: ping via sitemap is the standard free method
  // For instant indexing, IndexNow (Bing/Yandex) is available without API keys
  await Promise.allSettled([
    // IndexNow (Bing, Yandex, Seznam, Naver) — free, no API key needed for basic ping
    fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: getIndexNowKey(),
        urlList: [articleUrl],
      }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {}),
  ]);

  // Also ping sitemaps for Google
  await pingSitemaps();
}

function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY || "kartawarta-indexnow-key";
}

// ─── Auto-Generate SEO Fields ──────────────────────────────────────

/** Generate seoTitle from article title (max 60 chars, append brand) */
export function generateSeoTitle(title: string): string {
  const clean = title.trim();
  if (clean.length <= 50) return `${clean} | Kartawarta`;
  // Truncate at word boundary
  const truncated = clean.substring(0, 57).replace(/\s+\S*$/, "");
  return `${truncated}...`;
}

/** Generate seoDescription from excerpt or content (max 155 chars) */
export function generateSeoDescription(excerpt: string | null, content: string): string {
  // Prefer excerpt
  if (excerpt && excerpt.trim().length > 20) {
    const clean = excerpt.trim();
    if (clean.length <= 155) return clean;
    return clean.substring(0, 152).replace(/\s+\S*$/, "") + "...";
  }
  // Fallback: strip HTML from content
  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 155) return text;
  return text.substring(0, 152).replace(/\s+\S*$/, "") + "...";
}

// ─── Canonical Slug Check ──────────────────────────────────────────

/** Ensure slug doesn't have issues */
export function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100;
}

// ─── All-in-one: call after publish ────────────────────────────────

export async function onArticlePublished(slug: string) {
  try {
    await pingArticleUrl(slug);
  } catch {
    // Non-critical — don't block publish flow
  }
}
