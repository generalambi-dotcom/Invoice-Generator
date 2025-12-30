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
    // Also check database for admin payment credentials
    // For PayPal: Check if client ID or secret is configured
    // For Paystack: Check if secret key is configured
    // For Stripe: Check if secret key OR publishable key is configured
    
    const hasPayPalEnv = !!(process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_SECRET);
    const hasPaystackEnv = !!process.env.PAYSTACK_SECRET_KEY;
    const hasStripeEnv = !!(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_PUBLISHABLE_KEY);

    // Check database for admin payment credentials
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      orderBy: { createdAt: 'asc' },
    });

    let hasPayPalDb = false;
    let hasPaystackDb = false;
    let hasStripeDb = false;

    if (adminUser) {
      const adminCredentials = await prisma.paymentCredential.findMany({
        where: { 
          userId: adminUser.id,
          isActive: true,
        },
        select: { 
          provider: true,
          publicKey: true,
          secretKey: true,
          clientId: true,
          clientSecret: true,
        },
      });

      // Check if credentials have actual values (not just existence)
      hasPayPalDb = adminCredentials.some(c => 
        c.provider === 'paypal' && c.clientId && c.clientSecret
      );
      hasPaystackDb = adminCredentials.some(c => 
        c.provider === 'paystack' && c.publicKey && c.secretKey
      );
      hasStripeDb = adminCredentials.some(c => 
        c.provider === 'stripe' && c.publicKey && c.secretKey
      );

      console.log('Admin payment credentials check:', {
        adminUserId: adminUser.id,
        credentials: adminCredentials.map(c => ({ provider: c.provider, hasKeys: !!(c.publicKey || c.clientId) })),
        hasPayPalDb,
        hasPaystackDb,
        hasStripeDb,
      });
    }

    const hasPayPal = hasPayPalEnv || hasPayPalDb;
    const hasPaystack = hasPaystackEnv || hasPaystackDb;
    const hasStripe = hasStripeEnv || hasStripeDb;

    console.log('Available payment providers:', {
      paypal: { env: hasPayPalEnv, db: hasPayPalDb, final: hasPayPal },
      paystack: { env: hasPaystackEnv, db: hasPaystackDb, final: hasPaystack },
      stripe: { env: hasStripeEnv, db: hasStripeDb, final: hasStripe },
    });

    return NextResponse.json({
      providers: {
        paypal: hasPayPal,
        paystack: hasPaystack,
        stripe: hasStripe,
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

