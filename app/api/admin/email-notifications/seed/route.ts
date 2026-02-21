import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// POST - Seed default email notification templates
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const defaultTemplates = [
            // Auth
            {
                key: 'email_verification',
                name: 'Email Verification',
                description: 'Sent when a user registers to verify their email address',
                category: 'auth',
                subject: 'Verify your email address — InvoiceNaija',
                body: '<p>Hi {{userName}},</p><p>Please verify your email address by clicking the link below:</p><p><a href="{{verificationUrl}}">Verify Email</a></p><p>This link expires in 24 hours.</p>',
                variables: JSON.stringify(['{{userName}}', '{{verificationUrl}}']),
            },
            {
                key: 'welcome_email',
                name: 'Welcome Email',
                description: 'Sent after a user successfully registers or verifies their email',
                category: 'auth',
                subject: 'Welcome to InvoiceNaija! 🎉',
                body: '<p>Hi {{userName}},</p><p>Welcome to InvoiceNaija! Your account is now set up and ready to go.</p><p>Here are some things you can do right away:</p><ul><li>Create your first invoice</li><li>Add your company details</li><li>Set up payment methods</li></ul><p>If you have any questions, feel free to reach out to our support team.</p><p>Happy invoicing!<br/>The InvoiceNaija Team</p>',
                variables: JSON.stringify(['{{userName}}', '{{userEmail}}']),
            },
            {
                key: 'password_reset',
                name: 'Password Reset',
                description: 'Sent when a user requests to reset their password',
                category: 'auth',
                subject: 'Reset your password — InvoiceNaija',
                body: '<p>Hi {{userName}},</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="{{resetUrl}}">Reset Password</a></p><p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>',
                variables: JSON.stringify(['{{userName}}', '{{resetUrl}}']),
            },
            {
                key: 'welcome_step_1',
                name: 'Welcome Sequence: Step 1',
                description: 'Sent immediately after registration to prompt first invoice creation.',
                category: 'auth',
                subject: '👉 Your invoice tool is ready 🇳🇬',
                body: '<p>Hi {{userName}},</p><p>Welcome to InvoiceGenerator.</p><p>You can now:</p><ul style="margin: 0; padding-left: 20px; line-height: 1.8;"><li>✔ Create professional invoices in Naira or USD</li><li>✔ Send invoices via email or WhatsApp</li><li>✔ Use AI to write faster invoice descriptions</li></ul><p style="margin-top: 20px;">Start your first invoice here:</p>',
                variables: JSON.stringify(['{{userName}}']),
            },
            {
                key: 'welcome_step_2',
                name: 'Welcome Sequence: Step 2',
                description: 'Day 1 activation push reminding users to add their branding.',
                category: 'auth',
                subject: '👉 Most Nigerian freelancers forget this…',
                body: '<p>Hi {{userName}},</p><p>Adding your company name and logo makes your invoices look more professional to clients.</p><p>Finish setting up your first invoice here:</p>',
                variables: JSON.stringify(['{{userName}}']),
            },
            {
                key: 'welcome_step_3',
                name: 'Welcome Sequence: Step 3',
                description: 'Day 3 email introducing WhatsApp invoice sharing.',
                category: 'auth',
                subject: '👉 Send invoices via WhatsApp in seconds',
                body: '<p>Hi {{userName}},</p><p>Many Nigerian freelancers send invoices through WhatsApp.</p><p>With Premium, you can send invoices instantly without downloading PDFs.</p><p>See how it works:</p>',
                variables: JSON.stringify(['{{userName}}']),
            },
            {
                key: 'welcome_step_4',
                name: 'Welcome Sequence: Step 4',
                description: 'Day 5 email introducing AI description generation.',
                category: 'auth',
                subject: '👉 Let AI write your invoice descriptions',
                body: '<p>Hi {{userName}},</p><p>Not sure how to describe your services?</p><p>Use AI suggestions to create clear, professional invoice items in seconds.</p><p>Try it here:</p>',
                variables: JSON.stringify(['{{userName}}']),
            },
            {
                key: 'welcome_step_5',
                name: 'Welcome Sequence: Step 5',
                description: 'Day 7 email aggressively pushing a Premium Upgrade.',
                category: 'auth',
                subject: '👉 Look more professional to your clients',
                body: '<p>Hi {{userName}},</p><p>Upgrade to Premium to:</p><ul style="margin: 0; padding-left: 20px; line-height: 1.8;"><li>✔ Remove branding</li><li>✔ Send invoices via WhatsApp</li><li>✔ Use AI tools</li></ul><p style="margin-top: 20px;">Start your 30-day trial:</p>',
                variables: JSON.stringify(['{{userName}}']),
            },
            // Invoice
            {
                key: 'invoice_sent',
                name: 'Invoice Sent',
                description: 'Sent when a user emails an invoice to their client',
                category: 'invoice',
                subject: 'Invoice {{invoiceNumber}} from {{companyName}}',
                body: '<p>Dear {{clientName}},</p><p>Please find attached Invoice {{invoiceNumber}} for {{amount}}.</p><p>{{customMessage}}</p><p>Thank you for your business!</p>',
                variables: JSON.stringify(['{{clientName}}', '{{companyName}}', '{{invoiceNumber}}', '{{amount}}', '{{currency}}', '{{dueDate}}', '{{customMessage}}']),
            },
            {
                key: 'invoice_reminder_due_soon',
                name: 'Invoice Reminder — Due Soon',
                description: 'Sent automatically when an invoice is due within the configured number of days',
                category: 'invoice',
                subject: 'Reminder: Invoice {{invoiceNumber}} due in {{days}} days',
                body: '<p>Dear {{clientName}},</p><p>This is a friendly reminder that Invoice {{invoiceNumber}} for {{amount}} is due on {{dueDate}} ({{days}} days from now).</p><p>Please arrange payment at your earliest convenience.</p>',
                variables: JSON.stringify(['{{clientName}}', '{{invoiceNumber}}', '{{amount}}', '{{dueDate}}', '{{days}}']),
            },
            {
                key: 'invoice_reminder_due_today',
                name: 'Invoice Reminder — Due Today',
                description: 'Sent automatically when an invoice is due today',
                category: 'invoice',
                subject: 'Invoice {{invoiceNumber}} is due today',
                body: '<p>Dear {{clientName}},</p><p>Invoice {{invoiceNumber}} for {{amount}} is due today.</p><p>Please arrange payment as soon as possible to avoid any delays.</p>',
                variables: JSON.stringify(['{{clientName}}', '{{invoiceNumber}}', '{{amount}}', '{{dueDate}}']),
            },
            {
                key: 'invoice_reminder_overdue',
                name: 'Invoice Reminder — Overdue',
                description: 'Sent automatically when an invoice is past its due date',
                category: 'invoice',
                subject: 'Overdue: Invoice {{invoiceNumber}} — {{days}} days past due',
                body: '<p>Dear {{clientName}},</p><p>Invoice {{invoiceNumber}} for {{amount}} was due on {{dueDate}} and is now {{days}} days overdue.</p><p>Please arrange payment immediately. If you have already made payment, please disregard this notice.</p>',
                variables: JSON.stringify(['{{clientName}}', '{{invoiceNumber}}', '{{amount}}', '{{dueDate}}', '{{days}}']),
            },
            {
                key: 'recurring_invoice_created',
                name: 'Recurring Invoice Created',
                description: 'Sent when the system automatically creates an invoice from a recurring schedule',
                category: 'invoice',
                subject: 'New recurring invoice {{invoiceNumber}} created',
                body: '<p>Hi {{userName}},</p><p>A new invoice ({{invoiceNumber}}) has been automatically created from your recurring schedule.</p><p>Amount: {{amount}}</p><p>Client: {{clientName}}</p><p>Due Date: {{dueDate}}</p><p>You can review and send it from your dashboard.</p>',
                variables: JSON.stringify(['{{userName}}', '{{invoiceNumber}}', '{{amount}}', '{{clientName}}', '{{dueDate}}']),
            },
            // Payment
            {
                key: 'payment_received',
                name: 'Payment Received',
                description: 'Sent when a payment is recorded against an invoice',
                category: 'payment',
                subject: 'Payment received for Invoice {{invoiceNumber}}',
                body: '<p>Hi {{userName}},</p><p>A payment of {{paymentAmount}} has been recorded for Invoice {{invoiceNumber}}.</p><p>Client: {{clientName}}</p><p>Invoice Total: {{invoiceTotal}}</p><p>Payment Amount: {{paymentAmount}}</p><p>Remaining Balance: {{remainingBalance}}</p>',
                variables: JSON.stringify(['{{userName}}', '{{clientName}}', '{{invoiceNumber}}', '{{paymentAmount}}', '{{invoiceTotal}}', '{{remainingBalance}}']),
            },
            // System
            {
                key: 'client_statement',
                name: 'Client Statement',
                description: 'Sent when a user emails a client statement summary',
                category: 'system',
                subject: 'Account Statement from {{companyName}}',
                body: '<p>Dear {{clientName}},</p><p>Please find your account statement below.</p><p>Total Invoiced: {{totalInvoiced}}</p><p>Total Paid: {{totalPaid}}</p><p>Outstanding Balance: {{outstandingBalance}}</p>',
                variables: JSON.stringify(['{{clientName}}', '{{companyName}}', '{{totalInvoiced}}', '{{totalPaid}}', '{{outstandingBalance}}']),
            },
            {
                key: 'support_contact',
                name: 'Support / Contact Form',
                description: 'Sent when someone submits the contact/support form',
                category: 'system',
                subject: 'New contact form submission: {{subject}}',
                body: '<p>New support message from {{senderName}} ({{senderEmail}}):</p><p>Subject: {{subject}}</p><p>{{message}}</p>',
                variables: JSON.stringify(['{{senderName}}', '{{senderEmail}}', '{{subject}}', '{{message}}']),
            },
        ];

        let created = 0;
        let skipped = 0;

        for (const template of defaultTemplates) {
            const existing = await prisma.emailNotificationTemplate.findUnique({
                where: { key: template.key },
            });
            if (!existing) {
                await prisma.emailNotificationTemplate.create({ data: template });
                created++;
            } else {
                skipped++;
            }
        }

        return NextResponse.json({ success: true, created, skipped });
    } catch (error) {
        console.error('Error seeding email templates:', error);
        return NextResponse.json({ error: 'Failed to seed templates' }, { status: 500 });
    }
}
