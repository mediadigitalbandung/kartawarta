// Seed featured images for all articles using Unsplash URLs
// Run: node scripts/seed-images.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categoryImages = {
  "hukum": [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=800&q=80",
    "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=80",
    "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1468487422149-5edc5034604f?w=800&q=80",
    "https://images.unsplash.com/photo-1423592707957-3b212afa6733?w=800&q=80",
    "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800&q=80",
  ],
  "bisnis-ekonomi": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=800&q=80",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  ],
  "olahraga": [
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    "https://images.unsplash.com/photo-1461896836934-bd45ba054ca4?w=800&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80",
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  ],
  "hiburan": [
    "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  ],
  "kesehatan": [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80",
  ],
  "pertanian-peternakan": [
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    "https://images.unsplash.com/photo-1516253593875-bd7ba052b0ae?w=800&q=80",
    "https://images.unsplash.com/photo-1592982537447-6f2e12394bba?w=800&q=80",
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80",
    "https://images.unsplash.com/photo-1594761051903-0a72d31e90d0?w=800&q=80",
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80",
    "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
  ],
  "teknologi": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
  ],
  "politik": [
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80",
    "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=800&q=80",
    "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    "https://images.unsplash.com/photo-1524749292158-7540c2494485?w=800&q=80",
  ],
  "pendidikan": [
    "https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  ],
  "lingkungan": [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80",
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80",
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80",
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=80",
    "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=800&q=80",
  ],
  "gaya-hidup": [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
    "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
  ],
  "opini": [
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    "https://images.unsplash.com/photo-1586771107445-d3190d36138b?w=800&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  ],
};

async function main() {
  console.log("=== Adding Featured Images ===\n");

  const categories = await prisma.category.findMany({
    include: { articles: { orderBy: { publishedAt: "desc" } } },
  });
  let updated = 0;

  for (const cat of categories) {
    const images = categoryImages[cat.slug];
    if (!images) continue;

    console.log(`📁 ${cat.name} (${cat.articles.length} articles)`);

    for (let i = 0; i < cat.articles.length; i++) {
      const article = cat.articles[i];
      const img = images[i % images.length];

      await prisma.article.update({
        where: { id: article.id },
        data: { featuredImage: img },
      });

      updated++;
      console.log(`  ✓ ${article.title.substring(0, 55)}...`);
    }
  }

  console.log(`\n=== Done! Updated ${updated} articles with images ===`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
