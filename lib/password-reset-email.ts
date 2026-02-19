import { getEmailLayout } from './email-layout';

/**
 * Password reset email template
 */

export async function getPasswordResetEmailHtml(resetUrl: string, userName?: string): Promise<string> {
  const content = `
    <div style="text-align: center;">
      <h2>Password Reset Request</h2>
      <p style="text-align: left;">Hello${userName ? ` ${userName}` : ''},</p>
      
      <p style="text-align: left;">We received a request to reset your password for your Invoice Generator Nigeria account.</p>
      
      <p style="text-align: left;">Click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p style="text-align: left;">Or copy and paste this link into your browser:</p>
      <p class="link" style="text-align: left; word-break: break-all; color: #4F46E5;">${resetUrl}</p>
      
      <div class="warning-box" style="text-align: left;">
        <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
      </div>
      
      <p style="text-align: left;">If you continue to have problems, please contact our support team.</p>
      
      <p style="text-align: left;">Best regards,<br>The InvoiceNaija Team</p>
    </div>
  `;

  return getEmailLayout({
    content,
    title: 'Reset Your Password',
    previewText: 'Reset your password for InvoiceNaija',
  });
}

export function getPasswordResetEmailText(resetUrl: string, userName?: string): string {
  return `
Hello${userName ? ` ${userName}` : ''},

We received a request to reset your password for your Invoice Generator Nigeria account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.

Best regards,
The InvoiceNaija Team
  `.trim();
}
