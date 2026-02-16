'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
    children: React.ReactNode;
    heading: string;
    subheading: string;
    image?: string;
}

export default function AuthLayout({ children, heading, subheading, image = "/images/auth-hero.jpg" }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex bg-gray-50">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24 xl:px-32 relative bg-white">
                <div className="w-full max-w-md mx-auto">
                    {/* Logo */}
                    <div className="mb-10">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span>InvoiceGenerator</span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
                        <p className="mt-2 text-sm text-gray-500">{subheading}</p>
                    </div>

                    {children}
                </div>
            </div>

            {/* Right Side - Hero / Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f172a] overflow-hidden items-center justify-center p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] opacity-90"></div>
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}>
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 w-full max-w-lg">
                    {/* Dashboard Preview Image/Mockup */}
                    <div className="relative">
                        {/* Floating elements/icons for effect */}
                        <div className="absolute -top-12 -left-12 w-16 h-16 bg-[#1f2937] rounded-2xl flex items-center justify-center border border-gray-700 shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>

                        <div className="absolute -bottom-8 -right-8 w-64 bg-white rounded-xl shadow-2xl p-4 border border-gray-100 z-20 transform rotate-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-500">Weekly sales</span>
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">714k</span>
                                <span className="text-xs font-medium text-green-500 bg-green-50 px-1.5 py-0.5 rounded">+2.4%</span>
                            </div>
                        </div>

                        {/* Main dashboard image placeholder - mimicking the dark screenshot */}
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-[#111827] aspect-[4/3] relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-black/40 pointer-events-none z-10"></div>
                            {/* Abstract representation of dashboard content */}
                            <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                    <div className="h-2 w-24 bg-gray-700 rounded"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="h-24 rounded-lg bg-gray-800/50 border border-gray-700/50"></div>
                                    <div className="h-24 rounded-lg bg-gray-800/50 border border-gray-700/50"></div>
                                </div>
                                <div className="flex-1 rounded-lg bg-gray-800/30 border border-gray-700/30"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
