import { getEmailLayout } from './email-layout';

/**
 * Email verification email templates
 */

export async function getVerificationEmailHtml(verificationUrl: string, name?: string): Promise<string> {
  const content = `
    <div style="text-align: center;">
      <h2>Verify Your Email Address</h2>
      <p style="text-align: left;">Hello${name ? ` ${name}` : ''},</p>
      
      <p style="text-align: left;">Thank you for registering with Invoice Generator Nigeria!</p>
      
      <p style="text-align: left;">Please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p style="text-align: left;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280; font-size: 12px; text-align: left;">${verificationUrl}</p>
      
      <p style="text-align: left;">This link will expire in 24 hours.</p>
      
      <p style="text-align: left; color: #6b7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  return getEmailLayout({
    content,
    title: 'Verify Email Address',
    previewText: 'Verify your email address for Invoice Generator',
  });
}

export function getVerificationEmailText(verificationUrl: string, name?: string): string {
  return `
Hello${name ? ` ${name}` : ''},

Thank you for registering with Invoice Generator Nigeria!

Please verify your email address by visiting the following link:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The Invoice Generator Team
  `.trim();
}
