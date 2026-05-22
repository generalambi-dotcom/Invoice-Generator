/**
 * Server-side PDF generation using @react-pdf/renderer.
 * Works on Vercel serverless (no Puppeteer / Chrome binary needed).
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { formatCurrency } from './calculations';
import { currencySymbols, themeColors, Theme } from '@/types/invoice';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  header: {
    marginBottom: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1, paddingRight: 20 },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  logoContainer: { width: 120, height: 55, marginBottom: 8 },
  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#111827' },
  companyAddress: { fontSize: 9, color: '#6B7280', lineHeight: 1.5 },
  invoiceTitle: {
    fontSize: 30,
    fontFamily: 'Helvetica',
    marginBottom: 16,
    color: '#D1D5DB',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 10,
  },
  metaValue: { fontSize: 10, color: '#111827', width: 90, textAlign: 'right' },
  clientSection: { flexDirection: 'row', marginBottom: 32, gap: 32 },
  clientCol: { flex: 1 },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  clientName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  clientInfo: { fontSize: 9, color: '#374151', lineHeight: 1.6 },
  table: { marginBottom: 20, borderRadius: 4, overflow: 'hidden' },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  colDescription: { width: '45%' },
  colQty: { width: '15%', textAlign: 'right' },
  colRate: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  tableText: { fontSize: 10, color: '#111827' },
  tableTextGray: { fontSize: 9, color: '#6B7280' },
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 24 },
  totalsBox: { width: '45%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { fontSize: 9, color: '#6B7280' },
  totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827' },
  totalDivider: { borderTopWidth: 2, borderTopColor: '#111827', marginVertical: 8 },
  grandTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827', textTransform: 'uppercase', letterSpacing: 1 },
  grandTotalValue: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  footerCol: { width: '50%', paddingRight: 16, marginBottom: 10 },
  footerText: { fontSize: 9, color: '#6B7280', lineHeight: 1.5 },
  watermark: { marginTop: 32, textAlign: 'center', fontSize: 8, color: '#D1D5DB' },
});

// ─── Document Component ──────────────────────────────────────────────────────

interface InvoiceDocumentProps {
  invoice: any;
}

function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const fmt = (d: string | Date) => {
    try { return format(new Date(d), 'dd MMM yyyy'); } catch { return String(d); }
  };

  const currency = invoice.currency || 'USD';
  const sym = (currencySymbols as any)[currency] || currency;
  const theme: Theme = invoice.theme || 'slate';
  const primaryColor = (themeColors as any)[theme]?.primary || '#475569';

  const company = invoice.company || {};
  const client = invoice.client || {};
  const items: any[] = invoice.lineItems || [];

  const docType =
    invoice.type === 'receipt' ? 'RECEIPT' :
    invoice.type === 'estimate' ? 'ESTIMATE' :
    invoice.type === 'credit_note' ? 'CREDIT NOTE' : 'INVOICE';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {company.logo && (
              <View style={styles.logoContainer}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={company.logo} style={styles.logo} />
              </View>
            )}
            <Text style={styles.companyName}>{company.name || 'Your Company'}</Text>
            <View style={styles.companyAddress}>
              {company.address ? <Text>{company.address}</Text> : null}
              <Text>{[company.city, company.state, company.zip, company.country].filter(Boolean).join(', ')}</Text>
              {company.phone ? <Text>{company.phone}</Text> : null}
              {company.email ? <Text>{company.email}</Text> : null}
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>{docType}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Number</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{fmt(invoice.invoiceDate)}</Text>
            </View>
            {invoice.type !== 'credit_note' && invoice.dueDate && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{invoice.type === 'estimate' ? 'Valid Until' : 'Due'}</Text>
                <Text style={styles.metaValue}>{fmt(invoice.dueDate)}</Text>
              </View>
            )}
            {invoice.purchaseOrder && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>PO #</Text>
                <Text style={styles.metaValue}>{invoice.purchaseOrder}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.clientSection}>
          <View style={styles.clientCol}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.clientName}>{client.name || 'Client Name'}</Text>
            <View style={styles.clientInfo}>
              {client.address ? <Text>{client.address}</Text> : null}
              <Text>{[client.city, client.state, client.zip, client.country].filter(Boolean).join(', ')}</Text>
              {client.phone ? <Text>{client.phone}</Text> : null}
              {client.email ? <Text>{client.email}</Text> : null}
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: primaryColor }]}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>
          {items.length > 0 ? items.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: '#FAFAFA' } : {}]}>
              <Text style={[styles.tableText, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableTextGray, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableTextGray, styles.colRate]}>{sym}{formatCurrency(item.rate || 0, currency)}</Text>
              <Text style={[styles.tableText, styles.colAmount]}>{sym}{formatCurrency(item.amount || 0, currency)}</Text>
            </View>
          )) : (
            <View style={styles.tableRow}>
              <Text style={{ fontSize: 9, color: '#9CA3AF', fontStyle: 'italic' }}>No items</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{sym}{formatCurrency(invoice.subtotal || 0, currency)}</Text>
            </View>
            {(invoice.discountAmount || 0) > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#059669' }]}>
                  Discount{invoice.discountRate ? ` (${invoice.discountRate}%)` : ''}
                </Text>
                <Text style={[styles.totalValue, { color: '#059669' }]}>-{sym}{formatCurrency(invoice.discountAmount, currency)}</Text>
              </View>
            )}
            {(invoice.taxAmount || 0) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</Text>
                <Text style={styles.totalValue}>{sym}{formatCurrency(invoice.taxAmount, currency)}</Text>
              </View>
            )}
            {(invoice.shipping || 0) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>{sym}{formatCurrency(invoice.shipping, currency)}</Text>
              </View>
            )}
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={[styles.grandTotalValue, { color: primaryColor }]}>{sym}{formatCurrency(invoice.total || 0, currency)}</Text>
            </View>
            {(invoice.paidAmount || 0) > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: '#059669' }]}>Amount Paid</Text>
                  <Text style={[styles.totalValue, { color: '#059669' }]}>{sym}{formatCurrency(invoice.paidAmount, currency)}</Text>
                </View>
                {invoice.total > invoice.paidAmount && (
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: '#DC2626', fontFamily: 'Helvetica-Bold' }]}>Balance Due</Text>
                    <Text style={[styles.totalValue, { color: '#DC2626' }]}>{sym}{formatCurrency(invoice.total - invoice.paidAmount, currency)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Footer */}
        {(invoice.bankDetails || invoice.notes || invoice.terms) && (
          <View style={styles.footer}>
            {invoice.bankDetails && (
              <View style={styles.footerCol}>
                <Text style={styles.sectionLabel}>Payment Details</Text>
                <Text style={styles.footerText}>{invoice.bankDetails}</Text>
              </View>
            )}
            {invoice.notes && (
              <View style={styles.footerCol}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <Text style={[styles.footerText, { fontStyle: 'italic' }]}>{invoice.notes}</Text>
              </View>
            )}
            {invoice.terms && (
              <View style={{ width: '100%', marginTop: 8 }}>
                <Text style={styles.sectionLabel}>Terms & Conditions</Text>
                <Text style={styles.footerText}>{invoice.terms}</Text>
              </View>
            )}
          </View>
        )}

        {!invoice.hideWatermark && (
          <Text style={styles.watermark}>Created with invoicegenerator.ng</Text>
        )}
      </Page>
    </Document>
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function generateInvoicePDFBuffer(invoice: any): Promise<Buffer | null> {
  if (!invoice || !invoice.id) return null;
  try {
    const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice} />);
    return Buffer.from(buffer);
  } catch (error: any) {
    console.error('Error generating PDF with react-pdf:', error);
    return null;
  }
}
