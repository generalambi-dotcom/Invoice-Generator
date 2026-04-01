/**
 * Email sending utility using Resend
 */

import { Resend } from 'resend';
import { retryWithBackoff, formatErrorMessage } from './error-handler';
import { getPasswordResetEmailHtml, getPasswordResetEmailText } from './password-reset-email';
import { getVerificationEmailHtml, getVerificationEmailText } from './verification-email';
import { getEmailLayout } from './email-layout';
import { prisma } from '@/lib/db';

// Don't initialize Resend at module level - do it lazily in the function
// This prevents build-time errors when RESEND_API_KEY is not set

interface SendInvoiceEmailParams {
  invoice: any;
  to: string;
  message?: string;
  pdfBuffer?: Buffer;
}

export async function sendInvoiceEmail({
  invoice,
  to,
  message = '',
  pdfBuffer,
}: SendInvoiceEmailParams): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      // In development, just log the email
      console.log('Email would be sent:', {
        to,
        subject: `Invoice ${invoice.invoiceNumber}`,
        invoiceId: invoice.id,
      });
      return { success: true, emailId: 'dev-email-id' };
    }

    // Initialize Resend client lazily
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Build email content
    const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2>Invoice ${invoice.invoiceNumber || 'N/A'}</h2>
      </div>

      ${message ? `<p>${message.replace(/\n/g, '<br>')}</p>` : ''}
              
      <table class="invoice-details" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Invoice Number:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${invoice.invoiceNumber || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Date:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Date(invoice.invoiceDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Due Date:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px;"><strong>Total Amount:</strong></td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">${invoice.currency || 'USD'} ${invoice.total?.toFixed(2) || '0.00'}</td>
        </tr>
      </table>

      ${invoice.paymentLink ? `
        <p>You can pay this invoice online:</p>
        <div style="text-align: center;">
            <a href="${invoice.paymentLink}" class="button">Pay Invoice</a>
        </div>
      ` : ''}

      <p>Please find the invoice PDF attached to this email.</p>
      
      <img src="https://www.invoicegenerator.ng/api/invoices/${invoice.id}/track?t=${Date.now()}" width="1" height="1" style="display:none" alt="" />
    `;

    // Wrap with layout
    const emailHtml = await getEmailLayout({
      content,
      title: `Invoice ${invoice.invoiceNumber || 'N/A'}`,
      previewText: `Invoice ${invoice.invoiceNumber} from InvoiceNaija`,
    });

    // Prep From Email
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = 'Invoice Generator';

    // Prepare email data
    const emailData: any = {
      from: `${fromName} <${fromEmail}>`,
      to,
      subject: `Invoice ${invoice.invoiceNumber || 'N/A'}`,
      html: emailHtml,
    };

    // Add PDF attachment if provided
    if (pdfBuffer) {
      emailData.attachments = [
        {
          filename: `invoice-${invoice.invoiceNumber || invoice.id}.pdf`,
          content: pdfBuffer,
        },
      ];
    }

    // Send email with retry logic
    const result = await retryWithBackoff(async () => {
      return await resend.emails.send(emailData);
    }, {
      maxRetries: 2,
      retryDelay: 1000,
      retryable: (error: any) => {
        // Retry on network errors or rate limits
        return error.statusCode === 429 || error.code === 'ECONNABORTED';
      },
    });

    const { data, error } = result;

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: formatErrorMessage(error, 'sending email')
      };
    }

    return { success: true, emailId: data?.id };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: formatErrorMessage(error, 'sending email')
    };
  }
}

/**
 * Send password reset email
 */
interface SendPasswordResetEmailParams {
  to: string;
  name?: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY not set. Password reset email would be sent:', {
        to,
        resetUrl: resetUrl.substring(0, 50) + '...',
      });
      return {
        success: false,
        error: 'RESEND_API_KEY environment variable is not configured'
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Await HTML generation (now async)
    const emailHtml = await getPasswordResetEmailHtml(resetUrl, name);
    const emailText = getPasswordResetEmailText(resetUrl, name);

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const emailData = {
      from: `Invoice Generator <${fromEmail}>`,
      to,
      subject: 'Reset Your Password - Invoice Generator Nigeria',
      html: emailHtml,
      text: emailText,
    };

    const result = await retryWithBackoff(async () => {
      return await resend.emails.send(emailData);
    }, {
      maxRetries: 2,
      retryDelay: 1000,
    });

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      return { success: false, error: formatErrorMessage(result.error, 'sending password reset email') };
    }

    return { success: true, emailId: result.data?.id };
  } catch (error: any) {
    console.error('❌ Exception in sendPasswordResetEmail:', error);
    return { success: false, error: formatErrorMessage(error, 'sending password reset email') };
  }
}

/**
 * Send email verification email
 */
interface SendVerificationEmailParams {
  to: string;
  name?: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY not set. Verification email would be sent:', {
        to,
        verificationUrl,
      });
      return { success: false, error: 'RESEND_API_KEY environment variable is not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Await HTML generation
    const emailHtml = await getVerificationEmailHtml(verificationUrl, name);
    const emailText = getVerificationEmailText(verificationUrl, name);

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const emailData = {
      from: `Invoice Generator <${fromEmail}>`,
      to,
      subject: 'Verify Your Email Address - Invoice Generator Nigeria',
      html: emailHtml,
      text: emailText,
    };

    const result = await retryWithBackoff(async () => {
      return await resend.emails.send(emailData);
    }, { maxRetries: 2 });

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      return { success: false, error: formatErrorMessage(result.error, 'sending verification email') };
    }

    return { success: true, emailId: result.data?.id };
  } catch (error: any) {
    console.error('❌ Exception in sendVerificationEmail:', error);
    return { success: false, error: formatErrorMessage(error, 'sending verification email') };
  }
}

/**
 * Send support email from contact form
 */
interface SendSupportEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendSupportEmail({
  name,
  email,
  subject,
  message,
}: SendSupportEmailParams): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY not set. Support email would be sent.');
      return { success: false, error: 'RESEND_API_KEY environment variable is not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const content = `
        <div style="margin-bottom: 20px;">
          <h2>New Contact Form Submission</h2>
          <p>From: <strong>${name}</strong> (${email})</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; color: #6b7280; font-size: 0.9em;">Subject</div>
          <div style="background: #f9fafb; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">${subject}</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; color: #6b7280; font-size: 0.9em;">Message</div>
          <div style="white-space: pre-wrap; background: #fff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 4px;">${message}</div>
        </div>

        <div style="margin-top: 30px; font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
          <p>This email was sent via the contact form on Invoice Generator.</p>
          <p>Reply to this email to contact the user directly at ${email}.</p>
        </div>
    `;

    const emailHtml = await getEmailLayout({
      content,
      title: `Contact Form: ${subject}`,
      previewText: `New message from ${name}`,
    });

    const emailData = {
      from: 'Invoice Generator Contact <contact@resend.dev>', // Update in production
      to: 'support@invoicegenerator.ng',
      reply_to: email, // Allow direct reply to user
      subject: `[Contact Form] ${subject}`,
      html: emailHtml,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    };

    const result = await retryWithBackoff(async () => {
      return await resend.emails.send(emailData);
    }, { maxRetries: 2 });

    if (result.error) {
      return { success: false, error: formatErrorMessage(result.error, 'sending support email') };
    }

    return { success: true, emailId: result.data?.id };
  } catch (error: any) {
    console.error('❌ Exception in sendSupportEmail:', error);
    return { success: false, error: formatErrorMessage(error, 'sending support email') };
  }
}

/**
 * Send invoice reminder email
 */
interface SendInvoiceReminderParams {
  invoice: any;
  type: 'due_soon' | 'due_today' | 'overdue';
  days?: number; // Days overdue or days until due
}

export async function sendInvoiceReminderEmail({
  invoice,
  type,
  days,
}: SendInvoiceReminderParams): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: true, emailId: 'dev-mode' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const clientName = invoice.clientInfo?.name || 'Valued Client';
    const invoiceUrl = `https://invoicegenerator.ng/invoice/${invoice.id}`;

    let subject = '';
    let headline = '';
    let bodyText = '';
    let infoBoType = 'info-box'; // Default style

    switch (type) {
      case 'due_soon':
        subject = `Reminder: Invoice ${invoice.invoiceNumber} is due soon`;
        headline = 'Payment Reminder';
        bodyText = `This is a friendly reminder that Invoice ${invoice.invoiceNumber} is due in ${days} days on ${new Date(invoice.dueDate).toLocaleDateString()}.`;
        break;
      case 'due_today':
        subject = `Invoice ${invoice.invoiceNumber} is due today`;
        headline = 'Payment Due Today';
        bodyText = `This is a reminder that Invoice ${invoice.invoiceNumber} is due today. Please settle the payment at your earliest convenience.`;
        break;
      case 'overdue':
        subject = `Overdue: Invoice ${invoice.invoiceNumber} is ${days} days late`;
        headline = 'Payment Overdue';
        bodyText = `We noticed that payment for Invoice ${invoice.invoiceNumber} was due on ${new Date(invoice.dueDate).toLocaleDateString()} and is now ${days} days overdue. Please make payment immediately to avoid service interruption.`;
        infoBoType = 'warning-box';
        break;
    }

    const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2>${headline}</h2>
      </div>
      
      <p>Dear ${clientName},</p>
      
      <div class="${infoBoType}">
        ${bodyText}
      </div>
      
      <table class="invoice-details" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Invoice Number:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${invoice.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px;"><strong>Amount Due:</strong></td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">${invoice.currency} ${invoice.total?.toFixed(2)}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
         <a href="${invoiceUrl}" class="button">View & Pay Invoice</a>
      </div>
      
      <p>If you have already made payment, please disregard this email.</p>
    `;

    const emailHtml = await getEmailLayout({
      content,
      title: headline,
      previewText: subject,
    });

    const emailData = {
      from: 'Invoice Generator <reminders@resend.dev>',
      to: invoice.clientInfo?.email,
      subject: subject,
      html: emailHtml,
    };

    if (!emailData.to) return { success: false, error: 'Client email not found' };

    const result = await resend.emails.send(emailData);
    if (result.error) return { success: false, error: formatErrorMessage(result.error, 'sending reminder') };

    return { success: true, emailId: result.data?.id };

  } catch (error: any) {
    console.error('Error in sendInvoiceReminderEmail:', error);
    return { success: false, error: formatErrorMessage(error, 'sending reminder') };
  }
}

/**
 * Send client statement email
 */
interface SendClientStatementParams {
  to: string;
  clientName: string;
  companyName: string;
  invoices: Array<{
    invoiceNumber: string;
    date: Date | null;
    dueDate: Date | null;
    total: number;
    paidAmount: number;
    currency: string;
    status: string;
  }>;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  currency: string;
}

export async function sendClientStatementEmail(params: SendClientStatementParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) return { success: true };

    const resend = new Resend(process.env.RESEND_API_KEY);
    const currencySymbol = params.currency === 'NGN' ? '₦' : params.currency === 'GBP' ? '£' : params.currency === 'EUR' ? '€' : '$';

    const invoiceRows = params.invoices.map((inv) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${inv.invoiceNumber}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;">${inv.date ? new Date(inv.date).toLocaleDateString() : '-'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;text-align:right;">${currencySymbol}${inv.total.toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#16a34a;text-align:right;">${currencySymbol}${inv.paidAmount.toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:${(inv.total - inv.paidAmount) > 0 ? '#dc2626' : '#16a34a'};text-align:right;">${currencySymbol}${(inv.total - inv.paidAmount).toFixed(2)}</td>
      </tr>
    `).join('');

    const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2>Account Statement</h2>
        <p style="color: #6b7280; font-size: 14px;">From ${params.companyName}</p>
      </div>

      <p>Dear ${params.clientName},</p>
      <p>Please find below a summary of your account activity with ${params.companyName}.</p>

      <!-- Summary Cards -->
      <div style="display:flex; gap:12px; margin-bottom:24px;">
        <div style="flex:1; background:#f0fdf4; border-radius:12px; padding:16px; text-align:center;">
          <div style="font-size:10px; color:#16a34a; font-weight:600; text-transform:uppercase;">Total Invoiced</div>
          <div style="font-size:18px; font-weight:700; color:#15803d; margin-top:4px;">${currencySymbol}${params.totalInvoiced.toFixed(2)}</div>
        </div>
        <div style="flex:1; background:#eff6ff; border-radius:12px; padding:16px; text-align:center;">
          <div style="font-size:10px; color:#2563eb; font-weight:600; text-transform:uppercase;">Total Paid</div>
          <div style="font-size:18px; font-weight:700; color:#1d4ed8; margin-top:4px;">${currencySymbol}${params.totalPaid.toFixed(2)}</div>
        </div>
        <div style="flex:1; background:${params.outstandingBalance > 0 ? '#fef2f2' : '#f0fdf4'}; border-radius:12px; padding:16px; text-align:center;">
          <div style="font-size:10px; color:${params.outstandingBalance > 0 ? '#dc2626' : '#16a34a'}; font-weight:600; text-transform:uppercase;">Balance Due</div>
          <div style="font-size:18px; font-weight:700; color:${params.outstandingBalance > 0 ? '#b91c1c' : '#15803d'}; margin-top:4px;">${currencySymbol}${params.outstandingBalance.toFixed(2)}</div>
        </div>
      </div>

      <!-- Invoice Table -->
      <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 12px; text-align:left; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Invoice</th>
            <th style="padding:10px 12px; text-align:left; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Date</th>
            <th style="padding:10px 12px; text-align:right; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Amount</th>
            <th style="padding:10px 12px; text-align:right; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Paid</th>
            <th style="padding:10px 12px; text-align:right; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceRows}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc;">
            <td colspan="2" style="padding:12px; font-size:14px; font-weight:700; color:#1e293b;">Total</td>
            <td style="padding:12px; text-align:right; font-size:14px; font-weight:700; color:#1e293b;">${currencySymbol}${params.totalInvoiced.toFixed(2)}</td>
            <td style="padding:12px; text-align:right; font-size:14px; font-weight:700; color:#16a34a;">${currencySymbol}${params.totalPaid.toFixed(2)}</td>
            <td style="padding:12px; text-align:right; font-size:14px; font-weight:700; color:${params.outstandingBalance > 0 ? '#dc2626' : '#16a34a'};">${currencySymbol}${params.outstandingBalance.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="color:#94a3b8; font-size:12px; margin-top:24px; text-align:center;">
        Statement generated on ${new Date().toLocaleDateString()}
      </p>
    `;

    const emailHtml = await getEmailLayout({
      content,
      title: `Account Statement - ${params.companyName}`,
      previewText: `Account statement from ${params.companyName}`,
    });

    const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicegenerator.ng';

    await resend.emails.send({
      from: `${params.companyName} <${fromEmail}>`,
      to: params.to,
      subject: `Account Statement from ${params.companyName}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending client statement email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if a notification type is enabled in the admin settings
 */
export async function isNotificationEnabled(key: string): Promise<boolean> {
  try {
    const template = await prisma.emailNotificationTemplate.findUnique({
      where: { key },
      select: { enabled: true },
    });
    // If template doesn't exist yet (not seeded), default to enabled
    return template ? template.enabled : true;
  } catch (error) {
    console.error(`Error checking notification status for ${key}:`, error);
    return true; // Default to enabled on error
  }
}

/**
 * Send welcome email after registration
 */
interface SendWelcomeEmailParams {
  to: string;
  name?: string;
}

export async function sendWelcomeEmail({
  to,
  name,
}: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const enabled = await isNotificationEnabled('welcome_email');
    if (!enabled) return { success: true };

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { success: false, error: 'RESEND_API_KEY not set' };
    const resend = new Resend(apiKey);
    const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicegenerator.ng';
    const userName = name || 'there';

    const content = `
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to InvoiceGenerator.ng! 🎉</h1>
      </div>
      
      <p>Hi ${userName},</p>
      <p>Welcome aboard! I'm thrilled to see you here. You've just taken the biggest step towards getting paid faster and looking incredibly professional to your clients.</p>
      <p>The days of messy Word Documents and Excel spreadsheets are over. With InvoiceGenerator.ng, you're about to build a billing process that commands premium prices.</p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin-top: 0; font-weight: bold; color: #111827;">Here is what you should do right now:</p>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;"><strong>Upload your logo</strong> to make your brand pop.</li>
          <li style="margin-bottom: 8px;"><strong>Add your bank details</strong> so clients know how to pay you.</li>
          <li style="margin-bottom: 8px;">Create your very first invoice in under 60 seconds!</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://invoicegenerator.ng'}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Your Dashboard</a>
      </div>
      
      <p>If you ever get stuck, just reply to this email. Our support team is exactly here to help.</p>
      <p>Happy invoicing!<br/>The InvoiceGenerator.ng Team</p>
    `;

    const emailHtml = await getEmailLayout({
      content,
      title: 'Welcome to InvoiceGenerator.ng',
      previewText: "Welcome aboard! Let's get your first invoice sent out today.",
    });

    await resend.emails.send({
      from: `InvoiceGenerator.ng <${fromEmail}>`,
      to,
      subject: 'Welcome to InvoiceGenerator.ng! 🎉',
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send payment received notification
 */
interface SendPaymentReceivedEmailParams {
  to: string;
  userName: string;
  clientName: string;
  invoiceNumber: string;
  paymentAmount: string;
  invoiceTotal: string;
  remainingBalance: string;
  currency: string;
}

export async function sendPaymentReceivedEmail({
  to,
  userName,
  clientName,
  invoiceNumber,
  paymentAmount,
  invoiceTotal,
  remainingBalance,
  currency,
}: SendPaymentReceivedEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const enabled = await isNotificationEnabled('payment_received');
    if (!enabled) return { success: true };

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { success: false, error: 'RESEND_API_KEY not set' };
    const resend = new Resend(apiKey);
    const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicegenerator.ng';

    const content = `
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💰 Payment Received</h1>
      </div>
      
      <p>Hi ${userName},</p>
      <p>A payment has been recorded for one of your invoices.</p>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${invoiceNumber}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Client</td><td style="padding: 8px 0; text-align: right; color: #111827;">${clientName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #059669;">${currency} ${paymentAmount}</td></tr>
          <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Total</td><td style="padding: 8px 0; text-align: right; color: #111827;">${currency} ${invoiceTotal}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Balance</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${remainingBalance === '0' || remainingBalance === '0.00' ? '#059669' : '#dc2626'};">${currency} ${remainingBalance}</td></tr>
        </table>
      </div>
    `;

    const emailHtml = await getEmailLayout({
      content,
      title: `Payment Received: ${invoiceNumber}`,
      previewText: `Payment received for Invoice ${invoiceNumber}`,
    });

    await resend.emails.send({
      from: `InvoiceNaija <${fromEmail}>`,
      to,
      subject: `Payment received for Invoice ${invoiceNumber}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending payment received email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Drip Sequence Email (Welcome Flow)
 */
interface SendSequenceEmailParams {
  to: string;
  name?: string;
  step: 1 | 2 | 3 | 4 | 5;
}

export async function sendSequenceEmail({
  to,
  name,
  step,
}: SendSequenceEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`⚠️ RESEND_API_KEY not set. Would have sent sequence step ${step} to ${to}`);
      return { success: false, error: 'RESEND_API_KEY not set' };
    }
    const resend = new Resend(apiKey);
    const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicegenerator.ng';
    const userName = name || 'there';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invoicegenerator.ng';

    let subject = '';
    let headline = '';
    let bodyContent = '';
    let buttonText = 'Go to Dashboard';
    let buttonUrl = `${appUrl}/dashboard`;

    // Try to fetch custom template from the database first
    const templateKey = `welcome_step_${step}`;
    const customTemplate = await prisma.emailNotificationTemplate.findUnique({
      where: { key: templateKey },
    });

    if (customTemplate && customTemplate.enabled) {
      subject = customTemplate.subject;
      bodyContent = customTemplate.body.replace(/\{\{userName\}\}/g, userName);

      // Derive headline from the generic structure for the custom template (simpler display)
      headline = customTemplate.name.replace('Welcome Sequence: ', '');

      // If the user manually added our expected wrapper UI string into the custom body or we provided a wrapper,
      // we will omit the hardcoded layout blocks in favor of user design. We'll check if they want the standard wrapper.
      // For backwards compatibility and smooth integration with the Email Layout wrapper, we inject their custom body 
      // into the same layout mechanism we use for hardcoded items.
      // Users might add `{{buttonUrl}}` to their custom template layout if they choose, so let's set it.
      bodyContent = bodyContent.replace(/\{\{buttonUrl\}\}/g, `${appUrl}/dashboard`);
      if (step === 1 || step === 4) {
        bodyContent = bodyContent.replace(/\{\{buttonUrl\}\}/g, `${appUrl}/invoices/new`);
      }
      if (step === 3 || step === 5) {
        bodyContent = bodyContent.replace(/\{\{buttonUrl\}\}/g, `${appUrl}/pricing`);
      }
    } else {
      // Fallback to Hardcoded Templates
      switch (step) {
        case 1:
          subject = '👉 Your first invoice is waiting 🇳🇬';
          headline = 'Welcome to InvoiceGenerator.ng';
          bodyContent = `
              <p>Hi ${userName},</p>
              <p>The number one reason Nigerian freelancers and SMEs wait weeks to get paid is friction. When your invoice is hard to read or looks unprofessional, corporate accounting departments push it to the bottom of the pile.</p>
              <p>Let’s fix that today.</p>
              <p>Your dashboard is ready. You can generate a stunning, mathematically perfect PDF invoice in under 60 seconds. Best part? It separates your VAT and totals automatically.</p>
            `;
          buttonText = 'Create Your First Invoice';
          buttonUrl = `${appUrl}/invoices/new`;
          break;

        case 2:
          subject = '👉 Why clients are delaying your payments...';
          headline = 'Look more professional';
          bodyContent = `
              <p>Hi ${userName},</p>
              <p>A bare, black-and-white grid of numbers screams "I am a beginner." If you don't invest in your own branding, clients subconsciously feel they don't need to rush to pay you.</p>
              <p>Log in right now to upload your high-resolution company Logo and set your primary brand color. When you send an invoice that looks like a luxury agency document, clients stop haggling and start paying.</p>
            `;
          buttonText = 'Complete Your Profile';
          buttonUrl = `${appUrl}/dashboard`;
          break;

        case 3:
          subject = '👉 Where Nigerian business actually happens 📱';
          headline = 'WhatsApp Invoicing';
          bodyContent = `
              <p>Hi ${userName},</p>
              <p>Email is slow. The actual heartbeat of Nigerian commerce is WhatsApp.</p>
              <p>With our Premium tier, you don't even need to download heavy PDFs. You can instantly generate a highly secure, non-editable link and blast it directly into your client's WhatsApp DM with a single click. Faster delivery equals faster payment.</p>
            `;
          buttonText = "See Premium Features";
          buttonUrl = `${appUrl}/pricing`;
          break;

        case 4:
          subject = "👉 Defeat writer's block instantly 🤖";
          headline = 'Let AI write your invoice';
          bodyContent = `
              <p>Hi ${userName},</p>
              <p>"Website Design - N50,000" is a terrible invoice description. Corporate procurement officers will reject it because it lacks detail.</p>
              <p>Are you struggling to describe your work professionally? Stop typing. With InvoiceGenerator Premium, you can use our built-in AI to instantly generate bulletproof, highly detailed service descriptions that sail through corporate audits.</p>
            `;
          buttonText = 'Try AI Invoice Generation';
          buttonUrl = `${appUrl}/invoices/new`;
          break;

        case 5:
          subject = '👉 Ready to look like a Tier-1 Agency?';
          headline = 'Upgrade to Premium';
          bodyContent = `
              <p>Hi ${userName},</p>
              <p>You’ve seen what InvoiceGenerator.ng can do. Now it's time to take the training wheels off.</p>
              <p>Upgrade to Premium today to completely remove our branding from your PDFs, unlock unlimited AI descriptions, and activate seamless WhatsApp delivery.</p>
              <p>You charge premium prices. Your paperwork should match.</p>
            `;
          buttonText = 'Upgrade to Premium';
          buttonUrl = `${appUrl}/pricing`;
          break;
      }

      // Add standard styled wrapper specific to the drip campaign hardcoded format
      const hardcodedWrapper = `
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${headline}</h1>
          </div>
          
          ${bodyContent}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${buttonUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${buttonText}</a>
          </div>
          
          <p>Happy invoicing!<br/>The InvoiceGenerator.ng Team</p>
        `;
      bodyContent = hardcodedWrapper;
    }

    const emailHtml = await getEmailLayout({
      content: bodyContent,
      title: headline,
      previewText: subject,
    });

    await resend.emails.send({
      from: `InvoiceGenerator <${fromEmail}>`,
      to,
      subject,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error(`Error sending sequence email step ${step}:`, error);
    return { success: false, error: error.message };
  }
}

