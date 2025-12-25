import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
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

async function checkAdmins() {
  try {
    console.log('🔍 Checking database for admin users...\n');

    const adminUsers = await prisma.user.findMany({
      where: {
        isAdmin: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the database.\n');
      console.log('💡 To make a user an admin:');
      console.log('   1. Visit /make-admin');
      console.log('   2. Or use the API: POST /api/admin/make-admin');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.createdAt.toISOString()}`);
        console.log(`   isAdmin: ${user.isAdmin}`);
        console.log('');
      });
    }

    // Also show all users for reference
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        isAdmin: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log('\nAll users:');
      allUsers.forEach((user, index) => {
        const adminBadge = user.isAdmin ? ' [ADMIN]' : '';
        console.log(`  ${index + 1}. ${user.email}${adminBadge}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error checking admins:');
    console.error('   Message:', error.message || 'Unknown error');
    console.error('   Code:', error.code || 'N/A');
    if (error.meta) {
      console.error('   Details:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();

