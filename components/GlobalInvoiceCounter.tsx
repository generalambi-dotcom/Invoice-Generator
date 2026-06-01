'use client';

import { useEffect, useState } from 'react';
import AnimatedCounter from './AnimatedCounter';

/**
 * Live count of invoices generated across the platform.
 * - Default: styled inline "pill" for use on light backgrounds.
 * - `plain`: renders just the number, inheriting the parent's text colour
 *   (use inside coloured stat blocks, e.g. the dark TrustBar).
 */
export default function GlobalInvoiceCounter({ plain = false }: { plain?: boolean }) {
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

    if (plain) {
        if (total === null) {
            return <span className="animate-pulse">200,512+</span>;
        }
        return <AnimatedCounter end={total} duration={2500} suffix="+" />;
    }

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
