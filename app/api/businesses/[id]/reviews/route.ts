import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/businesses/[id]/reviews
 * Returns approved reviews for a public business profile.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.businessReview.findMany({
        where: { businessId: params.id, approved: true },
        select: {
          id: true,
          reviewerName: true,
          rating: true,
          comment: true,
          verified: true,
          createdAt: true,
        },
        orderBy: [
          { verified: 'desc' },  // verified reviews first
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.businessReview.count({ where: { businessId: params.id, approved: true } }),
    ]);

    // Calculate average rating
    const ratingAgg = await prisma.businessReview.aggregate({
      where: { businessId: params.id, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        averageRating: ratingAgg._avg.rating
          ? Math.round(ratingAgg._avg.rating * 10) / 10
          : null,
        totalRatings: ratingAgg._count.rating,
      },
    });
  } catch (error: any) {
    console.error('[businesses/[id]/reviews] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

/**
 * POST /api/businesses/[id]/reviews
 * Submit a review for a business.
 *
 * Open reviews: anyone can submit (admin must approve before it shows).
 * Verified reviews: submitted with a leadId proving the reviewer used the business.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reviewerName, reviewerEmail, rating, comment, leadId } = body as {
      reviewerName: string;
      reviewerEmail?: string;
      rating: number;
      comment?: string;
      leadId?: string;
    };

    // Validation
    if (!reviewerName?.trim()) {
      return NextResponse.json({ error: 'reviewerName is required' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: 'rating must be an integer between 1 and 5' }, { status: 400 });
    }

    // Check the business exists and is in the directory
    const business = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, directoryOptIn: true },
    });
    if (!business || !business.directoryOptIn) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // If a leadId is provided, verify the reviewer was the customer on that lead
    // and that the lead was closed with this business as the winner
    let verified = false;
    if (leadId && reviewerEmail) {
      const lead = await prisma.leadEnquiry.findUnique({
        where: { id: leadId },
        select: {
          customerEmail: true,
          status: true,
          acceptedResponseId: true,
          responses: {
            where: { id: { equals: undefined } }, // resolved below
            select: { id: true, businessId: true },
          },
        },
      });

      // Verify: email matches, lead is closed, and the accepted response is for THIS business
      if (
        lead &&
        lead.customerEmail.toLowerCase() === reviewerEmail.toLowerCase() &&
        lead.status === 'closed' &&
        lead.acceptedResponseId
      ) {
        const winningResponse = await prisma.leadResponse.findUnique({
          where: { id: lead.acceptedResponseId },
          select: { businessId: true },
        });
        if (winningResponse?.businessId === params.id) {
          verified = true;
        }
      }
    }

    const review = await prisma.businessReview.create({
      data: {
        businessId: params.id,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail?.trim() || null,
        rating,
        comment: comment?.trim() || null,
        verified,
        approved: false, // admin approves before it shows publicly
        leadId: leadId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: verified
        ? 'Thank you! Your verified review has been submitted and will appear after a quick check.'
        : 'Thank you! Your review has been submitted and will appear after admin approval.',
      reviewId: review.id,
      verified,
    });
  } catch (error: any) {
    console.error('[businesses/[id]/reviews] POST error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
