// Seed 120 articles (10 per category × 12 categories)
// Run: node scripts/seed-articles.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const articles = {
  "hukum": [
    { title: "MA Tolak Kasasi Terdakwa Korupsi Dana Desa Rp 8 Miliar", excerpt: "Mahkamah Agung menolak permohonan kasasi terdakwa kasus korupsi dana desa yang merugikan negara Rp 8 miliar." },
    { title: "RUU Perampasan Aset Resmi Disahkan DPR, Ini Isi Pentingnya", excerpt: "DPR secara resmi mengesahkan RUU Perampasan Aset menjadi undang-undang setelah pembahasan selama dua tahun." },
    { title: "KPK Tetapkan Mantan Gubernur sebagai Tersangka Suap Proyek Infrastruktur", excerpt: "KPK menetapkan mantan gubernur sebagai tersangka dalam kasus suap terkait proyek infrastruktur senilai Rp 50 miliar." },
    { title: "Hakim Agung Baru Dilantik, Fokus pada Reformasi Peradilan", excerpt: "Lima hakim agung baru resmi dilantik dan menyatakan komitmen untuk melakukan reformasi di lingkungan peradilan." },
    { title: "Polri Ungkap Sindikat Penipuan Online Internasional di Batam", excerpt: "Polri berhasil mengungkap sindikat penipuan online internasional yang beroperasi dari Batam dengan kerugian ratusan miliar." },
    { title: "MK Putuskan Batas Usia Calon Kepala Daerah Tetap 30 Tahun", excerpt: "Mahkamah Konstitusi memutuskan batas usia minimal calon kepala daerah tetap 30 tahun, menolak gugatan pemohon." },
    { title: "Kejagung Sita Aset Tersangka TPPU Senilai Rp 1,2 Triliun", excerpt: "Kejaksaan Agung menyita aset tersangka tindak pidana pencucian uang senilai Rp 1,2 triliun di berbagai lokasi." },
    { title: "Bantuan Hukum Gratis untuk Masyarakat Miskin Diperluas ke 100 Kabupaten", excerpt: "Pemerintah memperluas program bantuan hukum gratis untuk masyarakat miskin ke 100 kabupaten di seluruh Indonesia." },
    { title: "Sidang Perdana Kasus Mafia Tanah di Jakarta Selatan Digelar", excerpt: "Pengadilan Negeri Jakarta Selatan menggelar sidang perdana kasus mafia tanah yang melibatkan oknum pejabat BPN." },
    { title: "Indonesia Ratifikasi Konvensi Internasional Anti Penyiksaan", excerpt: "Indonesia resmi meratifikasi konvensi internasional anti penyiksaan, memperkuat komitmen perlindungan HAM." },
  ],
  "bisnis-ekonomi": [
    { title: "Bank Indonesia Pertahankan Suku Bunga Acuan di 5,75 Persen", excerpt: "Bank Indonesia memutuskan untuk mempertahankan suku bunga acuan BI Rate di level 5,75 persen pada rapat dewan gubernur." },
    { title: "Rupiah Menguat ke Rp 15.800 per Dolar AS, Tertinggi dalam 3 Bulan", excerpt: "Nilai tukar rupiah terhadap dolar AS menguat signifikan ke level Rp 15.800, tertinggi dalam tiga bulan terakhir." },
    { title: "IHSG Tembus 7.500, Didorong Saham Perbankan dan Tambang", excerpt: "Indeks Harga Saham Gabungan berhasil menembus level 7.500 didorong oleh penguatan saham sektor perbankan dan pertambangan." },
    { title: "Startup Fintech Lokal Raih Pendanaan Seri C Senilai US$ 200 Juta", excerpt: "Startup fintech asal Indonesia berhasil meraih pendanaan seri C senilai US$ 200 juta dari konsorsium investor global." },
    { title: "Neraca Perdagangan Maret 2026 Surplus US$ 4,2 Miliar", excerpt: "BPS mencatat neraca perdagangan Indonesia pada Maret 2026 surplus US$ 4,2 miliar, didorong ekspor komoditas." },
    { title: "Pemerintah Terbitkan Sukuk Ritel SR-021, Kupon 6,4 Persen", excerpt: "Pemerintah menerbitkan Sukuk Ritel seri SR-021 dengan kupon 6,4 persen per tahun, masa penawaran dua minggu." },
    { title: "Harga Emas Antam Tembus Rp 1,5 Juta per Gram, Rekor Tertinggi", excerpt: "Harga emas batangan produksi PT Antam menembus Rp 1,5 juta per gram, mencatatkan rekor tertinggi sepanjang sejarah." },
    { title: "Investasi Asing Kuartal I 2026 Naik 15 Persen Year-on-Year", excerpt: "BKPM mencatat realisasi investasi asing pada kuartal I 2026 naik 15 persen dibanding periode yang sama tahun lalu." },
    { title: "Pertamina Umumkan Penyesuaian Harga BBM Non-Subsidi April 2026", excerpt: "PT Pertamina mengumumkan penyesuaian harga BBM non-subsidi yang berlaku mulai 1 April 2026." },
    { title: "E-Commerce Indonesia Catat Transaksi Rp 500 Triliun di Q1 2026", excerpt: "Asosiasi E-Commerce Indonesia mencatat total transaksi e-commerce nasional mencapai Rp 500 triliun pada kuartal pertama 2026." },
  ],
  "olahraga": [
    { title: "Timnas Indonesia Lolos ke Piala Dunia 2030, Sejarah Baru Sepak Bola", excerpt: "Timnas Indonesia resmi lolos ke Piala Dunia 2030 setelah mengalahkan Australia 2-1 di leg kedua playoff." },
    { title: "Greysia/Apriyani Raih Emas BWF World Tour Finals 2026", excerpt: "Pasangan ganda putri Indonesia Greysia/Apriyani meraih medali emas di BWF World Tour Finals 2026 di Bangkok." },
    { title: "Persib Bandung Juara Liga 1 Musim 2025/2026", excerpt: "Persib Bandung berhasil meraih gelar juara Liga 1 musim 2025/2026 setelah mengalahkan Persija Jakarta di laga terakhir." },
    { title: "Atlet Angkat Besi Indonesia Pecahkan Rekor Dunia di Kejuaraan Asia", excerpt: "Atlet angkat besi Indonesia berhasil memecahkan rekor dunia di Kejuaraan Asia yang berlangsung di Tashkent, Uzbekistan." },
    { title: "MotoGP Mandalika 2026: Pembalap Indonesia Finis di Posisi 5 Besar", excerpt: "Pembalap Indonesia berhasil finis di posisi 5 besar pada balapan MotoGP Mandalika 2026, pencapaian terbaik sepanjang sejarah." },
    { title: "PSSI Luncurkan Program Akademi Sepak Bola di 34 Provinsi", excerpt: "PSSI resmi meluncurkan program akademi sepak bola yang tersebar di 34 provinsi untuk mencetak talenta muda." },
    { title: "Petinju Indonesia Rebut Sabuk WBC Asia, Siap Tantang Juara Dunia", excerpt: "Petinju Indonesia berhasil merebut sabuk juara WBC Asia dan bersiap menantang juara dunia tahun depan." },
    { title: "PON XXI Papua Barat Resmi Dibuka, 34 Provinsi Berpartisipasi", excerpt: "Pekan Olahraga Nasional XXI di Papua Barat resmi dibuka dengan partisipasi 34 provinsi dan lebih dari 6.000 atlet." },
    { title: "Lari Marathon Jakarta 2026 Diikuti 50.000 Peserta dari 40 Negara", excerpt: "Jakarta Marathon 2026 mencatat rekor peserta terbanyak dengan 50.000 pelari dari 40 negara." },
    { title: "Timnas Basket Indonesia Kalahkan Filipina di FIBA Asia Cup Qualifier", excerpt: "Timnas basket Indonesia mencatatkan kemenangan bersejarah atas Filipina di kualifikasi FIBA Asia Cup 2026." },
  ],
  "hiburan": [
    { title: "Film Indonesia 'Tanah Air' Masuk Nominasi Oscar 2027", excerpt: "Film Indonesia berjudul 'Tanah Air' berhasil masuk nominasi Best International Feature Film di Academy Awards 2027." },
    { title: "Konser Coldplay Jakarta 2026 Sold Out dalam 15 Menit", excerpt: "Tiket konser Coldplay di Stadion GBK Jakarta untuk 2026 habis terjual dalam waktu 15 menit." },
    { title: "Serial Netflix Asal Indonesia Masuk Top 10 Global", excerpt: "Serial Netflix produksi Indonesia berhasil masuk daftar 10 besar tontonan paling populer secara global." },
    { title: "Penyanyi Dangdut Indonesia Raih Penghargaan di Asia Music Awards", excerpt: "Penyanyi dangdut Indonesia meraih penghargaan Best Southeast Asian Artist di Asia Music Awards 2026." },
    { title: "Festival Film Indonesia 2026 Hadirkan 150 Film dari 20 Negara", excerpt: "Festival Film Indonesia 2026 menghadirkan 150 film dari 20 negara dengan tema 'Sinema Tanpa Batas'." },
    { title: "Webtoon Indonesia 'Nusantara Knights' Diadaptasi Jadi Film Hollywood", excerpt: "Webtoon populer Indonesia 'Nusantara Knights' resmi diadaptasi menjadi film Hollywood oleh studio besar." },
    { title: "Musisi Indie Bandung Viral di TikTok, Lagu Ditonton 500 Juta Kali", excerpt: "Musisi indie asal Bandung mendadak viral setelah lagunya ditonton lebih dari 500 juta kali di TikTok." },
    { title: "Teater Tradisional Indonesia Tampil di Edinburgh Fringe Festival", excerpt: "Kelompok teater tradisional Indonesia tampil memukau di Edinburgh Fringe Festival, festival seni terbesar di dunia." },
    { title: "Game Developer Lokal Rilis Game RPG yang Raih Rating 9/10 di Steam", excerpt: "Studio game developer lokal merilis game RPG bertema mitologi Nusantara yang mendapat rating 9/10 di Steam." },
    { title: "K-Pop Idol Asal Indonesia Debut di Grup Baru, Fans Antusias", excerpt: "Idol asal Indonesia resmi debut di grup K-Pop baru dan langsung mendapat sambutan antusias dari penggemar global." },
  ],
  "kesehatan": [
    { title: "Kemenkes Luncurkan Vaksin Merah Putih untuk Seluruh Indonesia", excerpt: "Kementerian Kesehatan resmi meluncurkan Vaksin Merah Putih buatan dalam negeri untuk program imunisasi nasional." },
    { title: "Kasus Demam Berdarah Meningkat 40 Persen di Musim Hujan 2026", excerpt: "Kemenkes mencatat peningkatan kasus demam berdarah sebesar 40 persen selama musim hujan 2026 dibanding tahun lalu." },
    { title: "RS Rujukan Kanker Nasional Baru Diresmikan di Surabaya", excerpt: "Presiden meresmikan rumah sakit rujukan kanker nasional baru di Surabaya dengan teknologi pengobatan terkini." },
    { title: "WHO Puji Indonesia atas Program Stunting yang Berhasil Turun 5 Persen", excerpt: "WHO memberikan apresiasi kepada Indonesia atas keberhasilan menurunkan angka stunting sebesar 5 persen dalam setahun." },
    { title: "Telemedicine di Indonesia Layani 10 Juta Pasien Selama 2025", excerpt: "Platform telemedicine di Indonesia mencatat telah melayani 10 juta pasien sepanjang tahun 2025." },
    { title: "Peneliti Indonesia Temukan Senyawa Anti-Kanker dari Tanaman Tropis", excerpt: "Tim peneliti Indonesia berhasil menemukan senyawa anti-kanker potensial dari tanaman tropis endemik Kalimantan." },
    { title: "BPJS Kesehatan Tambah Manfaat untuk Penyakit Langka Mulai Juli 2026", excerpt: "BPJS Kesehatan mengumumkan penambahan manfaat untuk pengobatan penyakit langka yang berlaku mulai Juli 2026." },
    { title: "Polusi Udara Jakarta Masuk Level Berbahaya, Warga Diminta Pakai Masker", excerpt: "Kualitas udara Jakarta memasuki level berbahaya, pemerintah mengimbau warga menggunakan masker saat beraktivitas di luar." },
    { title: "Indonesia Berhasil Eliminasi Malaria di 300 Kabupaten", excerpt: "Indonesia mencatatkan pencapaian dengan berhasil mengeliminasi malaria di 300 dari 514 kabupaten/kota." },
    { title: "Kecanduan Gadget pada Anak Meningkat, Psikolog Beri Panduan Orang Tua", excerpt: "Psikolog anak memberikan panduan bagi orang tua untuk mengatasi meningkatnya kecanduan gadget pada anak-anak." },
  ],
  "pertanian-peternakan": [
    { title: "Panen Raya Padi 2026 Diprediksi Capai 35 Juta Ton GKG", excerpt: "Kementerian Pertanian memprediksi panen raya padi 2026 akan mencapai 35 juta ton gabah kering giling." },
    { title: "Harga Beras Premium Turun 10 Persen Setelah Panen Raya", excerpt: "Harga beras premium di pasar tradisional turun sekitar 10 persen menyusul panen raya di sejumlah sentra produksi." },
    { title: "Petani Milenial Sukses Ekspor Kopi Specialty ke 15 Negara", excerpt: "Komunitas petani milenial Indonesia berhasil mengekspor kopi specialty ke 15 negara dengan omzet miliaran rupiah." },
    { title: "Program Swasembada Daging Sapi Ditargetkan Tercapai 2027", excerpt: "Pemerintah menargetkan program swasembada daging sapi tercapai pada 2027 dengan penambahan populasi ternak." },
    { title: "Teknologi Drone Pertanian Hemat 50 Persen Biaya Penyemprotan", excerpt: "Penggunaan drone pertanian terbukti menghemat hingga 50 persen biaya penyemprotan pestisida di lahan sawah." },
    { title: "Wabah PMK Kembali Muncul di Jawa Timur, 500 Sapi Terinfeksi", excerpt: "Wabah penyakit mulut dan kuku kembali muncul di Jawa Timur dengan 500 ekor sapi terinfeksi di tiga kabupaten." },
    { title: "Indonesia Jadi Eksportir Udang Terbesar Kedua di Dunia", excerpt: "Indonesia berhasil menjadi eksportir udang terbesar kedua di dunia setelah India, dengan nilai ekspor US$ 3 miliar." },
    { title: "Smart Farming Berbasis IoT Diterapkan di 1.000 Desa", excerpt: "Program smart farming berbasis Internet of Things telah diterapkan di 1.000 desa di seluruh Indonesia." },
    { title: "Harga Cabai Rawit Melonjak 300 Persen Jelang Lebaran", excerpt: "Harga cabai rawit melonjak hingga 300 persen menjelang Lebaran, mencapai Rp 150.000 per kilogram di pasar tradisional." },
    { title: "Kementan Bagikan 10 Juta Bibit Tanaman Gratis ke Petani", excerpt: "Kementerian Pertanian membagikan 10 juta bibit tanaman gratis kepada petani dalam program peningkatan produksi." },
  ],
  "teknologi": [
    { title: "Indonesia Luncurkan Satelit Telekomunikasi Nusantara-3", excerpt: "Indonesia berhasil meluncurkan satelit telekomunikasi Nusantara-3 untuk memperluas konektivitas internet di wilayah terpencil." },
    { title: "Startup AI Indonesia Valuasi Unicorn, Fokus di Sektor Kesehatan", excerpt: "Startup AI Indonesia mencapai valuasi unicorn setelah mendapat pendanaan untuk mengembangkan AI di sektor kesehatan." },
    { title: "5G Resmi Beroperasi di 50 Kota Indonesia", excerpt: "Jaringan 5G kini telah beroperasi secara komersial di 50 kota di Indonesia, menjangkau 30 persen populasi." },
    { title: "Kominfo Blokir 2.000 Situs Judi Online dalam Sebulan", excerpt: "Kementerian Kominfo memblokir lebih dari 2.000 situs judi online dalam satu bulan terakhir sebagai bagian dari operasi pembersihan." },
    { title: "Data Center Hyperscale Pertama di Indonesia Mulai Beroperasi", excerpt: "Data center hyperscale pertama di Indonesia mulai beroperasi di Cikarang dengan kapasitas 50 megawatt." },
    { title: "Riset: 85 Persen Gen Z Indonesia Belanja Online Lebih dari Offline", excerpt: "Hasil riset menunjukkan 85 persen generasi Z di Indonesia lebih memilih belanja online dibandingkan offline." },
    { title: "Pemerintah Siapkan Regulasi AI yang Bertanggung Jawab", excerpt: "Pemerintah tengah menyiapkan regulasi kecerdasan buatan yang bertanggung jawab untuk melindungi masyarakat dari penyalahgunaan." },
    { title: "Cybersecurity Indonesia Diperkuat, BSSN Rekrut 1.000 Talenta Baru", excerpt: "BSSN merekrut 1.000 talenta baru di bidang cybersecurity untuk memperkuat pertahanan siber nasional." },
    { title: "Aplikasi Super App Lokal Tembus 100 Juta Pengguna Aktif", excerpt: "Aplikasi super app buatan Indonesia berhasil menembus 100 juta pengguna aktif bulanan di Asia Tenggara." },
    { title: "EV Battery Factory Indonesia Mulai Produksi Massal", excerpt: "Pabrik baterai kendaraan listrik di Indonesia mulai produksi massal dengan kapasitas 10 GWh per tahun." },
  ],
  "politik": [
    { title: "Presiden Reshuffle Kabinet, 6 Menteri Baru Dilantik", excerpt: "Presiden melakukan reshuffle kabinet dengan melantik 6 menteri baru untuk memperkuat kinerja pemerintahan." },
    { title: "Pilkada Serentak 2026 Diikuti 270 Daerah, KPU Siapkan Logistik", excerpt: "KPU menyiapkan logistik untuk Pilkada serentak 2026 yang diikuti 270 daerah di seluruh Indonesia." },
    { title: "DPR Sahkan RUU Energi Baru Terbarukan Setelah 5 Tahun Pembahasan", excerpt: "DPR akhirnya mengesahkan RUU Energi Baru Terbarukan setelah lima tahun pembahasan dan perdebatan panjang." },
    { title: "Survei: Kepuasan Publik terhadap Pemerintah Naik ke 68 Persen", excerpt: "Hasil survei terbaru menunjukkan tingkat kepuasan publik terhadap kinerja pemerintah naik ke 68 persen." },
    { title: "Koalisi Partai Oposisi Bentuk Poros Baru Jelang Pemilu 2029", excerpt: "Koalisi partai oposisi resmi membentuk poros baru sebagai persiapan menghadapi Pemilu 2029." },
    { title: "Indonesia Terpilih Jadi Anggota Tidak Tetap DK PBB 2027-2028", excerpt: "Indonesia terpilih sebagai anggota tidak tetap Dewan Keamanan PBB untuk periode 2027-2028 dengan suara terbanyak." },
    { title: "Presiden Temui Pemimpin ASEAN Bahas Isu Laut China Selatan", excerpt: "Presiden Indonesia bertemu dengan pemimpin negara ASEAN untuk membahas isu keamanan di Laut China Selatan." },
    { title: "Pemerintah Umumkan Ibu Kota Nusantara Siap Ditempati Tahap 2", excerpt: "Pemerintah mengumumkan Ibu Kota Nusantara siap ditempati untuk tahap 2 dengan infrastruktur dasar yang telah rampung." },
    { title: "Wacana Amendemen UUD 1945 Ditolak Mayoritas Fraksi di DPR", excerpt: "Wacana amendemen UUD 1945 ditolak oleh mayoritas fraksi di DPR yang menilai konstitusi tidak perlu diubah saat ini." },
    { title: "Menteri Dalam Negeri Keluarkan Edaran Netralitas ASN di Pilkada", excerpt: "Menteri Dalam Negeri mengeluarkan surat edaran tentang netralitas ASN menjelang Pilkada serentak 2026." },
  ],
  "pendidikan": [
    { title: "UI dan ITB Masuk Top 200 Universitas Dunia Versi QS Rankings", excerpt: "Universitas Indonesia dan ITB berhasil masuk dalam daftar 200 universitas terbaik dunia versi QS World University Rankings." },
    { title: "Kurikulum Merdeka Belajar Resmi Diterapkan di Seluruh Sekolah", excerpt: "Kementerian Pendidikan menetapkan Kurikulum Merdeka Belajar diterapkan secara penuh di seluruh sekolah mulai 2026." },
    { title: "Beasiswa LPDP 2026 Dibuka untuk 5.000 Penerima, Ini Syaratnya", excerpt: "LPDP membuka pendaftaran beasiswa 2026 untuk 5.000 penerima dengan berbagai skema baru yang lebih inklusif." },
    { title: "Siswa Indonesia Raih 4 Medali Emas di Olimpiade Matematika Internasional", excerpt: "Tim Indonesia meraih 4 medali emas di Olimpiade Matematika Internasional, pencapaian terbaik sepanjang sejarah." },
    { title: "Program Magang Bersertifikat Libatkan 1 Juta Mahasiswa dan 10.000 Perusahaan", excerpt: "Program magang bersertifikat berhasil melibatkan 1 juta mahasiswa dan 10.000 perusahaan di seluruh Indonesia." },
    { title: "Sekolah Vokasi Baru Dibangun di 100 Kabupaten Tertinggal", excerpt: "Pemerintah membangun sekolah vokasi baru di 100 kabupaten tertinggal untuk meningkatkan keterampilan tenaga kerja lokal." },
    { title: "Riset Dosen Indonesia Dipublikasikan di Jurnal Nature", excerpt: "Tim dosen dari universitas Indonesia berhasil mempublikasikan hasil riset di jurnal ilmiah bergengsi Nature." },
    { title: "Digitalisasi Pendidikan: 90 Persen Sekolah Kini Punya Akses Internet", excerpt: "Program digitalisasi pendidikan berhasil menghubungkan 90 persen sekolah di Indonesia dengan akses internet." },
    { title: "Kemendikbud Luncurkan Platform Belajar AI untuk Guru", excerpt: "Kemendikbud meluncurkan platform belajar berbasis AI untuk membantu guru dalam pengembangan materi pembelajaran." },
    { title: "Angka Putus Sekolah Turun ke Level Terendah dalam 20 Tahun", excerpt: "BPS mencatat angka putus sekolah turun ke level terendah dalam 20 tahun terakhir berkat program Indonesia Pintar." },
  ],
  "lingkungan": [
    { title: "Deforestasi Indonesia Turun 50 Persen, Terendah dalam Satu Dekade", excerpt: "Data KLHK menunjukkan deforestasi Indonesia turun 50 persen dan berada pada titik terendah dalam satu dekade." },
    { title: "Jakarta Tenggelam: Studi Baru Prediksi 30 Persen Wilayah Terendam 2050", excerpt: "Studi terbaru memprediksi 30 persen wilayah Jakarta akan terendam pada 2050 akibat penurunan tanah dan kenaikan air laut." },
    { title: "Indonesia Komitmen Net Zero Emission 2060, Ini Peta Jalannya", excerpt: "Pemerintah Indonesia memaparkan peta jalan menuju net zero emission pada 2060 dengan fokus pada energi terbarukan." },
    { title: "Kebakaran Hutan Kalimantan Hanguskan 50.000 Hektar Lahan", excerpt: "Kebakaran hutan dan lahan di Kalimantan telah menghanguskan 50.000 hektar lahan, sebagian besar gambut." },
    { title: "Program Penanaman 10 Miliar Mangrove Capai 60 Persen Target", excerpt: "Program penanaman 10 miliar mangrove telah mencapai 60 persen target dengan 6 miliar pohon telah ditanam." },
    { title: "Taman Nasional Komodo Raih Penghargaan Konservasi Dunia", excerpt: "Taman Nasional Komodo meraih penghargaan konservasi dunia dari IUCN atas keberhasilan melindungi habitat komodo." },
    { title: "Plastik Sekali Pakai Resmi Dilarang di 20 Kota Besar Indonesia", excerpt: "Larangan plastik sekali pakai resmi berlaku di 20 kota besar Indonesia sebagai bagian dari program pengurangan sampah." },
    { title: "PLTS Terapung Terbesar di Asia Tenggara Beroperasi di Cirata", excerpt: "PLTS terapung terbesar di Asia Tenggara resmi beroperasi di Waduk Cirata, Jawa Barat dengan kapasitas 192 MWp." },
    { title: "Coral Triangle Initiative Selamatkan 1.000 Spesies Laut Terancam", excerpt: "Indonesia melalui Coral Triangle Initiative berhasil menyelamatkan lebih dari 1.000 spesies laut yang terancam punah." },
    { title: "Banjir Bandang Terjang Sumatra Barat, 5.000 Warga Mengungsi", excerpt: "Banjir bandang melanda Sumatra Barat akibat curah hujan ekstrem, menyebabkan 5.000 warga harus mengungsi." },
  ],
  "gaya-hidup": [
    { title: "Tren 'Slow Living' Meningkat di Kalangan Pekerja Muda Indonesia", excerpt: "Tren slow living semakin populer di kalangan pekerja muda Indonesia yang mencari keseimbangan hidup dan kerja." },
    { title: "Wisata Kuliner Jalur Rempah Indonesia Jadi Destinasi Favorit Turis Asing", excerpt: "Wisata kuliner jalur rempah Indonesia menjadi destinasi favorit turis asing dengan kunjungan naik 200 persen." },
    { title: "Work From Bali: 10.000 Digital Nomad Asing Tinggal di Pulau Dewata", excerpt: "Bali menjadi magnet bagi digital nomad dengan lebih dari 10.000 pekerja remote asing yang menetap di pulau tersebut." },
    { title: "Fashion Berkelanjutan Indonesia Tampil di Paris Fashion Week", excerpt: "Desainer Indonesia menampilkan koleksi fashion berkelanjutan berbahan daur ulang di Paris Fashion Week 2026." },
    { title: "Tren Coffee Shop Third Wave Menjamur di Kota-Kota Kecil", excerpt: "Tren coffee shop third wave kini merambah ke kota-kota kecil di Indonesia, bukan lagi monopoli kota besar." },
    { title: "Survei: Gen Z Indonesia Prioritaskan Kesehatan Mental Dibanding Karier", excerpt: "Survei menunjukkan Gen Z Indonesia lebih memprioritaskan kesehatan mental dibandingkan pencapaian karier." },
    { title: "Glamping di Pegunungan Jawa Barat Jadi Tren Liburan 2026", excerpt: "Glamping di kawasan pegunungan Jawa Barat menjadi tren liburan 2026 dengan okupansi penuh setiap akhir pekan." },
    { title: "Makanan Plant-Based Semakin Diminati, Penjualan Naik 80 Persen", excerpt: "Penjualan makanan berbasis tanaman (plant-based) di Indonesia meningkat 80 persen dalam setahun terakhir." },
    { title: "Festival Seni Jalanan Terbesar di Asia Tenggara Digelar di Yogyakarta", excerpt: "Festival seni jalanan terbesar di Asia Tenggara digelar di Yogyakarta dengan partisipasi 200 seniman dari 15 negara." },
    { title: "Tren Adopsi Hewan Peliharaan Meningkat 60 Persen Pasca Pandemi", excerpt: "Data menunjukkan tren adopsi hewan peliharaan meningkat 60 persen sejak pandemi, terutama kucing dan anjing." },
  ],
  "opini": [
    { title: "Demokrasi Indonesia di Persimpangan: Tantangan dan Harapan", excerpt: "Opini tentang kondisi demokrasi Indonesia yang berada di persimpangan antara konsolidasi dan kemunduran." },
    { title: "Mengapa Pendidikan Vokasi Harus Jadi Prioritas Nasional", excerpt: "Analisis mengapa pendidikan vokasi harus menjadi prioritas nasional untuk mengatasi pengangguran struktural." },
    { title: "Krisis Air Bersih: Bom Waktu yang Diabaikan", excerpt: "Kolom opini tentang krisis air bersih yang mengancam jutaan warga Indonesia namun belum mendapat perhatian serius." },
    { title: "Regulasi AI di Indonesia: Terlambat atau Tepat Waktu?", excerpt: "Diskusi tentang apakah Indonesia terlambat atau tepat waktu dalam meregulasi kecerdasan buatan." },
    { title: "Kedaulatan Pangan: Antara Retorika dan Realita", excerpt: "Analisis kritis tentang program kedaulatan pangan yang masih jauh dari target yang dicanangkan pemerintah." },
    { title: "Generasi Sandwich: Dilema Pekerja Muda Indonesia", excerpt: "Opini tentang fenomena generasi sandwich yang menanggung beban finansial ganda dan dampaknya pada kesejahteraan." },
    { title: "Transportasi Publik Jakarta: Sudah Cukup Baikkah?", excerpt: "Evaluasi sistem transportasi publik Jakarta setelah satu dekade pembangunan MRT, LRT, dan TransJakarta." },
    { title: "Media Sosial dan Polarisasi Politik: Bagaimana Mengatasinya?", excerpt: "Refleksi tentang peran media sosial dalam memperparah polarisasi politik dan solusi yang bisa diterapkan." },
    { title: "UMKM Digital: Motor Penggerak Ekonomi yang Perlu Didukung", excerpt: "Analisis tentang pentingnya mendukung digitalisasi UMKM sebagai motor penggerak ekonomi Indonesia." },
    { title: "Mampukah Indonesia Menjadi Negara Maju pada 2045?", excerpt: "Kajian tentang peluang dan tantangan Indonesia untuk mewujudkan visi menjadi negara maju pada 2045." },
  ],
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

function randomContent(title, excerpt) {
  return `<p>${excerpt}</p><h2>Detail Berita</h2><p>Perkembangan terbaru terkait ${title.toLowerCase()} terus menjadi perhatian publik. Berbagai pihak memberikan tanggapan atas situasi ini.</p><p>Menurut pengamat, hal ini merupakan langkah penting yang perlu dicermati secara saksama oleh seluruh pemangku kepentingan terkait.</p><blockquote>"Kami terus memantau perkembangan situasi ini dan berharap ada solusi terbaik untuk semua pihak," ujar narasumber yang dihubungi wartawan.</blockquote><h2>Dampak dan Prospek</h2><p>Dampak dari perkembangan ini diperkirakan akan terasa dalam beberapa waktu ke depan. Para ahli menilai bahwa kebijakan ini akan membawa perubahan signifikan.</p><p>Masyarakat diharapkan tetap tenang dan mengikuti arahan dari pihak berwenang terkait perkembangan lebih lanjut.</p>`;
}

async function main() {
  console.log("=== Seeding 120 Articles ===\n");

  // Get all categories
  const categories = await prisma.category.findMany();
  const catMap = {};
  for (const c of categories) {
    catMap[c.slug] = c.id;
  }

  // Get a journalist user
  const author = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "CHIEF_EDITOR", "SENIOR_JOURNALIST"] } },
  });

  if (!author) {
    console.error("No author found. Run /api/setup first.");
    process.exit(1);
  }

  let created = 0;
  const now = new Date();

  for (const [catSlug, items] of Object.entries(articles)) {
    const categoryId = catMap[catSlug];
    if (!categoryId) {
      console.log(`  SKIP: Category '${catSlug}' not found in DB`);
      continue;
    }

    console.log(`📁 ${catSlug} (${items.length} articles)`);

    for (let i = 0; i < items.length; i++) {
      const { title, excerpt } = items[i];
      const slug = slugify(title);

      // Check if already exists
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) {
        console.log(`  ⏭ Already exists: ${slug}`);
        continue;
      }

      // Stagger publish dates (most recent first)
      const publishDate = new Date(now);
      publishDate.setHours(publishDate.getHours() - (created * 3 + Math.floor(Math.random() * 5)));

      await prisma.article.create({
        data: {
          title,
          slug,
          content: randomContent(title, excerpt),
          excerpt,
          status: "PUBLISHED",
          verificationLabel: "VERIFIED",
          readTime: 3 + Math.floor(Math.random() * 5),
          viewCount: Math.floor(Math.random() * 5000) + 100,
          publishedAt: publishDate,
          authorId: author.id,
          categoryId,
        },
      });

      created++;
      console.log(`  ✓ ${title.substring(0, 60)}...`);
    }
  }

  console.log(`\n=== Done! Created ${created} articles ===`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
