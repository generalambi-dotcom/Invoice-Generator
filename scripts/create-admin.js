
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

// Basic env loading if not already present
if (!process.env.DATABASE_URL) {
    try {
        require('dotenv').config();
    } catch (e) {
        // ignore
    }
}

async function main() {
    const email = process.argv[2];
    const password = process.argv[3] || 'password123';
    const name = process.argv[4] || 'Admin User';

    if (!email) {
        console.error('Usage: node scripts/create-admin.js <email> [password] [name]');
        process.exit(1);
    }

    // Set up adapter
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    // Direct connection with adapter
    const prisma = new PrismaClient({ adapter });

    try {
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log(`User ${email} already exists. Updating to admin...`);
            await prisma.user.update({
                where: { email },
                data: { isAdmin: true }
            });
            console.log('Updated.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                isAdmin: true,
                emailVerified: true,
                subscriptionPlan: 'premium',
                subscriptionStatus: 'active'
            }
        });

        console.log(`Created admin user: ${user.email} with password: ${password}`);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
