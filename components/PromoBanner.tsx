'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface PromoConfig {
    enabled: boolean;
    text: string;
    endDate: string;
    linkText: string;
    linkUrl: string;
    bgColor: string;
}

export default function PromoBanner() {
    const [config, setConfig] = useState<PromoConfig | null>(null);
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetch('/api/public/promo')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!config?.enabled || !config.endDate) return;

        const targetDate = new Date(config.endDate).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }

            setTimeLeft({
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((difference % (1000 * 60)) / 1000),
            });
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [config]);

    if (!isMounted || !config?.enabled) {
        return null;
    }

    return (
        <div 
            className="w-full relative py-6 px-4 text-center text-gray-900 border-b border-gray-200/50"
            style={{ backgroundColor: config.bgColor || '#52e85a' }}
        >
            <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
                {/* Countdown Timer */}
                {timeLeft && (
                    <div className="flex items-center gap-2 mb-4 bg-white/10 p-2 rounded-lg backdrop-blur-sm shadow-sm inline-flex">
                        <TimeUnit value={timeLeft.d} label="DAYS" />
                        <TimeUnit value={timeLeft.h} label="HOURS" />
                        <TimeUnit value={timeLeft.m} label="MINS" />
                        <TimeUnit value={timeLeft.s} label="SECS" />
                    </div>
                )}

                {/* Promo Text */}
                <h2 className="text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto mb-4 leading-relaxed">
                    {config.text}
                </h2>

                {/* CTA Button */}
                <Link 
                    href={config.linkUrl}
                    className="inline-block bg-black text-white px-8 py-3 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors"
                >
                    {config.linkText}
                </Link>
            </div>
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-md w-14 h-14 md:w-16 md:h-16 shadow-sm">
            <span className="text-xl md:text-2xl font-bold leading-none mb-1 text-gray-900">
                {value < 10 ? `0${value}` : value}
            </span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                {label}
            </span>
        </div>
    );
}
