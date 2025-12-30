import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import axios from 'axios';
import { decryptPaymentCredential } from '@/lib/encryption';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Create PayPal Checkout Order for subscription
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

    // Get PayPal credentials - check database first, then environment variables
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
          // Decrypt the credentials
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
        { error: 'PayPal is not configured. Please configure PayPal in Admin Dashboard or set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in environment variables.' },
        { status: 500 }
      );
    }

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://invoicegenerator.ng';
    const paypalBaseUrl = isTestMode
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    try {
      // Step 1: Get PayPal access token
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

      // Step 2: Create PayPal order for subscription
      const orderResponse = await axios.post(
        `${paypalBaseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: `subscription_${userId}_${Date.now()}`,
              description: `Premium Subscription - ${plan}`,
              amount: {
                currency_code: currency.toUpperCase() || 'USD',
                value: amount.toFixed(2),
              },
              invoice_id: `SUB-${userId}-${Date.now()}`,
            },
          ],
          application_context: {
            brand_name: 'Invoice Generator.ng',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: `${baseUrl}/upgrade?success=true&provider=paypal&token={token}`,
            cancel_url: `${baseUrl}/upgrade?canceled=true&provider=paypal`,
          },
          payment_source: {
            paypal: {
              experience_context: {
                payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                brand_name: 'Invoice Generator.ng',
                locale: 'en-US',
                landing_page: 'BILLING',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
              },
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );

      // Find approval URL in links array
      const approvalLink = orderResponse.data.links?.find(
        (link: any) => link.rel === 'approve'
      );

      if (approvalLink?.href) {
        // Store order ID in database for webhook processing
        // We'll use the order ID to match the payment later
        console.log(`✅ PayPal order created for user ${userId}: ${orderResponse.data.id}`);

        return NextResponse.json({
          checkoutUrl: approvalLink.href,
          orderId: orderResponse.data.id,
        });
      }

      throw new Error('Failed to create PayPal order - no approval URL returned');
    } catch (error: any) {
      console.error('Error creating PayPal checkout:', error);
      if (error.response) {
        console.error('PayPal API error:', error.response.data);
        return NextResponse.json(
          { 
            error: 'Failed to create PayPal checkout',
            details: process.env.NODE_ENV === 'development' ? error.response.data : undefined,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { 
          error: 'Failed to create PayPal checkout',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating PayPal checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

