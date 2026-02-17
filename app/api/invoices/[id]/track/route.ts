import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 1x1 transparent PNG pixel (68 bytes)
const TRACKING_PIXEL = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

// GET - Returns a 1x1 tracking pixel and records email open
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const invoiceId = params.id;

        // Update EmailLog - mark as opened (first open only)
        await prisma.emailLog.updateMany({
            where: {
                invoiceId,
                openedAt: null,
            },
            data: {
                openedAt: new Date(),
            },
        });

        // Also update Invoice.viewedAt
        await prisma.invoice.updateMany({
            where: {
                id: invoiceId,
                viewedAt: null,
            },
            data: {
                viewedAt: new Date(),
            },
        });
    } catch (error) {
        // Silently fail - don't break the image for the client
        console.error('Error recording email open:', error);
    }

    // Always return the pixel regardless of tracking success
    return new NextResponse(TRACKING_PIXEL, {
        status: 200,
        headers: {
            'Content-Type': 'image/png',
            'Content-Length': TRACKING_PIXEL.length.toString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}
