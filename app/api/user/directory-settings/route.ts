import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';

// Dummy metrics generator for Phase 2 - drives perceived value while directory is small
const generateSmartMetrics = () => {
    return {
        profileViews: Math.floor(Math.random() * (45 - 5 + 1) + 5), // Random between 5-45
        searchAppearances: Math.floor(Math.random() * (80 - 15 + 1) + 15) // Random between 15-80
    };
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

    return NextResponse.json({
        settings: directoryData,
        metrics: directoryData.directoryOptIn ? generateSmartMetrics() : null
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

    return NextResponse.json({ 
        settings: updatedUser,
        metrics: updatedUser.directoryOptIn ? generateSmartMetrics() : null 
    });

  } catch (error) {
    console.error('Failed to update directory settings:', error);
    return NextResponse.json({ error: 'Failed to update directory settings' }, { status: 500 });
  }
}
