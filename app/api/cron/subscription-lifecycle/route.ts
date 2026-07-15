import { NextResponse } from 'next/server';
import { addHours, addDays, startOfDay } from 'date-fns';
import { prisma } from '@/lib/db';
import { checkCronAuth } from '@/lib/cron-auth';
import { notifySubscriptionEvent } from '@/lib/subscription-notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  const today = startOfDay(new Date());
  const windows = [7, 3];
  let sent = 0;
  let failed = 0;

  for (const days of windows) {
    const start = addDays(today, days);
    const end = addHours(start, 24);
    const users = await prisma.user.findMany({
      where: {
        subscriptionStatus: { in: ['active', 'cancelled'] },
        subscriptionPlan: { in: ['pro', 'business', 'premium'] },
        subscriptionEndDate: { gte: start, lt: end },
      },
      select: { id: true },
    });

    for (const user of users) {
      const result = await notifySubscriptionEvent(user.id, 'ending', `${days}-days`);
      if (result.success) sent++;
      else failed++;
    }
  }

  return NextResponse.json({ success: true, sent, failed });
}
