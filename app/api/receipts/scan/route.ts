
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the image file
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Fallback to mock logic if no API key
        if (!process.env.OPENAI_API_KEY) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return NextResponse.json({
                success: true,
                data: {
                    merchantName: 'Uber Ride',
                    date: new Date().toISOString(),
                    total: 24.50,
                    currency: 'USD',
                    items: [
                        { description: 'Trip Fare', amount: 20.00 },
                        { description: 'Tip', amount: 4.50 }
                    ],
                    confidence: 0.92
                },
                note: 'FALLBACK mock data used. Configure OPENAI_API_KEY to enable real AI scanning.'
            });
        }

        // Real AI Vision Parsing
        const buffer = Buffer.from(await (file as File).arrayBuffer());

        const { text } = await generateText({
            model: openai('gpt-4o'),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract receipt data from this image. Return ONLY valid JSON exactly matching this structure: {"merchantName": "string", "date": "ISO-string", "total": number, "currency": "USD", "items": [{"description": "string", "amount": number}], "confidence": number}. Do not include markdown format blocks (```json), just the raw JSON object.' },
                        { type: 'image', image: buffer }
                    ]
                }
            ]
        });

        // Safely parse the returned text
        let extractedData;
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            extractedData = JSON.parse(cleanText);
        } catch (e) {
            console.error('Failed to parse AI output:', text);
            throw new Error('Failed to parse AI response into JSON');
        }

        return NextResponse.json({
            success: true,
            data: extractedData
        });

    } catch (error) {
        console.error('Error scanning receipt:', error);
        return NextResponse.json({ error: 'Failed to scan receipt' }, { status: 500 });
    }
}
