import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { Resend } from 'resend';

// POST - Send a test email for a specific template
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { templateId, to } = body;

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
        }

        const template = await prisma.emailNotificationTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
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

        // Wrap body in a styled container
        const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 12px 20px; text-align: center;">
        <span style="color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 1px;">⚡ TEST EMAIL — ${template.name}</span>
      </div>
      <div style="padding: 24px;">
        ${testBody}
      </div>
      <div style="background: #f9fafb; padding: 12px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">This is a test email sent from the Admin Email Notifications panel.</p>
      </div>
    </div>`;

        await resend.emails.send({
            from: `InvoiceNaija <${fromEmail}>`,
            to: recipientEmail,
            subject: `[TEST] ${testSubject}`,
            html,
        });

        return NextResponse.json({ success: true, sentTo: recipientEmail });
    } catch (error: any) {
        console.error('Error sending test email:', error);
        return NextResponse.json({ error: error.message || 'Failed to send test email' }, { status: 500 });
    }
}
