import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { ensureEmailPreferences } from '@/lib/email-preferences';
import { prisma } from '@/lib/db';
import { setBrevoMarketingConsent, syncContactToBrevo } from '@/lib/brevo';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const preferences = await ensureEmailPreferences(user.userId);
  return NextResponse.json({ preferences });
}

export async function PUT(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const allowed = ['lifecycleEmails', 'weeklySummary', 'productUpdates'] as const;
  const data: Record<string, boolean | Date | null> = {};
  for (const key of allowed) {
    if (typeof body[key] === 'boolean') data[key] = body[key];
  }
  if (typeof body.productUpdates === 'boolean') {
    data.marketingConsentAt = body.productUpdates ? new Date() : null;
  }

  const preferences = await prisma.emailPreference.upsert({
    where: { userId: user.userId },
    update: data,
    create: { userId: user.userId, ...data },
  });
  if (typeof body.productUpdates === 'boolean') {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true, name: true, subscriptionPlan: true },
    });
    if (dbUser) {
      if (body.productUpdates) {
        await syncContactToBrevo(
          dbUser.email,
          dbUser.name,
          ['pro', 'business', 'premium'].includes(dbUser.subscriptionPlan || '') ? 'premium' : 'free',
        );
      }
      await setBrevoMarketingConsent(dbUser.email, body.productUpdates);
    }
  }
  return NextResponse.json({ preferences });
}
