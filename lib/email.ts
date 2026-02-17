/**
 * Email sending utility using Resend
 */

import { Resend } from 'resend';
import { retryWithBackoff, formatErrorMessage } from './error-handler';
import { getPasswordResetEmailHtml, getPasswordResetEmailText } from './password-reset-email';
import { getVerificationEmailHtml, getVerificationEmailText } from './verification-email';

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

    // Initialize Resend client lazily (only when needed and API key is available)
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .invoice-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .invoice-details p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice ${invoice.invoiceNumber || 'N/A'}</h1>
            </div>
            <div class="content">
              ${message ? `<p>${message.replace(/\n/g, '<br>')}</p>` : ''}
              
              <div class="invoice-details">
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ${invoice.currency || 'USD'} ${invoice.total?.toFixed(2) || '0.00'}</p>
              </div>

              ${invoice.paymentLink ? `
                <p>You can pay this invoice online:</p>
                <a href="${invoice.paymentLink}" class="button">Pay Invoice</a>
              ` : ''}

              <p>Please find the invoice PDF attached to this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Invoice Generator.ng</p>
              <p>If you have any questions, please contact the sender.</p>
              <img src="https://www.invoicegenerator.ng/api/invoices/${invoice.id}/track?t=${Date.now()}" width="1" height="1" style="display:none" alt="" />
            </div>
          </div>
        </body>
      </html>
    `;

    // Prepare email data
    const emailData: any = {
      from: 'Invoice Generator <onboarding@resend.dev>', // Use Resend's test domain, update to your verified domain for production
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
      // In development, just log the email
      console.log('⚠️  RESEND_API_KEY not set. Password reset email would be sent:', {
        to,
        resetUrl: resetUrl.substring(0, 50) + '...',
      });
      return {
        success: false,
        error: 'RESEND_API_KEY environment variable is not configured'
      };
    }

    console.log('📧 Attempting to send password reset email:', {
      to,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
    });

    // Initialize Resend client lazily
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = getPasswordResetEmailHtml(resetUrl, name);
    const emailText = getPasswordResetEmailText(resetUrl, name);

    const emailData = {
      from: 'Invoice Generator <onboarding@resend.dev>', // Update to your verified domain for production
      to,
      subject: 'Reset Your Password - Invoice Generator Nigeria',
      html: emailHtml,
      text: emailText,
    };

    console.log('📤 Sending email via Resend:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
    });

    // Send email with retry logic
    const result = await retryWithBackoff(async () => {
      return await resend.emails.send(emailData);
    }, {
      maxRetries: 2,
      retryDelay: 1000,
      retryable: (error: any) => {
        return error.statusCode === 429 || error.code === 'ECONNABORTED';
      },
    });

    const { data, error } = result;

    if (error) {
      console.error('❌ Resend API error:', {
        message: error.message,
        name: error.name,
        statusCode: (error as any).statusCode,
        code: (error as any).code,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      });
      return {
        success: false,
        error: formatErrorMessage(error, 'sending password reset email')
      };
    }

    console.log('✅ Email sent successfully via Resend:', {
      emailId: data?.id,
      to,
    });

    return { success: true, emailId: data?.id };
  } catch (error: any) {
    console.error('❌ Exception in sendPasswordResetEmail:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    });
    return {
      success: false,
      error: formatErrorMessage(error, 'sending password reset email')
    };
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
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      // In development, just log the email
      console.log('⚠️  RESEND_API_KEY not set. Verification email would be sent:', {
        to,
        verificationUrl: verificationUrl.substring(0, 50) + '...',
      });
      return {
        success: false,
        error: 'RESEND_API_KEY environment variable is not configured'
      };
    }

    // Initialize Resend client lazily
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = getVerificationEmailHtml(verificationUrl, name);
    const emailText = getVerificationEmailText(verificationUrl, name);

    const emailData = {
      from: 'Invoice Generator <onboarding@resend.dev>', // Update to your verified domain for production
      to,
      subject: 'Verify Your Email Address - Invoice Generator Nigeria',
      html: emailHtml,
      text: emailText,
    };

    // Send email with retry logic
    const result = await retryWithBackoff(async () => {
      return await resend.emails.send(emailData);
    }, {
      maxRetries: 2,
      retryDelay: 1000,
      retryable: (error: any) => {
        return error.statusCode === 429 || error.code === 'ECONNABORTED';
      },
    });

    const { data, error } = result;

    if (error) {
      console.error('❌ Resend API error:', error);
      return {
        success: false,
        error: formatErrorMessage(error, 'sending verification email')
      };
    }

    console.log('✅ Verification email sent successfully:', {
      emailId: data?.id,
      to,
    });

    return { success: true, emailId: data?.id };
  } catch (error: any) {
    console.error('❌ Exception in sendVerificationEmail:', error);
    return {
      success: false,
      error: formatErrorMessage(error, 'sending verification email')
    };
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
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY not set. Support email would be sent:', {
        from: `${name} <${email}>`,
        subject,
        message: message.substring(0, 50) + '...',
      });
      return {
        success: false,
        error: 'RESEND_API_KEY environment variable is not configured'
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // HTML content for the support team
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #f3f4f6; padding: 20px; border-bottom: 2px solid #e5e7eb; }
            .content { padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #6b7280; font-size: 0.9em; }
            .value { background: #f9fafb; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
            .message-box { white-space: pre-wrap; background: #fff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>From: <strong>${name}</strong> (${email})</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message}</div>
            </div>

            <div style="margin-top: 30px; font-size: 0.8em; color: #888;">
              <p>This email was sent via the contact form on Invoice Generator.</p>
              <p>Reply to this email to contact the user directly at ${email}.</p>
            </div>
          </div>
        </body>
      </html>
    `;

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
    }, {
      maxRetries: 2,
    });

    const { data, error } = result;

    if (error) {
      console.error('❌ Resend API error (Support):', error);
      return {
        success: false,
        error: formatErrorMessage(error, 'sending support email')
      };
    }

    return { success: true, emailId: data?.id };
    return { success: true, emailId: data?.id };
  } catch (error: any) {
    console.error('❌ Exception in sendSupportEmail:', error);
    return {
      success: false,
      error: formatErrorMessage(error, 'sending support email')
    };
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
      console.log('⚠️ RESEND_API_KEY not set. Reminder would be sent:', {
        to: invoice.clientInfo?.email,
        type,
        invoiceNumber: invoice.invoiceNumber,
      });
      return { success: true, emailId: 'dev-mode' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const clientName = invoice.clientInfo?.name || 'Valued Client';
    const invoiceUrl = `https://invoicegenerator.ng/invoice/${invoice.id}`; // Adjust based on your public invoice URL structure

    let subject = '';
    let headline = '';
    let bodyText = '';
    let color = '#4F46E5'; // Default blue

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
        color = '#DC2626'; // Red
        break;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${headline}</h1>
            </div>
            <div class="content">
              <p>Dear ${clientName},</p>
              <p>${bodyText}</p>
              
              <div class="details">
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Amount Due:</strong> ${invoice.currency} ${invoice.total?.toFixed(2)}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>

              <div style="text-align: center;">
                 <a href="${invoiceUrl}" class="button">View & Pay Invoice</a>
              </div>
              
              <p>If you have already made payment, please disregard this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailData = {
      from: 'Invoice Generator <reminders@resend.dev>',
      to: invoice.clientInfo?.email, // Assuming client email is reachable here
      subject: subject,
      html: emailHtml,
    };

    if (!emailData.to) {
      return { success: false, error: 'Client email not found' };
    }

    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error('Error sending reminder:', result.error);
      return { success: false, error: formatErrorMessage(result.error, 'sending reminder') };
    }

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
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not set. Statement would be sent:', { to: params.to });
      return { success: true };
    }

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

    const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#1F4D45,#2D6A5F);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px 0;">Account Statement</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">From ${params.companyName}</p>
      </div>

      <div style="padding:32px;">
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
          Dear ${params.clientName},<br><br>
          Please find below a summary of your account activity with ${params.companyName}.
        </p>

        <!-- Summary Cards -->
        <div style="display:flex;gap:12px;margin-bottom:24px;">
          <div style="flex:1;background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:12px;color:#16a34a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Total Invoiced</div>
            <div style="font-size:22px;font-weight:700;color:#15803d;margin-top:4px;">${currencySymbol}${params.totalInvoiced.toFixed(2)}</div>
          </div>
          <div style="flex:1;background:#eff6ff;border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:12px;color:#2563eb;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Total Paid</div>
            <div style="font-size:22px;font-weight:700;color:#1d4ed8;margin-top:4px;">${currencySymbol}${params.totalPaid.toFixed(2)}</div>
          </div>
          <div style="flex:1;background:${params.outstandingBalance > 0 ? '#fef2f2' : '#f0fdf4'};border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:12px;color:${params.outstandingBalance > 0 ? '#dc2626' : '#16a34a'};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Balance Due</div>
            <div style="font-size:22px;font-weight:700;color:${params.outstandingBalance > 0 ? '#b91c1c' : '#15803d'};margin-top:4px;">${currencySymbol}${params.outstandingBalance.toFixed(2)}</div>
          </div>
        </div>

        <!-- Invoice Table -->
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Invoice</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Date</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Paid</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceRows}
          </tbody>
          <tfoot>
            <tr style="background:#f8fafc;">
              <td colspan="2" style="padding:12px;font-size:14px;font-weight:700;color:#1e293b;">Total</td>
              <td style="padding:12px;text-align:right;font-size:14px;font-weight:700;color:#1e293b;">${currencySymbol}${params.totalInvoiced.toFixed(2)}</td>
              <td style="padding:12px;text-align:right;font-size:14px;font-weight:700;color:#16a34a;">${currencySymbol}${params.totalPaid.toFixed(2)}</td>
              <td style="padding:12px;text-align:right;font-size:14px;font-weight:700;color:${params.outstandingBalance > 0 ? '#dc2626' : '#16a34a'};">${currencySymbol}${params.outstandingBalance.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center;">
          Statement generated on ${new Date().toLocaleDateString()} • ${params.companyName}
        </p>
      </div>
    </div>`;

    const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicegenerator.ng';

    await resend.emails.send({
      from: `${params.companyName} <${fromEmail}>`,
      to: params.to,
      subject: `Account Statement from ${params.companyName}`,
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending client statement email:', error);
    return { success: false, error: error.message };
  }
}
