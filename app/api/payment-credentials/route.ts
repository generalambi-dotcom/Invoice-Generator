import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { encryptPaymentCredential, decryptPaymentCredential } from '@/lib/encryption';

// GET - Get user's payment credentials
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credentials = await prisma.paymentCredential.findMany({
      where: { userId: user.userId, isActive: true },
      select: {
        id: true,
        provider: true,
        publicKey: true,
        isTestMode: true,
        createdAt: true,
        // Don't return secret keys
      },
    });

    // Decrypt public keys for display (public keys are less sensitive but still encrypted)
    const decryptedCredentials = credentials.map((cred: {
      id: string;
      provider: string;
      publicKey: string | null;
      isTestMode: boolean;
      createdAt: Date;
    }) => {
      try {
        return {
          ...cred,
          publicKey: cred.publicKey ? decryptPaymentCredential({ publicKey: cred.publicKey }).publicKey : null,
        };
      } catch {
        // If decryption fails, return as-is
        return cred;
      }
    });

    return NextResponse.json({ credentials: decryptedCredentials });
  } catch (error: any) {
    console.error('Error fetching payment credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment credentials' },
      { status: 500 }
    );
  }
}

// POST - Create/update payment credentials
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, publicKey, secretKey, clientId, clientSecret, isTestMode } = body;

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

    // Provider-specific validation
    if (provider === 'paystack' && (!publicKey || !secretKey)) {
      return NextResponse.json(
        { error: 'Paystack requires both public key and secret key' },
        { status: 400 }
      );
    }

    if (provider === 'stripe' && (!publicKey || !secretKey)) {
      return NextResponse.json(
        { error: 'Stripe requires both public key and secret key' },
        { status: 400 }
      );
    }

    if (provider === 'paypal' && (!clientId || !clientSecret)) {
      return NextResponse.json(
        { error: 'PayPal requires both client ID and client secret' },
        { status: 400 }
      );
    }

    // Encrypt sensitive credentials before storing
    const encrypted = encryptPaymentCredential({
      publicKey,
      secretKey,
      clientId,
      clientSecret,
    });

        const credential = await prisma.paymentCredential.upsert({
          where: {
            userId_provider: {
              userId: user.userId,
              provider,
            },
          },
          update: {
            publicKey: encrypted.publicKey || undefined,
            secretKey: encrypted.secretKey || undefined,
            clientId: encrypted.clientId || undefined,
            clientSecret: encrypted.clientSecret || undefined,
            isTestMode: isTestMode ?? false,
            updatedAt: new Date(),
          },
          create: {
            userId: user.userId,
            provider,
            publicKey: encrypted.publicKey || null,
            secretKey: encrypted.secretKey || null,
            clientId: encrypted.clientId || null,
            clientSecret: encrypted.clientSecret || null,
            isTestMode: isTestMode ?? false,
          },
        });

    // Don't return secret keys
    const { secretKey: _, clientSecret: __, ...safeCredential } = credential;

    return NextResponse.json({ 
      credential: safeCredential,
      message: 'Payment credentials saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving payment credentials:', error);
    return NextResponse.json(
      { error: 'Failed to save payment credentials' },
      { status: 500 }
    );
  }
}

// DELETE - Remove payment credentials
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    if (!['paypal', 'paystack', 'stripe'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid payment provider' },
        { status: 400 }
      );
    }

    await prisma.paymentCredential.delete({
      where: {
        userId_provider: {
          userId: user.userId,
          provider,
        },
      },
    });

    return NextResponse.json({ message: 'Payment credentials deleted' });
  } catch (error: any) {
    console.error('Error deleting payment credentials:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment credentials' },
      { status: 500 }
    );
  }
}

