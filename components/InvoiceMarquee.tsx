'use client';

import React from 'react';

// Force HMR update
const InvoiceMarquee = () => {
    return (
        <div className="w-full overflow-hidden py-10 relative">
            {/* Gradient Masks for Fade Edge Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 z-[2]"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 z-[2]"></div>

            <div className="flex animate-scroll-left gap-8 w-max">
                {/* We need enough duplicates for seamless infinite scroll on large screens */}
                {[1, 2, 3, 4].map((group) => (
                    <div key={group} className="flex gap-8 shrink-0">
                        {/* Part 1: Top (Header) */}
                        <div className="w-[350px] h-[300px] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 bg-white relative transform transition-transform hover:scale-[1.02] duration-300">
                            <div
                                className="absolute inset-0 bg-cover bg-no-repeat bg-top"
                                style={{ backgroundImage: "url('/images/invoice-hero-real.png')" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <span className="text-white font-medium">Professional Header</span>
                            </div>
                        </div>

                        {/* Part 2: Middle (Line Items) */}
                        <div className="w-[350px] h-[300px] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 bg-white relative transform transition-transform hover:scale-[1.02] duration-300">
                            <div
                                className="absolute inset-0 bg-cover bg-no-repeat bg-center"
                                style={{ backgroundImage: "url('/images/invoice-hero-real.png')" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <span className="text-white font-medium">Detailed Line Items</span>
                            </div>
                        </div>

                        {/* Part 3: Bottom (Totals) */}
                        <div className="w-[350px] h-[300px] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 bg-white relative transform transition-transform hover:scale-[1.02] duration-300">
                            <div
                                className="absolute inset-0 bg-cover bg-no-repeat bg-bottom"
                                style={{ backgroundImage: "url('/images/invoice-hero-real.png')" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <span className="text-white font-medium">Smart Totals</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvoiceMarquee;
