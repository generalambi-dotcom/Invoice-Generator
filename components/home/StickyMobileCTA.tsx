'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StickyMobileCTA() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('sticky-cta-dismissed')) {
      setDismissed(true);
      return;
    }
    const handler = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', handler, { passive: true });
    handler(); // check immediately in case page loaded scrolled
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('sticky-cta-dismissed', '1');
  };

  if (!mounted || dismissed || !show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-teal-800 text-white flex items-center justify-between px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
      <Link
        href="/free-invoice-generator"
        className="font-semibold text-sm flex-1 text-center"
      >
        Create free invoice →
      </Link>
      <button
        onClick={handleDismiss}
        className="text-teal-300 hover:text-white text-xl ml-4 leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
