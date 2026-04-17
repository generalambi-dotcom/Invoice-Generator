import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const premiumUsers = await prisma.user.findMany({
    where: { subscriptionPlan: 'premium' },
    select: { id: true, name: true, email: true, subscriptionStatus: true, subscriptionStartDate: true, updatedAt: true }
  })
  console.log("PREMIUM USERS:", premiumUsers)
  
  const paymentLogs = await prisma.systemLog.findMany({
    where: { 
      category: 'payment',
      message: { contains: 'premium', mode: 'insensitive' }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  console.log("\nPREMIUM PAYMENT LOGS:", paymentLogs)
}
main().catch(console.error).finally(() => prisma.$disconnect())
