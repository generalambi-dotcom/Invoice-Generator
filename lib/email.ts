/**
 * Email sending utility using Resend
 */

import { Resend } from 'resend';
import { retryWithBackoff, formatErrorMessage } from './error-handler';

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
