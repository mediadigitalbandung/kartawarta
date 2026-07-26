const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.socialPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      platform: true,
      status: true,
      imageUrl: true,
      errorMessage: true,
      createdAt: true
    }
  });
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
