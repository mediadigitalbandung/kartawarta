"use client";

import Link from "next/link";
import { ArrowUp, Send } from "lucide-react";

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
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container-main py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-gradient text-lg font-extrabold text-white shadow-lg shadow-primary-500/20">
                JH
              </div>
              <div>
                <h3 className="font-bold text-white">Jurnalis Hukum</h3>
                <p className="text-xs text-gray-500">Bandung</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
              Media hukum digital terpercaya untuk wilayah Bandung dan sekitarnya.
              Menyajikan berita hukum yang akurat, berimbang, dan terverifikasi.
            </p>

            {/* Social Media Icons */}
            <div className="mt-5 flex items-center gap-3">
              {["X", "FB", "IG", "YT"].map((platform) => (
                <div
                  key={platform}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800/80 text-xs font-semibold text-gray-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:text-white"
                >
                  {platform}
                </div>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-white">Berlangganan Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <button className="flex items-center justify-center rounded-xl bg-primary-gradient px-4 py-2.5 text-white shadow-md shadow-primary-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/30">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
              Kategori
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.kategori.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-gray-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tentang */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
              Tentang
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.tentang.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-gray-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lainnya */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
              Lainnya
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.lainnya.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-gray-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Jurnalis Hukum Bandung. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-500">
              Anggota <span className="font-medium text-gray-400">Dewan Pers Indonesia</span>
            </p>
            <button
              onClick={scrollToTop}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-gray-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:text-white"
              aria-label="Kembali ke atas"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
