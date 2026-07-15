import { prisma } from '@/lib/db';
import { sendSubscriptionEmail, type SubscriptionEmailEvent } from '@/lib/email';

export async function notifySubscriptionEvent(
  userId: string,
  event: SubscriptionEmailEvent,
  eventKey: string,
) {
  const dedupeKey = `subscription:${userId}:${event}:${eventKey}`;
  const existing = await prisma.emailLog.findUnique({ where: { dedupeKey } });
  if (existing?.status === 'sent') return { success: true, skipped: true };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, subscriptionPlan: true, subscriptionEndDate: true },
  });
  if (!user) return { success: false, error: 'User not found' };

  const result = await sendSubscriptionEmail({
    to: user.email,
    name: user.name,
    event,
    plan: user.subscriptionPlan,
    endDate: user.subscriptionEndDate,
  });

  await prisma.emailLog.upsert({
    where: { dedupeKey },
    update: {
      status: result.success ? 'sent' : 'failed',
      errorMessage: result.error || null,
      providerMessageId: result.emailId === 'dev-mode' ? null : result.emailId,
    },
    create: {
      userId: user.id,
      to: user.email,
      subject: `subscription_${event}`,
      body: '',
      status: result.success ? 'sent' : 'failed',
      errorMessage: result.error || null,
      providerMessageId: result.emailId === 'dev-mode' ? null : result.emailId,
      dedupeKey,
      templateKey: `subscription_${event}`,
      metadata: { event, eventKey, plan: user.subscriptionPlan },
    },
  });

  return result;
}
