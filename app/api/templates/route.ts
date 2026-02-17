import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// GET - List all templates for a user
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templates = await prisma.invoiceTemplate.findMany({
            where: { userId: user.userId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                currency: true,
                theme: true,
                isDefault: true,
                usageCount: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ templates });
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

// POST - Create a new template (or save from invoice)
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, companyInfo, clientInfo, lineItems, currency, theme, notes, bankDetails, terms, taxRate, discountRate } = body;

        if (!name) {
            return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
        }

        const template = await prisma.invoiceTemplate.create({
            data: {
                userId: user.userId,
                name,
                description: description || null,
                companyInfo: companyInfo || null,
                clientInfo: clientInfo || null,
                lineItems: lineItems || null,
                currency: currency || 'USD',
                theme: theme || 'slate',
                notes: notes || null,
                bankDetails: bankDetails || null,
                terms: terms || null,
                taxRate: taxRate || 0,
                discountRate: discountRate || 0,
            },
        });

        return NextResponse.json({ template }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
