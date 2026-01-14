/**
 * Server-side PDF generation utility
 * Generates PDFs for email attachments using a different approach
 * 
 * Note: @react-pdf/renderer doesn't work in API routes.
 * For now, we'll skip PDF attachment in emails and add it later with a proper server-side solution.
 */

import { Invoice } from '@prisma/client';

/**
 * Generate PDF buffer for invoice (placeholder)
 * TODO: Implement proper server-side PDF generation
 * Options:
 * 1. Use puppeteer to render HTML to PDF
 * 2. Use a PDF service API
 * 3. Pre-generate PDFs and store them
 */
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from './pdf-generator';

/**
 * Generate PDF buffer for invoice using @react-pdf/renderer
 */
export async function generateInvoicePDFBuffer(invoice: any): Promise<Buffer | null> {
  try {
    // Render the PDF to a buffer
    // Note: React-PDF requires a valid React element
    const buffer = await renderToBuffer(InvoicePDF({ invoice }));
    return buffer;
  } catch (error: any) {
    console.error('Error generating PDF buffer:', error);
    return null;
  }
}

