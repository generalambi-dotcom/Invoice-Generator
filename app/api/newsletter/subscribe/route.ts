import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
        return false;
    }

    entry.count++;
    return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, name } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const apiKey = process.env.BREVO_API_KEY;
        const listId = process.env.BREVO_LIST_ID;

        if (!apiKey) {
            console.error('Brevo API key not configured');
            return NextResponse.json(
                { error: 'Newsletter service is not configured. Please contact the administrator.' },
                { status: 503 }
            );
        }

        // Build request body for Brevo Contacts API
        const brevoBody: any = {
            email: email.trim().toLowerCase(),
            updateEnabled: true, // Update if contact already exists
        };

        if (name && typeof name === 'string' && name.trim()) {
            brevoBody.attributes = {
                FIRSTNAME: name.trim(),
            };
        }

        if (listId) {
            brevoBody.listIds = [parseInt(listId, 10)];
        }

        // Call Brevo API
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify(brevoBody),
        });

        if (response.ok || response.status === 201) {
            return NextResponse.json({
                success: true,
                message: 'Successfully subscribed to the newsletter!',
            });
        }

        // Handle "contact already exists" as success
        if (response.status === 204) {
            return NextResponse.json({
                success: true,
                message: 'You are already subscribed!',
            });
        }

        // Handle duplicate contact error from Brevo
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === 'duplicate_parameter') {
            return NextResponse.json({
                success: true,
                message: 'You are already subscribed!',
            });
        }

        console.error('Brevo API error:', response.status, errorData);
        return NextResponse.json(
            { error: 'Failed to subscribe. Please try again later.' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}

// GET - Check if newsletter/popup is enabled (public, no auth needed)
export async function GET() {
    const apiKey = process.env.BREVO_API_KEY;
    const popupEnabled = process.env.BREVO_POPUP_ENABLED !== 'false';

    return NextResponse.json({
        enabled: !!apiKey,
        popupEnabled: !!apiKey && popupEnabled,
    });
}
