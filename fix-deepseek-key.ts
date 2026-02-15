import 'dotenv/config';
import { prisma } from './lib/db';

async function main() {
    console.log('--- Clearing Corrupted DeepSeek Settings ---');
    try {
        const deleted = await prisma.lLMSettings.deleteMany({
            where: { provider: 'deepseek' }
        });
        console.log(`Deleted ${deleted.count} DeepSeek settings records.`);
        console.log('You can now go to the dashboard and re-enter your API key.');
    } catch (e) {
        console.error('Error deleting settings:', e);
    }
}

main();
