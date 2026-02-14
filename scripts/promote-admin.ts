import { prisma } from '../lib/db';

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { isAdmin: true },
        });
        console.log(`User ${user.email} promoted to admin.`);
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
