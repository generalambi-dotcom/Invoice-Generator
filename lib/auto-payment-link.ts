/**
 * Auto-generate payment links for invoices
 * Checks for user's payment credentials and generates link automatically
 */

import { prisma } from './db';
import { createPaymentLink } from './payment-links';
import { decryptPaymentCredential } from './encryption';

/**
 * Get user's default payment provider from CompanyDefaults
 * Falls back to first available active credential if no default is set
 */
export async function getDefaultPaymentProvider(userId: string): Promise<'paypal' | 'paystack' | 'stripe' | null> {
  try {
    // First check CompanyDefaults for default provider
    const defaults = await prisma.companyDefaults.findUnique({
      where: { userId },
      select: { defaultPaymentProvider: true },
    });

    if (defaults?.defaultPaymentProvider) {
      // Verify this provider has active credentials
      const credential = await prisma.paymentCredential.findUnique({
        where: {
          userId_provider: {
            userId,
            provider: defaults.defaultPaymentProvider as 'paypal' | 'paystack' | 'stripe',
          },
        },
      });

      if (credential?.isActive) {
        return defaults.defaultPaymentProvider as 'paypal' | 'paystack' | 'stripe';
      }
    }

    // Fall back to first available active credential
    const credentials = await prisma.paymentCredential.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc', // Use most recently added
      },
      take: 1,
    });

    if (credentials.length > 0) {
      return credentials[0].provider as 'paypal' | 'paystack' | 'stripe';
    }

    return null;
  } catch (error) {
    console.error('Error getting default payment provider:', error);
    return null;
  }
}

/**
 * Auto-generate payment link for an invoice if credentials are available
 * Returns the payment link if generated, null otherwise
 */
export async function autoGeneratePaymentLink(
  invoiceId: string,
  userId: string,
  total: number
): Promise<{ paymentLink: string; provider: string } | null> {
  // Only generate if invoice has a positive total
  if (!total || total <= 0) {
    return null;
  }

  try {
    // Get default payment provider
    const provider = await getDefaultPaymentProvider(userId);
    
    if (!provider) {
      // No payment credentials configured
      return null;
    }

    // Get invoice with user data
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      return null;
    }

    // Get payment credentials for the provider
    const credential = await prisma.paymentCredential.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!credential || !credential.isActive) {
      return null;
    }

    // Decrypt credentials
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
      invoice: invoice as any,
      provider,
      credential: decryptedCredential,
    });

    return { paymentLink, provider };
  } catch (error) {
    // Silently fail - don't block invoice creation if payment link generation fails
    console.error('Error auto-generating payment link:', error);
    return null;
  }
}

