'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => {
        return pathname === path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50';
    };

    const [user, setUser] = useState<any>(null);
    const [isPremium, setIsPremium] = useState(false);

    React.useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') return;

        // Dynamically import to avoid circular dependencies if any, 
        // though we could likely just use the storage directly or move logic
        const loadUser = async () => {
            // We can check localStorage directly for speed as we do in other components
            try {
                const savedUser = localStorage.getItem('invoice-generator-current-user');
                if (savedUser) {
                    const parsed = JSON.parse(savedUser);
                    setUser(parsed);
                    const premium = parsed.isAdmin === true ||
                        (parsed.subscription?.plan === 'premium' &&
                            parsed.subscription?.status === 'active');
                    setIsPremium(premium);
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadUser();
    }, []);

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Create Invoice',
            path: '/',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            name: 'My Reports',
            path: '/reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
            )
        },
        {
            name: 'Profile',
            path: '/profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    const premiumItems = [
        {
            name: 'Payment Methods',
            path: '/settings/payment-methods',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
        {
            name: 'WhatsApp Settings',
            path: '/settings/whatsapp',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    {/* Simple placeholder icon, usually whatsapp is custom svg */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
            )
        },
        {
            name: 'Public Link',
            path: '/settings/public-link',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            )
        }
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-theme-primary">InvoiceNaija</span>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {/* Standard Items */}
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${isActive(item.path)}`}
                        >
                            <div className="group-hover:text-blue-600 transition-colors">
                                {item.icon}
                            </div>
                            <span className="ml-3">{item.name}</span>
                        </Link>
                    ))}

                    {/* Premium Features Section */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Premium</p>
                        {premiumItems.map((item) => {
                            if (isPremium) {
                                // Active Link for Premium Users
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${isActive(item.path)}`}
                                    >
                                        <div className="group-hover:text-blue-600 transition-colors text-purple-600">
                                            {item.icon}
                                        </div>
                                        <span className="ml-3">{item.name}</span>
                                    </Link>
                                );
                            } else {
                                // Locked Link for Free Users
                                return (
                                    <div
                                        key={item.path}
                                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-50 group cursor-pointer relative"
                                        onClick={() => {
                                            setIsOpen(false);
                                            window.location.href = '/upgrade';
                                        }}
                                        title="Upgrade to access"
                                    >
                                        <div className="text-gray-400">
                                            {item.icon}
                                        </div>
                                        <div className="ml-3 flex-1 flex items-center justify-between">
                                            <span>{item.name}</span>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {/* Upgrade Button - Only for Free Users */}
                    {!isPremium && (
                        <div className="pt-4 mt-auto">
                            <Link
                                href="/upgrade"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-sm transition-all"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Upgrade Plan
                            </Link>
                        </div>
                    )}
                </nav>

                {/* User Profile Mini - Bottom */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50">
                    <Link href="/profile" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            U
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">My Account</p>
                            <p className="text-xs text-gray-500">View Profile</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
