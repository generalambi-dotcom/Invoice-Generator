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
            setIcon(<Sun className="w-8 h-8 text-yellow-300 animate-pulse" />);
        } else if (hour < 18) {
            setGreeting('Good Afternoon');
            setIcon(<CloudSun className="w-8 h-8 text-orange-300" />);
        } else {
            setGreeting('Good Evening');
            setIcon(<Moon className="w-8 h-8 text-blue-200" />);
        }
    }, []);

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-600 rounded-3xl p-8 mb-8 text-white shadow-xl">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-white opacity-5"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {icon}
                        <h1 className="text-3xl font-bold tracking-tight">
                            {greeting}, {userName?.split(' ')[0] || 'There'}!
                        </h1>
                    </div>
                    <p className="text-emerald-50 text-lg opacity-90 max-w-xl">
                        Here's what's happening with your store today. You have <span className="font-bold text-white">{totalStats?.unpaid || 0} unpaid</span> invoices pending.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => document.getElementById('new-invoice-btn')?.click()}
                            className="bg-white text-emerald-900 px-6 py-2.5 rounded-full font-semibold shadow-emerald-900/20 shadow-lg hover:bg-emerald-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            Create Invoice →
                        </button>
                    </div>
                </div>

                {/* Illustration/Graphic area - simplified for CSS-only solution */}
                <div className="hidden md:block">
                    {/* You could add an SVG illustration here or keep it clean */}
                    <div className="w-48 h-32 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 p-4 flex flex-col justify-center items-center">
                        <span className="text-3xl font-bold">{totalStats?.paid || 0}</span>
                        <span className="text-xs uppercase tracking-wider opacity-70 mt-1">Paid Invoices</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
