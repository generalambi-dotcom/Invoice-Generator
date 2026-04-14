import { prisma } from './lib/db';

async function checkFailedPayments() {
  try {
    const logs = await prisma.systemLog.findMany({
      where: {
        OR: [
          { message: { contains: 'Stripe' } },
          { message: { contains: 'checkout' } },
          { message: { contains: 'payment' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const stripeCreds = await prisma.paymentCredential.count({
      where: { provider: 'stripe' }
    });

    console.log(`Found ${logs.length} related logs.`);
    if (logs.length > 0) {
      console.log('Sample logs:');
      logs.slice(0, 5).forEach(l => console.log(`- ${l.createdAt.toISOString()}: [${l.level}] ${l.message}`));
    }
    
    console.log(`\nStripe Credentials in DB: ${stripeCreds}`);
  } catch (error) {
    console.error('Error querying DB:', error);
  } finally {
    // try to disconnect if prisma.$disconnect exists
    if (prisma.$disconnect) {
        await prisma.$disconnect();
    }
  }
}

checkFailedPayments();
