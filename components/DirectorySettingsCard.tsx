'use client';

import { useState } from 'react';
import { updateDirectorySettingsAPI } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { Check, X, Eye, EyeOff, BarChart, Users, MapPin, Briefcase } from 'lucide-react';
import clsx from 'clsx';

export default function DirectorySettingsCard({ settings, metrics, onUpdate }: { settings: any, metrics: any, onUpdate?: (newSettings: any) => void }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (key: string, currentValue: boolean) => {
    setLoading(true);
    try {
      const updated = { [key]: !currentValue };
      const response = await updateDirectorySettingsAPI(updated);
      toast.success('Preferences updated');
      if (onUpdate) onUpdate(response.settings);
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const isListed = settings?.directoryOptIn;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Status */}
      <div className={clsx(
        "px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4",
        isListed ? "bg-green-50/50 border-green-100" : "bg-gray-50 border-gray-100"
      )}>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Company Directory
            {isListed ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Live
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                Unlisted
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isListed 
              ? "Your business is live in the directory."
              : "Get discovered by clients and partners."}
          </p>
        </div>

        {/* Metrics or Call to Action */}
        {isListed ? (
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-green-200/50 flex items-center gap-2">
               <Eye className="w-4 h-4 text-green-600" />
               <span className="font-medium text-gray-900">{metrics?.profileViews || 0}</span>
               <span className="text-gray-500">views</span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-green-200/50 flex items-center gap-2">
               <BarChart className="w-4 h-4 text-emerald-600" />
               <span className="font-medium text-gray-900">{metrics?.searchAppearances || 0}</span>
               <span className="text-gray-500">searches</span>
            </div>
          </div>
        ) : (
          <button
             onClick={() => handleToggle('directoryOptIn', isListed)}
             disabled={loading}
             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50"
          >
            List my business
          </button>
        )}
      </div>

      <div className="p-6">
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <p className="font-medium text-gray-900">List my business in the directory</p>
            <p className="text-sm text-gray-500">Enable this to allow discovery across Nigeria.</p>
          </div>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={!!isListed}
              onChange={() => handleToggle('directoryOptIn', isListed)}
              disabled={loading}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
          </div>
        </label>

        {isListed && (
          <div className="mt-8">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">What to show</h4>
            <p className="text-sm text-gray-500 mb-6">Control what information is visible to others.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VisibilityCheckbox 
                label="Business Name" 
                icon={<Briefcase className="w-4 h-4" />}
                checked={!!settings?.dirShowName}
                onChange={() => handleToggle('dirShowName', settings.dirShowName)}
                disabled={loading}
              />
              <VisibilityCheckbox 
                label="Industry" 
                icon={<Briefcase className="w-4 h-4" />}
                checked={!!settings?.dirShowIndustry}
                onChange={() => handleToggle('dirShowIndustry', settings.dirShowIndustry)}
                disabled={loading}
              />
              <VisibilityCheckbox 
                label="Location" 
                icon={<MapPin className="w-4 h-4" />}
                checked={!!settings?.dirShowLocation}
                onChange={() => handleToggle('dirShowLocation', settings.dirShowLocation)}
                disabled={loading}
              />
              <VisibilityCheckbox 
                label="Business Size" 
                icon={<Users className="w-4 h-4" />}
                checked={!!settings?.dirShowSize}
                onChange={() => handleToggle('dirShowSize', settings.dirShowSize)}
                disabled={loading}
              />
              <VisibilityCheckbox 
                label="Activity Status" 
                icon={<BarChart className="w-4 h-4" />}
                checked={!!settings?.dirShowActivity}
                onChange={() => handleToggle('dirShowActivity', settings.dirShowActivity)}
                disabled={loading}
              />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-start gap-3">
               <div className="mt-0.5 bg-blue-50 p-1.5 rounded-full text-blue-600">
                  <Check className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-900">Your data is private</p>
                 <p className="text-sm text-gray-500">We never share sensitive business data such as revenue, invoices, or contact details. Only selected profile information is visible.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VisibilityCheckbox({ label, icon, checked, onChange, disabled }: { label: string, icon: any, checked: boolean, onChange: () => void, disabled: boolean }) {
  return (
    <label className={clsx(
      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition",
      checked ? "border-blue-200 bg-blue-50/30" : "border-gray-200"
    )}>
      <div className="relative flex items-center">
        <input 
          type="checkbox" 
          className="peer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className={clsx("flex items-center gap-2 text-sm font-medium", checked ? "text-blue-900" : "text-gray-700")}>
        <span className={checked ? "text-blue-600" : "text-gray-400"}>{icon}</span>
        {label}
      </div>
      <div className="ml-auto">
        {checked ? <Eye className="w-4 h-4 text-blue-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
      </div>
    </label>
  );
}
