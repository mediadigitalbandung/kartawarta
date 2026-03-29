"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Article page error:", error);
  }, [error]);

  return (
    <div className="container-main flex min-h-[60vh] flex-col items-center justify-center text-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-txt-primary mb-2">
        Gagal Memuat Artikel
      </h2>
      <p className="text-txt-secondary max-w-md mb-8">
        Artikel yang Anda cari tidak dapat dimuat saat ini. Silakan coba lagi.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          <RotateCcw className="h-4 w-4" />
          Coba Lagi
        </button>
        <Link href="/berita" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Semua Berita
        </Link>
      </div>
    </div>
  );
}
