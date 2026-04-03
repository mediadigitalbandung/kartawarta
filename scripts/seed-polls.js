const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const polls = [
  {
    question: "Menurut Anda, isu apa yang paling mendesak di Indonesia saat ini?",
    category: "politik",
    options: ["Korupsi & Penegakan Hukum", "Ekonomi & Lapangan Kerja", "Pendidikan", "Kesehatan", "Infrastruktur"],
  },
  {
    question: "Platform mana yang paling sering Anda gunakan untuk membaca berita?",
    category: "teknologi",
    options: ["Website/Portal Berita", "Media Sosial", "Aplikasi Berita", "TV Online/Streaming", "Koran/Majalah Digital"],
  },
  {
    question: "Bagaimana pendapat Anda tentang kinerja Timnas Indonesia tahun ini?",
    category: "olahraga",
    options: ["Sangat Memuaskan", "Cukup Baik", "Biasa Saja", "Perlu Perbaikan", "Mengecewakan"],
  },
  {
    question: "Sektor ekonomi mana yang paling potensial untuk pertumbuhan Indonesia?",
    category: "bisnis-ekonomi",
    options: ["Ekonomi Digital & Startup", "Pertanian & Ketahanan Pangan", "Pariwisata", "Manufaktur & Industri", "Energi Terbarukan"],
  },
  {
    question: "Apa tantangan terbesar dalam sistem pendidikan Indonesia?",
    category: "pendidikan",
    options: ["Kualitas Guru & Tenaga Pengajar", "Akses Pendidikan di Daerah Terpencil", "Kurikulum yang Ketinggalan Zaman", "Biaya Pendidikan Tinggi", "Kesenjangan Digital"],
  },
  {
    question: "Menurut Anda, bagaimana cara terbaik mengatasi kemacetan di kota besar?",
    category: "gaya-hidup",
    options: ["Perbaikan Transportasi Umum", "Pembatasan Kendaraan Pribadi", "Kerja dari Rumah (WFH)", "Pembangunan MRT/LRT", "Relokasi Pusat Bisnis"],
  },
  {
    question: "Genre film Indonesia apa yang paling Anda sukai?",
    category: "hiburan",
    options: ["Horor/Thriller", "Drama/Romantis", "Komedi", "Aksi/Laga", "Dokumenter"],
  },
  {
    question: "Isu lingkungan apa yang paling mengkhawatirkan bagi Anda?",
    category: "lingkungan",
    options: ["Deforestasi & Kebakaran Hutan", "Polusi Udara di Kota Besar", "Sampah Plastik & Limbah Laut", "Perubahan Iklim & Cuaca Ekstrem", "Pencemaran Sungai & Air Bersih"],
  },
  {
    question: "Apakah Anda setuju dengan penerapan AI dalam dunia kerja di Indonesia?",
    category: "teknologi",
    options: ["Sangat Setuju, Membantu Produktivitas", "Setuju dengan Regulasi Ketat", "Netral, Perlu Studi Lebih Lanjut", "Kurang Setuju, Ancam Lapangan Kerja", "Tidak Setuju"],
  },
  {
    question: "Komoditas pertanian Indonesia mana yang harus lebih didukung pemerintah?",
    category: "pertanian-peternakan",
    options: ["Padi & Beras", "Kelapa Sawit", "Kopi & Kakao", "Perikanan & Budidaya Laut", "Peternakan Sapi & Unggas"],
  },
];

async function main() {
  console.log("=== Seeding 10 Polls ===\n");

  // Get category map
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catMap = {};
  for (const c of categories) catMap[c.slug] = c.id;

  let created = 0;
  for (let i = 0; i < polls.length; i++) {
    const poll = polls[i];

    // Check if poll with same question already exists
    const existing = await prisma.poll.findFirst({ where: { question: poll.question } });
    if (existing) {
      console.log(`  ⏭ Already exists: ${poll.question.substring(0, 50)}...`);
      continue;
    }

    const categoryId = catMap[poll.category] || null;

    await prisma.poll.create({
      data: {
        question: poll.question,
        categoryId,
        isActive: true,
        order: i + 1,
        options: {
          create: poll.options.map((label) => ({ label, votes: 0 })),
        },
      },
    });

    created++;
    console.log(`  ✓ [${poll.category}] ${poll.question.substring(0, 60)}...`);
  }

  console.log(`\n=== Done! Created ${created} polls ===`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
