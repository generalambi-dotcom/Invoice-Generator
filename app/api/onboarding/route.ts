import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { layout, companyInfo } = body;

    if (!layout || !companyInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const companyDefaults = await prisma.companyDefaults.upsert({
      where: { userId: user.id },
      update: {
        defaultLayout: layout,
        companyInfo: companyInfo,
      },
      create: {
        userId: user.id,
        defaultLayout: layout,
        companyInfo: companyInfo,
      },
    });

    return NextResponse.json({ success: true, companyDefaults });
  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
