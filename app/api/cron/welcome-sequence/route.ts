import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendSequenceEmail } from '@/lib/email';
import { differenceInDays } from 'date-fns';
import { checkCronAuth } from '@/lib/cron-auth';

export async function GET(request: Request) {
    try {
        // Only allow cron job to trigger this endpoint (mandatory CRON_SECRET)
        const authError = checkCronAuth(request);
        if (authError) return authError;

        const today = new Date();

        // Day mappings for the sequence
        const sequenceMap = {
            1: 2, // Day 1 sends Step 2
            3: 3, // Day 3 sends Step 3
            5: 4, // Day 5 sends Step 4
            7: 5, // Day 7 sends Step 5
        } as const;

        // Get all users who registered within the last 8 days to optimize query
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        const recentUsers = await prisma.user.findMany({
            where: {
                emailVerified: true,
                createdAt: {
                    gte: eightDaysAgo,
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                subscriptionPlan: true,
                subscriptionStatus: true,
                companyDefaults: { select: { id: true } },
                invoices: {
                    select: { id: true, sentAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        const results = { attempted: 0, sent: 0, errors: [] as string[] };

        for (const user of recentUsers) {
            const daysSinceRegistration = differenceInDays(today, user.createdAt);

            // Check if the delta exactly matches one of our trigger days
            const daysKey = daysSinceRegistration as keyof typeof sequenceMap;
            const stepToSend = sequenceMap[daysKey];

            if (stepToSend) {
                const invoiceCount = user.invoices.length;
                const sentCount = user.invoices.filter((invoice) => invoice.sentAt).length;
                const paid = ['pro', 'business', 'premium'].includes(user.subscriptionPlan || '') && user.subscriptionStatus === 'active';
                const relevant =
                    (stepToSend === 2 && !user.companyDefaults) ||
                    (stepToSend === 3 && invoiceCount > 0 && sentCount === 0) ||
                    (stepToSend === 4 && invoiceCount === 0) ||
                    (stepToSend === 5 && invoiceCount >= 2 && !paid);
                if (!relevant) continue;
                const subjectKey = `welcome_step_${stepToSend} `;

                // Verification: Ensure this email wasn't already sent to this user
                const existingLog = await prisma.emailLog.findFirst({
                    where: {
                        userId: user.id,
                        subject: subjectKey,
                    },
                });

                if (!existingLog) {
                    results.attempted++;

                    try {
                        const emailResult = await sendSequenceEmail({
                            to: user.email,
                            name: user.name,
                            step: stepToSend,
                        });

                        if (emailResult.success && !emailResult.skipped) {
                            await prisma.emailLog.create({
                                data: {
                                    userId: user.id,
                                    to: user.email,
                                    subject: subjectKey,
                                    body: `Sequence Step ${stepToSend} `,
                                    status: 'sent',
                                },
                            });
                            results.sent++;
                        } else if (!emailResult.skipped) {
                            results.errors.push(`Failed to send step ${stepToSend} to ${user.email}: ${emailResult.error} `);
                        }
                    } catch (e: any) {
                        results.errors.push(`Exception sending step ${stepToSend} to ${user.email}: ${e.message} `);
                    }
                }
            }
        }

        return NextResponse.json({
            message: 'Welcome sequence cron completed successfully',
            results,
        });
    } catch (error: any) {
        console.error('Welcome sequence cron error:', error);
        return NextResponse.json(
            { error: 'Internal server error while processing sequence' },
            { status: 500 }
        );
    }
}
