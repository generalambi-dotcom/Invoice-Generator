import { getSystemSettings } from './settings';

interface EmailLayoutOptions {
    content: string;
    title?: string; // Optional title for the browser tab / preview
    previewText?: string; // Hidden preview text
    footerVariant?: 'account' | 'client' | 'lifecycle';
    unsubscribeUrl?: string;
}

const DEFAULT_PRIMARY_COLOR = '#4F46E5';
const DEFAULT_HEADER_BG = '#ffffff';
const DEFAULT_BRAND_NAME = 'InvoiceGenerator.ng';

export async function getEmailLayout({
    content,
    title,
    previewText,
    footerVariant = 'account',
    unsubscribeUrl,
}: EmailLayoutOptions): Promise<string> {
    // Fetch design settings
    const settings = await getSystemSettings([
        'EMAIL_BRAND_LOGO',
        'EMAIL_BRAND_NAME',
        'EMAIL_PRIMARY_COLOR',
        'EMAIL_HEADER_BG',
        'EMAIL_FOOTER_TEXT',
        'EMAIL_SHOW_POWERED_BY',
    ]);

    const brandLogo = settings['EMAIL_BRAND_LOGO'];
    const brandName = settings['EMAIL_BRAND_NAME'] || DEFAULT_BRAND_NAME;
    const primaryColor = settings['EMAIL_PRIMARY_COLOR'] || DEFAULT_PRIMARY_COLOR;
    const headerBg = settings['EMAIL_HEADER_BG'] || DEFAULT_HEADER_BG;
    const footerText = settings['EMAIL_FOOTER_TEXT'];
    const showPoweredBy = settings['EMAIL_SHOW_POWERED_BY'] !== 'false';

    // Construct the Header HTML
    let headerHtml = '';
    if (brandLogo) {
        headerHtml = `<img src="${brandLogo}" alt="${brandName}" style="max-height: 50px; max-width: 200px; display: block; border: 0;" />`;
    } else {
        headerHtml = `<h1 style="margin: 0; font-size: 24px; color: ${primaryColor};">${brandName}</h1>`;
    }

    // Current Year for Footer
    const year = new Date().getFullYear();
    const reasonText = footerVariant === 'client'
        ? `This business document was sent using ${brandName}.`
        : footerVariant === 'lifecycle'
            ? `You are receiving this product guidance because you created a ${brandName} account.`
            : `This is an essential account or service email from ${brandName}.`;
    const preferenceText = footerVariant === 'lifecycle' && unsubscribeUrl
        ? `<br>You can <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">unsubscribe from emails like this</a> or update your communication preferences.`
        : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || brandName}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f3f4f6; padding-bottom: 40px; }
        .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #374151; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden; }
        .header-cell { padding: 30px; text-align: center; background-color: ${headerBg}; border-bottom: 1px solid #e5e7eb; }
        .content-cell { padding: 30px; background-color: #ffffff; }
        .footer-cell { padding: 30px; text-align: center; font-size: 13px; color: #6b7280; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
        
        /* Typography & Elements */
        h1, h2, h3 { color: #111827; margin-top: 0; }
        h1 { font-size: 24px; margin-bottom: 20px; }
        h2 { font-size: 20px; margin-bottom: 16px; }
        p { margin-bottom: 16px; font-size: 16px; }
        ul { margin-bottom: 16px; padding-left: 20px; }
        li { margin-bottom: 8px; }
        a { color: ${primaryColor}; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
        
        /* Components */
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: ${primaryColor}; 
          color: #ffffff !important; 
          text-decoration: none !important; 
          border-radius: 6px; 
          font-weight: 600; 
          font-size: 16px; 
          margin: 20px 0; 
          text-align: center;
        }
        .button:hover { opacity: 0.9; }
        
        .info-box { background-color: #f3f4f6; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
        .warning-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px; color: #92400e; }
        
        .invoice-details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .invoice-details td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .invoice-details td:last-child { text-align: right; font-weight: 600; color: #111827; }
        .invoice-details tr:last-child td { border-bottom: none; }

        .preview-text { display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; }
        
        /* Mobile Responsiveness */
        @media only screen and (max-width: 600px) {
          .main-table { width: 100% !important; border-radius: 0 !important; }
          .content-cell { padding: 20px !important; }
          .header-cell { padding: 20px !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <!-- Preview Text -->
        ${previewText ? `<div class="preview-text">${previewText}</div>` : ''}
        
        <table class="main-table" align="center">
          <!-- Global Header -->
          <tr>
            <td class="header-cell">
              ${headerHtml}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content-cell">
              ${content}
            </td>
          </tr>
          
          <!-- Global Footer -->
          <tr>
            <td class="footer-cell">
              ${footerText ? `<div style="margin-bottom: 20px;">${footerText}</div>` : ''}
              
              <div style="margin-bottom: 15px; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                ${reasonText}${preferenceText}
              </div>

              <div style="margin-bottom: 10px; font-size: 11px; color: #9ca3af;">
                <strong>${brandName}</strong><br>
                Lagos, Nigeria<br>
                <a href="mailto:support@invoicegenerator.ng" style="color: #9ca3af; text-decoration: none;">support@invoicegenerator.ng</a>
              </div>
              
              <div style="margin-top: 15px; font-size: 12px;">
                &copy; ${year} ${brandName}. All rights reserved.
              </div>
              
              ${showPoweredBy ? `
              <div style="margin-top: 8px; font-size: 11px; color: #9ca3af;">
                Powered by <a href="https://invoicegenerator.ng" style="color: #9ca3af; text-decoration: underline;">InvoiceGenerator.ng</a>
              </div>
              ` : ''}
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
}
