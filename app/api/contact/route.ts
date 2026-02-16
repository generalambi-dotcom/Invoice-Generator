
import { NextRequest, NextResponse } from 'next/server';
import { sendSupportEmail } from '@/lib/email';
import { z } from 'zod';

// Validation schema
const contactFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = contactFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, email, subject, message } = validation.data;

        // Send email
        const result = await sendSupportEmail({
            name,
            email,
            subject,
            message,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: 'Failed to send message. Please try again later.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Message sent successfully!' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
