import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { generateUniquePublicSlug, isPublicSlugAvailable } from '@/lib/public-invoice';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get user's public slug
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        publicSlug: true,
        name: true,
        email: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      publicSlug: dbUser.publicSlug,
      publicLink: dbUser.publicSlug 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/i/${dbUser.publicSlug}`
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching public slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public slug' },
      { status: 500 }
    );
  }
}

/**
 * POST - Generate or update public slug
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customSlug } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true, email: true, publicSlug: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let finalSlug: string;

    if (customSlug) {
      // Validate custom slug
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(customSlug)) {
        return NextResponse.json(
          { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
          { status: 400 }
        );
      }

      if (customSlug.length < 3 || customSlug.length > 50) {
        return NextResponse.json(
          { error: 'Slug must be between 3 and 50 characters' },
          { status: 400 }
        );
      }

      // Check availability (allow if it's their own slug)
      const available = await isPublicSlugAvailable(customSlug);
      if (!available && dbUser.publicSlug !== customSlug) {
        return NextResponse.json(
          { error: 'This slug is already taken. Please choose another.' },
          { status: 400 }
        );
      }

      finalSlug = customSlug;
    } else {
      // Generate unique slug
      finalSlug = await generateUniquePublicSlug(dbUser.name, dbUser.email);
    }

    // Update user with public slug
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: { publicSlug: finalSlug },
      select: { publicSlug: true },
    });

    return NextResponse.json({
      publicSlug: updatedUser.publicSlug,
      publicLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/i/${updatedUser.publicSlug}`,
      message: 'Public invoice link created successfully',
    });
  } catch (error: any) {
    console.error('Error creating public slug:', error);
    return NextResponse.json(
      { error: 'Failed to create public slug' },
      { status: 500 }
    );
  }
}

