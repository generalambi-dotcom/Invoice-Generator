'use client';

import React, { useState } from 'react';
import { Layout, Theme } from '@/types/invoice';
import ImageUpload from './ImageUpload';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { INDUSTRY_OPTIONS } from '@/lib/profile-completeness';
import { getRegionConfig } from '@/lib/regionalization';
import { trackEvent } from '@/lib/tracking';

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

const LAYOUTS: { id: Layout; name: string; description: string; svg: React.ReactNode }[] = [
  { 
    id: 'modern', 
    name: 'Modern Minimalist', 
    description: 'Clean, abundant whitespace. Left-aligned logo.',
    svg: (
      <svg viewBox="0 0 100 120" className="w-full h-full text-gray-200" fill="none">
        <rect x="0" y="0" width="100" height="120" fill="white" rx="4" />
        <rect x="8" y="10" width="15" height="15" fill="currentColor" rx="2" />
        <rect x="8" y="30" width="30" height="4" fill="currentColor" rx="2" />
        <rect x="70" y="10" width="22" height="6" fill="currentColor" rx="2" />
        <rect x="70" y="20" width="22" height="3" fill="currentColor" rx="1.5" />
        <rect x="8" y="45" width="84" height="2" fill="currentColor" />
        <rect x="8" y="55" width="40" height="4" fill="currentColor" rx="2" />
        <rect x="70" y="55" width="22" height="4" fill="currentColor" rx="2" />
        <rect x="8" y="65" width="84" height="1" fill="#f3f4f6" />
        <rect x="8" y="75" width="84" height="1" fill="#f3f4f6" />
        <rect x="70" y="95" width="22" height="6" fill="#10b981" rx="2" />
      </svg>
    )
  },
  { 
    id: 'bold', 
    name: 'Bold Business', 
    description: 'Solid colored header band. Exudes stability.',
    svg: (
      <svg viewBox="0 0 100 120" className="w-full h-full text-gray-200" fill="none">
        <rect x="0" y="0" width="100" height="120" fill="white" rx="4" />
        <rect x="0" y="0" width="100" height="25" fill="#1f2937" rx="0" />
        <rect x="8" y="6" width="12" height="12" fill="white" rx="2" opacity="0.8" />
        <rect x="65" y="10" width="25" height="5" fill="white" rx="2" opacity="0.8" />
        <rect x="8" y="35" width="30" height="4" fill="currentColor" rx="2" />
        <rect x="8" y="45" width="84" height="4" fill="#f3f4f6" rx="2" />
        <rect x="8" y="55" width="84" height="4" fill="#f3f4f6" rx="2" />
        <rect x="8" y="65" width="84" height="4" fill="#f3f4f6" rx="2" />
        <rect x="70" y="90" width="22" height="8" fill="#111827" rx="2" />
      </svg>
    )
  },
  { 
    id: 'classic', 
    name: 'Classic Corporate', 
    description: 'Highly traditional structure with boxed layouts.',
    svg: (
      <svg viewBox="0 0 100 120" className="w-full h-full text-gray-200" fill="none">
        <rect x="0" y="0" width="100" height="120" fill="white" rx="4" />
        <rect x="40" y="8" width="20" height="14" fill="currentColor" rx="2" />
        <rect x="8" y="30" width="40" height="20" fill="none" stroke="currentColor" strokeWidth="1" rx="2" />
        <rect x="52" y="30" width="40" height="20" fill="none" stroke="currentColor" strokeWidth="1" rx="2" />
        <rect x="12" y="34" width="15" height="3" fill="currentColor" rx="1.5" />
        <rect x="56" y="34" width="15" height="3" fill="currentColor" rx="1.5" />
        <rect x="8" y="60" width="84" height="6" fill="currentColor" />
        <rect x="8" y="70" width="84" height="1" fill="currentColor" opacity="0.5" />
        <rect x="8" y="80" width="84" height="1" fill="currentColor" opacity="0.5" />
        <rect x="70" y="95" width="22" height="6" fill="#374151" rx="1" />
      </svg>
    )
  },
  { 
    id: 'creative', 
    name: 'Creative Studio', 
    description: 'Asymmetrical design using colored blocks.',
    svg: (
      <svg viewBox="0 0 100 120" className="w-full h-full text-gray-200" fill="none">
        <rect x="0" y="0" width="100" height="120" fill="white" rx="4" />
        <rect x="0" y="0" width="25" height="120" fill="#f87171" opacity="0.1" />
        <circle cx="12" cy="15" r="5" fill="#f87171" />
        <rect x="30" y="10" width="30" height="4" fill="currentColor" rx="2" />
        <rect x="30" y="20" width="20" height="3" fill="currentColor" rx="1.5" />
        <rect x="30" y="40" width="60" height="15" fill="#fef2f2" rx="4" />
        <rect x="35" y="45" width="15" height="5" fill="#f87171" rx="2" />
        <rect x="30" y="65" width="60" height="2" fill="currentColor" opacity="0.2" />
        <rect x="30" y="75" width="60" height="2" fill="currentColor" opacity="0.2" />
        <rect x="70" y="90" width="20" height="10" fill="#f87171" rx="4" />
      </svg>
    )
  },
  { 
    id: 'startup', 
    name: 'Sleek Startup', 
    description: 'Dark mode accents. Pill-shaped backgrounds.',
    svg: (
      <svg viewBox="0 0 100 120" className="w-full h-full text-gray-200" fill="none">
        <rect x="0" y="0" width="100" height="120" fill="#0f172a" rx="4" />
        <circle cx="20" cy="20" r="8" fill="#3b82f6" />
        <rect x="65" y="15" width="25" height="10" fill="#1e293b" rx="5" />
        <rect x="12" y="40" width="76" height="25" fill="#1e293b" rx="6" />
        <rect x="18" y="45" width="20" height="4" fill="#cbd5e1" rx="2" />
        <rect x="18" y="55" width="15" height="4" fill="#94a3b8" rx="2" />
        <rect x="12" y="75" width="76" height="8" fill="#1e293b" rx="4" />
        <rect x="12" y="88" width="76" height="8" fill="#1e293b" rx="4" />
        <rect x="65" y="102" width="25" height="10" fill="#3b82f6" rx="5" />
      </svg>
    )
  },
  { 
    id: 'elegant', 
    name: 'Elegant Edge', 
    description: 'Sophisticated layout featuring subtle elegance.',
    svg: (
      <svg viewBox="0 0 100 120" className="w-full h-full text-gray-200" fill="none">
        <rect x="0" y="0" width="100" height="120" fill="#fafaf9" rx="4" />
        <rect x="4" y="4" width="92" height="112" fill="none" stroke="#e7e5e4" strokeWidth="1" />
        <rect x="40" y="15" width="20" height="20" fill="none" stroke="#d6d3d1" strokeWidth="1" transform="rotate(45 50 25)" />
        <rect x="15" y="45" width="30" height="3" fill="#a8a29e" rx="1.5" />
        <rect x="15" y="55" width="70" height="1" fill="#e7e5e4" />
        <rect x="15" y="65" width="40" height="2" fill="#d6d3d1" rx="1" />
        <rect x="70" y="65" width="15" height="2" fill="#d6d3d1" rx="1" />
        <rect x="15" y="75" width="70" height="1" fill="#e7e5e4" />
        <path d="M70 95 L85 95" stroke="#78716c" strokeWidth="4" />
      </svg>
    )
  },
];

export default function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [layout, setLayout] = useState<Layout>('modern');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [industry, setIndustry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const regionConfig = getRegionConfig('USD'); // Default neutral fallback

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      toast.error('Company Name is required to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout,
          companyInfo: { name: companyName, address, phone, logo },
          industry: industry || undefined,
          businessType: businessType || undefined,
        })
      });
      if (!res.ok) throw new Error('Failed to save settings');
      trackEvent('tutorial_complete');
      toast.success('Your defaults have been saved!');
      onComplete();
    } catch (e: any) {
      toast.error(e.message || 'Error saving details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Choose Your Default Layout' : 'Tell Us About Your Business'}
            </h2>
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === step ? 'bg-green-500' : s < step ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <button onClick={onSkip} className="text-sm font-medium text-gray-400 hover:text-gray-600">
            Skip for now
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-6">
              <p className="text-gray-600">Select a layout that best represents your brand. You can change this later.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all group ${layout === l.id ? 'border-green-500 bg-green-50/30 ring-2 ring-green-500 ring-offset-1' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="h-32 bg-gray-50 rounded mb-3 flex items-center justify-center p-2 relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                      {l.svg}
                    </div>
                    <div className="font-bold text-gray-900 mb-1">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.description}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition shadow-sm"
                >
                  Next Step →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <p className="text-gray-600 text-center">Add your company details to auto-fill future invoices.</p>

              <div className="flex flex-col items-center justify-center mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Company Logo</p>
                <div className="w-32 h-32 relative">
                  <ImageUpload
                    label="Upload Company Logo"
                    currentImage={logo || undefined}
                    onImageUpload={(url: string) => setLogo(url)}
                  />
                  {logo && (
                    <Image src={logo} alt="Logo" fill unoptimized className="object-contain rounded bg-white shadow-sm ring-1 ring-gray-200 pointer-events-none" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="+234..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none h-20"
                  placeholder="123 Business Rd..."
                />
              </div>

              {/* New Lead Gen Fields */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  These help us personalise your experience
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-sm"
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">Helps us suggest relevant invoice templates</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-sm"
                    >
                      <option value="">Select type</option>
                      {regionConfig.businessTypes.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">Helps format your tax information</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
