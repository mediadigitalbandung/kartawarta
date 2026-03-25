import Link from "next/link";
import ArticleCard from "@/components/artikel/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import NewsTicker from "@/components/layout/NewsTicker";
import { Scale, BookOpen, Gavel, Shield, Users, Landmark } from "lucide-react";

// Demo data - akan diganti dengan data dari database
const demoArticles = [
  {
    title: "Mahkamah Konstitusi Putuskan Uji Materi UU Cipta Kerja di Bandung",
    slug: "mk-putuskan-uji-materi-uu-cipta-kerja",
    excerpt: "Mahkamah Konstitusi RI memutuskan hasil uji materi terhadap beberapa pasal dalam UU Cipta Kerja yang diajukan oleh serikat pekerja di Bandung.",
    featuredImage: null,
    category: { name: "Hukum Tata Negara", slug: "hukum-tata-negara" },
    author: { name: "Ahmad Fauzi" },
    publishedAt: new Date().toISOString(),
    readTime: 5,
    viewCount: 1250,
    verificationLabel: "VERIFIED",
  },
  {
    title: "Kasus Penipuan Online di Bandung Meningkat 40% Selama 2026",
    slug: "kasus-penipuan-online-bandung-meningkat",
    excerpt: "Data dari Polrestabes Bandung menunjukkan peningkatan signifikan kasus penipuan online sepanjang tahun 2026.",
    featuredImage: null,
    category: { name: "Hukum Pidana", slug: "hukum-pidana" },
    author: { name: "Siti Nurhaliza" },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    readTime: 4,
    viewCount: 890,
    verificationLabel: "VERIFIED",
  },
  {
    title: "Sengketa Lahan di Kawasan Bandung Utara Masuk Persidangan",
    slug: "sengketa-lahan-bandung-utara-persidangan",
    excerpt: "Sengketa lahan yang melibatkan warga dan pengembang properti di kawasan Bandung Utara akhirnya masuk tahap persidangan di PN Bandung.",
    featuredImage: null,
    category: { name: "Hukum Perdata", slug: "hukum-perdata" },
    author: { name: "Rizky Ramadhan" },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    readTime: 6,
    viewCount: 567,
    verificationLabel: "UNVERIFIED",
  },
  {
    title: "LBH Bandung: Pelanggaran HAM Buruh Pabrik Masih Terjadi",
    slug: "lbh-bandung-pelanggaran-ham-buruh",
    excerpt: "Lembaga Bantuan Hukum Bandung mencatat masih banyak pelanggaran hak asasi manusia terhadap buruh pabrik di wilayah industri Bandung.",
    featuredImage: null,
    category: { name: "HAM", slug: "ham" },
    author: { name: "Dewi Kartika" },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    readTime: 7,
    viewCount: 432,
    verificationLabel: "VERIFIED",
  },
  {
    title: "Analisis: Dampak Revisi KUHP Terhadap Penegakan Hukum di Daerah",
    slug: "analisis-dampak-revisi-kuhp",
    excerpt: "Revisi KUHP yang baru disahkan membawa perubahan signifikan dalam penegakan hukum di tingkat daerah, termasuk Bandung.",
    featuredImage: null,
    category: { name: "Opini", slug: "opini" },
    author: { name: "Prof. Dr. Hendra" },
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    readTime: 10,
    viewCount: 789,
    verificationLabel: "OPINION",
  },
  {
    title: "Pengadilan Negeri Bandung Tangani 200 Kasus Baru Bulan Ini",
    slug: "pn-bandung-tangani-200-kasus-baru",
    excerpt: "Pengadilan Negeri Kelas IA Bandung mencatat masuknya 200 kasus baru yang didominasi oleh perkara perdata dan pidana ringan.",
    featuredImage: null,
    category: { name: "Berita Bandung", slug: "berita-bandung" },
    author: { name: "Budi Santoso" },
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
    readTime: 3,
    viewCount: 345,
    verificationLabel: "VERIFIED",
  },
];

const tickerItems = [
  { title: "BREAKING: MK Tolak Gugatan Pilkada Bandung 2026", slug: "mk-tolak-gugatan-pilkada" },
  { title: "Polda Jabar Ungkap Sindikat Narkoba Internasional", slug: "polda-jabar-sindikat-narkoba" },
  { title: "DPR Sahkan RUU Perlindungan Data Pribadi Revisi", slug: "dpr-sahkan-ruu-pdp" },
];

const sidebarTrending = demoArticles.slice(0, 5).map((a) => ({
  title: a.title,
  slug: a.slug,
  category: a.category.name,
  publishedAt: new Date(a.publishedAt).toLocaleDateString("id-ID"),
  viewCount: a.viewCount,
}));

const categories = [
  { name: "Hukum Pidana", slug: "hukum-pidana", icon: Gavel, count: 45 },
  { name: "Hukum Perdata", slug: "hukum-perdata", icon: Scale, count: 38 },
  { name: "Hukum Tata Negara", slug: "hukum-tata-negara", icon: Landmark, count: 22 },
  { name: "HAM", slug: "ham", icon: Shield, count: 18 },
  { name: "Opini & Analisis", slug: "opini", icon: BookOpen, count: 31 },
  { name: "Berita Bandung", slug: "berita-bandung", icon: Users, count: 56 },
];

export default function HomePage() {
  const featured = demoArticles[0];
  const restArticles = demoArticles.slice(1);

  return (
    <>
      <NewsTicker items={tickerItems} />

      {/* Header Banner Ad Slot */}
      <div className="border-b border-gray-200 bg-gray-50 py-3 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="container-main">
          <div className="mx-auto h-[90px] max-w-[728px] rounded border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center dark:border-gray-600 dark:bg-gray-800">
            <span className="text-xs text-gray-400">IKLAN BANNER - 728x90</span>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Featured article */}
            <section className="mb-8">
              <ArticleCard {...featured} variant="featured" />
            </section>

            {/* Latest articles grid */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Berita Terkini
                </h2>
                <Link
                  href="/berita"
                  className="text-sm text-primary-500 hover:underline"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {restArticles.map((article) => (
                  <ArticleCard key={article.slug} {...article} />
                ))}
              </div>
            </section>

            {/* In-article ad */}
            <div className="my-8 rounded border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <span className="text-xs text-gray-400">IKLAN IN-ARTICLE - 728x90</span>
              <div className="mx-auto mt-2 h-[90px] max-w-[728px] bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Categories section */}
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Kategori Hukum
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/kategori/${cat.slug}`}
                      className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-500 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-900/30">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-gray-500">{cat.count} artikel</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              trending={sidebarTrending}
              recent={sidebarTrending.slice(0, 4)}
              popular={sidebarTrending}
            />
          </div>
        </div>
      </div>
    </>
  );
}
