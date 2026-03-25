import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Susunan Redaksi",
  description: "Susunan redaksi Jurnalis Hukum Bandung.",
};

const redaksi = [
  { position: "Pemimpin Redaksi", name: "—", desc: "Bertanggung jawab atas keseluruhan isi pemberitaan" },
  { position: "Wakil Pemimpin Redaksi", name: "—", desc: "Membantu pemimpin redaksi dalam operasional harian" },
  { position: "Editor Kepala", name: "—", desc: "Mengelola proses editorial dan approval artikel" },
  { position: "Editor", name: "—", desc: "Menyunting dan memeriksa kelayakan artikel sebelum terbit" },
  { position: "Jurnalis Senior", name: "—", desc: "Jurnalis berpengalaman dengan hak publish langsung" },
  { position: "Tim Jurnalis", name: "—", desc: "Meliput dan menulis berita hukum di lapangan" },
  { position: "Tim IT & Pengembangan", name: "Aureon", desc: "Pengembangan dan pemeliharaan platform digital" },
];

export default function RedaksiPage() {
  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Susunan Redaksi</h1>
        <div className="mt-2 h-1 w-16 bg-accent" />

        <p className="mt-6 text-gray-600 dark:text-gray-400">
          Berikut susunan redaksi Jurnalis Hukum Bandung yang bertanggung jawab atas
          seluruh proses produksi dan distribusi konten.
        </p>

        <div className="mt-8 space-y-4">
          {redaksi.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                {item.name === "—" ? (i + 1) : item.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                  {item.position}
                </p>
                <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-gray-50 p-5 dark:bg-gray-900">
          <p className="text-sm text-gray-500">
            Susunan redaksi ini akan diperbarui seiring dengan perkembangan organisasi.
            Untuk informasi lebih lanjut, silakan hubungi{" "}
            <a href="mailto:redaksi@jurnalishukumbandung.com" className="text-primary-500 hover:underline">
              redaksi@jurnalishukumbandung.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
