'use client';

import { useState, useEffect } from 'react';
import { updateDirectorySettingsAPI } from '@/lib/api-client';
import { Briefcase, MapPin, Users, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function DirectoryOptInModal({ settings, onComplete }: { settings: any, onComplete: (newSettings: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [optIn, setOptIn] = useState(true); // Default ON based on brief
  const [showName, setShowName] = useState(true);
  const [showIndustry, setShowIndustry] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showSize, setShowSize] = useState(true);
  const [showActivity, setShowActivity] = useState(false); // Recommended off by default

  useEffect(() => {
    // Show only if they literally have never seen it and data has loaded
    if (settings && !settings.hasSeenDirectoryPrompt) {
      setIsOpen(true);
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleSaveAndContinue = async () => {
    setLoading(true);
    try {
      const response = await updateDirectorySettingsAPI({
        directoryOptIn: optIn,
        hasSeenDirectoryPrompt: true, // Mark as seen regardless of opt-in
        dirShowName: showName,
        dirShowIndustry: showIndustry,
        dirShowLocation: showLocation,
        dirShowSize: showSize,
        dirShowActivity: showActivity
      });
      
      toast.success(optIn ? 'Your business is now listed!' : 'Preferences saved');
      setIsOpen(false);
      onComplete(response.settings);
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    // If they just close the 'X', we consider it "seen" but left at default (false optIn)
    setIsOpen(false);
    try {
      const response = await updateDirectorySettingsAPI({ hasSeenDirectoryPrompt: true });
      onComplete(response.settings);
    } catch (error) {
      // Background failure okay here
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Get discovered by clients and partners</h2>
            <p className="text-sm text-gray-500 mt-1">List your business in our public directory and increase your visibility across Nigeria.</p>
          </div>
          <button onClick={handleDismiss} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          <label className="flex items-start justify-between cursor-pointer group p-4 border border-blue-200 bg-blue-50/40 rounded-xl mb-6">
            <div>
              <p className="font-semibold text-blue-900">List my business in the directory</p>
              <p className="text-sm text-blue-700/80 mt-1">Make your profile visible to banks and partners searching for businesses.</p>
            </div>
            <div className="relative mt-1">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={optIn}
                onChange={() => setOptIn(!optIn)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>

          <div className={clsx("transition-all duration-300", !optIn ? "opacity-50 pointer-events-none" : "")}>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">What to show publically</h4>
            
            <div className="space-y-2">
              <CheckboxRow label="Business name" checked={showName} onChange={() => setShowName(!showName)} icon={<Briefcase className="w-4 h-4" />} />
              <CheckboxRow label="Industry" checked={showIndustry} onChange={() => setShowIndustry(!showIndustry)} icon={<Briefcase className="w-4 h-4" />} />
              <CheckboxRow label="Location" checked={showLocation} onChange={() => setShowLocation(!showLocation)} icon={<MapPin className="w-4 h-4" />} />
              <CheckboxRow label="Business size" checked={showSize} onChange={() => setShowSize(!showSize)} icon={<Users className="w-4 h-4" />} />
              <CheckboxRow label="Activity status (recommended)" checked={showActivity} onChange={() => setShowActivity(!showActivity)} icon={<Check className="w-4 h-4" />} />
            </div>

            <div className="mt-5 p-3 bg-gray-50 rounded-lg flex gap-3 text-sm text-gray-600">
               <Check className="w-5 h-5 text-green-500 shrink-0" />
               <p>
                 <span className="font-medium text-gray-900">You're always in control.</span> You can update or remove your listing at any time from your settings.
               </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
           <button 
             onClick={handleDismiss}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
             disabled={loading}
           >
             Cancel
           </button>
           <button 
             onClick={handleSaveAndContinue}
             disabled={loading}
             className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
           >
             {loading ? 'Saving...' : 'Save and continue'}
           </button>
        </div>

      </div>
    </div>
  );
}

function CheckboxRow({ label, checked, onChange, icon }: { label: string, checked: boolean, onChange: () => void, icon: any }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="relative flex items-center">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={onChange}
          className="peer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}
