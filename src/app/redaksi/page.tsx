import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Susunan Redaksi",
  description: "Susunan redaksi Jurnalis Hukum Bandung.",
};

const redaksi = [
  { position: "Pemimpin Redaksi", name: "\u2014", desc: "Bertanggung jawab atas keseluruhan isi pemberitaan" },
  { position: "Wakil Pemimpin Redaksi", name: "\u2014", desc: "Membantu pemimpin redaksi dalam operasional harian" },
  { position: "Editor Kepala", name: "\u2014", desc: "Mengelola proses editorial dan approval artikel" },
  { position: "Editor", name: "\u2014", desc: "Menyunting dan memeriksa kelayakan artikel sebelum terbit" },
  { position: "Jurnalis Senior", name: "\u2014", desc: "Jurnalis berpengalaman dengan hak publish langsung" },
  { position: "Tim Jurnalis", name: "\u2014", desc: "Meliput dan menulis berita hukum di lapangan" },
  { position: "Tim IT & Pengembangan", name: "Aureon", desc: "Pengembangan dan pemeliharaan platform digital" },
];

export default function RedaksiPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="container-main py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-txt-primary">
            <span className="block h-8 w-[3px] rounded-full bg-goto-green" />
            Susunan Redaksi
          </h1>

          <p className="mt-6 text-txt-secondary">
            Berikut susunan redaksi Jurnalis Hukum Bandung yang bertanggung jawab atas
            seluruh proses produksi dan distribusi konten.
          </p>

          <div className="mt-8 space-y-4">
            {redaksi.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-[12px] border border-border bg-surface p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-goto-green text-lg font-bold text-white">
                  {item.name === "\u2014" ? (i + 1) : item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-goto-green">
                    {item.position}
                  </p>
                  <p className="font-bold text-txt-primary">{item.name}</p>
                  <p className="text-sm text-txt-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[12px] border border-border bg-surface-secondary p-5">
            <p className="text-sm text-txt-muted">
              Susunan redaksi ini akan diperbarui seiring dengan perkembangan organisasi.
              Untuk informasi lebih lanjut, silakan hubungi{" "}
              <a href="mailto:redaksi@jurnalishukumbandung.com" className="text-goto-green hover:underline">
                redaksi@jurnalishukumbandung.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
