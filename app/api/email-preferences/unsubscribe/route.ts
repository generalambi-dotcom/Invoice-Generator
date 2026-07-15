import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setBrevoMarketingConsent } from '@/lib/brevo';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const category = request.nextUrl.searchParams.get('category') || 'lifecycle';
  if (!token) return NextResponse.redirect(new URL('/unsubscribe?status=invalid', request.url));

  const preference = await prisma.emailPreference.findUnique({ where: { unsubscribeToken: token } });
  if (!preference) return NextResponse.redirect(new URL('/unsubscribe?status=invalid', request.url));

  const data = category === 'weekly'
    ? { weeklySummary: false }
    : category === 'product'
      ? { productUpdates: false, marketingConsentAt: null }
      : { lifecycleEmails: false };
  await prisma.emailPreference.update({ where: { id: preference.id }, data });
  if (category === 'product') {
    const user = await prisma.user.findUnique({ where: { id: preference.userId }, select: { email: true } });
    if (user) await setBrevoMarketingConsent(user.email, false);
  }

  return NextResponse.redirect(
    new URL(`/unsubscribe?status=success&category=${encodeURIComponent(category)}`, request.url),
  );
}
