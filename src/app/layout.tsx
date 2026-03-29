import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Suspense } from "react";
import TopLoader from "@/components/layout/TopLoader";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export const viewport = { width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  title: {
    default: "Jurnalis Hukum Bandung - Media Hukum Digital Terpercaya",
    template: "%s | Jurnalis Hukum Bandung",
  },
  description:
    "Portal berita hukum terpercaya di Bandung. Menyajikan berita hukum pidana, perdata, tata negara, HAM, dan analisis hukum yang akurat dan terverifikasi.",
  keywords: [
    "berita hukum",
    "hukum bandung",
    "jurnalis hukum",
    "berita hukum bandung",
    "hukum pidana",
    "hukum perdata",
  ],
  authors: [{ name: "Jurnalis Hukum Bandung" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Jurnalis Hukum Bandung",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col font-sans bg-surface text-txt-primary">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[200] focus:bg-goto-green focus:text-white focus:px-4 focus:py-2 focus:text-sm"
          >
            Langsung ke konten
          </a>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          <PublicNav />
          <main id="main-content" className="flex-1">{children}</main>
          <PublicFooter />
        </Providers>
      </body>
    </html>
  );
}
