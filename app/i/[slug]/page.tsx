'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import PublicInvoiceForm from '@/components/PublicInvoiceForm';

function PublicInvoicePageContent() {
  const params = useParams();
  const slug = params.slug as string;

  return <PublicInvoiceForm slug={slug} />;
}

export default function PublicInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <PublicInvoicePageContent />
    </Suspense>
  );
}

