'use client';

import { useEffect, useState } from 'react';
import AnimatedCounter from './AnimatedCounter';

export default function GlobalInvoiceCounter() {
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
        const fetchTotal = async () => {
            try {
                const res = await fetch('/api/public/stats');
                if (res.ok) {
                    const data = await res.json();
                    setTotal(data.total);
                }
            } catch (error) {
                console.error('Error fetching global stats', error);
            }
        };

        fetchTotal();
    }, []);

    if (total === null) {
        return (
            <span className="font-bold text-gray-900 border border-gray-100 bg-gray-50 px-2 py-0.5 rounded-md animate-pulse">
                200,512+
            </span>
        );
    }

    return (
        <span className="font-bold text-gray-900 border border-gray-100 bg-gray-50 px-2 py-0.5 rounded-md shadow-sm">
            <AnimatedCounter end={total} duration={2500} suffix="+" />
        </span>
    );
}
