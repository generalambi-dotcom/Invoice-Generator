'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
  getRevenueReportAPI,
  getOutstandingReportAPI,
  getClientPaymentHistoryAPI,
  getTaxReportAPI,
  exportReportAPI,
} from '@/lib/api-client';
import { currencySymbols } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';

type ReportType = 'revenue' | 'outstanding' | 'clients' | 'tax';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ReportType>('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [outstandingData, setOutstandingData] = useState<any>(null);
  const [clientHistoryData, setClientHistoryData] = useState<any>(null);
  const [taxData, setTaxData] = useState<any>(null);
  
  // Filters
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [taxGroupBy, setTaxGroupBy] = useState<'month' | 'quarter' | 'year'>('month');
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    setUser(currentUser);
    loadReport();
  }, [router, activeTab, revenuePeriod, taxGroupBy, dateRange]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'revenue':
          const revenue = await getRevenueReportAPI({
            period: revenuePeriod,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          setRevenueData(revenue);
          break;
        case 'outstanding':
          const outstanding = await getOutstandingReportAPI();
          setOutstandingData(outstanding);
          break;
        case 'clients':
          const clients = await getClientPaymentHistoryAPI();
          setClientHistoryData(clients);
          break;
        case 'tax':
          const tax = await getTaxReportAPI({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            groupBy: taxGroupBy,
          });
          setTaxData(tax);
          break;
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (reportType: ReportType) => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (reportType) {
        case 'revenue':
          data = revenueData?.data || [];
          filename = `revenue-report-${revenuePeriod}`;
          break;
        case 'outstanding':
          data = outstandingData?.invoices || [];
          filename = 'outstanding-invoices';
          break;
        case 'clients':
          data = clientHistoryData?.clients || [];
          filename = 'client-payment-history';
          break;
        case 'tax':
          data = taxData?.data || [];
          filename = `tax-report-${taxGroupBy}`;
          break;
      }

      if (data.length === 0) {
        alert('No data to export');
        return;
      }

      const blob = await exportReportAPI(reportType, data, filename);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Failed to export: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['revenue', 'outstanding', 'clients', 'tax'] as ReportType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab === 'clients' ? 'Client History' : tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end">
            {(activeTab === 'revenue' || activeTab === 'tax') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}
            {activeTab === 'revenue' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
            {activeTab === 'tax' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group By
                </label>
                <select
                  value={taxGroupBy}
                  onChange={(e) => setTaxGroupBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                  <option value="year">Year</option>
                </select>
              </div>
            )}
            <button
              onClick={() => handleExport(activeTab)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Report Content */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-600">Loading report...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'revenue' && revenueData && (
              <div>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-2xl font-bold">
                      {currencySymbols['USD']} {formatCurrency(revenueData.totals.totalRevenue, 'USD')}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Paid Revenue</div>
                    <div className="text-2xl font-bold text-green-600">
                      {currencySymbols['USD']} {formatCurrency(revenueData.totals.paidRevenue, 'USD')}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Unpaid Revenue</div>
                    <div className="text-2xl font-bold text-red-600">
                      {currencySymbols['USD']} {formatCurrency(revenueData.totals.unpaidRevenue, 'USD')}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total Invoices</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {revenueData.totals.invoiceCount}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unpaid</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData.data.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.period}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {currencySymbols['USD']} {formatCurrency(item.totalRevenue, 'USD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            {currencySymbols['USD']} {formatCurrency(item.paidRevenue, 'USD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                            {currencySymbols['USD']} {formatCurrency(item.unpaidRevenue, 'USD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.invoiceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'outstanding' && outstandingData && (
              <div>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-red-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total Outstanding</div>
                    <div className="text-2xl font-bold text-red-600">
                      {currencySymbols['USD']} {formatCurrency(outstandingData.summary.totalOutstanding, 'USD')}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Overdue</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {currencySymbols['USD']} {formatCurrency(outstandingData.summary.overdueTotal, 'USD')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {outstandingData.summary.overdueCount} invoices
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Pending</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {currencySymbols['USD']} {formatCurrency(outstandingData.summary.pendingTotal, 'USD')}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total Invoices</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {outstandingData.summary.invoiceCount}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {outstandingData.invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{inv.clientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {format(new Date(inv.dueDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {currencySymbols[inv.currency as keyof typeof currencySymbols]} {formatCurrency(inv.total, inv.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                            {currencySymbols[inv.currency as keyof typeof currencySymbols]} {formatCurrency(inv.outstanding, inv.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              inv.paymentStatus === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inv.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'clients' && clientHistoryData && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">On Time</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Late</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientHistoryData.clients.map((client: any) => (
                      <tr key={client.clientId || client.clientName}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{client.clientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{client.totalInvoices}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {currencySymbols['USD']} {formatCurrency(client.totalAmount, 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {currencySymbols['USD']} {formatCurrency(client.paidAmount, 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          {currencySymbols['USD']} {formatCurrency(client.outstandingAmount, 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {client.onTimePayments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          {client.latePayments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tax' && taxData && (
              <div>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total Tax</div>
                    <div className="text-2xl font-bold">
                      {currencySymbols['USD']} {formatCurrency(taxData.totals.totalTax, 'USD')}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {currencySymbols['USD']} {formatCurrency(taxData.totals.totalRevenue, 'USD')}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Average Tax Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {taxData.totals.overallTaxRate.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {taxData.data.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.period}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {currencySymbols['USD']} {formatCurrency(item.totalTax, 'USD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {currencySymbols['USD']} {formatCurrency(item.totalRevenue, 'USD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {item.averageTaxRate.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.invoiceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

