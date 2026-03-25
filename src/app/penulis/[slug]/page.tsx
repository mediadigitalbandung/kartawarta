import { Metadata } from "next";
import ArticleCard from "@/components/artikel/ArticleCard";
import { FileText, Eye, Calendar } from "lucide-react";

// Demo data
const demoAuthor = {
  name: "Ahmad Fauzi",
  bio: "Jurnalis hukum senior dengan pengalaman 10 tahun meliput berita hukum di wilayah Bandung. Spesialisasi: Hukum Tata Negara dan Konstitusi.",
  role: "Jurnalis Senior",
  specialization: "Hukum Tata Negara",
  totalArticles: 45,
  totalViews: 24500,
  joinedDate: "Januari 2026",
};

const demoArticles = [
  {
    title: "MK Putuskan Uji Materi UU Cipta Kerja di Bandung",
    slug: "mk-putuskan-uji-materi-uu-cipta-kerja",
    excerpt: "MK memutuskan hasil uji materi terhadap beberapa pasal dalam UU Cipta Kerja.",
    featuredImage: null,
    category: { name: "Hukum Tata Negara", slug: "hukum-tata-negara" },
    author: { name: "Ahmad Fauzi" },
    publishedAt: new Date().toISOString(),
    readTime: 5,
    viewCount: 1250,
    verificationLabel: "VERIFIED",
  },
  {
    title: "Sidang Uji Formil UU Omnibus Law Dimulai",
    slug: "sidang-uji-formil-uu-omnibus",
    excerpt: "MK mulai menggelar sidang uji formil terhadap UU Omnibus Law.",
    featuredImage: null,
    category: { name: "Hukum Tata Negara", slug: "hukum-tata-negara" },
    author: { name: "Ahmad Fauzi" },
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    readTime: 6,
    viewCount: 890,
    verificationLabel: "VERIFIED",
  },
];

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `${demoAuthor.name} - Penulis`,
    description: demoAuthor.bio,
  };
}

export default function PenulisPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container-main py-8">
      {/* Author profile */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-100 text-4xl font-bold text-primary-500">
            {demoAuthor.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {demoAuthor.name}
            </h1>
            <p className="mt-1 text-sm text-primary-500">{demoAuthor.role}</p>
            {demoAuthor.specialization && (
              <p className="text-sm text-gray-500">
                Spesialisasi: {demoAuthor.specialization}
              </p>
            )}
            <p className="mt-3 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              {demoAuthor.bio}
            </p>

            <div className="mt-4 flex justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <FileText size={14} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {demoAuthor.totalArticles}
                </span>{" "}
                artikel
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Eye size={14} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {demoAuthor.totalViews.toLocaleString("id-ID")}
                </span>{" "}
                views
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar size={14} />
                Bergabung {demoAuthor.joinedDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles by author */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Artikel oleh {demoAuthor.name}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {demoArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
}
