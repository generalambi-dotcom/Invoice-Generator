import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Authorize a cron request.
 *
 * CRON_SECRET is MANDATORY: if it is unset we reject every request rather than
 * leaving the endpoint open (these routes can send mass emails, downgrade
 * subscriptions, generate invoices, etc.). Vercel Cron automatically sends
 * `Authorization: Bearer <CRON_SECRET>` when the secret is configured.
 *
 * Returns a NextResponse to return early when unauthorized, or null when the
 * caller is allowed to proceed.
 */
export function checkCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error('CRON_SECRET is not set; rejecting cron request.');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  const provided = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Constant-time comparison; length check guards timingSafeEqual's equal-length requirement.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
