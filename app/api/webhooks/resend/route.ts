import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });
  }

  const payload = await request.text();
  let event: any;
  try {
    event = new Webhook(secret).verify(payload, {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const providerMessageId = event?.data?.email_id;
  if (!providerMessageId) return NextResponse.json({ received: true, matched: false });

  const timestamp = event.created_at ? new Date(event.created_at) : new Date();
  const updates: Record<string, unknown> = {};
  if (event.type === 'email.delivered') Object.assign(updates, { status: 'delivered', deliveredAt: timestamp });
  if (event.type === 'email.bounced') Object.assign(updates, { status: 'bounced', bouncedAt: timestamp, errorMessage: event.data?.bounce?.message || 'Email bounced' });
  if (event.type === 'email.complained') Object.assign(updates, { status: 'complained', complainedAt: timestamp });
  if (event.type === 'email.opened') Object.assign(updates, { openedAt: timestamp });
  if (event.type === 'email.clicked') Object.assign(updates, { clickedAt: timestamp });

  if (Object.keys(updates).length === 0) return NextResponse.json({ received: true, matched: false });
  const result = await prisma.emailLog.updateMany({ where: { providerMessageId }, data: updates });
  return NextResponse.json({ received: true, matched: result.count > 0 });
}
