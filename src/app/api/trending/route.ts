import { successResponse } from "@/lib/api-utils";

export const revalidate = 1800; // 30 min

// Map Google Trends to our categories
const categoryKeywords: Record<string, string[]> = {
  "Hukum": ["hukum", "kpk", "korupsi", "sidang", "pengadilan", "jaksa", "hakim", "polisi", "kriminal", "pidana", "perdata"],
  "Bisnis": ["saham", "ihsg", "rupiah", "bank", "ekonomi", "bisnis", "investasi", "fintech", "startup", "emas", "bbm"],
  "Olahraga": ["timnas", "liga", "bola", "sepak", "badminton", "moto", "gp", "olimpiade", "persib", "persija", "piala", "goal", "fc", "vs"],
  "Hiburan": ["film", "konser", "musik", "artis", "drama", "netflix", "idol", "viral", "tiktok", "selebriti"],
  "Kesehatan": ["covid", "vaksin", "rumah sakit", "kesehatan", "penyakit", "obat", "dokter", "bpjs"],
  "Teknologi": ["ai", "tech", "google", "apple", "samsung", "android", "iphone", "digital", "cyber", "internet"],
  "Politik": ["presiden", "dpr", "menteri", "pilkada", "pemilu", "partai", "pemerintah", "kebijakan"],
  "Pendidikan": ["sekolah", "universitas", "mahasiswa", "ujian", "beasiswa", "kampus"],
  "Lingkungan": ["banjir", "gempa", "cuaca", "iklim", "kebakaran", "tsunami", "gunung"],
};

function categorize(tag: string): string | null {
  const lower = tag.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => lower.includes(k))) return cat;
  }
  return null;
}

export async function GET() {
  try {
    const googleRes = await fetch(
      "https://trends.google.com/trending/rss?geo=ID",
      { next: { revalidate: 1800 } }
    );

    if (!googleRes.ok) return successResponse(getFallbackTags());

    const xml = await googleRes.text();
    const itemTitles = xml.match(/<item>\s*<title>(.*?)<\/title>/g);

    if (!itemTitles || itemTitles.length === 0) {
      return successResponse(getFallbackTags());
    }

    const rawTrends = itemTitles
      .slice(0, 25)
      .map((t) => t.replace(/<item>\s*<title>/, "").replace(/<\/title>/, "").replace(/&amp;/g, "&").replace(/&apos;/g, "'").trim())
      .filter((t) => t.length > 0 && t.length <= 40);

    if (rawTrends.length === 0) return successResponse(getFallbackTags());

    // Tag with category if possible
    const tags = rawTrends.slice(0, 15).map((label, i) => {
      const cat = categorize(label);
      return {
        label,
        category: cat,
        href: `/search?q=${encodeURIComponent(label)}`,
        hot: i < 3,
      };
    });

    return successResponse(tags);
  } catch {
    return successResponse(getFallbackTags());
  }
}

function getFallbackTags() {
  return [
    { label: "Pilkada 2026", category: "Politik", href: "/search?q=pilkada+2026", hot: true },
    { label: "Timnas Indonesia", category: "Olahraga", href: "/search?q=timnas+indonesia", hot: true },
    { label: "IHSG Hari Ini", category: "Bisnis", href: "/search?q=IHSG", hot: true },
    { label: "Harga BBM", category: "Bisnis", href: "/search?q=harga+bbm", hot: false },
    { label: "KPK Tangkap Tersangka", category: "Hukum", href: "/search?q=KPK", hot: false },
    { label: "Kurs Rupiah", category: "Bisnis", href: "/search?q=kurs+rupiah", hot: false },
    { label: "ChatGPT", category: "Teknologi", href: "/search?q=chatgpt", hot: false },
    { label: "Liga 1 Indonesia", category: "Olahraga", href: "/search?q=liga+1", hot: false },
    { label: "Harga Emas", category: "Bisnis", href: "/search?q=harga+emas", hot: false },
    { label: "IKN Nusantara", category: "Politik", href: "/search?q=IKN", hot: false },
    { label: "Film Indonesia", category: "Hiburan", href: "/search?q=film+indonesia", hot: false },
    { label: "Cuaca Ekstrem BMKG", category: "Lingkungan", href: "/search?q=cuaca+ekstrem", hot: false },
  ];
}
