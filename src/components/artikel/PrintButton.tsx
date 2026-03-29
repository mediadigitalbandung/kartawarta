"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-ghost rounded-full px-3 py-1.5 text-xs no-print"
      title="Cetak Artikel"
      aria-label="Cetak artikel ini"
    >
      <Printer size={14} />
      Cetak Artikel
    </button>
  );
}
