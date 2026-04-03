import { successResponse } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET() {
  try {
    const googleRes = await fetch(
      "https://trends.google.com/trending/rss?geo=ID",
      { next: { revalidate: 3600 } }
    );

    if (!googleRes.ok) return successResponse(getFallbackTags());

    const xml = await googleRes.text();

    // Extract news_item_titles from Indonesian sources (more relevant than trend titles)
    const newsItemTitles: string[] = [];
    const trendTitles: string[] = [];

    // Get trend titles
    const itemBlocks = xml.split("<item>").slice(1);
    for (const block of itemBlocks) {
      // Get the main trend title
      const titleMatch = block.match(/<title>(.*?)<\/title>/);
      if (titleMatch) trendTitles.push(titleMatch[1].trim());

      // Get Indonesian news item titles (from Indonesian sources)
      const newsItems = block.match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/g) || [];
      const newsSources = block.match(/<ht:news_item_source>(.*?)<\/ht:news_item_source>/g) || [];

      for (let i = 0; i < newsItems.length; i++) {
        const itemTitle = newsItems[i]
          .replace(/<ht:news_item_title>/, "")
          .replace(/<\/ht:news_item_title>/, "")
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .trim();

        const source = newsSources[i]
          ?.replace(/<ht:news_item_source>/, "")
          ?.replace(/<\/ht:news_item_source>/, "")
          ?.trim() || "";

        // Prioritize Indonesian sources
        const isIndonesian = /detik|kompas|tribun|cnnindonesia|cnbcindonesia|tempo|liputan6|suara|sindonews|republika|antaranews|bisnis|kontan|tirto|kumparan|idntimes|viva|okezone|merdeka|goal\.com.*id|bola\.net|dream\.co|jpnn|mediaindonesia|jawapos/i.test(source);

        // Also check if title is in Indonesian
        const isIndonesianTitle = /indonesia|jakarta|jawa|timnas|pemain|kasus|soal|tentang|menang|kalah|lawan|dalam|untuk|dengan|dari|yang|akan|sudah|baru|hari|ini|dan/i.test(itemTitle);

        if (isIndonesian || isIndonesianTitle) {
          // Shorten to max ~60 chars for ticker
          const short = itemTitle.length > 60 ? itemTitle.substring(0, 57) + "..." : itemTitle;
          newsItemTitles.push(short);
        }
      }
    }

    // Deduplicate and pick best items
    const seen = new Set<string>();
    const uniqueNews = newsItemTitles.filter((t) => {
      const key = t.toLowerCase().substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // If we got enough Indonesian news, use those
    if (uniqueNews.length >= 5) {
      const tags = uniqueNews.slice(0, 15).map((label, i) => ({
        label,
        href: `/search?q=${encodeURIComponent(label.replace("...", ""))}`,
        hot: i < 3,
      }));
      return successResponse(tags);
    }

    // Try AI to curate
    const allTitles = [...uniqueNews, ...trendTitles];
    const aiTags = await filterWithAI(allTitles);
    if (aiTags && aiTags.length > 0) {
      const tags = aiTags.slice(0, 15).map((label, i) => ({
        label,
        href: `/search?q=${encodeURIComponent(label)}`,
        hot: i < 3,
      }));
      return successResponse(tags);
    }

    // Use whatever we have + trend titles
    const combined = [...uniqueNews, ...trendTitles.slice(0, 10)].slice(0, 15);
    if (combined.length > 0) {
      return successResponse(combined.map((label, i) => ({
        label,
        href: `/search?q=${encodeURIComponent(label)}`,
        hot: i < 3,
      })));
    }

    return successResponse(getFallbackTags());
  } catch {
    return successResponse(getFallbackTags());
  }
}

async function filterWithAI(trends: string[]): Promise<string[] | null> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "deepseek_api_key" },
    });
    if (!setting?.value) return null;

    const prompt = `Dari daftar trending berikut, pilih dan format menjadi headline berita pendek dalam Bahasa Indonesia:

${trends.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Aturan:
- Pilih 10-15 yang paling relevan untuk pembaca Indonesia
- Tulis dalam Bahasa Indonesia yang baik
- Setiap headline maksimal 8 kata
- HANYA output daftar headline, satu per baris, tanpa nomor`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${setting.value}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Kamu editor berita Indonesia. Output headline pendek dalam Bahasa Indonesia." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.5,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";
    const tags = result.split("\n")
      .map((l: string) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•]\s*/, "").trim())
      .filter((l: string) => l.length > 0 && l.length <= 60);
    return tags.length > 0 ? tags : null;
  } catch {
    return null;
  }
}

function getFallbackTags() {
  return [
    { label: "Pilkada Serentak 2026 Digelar November", href: "/search?q=pilkada+2026", hot: true },
    { label: "Timnas Indonesia Persiapan Piala Dunia 2030", href: "/search?q=timnas+indonesia", hot: true },
    { label: "IHSG Terkoreksi, Investor Asing Net Sell", href: "/search?q=IHSG", hot: true },
    { label: "Harga BBM Pertamina April 2026 Terbaru", href: "/search?q=harga+bbm", hot: false },
    { label: "Rupiah Melemah ke Rp 17.000 per Dolar", href: "/search?q=kurs+rupiah", hot: false },
    { label: "DPR Bahas RUU Energi Terbarukan", href: "/search?q=RUU+energi", hot: false },
    { label: "Harga Emas Antam Hari Ini Naik Tajam", href: "/search?q=harga+emas", hot: false },
    { label: "Presiden Resmikan IKN Tahap 2", href: "/search?q=IKN+nusantara", hot: false },
    { label: "Liga 1 Indonesia Pekan 28 Hasil Lengkap", href: "/search?q=liga+1+indonesia", hot: false },
    { label: "BPJS Kesehatan Tambah Manfaat Baru", href: "/search?q=BPJS+kesehatan", hot: false },
    { label: "Cuaca Ekstrem BMKG Peringatan Dini", href: "/search?q=cuaca+ekstrem", hot: false },
    { label: "Film Indonesia Box Office 2026", href: "/search?q=film+indonesia", hot: false },
  ];
}
