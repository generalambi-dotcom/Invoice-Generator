import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST - Make a user an admin by email
 * Restricted to existing admins. (Previously unauthenticated, which allowed
 * anyone to grant themselves admin.)
 */
export async function POST(request: NextRequest) {
  try {
    // Only an existing admin may promote other users to admin.
    const caller = getAuthenticatedUser(request);
    if (!caller || !caller.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase();

    // Check if user exists (using same method as login route)
    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: `User with email ${email} not found. Please sign up first at /signup` },
        { status: 404 }
      );
    }

    if (existingUser.isAdmin) {
      return NextResponse.json({
        message: `User ${email} is already an admin!`,
        user: existingUser,
      });
    }

    // Update user to admin (using same method as other routes)
    const updatedUser = await prisma.user.update({
      where: { email: lowerEmail },
      data: { isAdmin: true },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    return NextResponse.json({
      message: `Successfully made ${updatedUser.email} an admin!`,
      user: updatedUser,
    });
  } catch (error: any) {
    // Log full detail server-side; return a generic message to the client so we
    // don't leak internal error text, Prisma codes, or stack traces.
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: 'Failed to make user admin' },
      { status: 500 }
    );
  }
}

