import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// POST: Apply to a specific lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await request.json();

    if (!message) {
        return NextResponse.json({ error: 'A message or pitch is required to apply' }, { status: 400 });
    }

    // 1. Fetch the lead and verify it's open and has capacity
    const lead = await prisma.leadEnquiry.findUnique({
        where: { id }
    });

    if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.status !== 'open' || lead.currentResponses >= lead.maxResponses) {
        return NextResponse.json({ error: 'This lead is no longer accepting applications (max 10).' }, { status: 400 });
    }

    // 2. Check if business already applied
    const existingApplication = await prisma.leadResponse.findUnique({
        where: {
            leadId_businessId: {
                leadId: id,
                businessId: user.userId
            }
        }
    });

    if (existingApplication) {
        return NextResponse.json({ error: 'You have already applied to this lead' }, { status: 400 });
    }

    // 3. Create response and increment counter
    const [, response] = await prisma.$transaction([
        prisma.leadEnquiry.update({
            where: { id },
            data: { currentResponses: { increment: 1 } }
        }),
        prisma.leadResponse.create({
            data: {
                leadId: id,
                businessId: user.userId,
                message: message,
                status: 'pending'
            }
        })
    ]);

    // Check if cap hit and close it
    if (lead.currentResponses + 1 >= lead.maxResponses) {
        await prisma.leadEnquiry.update({
            where: { id },
            data: { status: 'closed' }
        });
    }

    return NextResponse.json({ success: true, responseId: response.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to apply to lead:', error);
    return NextResponse.json({ error: 'Failed to apply to lead' }, { status: 500 });
  }
}
