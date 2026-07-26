/**
 * Database Cleanup Script: clean-ai-disclaimers.ts
 *
 * Removes AI disclaimer text from all existing articles in the database.
 * Targets sentences like:
 *   "Versi Kartawarta ditulis ulang oleh tim editorial dengan dukungan AI; fakta dan kutipan tetap mengacu ke publikasi asli."
 *   "Versi Kartawarta ditulis ulang oleh tim editorial dengan dukungan AI."
 *   "Artikel ini ditulis ulang dengan dukungan AI."
 *
 * Run via: npx tsx src/scripts/clean-ai-disclaimers.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function cleanContent(html: string): string {
  if (!html) return html;
  return html
    .replace(
      /\s*\.?\s*Versi Kartawarta ditulis ulang oleh tim editorial dengan dukungan AI; fakta dan kutipan tetap mengacu ke publikasi asli\.?/gi,
      "",
    )
    .replace(
      /\s*\.?\s*Versi Kartawarta ditulis ulang oleh tim editorial dengan dukungan AI\.?/gi,
      "",
    )
    .replace(
      /\s*\.?\s*(?:Artikel|Versi)?\s*(?:Kartawarta)?\s*(?:ditulis ulang|dibuat|disusun)(?: oleh tim editorial)? dengan dukungan AI[^\.<]*\.?/gi,
      "",
    )
    .replace(/\s*\.?\s*(?:Artikel|Berita) ini dibuat oleh AI[^\.<]*\.?/gi, "")
    .replace(/\s*\.?\s*Ditulis ulang oleh tim editorial dengan dukungan AI[^\.<]*\.?/gi, "");
}

async function main() {
  console.log("Memulai pembersihan klausa AI di database...");

  // Find all articles whose content contains "dukungan AI" or "ditulis ulang"
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { content: { contains: "dukungan AI" } },
        { content: { contains: "ditulis ulang oleh tim editorial" } },
        { content: { contains: "dibuat oleh AI" } },
        { content: { contains: "Versi Kartawarta ditulis ulang" } },
      ],
    },
    select: { id: true, slug: true, content: true },
  });

  console.log(`Ditemukan ${articles.length} artikel yang memuat teks klausa AI.`);

  let updatedCount = 0;
  for (const article of articles) {
    const cleaned = cleanContent(article.content);
    if (cleaned !== article.content) {
      await prisma.article.update({
        where: { id: article.id },
        data: { content: cleaned },
      });
      updatedCount++;
      console.log(`[FIXED] Artikel: ${article.slug}`);
    }
  }

  console.log(`\nSelesai! Berhasil memperbarui ${updatedCount} dari ${articles.length} artikel.`);
}

main()
  .catch((err) => {
    console.error("Error saat membersihkan database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
