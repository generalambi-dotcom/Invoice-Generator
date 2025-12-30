import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import axios from 'axios';
import { decryptPaymentCredential } from '@/lib/encryption';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Verify PayPal payment and activate subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Payment token is required' },
        { status: 400 }
      );
    }

    // Get PayPal credentials
    let paypalClientId: string | undefined = process.env.PAYPAL_CLIENT_ID;
    let paypalClientSecret: string | undefined = process.env.PAYPAL_CLIENT_SECRET;
    let isTestMode = false;

    // Try to get from admin's payment credentials in database
    if (!paypalClientId || !paypalClientSecret) {
      const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true },
        orderBy: { createdAt: 'asc' },
      });

      if (adminUser) {
        const paypalCredential = await prisma.paymentCredential.findUnique({
          where: {
            userId_provider: {
              userId: adminUser.id,
              provider: 'paypal',
            },
          },
        });

        if (paypalCredential?.clientId && paypalCredential?.clientSecret && paypalCredential.isActive) {
          const decrypted = decryptPaymentCredential({
            clientId: paypalCredential.clientId,
            clientSecret: paypalCredential.clientSecret,
          });
          paypalClientId = decrypted.clientId || undefined;
          paypalClientSecret = decrypted.clientSecret || undefined;
          isTestMode = paypalCredential.isTestMode;
        }
      }
    }

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json(
        { error: 'PayPal is not configured' },
        { status: 500 }
      );
    }

    const paypalBaseUrl = isTestMode
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    // Get access token
    const authResponse = await axios.post(
      `${paypalBaseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: paypalClientId,
          password: paypalClientSecret,
        },
        timeout: 10000,
      }
    );

    const accessToken = authResponse.data.access_token;
    if (!accessToken) {
      throw new Error('Failed to get PayPal access token');
    }

    // Capture the order using the token
    const captureResponse = await axios.post(
      `${paypalBaseUrl}/v2/checkout/orders/${token}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );

    const order = captureResponse.data;
    
    if (order.status === 'COMPLETED') {
      // Find the user from the purchase unit reference
      const purchaseUnit = order.purchase_units?.[0];
      const referenceId = purchaseUnit?.reference_id;
      
      let userId = user.userId;
      
      if (referenceId && referenceId.startsWith('subscription_')) {
        const parts = referenceId.split('_');
        if (parts.length >= 2) {
          userId = parts[1];
        }
      }

      // Verify the user matches
      if (userId !== user.userId) {
        return NextResponse.json(
          { error: 'Payment verification failed - user mismatch' },
          { status: 403 }
        );
      }

      // Update user subscription
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days subscription

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: 'premium',
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: endDate,
          subscriptionPaymentMethod: 'paypal',
        },
      });

      console.log(`✅ Subscription activated for user ${userId} via PayPal: ${token}`);

      return NextResponse.json({
        success: true,
        message: 'Subscription activated successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Payment not completed', status: order.status },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying PayPal payment:', error);
    if (error.response) {
      console.error('PayPal API error:', error.response.data);
    }
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

