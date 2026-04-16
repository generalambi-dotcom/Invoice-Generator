import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { Resend } from 'resend';

// Only init Resend if key exists (prevents build failures if empty locally)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST: Public endpoint to create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.serviceReq || !body.customerName || !body.customerEmail || !body.urgency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lead = await prisma.leadEnquiry.create({
      data: {
        industry: body.industry || 'General',
        serviceReq: body.serviceReq,
        isRemote: body.isRemote || false,
        locationCity: body.locationCity || null,
        locationState: body.locationState || null,
        urgency: body.urgency,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || null,
        status: 'open',
        maxResponses: 10,
        currentResponses: 0,
      }
    });

    // Notify matching businesses
    try {
        const matchingBusinesses = await prisma.user.findMany({
            where: {
                // Must be opted into directory
                directoryOptIn: true,
                // Match industry if provided
                ...(body.industry ? { industry: body.industry } : {}),
                // Location matching logic (if not remote mode)
                OR: [
                    body.isRemote ? {} : { dirState: { equals: body.locationState, mode: 'insensitive' } },
                    { dirState: null } // Or they operate nationwide
                ].filter(condition => Object.keys(condition).length > 0) as any[]
            },
            select: { email: true, name: true }
        });

        if (matchingBusinesses.length > 0 && resend) {
            const bccEmails = matchingBusinesses.map(b => b.email).filter(Boolean);
            
            // Send in batches of 50 via Resend BCC to preserve privacy
            if (bccEmails.length > 0) {
               await resend.emails.send({
                   from: 'InvoiceGenerator Leads <leads@invoicegenerator.ng>',
                   to: ['hello@invoicegenerator.ng'], // Dummy primary recipient
                   bcc: bccEmails.slice(0, 50), // Cap at 50 for API limits
                   subject: `New Lead: ${body.industry} Request in ${body.locationState || 'your area'}`,
                   html: `
                    <h2>New Lead Opportunity!</h2>
                    <p>A new customer is actively looking for services in your industry.</p>
                    <p><strong>Service Requested:</strong> ${body.serviceReq}</p>
                    <p><strong>Urgency:</strong> ${body.urgency}</p>
                    <br/>
                    <p>Log into your <a href="https://www.invoicegenerator.ng/dashboard/leads">Dashboard</a> now to claim this lead before the 10-applicant cap is reached!</p>
                   `
               });
            }
        }
    } catch (notifyError) {
        console.error('[Leads] Non-fatal error notifying businesses:', notifyError);
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

// GET: Protected endpoint for businesses to view matching leads
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business settings
    const businessUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
          dirCity: true,
          dirState: true,
          industry: true,
      }
    });

    if (!businessUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const businessIndustry = businessUser.industry;

    const url = new URL(request.url);
    const filterTab = url.searchParams.get('tab') || 'available'; // 'available' or 'applied'

    if (filterTab === 'applied') {
        // Fetch leads this business has applied to
        const appliedResponses = await prisma.leadResponse.findMany({
            where: { businessId: user.userId },
            include: { lead: true },
            orderBy: { createdAt: 'desc' }
        });
        
        return NextResponse.json({ leads: appliedResponses });
    }

    // Fetch AVAILABLE leads
    // Matches industry, is open, has less than maxResponses, and either remote OR matches location
    const availableLeads = await prisma.leadEnquiry.findMany({
        where: {
            status: 'open',
            // Match industry if the business set one
            ...(businessIndustry ? { industry: businessIndustry } : {}),
            
            // Cannot exceed cap
            currentResponses: { lt: 10 },
            
            // Exclude leads this business already applied to
            responses: {
                none: { businessId: user.userId }
            },

            // Location matching logic: 
            // If the lead is remote, it matches everyone. 
            // If the lead requires location, the business must match the state.
            OR: [
                { isRemote: true },
                // Allow matches if business didn't set geography yet, or if geography matches
                businessUser.dirState ? { locationState: { equals: businessUser.dirState, mode: 'insensitive' as any } } : {},
            ].filter(condition => Object.keys(condition).length > 0) as any[]
        },
        orderBy: { createdAt: 'desc' },
        // IMPORTANT: In "available" state, we hide the customer contact details so the business can't steal the lead
        select: {
            id: true,
            industry: true,
            serviceReq: true,
            isRemote: true,
            locationCity: true,
            locationState: true,
            urgency: true,
            createdAt: true,
            currentResponses: true,
            maxResponses: true,
            customerName: true, // Only returning the name for display purposes (e.g., "John D.")
        }
    });

    // Anonymize the name a bit (John Doe -> John D.)
    const anonymizedLeads = availableLeads.map(lead => {
        const nameParts = lead.customerName.split(' ');
        const sanitizedName = nameParts.length > 1 
            ? `${nameParts[0]} ${nameParts[1].charAt(0)}.` 
            : nameParts[0];

        return {
            ...lead,
            customerName: sanitizedName
        };
    });

    return NextResponse.json({ leads: anonymizedLeads });

  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
