'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { currencySymbols } from '@/types/invoice';
import { formatCurrency } from './calculations';
import { format } from 'date-fns';

// Reuse invoice PDF styles
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
  creditNoteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#dc2626',
  },
  creditNoteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  creditNoteDetailsLeft: {
    flex: 1,
  },
  creditNoteDetailsRight: {
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
    width: '50%',
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
    width: '15%',
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
    borderTopColor: '#dc2626',
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
    color: '#dc2626',
  },
  notes: {
    marginTop: 30,
    fontSize: 9,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  reason: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    fontSize: 9,
    color: '#991b1b',
    lineHeight: 1.5,
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

interface CreditNotePDFProps {
  creditNote: any;
}

export const CreditNotePDF: React.FC<CreditNotePDFProps> = ({ creditNote }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const currencySymbol = currencySymbols[creditNote.currency as keyof typeof currencySymbols] || '$';
  const company = creditNote.companyInfo as any;
  const client = creditNote.clientInfo as any;
  const lineItems = (creditNote.lineItems || []) as any[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {company?.logo && (
              <View style={styles.logoContainer}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={company.logo} style={styles.logo} />
              </View>
            )}
            <Text style={styles.companyName}>{company?.name || ''}</Text>
            <View style={styles.companyAddress}>
              {company?.address && <Text>{company.address}</Text>}
              {(company?.city || company?.state || company?.zip) && (
                <Text>
                  {company.city || ''}, {company.state || ''} {company.zip || ''}
                </Text>
              )}
              {company?.country && <Text>{company.country}</Text>}
              {company?.phone && <Text>Phone: {company.phone}</Text>}
              {company?.email && <Text>Email: {company.email}</Text>}
              {company?.website && <Text>Website: {company.website}</Text>}
            </View>
          </View>
        </View>

        {/* Credit Note Title */}
        <Text style={styles.creditNoteTitle}>CREDIT NOTE</Text>

        {/* Credit Note Details */}
        <View style={styles.creditNoteDetails}>
          <View style={styles.creditNoteDetailsLeft}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill To:</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text>{client?.name || ''}</Text>
              {client?.address && <Text>{client.address}</Text>}
              {(client?.city || client?.state || client?.zip) && (
                <Text>
                  {client.city || ''}, {client.state || ''} {client.zip || ''}
                </Text>
              )}
              {client?.country && <Text>{client.country}</Text>}
              {client?.phone && <Text>Phone: {client.phone}</Text>}
              {client?.email && <Text>Email: {client.email}</Text>}
            </View>
          </View>
          <View style={styles.creditNoteDetailsRight}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Credit Note #:</Text>
              <Text style={styles.detailValue}>{creditNote.creditNoteNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(creditNote.creditNoteDate)}</Text>
            </View>
            {creditNote.invoice && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice #:</Text>
                <Text style={styles.detailValue}>{creditNote.invoice.invoiceNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reason */}
        {creditNote.reason && (
          <View style={styles.reason}>
            <Text style={styles.sectionTitle}>Reason:</Text>
            <Text>{creditNote.reason}</Text>
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
          {lineItems.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableText, styles.colDescription]}>{item.description || ''}</Text>
              <Text style={[styles.tableText, styles.colQuantity]}>{item.quantity || 0}</Text>
              <Text style={[styles.tableText, styles.colRate]}>
                {currencySymbol} {formatCurrency(item.rate || 0, creditNote.currency)}
              </Text>
              <Text style={[styles.tableText, styles.colAmount]}>
                {currencySymbol} {formatCurrency(item.amount || 0, creditNote.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {currencySymbol} {formatCurrency(creditNote.subtotal || 0, creditNote.currency)}
            </Text>
          </View>
          {(creditNote.taxAmount || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({creditNote.taxRate || 0}%):</Text>
              <Text style={styles.totalValue}>
                {currencySymbol} {formatCurrency(creditNote.taxAmount || 0, creditNote.currency)}
              </Text>
            </View>
          )}
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>Total Credit:</Text>
            <Text style={styles.totalFinalValue}>
              {currencySymbol} {formatCurrency(creditNote.total || 0, creditNote.currency)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {creditNote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.notes}>{creditNote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a credit note. Please contact us if you have any questions.</Text>
        </View>
      </Page>
    </Document>
  );
};

