'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { INDUSTRY_OPTIONS } from '@/lib/profile-completeness';

function EnquireFunnelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    industry: '',
    serviceReq: searchParams.get('service') || '',
    isRemote: false,
    locationCity: searchParams.get('location') || '',
    locationState: '',
    urgency: 'flexible',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsSuccess(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit enquiry');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">You're all set!</h1>
        <p className="text-gray-600 text-lg mb-8 max-w-md">
          We've sent your request to up to 10 top-rated professionals in your area. They will reach out to you shortly with quotes.
        </p>
        <Link href="/businesses" className="text-white bg-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <Link href="/businesses" className="flex items-center gap-2 text-gray-900 font-extrabold text-xl tracking-tighter">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          InvoiceNaija<span className="text-gray-500 font-normal ml-0.5">Explore</span>
        </Link>
        <div className="text-sm font-bold text-gray-400">Step {step} of 4</div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div className="bg-blue-600 h-1 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-16">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10">
          
          {step > 1 && (
            <button onClick={prevStep} className="flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 mb-6 transition">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          )}

          {/* STEP 1: Category & Basic Needs */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">What service do you need?</h1>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category (Optional)</label>
                <select 
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                >
                  <option value="">Select the best match</option>
                  {INDUSTRY_OPTIONS.map((opt:any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Describe what you need</label>
                <textarea 
                  rows={4}
                  placeholder="E.g. I need a modern website for my new consulting business, including a booking system."
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={formData.serviceReq}
                  onChange={e => setFormData({...formData, serviceReq: e.target.value})}
                ></textarea>
              </div>

              <button 
                disabled={!formData.serviceReq.trim()}
                onClick={nextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Where do you need the service?</h1>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-600 transition">
                  <input 
                    type="radio" 
                    name="locationType" 
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    checked={!formData.isRemote}
                    onChange={() => setFormData({...formData, isRemote: false})}
                  />
                  <div className="ml-3">
                    <span className="block font-bold text-gray-900">In person</span>
                    <span className="text-sm text-gray-500">The professional will travel to you</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-600 transition">
                  <input 
                    type="radio" 
                    name="locationType" 
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    checked={formData.isRemote}
                    onChange={() => setFormData({...formData, isRemote: true, locationCity: '', locationState: ''})}
                  />
                  <div className="ml-3">
                    <span className="block font-bold text-gray-900">Remote / Online</span>
                    <span className="text-sm text-gray-500">The service can be done from anywhere</span>
                  </div>
                </label>
              </div>

              {!formData.isRemote && (
                <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City / Area</label>
                    <input 
                      type="text" 
                      placeholder="E.g. Ikeja, Lekki..."
                      className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      value={formData.locationCity}
                      onChange={e => setFormData({...formData, locationCity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                    <input 
                      type="text" 
                      placeholder="E.g. Lagos, Abuja..."
                      className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      value={formData.locationState}
                      onChange={e => setFormData({...formData, locationState: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <button 
                disabled={!formData.isRemote && (!formData.locationCity.trim() || !formData.locationState.trim())}
                onClick={nextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 3: Urgency */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">How soon do you need it?</h1>
              
              <div className="space-y-3">
                {[
                  { id: 'asap', label: 'As soon as possible' },
                  { id: 'week', label: 'Within next 7 days' },
                  { id: 'flexible', label: 'I\'m flexible on timing' }
                ].map(opt => (
                  <label key={opt.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${formData.urgency === opt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <input 
                      type="radio" 
                      name="urgency" 
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      checked={formData.urgency === opt.id}
                      onChange={() => setFormData({...formData, urgency: opt.id})}
                    />
                    <span className="ml-3 font-bold text-gray-900">{opt.label}</span>
                  </label>
                ))}
              </div>

              <button 
                onClick={nextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition mt-4"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 4: Contact Details */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Get your free quotes</h1>
              <p className="text-gray-500 font-medium">Leave your details so professionals can send you their quotes and messages directly.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    value={formData.customerEmail}
                    onChange={e => setFormData({...formData, customerEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    value={formData.customerPhone}
                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                  />
                </div>
              </div>

              <button 
                disabled={isLoading || !formData.customerName.trim() || !formData.customerEmail.trim() || !formData.customerEmail.includes('@')}
                onClick={handleSubmit}
                className="w-full bg-black hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                Get Quotes Now
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function EnquireFunnelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <EnquireFunnelContent />
    </Suspense>
  );
}
