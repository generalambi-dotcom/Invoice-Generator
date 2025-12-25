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
  },
  header: {
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  companyAddress: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  invoiceDetailsLeft: {
    flex: 1,
  },
  invoiceDetailsRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  clientInfo: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colDescription: {
    width: '40%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'right',
  },
  colRate: {
    width: '20%',
    textAlign: 'right',
  },
  colAmount: {
    width: '25%',
    textAlign: 'right',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1a1a1a',
  },
  tableText: {
    fontSize: 9,
    color: '#1a1a1a',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
    width: 250,
  },
  totalLabel: {
    width: 150,
    textAlign: 'right',
    fontSize: 9,
    color: '#666',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 9,
    color: '#1a1a1a',
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#1a1a1a',
    width: 250,
  },
  totalFinalLabel: {
    width: 150,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalFinalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  notes: {
    marginTop: 30,
    fontSize: 9,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
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

  const currencySymbol = currencySymbols[invoice.currency];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {invoice.company.logo && (
              <View style={styles.logoContainer}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={invoice.company.logo} style={styles.logo} />
              </View>
            )}
            <Text style={styles.companyName}>{invoice.company.name}</Text>
            <View style={styles.companyAddress}>
              <Text>{invoice.company.address}</Text>
              <Text>
                {invoice.company.city}, {invoice.company.state} {invoice.company.zip}
              </Text>
              <Text>{invoice.company.country}</Text>
              {invoice.company.phone && <Text>Phone: {invoice.company.phone}</Text>}
              {invoice.company.email && <Text>Email: {invoice.company.email}</Text>}
              {invoice.company.website && <Text>Website: {invoice.company.website}</Text>}
            </View>
          </View>
        </View>

        {/* Invoice Title */}
        <Text style={styles.invoiceTitle}>INVOICE</Text>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceDetailsLeft}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill To:</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text>{invoice.client.name}</Text>
              <Text>{invoice.client.address}</Text>
              <Text>
                {invoice.client.city}, {invoice.client.state} {invoice.client.zip}
              </Text>
              <Text>{invoice.client.country}</Text>
              {invoice.client.phone && <Text>Phone: {invoice.client.phone}</Text>}
              {invoice.client.email && <Text>Email: {invoice.client.email}</Text>}
            </View>
          </View>
          <View style={styles.invoiceDetailsRight}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice #:</Text>
              <Text style={styles.detailValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            {invoice.purchaseOrder && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PO #:</Text>
                <Text style={styles.detailValue}>{invoice.purchaseOrder}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Ship To (if provided) */}
        {invoice.shipTo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <View style={styles.clientInfo}>
              <Text>{invoice.shipTo.name}</Text>
              <Text>{invoice.shipTo.address}</Text>
              <Text>
                {invoice.shipTo.city}, {invoice.shipTo.state} {invoice.shipTo.zip}
              </Text>
              <Text>{invoice.shipTo.country}</Text>
            </View>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDescription]}>Description</Text>
            <Text style={[styles.headerText, styles.colQuantity]}>Qty</Text>
            <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
            <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableText, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableText, styles.colQuantity]}>{item.quantity}</Text>
              <Text style={[styles.tableText, styles.colRate]}>
                {currencySymbol} {formatCurrency(item.rate, invoice.currency)}
              </Text>
              <Text style={[styles.tableText, styles.colAmount]}>
                {currencySymbol} {formatCurrency(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {currencySymbol} {formatCurrency(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
          {invoice.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Discount ({invoice.discountRate}%):
              </Text>
              <Text style={styles.totalValue}>
                -{currencySymbol} {formatCurrency(invoice.discountAmount, invoice.currency)}
              </Text>
            </View>
          )}
          {invoice.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%):</Text>
              <Text style={styles.totalValue}>
                {currencySymbol} {formatCurrency(invoice.taxAmount, invoice.currency)}
              </Text>
            </View>
          )}
          {invoice.shipping > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping:</Text>
              <Text style={styles.totalValue}>
                {currencySymbol} {formatCurrency(invoice.shipping, invoice.currency)}
              </Text>
            </View>
          )}
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>Total:</Text>
            <Text style={styles.totalFinalValue}>
              {currencySymbol} {formatCurrency(invoice.total, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        )}

        {/* Bank Details */}
        {invoice.bankDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details:</Text>
            <Text style={styles.notes}>{invoice.bankDetails}</Text>
          </View>
        )}

        {/* Terms */}
        {invoice.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions:</Text>
            <Text style={styles.notes}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

