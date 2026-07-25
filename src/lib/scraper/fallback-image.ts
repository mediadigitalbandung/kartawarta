/**
 * Helper to fetch or generate a relevant featured image for articles
 * that have missing or failed hero images.
 *
 * Sources:
 * 1. Pollinations AI photo-realistic news illustration generator.
 * 2. Unsplash Source curated news/editorial queries.
 *
 * Downloads the resulting image to local `/uploads` and registers it in `Media`.
 */

import { downloadImageToUploads } from "./download-image";

const CATEGORY_KEYWORDS: Record<string, string> = {
  olahraga: "sports stadium football match athlete competition",
  bisnis: "business finance economy corporate stock market office",
  ekonomi: "finance economy market business money banking",
  hukum: "law court justice gavel legal hammer courtroom",
  pemerintahan: "government parliament building flag official meeting",
  teknologi: "technology artificial intelligence computer digital network",
  hiburan: "entertainment music concert cinema movie stage",
  kesehatan: "medical healthcare doctor hospital health science",
  lingkungan: "nature environment forest river climate green",
  pendidikan: "education university school student library study",
};

/** Extract clean search keywords from article title */
function extractTitleKeywords(title: string): string {
  const words = title
    .replace(/[^\w\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
  return words.join(" ");
}

/**
 * Generate or fetch a high-resolution fallback featured image for an article.
 */
export async function generateOrFetchFallbackImage(input: {
  title: string;
  categoryName?: string;
  authorId: string;
  authorName: string;
}): Promise<string | undefined> {
  const { title, categoryName, authorId, authorName } = input;
  const catKey = (categoryName || "").toLowerCase();
  const catKeywords = CATEGORY_KEYWORDS[catKey] || "news editorial headline media";
  const titleKeywords = extractTitleKeywords(title);

  const prompt = `editorial news photo of ${titleKeywords} ${catKeywords}, high quality 4k journalistic photography`;
  const seed = Math.floor(Math.random() * 1_000_000);

  // Candidate URLs to try downloading
  const candidates = [
    // Pollinations AI generator (realistic news style)
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=675&nologo=true&seed=${seed}`,
    // Unsplash Source curated search
    `https://source.unsplash.com/1200x675/?${encodeURIComponent(catKeywords.split(" ")[0])}`,
  ];

  for (const url of candidates) {
    try {
      const dl = await downloadImageToUploads(url, {
        title: title.slice(0, 200),
        caption: `Foto ilustrasi: ${title}`,
        credit: "Dok. Ilustrasi AI / Unsplash",
        uploadedBy: authorId,
        uploaderName: authorName,
      });
      if (dl?.url) {
        return dl.url;
      }
    } catch {
      // try next candidate
    }
  }

  return undefined;
}
