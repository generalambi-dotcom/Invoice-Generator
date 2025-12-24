import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST - Make a user an admin by email
 * This is a one-time setup endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: `User with email ${email} not found. Please sign up first.` },
        { status: 404 }
      );
    }

    if (existingUser.isAdmin) {
      return NextResponse.json({
        message: `User ${email} is already an admin!`,
        user: existingUser,
      });
    }

    // Update user to admin
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
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: 'Failed to make user admin: ' + error.message },
      { status: 500 }
    );
  }
}

