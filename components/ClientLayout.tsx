'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check auth status on mount
        const user = getCurrentUser();
        setIsLoggedIn(!!user);
        setIsLoading(false);
    }, []);

    // Determine if we should show the sidebar
    // We hide it if not logged in
    const showSidebar = isLoggedIn;

    // We could also allow forcing sidebar hidden on specific public pages if needed
    // const isPublicPage = ['/login', '/register', '/'].includes(pathname);
    // but for now, rely strictly on auth status as requested.

    return (
        <>
            {showSidebar ? <Sidebar /> : <Header />}

            <main
                className={`
          min-h-screen flex flex-col transition-all duration-300
          ${showSidebar ? 'lg:pl-64' : ''}
        `}
            >
                <div className={`
          flex-grow p-4 sm:p-6 lg:p-8 
          ${showSidebar ? 'mt-16 lg:mt-0' : ''}
        `}>
                    {children}
                </div>

                <div className="mt-auto">
                    <Footer />
                </div>
            </main>
        </>
    );
}
