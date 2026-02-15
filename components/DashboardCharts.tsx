'use client';

import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Invoice, currencySymbols, Currency } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface DashboardChartsProps {
    invoices: Invoice[];
    currency: string;
}

export default function DashboardCharts({ invoices, currency }: DashboardChartsProps) {
    // Process Data for Revenue Chart (Last 6 Months)
    const processRevenueData = () => {
        const today = new Date();
        const sixMonthsAgo = subMonths(today, 5);

        // Create array of months
        const months = eachMonthOfInterval({
            start: startOfMonth(sixMonthsAgo),
            end: endOfMonth(today)
        });

        return months.map(month => {
            const monthLabel = format(month, 'MMM');
            const monthInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.invoiceDate);
                return invDate.getMonth() === month.getMonth() &&
                    invDate.getFullYear() === month.getFullYear() &&
                    inv.paymentStatus !== 'cancelled';
            });

            const total = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
            return { name: monthLabel, total };
        });
    };

    // Process Data for Status Chart
    const processStatusData = () => {
        const statusCounts = invoices.reduce((acc, inv) => {
            if (inv.paymentStatus === 'cancelled') return acc;
            const status = inv.paymentStatus || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { name: 'Paid', value: statusCounts['paid'] || 0, color: '#10B981' }, // Green-500
            { name: 'Pending', value: statusCounts['pending'] || 0, color: '#FBBF24' }, // Amber-400
            { name: 'Overdue', value: statusCounts['overdue'] || 0, color: '#EF4444' }, // Red-500
            { name: 'Draft', value: statusCounts['draft'] || 0, color: '#9CA3AF' }, // Gray-400
        ].filter(item => item.value > 0);
    };

    const revenueData = processRevenueData();
    const statusData = processStatusData();

    if (invoices.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                    Revenue Overview
                    <select className="text-sm border-gray-200 rounded-lg text-gray-500 font-normal">
                        <option>Last 6 Months</option>
                    </select>
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `${currencySymbols[currency as Currency] || currencySymbols['USD']}${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${currencySymbols[currency as Currency] || currencySymbols['USD']} ${formatCurrency(Number(value), currency)}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Invoice Status Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Invoice Status</h3>
                <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value, entry: any) => <span className="text-sm text-gray-600 ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                        <span className="text-3xl font-bold text-gray-900">{invoices.filter(i => i.paymentStatus !== 'cancelled').length}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
