import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get available payment providers for subscriptions
 * Returns which payment providers are configured and available for subscription payments
 */
export async function GET(request: NextRequest) {
  try {
    // Check environment variables for secret keys (required for backend processing)
    // For PayPal: Check if client ID or secret is configured
    // For Paystack: Check if secret key is configured
    // For Stripe: Check if secret key is configured
    
    const hasPayPal = !!(process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_SECRET);
    const hasPaystack = !!process.env.PAYSTACK_SECRET_KEY;
    const hasStripe = !!process.env.STRIPE_SECRET_KEY;

    // Also check if any admin has configured payment credentials in the database
    // This is a fallback check for user-specific credentials
    const paystackCreds = await prisma.paymentCredential.findFirst({
      where: { provider: 'paystack', isActive: true },
      select: { id: true },
    });

    const stripeCreds = await prisma.paymentCredential.findFirst({
      where: { provider: 'stripe', isActive: true },
      select: { id: true },
    });

    const paypalCreds = await prisma.paymentCredential.findFirst({
      where: { provider: 'paypal', isActive: true },
      select: { id: true },
    });

    // A provider is available if:
    // 1. Environment variables are set (for global/subscription payments), OR
    // 2. At least one user has configured credentials (for invoice payments)
    // For subscriptions, we primarily need env vars, but we'll show it if any credentials exist
    return NextResponse.json({
      providers: {
        paypal: hasPayPal || !!paypalCreds,
        paystack: hasPaystack || !!paystackCreds,
        stripe: hasStripe || !!stripeCreds,
      },
    });
  } catch (error: any) {
    console.error('Error checking payment providers:', error);
    return NextResponse.json(
      { error: 'Failed to check payment providers' },
      { status: 500 }
    );
  }
}

