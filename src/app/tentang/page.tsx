import { Metadata } from "next";
import { Shield, Eye, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Jurnalis Hukum Bandung - Media hukum digital terpercaya untuk wilayah Bandung dan sekitarnya.",
};

export default function TentangPage() {
  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tentang Kami</h1>
        <div className="mt-2 h-1 w-16 bg-accent" />

        <div className="mt-8 space-y-6 font-serif text-[17px] leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            <strong>Jurnalis Hukum Bandung</strong> adalah media digital yang berfokus pada pemberitaan
            hukum di wilayah Bandung Raya dan Jawa Barat. Didirikan dengan visi menjadi sumber informasi
            hukum yang terpercaya, akurat, dan berimbang bagi masyarakat.
          </p>
          <p>
            Kami percaya bahwa akses terhadap informasi hukum yang berkualitas adalah hak setiap warga negara.
            Melalui jurnalisme investigatif dan analisis mendalam, kami berusaha menyajikan berita hukum yang
            tidak hanya informatif, tetapi juga edukatif.
          </p>
          <p>
            Tim redaksi kami terdiri dari jurnalis berpengalaman yang memiliki latar belakang pendidikan hukum
            dan jurnalistik. Setiap artikel yang kami terbitkan melalui proses verifikasi ketat untuk memastikan
            keakuratan dan keberimbangan informasi.
          </p>
        </div>

        {/* Values */}
        <div className="mt-12 grid grid-cols-2 gap-6">
          {[
            { icon: Shield, title: "Akurat & Terverifikasi", desc: "Setiap berita melalui proses fact-checking dan verifikasi sumber sebelum dipublikasikan." },
            { icon: Eye, title: "Transparan", desc: "Kami terbuka terhadap koreksi dan selalu mencantumkan sumber informasi dalam setiap artikel." },
            { icon: Users, title: "Berimbang", desc: "Kami menyajikan berita dari berbagai perspektif tanpa memihak salah satu pihak." },
            { icon: Award, title: "Profesional", desc: "Tim redaksi mematuhi Kode Etik Jurnalistik dan Pedoman Pemberitaan Media Siber." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                <Icon size={24} className="text-primary-500" />
                <h3 className="mt-3 font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-xl bg-gray-50 p-6 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Kontak</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Alamat Redaksi:</strong> Bandung, Jawa Barat, Indonesia</p>
            <p><strong>Email:</strong> redaksi@jurnalishukumbandung.com</p>
            <p><strong>Website:</strong> jurnalishukumbandung.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
