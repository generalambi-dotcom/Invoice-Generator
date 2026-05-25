import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/leads/[id]/responses
 *
 * Returns all business responses (applicants) for a given lead.
 * The lead is identified by its numeric `id`.
 * Access is gated by the customer's email (passed as ?email= query param)
 * because customers are not logged-in users of the app.
 *
 * Privacy: returns business profile info only if the business has opted in.
 * The customer's PII is NOT returned (already on the lead itself).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('email');

    if (!customerEmail) {
      return NextResponse.json({ error: 'email query param required' }, { status: 400 });
    }

    // Validate the lead belongs to this customer email
    const lead = await prisma.leadEnquiry.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        customerEmail: true,
        industry: true,
        serviceReq: true,
        status: true,
        acceptedResponseId: true,
        currentResponses: true,
        createdAt: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all responses with sanitised business info
    const responses = await prisma.leadResponse.findMany({
      where: { leadId: params.id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            industry: true,
            companySize: true,
            dirCity: true,
            dirState: true,
            verificationStatus: true,
            directoryFeatured: true,
            totalInvoiceCount: true,
            lastActiveAt: true,
            dirShowName: true,
            dirShowIndustry: true,
            dirShowLocation: true,
            dirShowSize: true,
            // Never expose email/phone directly to lead customer
            _count: {
              select: { businessReviews: { where: { approved: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Sanitise business info based on visibility toggles
    const sanitised = responses.map((r) => ({
      id: r.id,
      status: r.status,
      message: r.message,
      createdAt: r.createdAt,
      isAccepted: r.id === lead.acceptedResponseId,
      business: {
        id: r.business.id,
        name: r.business.dirShowName ? r.business.name : 'Anonymous Business',
        industry: r.business.dirShowIndustry ? r.business.industry : null,
        location:
          r.business.dirShowLocation
            ? [r.business.dirCity, r.business.dirState].filter(Boolean).join(', ') || null
            : null,
        companySize: r.business.dirShowSize ? r.business.companySize : null,
        verificationStatus: r.business.verificationStatus,
        directoryFeatured: r.business.directoryFeatured,
        totalInvoiceCount: r.business.totalInvoiceCount,
        reviewCount: r.business._count.businessReviews,
        profileUrl: `/businesses/${r.business.id}`,
      },
    }));

    return NextResponse.json({
      lead: {
        id: lead.id,
        industry: lead.industry,
        serviceReq: lead.serviceReq,
        status: lead.status,
        acceptedResponseId: lead.acceptedResponseId,
        totalResponses: lead.currentResponses,
        createdAt: lead.createdAt,
      },
      responses: sanitised,
    });
  } catch (error: any) {
    console.error('[leads/[id]/responses] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
