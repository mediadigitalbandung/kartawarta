/**
 * Scrape the real featured photo directly from the original news article's webpage.
 *
 * NO AI generated images or stock illustrations are used.
 * Fetches the upstream source URL, extracts og:image / twitter:image / main <img>,
 * downloads it to local /uploads, and registers it in the Media library.
 */

import * as cheerio from "cheerio";
import { fetchHtml } from "./fetch";
import { downloadImageToUploads } from "./download-image";

function absolutise(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Scrape the real, original featured image directly from a source article URL.
 */
export async function scrapeRealPhotoFromSourceUrl(input: {
  sourceUrl: string;
  title: string;
  authorId: string;
  authorName: string;
}): Promise<string | undefined> {
  const { sourceUrl, title, authorId, authorName } = input;
  if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return undefined;

  try {
    const { html, finalUrl } = await fetchHtml(sourceUrl, { timeoutMs: 15_000 });
    const $ = cheerio.load(html);

    // Meta tag candidates (og:image, twitter:image, thumbnail, link rel=image_src)
    const metaCandidates = [
      $('meta[property="og:image:secure_url"]').attr("content"),
      $('meta[property="og:image"]').attr("content"),
      $('meta[name="og:image"]').attr("content"),
      $('meta[name="twitter:image"]').attr("content"),
      $('meta[name="twitter:image:src"]').attr("content"),
      $('meta[name="thumbnail"]').attr("content"),
      $('meta[itemprop="image"]').attr("content"),
      $('link[rel="image_src"]').attr("href"),
    ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);

    let realPhotoUrl: string | undefined;

    for (const cand of metaCandidates) {
      const abs = absolutise(cand.trim(), finalUrl);
      if (abs && /^https?:/i.test(abs)) {
        realPhotoUrl = abs;
        break;
      }
    }

    // Fallback to body <img> tags in the source webpage if meta tags were missing
    if (!realPhotoUrl) {
      const imgSelectors = [
        "figure img",
        ".featured-image img",
        ".lead-image img",
        ".post-thumbnail img",
        ".entry-thumb img",
        ".article-image img",
        "article img",
        "main img",
        "img",
      ];
      for (const sel of imgSelectors) {
        const el = $(sel).first();
        if (el.length > 0) {
          const src =
            el.attr("src") ||
            el.attr("data-src") ||
            el.attr("data-original") ||
            el.attr("data-lazy-src") ||
            el.attr("srcset")?.split(",")[0]?.trim()?.split(" ")[0];
          if (src && !src.startsWith("data:")) {
            const abs = absolutise(src, finalUrl);
            if (abs && /^https?:/i.test(abs)) {
              realPhotoUrl = abs;
              break;
            }
          }
        }
      }
    }

    if (!realPhotoUrl) return undefined;

    // Download the real scraped photo to local /uploads
    const dl = await downloadImageToUploads(realPhotoUrl, {
      title: title.slice(0, 200),
      caption: `Foto: ${title}`,
      credit: "Dok. Sumber Berita Asli",
      uploadedBy: authorId,
      uploaderName: authorName,
    });

    return dl?.url || undefined;
  } catch (err) {
    console.error(`Failed to scrape real photo from ${sourceUrl}:`, err);
    return undefined;
  }
}
