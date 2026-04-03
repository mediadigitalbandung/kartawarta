import type { Metadata } from "next";
import { Newsreader, Work_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Suspense } from "react";
import TopLoader from "@/components/layout/TopLoader";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport = { width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://kartawarta.com"
  ),
  title: {
    default: "Kartawarta - Media Digital Terpercaya",
    template: "%s | Kartawarta",
  },
  description:
    "Portal berita digital terpercaya. Menyajikan berita terkini, analisis mendalam, dan informasi akurat dan terverifikasi.",
  keywords: [
    "berita terkini",
    "kartawarta",
    "berita indonesia",
    "portal berita",
    "media digital",
    "berita terpercaya",
  ],
  authors: [{ name: "Kartawarta" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Kartawarta",
    images: [{ url: "/kartawarta-icon.png", width: 512, height: 512, alt: "Kartawarta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kartawarta - Media Digital Terpercaya",
    description: "Portal berita digital terpercaya. Menyajikan berita terkini, analisis mendalam, dan informasi akurat.",
    images: ["/kartawarta-icon.png"],
  },
  verification: {},
  category: "news",
  icons: {
    icon: "/kartawarta-icon.png",
    apple: "/kartawarta-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${newsreader.variable} ${workSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#002045" />
        <meta name="google" content="notranslate" />
      </head>
      <body className="flex min-h-screen flex-col font-sans bg-surface text-on-surface antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[200] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:text-sm"
          >
            Langsung ke konten
          </a>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          <PublicNav />
          <main id="main-content" className="flex-1">{children}</main>
          <PublicFooter />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
