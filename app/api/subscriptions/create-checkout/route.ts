import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import Stripe from 'stripe';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Create Stripe Checkout Session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, plan, amount, currency, userEmail } = body;

    // Validate input
    if (!userId || !plan || !amount || !currency || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user matches authenticated user
    if (user.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get Stripe credentials - check database first, then environment variables
    let stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    // Try to get from admin's payment credentials in database
    if (!stripeSecretKey) {
      const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true },
        orderBy: { createdAt: 'asc' },
      });

      if (adminUser) {
        const stripeCredential = await prisma.paymentCredential.findUnique({
          where: {
            userId_provider: {
              userId: adminUser.id,
              provider: 'stripe',
            },
          },
        });

        if (stripeCredential?.secretKey && stripeCredential.isActive) {
          try {
            // Decrypt the secret key
            const { decryptPaymentCredential } = require('@/lib/encryption');
            const decrypted = decryptPaymentCredential({
              secretKey: stripeCredential.secretKey,
            });
            stripeSecretKey = decrypted.secretKey || undefined;
            console.log('Stripe secret key decrypted from database');
          } catch (decryptError) {
            console.error('Error decrypting Stripe secret key:', decryptError);
            // Continue to try environment variable
          }
        } else {
          console.log('Stripe credential not found or inactive:', {
            found: !!stripeCredential,
            hasSecretKey: !!stripeCredential?.secretKey,
            isActive: stripeCredential?.isActive,
          });
        }
      }
    }

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please configure Stripe in Admin Dashboard or set STRIPE_SECRET_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });

    // Get user details
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate subscription duration (30 days for monthly)
    const subscriptionDuration = 30; // days

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // One-time payment for subscription
      customer_email: dbUser.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Premium Subscription - ${plan}`,
              description: `Premium access for ${subscriptionDuration} days`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        plan,
        type: 'subscription',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://invoicegenerator.ng'}/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://invoicegenerator.ng'}/upgrade?canceled=true`,
    });

    console.log(`✅ Stripe checkout session created for user ${userId}: ${session.id}`);

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

