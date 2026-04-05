import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { Resend } from 'resend';
import { getEmailLayout } from '@/lib/email-layout';

// POST - Send a test email for a specific template
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { templateId, templateKey, to } = body;

        let template;

        if (templateId) {
            template = await prisma.emailNotificationTemplate.findUnique({
                where: { id: templateId },
            });
        } else if (templateKey) {
            template = await prisma.emailNotificationTemplate.findUnique({
                where: { key: templateKey },
            });
        }

        if (!template) {
            // Fallback for direct testing without a template ID (e.g. from design settings)
            if (templateKey === 'welcome_email') {
                // Mock template
                template = {
                    name: 'Welcome Email',
                    subject: 'Welcome to Invoice Generator! 🎉',
                    body: '<p>Hi {{userName}},</p><p>Your account is now set up and ready to go.</p>'
                };
            } else {
                return NextResponse.json({ error: 'Template not found' }, { status: 404 });
            }
        }

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
        }

        const resend = new Resend(apiKey);
        const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicegenerator.ng';
        const recipientEmail = to || user.email;

        // Replace template variables with sample data
        const sampleData: Record<string, string> = {
            '{{userName}}': 'John Doe',
            '{{userEmail}}': 'john@example.com',
            '{{verificationUrl}}': '#test-verification-link',
            '{{resetUrl}}': '#test-reset-link',
            '{{clientName}}': 'Acme Corporation',
            '{{companyName}}': 'My Company Ltd',
            '{{invoiceNumber}}': 'INV-2026-001',
            '{{amount}}': '₦150,000.00',
            '{{currency}}': '₦',
            '{{dueDate}}': 'March 15, 2026',
            '{{days}}': '7',
            '{{customMessage}}': 'Thank you for your continued business with us.',
            '{{paymentAmount}}': '₦75,000.00',
            '{{invoiceTotal}}': '₦150,000.00',
            '{{remainingBalance}}': '₦75,000.00',
            '{{totalInvoiced}}': '₦500,000.00',
            '{{totalPaid}}': '₦350,000.00',
            '{{outstandingBalance}}': '₦150,000.00',
            '{{senderName}}': 'Jane Smith',
            '{{senderEmail}}': 'jane@example.com',
            '{{subject}}': 'Test inquiry',
            '{{message}}': 'This is a test message from the contact form.',
        };

        let testSubject = template.subject;
        let testBody = template.body;

        for (const [variable, value] of Object.entries(sampleData)) {
            testSubject = testSubject.replaceAll(variable, value);
            testBody = testBody.replaceAll(variable, value);
        }

        // Use the centralized layout
        const html = await getEmailLayout({
            content: testBody,
            title: `[TEST] ${testSubject}`,
            previewText: 'This is a test email from your Admin Dashboard.',
        });

        const data = await resend.emails.send({
            from: `Invoice Generator <${fromEmail}>`,
            to: recipientEmail,
            subject: `[TEST] ${testSubject}`,
            html,
        });

        // Log the test email
        if (data.error) {
            console.error('Resend error:', data.error);
        }

        // Only log to DB if we have a real user ID (local development safety)
        if (user.userId) {
            try {
                await prisma.emailLog.create({
                    data: {
                        userId: user.userId,
                        to: recipientEmail,
                        subject: `[TEST] ${testSubject}`,
                        body: html,
                        status: data.error ? 'failed' : 'sent',
                        errorMessage: data.error ? JSON.stringify(data.error) : null,
                    },
                });
            } catch (ignore) {
                // Ignore logging errors in test mode
            }
        }

        return NextResponse.json({ success: true, sentTo: recipientEmail });
    } catch (error: any) {
        console.error('Error sending test email:', error);
        return NextResponse.json({ error: error.message || 'Failed to send test email' }, { status: 500 });
    }
}
