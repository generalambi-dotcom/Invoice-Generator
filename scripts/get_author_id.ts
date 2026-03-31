import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { isAdmin: true }
  });
  if (user) {
    console.log("Found admin user ID:", user.id);
  } else {
    const backupUser = await prisma.user.findFirst();
    if (backupUser) {
      console.log("No admin found. Using first user ID:", backupUser.id);
    } else {
      console.log("No users found in database.");
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
