import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
    <html lang="id" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
