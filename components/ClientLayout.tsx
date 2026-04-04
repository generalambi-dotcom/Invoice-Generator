'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';
import NewsletterPopup from '@/components/NewsletterPopup';
import PromoBanner from '@/components/PromoBanner';

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
    // We could also allow forcing sidebar hidden on specific public pages if needed
    const isAuthPage = ['/signin', '/signup'].includes(pathname);
    const isDirectoryPage = pathname?.startsWith('/businesses');
    
    // We hide it if not logged in, OR if we are forcing a full-bleed public directory view
    const showSidebar = isLoggedIn && !isDirectoryPage;

    const hideGlobalHeader = isAuthPage || isDirectoryPage;

    return (
        <>
            {showSidebar ? <Sidebar /> : (!hideGlobalHeader && (
                <div className="w-full">
                    <PromoBanner />
                    <div className="sticky top-0 z-50">
                        <Header />
                    </div>
                </div>
            ))}

            <main
                className={`
          min-h-screen flex flex-col transition-all duration-300
          ${showSidebar ? 'lg:pl-64' : ''}
        `}
            >
                <div className={`
          flex-grow p-4 sm:p-6 lg:p-8 
          ${showSidebar ? 'mt-16 lg:mt-0' : ''}
          ${(isAuthPage || isDirectoryPage) ? '!p-0' : ''}
        `}>
                    {children}
                </div>

                {!hideGlobalHeader && (
                    <div className="mt-auto">
                        <Footer />
                    </div>
                )}
            </main>
            {!isLoggedIn && !isAuthPage && <NewsletterPopup />}
            <Toaster position="top-right" />
        </>
    );
}
