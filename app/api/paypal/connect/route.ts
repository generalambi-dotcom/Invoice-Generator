import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering since we use request.headers
export const dynamic = 'force-dynamic';

/**
 * Initiate PayPal OAuth connection
 * This redirects the user to PayPal to authorize our app
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isTestMode = searchParams.get('testMode') === 'true';
    
    // PayPal OAuth endpoints
    const paypalBaseUrl = isTestMode
      ? 'https://www.sandbox.paypal.com'
      : 'https://www.paypal.com';

    // For PayPal, we'll use a guided flow since PayPal doesn't have standard OAuth for API credentials
    // Instead, we'll redirect to a page that guides users through getting their credentials
    const redirectUrl = new URL('/settings/payment-methods/paypal-setup', request.url);
    redirectUrl.searchParams.set('userId', user.userId);
    redirectUrl.searchParams.set('testMode', isTestMode.toString());
    
    // Store a state token for security (optional, but good practice)
    const state = Buffer.from(`${user.userId}-${Date.now()}`).toString('base64');
    
    // In a real implementation, you might want to:
    // 1. Store the state in session/database
    // 2. Redirect to PayPal OAuth (if using Partner API)
    // 3. Handle callback
    
    // For now, we'll redirect to a setup page that guides them
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('Error initiating PayPal connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate PayPal connection' },
      { status: 500 }
    );
  }
}

