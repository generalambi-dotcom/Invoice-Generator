'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Mail, Phone, MapPin,
    MoreVertical, FileText, User, Users, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    _count?: {
        invoices: number;
    };
}

export default function ContactsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        notes: ''
    });

    useEffect(() => {
        fetchClients();
    }, [search]);

    // Debounce search effect could be added here, but for now simple dependency is okay for small datasets

    const fetchClients = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const res = await fetch(`/api/clients?${params.toString()}`);
            const data = await res.json();

            if (data.clients) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setClients([data.client, ...clients]);
                setIsModalOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    country: '',
                    notes: ''
                });
                toast.success('Contact created');
            } else {
                toast.error(data.error || 'Failed to create contact');
            }
        } catch (error) {
            toast.error('Error creating contact');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && !clients.length) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        👥 Contacts
                    </h1>
                    <p className="text-gray-500 text-sm">Manage your clients and view their history</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Contact
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search contacts by name, email, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Contacts Grid */}
            {clients.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No contacts found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                        {search ? 'Try adjusting your search terms.' : 'Get started by adding your first client.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map(client => (
                        <Link
                            href={`/dashboard/contacts/${client.id}`}
                            key={client.id}
                            className="block group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {client._count?.invoices || 0} Invoices
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                                {client.name}
                            </h3>

                            <div className="space-y-2 text-sm text-gray-500 mt-4">
                                {client.email && (
                                    <div className="flex items-center gap-2 truncate">
                                        <Mail className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-2 truncate">
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{client.phone}</span>
                                    </div>
                                )}
                                {(client.city || client.country) && (
                                    <div className="flex items-center gap-2 truncate">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">
                                            {[client.city, client.country].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}
                                {!client.email && !client.phone && !client.city && (
                                    <div className="italic text-gray-400 text-xs py-1">No contact info provided</div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                <span className="text-sm font-medium text-blue-600 group-hover:underline">View Details →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Add Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Add New Contact</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateClient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Company / Client Name *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Acme Corp"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="+234..."
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Street Address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Lagos"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Country</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Nigeria"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
