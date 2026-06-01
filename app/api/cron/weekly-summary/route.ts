import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWeeklySummaryEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel limit

/**
 * Weekly business summary cron.
 * Emails each active user a "this week" recap (invoices sent, invoiced, paid,
 * overdue) as a return trigger. Reuses the existing email layout + EmailLog
 * dedupe pattern (mirrors welcome-sequence / reminders crons).
 *
 * Schedule: weekly (see vercel.json). Dedupe key = weekly_summary:<weekStart>.
 */
export async function GET(req: NextRequest) {
  // Auth — same Bearer pattern as the other crons.
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    // Dedupe key — one summary per user per calendar week.
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // back to Sunday
    const dedupeSubject = `weekly_summary:${weekStart.toISOString().split('T')[0]}`;

    // Candidate invoices: activity this week OR currently overdue.
    const candidateInvoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { createdAt: { gte: weekAgo } },
          { sentAt: { gte: weekAgo } },
          { paymentDate: { gte: weekAgo } },
          {
            AND: [
              { paymentStatus: { notIn: ['paid', 'cancelled'] } },
              { dueDate: { lt: now } },
            ],
          },
        ],
      },
      select: {
        userId: true,
        total: true,
        paidAmount: true,
        currency: true,
        createdAt: true,
        sentAt: true,
        paymentStatus: true,
        dueDate: true,
      },
    });

    // Group invoices by user.
    const byUser = new Map<string, typeof candidateInvoices>();
    for (const inv of candidateInvoices) {
      const list = byUser.get(inv.userId) || [];
      list.push(inv);
      byUser.set(inv.userId, list);
    }

    // Payments collected this week, grouped by user.
    const weekPayments = await prisma.payment.findMany({
      where: { paidAt: { gte: weekAgo }, status: 'completed' },
      select: { userId: true, amount: true, currency: true },
    });
    const paymentsByUser = new Map<string, typeof weekPayments>();
    for (const p of weekPayments) {
      const list = paymentsByUser.get(p.userId) || [];
      list.push(p);
      paymentsByUser.set(p.userId, list);
    }

    const userIds = Array.from(new Set([...byUser.keys(), ...paymentsByUser.keys()]));

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true },
    });

    const fmt = (n: number) =>
      (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const results = { candidates: userIds.length, sent: 0, skipped: 0, errors: 0 };

    for (const user of users) {
      try {
        const invs = byUser.get(user.id) || [];
        const pays = paymentsByUser.get(user.id) || [];

        // Pick the user's dominant currency across this week's activity.
        const currencyCount = new Map<string, number>();
        for (const i of invs) currencyCount.set(i.currency, (currencyCount.get(i.currency) || 0) + 1);
        for (const p of pays) currencyCount.set(p.currency, (currencyCount.get(p.currency) || 0) + 1);
        let currency = 'NGN';
        let best = -1;
        for (const [cur, count] of currencyCount) {
          if (count > best) { best = count; currency = cur; }
        }

        // Stats — only sum amounts in the dominant currency to stay coherent.
        const invoicesSent = invs.filter((i) => i.sentAt && i.sentAt >= weekAgo).length;
        const totalInvoiced = invs
          .filter((i) => i.currency === currency && i.createdAt >= weekAgo)
          .reduce((s, i) => s + (i.total || 0), 0);
        const totalPaid = pays
          .filter((p) => p.currency === currency)
          .reduce((s, p) => s + (p.amount || 0), 0);
        const overdue = invs.filter(
          (i) =>
            i.currency === currency &&
            i.paymentStatus !== 'paid' &&
            i.paymentStatus !== 'cancelled' &&
            i.dueDate < now
        );
        const overdueCount = overdue.length;
        const overdueAmount = overdue.reduce((s, i) => s + Math.max(0, (i.total || 0) - (i.paidAmount || 0)), 0);

        // Nothing meaningful to report → skip (don't nag dormant users).
        if (invoicesSent === 0 && totalInvoiced === 0 && totalPaid === 0 && overdueCount === 0) {
          results.skipped++;
          continue;
        }

        if (!user.email) {
          results.skipped++;
          continue;
        }

        // Dedupe — already sent this week?
        const existing = await prisma.emailLog.findFirst({
          where: { userId: user.id, subject: dedupeSubject },
        });
        if (existing) {
          results.skipped++;
          continue;
        }

        const res = await sendWeeklySummaryEmail({
          to: user.email,
          userName: user.name || 'there',
          currency,
          invoicesSent,
          totalInvoiced: fmt(totalInvoiced),
          totalPaid: fmt(totalPaid),
          overdueCount,
          overdueAmount: fmt(overdueAmount),
        });

        if (res.success) {
          await prisma.emailLog.create({
            data: {
              userId: user.id,
              to: user.email,
              subject: dedupeSubject,
              body: 'Weekly business summary',
              status: 'sent',
            },
          });
          results.sent++;
        } else {
          results.errors++;
        }
      } catch (e: any) {
        results.errors++;
        console.error(`Weekly summary error for user ${user.id}:`, e?.message);
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error: any) {
    console.error('Weekly summary cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
