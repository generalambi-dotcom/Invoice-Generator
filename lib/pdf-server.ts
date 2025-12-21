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
export async function generateInvoicePDFBuffer(invoice: any): Promise<Buffer | null> {
  try {
    // For now, return null - PDF generation will be added later
    // This allows emails to be sent without PDF attachment
    // In production, implement one of the options above
    
    console.log('PDF generation skipped - to be implemented');
    return null;
  } catch (error: any) {
    console.error('Error generating PDF buffer:', error);
    return null;
  }
}

