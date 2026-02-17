import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// GET - Fetch all email notification templates
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templates = await prisma.emailNotificationTemplate.findMany({
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });

        return NextResponse.json({ templates });
    } catch (error) {
        console.error('Error fetching email templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

// PUT - Update an email notification template
export async function PUT(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, subject, body: templateBody, enabled } = body;

        if (!id) {
            return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
        }

        const updateData: any = {};
        if (typeof subject === 'string') updateData.subject = subject;
        if (typeof templateBody === 'string') updateData.body = templateBody;
        if (typeof enabled === 'boolean') updateData.enabled = enabled;

        const updated = await prisma.emailNotificationTemplate.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, template: updated });
    } catch (error) {
        console.error('Error updating email template:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}
