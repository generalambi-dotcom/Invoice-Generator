import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import {
  extractProfileData,
  calculateCompleteness,
  getCurrentTier,
  getNextTier,
  getMissingFields,
  getNudgeSuggestion,
} from '@/lib/profile-completeness';

/**
 * GET - Retrieve user profile with completeness score
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        industry: true,
        businessType: true,
        companySize: true,
        monthlyRevenueRange: true,
        yearFounded: true,
        cacNumber: true,
        tinNumber: true,
        linkedinUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        profileCompleteness: true,
        lastProfilePrompt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get company defaults for completeness calculation
    const companyDefaults = await prisma.companyDefaults.findUnique({
      where: { userId: authUser.userId },
    });

    // Get invoice stats for contextual nudges
    const invoiceCount = await prisma.invoice.count({
      where: { userId: authUser.userId },
    });

    const clientCount = await prisma.client.count({
      where: { userId: authUser.userId },
    });

    // Check if any invoice uses VAT/tax
    const hasVatInvoice = await prisma.invoice.findFirst({
      where: { userId: authUser.userId, taxRate: { gt: 0 } },
      select: { id: true },
    });

    // Calculate completeness
    const profileData = extractProfileData(user, companyDefaults);
    const completeness = calculateCompleteness(profileData);
    const currentTier = getCurrentTier(completeness);
    const nextTier = getNextTier(completeness);
    const missingFields = getMissingFields(profileData);

    // Get contextual nudge
    const nudge = getNudgeSuggestion(profileData, {
      invoiceCount,
      hasUsedVat: !!hasVatInvoice,
      hasClients: clientCount > 0,
      firstInvoiceCreated: invoiceCount > 0,
    });

    // Update stored completeness score if it changed
    if (user.profileCompleteness !== completeness) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { profileCompleteness: completeness },
      });
    }

    return NextResponse.json({
      user,
      companyDefaults: companyDefaults?.companyInfo || null,
      completeness: {
        score: completeness,
        currentTier,
        nextTier,
        missingFields: missingFields.slice(0, 5), // Top 5 missing
        filledFields: profileData,
      },
      nudge,
      stats: {
        invoiceCount,
        clientCount,
      },
    });
  } catch (error) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH - Update user profile fields
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Whitelist of allowed fields to update
    const allowedFields = [
      'industry',
      'businessType',
      'companySize',
      'monthlyRevenueRange',
      'yearFounded',
      'cacNumber',
      'tinNumber',
      'linkedinUrl',
      'instagramUrl',
      'twitterUrl',
      'lastProfilePrompt',
    ];

    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'yearFounded') {
          updateData[field] = body[field] ? parseInt(body[field], 10) : null;
        } else if (field === 'lastProfilePrompt') {
          updateData[field] = body[field] ? new Date(body[field]) : new Date();
        } else {
          updateData[field] = body[field] || null;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
      select: {
        id: true,
        industry: true,
        businessType: true,
        companySize: true,
        monthlyRevenueRange: true,
        yearFounded: true,
        cacNumber: true,
        tinNumber: true,
        linkedinUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        profileCompleteness: true,
      },
    });

    // Recalculate completeness
    const companyDefaults = await prisma.companyDefaults.findUnique({
      where: { userId: authUser.userId },
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    const profileData = extractProfileData(fullUser, companyDefaults);
    const completeness = calculateCompleteness(profileData);

    // Update stored score
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { profileCompleteness: completeness },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      completeness,
    });
  } catch (error) {
    console.error('Profile PATCH Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
