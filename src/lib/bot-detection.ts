/**
 * Utility for detecting search engine bots, web crawlers, social media preview generators,
 * and Next.js prefetch requests to prevent inflated pageview counts.
 */

const BOT_USER_AGENTS = [
  "googlebot",
  "bingbot",
  "yandexbot",
  "ahrefsbot",
  "semrushbot",
  "bytespider",
  "petalbot",
  "dotbot",
  "rogersbot",
  "exabot",
  "facebookexternalhit",
  "whatsapp",
  "twitterbot",
  "telegrambot",
  "slackbot",
  "discordbot",
  "linkedinbot",
  "pinterest",
  "applebot",
  "duckduckgo",
  "baiduspider",
  "sogou",
  "curl",
  "wget",
  "python-requests",
  "axios",
  "node-fetch",
  "headlesschrome",
  "phantomjs",
  "puppeteer",
  "playwright",
];

export function isBotOrPrefetch(
  userAgent: string | null | undefined,
  headers?: Headers | Record<string, string | null | undefined> | null,
): boolean {
  // 1. Check User-Agent
  const ua = (userAgent || "").toLowerCase().trim();
  if (!ua) return true; // Missing UA is usually a script or crawler

  for (const bot of BOT_USER_AGENTS) {
    if (ua.includes(bot)) return true;
  }

  // 2. Check Prefetch headers
  if (headers) {
    const getHeader = (name: string): string => {
      if (typeof headers.get === "function") {
        return (headers.get(name) || "").toLowerCase();
      }
      const record = headers as Record<string, string | null | undefined>;
      return (record[name] || record[name.toLowerCase()] || "").toLowerCase();
    };

    const purpose = getHeader("purpose");
    const secPurpose = getHeader("sec-purpose");
    const nextData = getHeader("x-nextjs-data");
    const middlewarePrefetch = getHeader("x-middleware-prefetch");

    if (
      purpose.includes("prefetch") ||
      secPurpose.includes("prefetch") ||
      nextData === "1" ||
      middlewarePrefetch === "1"
    ) {
      return true;
    }
  }

  return false;
}
