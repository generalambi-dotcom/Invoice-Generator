import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { getSystemSettings } from '@/lib/settings';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Throttle AI generations to protect the shared LLM API key from cost abuse.
const aiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 generations per user per hour
    message: 'Too many AI generation requests, please try again later.',
});

const invoiceSchema = z.object({
    clientName: z.string().describe('The name of the client or company being billed. If none is mentioned, leave blank.'),
    clientEmail: z.string().describe('The email address of the client, if mentioned.'),
    clientAddress: z.string().describe('The physical address of the client, if mentioned.'),
    lineItems: z.array(z.object({
        description: z.string().describe('Description of the product or service.'),
        quantity: z.number().describe('Quantity or hours. Defaults to 1 if not specified but a price is given.'),
        rate: z.number().describe('The unit price or hourly rate as a number.'),
    })).describe('List of products or services being billed.'),
    dueDateOffsetDays: z.number().describe('Number of days from today when the invoice is due. E.g., "due in 30 days" -> 30. Defaults to 30 if not mentioned.'),
    notes: z.string().describe('Any additional notes or terms mentioned for the invoice.'),
});

export async function POST(request: NextRequest) {
    try {
        // Require an authenticated user — this endpoint spends money on the
        // shared LLM key, so it must not be open to the public.
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Per-user (falls back to per-IP) rate limit.
        const limit = aiRateLimiter(getClientIdentifier(request));
        if (!limit.allowed) {
            return NextResponse.json(
                { error: limit.message },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
            );
        }

        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (typeof prompt !== 'string' || prompt.length > 4000) {
            return NextResponse.json({ error: 'Prompt is invalid or too long' }, { status: 400 });
        }

        // 1. Fetch LLM settings from the database
        const settings = await getSystemSettings(['LLM_PROVIDER', 'LLM_API_KEY']);
        const provider = settings['LLM_PROVIDER'] || 'openai';
        const apiKey = settings['LLM_API_KEY'];

        if (!apiKey) {
            return NextResponse.json(
                { error: 'AI Generator is not configured. Please set up the API key in the Admin Settings.' },
                { status: 503 }
            );
        }

        // 2. Initialize the correct AI Provider
        let model;
        if (provider === 'deepseek') {
            const deepseek = createDeepSeek({ apiKey });
            model = deepseek('deepseek-chat');
        } else {
            const openai = createOpenAI({ apiKey });
            // Use the highly capable mini model by default for speed and cost efficiency
            model = openai('gpt-4o-mini');
        }

        // 3. Generate structured data using Vercel AI SDK
        const { object } = await generateObject({
            model,
            schema: invoiceSchema,
            prompt: `Extract the invoicing details from the following request and format them into the required structure. If a field is not explicitly mentioned or implied, leave it empty or use intelligent defaults (e.g., 1 for quantity if an item and total price are given).\n\nRequest: "${prompt}"`,
        });

        // 4. Return the structured data to the frontend
        return NextResponse.json(object);

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate invoice with AI' },
            { status: 500 }
        );
    }
}
