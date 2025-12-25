import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * PUT - Update default payment provider
 */
export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = `user:${user.userId}`;
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: limitResult.message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { defaultPaymentProvider } = body;

    // Validate provider if provided
    if (defaultPaymentProvider && !['paypal', 'paystack', 'stripe'].includes(defaultPaymentProvider)) {
      return NextResponse.json(
        { error: 'Invalid payment provider. Must be paypal, paystack, or stripe' },
        { status: 400 }
      );
    }

    // Verify the provider has active credentials if setting a default
    if (defaultPaymentProvider) {
      const credential = await prisma.paymentCredential.findUnique({
        where: {
          userId_provider: {
            userId: user.userId,
            provider: defaultPaymentProvider as 'paypal' | 'paystack' | 'stripe',
          },
        },
      });

      if (!credential || !credential.isActive) {
        return NextResponse.json(
          { error: `Payment credentials for ${defaultPaymentProvider} not configured or inactive` },
          { status: 400 }
        );
      }
    }

    // Update or create company defaults
    const defaults = await prisma.companyDefaults.upsert({
      where: { userId: user.userId },
      update: {
        defaultPaymentProvider: defaultPaymentProvider || null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.userId,
        companyInfo: {}, // Empty object, will be filled when user saves company info
        defaultPaymentProvider: defaultPaymentProvider || null,
      },
    });

    return NextResponse.json({
      defaults,
      message: 'Default payment provider updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating default payment provider:', error);
    return NextResponse.json(
      { error: 'Failed to update default payment provider' },
      { status: 500 }
    );
  }
}

