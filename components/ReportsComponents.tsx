'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Area
} from 'recharts';
import { formatCurrency } from '@/lib/calculations';

// --- Types ---
interface MonthlyData {
    month: string;
    revenue: number;
    paid: number;
}

interface ClientData {
    name: string;
    invoiceCount: number;
    totalBilled: number;
}

interface StatusData {
    status: string;
    count: number;
}

// --- Components ---

export const RevenueTrendsChart = ({ data }: { data: MonthlyData[] }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Performance</h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`} // Assuming USD default, can accept currency prop
                        />
                        <Tooltip
                            cursor={{ fill: '#F9FAFB' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [formatCurrency(Number(value), 'USD'), 'Amount']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                        <Bar
                            dataKey="revenue"
                            name="Total Billed"
                            fill="#4F46E5"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                        <Bar
                            dataKey="paid"
                            name="Collected"
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const InvoiceStatusChart = ({ data }: { data: StatusData[] }) => {
    // Map status to colors
    const COLORS: Record<string, string> = {
        paid: '#10B981',    // Emerald
        pending: '#F59E0B', // Amber
        overdue: '#EF4444', // Red
        draft: '#9CA3AF',   // Gray
        cancelled: '#6B7280'
    };

    const processData = data.map(item => ({
        ...item,
        color: COLORS[item.status.toLowerCase()] || '#8884d8'
    }));

    const total = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Invoice Status</h3>
            <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={processData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="status"
                        >
                            {processData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="capitalize text-gray-600 ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-bold text-gray-900">{total}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                </div>
            </div>
        </div>
    );
};

export const TopClientsTable = ({ clients }: { clients: ClientData[] }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Clients</h3>
            <div className="overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pl-2">Client</th>
                            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Invoices</th>
                            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-2">Total Billed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {clients.map((client, i) => (
                            <tr key={i} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-4 pl-2">
                                    <div className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                        {client.name}
                                    </div>
                                </td>
                                <td className="py-4 text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {client.invoiceCount}
                                    </span>
                                </td>
                                <td className="py-4 pr-2 text-right">
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatCurrency(client.totalBilled, 'USD')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {clients.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">No client data available</div>
                )}
            </div>
        </div>
    );
};
