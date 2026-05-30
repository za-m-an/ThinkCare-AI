const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isOnboarded: true,
      }
    });
    console.log("Prisma query successful. Top users:", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Prisma query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
