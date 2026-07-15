'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import Script from 'next/script';
import { isPremiumUser } from '@/lib/payments';

interface AdSenseProps {
  adSlot?: string;
  adClient?: string;
}

export default function AdSense({ 
  adSlot = 'YOUR_AD_SLOT', 
  adClient = 'ca-pub-YOUR_PUBLISHER_ID' 
}: AdSenseProps) {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(isPremiumUser());
  }, []);

  useEffect(() => {
    // Initialize AdSense after script loads
    if (!isPremium && typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [isPremium]);

  // Don't show ads for premium users
  if (isPremium) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}
