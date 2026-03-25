import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kode Etik Jurnalistik",
  description: "Kode etik jurnalistik yang dianut oleh Jurnalis Hukum Bandung dalam menjalankan kegiatan pers.",
};

export default function KodeEtikPage() {
  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kode Etik Jurnalistik</h1>
        <div className="mt-2 h-1 w-16 bg-accent" />

        <div className="mt-8 space-y-6 font-serif text-[17px] leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            Jurnalis Hukum Bandung menganut dan mematuhi <strong>Kode Etik Jurnalistik</strong> yang
            ditetapkan oleh Dewan Pers Indonesia, serta <strong>Pedoman Pemberitaan Media Siber</strong>.
          </p>

          <h2 className="!mt-10 text-xl font-bold text-gray-900 dark:text-white">Pasal 1</h2>
          <p>Wartawan Indonesia bersikap independen, menghasilkan berita yang akurat, berimbang, dan tidak beritikad buruk.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 2</h2>
          <p>Wartawan Indonesia menempuh cara-cara yang profesional dalam melaksanakan tugas jurnalistik.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 3</h2>
          <p>Wartawan Indonesia selalu menguji informasi, memberitakan secara berimbang, tidak mencampurkan fakta dan opini yang menghakimi, serta menerapkan asas praduga tak bersalah.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 4</h2>
          <p>Wartawan Indonesia tidak membuat berita bohong, fitnah, sadis, dan cabul.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 5</h2>
          <p>Wartawan Indonesia tidak menyebutkan dan menyiarkan identitas korban kejahatan susila dan tidak menyebutkan identitas anak yang menjadi pelaku kejahatan.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 6</h2>
          <p>Wartawan Indonesia tidak menyalahgunakan profesi dan tidak menerima suap.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 7</h2>
          <p>Wartawan Indonesia memiliki hak tolak untuk melindungi narasumber yang tidak bersedia diketahui identitas maupun keberadaannya, menghargai ketentuan embargo, informasi latar belakang, dan off the record sesuai dengan kesepakatan.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 8</h2>
          <p>Wartawan Indonesia tidak menulis atau menyiarkan berita berdasarkan prasangka atau diskriminasi terhadap seseorang atas dasar perbedaan suku, ras, warna kulit, agama, jenis kelamin, dan bahasa serta tidak merendahkan martabat orang lemah, miskin, sakit, cacat jiwa atau cacat jasmani.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 9</h2>
          <p>Wartawan Indonesia menghormati hak narasumber tentang kehidupan pribadinya, kecuali untuk kepentingan publik.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 10</h2>
          <p>Wartawan Indonesia segera mencabut, meralat, dan memperbaiki berita yang keliru dan tidak akurat disertai dengan permintaan maaf kepada pembaca, pendengar, dan atau pemirsa.</p>

          <h2 className="!mt-8 text-xl font-bold text-gray-900 dark:text-white">Pasal 11</h2>
          <p>Wartawan Indonesia melayani hak jawab dan hak koreksi secara proporsional.</p>

          <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Sumber:</strong> Kode Etik Jurnalistik yang ditetapkan Dewan Pers melalui
              Peraturan Dewan Pers Nomor: 6/Peraturan-DP/V/2008 tentang Pengesahan Surat Keputusan
              Dewan Pers Nomor 03/SK-DP/III/2006 tentang Kode Etik Jurnalistik sebagai Peraturan Dewan Pers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
