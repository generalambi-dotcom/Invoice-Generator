'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, CloudSun } from 'lucide-react';

interface DashboardGreetingProps {
    userName?: string;
    totalStats?: {
        paid: number;
        unpaid: number;
    };
}

export default function DashboardGreeting({ userName, totalStats }: DashboardGreetingProps) {
    const [greeting, setGreeting] = useState('');
    const [icon, setIcon] = useState<React.ReactNode>(null);

    useEffect(() => {
        const hour = new Date().getHours();

        if (hour < 12) {
            setGreeting('Good Morning');
            setIcon(<Sun className="w-5 h-5 text-yellow-300" />);
        } else if (hour < 18) {
            setGreeting('Good Afternoon');
            setIcon(<CloudSun className="w-5 h-5 text-orange-300" />);
        } else {
            setGreeting('Good Evening');
            setIcon(<Moon className="w-5 h-5 text-blue-200" />);
        }
    }, []);

    const unpaid = totalStats?.unpaid || 0;

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-600 rounded-2xl px-5 py-3.5 mb-6 text-white shadow-md">
            <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0">{icon}</span>
                    <div className="min-w-0">
                        <h1 className="text-base md:text-lg font-bold tracking-tight leading-tight truncate">
                            {greeting}, {userName?.split(' ')[0] || 'There'}!
                        </h1>
                        <p className="text-emerald-50/90 text-xs leading-tight">
                            {unpaid > 0
                                ? <><span className="font-semibold text-white">{unpaid}</span> unpaid invoice{unpaid !== 1 ? 's' : ''} pending</>
                                : 'You\'re all caught up — no unpaid invoices'}
                        </p>
                    </div>
                </div>

                {/* Compact paid-count chip */}
                <div className="flex-shrink-0 text-center px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10">
                    <span className="block text-lg font-bold leading-none">{totalStats?.paid || 0}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70">Paid</span>
                </div>
            </div>
        </div>
    );
}
