'use client';

import React, { useState, useEffect } from 'react';
import {
    Play, Square, Plus, Trash2, FileText, Clock,
    Calendar, CheckCircle, Loader2, DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TimeLog {
    id: string;
    description: string;
    startTime: string;
    endTime: string | null;
    duration: number; // minutes
    rate: number;
    status: 'pending' | 'billed';
    client?: { name: string };
    clientId?: string;
}

interface Client {
    id: string;
    name: string;
}

export default function TimeTrackerPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    // Timer State
    const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
    const [elapsed, setElapsed] = useState(0); // seconds
    const [description, setDescription] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [rate, setRate] = useState(0);

    // Invoice Generation State
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => {
            if (activeLog) {
                setElapsed(Math.floor((Date.now() - new Date(activeLog.startTime).getTime()) / 1000));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [activeLog]);

    const fetchData = async () => {
        try {
            const [logsRes, clientsRes] = await Promise.all([
                fetch('/api/time-logs?status=pending'), // Fetch only pending logs initially
                fetch('/api/clients')
            ]);

            const logsData = await logsRes.json();
            const clientsData = await clientsRes.json();

            if (Array.isArray(logsData)) {
                setLogs(logsData);
                // Check if there is an active timer (endTime is null)
                const active = logsData.find((log: TimeLog) => !log.endTime);
                if (active) {
                    setActiveLog(active);
                    setDescription(active.description);
                    setSelectedClient(active.clientId || '');
                    setRate(active.rate);
                }
            }

            if (Array.isArray(clientsData)) {
                setClients(clientsData);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = async () => {
        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        try {
            const res = await fetch('/api/time-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    clientId: selectedClient || null,
                    rate: Number(rate),
                    startTime: new Date().toISOString(),
                    // endTime null implies running
                }),
            });

            if (res.ok) {
                const newLog = await res.json();
                setLogs([newLog, ...logs]);
                setActiveLog(newLog);
                toast.success('Timer started');
            }
        } catch (error) {
            toast.error('Failed to start timer');
        }
    };

    const stopTimer = async () => {
        if (!activeLog) return;

        try {
            const endTime = new Date();
            // Calculate duration in minutes, ensure at least 1 minute if running
            let duration = Math.floor((endTime.getTime() - new Date(activeLog.startTime).getTime()) / 1000 / 60);
            if (duration < 1) duration = 1;

            const res = await fetch('/api/time-logs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: activeLog.id,
                    endTime: endTime.toISOString(),
                    duration
                }),
            });

            if (res.ok) {
                const updatedLog = await res.json();
                setLogs(logs.map(l => l.id === activeLog.id ? updatedLog : l));
                setActiveLog(null);
                setElapsed(0);
                setDescription('');
                setSelectedClient('');
                setRate(0);
                toast.success('Timer stopped');
            }
        } catch (error) {
            toast.error('Failed to stop timer');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this log?')) return;
        try {
            await fetch(`/api/time-logs?id=${id}`, { method: 'DELETE' });
            setLogs(logs.filter(l => l.id !== id));
            toast.success('Log deleted');
        } catch (error) {
            toast.error('Failed to delete log');
        }
    };

    const generateInvoice = async () => {
        // Basic implementation: Group by client and generate
        // For MVP, if multiple clients, we warn user. Ideally select checkboxes.

        // Group logs by client
        const logsByClient: Record<string, TimeLog[]> = {};
        logs.forEach(log => {
            if (log.status === 'pending' && log.clientId && log.endTime) {
                if (!logsByClient[log.clientId]) logsByClient[log.clientId] = [];
                logsByClient[log.clientId].push(log);
            }
        });

        const clientIds = Object.keys(logsByClient);
        if (clientIds.length === 0) {
            toast.error('No billable completed logs with clients found');
            return;
        }

        // For now, if multiple clients, just take the first one (simplification)
        const targetClientId = clientIds[0];
        const targetLogs = logsByClient[targetClientId];

        if (!confirm(`Generate invoice for ${targetLogs.length} items for client (ID: ${targetClientId.substring(0, 6)}...)?`)) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/invoices/generate-from-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: targetClientId,
                    timeLogIds: targetLogs.map(l => l.id)
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Invoice generated!');
                router.push(`/invoices/${data.invoiceId}/edit`); // Redirect to edit mode
            } else {
                toast.error(data.error || 'Failed');
            }
        } catch (error) {
            toast.error('Error generating invoice');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        ⏱️ Time Tracker
                    </h1>
                    <p className="text-gray-500 text-sm">Log your hours and instantly bill clients</p>
                </div>
                <button
                    onClick={generateInvoice}
                    disabled={isGenerating || logs.filter(l => l.status === 'pending' && l.clientId && l.endTime).length === 0}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors"
                >
                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    Generate Invoice
                </button>
            </div>

            {/* Timer Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="What are you working on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!!activeLog}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 outline-none transition-all"
                    />
                </div>

                <div className="flex w-full lg:w-auto gap-4">
                    <div className="relative w-full lg:w-48">
                        <select
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            disabled={!!activeLog}
                            className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 bg-white appearance-none outline-none transition-all"
                        >
                            <option value="">Select Client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-32">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-medium">$</span>
                        </div>
                        <input
                            type="number"
                            placeholder="Rate"
                            value={rate || ''}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            disabled={!!activeLog}
                            className="w-full pl-7 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 outline-none transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-xs">/hr</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
                    <div className="text-3xl font-mono font-medium w-36 text-center text-gray-800 tracking-wider">
                        {formatTime(elapsed)}
                    </div>

                    <button
                        onClick={activeLog ? stopTimer : startTimer}
                        className={`px-8 py-3 rounded-lg font-medium text-white flex items-center gap-2 min-w-[140px] justify-center transition-all shadow-md active:scale-95 ${activeLog ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        {activeLog ? (
                            <>
                                <Square className="w-4 h-4 fill-current" /> Stop
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" /> Start
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Recent Activity</h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                        Showing pending logs
                    </span>
                </div>

                <div className="divide-y divide-gray-100">
                    {logs.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Clock className="w-8 h-8 opacity-40" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-600">No time logs yet</h3>
                            <p className="max-w-xs mx-auto mt-1">Start the timer above or manually add an entry to begin tracking your billable hours.</p>
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{log.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                        {log.client ? (
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium border border-indigo-100">
                                                {log.client.name}
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">No Client</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(log.startTime).toLocaleDateString()}
                                        </span>
                                        {log.rate > 0 && <span className="font-mono text-gray-600">${log.rate}/hr</span>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                                    <div className="text-right">
                                        <div className="font-mono font-medium text-lg text-gray-800">
                                            {log.endTime ? (
                                                log.duration >= 60 ? `${(log.duration / 60).toFixed(2)} hrs` : `${log.duration} mins`
                                            ) : (
                                                <span className="text-green-600 flex items-center gap-2 bg-green-50 px-2 py-0.5 rounded animate-pulse">
                                                    <Clock className="w-3 h-3" /> Running
                                                </span>
                                            )}
                                        </div>
                                        {log.rate > 0 && log.endTime && (
                                            <div className="text-sm text-green-600 font-medium">
                                                ${((log.duration / 60) * log.rate).toFixed(2)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(log.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete Log"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
