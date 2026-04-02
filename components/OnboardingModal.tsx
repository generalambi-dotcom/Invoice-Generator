'use client';

import React, { useState } from 'react';
import { Layout, Theme } from '@/types/invoice';
import ImageUpload from './ImageUpload';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

const LAYOUTS: { id: Layout; name: string; description: string }[] = [
  { id: 'modern', name: 'Modern Minimalist', description: 'Clean, abundant whitespace. Left-aligned logo.' },
  { id: 'bold', name: 'Bold Business', description: 'Solid colored header band. Exudes stability.' },
  { id: 'classic', name: 'Classic Corporate', description: 'Highly traditional structure with boxed layouts.' },
  { id: 'creative', name: 'Creative Studio', description: 'Asymmetrical design using colored blocks.' },
  { id: 'startup', name: 'Sleek Startup', description: 'Pill-shaped backgrounds around totals.' },
  { id: 'elegant', name: 'Elegant Edge', description: 'Sophisticated layout featuring subtle elegant accents.' },
];

export default function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [layout, setLayout] = useState<Layout>('modern');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout,
          companyInfo: { name: companyName, address, phone, logo }
        })
      });
      if (!res.ok) throw new Error('Failed to save settings');
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
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Choose Your Default Layout' : 'Enter Company Details'}
          </h2>
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
                    className={`text-left p-4 rounded-xl border-2 transition-all ${layout === l.id ? 'border-green-500 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-xs text-center p-4">
                      {l.description}
                    </div>
                    <div className="font-bold text-gray-900">{l.name}</div>
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
                    <img src={logo} alt="Logo" className="absolute inset-0 w-full h-full object-contain rounded bg-white shadow-sm ring-1 ring-gray-200 pointer-events-none" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none h-24"
                  placeholder="123 Business Rd..."
                />
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
