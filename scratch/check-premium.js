process.env.DATABASE_URL = "postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const premiumUsers = await prisma.user.findMany({
    where: { subscriptionPlan: 'premium' },
    select: { id: true, name: true, email: true, subscriptionStatus: true, subscriptionStartDate: true, updatedAt: true }
  });
  console.log("============== PREMIUM USERS ==============");
  console.dir(premiumUsers, { depth: null });
  
  const paymentLogs = await prisma.systemLog.findMany({
    where: { 
        category: 'payment',
        message: { contains: 'premium', mode: 'insensitive' }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("============== PAYMENT LOGS ==============");
  console.dir(paymentLogs, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
