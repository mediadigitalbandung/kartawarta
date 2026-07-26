/**
 * Utility to clean scraped article content according to editorial rules:
 * 1. Removes AI disclaimers and disclaimer text phrases.
 * 2. Removes "Disarikan dari rilis..." attribution footer lines.
 * 3. Removes embedded body images (<figure>, <img>, <picture>).
 * 4. Removes leftover empty paragraphs.
 */
export function cleanArticleContent(html: string): string {
  if (!html) return html;

  let cleaned = html;

  // 1. Remove AI disclaimer text variations from content / attribution
  cleaned = cleaned
    .replace(
      /\s*;?\s*Versi Kartawarta ditulis ulang oleh tim editorial dengan dukungan AI;?\s*fakta dan kutipan tetap mengacu ke publikasi asli\.?/gi,
      "",
    )
    .replace(
      /\s*;?\s*Versi Kartawarta ditulis ulang oleh tim editorial dengan dukungan AI\.?/gi,
      "",
    )
    .replace(
      /\s*;?\s*(?:Artikel|Versi)?\s*(?:Kartawarta)?\s*(?:ditulis ulang|dibuat|disusun)(?: oleh tim editorial)? dengan dukungan AI[^\.<"]*\.?/gi,
      "",
    )
    .replace(/\s*;?\s*(?:Artikel|Berita) ini dibuat oleh AI[^\.<"]*\.?/gi, "")
    .replace(/\s*;?\s*Ditulis ulang oleh tim editorial dengan dukungan AI[^\.<"]*\.?/gi, "");

  // 2. Remove "Disarikan dari..." attribution footer paragraphs completely
  cleaned = cleaned
    .replace(/<p[^>]*>\s*Disarikan dari[\s\S]*?<\/p>/gi, "")
    .replace(/Disarikan dari rilis [^\n<"]+["”]?\.?/gi, "");

  // 3. Remove embedded body images (<figure>...</figure>, <img>, <picture>...)
  cleaned = cleaned
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<picture[^>]*>[\s\S]*?<\/picture>/gi, "")
    .replace(/<img[^>]*\/?>/gi, "");

  // 4. Remove empty paragraphs left behind
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "").replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}
