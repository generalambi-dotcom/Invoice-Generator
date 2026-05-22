
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { RevenueTrendsChart, InvoiceStatusChart, TopClientsTable } from '@/components/ReportsComponents';

// ─── Export formats config ─────────────────────────────────────────────────────
const EXPORT_FORMATS = [
  {
    id: 'generic',
    label: 'Generic CSV',
    description: 'All invoice fields in a readable spreadsheet format',
    icon: '📄',
    hint: 'Works with Excel, Google Sheets, Numbers',
  },
  {
    id: 'quickbooks',
    label: 'QuickBooks',
    description: 'Compatible with QuickBooks Online import',
    icon: '📊',
    hint: 'For QuickBooks Online invoice import',
  },
  {
    id: 'xero',
    label: 'Xero',
    description: 'Compatible with Xero invoice import format',
    icon: '📈',
    hint: 'For Xero Accounting invoice import',
  },
  {
    id: 'sage',
    label: 'Sage',
    description: 'Compatible with Sage Business Cloud / Sage 50',
    icon: '📉',
    hint: 'For Sage transaction import',
  },
] as const;

type ExportFormat = typeof EXPORT_FORMATS[number]['id'];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Export state
  const [exportFormat, setExportFormat] = useState<ExportFormat>('generic');
  const [exportStatus, setExportStatus] = useState('all');
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [exportEndDate, setExportEndDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/signin'); return; }
    fetchReports();
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showFormatDropdown) return;
    const handler = () => setShowFormatDropdown(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showFormatDropdown]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportMessage('');

    try {
      const body: any = { format: exportFormat };
      if (exportStartDate) body.startDate = exportStartDate;
      if (exportEndDate) body.endDate = exportEndDate;
      if (exportStatus !== 'all') body.status = exportStatus;

      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setExportMessage(err.error || 'Export failed');
        return;
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cd = res.headers.get('Content-Disposition') || '';
      const filenameMatch = cd.match(/filename="([^"]+)"/);
      a.download = filenameMatch ? filenameMatch[1] : `invoices-export.csv`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);

      setExportMessage('✓ Export downloaded successfully');
      setTimeout(() => setExportMessage(''), 4000);
    } catch (err: any) {
      setExportMessage('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormat = EXPORT_FORMATS.find(f => f.id === exportFormat)!;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-xs text-gray-500">Financial insights and performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Row 1: Revenue Chart */}
        <section>
          <RevenueTrendsChart data={data.monthlyData} />
        </section>

        {/* Row 2: Two Columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-full">
            <TopClientsTable clients={data.topClients} />
          </div>
          <div className="h-full">
            <InvoiceStatusChart data={data.statusDistribution} />
          </div>
        </section>

        {/* Row 3: Export for Accounting Software */}
        <section>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Export for Accounting Software</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Download your invoices in the format your accounting software needs
                </p>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

                {/* Format selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Export Format
                  </label>
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setShowFormatDropdown(v => !v)}
                      className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>{selectedFormat.icon}</span>
                        <span className="font-medium">{selectedFormat.label}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFormatDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFormatDropdown && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {EXPORT_FORMATS.map(fmt => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => { setExportFormat(fmt.id); setShowFormatDropdown(false); }}
                            className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 ${exportFormat === fmt.id ? 'bg-indigo-50' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{fmt.icon}</span>
                              <div>
                                <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  {fmt.label}
                                  {exportFormat === fmt.id && (
                                    <span className="text-xs text-indigo-600 font-medium">✓ Selected</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{fmt.hint}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{selectedFormat.description}</p>
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Invoice Status
                  </label>
                  <select
                    value={exportStatus}
                    onChange={e => setExportStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Date range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Date Range
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={e => setExportStartDate(e.target.value)}
                      className="flex-1 min-w-0 px-2.5 py-2.5 border border-gray-200 rounded-lg bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
                    />
                    <span className="text-gray-400 text-xs shrink-0">→</span>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={e => setExportEndDate(e.target.value)}
                      className="flex-1 min-w-0 px-2.5 py-2.5 border border-gray-200 rounded-lg bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Export button */}
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Exporting…
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download CSV
                      </>
                    )}
                  </button>
                  {exportMessage && (
                    <p className={`text-xs mt-2 text-center font-medium ${exportMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                      {exportMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Format hints */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3">How to import into your accounting software:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      app: 'QuickBooks Online',
                      steps: 'Go to Sales → Invoices → Import → Upload CSV',
                      color: 'bg-green-50 border-green-100 text-green-800',
                    },
                    {
                      app: 'Xero',
                      steps: 'Go to Accounts → Sales → Import → Choose CSV file',
                      color: 'bg-blue-50 border-blue-100 text-blue-800',
                    },
                    {
                      app: 'Sage',
                      steps: 'Go to Sales → Import Data → Invoices → Upload CSV',
                      color: 'bg-purple-50 border-purple-100 text-purple-800',
                    },
                  ].map(hint => (
                    <div key={hint.app} className={`rounded-lg border px-4 py-3 ${hint.color}`}>
                      <p className="text-xs font-bold mb-1">{hint.app}</p>
                      <p className="text-xs opacity-80">{hint.steps}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
