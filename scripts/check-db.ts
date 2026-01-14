
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Connecting to database...');
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ Successfully connected! Found ${userCount} users.`);

        // Check if WhatsAppCredential model exists (implies schema is up to date)
        const waCount = await prisma.whatsAppCredential.count();
        console.log(`✅ WhatsApp table exists! Found ${waCount} credentials.`);

    } catch (error: any) {
        console.error('❌ Database connection failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
