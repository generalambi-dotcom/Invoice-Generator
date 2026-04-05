import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = getAuthenticatedUser(request);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        invoices: true,
                        payments: true,
                        clients: true,
                        estimates: true,
                        creditNotes: true,
                        recurringInvoices: true,
                        invoiceTemplates: true,
                        sentEmails: true,
                        posts: true,
                        notes: true,
                        tasks: true,
                        timeLogs: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch recent invoices
        const recentInvoices = await prisma.invoice.findMany({
            where: { userId },
            select: {
                id: true,
                invoiceNumber: true,
                total: true,
                currency: true,
                paymentStatus: true,
                type: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Fetch clients
        const recentClients = await prisma.client.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Fetch recent emails
        const recentEmails = await prisma.emailLog.findMany({
            where: { userId },
            select: {
                id: true,
                to: true,
                subject: true,
                status: true,
                sentAt: true,
                openedAt: true
            },
            orderBy: { sentAt: 'desc' },
            take: 5
        });

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
                lastActiveAt: user.lastActiveAt,
                businessPulseScore: user.businessPulseScore,
                directoryOptIn: user.directoryOptIn,
                profileCompleteness: user.profileCompleteness
            },
            counts: user._count,
            recentInvoices,
            recentClients,
            recentEmails
        });

    } catch (error: any) {
        console.error('Error fetching user activity:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user activity' },
            { status: 500 }
        );
    }
}
