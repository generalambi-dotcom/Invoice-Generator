import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPaymentLink } from '@/lib/payment-links';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { decryptPaymentCredential } from '@/lib/encryption';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';
import { logRequest, logError } from '@/lib/request-logger';

// POST - Generate payment link for invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  let user: any = null;
  
  try {
    user = getAuthenticatedUser(request);
    const invoiceId = params.id;
    
    // Rate limiting
    const identifier = user ? `user:${user.userId}` : getClientIdentifier(request);
    const limiter = rateLimit(rateLimitConfigs.payment);
    const limitResult = limiter(identifier);
    
    if (!limitResult.allowed) {
      logRequest(request, { userId: user?.userId, statusCode: 429, responseTime: Date.now() - startTime });
      return NextResponse.json(
        { error: limitResult.message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfigs.payment.max.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
          },
        }
      );
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body; // 'paypal' | 'paystack' | 'stripe'

    // Validation
    if (!provider) {
      return NextResponse.json(
        { error: 'Payment provider is required' },
        { status: 400 }
      );
    }

    if (!['paypal', 'paystack', 'stripe'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid payment provider. Must be paypal, paystack, or stripe' },
        { status: 400 }
      );
    }

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: user.userId },
      include: { user: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get user's payment credentials
    const credential = await prisma.paymentCredential.findUnique({
      where: {
        userId_provider: {
          userId: user.userId,
          provider,
        },
      },
    });

    if (!credential || !credential.isActive) {
      return NextResponse.json(
        { error: `Payment credentials for ${provider} not configured` },
        { status: 400 }
      );
    }

    // Decrypt credentials before using them
    const decryptedCredential = {
      ...credential,
      ...decryptPaymentCredential({
        publicKey: credential.publicKey,
        secretKey: credential.secretKey,
        clientId: credential.clientId,
        clientSecret: credential.clientSecret,
      }),
    };

    // Generate payment link
    const paymentLink = await createPaymentLink({
      invoice,
      provider,
      credential: decryptedCredential,
    });

    // Update invoice with payment link
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentLink,
        paymentProvider: provider,
      },
    });

    const responseTime = Date.now() - startTime;
    logRequest(request, { userId: user.userId, statusCode: 200, responseTime });
    
    return NextResponse.json({
      invoice: updatedInvoice,
      paymentLink,
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitConfigs.payment.max.toString(),
        'X-RateLimit-Remaining': (limitResult.remaining - 1).toString(),
        'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
      },
    });
  } catch (error: any) {
    logError(request, error, user?.userId);
    return NextResponse.json(
      { error: 'Failed to generate payment link' },
      { status: 500 }
    );
  }
}

