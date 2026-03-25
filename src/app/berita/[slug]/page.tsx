import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Calendar,
  Clock,
  Eye,
  User,
  Share2,
  Flag,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import CopyProtection from "@/components/artikel/CopyProtection";
import Sidebar from "@/components/layout/Sidebar";
import ArticleCard from "@/components/artikel/ArticleCard";

// Demo - akan diganti dengan fetch dari database
const demoArticle = {
  title: "Mahkamah Konstitusi Putuskan Uji Materi UU Cipta Kerja di Bandung",
  slug: "mk-putuskan-uji-materi-uu-cipta-kerja",
  content: `
    <p>BANDUNG - Mahkamah Konstitusi Republik Indonesia telah memutuskan hasil uji materi terhadap beberapa pasal dalam Undang-Undang Cipta Kerja yang diajukan oleh serikat pekerja di Bandung. Putusan ini menjadi perhatian luas karena berdampak pada jutaan pekerja di seluruh Indonesia.</p>

    <h2>Latar Belakang Gugatan</h2>
    <p>Gugatan ini diajukan oleh Konfederasi Serikat Pekerja Bandung (KSPB) yang mewakili lebih dari 50.000 pekerja di wilayah Bandung Raya. Mereka menilai beberapa pasal dalam UU Cipta Kerja bertentangan dengan UUD 1945, khususnya terkait hak-hak pekerja.</p>

    <blockquote>"Kami mengajukan gugatan ini demi melindungi hak-hak fundamental pekerja yang dijamin oleh konstitusi. Beberapa pasal dalam UU Cipta Kerja telah merugikan posisi tawar pekerja," ujar Ketua KSPB, Ahmad Fauzi.</blockquote>

    <h2>Isi Putusan MK</h2>
    <p>Dalam putusannya, MK memutuskan bahwa tiga dari lima pasal yang digugat dinyatakan bertentangan dengan UUD 1945. Putusan ini dibacakan oleh Ketua MK dalam sidang pleno yang dihadiri oleh sembilan hakim konstitusi.</p>

    <p>Pasal-pasal yang dibatalkan antara lain:</p>
    <ol>
      <li>Pasal 59 ayat (2) tentang perjanjian kerja waktu tertentu</li>
      <li>Pasal 66 ayat (1) tentang alih daya (outsourcing)</li>
      <li>Pasal 77 ayat (3) tentang waktu kerja lembur</li>
    </ol>

    <h2>Dampak Putusan</h2>
    <p>Putusan MK ini memiliki dampak signifikan terhadap dunia ketenagakerjaan di Indonesia, khususnya di Bandung sebagai salah satu kota industri terbesar di Jawa Barat. Para ahli hukum ketenagakerjaan menilai putusan ini sebagai langkah maju dalam perlindungan hak pekerja.</p>

    <p>Prof. Dr. Hendra Wijaya, pakar hukum ketenagakerjaan dari Universitas Padjadjaran, menjelaskan bahwa putusan ini akan memaksa pemerintah untuk merevisi beberapa regulasi turunan dari UU Cipta Kerja.</p>

    <blockquote>"Putusan MK ini menegaskan bahwa hak-hak pekerja tidak bisa dikurangi melalui undang-undang yang prosesnya bermasalah. Ini adalah kemenangan bagi demokrasi dan konstitusionalisme," kata Prof. Hendra.</blockquote>

    <h2>Reaksi Pihak Terkait</h2>
    <p>Pemerintah melalui Kementerian Ketenagakerjaan menyatakan akan menghormati putusan MK dan segera melakukan penyesuaian regulasi. Sementara itu, kalangan pengusaha menyatakan kekhawatiran terhadap dampak putusan ini terhadap iklim investasi.</p>

    <p>Asosiasi Pengusaha Indonesia (APINDO) Jabar meminta agar implementasi putusan MK dilakukan secara bertahap untuk menghindari gejolak di sektor industri.</p>
  `,
  excerpt: "Mahkamah Konstitusi RI memutuskan hasil uji materi terhadap beberapa pasal dalam UU Cipta Kerja yang diajukan oleh serikat pekerja di Bandung.",
  featuredImage: null,
  category: { name: "Hukum Tata Negara", slug: "hukum-tata-negara" },
  author: { name: "Ahmad Fauzi", bio: "Jurnalis hukum senior dengan pengalaman 10 tahun meliput berita hukum di wilayah Bandung.", avatar: null },
  publishedAt: new Date().toISOString(),
  readTime: 5,
  viewCount: 1250,
  verificationLabel: "VERIFIED" as const,
  sources: [
    { name: "Ahmad Fauzi", title: "Ketua KSPB", institution: "Konfederasi Serikat Pekerja Bandung" },
    { name: "Prof. Dr. Hendra Wijaya", title: "Pakar Hukum Ketenagakerjaan", institution: "Universitas Padjadjaran" },
  ],
  tags: [
    { name: "Mahkamah Konstitusi", slug: "mahkamah-konstitusi" },
    { name: "UU Cipta Kerja", slug: "uu-cipta-kerja" },
    { name: "Ketenagakerjaan", slug: "ketenagakerjaan" },
  ],
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: demoArticle.title,
    description: demoArticle.excerpt,
    openGraph: {
      title: demoArticle.title,
      description: demoArticle.excerpt || "",
      type: "article",
      publishedTime: demoArticle.publishedAt,
      authors: [demoArticle.author.name],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = demoArticle;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jurnalishukumbandung.com";

  return (
    <>
      <CopyProtection
        authorName={article.author.name}
        articleUrl={`${appUrl}/berita/${params.slug}`}
        articleTitle={article.title}
      />

      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-500">Beranda</Link>
          <ChevronRight size={14} />
          <Link href={`/kategori/${article.category.slug}`} className="hover:text-primary-500">
            {article.category.name}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-400 truncate max-w-[200px]">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Category & verification */}
            <div className="mb-3 flex items-center gap-2">
              <Link
                href={`/kategori/${article.category.slug}`}
                className="rounded bg-accent px-2.5 py-1 text-xs font-bold uppercase text-white"
              >
                {article.category.name}
              </Link>
              {article.verificationLabel === "VERIFIED" && (
                <span className="badge badge-verified flex items-center gap-1">
                  <CheckCircle size={12} /> Terverifikasi
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl dark:text-white">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                <Link href="#author" className="font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300">
                  {article.author.name}
                </Link>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {article.readTime} menit baca
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> {article.viewCount.toLocaleString("id-ID")} views
              </span>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl">
                <Image src={article.featuredImage} alt={article.title} fill className="object-cover" />
              </div>
            )}

            {/* Share buttons */}
            <div className="mt-6 flex items-center gap-2 border-y border-gray-200 py-3 dark:border-gray-800">
              <Share2 size={14} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-500">BAGIKAN:</span>
              <div className="flex gap-1.5">
                {["WhatsApp", "Twitter", "Facebook", "Telegram"].map((platform) => (
                  <button
                    key={platform}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-primary-500 hover:text-white dark:bg-gray-800 dark:text-gray-400"
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Article content */}
            <div
              className="article-content mt-6 font-serif text-[17px] leading-[1.8] text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Sources */}
            {article.sources.length > 0 && (
              <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Sumber & Narasumber
                </h3>
                <ul className="space-y-1.5">
                  {article.sources.map((source, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>{source.name}</strong>
                      {source.title && ` — ${source.title}`}
                      {source.institution && `, ${source.institution}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500">TAGS:</span>
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-primary-500 hover:text-white dark:bg-gray-800 dark:text-gray-400"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>

            {/* Report button */}
            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent">
                <Flag size={12} />
                Laporkan Berita Ini
              </button>
            </div>

            {/* Author box */}
            <div id="author" className="mt-8 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-500">
                  {article.author.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{article.author.name}</h3>
                  <p className="text-sm text-primary-500">Jurnalis</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {article.author.bio}
                  </p>
                  <Link
                    href={`/penulis/${article.author.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="mt-2 inline-block text-sm text-primary-500 hover:underline"
                  >
                    Lihat semua artikel &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              trending={[
                { title: "Kasus Penipuan Online Meningkat", slug: "kasus-penipuan", category: "Hukum Pidana", publishedAt: "25 Mar 2026" },
                { title: "Sengketa Lahan Bandung Utara", slug: "sengketa-lahan", category: "Hukum Perdata", publishedAt: "25 Mar 2026" },
                { title: "LBH Soroti Pelanggaran HAM", slug: "lbh-pelanggaran", category: "HAM", publishedAt: "24 Mar 2026" },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
