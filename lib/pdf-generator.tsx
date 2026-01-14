'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice, currencySymbols } from '@/types/invoice';
import { formatCurrency } from './calculations';
import { format } from 'date-fns';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827', // gray-900
  },
  header: {
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 20,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logoContainer: {
    width: 120,
    height: 60,
    marginBottom: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
  },
  companyAddress: {
    fontSize: 9,
    color: '#6B7280', // gray-500
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'light', // font-light
    marginBottom: 20,
    color: '#D1D5DB', // gray-300
    textTransform: 'uppercase',
    letterSpacing: 4, // tracking-widest
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  metaLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 10,
  },
  metaValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'medium',
    width: 80,
    textAlign: 'right',
  },
  clientSection: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 40,
  },
  clientCol: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#9CA3AF', // gray-400
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  clientInfo: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // gray-50
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  colDescription: { width: '45%' },
  colQuantity: { width: '15%', textAlign: 'right' },
  colRate: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },

  tableText: {
    fontSize: 10,
    color: '#111827',
  },
  tableTextSecondary: {
    fontSize: 10,
    color: '#6B7280',
  },

  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  totalsContainer: {
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 9,
    color: '#4B5563',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#111827',
  },
  totalDueLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalDueValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3F83F8', // theme-primary (blue-500 approx)
  },

  footerSection: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footerCol: {
    width: '50%',
    paddingRight: 20,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  watermark: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#D1D5DB',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const currencySymbol = currencySymbols[invoice.currency || 'USD'];
  const currency = invoice.currency || 'USD';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Split Layout */}
        <View style={styles.header}>
          {/* Left: Company Brand */}
          <View style={styles.headerLeft}>
            {invoice.company?.logo && (
              <View style={styles.logoContainer}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={invoice.company.logo} style={styles.logo} />
              </View>
            )}
            <Text style={styles.companyName}>{invoice.company?.name || 'Company Name'}</Text>
            <View style={styles.companyAddress}>
              {invoice.company?.address && <Text>{invoice.company.address}</Text>}
              <Text>
                {[
                  invoice.company?.city,
                  invoice.company?.state,
                  invoice.company?.zip,
                  invoice.company?.country
                ].filter(Boolean).join(', ')}
              </Text>
              {invoice.company?.phone && <Text>{invoice.company.phone}</Text>}
              {invoice.company?.email && <Text>{invoice.company.email}</Text>}
              {invoice.company?.website && <Text>{invoice.company.website}</Text>}
            </View>
          </View>

          {/* Right: Invoice Title & Meta */}
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Number</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.invoiceDate || '')}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueDate || '')}</Text>
            </View>
            {invoice.purchaseOrder && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>PO #</Text>
                <Text style={styles.metaValue}>{invoice.purchaseOrder}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bill To / Ship To Section */}
        <View style={styles.clientSection}>
          <View style={styles.clientCol}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <View style={styles.clientInfo}>
              <Text style={{ fontWeight: 'bold', color: '#111827', marginBottom: 2 }}>
                {invoice.client?.name || 'Client Name'}
              </Text>
              {invoice.client?.address && <Text>{invoice.client.address}</Text>}
              <Text>
                {[
                  invoice.client?.city,
                  invoice.client?.state,
                  invoice.client?.zip,
                  invoice.client?.country
                ].filter(Boolean).join(', ')}
              </Text>
              {invoice.client?.phone && <Text>Phone: {invoice.client.phone}</Text>}
              {invoice.client?.email && <Text>Email: {invoice.client.email}</Text>}
            </View>
          </View>

          {invoice.shipTo && (
            <View style={styles.clientCol}>
              <Text style={styles.sectionLabel}>Ship To</Text>
              <View style={styles.clientInfo}>
                <Text style={{ fontWeight: 'bold', color: '#111827', marginBottom: 2 }}>
                  {invoice.shipTo.name || invoice.client?.name}
                </Text>
                {invoice.shipTo.address && <Text>{invoice.shipTo.address}</Text>}
                <Text>
                  {[
                    invoice.shipTo.city,
                    invoice.shipTo.state,
                    invoice.shipTo.zip,
                    invoice.shipTo.country
                  ].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {invoice.lineItems && invoice.lineItems.length > 0 ? (
            invoice.lineItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableText, styles.colDescription]}>{item.description}</Text>
                <Text style={[styles.tableTextSecondary, styles.colQuantity]}>{item.quantity}</Text>
                <Text style={[styles.tableTextSecondary, styles.colRate]}>
                  {currencySymbol} {formatCurrency(item.rate || 0, currency)}
                </Text>
                <Text style={[styles.tableText, styles.colAmount]}>
                  {currencySymbol} {formatCurrency(item.amount || 0, currency)}
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.tableRow, { justifyContent: 'center' }]}>
              <Text style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' }}>No items added</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {currencySymbol} {formatCurrency(invoice.subtotal || 0, currency)}
              </Text>
            </View>

            {invoice.discountAmount !== undefined && invoice.discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#059669' }]}>
                  Discount {invoice.discountRate ? `(${invoice.discountRate}%)` : ''}
                </Text>
                <Text style={[styles.totalValue, { color: '#059669' }]}>
                  -{currencySymbol} {formatCurrency(invoice.discountAmount || 0, currency)}
                </Text>
              </View>
            )}

            {invoice.taxAmount !== undefined && invoice.taxAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ''}</Text>
                <Text style={styles.totalValue}>
                  {currencySymbol} {formatCurrency(invoice.taxAmount || 0, currency)}
                </Text>
              </View>
            )}

            {invoice.shipping !== undefined && invoice.shipping > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>
                  {currencySymbol} {formatCurrency(invoice.shipping || 0, currency)}
                </Text>
              </View>
            )}

            <View style={styles.totalDueRow}>
              <Text style={styles.totalDueLabel}>Total Due</Text>
              <Text style={styles.totalDueValue}>
                {currencySymbol} {formatCurrency(invoice.total || 0, currency)}
              </Text>
            </View>

            {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
              <View style={{ marginTop: 10 }}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: '#059669' }]}>Amount Paid</Text>
                  <Text style={[styles.totalValue, { color: '#059669' }]}>
                    {currencySymbol} {formatCurrency(invoice.paidAmount || 0, currency)}
                  </Text>
                </View>
                {invoice.total !== undefined && invoice.paidAmount < invoice.total && (
                  <View style={[styles.totalRow, { marginTop: 4, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 4 }]}>
                    <Text style={[styles.totalLabel, { color: '#DC2626', fontWeight: 'bold' }]}>Balance Due</Text>
                    <Text style={[styles.totalValue, { color: '#DC2626' }]}>
                      {currencySymbol} {formatCurrency(invoice.total - invoice.paidAmount, currency)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Footer Notes & Bank Details */}
        {(invoice.notes || invoice.bankDetails || invoice.terms) && (
          <View style={styles.footerSection}>
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
              <View style={{ width: '100%', marginTop: 10 }}>
                <Text style={styles.sectionLabel}>Terms & Conditions</Text>
                <Text style={styles.footerText}>{invoice.terms}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.watermark}>Powered by InvoiceNaija</Text>
      </Page>
    </Document>
  );
};

