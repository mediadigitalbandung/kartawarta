import { successResponse } from "@/lib/api-utils";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Fetch Google Trends Daily Search Trends for Indonesia
    const googleRes = await fetch(
      "https://trends.google.com/trends/trendingsearches/daily/rss?geo=ID",
      { next: { revalidate: 3600 } }
    );

    if (googleRes.ok) {
      const xml = await googleRes.text();
      // Parse RSS XML to extract titles
      const titles = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g);

      if (titles && titles.length > 1) {
        const tags = titles
          .slice(1, 13) // skip first (channel title), take 12
          .map((t) => {
            const label = t.replace(/<title><!\[CDATA\[/, "").replace(/\]\]><\/title>/, "");
            return {
              label,
              href: `/search?q=${encodeURIComponent(label)}`,
              hot: false,
            };
          });

        // Mark first 3 as hot
        tags.forEach((tag, i) => {
          if (i < 3) tag.hot = true;
        });

        return successResponse(tags);
      }
    }

    // Fallback: curated tags
    return successResponse(getFallbackTags());
  } catch {
    return successResponse(getFallbackTags());
  }
}

function getFallbackTags() {
  return [
    { label: "Omnibus Law", href: "/search?q=omnibus+law", hot: true },
    { label: "KPK", href: "/search?q=KPK", hot: true },
    { label: "Pilkada 2026", href: "/search?q=pilkada+2026", hot: true },
    { label: "UU ITE", href: "/search?q=UU+ITE", hot: false },
    { label: "Korupsi Jabar", href: "/search?q=korupsi+jabar", hot: false },
    { label: "MK Putusan", href: "/search?q=mahkamah+konstitusi", hot: false },
    { label: "Hukum Digital", href: "/search?q=hukum+digital", hot: false },
    { label: "HAM Indonesia", href: "/search?q=HAM+Indonesia", hot: false },
    { label: "Tipikor", href: "/search?q=tipikor", hot: false },
    { label: "Sengketa Lahan", href: "/search?q=sengketa+lahan", hot: false },
    { label: "UMK 2027", href: "/search?q=UMK+2027", hot: false },
    { label: "Citarum", href: "/search?q=citarum", hot: false },
  ];
}
