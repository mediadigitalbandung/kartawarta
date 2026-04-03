import { successResponse } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Cache 1 hour

export async function GET() {
  try {
    // Fetch Google Trends Daily Search Trends for Indonesia
    const googleRes = await fetch(
      "https://trends.google.com/trending/rss?geo=ID",
      { next: { revalidate: 3600 } }
    );

    if (!googleRes.ok) {
      return successResponse(getFallbackTags());
    }

    const xml = await googleRes.text();

    // Parse <item><title>...</title></item> from RSS
    const itemTitles = xml.match(/<item>\s*<title>(.*?)<\/title>/g);

    if (!itemTitles || itemTitles.length === 0) {
      return successResponse(getFallbackTags());
    }

    const rawTrends = itemTitles
      .slice(0, 20)
      .map((t) => t.replace(/<item>\s*<title>/, "").replace(/<\/title>/, "").trim())
      .filter((t) => t.length > 0);

    if (rawTrends.length === 0) {
      return successResponse(getFallbackTags());
    }

    // Try AI curation
    const aiTags = await filterWithAI(rawTrends);

    if (aiTags && aiTags.length > 0) {
      const tags = aiTags.slice(0, 15).map((label, i) => ({
        label,
        href: `/search?q=${encodeURIComponent(label)}`,
        hot: i < 3,
      }));
      return successResponse(tags);
    }

    // Fallback: return raw trends directly
    const tags = rawTrends.slice(0, 15).map((label, i) => ({
      label,
      href: `/search?q=${encodeURIComponent(label)}`,
      hot: i < 3,
    }));
    return successResponse(tags);
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

    const prompt = `Kamu adalah editor media berita "Kartawarta". Dari daftar trending topik Google Indonesia berikut, pilih dan format menjadi headline tags yang menarik untuk portal berita umum.

Daftar trending:
${trends.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Aturan:
- Pilih 10-15 tags yang paling menarik dan relevan untuk pembaca Indonesia
- Cakup berbagai topik: politik, ekonomi, olahraga, hiburan, teknologi, kesehatan, dll
- Format ulang jadi lebih informatif jika perlu (contoh: nama orang → konteksnya)
- Setiap tag maksimal 6 kata
- Format output: HANYA daftar tags dipisah baris baru, tanpa nomor, tanpa penjelasan`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${setting.value}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Kamu adalah asisten editor untuk media berita Indonesia. Tugasmu mengkurasi trending tags agar menarik dan informatif." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.5,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    const tags = result
      .split("\n")
      .map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•]\s*/, "").trim())
      .filter((line: string) => line.length > 0 && line.length <= 50);

    return tags.length > 0 ? tags : null;
  } catch {
    return null;
  }
}

function getFallbackTags() {
  return [
    { label: "Pilkada Serentak 2026", href: "/search?q=pilkada+2026", hot: true },
    { label: "Timnas Indonesia", href: "/search?q=timnas+indonesia", hot: true },
    { label: "Harga BBM Terbaru", href: "/search?q=harga+bbm", hot: true },
    { label: "IHSG Hari Ini", href: "/search?q=IHSG", hot: false },
    { label: "IKN Nusantara", href: "/search?q=IKN+nusantara", hot: false },
    { label: "Kurs Rupiah", href: "/search?q=kurs+rupiah", hot: false },
    { label: "ChatGPT Indonesia", href: "/search?q=AI+Indonesia", hot: false },
    { label: "Film Indonesia Box Office", href: "/search?q=film+indonesia", hot: false },
    { label: "BPJS Kesehatan", href: "/search?q=BPJS+kesehatan", hot: false },
    { label: "Cuaca Ekstrem", href: "/search?q=cuaca+ekstrem", hot: false },
    { label: "Harga Emas Hari Ini", href: "/search?q=harga+emas", hot: false },
    { label: "Liga 1 Indonesia", href: "/search?q=liga+1", hot: false },
    { label: "Mudik Lebaran 2026", href: "/search?q=mudik+lebaran", hot: false },
    { label: "Startup Unicorn", href: "/search?q=startup+unicorn", hot: false },
    { label: "Vaksin Terbaru", href: "/search?q=vaksin", hot: false },
  ];
}
