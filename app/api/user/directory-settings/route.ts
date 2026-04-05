import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Real metrics from DirectoryEvent table
const getRealMetrics = async (userId: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [profileViews, searchAppearances] = await Promise.all([
        prisma.directoryEvent.count({
            where: {
                businessId: userId,
                type: 'profile_view',
                createdAt: { gte: thirtyDaysAgo },
            }
        }),
        prisma.directoryEvent.count({
            where: {
                businessId: userId,
                type: 'search_appearance',
                createdAt: { gte: thirtyDaysAgo },
            }
        }),
    ]);

    return { profileViews, searchAppearances };
};

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const directoryData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
          directoryOptIn: true,
          hasSeenDirectoryPrompt: true,
          dirShowName: true,
          dirShowIndustry: true,
          dirShowLocation: true,
          dirShowSize: true,
          dirShowActivity: true,
      }
    });

    if (!directoryData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch real metrics only if opted in
    const metrics = directoryData.directoryOptIn 
      ? await getRealMetrics(user.userId) 
      : null;

    return NextResponse.json({
        settings: directoryData,
        metrics,
    });

  } catch (error) {
    console.error('Failed to fetch directory settings:', error);
    return NextResponse.json({ error: 'Failed to fetch directory settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
        directoryOptIn,
        hasSeenDirectoryPrompt,
        dirShowName,
        dirShowIndustry,
        dirShowLocation,
        dirShowSize,
        dirShowActivity
    } = body;

    const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: {
            ...(directoryOptIn !== undefined && { directoryOptIn }),
            ...(hasSeenDirectoryPrompt !== undefined && { hasSeenDirectoryPrompt }),
            ...(dirShowName !== undefined && { dirShowName }),
            ...(dirShowIndustry !== undefined && { dirShowIndustry }),
            ...(dirShowLocation !== undefined && { dirShowLocation }),
            ...(dirShowSize !== undefined && { dirShowSize }),
            ...(dirShowActivity !== undefined && { dirShowActivity }),
        },
        select: {
            directoryOptIn: true,
            hasSeenDirectoryPrompt: true,
            dirShowName: true,
            dirShowIndustry: true,
            dirShowLocation: true,
            dirShowSize: true,
            dirShowActivity: true,
        }
    });

    const metrics = updatedUser.directoryOptIn 
      ? await getRealMetrics(user.userId) 
      : null;

    return NextResponse.json({ 
        settings: updatedUser,
        metrics,
    });

  } catch (error) {
    console.error('Failed to update directory settings:', error);
    return NextResponse.json({ error: 'Failed to update directory settings' }, { status: 500 });
  }
}
