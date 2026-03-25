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
    <footer className="bg-press text-newsprint">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div>
              <span className="font-sans text-lg text-newsprint font-normal">
                Jurnalis Hukum
              </span>
              <span className="ml-1.5 font-sans text-lg text-newsprint font-bold">
                Bandung
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm font-serif italic leading-relaxed text-newsprint/50">
              Media hukum digital terpercaya untuk wilayah Bandung dan
              sekitarnya. Menyajikan berita hukum yang akurat, berimbang, dan
              terverifikasi.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="mb-4 font-mono text-kicker uppercase tracking-widest text-newsprint/40">
              Kategori
            </h4>
            <ul className="space-y-2">
              {footerLinks.kategori.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-newsprint/60 transition-colors duration-200 hover:text-sage"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tentang */}
          <div>
            <h4 className="mb-4 font-mono text-kicker uppercase tracking-widest text-newsprint/40">
              Tentang
            </h4>
            <ul className="space-y-2">
              {footerLinks.tentang.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-newsprint/60 transition-colors duration-200 hover:text-sage"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="mb-4 font-mono text-kicker uppercase tracking-widest text-newsprint/40">
              Kontak
            </h4>
            <ul className="space-y-2">
              {footerLinks.kontak.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-newsprint/60 transition-colors duration-200 hover:text-sage"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-newsprint/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-sm text-newsprint/40">
              &copy; {new Date().getFullYear()} Jurnalis Hukum Bandung. Seluruh
              hak cipta dilindungi.
            </p>
            <p className="text-sm text-newsprint/40">
              Anggota{" "}
              <span className="font-medium text-newsprint/60">
                Dewan Pers Indonesia
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
