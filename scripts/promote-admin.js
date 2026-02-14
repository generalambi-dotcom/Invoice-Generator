
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

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
    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }

    // Set up adapter
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);


    // Direct connection with adapter
    const prisma = new PrismaClient({ adapter });

    try {
        const users = await prisma.user.findMany();
        console.log('Users in DB:', users.map(u => ({ email: u.email, isAdmin: u.isAdmin })));

        if (email) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                const updated = await prisma.user.update({
                    where: { email },
                    data: { isAdmin: true },
                });
                console.log(`User ${updated.email} promoted to admin.`);
            } else {
                console.log(`User ${email} not found.`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
