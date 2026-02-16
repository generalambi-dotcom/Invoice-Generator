import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const recurringInvoice = await prisma.recurringInvoice.findUnique({
            where: {
                id: params.id,
                userId: user.userId,
            },
        });

        if (!recurringInvoice) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(recurringInvoice);
    } catch (error) {
        console.error('Error fetching recurring invoice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Check if user has premium subscription
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { subscriptionPlan: true, subscriptionStatus: true, isAdmin: true }
        });

        const isPremium = dbUser?.isAdmin || (dbUser?.subscriptionPlan === 'premium' && dbUser?.subscriptionStatus === 'active');

        if (!isPremium) {
            return NextResponse.json(
                { error: 'Recurring invoices are a premium feature. Please upgrade to access this feature.' },
                { status: 403 }
            );
        }

        // Check ownership
        const existing = await prisma.recurringInvoice.findUnique({
            where: { id: params.id, userId: user.userId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const updated = await prisma.recurringInvoice.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                frequency: body.frequency,
                interval: body.interval,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : null, // Handle null explicitly
                nextRunDate: body.nextRunDate ? new Date(body.nextRunDate) : undefined,
                invoiceData: body.invoiceData,
                autoApprove: body.autoApprove,
                maxInvoices: body.maxInvoices,
                status: body.status,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating recurring invoice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has premium subscription
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { subscriptionPlan: true, subscriptionStatus: true, isAdmin: true }
        });

        const isPremium = dbUser?.isAdmin || (dbUser?.subscriptionPlan === 'premium' && dbUser?.subscriptionStatus === 'active');

        if (!isPremium) {
            return NextResponse.json(
                { error: 'Recurring invoices are a premium feature. Please upgrade to access this feature.' },
                { status: 403 }
            );
        }

        // Verify ownership
        const existing = await prisma.recurringInvoice.findUnique({
            where: { id: params.id, userId: user.userId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.recurringInvoice.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting recurring invoice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
