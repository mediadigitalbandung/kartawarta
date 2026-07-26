import { prisma } from "@/lib/prisma";
import { fetchListing } from "@/lib/scraper/fetch-listing";

async function auditAllSources() {
  console.log("==================================================");
  console.log("AUDITING ALL NEWS SOURCES IN DATABASE");
  console.log("==================================================");

  const sources = await prisma.newsSource.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${sources.length} sources in database.\n`);

  const results: Array<{
    id: string;
    name: string;
    url: string;
    isActive: boolean;
    useHeadless: boolean;
    articleSelector?: string | null;
    status: "OK" | "FAILED";
    itemCount: number;
    error?: string;
    sampleUrl?: string;
  }> = [];

  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    console.log(`[${i + 1}/${sources.length}] Testing "${s.name}" (${s.listingUrl}) ...`);

    try {
      const res = await fetchListing(s.listingUrl, {
        useHeadless: s.useHeadless,
        articleSelector: s.articleSelector || undefined,
        titleSelector: s.titleSelector || undefined,
        imageSelector: s.imageSelector || undefined,
        timeoutMs: 15000,
      });

      results.push({
        id: s.id,
        name: s.name,
        url: s.listingUrl,
        isActive: s.isActive,
        useHeadless: s.useHeadless,
        articleSelector: s.articleSelector,
        status: "OK",
        itemCount: res.items.length,
        sampleUrl: res.items[0]?.url,
      });
      console.log(`   --> OK! Detected ${res.items.length} article items (using ${res.selectorUsed})`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({
        id: s.id,
        name: s.name,
        url: s.listingUrl,
        isActive: s.isActive,
        useHeadless: s.useHeadless,
        articleSelector: s.articleSelector,
        status: "FAILED",
        itemCount: 0,
        error: errorMsg,
      });
      console.log(`   --> FAILED! Error: ${errorMsg}`);
    }
  }

  console.log("\n==================================================");
  console.log("SUMMARY OF AUDIT RESULTS:");
  console.log("==================================================");
  console.table(
    results.map((r) => ({
      Name: r.name,
      Status: r.status,
      Items: r.itemCount,
      Error: r.error ? r.error.slice(0, 60) : "-",
      URL: r.url,
    }))
  );

  await prisma.$disconnect();
}

auditAllSources().catch(console.error);
