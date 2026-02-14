
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { RevenueTrendsChart, InvoiceStatusChart, TopClientsTable } from '@/components/ReportsComponents';

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/signin');
      return;
    }
    fetchReports();
  }, [router]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          {/* Top Clients */}
          <div className="h-full">
            <TopClientsTable clients={data.topClients} />
          </div>

          {/* Status Distribution */}
          <div className="h-full">
            <InvoiceStatusChart data={data.statusDistribution} />
          </div>
        </section>

      </div>
    </div>
  );
}
