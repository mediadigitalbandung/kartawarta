import { successResponse } from "@/lib/api-utils";

export const revalidate = 3600;

export async function GET() {
  try {
    const googleRes = await fetch(
      "https://trends.google.com/trending/rss?geo=ID",
      { next: { revalidate: 3600 } }
    );

    if (!googleRes.ok) return successResponse(getFallbackTags());

    const xml = await googleRes.text();

    // Parse trend titles (tags) from RSS
    const itemTitles = xml.match(/<item>\s*<title>(.*?)<\/title>/g);

    if (!itemTitles || itemTitles.length === 0) {
      return successResponse(getFallbackTags());
    }

    const rawTrends = itemTitles
      .slice(0, 20)
      .map((t) => t.replace(/<item>\s*<title>/, "").replace(/<\/title>/, "").replace(/&amp;/g, "&").replace(/&apos;/g, "'").trim())
      .filter((t) => t.length > 0 && t.length <= 40);

    if (rawTrends.length === 0) {
      return successResponse(getFallbackTags());
    }

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
