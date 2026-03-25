import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ArticleCard from "@/components/artikel/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import { Metadata } from "next";

const categoryNames: Record<string, string> = {
  "hukum-pidana": "Hukum Pidana",
  "hukum-perdata": "Hukum Perdata",
  "hukum-tata-negara": "Hukum Tata Negara",
  ham: "HAM",
  opini: "Opini & Analisis",
  "berita-bandung": "Berita Bandung",
};

// Demo articles
const demoArticles = [
  {
    title: "Kasus Penipuan Online di Bandung Meningkat 40%",
    slug: "kasus-penipuan-online-bandung-meningkat",
    excerpt: "Data dari Polrestabes Bandung menunjukkan peningkatan signifikan kasus penipuan online.",
    featuredImage: null,
    category: { name: "Hukum Pidana", slug: "hukum-pidana" },
    author: { name: "Siti Nurhaliza" },
    publishedAt: new Date().toISOString(),
    readTime: 4,
    viewCount: 890,
    verificationLabel: "VERIFIED",
  },
  {
    title: "Sidang Korupsi Proyek Infrastruktur Bandung Berlanjut",
    slug: "sidang-korupsi-proyek-infrastruktur",
    excerpt: "Pengadilan Tipikor Bandung melanjutkan sidang perkara korupsi proyek infrastruktur senilai Rp 50 miliar.",
    featuredImage: null,
    category: { name: "Hukum Pidana", slug: "hukum-pidana" },
    author: { name: "Andi Saputra" },
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    readTime: 6,
    viewCount: 567,
    verificationLabel: "VERIFIED",
  },
];

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const name = categoryNames[params.slug] || params.slug;
  return {
    title: `${name} - Berita Hukum Terkini`,
    description: `Kumpulan berita ${name.toLowerCase()} terbaru dari Jurnalis Hukum Bandung.`,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryName = categoryNames[params.slug] || params.slug;

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-500">Beranda</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-900 dark:text-white">{categoryName}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{categoryName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kumpulan berita {categoryName.toLowerCase()} terbaru dan terpercaya
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {demoArticles.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>

          {demoArticles.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center dark:border-gray-800">
              <p className="text-gray-500">Belum ada artikel di kategori ini.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
