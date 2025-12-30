import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { encryptPaymentCredential, decryptPaymentCredential } from '@/lib/encryption';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get admin payment configuration
 * Returns global payment credentials for subscription payments
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get admin payment credentials (stored with a special admin userId or global flag)
    // For now, we'll use a special approach: store admin credentials with userId = 'admin' or check for admin user
    // Actually, let's check if there's a system user or use the first admin's credentials
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      orderBy: { createdAt: 'asc' }, // Get the first admin
    });

    if (!adminUser) {
      return NextResponse.json({ config: null });
    }

    // Get all payment credentials for admin user
    const credentials = await prisma.paymentCredential.findMany({
      where: { userId: adminUser.id, isActive: true },
      select: {
        id: true,
        provider: true,
        publicKey: true,
        isTestMode: true,
        createdAt: true,
        // Don't return secret keys directly
      },
    });

    // Decrypt public keys for display
    const decryptedCredentials = credentials.map((cred) => {
      try {
        const decrypted = decryptPaymentCredential({
          publicKey: cred.publicKey,
        });
        return {
          ...cred,
          publicKey: decrypted.publicKey || cred.publicKey,
        };
      } catch {
        return cred;
      }
    });

    return NextResponse.json({ 
      config: {
        credentials: decryptedCredentials,
        adminUserId: adminUser.id,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin payment config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST/PUT - Save admin payment configuration
 * Stores global payment credentials for subscription payments
 */
export async function POST(request: NextRequest) {
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

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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

    // Store as admin user's credentials (for subscription payments)
    // Use the current admin user's ID
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
        isActive: true,
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
        isActive: true,
      },
    });

    // Don't return secret keys
    const { secretKey: _, clientSecret: __, ...safeCredential } = credential;

    return NextResponse.json({ 
      credential: safeCredential,
      message: 'Payment configuration saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving admin payment config:', error);
    return NextResponse.json(
      { error: 'Failed to save payment configuration' },
      { status: 500 }
    );
  }
}

// Alias PUT to POST
export const PUT = POST;

/**
 * DELETE - Remove admin payment configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isAdmin: true },
    });

    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const provider = searchParams.get('provider');

    if (id) {
      // Delete by ID
      const credential = await prisma.paymentCredential.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!credential) {
        return NextResponse.json(
          { error: 'Payment credential not found' },
          { status: 404 }
        );
      }

      // Only allow deleting own credentials or if admin
      if (credential.userId !== user.userId && !dbUser.isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      await prisma.paymentCredential.delete({
        where: { id },
      });

      return NextResponse.json({ message: 'Payment configuration deleted' });
    } else if (provider) {
      // Delete by provider
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

      return NextResponse.json({ message: 'Payment configuration deleted' });
    } else {
      return NextResponse.json(
        { error: 'Either id or provider is required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting admin payment config:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment configuration' },
      { status: 500 }
    );
  }
}

