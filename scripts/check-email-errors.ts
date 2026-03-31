import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const failedEmails = await prisma.emailLog.findMany({
    where: { status: 'failed' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { to: true, subject: true, errorMessage: true, createdAt: true }
  });
  console.log(JSON.stringify(failedEmails, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
