Saya ingin kamu membantu saya melakukan proses improvement, revisi, QA, dan deployment secara menyeluruh pada project ini. Project ini adalah website media yang memiliki tiga panel utama:

👤 Admin Panel (Administrator) — mengelola seluruh sistem, user, konfigurasi, dan konten secara keseluruhan.
✍️ Creator Panel — panel untuk pembuat konten (penulis/kreator) dalam membuat, mengelola, dan memonitor konten mereka.
📝 Editor Panel — panel untuk editor dalam mereview, mengedit, menyetujui, atau menolak konten dari creator sebelum dipublikasikan.

Tolong lakukan langkah-langkah berikut secara berurutan:

1. 🔧 IMPROVEMENT
Lakukan improvement menyeluruh pada semua aspek berikut. Pahami sistem secara keseluruhan sebelum mulai mengerjakan.
🏗️ Sistem & Arsitektur
Pahami dan pastikan sistem berjalan sesuai alur berikut:

Alur Konten: Creator membuat konten → mengajukan ke Editor → Editor mereview/mengedit/menyetujui atau menolak dengan catatan → jika disetujui, konten masuk antrian publikasi → Administrator bisa memantau, mengatur jadwal, atau melakukan override publikasi.
Alur User: Administrator membuat dan mengelola akun user → menetapkan role (Creator/Editor) → user login dan mengakses panel sesuai role masing-masing.
Alur Notifikasi: Setiap perubahan status konten (diajukan, disetujui, ditolak, dipublikasi) harus memicu notifikasi ke pihak yang relevan.

👤 Admin Panel (Administrator)
Periksa, lengkapi, dan tambahkan jika diperlukan:

Dashboard: Statistik lengkap — total konten (draft, review, published, rejected), total user aktif, grafik aktivitas konten harian/mingguan/bulanan, konten terbaru, dan aktivitas terbaru.
Manajemen User: CRUD user lengkap — tambah, lihat detail, edit profil & role, aktifkan/nonaktifkan akun, reset password. Tabel user dengan filter role, status, dan pencarian.
Manajemen Konten: Lihat dan kelola semua konten dari semua creator — filter by status, kategori, creator, editor, tanggal. Bisa edit, hapus, publish, unpublish, atau jadwalkan publikasi.
Manajemen Kategori & Tag: CRUD kategori dan tag — tambah, edit, hapus, merge tag duplikat, atur urutan/hierarki kategori.
Manajemen Komentar (jika ada): Moderasi komentar — setujui, tolak, hapus, tandai spam.
Pengaturan Sistem: Konfigurasi nama website, logo, deskripsi, SEO default, pengaturan email, dan konfigurasi lainnya.
Log Aktivitas: Riwayat aktivitas semua user — siapa mengubah apa dan kapan.
Assign Editor: Administrator bisa menetapkan editor tertentu untuk mereview konten tertentu atau dari creator tertentu.

✍️ Creator Panel
Periksa, lengkapi, dan tambahkan jika diperlukan:

Dashboard: Statistik konten milik sendiri — total draft, dalam review, published, rejected. Grafik performa konten (views, engagement jika ada). Notifikasi status terbaru.
Buat Konten: Form pembuatan konten lengkap — judul, body (rich text editor), kategori, tag, thumbnail/cover image, excerpt/ringkasan, SEO meta (title, description), status simpan sebagai draft atau langsung ajukan ke editor.
Kelola Konten: Daftar semua konten milik sendiri dengan filter status. Bisa edit draft, lihat catatan penolakan dari editor, revisi dan ajukan ulang konten yang ditolak.
Status Tracking: Creator bisa melihat status real-time konten mereka — Draft → Diajukan → Dalam Review → Disetujui/Ditolak → Published.
Notifikasi: Notifikasi masuk saat konten disetujui, ditolak (beserta catatan dari editor), atau sudah dipublikasikan.
Profil: Creator bisa mengelola profil publik mereka — nama, foto, bio, dan informasi lainnya.

📝 Editor Panel
Periksa, lengkapi, dan tambahkan jika diperlukan:

Dashboard: Statistik review — total konten menunggu review, sudah disetujui, sudah ditolak hari ini/minggu ini. Antrian konten yang perlu direview segera.
Antrian Review: Daftar konten yang masuk untuk direview — diurutkan berdasarkan waktu pengajuan. Filter by creator, kategori, tanggal. Bisa klaim/assign konten ke diri sendiri.
Review Konten: Tampilan review lengkap — baca konten secara penuh, bandingkan dengan versi sebelumnya (jika revisi), tambahkan komentar/catatan inline, edit langsung jika diperlukan, lalu setujui atau tolak dengan catatan wajib diisi jika ditolak.
Riwayat Review: Histori semua konten yang pernah direview oleh editor tersebut — bisa dilihat kembali untuk referensi.
Notifikasi: Notifikasi saat ada konten baru masuk untuk direview atau saat creator mengajukan ulang konten yang sebelumnya ditolak.
Statistik Performa Editor: Rata-rata waktu review, jumlah konten disetujui vs ditolak, produktivitas mingguan.

🔧 Aspek Teknis yang Harus Diperiksa & Diperbaiki

Tombol & Action: Setiap tombol harus memiliki handler yang berfungsi. Tidak boleh ada tombol kosong atau yang hanya tampil tanpa aksi.
Form & Validasi: Semua form harus memiliki validasi client-side dan server-side. Pesan error harus spesifik dan informatif. Ada feedback setelah submit (sukses/gagal).
Alur CRUD: Create, Read, Update, Delete harus lengkap dan tersambung end-to-end untuk setiap entitas (konten, user, kategori, tag, dll).
State & Feedback UI: UI harus selalu update setelah aksi berhasil atau gagal — loading state, success toast, error toast, konfirmasi sebelum aksi destruktif (hapus, tolak, dll).
Fungsi Belum Lengkap: Temukan semua fungsi TODO, placeholder, handler kosong, atau yang belum tersambung ke API/database — selesaikan semuanya.
Efisiensi & Optimasi: Sederhanakan alur yang terlalu panjang, optimalkan query database, kurangi re-render yang tidak perlu, implementasi pagination/infinite scroll pada daftar panjang.
Responsivitas: Pastikan ketiga panel tampil baik di desktop dan tablet.
Konsistensi UI: Seragamkan komponen, warna, tipografi, spacing, dan pola interaksi di seluruh panel.


2. ✏️ REVISI
Lakukan revisi menyeluruh pada konten dan fungsionalitas di ketiga panel:

Konten & Teks: Periksa dan perbaiki semua teks, label, placeholder, pesan error, dan notifikasi agar konsisten, jelas, dan sesuai konteks website media.
Logika Bisnis: Tinjau ulang alur kerja (workflow) di setiap panel — pastikan logika editorial sudah benar dan tidak ada edge case yang terlewat.
Validasi & Form: Periksa semua form input — validasi sisi client maupun server, pesan error yang informatif, dan UX pengisian form.
Permission & Role: Pastikan hak akses Administrator, Editor, dan Creator sudah tepat dan tidak ada akses yang bocor antar role:

Creator hanya bisa mengelola konten miliknya sendiri.
Editor hanya bisa mereview dan mengedit konten yang di-assign atau masuk ke antrean review.
Administrator memiliki akses penuh ke seluruh sistem.


Data & Konsistensi: Pastikan data yang ditampilkan di setiap panel konsisten dan sinkron dengan sumber data (database/API).
Feedback Pengguna: Tambahkan atau perbaiki loading state, success/error toast, konfirmasi aksi destruktif (hapus, tolak, reset, dll).


3. 🧪 QUALITY ASSURANCE & AUDIT
Jalankan QA dan audit menyeluruh:

Unit & Integration Testing: Jalankan semua test yang ada, perbaiki yang gagal, dan tambahkan test untuk fungsi yang diperbaiki.
Code Review & Linting: Periksa code style, naming convention, dan formatting. Jalankan linter (ESLint, Pylint, dll).
Security Audit: Cek kerentanan (dependencies outdated, injection risks, exposed secrets, OWASP top 10) — khususnya pada autentikasi dan otorisasi antar role.
Review Manual & Checklist: Uji manual setiap alur utama di ketiga panel — login, CRUD konten, alur review editorial, dan manajemen user.


4. 🚀 COMMIT, PUSH & DEPLOY
Setelah semua bersih dan lolos QA:

Commit: Buat commit message yang deskriptif mengikuti Conventional Commits (feat/fix/chore/refactor).
Push: Push ke repository.
Deploy: Deploy ke semua environment yang relevan — pastikan environment variables sudah benar di setiap platform.


Setelah selesai, berikan saya ringkasan laporan berisi:

Apa saja yang diimprove
Apa saja yang direvisi
Hasil QA (passed/failed/warning)
Status deployment