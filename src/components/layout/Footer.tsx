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
  kontak: [
    { name: "Kontak Redaksi", href: "/kontak" },
    { name: "Kebijakan Privasi", href: "/privasi" },
    { name: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { name: "Pasang Iklan", href: "/kontak" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-txt-inverse">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-goto-green text-sm font-bold text-white">
                JH
              </span>
              <span className="text-lg font-bold text-txt-inverse">
                Jurnalis Hukum Bandung
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-txt-inverse/50">
              Media hukum digital terpercaya untuk wilayah Bandung dan
              sekitarnya. Menyajikan berita hukum yang akurat, berimbang, dan
              terverifikasi.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-txt-inverse/40">
              Kategori
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.kategori.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-txt-inverse/60 transition-colors duration-200 hover:text-goto-green"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tentang */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-txt-inverse/40">
              Tentang
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.tentang.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-txt-inverse/60 transition-colors duration-200 hover:text-goto-green"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-txt-inverse/40">
              Kontak
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.kontak.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-txt-inverse/60 transition-colors duration-200 hover:text-goto-green"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-txt-inverse/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-sm text-txt-inverse/40">
              &copy; {new Date().getFullYear()} Jurnalis Hukum Bandung. Seluruh
              hak cipta dilindungi.
            </p>
            <p className="text-sm text-txt-inverse/40">
              Anggota{" "}
              <span className="font-medium text-txt-inverse/60">
                Dewan Pers Indonesia
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
