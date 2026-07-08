const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!adminUser) return console.log("No admin");
  
  const psCred = await prisma.paymentCredential.findUnique({
    where: { userId_provider: { userId: adminUser.id, provider: 'paystack' } },
    select: { publicKey: true },
  });
  console.log("DB Key:", JSON.stringify(psCred?.publicKey));
}
main().catch(console.error).finally(() => prisma.$disconnect());
