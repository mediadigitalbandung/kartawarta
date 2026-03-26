const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Unsplash free images by category theme
const categoryImages = {
  "Hukum Pidana": [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80",
    "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800&q=80",
    "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&q=80",
    "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=800&q=80",
    "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  ],
  "Hukum Perdata": [
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80",
    "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=800&q=80",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1423592707957-3b212afa6733?w=800&q=80",
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  ],
  "Hukum Tata Negara": [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?w=800&q=80",
    "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&q=80",
    "https://images.unsplash.com/photo-1575540325276-9b012f19e765?w=800&q=80",
    "https://images.unsplash.com/photo-1569025743873-ea3a9ber528f?w=800&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=800&q=80",
  ],
  "Hukum Bisnis": [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    "https://images.unsplash.com/photo-1553729459-uj1ef3bercab?w=800&q=80",
  ],
  "HAM": [
    "https://images.unsplash.com/photo-1591901206069-ed60c4429a2e?w=800&q=80",
    "https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=800&q=80",
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80",
    "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80",
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
    "https://images.unsplash.com/photo-1509099836639-18ba4637cc1f?w=800&q=80",
    "https://images.unsplash.com/photo-1544654803-b69140b285a1?w=800&q=80",
  ],
  "Hukum Lingkungan": [
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80",
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80",
    "https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80",
  ],
  "Ketenagakerjaan": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    "https://images.unsplash.com/photo-1560264280-88b68371db39?w=800&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  ],
  "Opini": [
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80",
    "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  ],
  "Infografis": [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80",
    "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    "https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=800&q=80",
    "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?w=800&q=80",
  ],
};

async function main() {
  let updated = 0;

  for (const [categoryName, images] of Object.entries(categoryImages)) {
    const category = await prisma.category.findFirst({ where: { name: categoryName } });
    if (!category) continue;

    // Get articles without featured image
    const articles = await prisma.article.findMany({
      where: { categoryId: category.id, featuredImage: null },
      orderBy: { publishedAt: "desc" },
    });

    for (let i = 0; i < articles.length; i++) {
      const img = images[i % images.length];
      await prisma.article.update({
        where: { id: articles[i].id },
        data: { featuredImage: img },
      });
      updated++;
    }
    console.log(`✓ "${categoryName}" — ${articles.length} articles got images`);
  }

  console.log(`\nDone! ${updated} articles updated with images.`);
  await prisma.$disconnect();
}

main().catch(console.error);
