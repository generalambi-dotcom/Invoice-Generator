import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const recurringInvoices = await prisma.recurringInvoice.findMany({
            where: {
                userId: user.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(recurringInvoices);
    } catch (error) {
        console.error('Error fetching recurring invoices:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            name,
            description,
            frequency,
            interval,
            startDate,
            endDate,
            invoiceData,
            autoApprove,
            maxInvoices,
        } = body;

        // Validate required fields
        if (!name || !frequency || !startDate || !invoiceData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate next run date (initially same as start date or next interval if start date is past/today?)
        // Logic: If startDate is today or in future, nextRun is startDate.
        const start = new Date(startDate);
        const now = new Date();
        // Reset time to start of day for comparison to avoid time issues? 
        // For simplicity, let's trust the client provided date or just set nextRun = startDate

        const recurringInvoice = await prisma.recurringInvoice.create({
            data: {
                userId: user.userId,
                name,
                description,
                frequency, // 'daily', 'weekly', 'monthly', 'yearly'
                interval: interval || 1,
                startDate: start,
                endDate: endDate ? new Date(endDate) : null,
                nextRunDate: start, // First run is on start date
                invoiceData, // JSON
                autoApprove: autoApprove || false,
                maxInvoices: maxInvoices || null,
                status: 'active',
            },
        });

        return NextResponse.json(recurringInvoice);
    } catch (error) {
        console.error('Error creating recurring invoice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
