import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Hubungi redaksi Kartawarta untuk pertanyaan, masukan, kerjasama iklan, atau laporan berita. Kami siap melayani Anda.",
  alternates: { canonical: "/kontak" },
  openGraph: {
    title: "Hubungi Kami — Kartawarta",
    description: "Hubungi redaksi Kartawarta untuk pertanyaan, masukan, kerjasama iklan, atau laporan berita.",
    type: "website",
  },
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
