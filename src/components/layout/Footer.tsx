"use client";

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
    { name: "Koreksi & Klarifikasi", href: "/kode-etik" },
  ],
  lainnya: [
    { name: "Kontak", href: "/kontak" },
    { name: "Kebijakan Privasi", href: "/privasi" },
    { name: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { name: "Pasang Iklan", href: "/kontak" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-bg-secondary">
      <div className="container-main py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + description */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white">
                JH
              </div>
              <div>
                <span className="text-sm font-bold text-white">
                  Jurnalis Hukum
                </span>
                <p className="text-xs text-gold">Bandung</p>
              </div>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
              Media hukum digital terpercaya untuk wilayah Bandung dan
              sekitarnya. Menyajikan berita hukum yang akurat, berimbang, dan
              terverifikasi.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
              Kategori
            </h4>
            <ul className="space-y-2">
              {footerLinks.kategori.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tentang */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
              Tentang
            </h4>
            <ul className="space-y-2">
              {footerLinks.tentang.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lainnya */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
              Lainnya
            </h4>
            <ul className="space-y-2">
              {footerLinks.lainnya.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Jurnalis Hukum Bandung. Seluruh
              hak cipta dilindungi.
            </p>
            <p className="text-xs text-text-muted">
              Anggota{" "}
              <span className="font-medium text-text-secondary">
                Dewan Pers Indonesia
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
