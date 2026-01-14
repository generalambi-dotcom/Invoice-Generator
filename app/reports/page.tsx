
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/calculations';

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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading reports...</div>;
  }

  if (!data) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Back</Link>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Row 1: Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Revenue (Last 6 Months)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value), 'USD')} />
                <Legend />
                <Bar dataKey="revenue" fill="#4F46E5" name="Total Billed" />
                <Bar dataKey="paid" fill="#10B981" name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Clients */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Top 5 Clients</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Billed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.topClients.map((client: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{client.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">{client.invoiceCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                        {formatCurrency(client.totalBilled, 'USD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Invoice Status</h2>
            <div className="h-64 w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={(props: any) => `${props.status} (${props.count})`}
                  >
                    {data.statusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#10B981', '#EF4444', '#F59E0B', '#6B7280'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
