/**
 * Server-side PDF generation utility
 * Generates PDFs for email attachments using Puppeteer for pixel-perfect accuracy.
 */

import puppeteer from 'puppeteer';
import { renderToStaticMarkup } from 'react-dom/server';
import InvoicePaper from '@/components/InvoicePaper';

/**
 * Generate PDF buffer for invoice using Puppeteer and InvoicePaper
 */
export async function generateInvoicePDFBuffer(invoice: any): Promise<Buffer | null> {
  try {
    const htmlContent = renderToStaticMarkup(
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body className="bg-white p-8">
          <InvoicePaper invoice={invoice} isEditable={false} />
        </body>
      </html>
    );

    const executablePath = process.env.CHROME_EXECUTABLE_PATH || undefined;

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const page = await browser.newPage();
    // Use networkidle0 to ensure Tailwind script evaluates completely
    await page.setContent('<!DOCTYPE html>' + htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    return Buffer.from(pdf);
  } catch (error: any) {
    console.error('Error generating PDF buffer via Puppeteer:', error);
    return null;
  }
}

