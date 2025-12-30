import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Handle PayPal webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, resource } = body;

    console.log('PayPal webhook received:', event_type);

    // Handle payment capture (when order is completed)
    if (event_type === 'PAYMENT.CAPTURE.COMPLETED' || event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = resource?.id || resource?.order_id;
      const amount = resource?.amount?.value ? parseFloat(resource.amount.value) : 0;
      const currency = resource?.amount?.currency_code || 'USD';
      const payerEmail = resource?.payer?.email_address;

      console.log(`PayPal payment completed: Order ${orderId}, Amount: ${amount} ${currency}`);

      // Try to find the user by email or order metadata
      // For subscriptions, we need to match the order to a user
      // The order ID might be in the return URL or we can check recent upgrade attempts
      
      // For now, we'll check if there's metadata in the resource
      // In a production system, you'd want to store the order ID when creating the checkout
      // and match it here

      // Check if this is a subscription payment by looking at the purchase unit
      const purchaseUnit = resource?.purchase_units?.[0];
      const referenceId = purchaseUnit?.reference_id;
      
      if (referenceId && referenceId.startsWith('subscription_')) {
        // Extract userId from reference_id: subscription_{userId}_{timestamp}
        const parts = referenceId.split('_');
        if (parts.length >= 2) {
          const userId = parts[1];
          
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

          console.log(`✅ Subscription activated for user ${userId} via PayPal: ${orderId}`);
          console.log(`💳 Subscription payment: ${amount} ${currency} for user ${userId}`);
        }
      } else if (payerEmail) {
        // Fallback: try to find user by email
        const user = await prisma.user.findUnique({
          where: { email: payerEmail },
        });

        if (user) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionPlan: 'premium',
              subscriptionStatus: 'active',
              subscriptionStartDate: new Date(),
              subscriptionEndDate: endDate,
              subscriptionPaymentMethod: 'paypal',
            },
          });

          console.log(`✅ Subscription activated for user ${user.id} via PayPal (matched by email): ${orderId}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

