
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';

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

        // TODO: Integrate actual AI Vision API (e.g., OpenAI GPT-4o or Google Gemini)
        // For now, we simulate a "scan" delay and return reasonable mock data
        // to verify the frontend integration.

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

        // Mock Extraction Result
        const mockResult = {
            merchantName: 'Uber Ride',
            date: new Date().toISOString(),
            total: 24.50,
            currency: 'USD',
            items: [
                { description: 'Trip Fare', amount: 20.00 },
                { description: 'Tip', amount: 4.50 }
            ],
            confidence: 0.92
        };

        return NextResponse.json({
            success: true,
            data: mockResult,
            note: 'This is valid mock data. Configure OPENAI_API_KEY to enable real scanning.'
        });

    } catch (error) {
        console.error('Error scanning receipt:', error);
        return NextResponse.json({ error: 'Failed to scan receipt' }, { status: 500 });
    }
}
