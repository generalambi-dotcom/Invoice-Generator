import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row => row.map(escapeCSV).join(','));
  return [headerLine, ...dataLines].join('\n');
}

// ─── Format transformers ───────────────────────────────────────────────────────

/**
 * Generic CSV — all key invoice fields, readable format
 */
function toGenericCSV(invoices: any[]): string {
  const headers = [
    'Invoice Number', 'Type', 'Invoice Date', 'Due Date',
    'Customer Name', 'Customer Email', 'Customer Phone', 'Customer Address',
    'Subtotal', 'Discount Amount', 'Tax Rate (%)', 'Tax Amount',
    'Shipping', 'Total', 'Paid Amount', 'Balance Due',
    'Currency', 'Status', 'Payment Date', 'Notes',
  ];

  const rows = invoices.map(inv => {
    const client = (inv.clientInfo as any) || {};
    const balanceDue = Math.max(0, inv.total - (inv.paidAmount || 0));
    return [
      inv.invoiceNumber,
      inv.type,
      inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '',
      inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      client.name || '',
      client.email || '',
      client.phone || '',
      [client.address, client.city, client.state, client.country].filter(Boolean).join(', '),
      inv.subtotal?.toFixed(2) || '0.00',
      inv.discountAmount?.toFixed(2) || '0.00',
      inv.taxRate?.toFixed(2) || '0.00',
      inv.taxAmount?.toFixed(2) || '0.00',
      inv.shipping?.toFixed(2) || '0.00',
      inv.total?.toFixed(2) || '0.00',
      (inv.paidAmount || 0).toFixed(2),
      balanceDue.toFixed(2),
      inv.currency || 'NGN',
      inv.paymentStatus || '',
      inv.paymentDate ? new Date(inv.paymentDate).toISOString().split('T')[0] : '',
      inv.notes || '',
    ];
  });

  return buildCSV(headers, rows);
}

/**
 * QuickBooks Online compatible CSV
 * Matches QuickBooks Online invoice CSV import layout
 */
function toQuickBooksCSV(invoices: any[]): string {
  const headers = [
    'Invoice No', 'Customer', 'Invoice Date', 'Due Date',
    'Item Description', 'Qty', 'Rate', 'Amount',
    'Tax Name', 'Tax Rate (%)', 'Tax Amount',
    'Discount Amount', 'Shipping Amount',
    'Total', 'Currency', 'Status', 'Memo',
  ];

  const rows: string[][] = [];

  invoices.forEach(inv => {
    const client = (inv.clientInfo as any) || {};
    const lineItems: any[] = Array.isArray(inv.lineItems) ? inv.lineItems : [];

    if (lineItems.length === 0) {
      // No line items — output a single row with totals
      rows.push([
        inv.invoiceNumber,
        client.name || '',
        inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '',
        inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
        'Services',
        '1',
        inv.subtotal?.toFixed(2) || '0.00',
        inv.subtotal?.toFixed(2) || '0.00',
        'VAT',
        inv.taxRate?.toFixed(2) || '0.00',
        inv.taxAmount?.toFixed(2) || '0.00',
        inv.discountAmount?.toFixed(2) || '0.00',
        inv.shipping?.toFixed(2) || '0.00',
        inv.total?.toFixed(2) || '0.00',
        inv.currency || 'NGN',
        inv.paymentStatus || '',
        inv.notes || '',
      ]);
    } else {
      // One row per line item; only first row includes header fields
      lineItems.forEach((item, i) => {
        const qty = item.quantity || 1;
        const rate = item.rate || item.price || 0;
        const amount = item.amount || (qty * rate);
        rows.push([
          i === 0 ? inv.invoiceNumber : '',
          i === 0 ? (client.name || '') : '',
          i === 0 ? (inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '') : '',
          i === 0 ? (inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '') : '',
          item.description || item.name || '',
          String(qty),
          rate.toFixed(2),
          amount.toFixed(2),
          i === lineItems.length - 1 ? 'VAT' : '',
          i === lineItems.length - 1 ? (inv.taxRate?.toFixed(2) || '0.00') : '',
          i === lineItems.length - 1 ? (inv.taxAmount?.toFixed(2) || '0.00') : '',
          i === lineItems.length - 1 ? (inv.discountAmount?.toFixed(2) || '0.00') : '',
          i === lineItems.length - 1 ? (inv.shipping?.toFixed(2) || '0.00') : '',
          i === lineItems.length - 1 ? (inv.total?.toFixed(2) || '0.00') : '',
          i === 0 ? (inv.currency || 'NGN') : '',
          i === 0 ? (inv.paymentStatus || '') : '',
          i === 0 ? (inv.notes || '') : '',
        ]);
      });
    }
  });

  return buildCSV(headers, rows);
}

/**
 * Xero compatible CSV
 * Matches Xero's standard invoice import CSV format
 */
function toXeroCSV(invoices: any[]): string {
  const headers = [
    '*ContactName', 'EmailAddress',
    '*InvoiceNumber', 'Reference',
    '*InvoiceDate', '*DueDate',
    'Description', 'Quantity', '*UnitAmount',
    '*AccountCode', '*TaxType',
    '*Currency', 'BrandingTheme',
    'Subtotal', 'TotalTax', 'Total',
  ];

  const rows: string[][] = [];

  invoices.forEach(inv => {
    const client = (inv.clientInfo as any) || {};
    const lineItems: any[] = Array.isArray(inv.lineItems) ? inv.lineItems : [];
    const taxType = (inv.taxRate || 0) > 0 ? 'OUTPUT' : 'NONE';

    if (lineItems.length === 0) {
      rows.push([
        client.name || '',
        client.email || '',
        inv.invoiceNumber,
        inv.purchaseOrder || '',
        inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '',
        inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
        'Professional Services',
        '1',
        inv.subtotal?.toFixed(2) || '0.00',
        '200',         // Default income account code
        taxType,
        inv.currency || 'NGN',
        '',
        inv.subtotal?.toFixed(2) || '0.00',
        inv.taxAmount?.toFixed(2) || '0.00',
        inv.total?.toFixed(2) || '0.00',
      ]);
    } else {
      lineItems.forEach((item, i) => {
        const qty = item.quantity || 1;
        const rate = item.rate || item.price || 0;
        rows.push([
          i === 0 ? (client.name || '') : '',
          i === 0 ? (client.email || '') : '',
          i === 0 ? inv.invoiceNumber : '',
          i === 0 ? (inv.purchaseOrder || '') : '',
          i === 0 ? (inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '') : '',
          i === 0 ? (inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '') : '',
          item.description || item.name || '',
          String(qty),
          rate.toFixed(2),
          '200',       // Default income account code
          taxType,
          i === 0 ? (inv.currency || 'NGN') : '',
          '',
          i === lineItems.length - 1 ? (inv.subtotal?.toFixed(2) || '0.00') : '',
          i === lineItems.length - 1 ? (inv.taxAmount?.toFixed(2) || '0.00') : '',
          i === lineItems.length - 1 ? (inv.total?.toFixed(2) || '0.00') : '',
        ]);
      });
    }
  });

  return buildCSV(headers, rows);
}

/**
 * Sage Business Cloud compatible CSV
 * Matches Sage's transaction import format
 */
function toSageCSV(invoices: any[]): string {
  const headers = [
    'Date', 'Transaction Type', 'Reference',
    'Customer Name', 'Customer Email',
    'Description', 'Net Amount', 'Tax Code', 'Tax Rate (%)', 'Tax Amount',
    'Gross Amount', 'Currency', 'Status', 'Due Date',
    'Purchase Order',
  ];

  const rows = invoices.map(inv => {
    const client = (inv.clientInfo as any) || {};
    const lineItems: any[] = Array.isArray(inv.lineItems) ? inv.lineItems : [];
    const description = lineItems.length > 0
      ? lineItems.map((l: any) => l.description || l.name || '').filter(Boolean).join('; ')
      : 'Professional Services';

    const taxCode = (inv.taxRate || 0) > 0 ? 'T1' : 'T0'; // Sage tax codes

    return [
      inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '',
      'Sales Invoice',
      inv.invoiceNumber,
      client.name || '',
      client.email || '',
      description,
      inv.subtotal?.toFixed(2) || '0.00',
      taxCode,
      inv.taxRate?.toFixed(2) || '0.00',
      inv.taxAmount?.toFixed(2) || '0.00',
      inv.total?.toFixed(2) || '0.00',
      inv.currency || 'NGN',
      inv.paymentStatus || '',
      inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      inv.purchaseOrder || '',
    ];
  });

  return buildCSV(headers, rows);
}

// ─── Route handler ─────────────────────────────────────────────────────────────

/**
 * POST - Export report data to CSV
 * Body:
 *   Generic export:     { reportType, data, filename }
 *   Accounting export:  { format: 'quickbooks'|'xero'|'sage', startDate?, endDate?, status? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = `user:${user.userId}`;
    const limiter = rateLimit(rateLimitConfigs.general);
    const limitResult = limiter(identifier);

    if (!limitResult.allowed) {
      return NextResponse.json({ error: limitResult.message }, { status: 429 });
    }

    const body = await request.json();
    const { format } = body;

    // ── Accounting software exports (& generic server-side export) ───────────
    if (format === 'generic' || format === 'quickbooks' || format === 'xero' || format === 'sage') {
      const { startDate, endDate, status } = body;

      const where: any = {
        userId: user.userId,
        type: 'invoice', // Invoices only for accounting exports
      };

      if (startDate || endDate) {
        where.invoiceDate = {};
        if (startDate) where.invoiceDate.gte = new Date(startDate);
        if (endDate) where.invoiceDate.lte = new Date(endDate);
      }

      if (status && status !== 'all') {
        where.paymentStatus = status;
      }

      const invoices = await prisma.invoice.findMany({
        where,
        orderBy: { invoiceDate: 'desc' },
        select: {
          invoiceNumber: true,
          type: true,
          invoiceDate: true,
          dueDate: true,
          purchaseOrder: true,
          clientInfo: true,
          lineItems: true,
          subtotal: true,
          taxRate: true,
          taxAmount: true,
          discountRate: true,
          discountAmount: true,
          shipping: true,
          total: true,
          paidAmount: true,
          paymentStatus: true,
          paymentDate: true,
          currency: true,
          notes: true,
        },
      });

      if (invoices.length === 0) {
        return NextResponse.json({ error: 'No invoices found for the selected period' }, { status: 404 });
      }

      let csv: string;
      let filename: string;
      const dateStr = new Date().toISOString().split('T')[0];

      switch (format) {
        case 'quickbooks':
          csv = toQuickBooksCSV(invoices);
          filename = `quickbooks-invoices-${dateStr}.csv`;
          break;
        case 'xero':
          csv = toXeroCSV(invoices);
          filename = `xero-invoices-${dateStr}.csv`;
          break;
        case 'sage':
          csv = toSageCSV(invoices);
          filename = `sage-invoices-${dateStr}.csv`;
          break;
        case 'generic':
        default:
          csv = toGenericCSV(invoices);
          filename = `invoices-${dateStr}.csv`;
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // ── Generic CSV export (legacy — pass data array from client) ─────────────
    const { data, filename } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    const headers = Object.keys(data[0]);
    const csv = buildCSV(
      headers,
      data.map((row: any) => headers.map(h => row[h])),
    );

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename || 'report'}.csv"`,
      },
    });

  } catch (error: any) {
    console.error('Error exporting report:', error);
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 });
  }
}
