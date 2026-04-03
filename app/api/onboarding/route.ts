import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { extractProfileData, calculateCompleteness } from '@/lib/profile-completeness';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { layout, companyInfo, industry, businessType } = body;

    if (!layout || !companyInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save company defaults
    const companyDefaults = await prisma.companyDefaults.upsert({
      where: { userId: user.userId },
      update: {
        defaultLayout: layout,
        companyInfo: companyInfo,
      },
      create: {
        userId: user.userId,
        defaultLayout: layout,
        companyInfo: companyInfo,
      },
    });

    // Save industry and businessType to User model (lead gen fields)
    const updateData: Record<string, any> = {};
    if (industry) updateData.industry = industry;
    if (businessType) updateData.businessType = businessType;

    if (Object.keys(updateData).length > 0) {
      // Also recalculate profile completeness
      const fullUser = await prisma.user.findUnique({ where: { id: user.userId } });
      const profileData = extractProfileData({ ...fullUser, ...updateData }, { companyInfo });
      const completeness = calculateCompleteness(profileData);
      updateData.profileCompleteness = completeness;

      await prisma.user.update({
        where: { id: user.userId },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true, companyDefaults });
  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

