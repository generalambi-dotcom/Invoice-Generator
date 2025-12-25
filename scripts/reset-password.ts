import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('supabase') || databaseUrl.includes('pooler') || databaseUrl.includes('amazonaws.com')
    ? { rejectUnauthorized: false }
    : undefined,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

async function resetPassword(email: string, newPassword: string) {
  try {
    console.log(`🔐 Resetting password for: ${email}\n`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found.`);
      return false;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password reset successfully for ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`\n📝 New password: ${newPassword}`);
    console.log(`\n⚠️  Please save this password securely!`);
    console.log(`   You can now sign in at: https://invoicegenerator.ng/signin`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Error resetting password:');
    console.error('   Message:', error.message || 'Unknown error');
    console.error('   Code:', error.code || 'N/A');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: npx tsx scripts/reset-password.ts <email> <new-password>');
  console.log('\nExample:');
  console.log('  npx tsx scripts/reset-password.ts sokanpete@gmail.com MyNewPassword123');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('❌ Password must be at least 6 characters long.');
  process.exit(1);
}

resetPassword(email, newPassword);

