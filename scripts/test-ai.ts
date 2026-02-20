import { prisma } from '../lib/db';

async function main() {
    console.log('Updating DB with API Key...');
    await prisma.systemSetting.upsert({
        where: { key: 'LLM_PROVIDER' },
        update: { value: 'deepseek' },
        create: { key: 'LLM_PROVIDER', value: 'deepseek', description: 'Active Large Language Model Provider' },
    });
    await prisma.systemSetting.upsert({
        where: { key: 'LLM_API_KEY' },
        update: { value: 'sk-09a29bdc0f104de2a65ee90d6a098299' },
        create: { key: 'LLM_API_KEY', value: 'sk-09a29bdc0f104de2a65ee90d6a098299', description: 'API Key for LLM Provider' },
    });
    console.log('API key set successfully in DB.');

    console.log('Testing the AI Generation endpoint over local fetch...');
    const prompt = "Please create an invoice for John Doe (john@example.com). Bill him 500 dollars for website design, and 150 dollars for hosting. Make it due in 15 days.";

    try {
        const res = await fetch('http://localhost:3000/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        console.log('AI Response Status:', res.status);
        console.log('AI Generated Output:');
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
