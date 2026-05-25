import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@invoicegenerator.ng';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.invoicegenerator.ng';

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

    // Notify customer on first application (fire-and-forget)
    if (!lead.customerNotified && resend) {
        const responsesUrl = `${BASE_URL}/businesses/leads/${id}?email=${encodeURIComponent(lead.customerEmail)}`;
        resend.emails.send({
            from: FROM_EMAIL,
            to: lead.customerEmail,
            subject: `A business has responded to your ${lead.industry} enquiry`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #0f766e;">You have a response!</h2>
                <p>Hi ${lead.customerName},</p>
                <p>A business has responded to your enquiry for <strong>${lead.industry}</strong> services on the InvoiceGenerator.ng directory.</p>
                <p>View all responses and choose the business you'd like to work with:</p>
                <a href="${responsesUrl}" style="display: inline-block; background: #0f766e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">View Responses</a>
                <p style="color: #6b7280; font-size: 0.875rem;">You may receive up to ${lead.maxResponses} business responses before the lead closes.</p>
              </div>
            `,
        }).then(() => {
            // Mark customer as notified (non-blocking)
            prisma.leadEnquiry.update({
                where: { id },
                data: { customerNotified: true }
            }).catch(() => {});
        }).catch((err: Error) => console.error('[apply] Failed to notify customer:', err));
    }

    return NextResponse.json({ success: true, responseId: response.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to apply to lead:', error);
    return NextResponse.json({ error: 'Failed to apply to lead' }, { status: 500 });
  }
}
