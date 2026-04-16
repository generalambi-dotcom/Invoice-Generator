/**
 * Server-side PDF generation utility
 * Generates PDFs for email attachments using Puppeteer for pixel-perfect accuracy.
 */

import puppeteer from 'puppeteer';

/**
 * Generate PDF buffer for invoice using Puppeteer
 */
export async function generateInvoicePDFBuffer(invoice: any): Promise<Buffer | null> {
  if (!invoice || !invoice.id) return null;

  try {
    const executablePath = process.env.CHROME_EXECUTABLE_PATH || undefined;

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    // Resolve URL based on environment
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (!process.env.NEXT_PUBLIC_APP_URL && process.env.VERCEL_URL) {
        appUrl = `https://${process.env.VERCEL_URL}`;
    }
    
    // Point to the dedicated public print view.
    // The print layout handles hiding all UI buttons natively via Tailwind 'print:hidden' classes.
    const url = `${appUrl.replace(/\/$/, '')}/invoice/${invoice.id}`;

    const page = await browser.newPage();
    
    // Wait until network is mostly idle to ensure React data fetching finishes
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Extra safety: wait for the loading spinner to disappear
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 5000 }).catch(() => {});
    
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

