import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@invoicegenerator.ng';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.invoicegenerator.ng';

/**
 * PATCH /api/leads/[id]/responses/[responseId]
 *
 * Customer accepts or rejects a business response to their lead.
 * Gated by customerEmail in body (no login required for customers).
 *
 * Body: { action: 'accept' | 'reject', email: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    const body = await request.json();
    const { action, email } = body as { action: 'accept' | 'reject'; email: string };

    if (!action || !email) {
      return NextResponse.json({ error: 'action and email are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be accept or reject' }, { status: 400 });
    }

    // Validate the lead belongs to this customer
    const lead = await prisma.leadEnquiry.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          where: { id: params.responseId },
          include: {
            business: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const response = lead.responses[0];
    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    if (lead.status === 'closed') {
      return NextResponse.json({ error: 'This lead is already closed' }, { status: 409 });
    }

    if (action === 'accept') {
      // Accept this response: close the lead, mark all others as rejected
      await prisma.$transaction([
        // Mark accepted response
        prisma.leadResponse.update({
          where: { id: params.responseId },
          data: { status: 'accepted' },
        }),
        // Reject all other pending responses
        prisma.leadResponse.updateMany({
          where: { leadId: params.id, id: { not: params.responseId }, status: 'pending' },
          data: { status: 'rejected' },
        }),
        // Close the lead and record who won
        prisma.leadEnquiry.update({
          where: { id: params.id },
          data: {
            status: 'closed',
            acceptedResponseId: params.responseId,
          },
        }),
      ]);

      // Fire-and-forget: email the winning business
      if (resend && response.business.email) {
        const reviewUrl = `${BASE_URL}/businesses/enquire/review?leadId=${lead.id}&email=${encodeURIComponent(lead.customerEmail)}`;
        resend.emails.send({
          from: FROM_EMAIL,
          to: response.business.email,
          subject: `You've been selected for a job lead — ${lead.industry}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #0f766e;">You've been selected! 🎉</h2>
              <p>A customer has chosen <strong>${response.business.name}</strong> in response to their lead for <strong>${lead.industry}</strong> services.</p>
              <p><strong>What they need:</strong><br/>${lead.serviceReq}</p>
              <p>Please reach out to the customer directly to discuss the project:</p>
              <p><strong>Name:</strong> ${lead.customerName}<br/>
              <strong>Email:</strong> ${lead.customerEmail}${lead.customerPhone ? `<br/><strong>Phone:</strong> ${lead.customerPhone}` : ''}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
              <p style="color: #6b7280; font-size: 0.875rem;">
                This lead came through the <a href="${BASE_URL}/businesses">InvoiceGenerator.ng Business Directory</a>.
              </p>
            </div>
          `,
        }).catch((err: Error) => console.error('[leads] Failed to email winning business:', err));

        // Also send review invite to customer after a short delay via the same email
        resend.emails.send({
          from: FROM_EMAIL,
          to: lead.customerEmail,
          subject: `Leave a review for ${response.business.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #0f766e;">How did it go?</h2>
              <p>Hi ${lead.customerName},</p>
              <p>You connected with <strong>${response.business.name}</strong> through the InvoiceGenerator.ng directory.</p>
              <p>Would you mind leaving a short review? It helps other businesses and customers on the platform.</p>
              <a href="${reviewUrl}" style="display: inline-block; background: #0f766e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Leave a Review</a>
              <p style="color: #6b7280; font-size: 0.875rem;">This only takes 60 seconds.</p>
            </div>
          `,
        }).catch((err: Error) => console.error('[leads] Failed to send review invite:', err));

        // Mark review invite as sent
        await prisma.leadEnquiry.update({
          where: { id: params.id },
          data: { reviewInviteSent: true },
        }).catch(() => {}); // non-critical
      }

      return NextResponse.json({
        success: true,
        message: `Lead closed — ${response.business.name} has been selected.`,
      });
    }

    // action === 'reject'
    await prisma.leadResponse.update({
      where: { id: params.responseId },
      data: { status: 'rejected' },
    });

    return NextResponse.json({
      success: true,
      message: 'Response rejected.',
    });
  } catch (error: any) {
    console.error('[leads/[id]/responses/[responseId]] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
  }
}
