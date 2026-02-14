
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

// PATCH - Update user (subscription, admin status, password)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = getAuthenticatedUser(request);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            email,
            isAdmin,
            subscriptionPlan,
            subscriptionStatus,
            password
        } = body;

        const data: any = {};
        if (name) data.name = name;
        if (email) data.email = email.toLowerCase();
        if (typeof isAdmin === 'boolean') data.isAdmin = isAdmin;
        if (subscriptionPlan) data.subscriptionPlan = subscriptionPlan;
        if (subscriptionStatus) data.subscriptionStatus = subscriptionStatus;

        // Check if password update is requested
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        // Handle Subscription Dates if status changes to active
        if (subscriptionPlan === 'premium' && subscriptionStatus === 'active') {
            // If enabling premium, set dates if not present or expired
            // simplistic logic: give 1 year if setting to active manually
            data.subscriptionStartDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            data.subscriptionEndDate = endDate;
        } else if (subscriptionPlan === 'free') {
            data.subscriptionStatus = 'active';
            data.subscriptionEndDate = null;
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                subscriptionPlan: true,
                subscriptionStatus: true,
                updatedAt: true
            }
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = getAuthenticatedUser(request);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Prevent deleting self
        if (admin.userId === params.id) {
            return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
