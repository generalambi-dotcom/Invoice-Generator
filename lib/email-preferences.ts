import { prisma } from '@/lib/db';

export type OptionalEmailCategory = 'lifecycle' | 'weekly' | 'product';

export async function ensureEmailPreferences(userId: string) {
  return prisma.emailPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function canSendOptionalEmail(
  userId: string,
  category: OptionalEmailCategory,
): Promise<boolean> {
  const prefs = await ensureEmailPreferences(userId);
  if (category === 'weekly') return prefs.weeklySummary;
  if (category === 'product') return prefs.productUpdates;
  return prefs.lifecycleEmails;
}

export async function lifecycleEmailContext(
  email: string,
  category: OptionalEmailCategory,
): Promise<{ allowed: boolean; unsubscribeUrl?: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  if (!user) return { allowed: true };

  const prefs = await ensureEmailPreferences(user.id);
  const allowed = category === 'weekly'
    ? prefs.weeklySummary
    : category === 'product'
      ? prefs.productUpdates
      : prefs.lifecycleEmails;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invoicegenerator.ng';
  return {
    allowed,
    unsubscribeUrl: `${appUrl}/api/email-preferences/unsubscribe?token=${encodeURIComponent(prefs.unsubscribeToken)}&category=${category}`,
  };
}

export async function recordMarketingConsent(userId: string, consent: boolean) {
  return prisma.emailPreference.upsert({
    where: { userId },
    update: {
      productUpdates: consent,
      marketingConsentAt: consent ? new Date() : null,
    },
    create: {
      userId,
      productUpdates: consent,
      marketingConsentAt: consent ? new Date() : null,
    },
  });
}
