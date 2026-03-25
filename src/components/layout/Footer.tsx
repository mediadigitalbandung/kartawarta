import Link from "next/link";

const footerLinks = {
  kategori: [
    { name: "Hukum Pidana", href: "/kategori/hukum-pidana" },
    { name: "Hukum Perdata", href: "/kategori/hukum-perdata" },
    { name: "Hukum Tata Negara", href: "/kategori/hukum-tata-negara" },
    { name: "HAM", href: "/kategori/ham" },
    { name: "Opini", href: "/kategori/opini" },
  ],
  tentang: [
    { name: "Tentang Kami", href: "/tentang" },
    { name: "Redaksi", href: "/redaksi" },
    { name: "Kode Etik", href: "/kode-etik" },
    { name: "Pedoman Media", href: "/pedoman-media" },
    { name: "Koreksi & Klarifikasi", href: "/koreksi" },
  ],
  lainnya: [
    { name: "Kontak", href: "/kontak" },
    { name: "Kebijakan Privasi", href: "/privasi" },
    { name: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { name: "Pasang Iklan", href: "/iklan" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container-main py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-lg font-bold text-white">
                JH
              </div>
              <div>
                <h3 className="font-bold text-primary-900 dark:text-white">
                  Jurnalis Hukum
                </h3>
                <p className="text-xs text-gray-500">Bandung</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Media hukum digital terpercaya untuk wilayah Bandung dan sekitarnya.
              Menyajikan berita hukum yang akurat, berimbang, dan terverifikasi.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Kategori
            </h4>
            <ul className="space-y-2">
              {footerLinks.kategori.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tentang */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Tentang
            </h4>
            <ul className="space-y-2">
              {footerLinks.tentang.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lainnya */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Lainnya
            </h4>
            <ul className="space-y-2">
              {footerLinks.lainnya.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Jurnalis Hukum Bandung. Seluruh hak cipta dilindungi.</p>
            <p>
              Anggota{" "}
              <span className="font-medium">Dewan Pers Indonesia</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
