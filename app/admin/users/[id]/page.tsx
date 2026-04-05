'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Loader2, FileText, CreditCard, Users,
    FileSignature, RotateCcw, LayoutTemplate, Mail,
    MessageSquare, CheckSquare, Clock, FileKey, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function UserActivityPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!userId) return;

        async function fetchActivity() {
            try {
                setLoading(true);
                const res = await fetch(`/api/admin/users/${userId}/activity`);

                if (res.ok) {
                    const activityData = await res.json();
                    setData(activityData);
                } else {
                    toast.error('Failed to load user activity');
                    router.push('/admin/users');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchActivity();
    }, [userId, router]);

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-[50vh]">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-gray-500">Loading user activity data...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.user) {
        return (
            <div className="p-6 max-w-7xl mx-auto text-center">
                <p className="text-red-500">User not found or data could not be loaded.</p>
                <button
                    onClick={() => router.push('/admin/users')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Back to Users
                </button>
            </div>
        );
    }

    const { user, counts, recentInvoices, recentClients, recentEmails = [] } = data;

    const statsCards = [
        { label: 'Invoices', value: counts.invoices, icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { label: 'Payments', value: counts.payments, icon: CreditCard, color: 'bg-green-100 text-green-600' },
        { label: 'Clients', value: counts.clients, icon: Users, color: 'bg-purple-100 text-purple-600' },
        { label: 'Estimates', value: counts.estimates, icon: FileSignature, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Credit Notes', value: counts.creditNotes, icon: FileKey, color: 'bg-pink-100 text-pink-600' },
        { label: 'Recurring', value: counts.recurringInvoices, icon: RotateCcw, color: 'bg-teal-100 text-teal-600' },
        { label: 'Templates', value: counts.invoiceTemplates, icon: LayoutTemplate, color: 'bg-orange-100 text-orange-600' },
        { label: 'Emails Sent', value: counts.sentEmails, icon: Mail, color: 'bg-indigo-100 text-indigo-600' },
        { label: 'Blog Posts', value: counts.posts, icon: FileText, color: 'bg-emerald-100 text-emerald-600' },
        { label: 'Notes', value: counts.notes, icon: MessageSquare, color: 'bg-cyan-100 text-cyan-600' },
        { label: 'Tasks', value: counts.tasks, icon: CheckSquare, color: 'bg-rose-100 text-rose-600' },
        { label: 'Time Logs', value: counts.timeLogs, icon: Clock, color: 'bg-fuchsia-100 text-fuchsia-600' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/users')}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {user.name}'s Activity
                    </h1>
                    <p className="text-gray-500">Overview of platform usage and statistics</p>
                </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Joined {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user.subscriptionPlan === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                            Plan: {user.subscriptionPlan === 'premium' ? 'Premium' : 'Free'}
                        </span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            Status: {user.subscriptionStatus || 'Active'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Platform Health & Gravity Widget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Pulse Score</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{user.businessPulseScore || 0}<span className="text-sm text-gray-400 font-normal">/100</span></span>
                        {(user.businessPulseScore || 0) > 50 ? (
                           <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">High</span>
                        ) : (
                           <span className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded">Low</span>
                        )}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Directory Status</h3>
                    <div className="text-lg font-bold">
                        {user.directoryOptIn ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm bg-indigo-50 text-indigo-700">
                                <Shield className="w-4 h-4" /> Live
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700">
                                <Shield className="w-4 h-4" /> Unlisted
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Last Active</h3>
                    <div className="text-lg font-bold text-gray-900">
                        {user.lastActiveAt ? format(new Date(user.lastActiveAt), 'MMM d, yyyy') : 'Never'}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Profile Completeness</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full" style={{ width: `${user.profileCompleteness || 0}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{user.profileCompleteness || 0}%</span>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Total Records</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
                                <div className={`p-3 rounded-full ${stat.color} mb-3`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentInvoices.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No invoices found</div>
                        ) : (
                            recentInvoices.map((invoice: any) => (
                                <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div>
                                        <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                                        <p className="text-sm text-gray-500">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{invoice.currency} {invoice.total.toLocaleString()}</p>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                invoice.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {invoice.paymentStatus.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Clients */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Recent Clients</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentClients.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No clients found</div>
                        ) : (
                            recentClients.map((client: any) => (
                                <div key={client.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{client.name}</p>
                                            <p className="text-sm text-gray-500">{client.email || 'No email'}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 text-right">
                                        Added {format(new Date(client.createdAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Email Dispatch Audit Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Emails Sent</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 text-sm text-gray-500">
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Recipient</th>
                                <th className="px-6 py-3 font-semibold">Subject</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentEmails.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No emails have been sent by this user</td>
                                </tr>
                            ) : (
                                recentEmails.map((email: any) => (
                                    <tr key={email.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(email.sentAt), 'MMM d, HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {email.to}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[250px]">
                                            <div className="truncate">{email.subject}</div>
                                            {email.status === 'failed' && email.errorMessage && (
                                                <div className="text-xs text-red-500 font-medium mt-1.5 whitespace-normal break-words bg-red-50 p-2 rounded">
                                                    Error: {email.errorMessage}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                email.status === 'sent' 
                                                ? (email.openedAt ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                                {email.status === 'sent' && email.openedAt ? 'OPENED' : email.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
