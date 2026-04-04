import { MapPin, Briefcase, Users, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function BusinessCard({ data }: { data: any }) {
  // Handles anonymous naming dynamically logic
  const isAnonymous = data.name === 'Anonymous Business';
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full group">
        <div className="p-6 flex-1">
           {/* Top Badge Row */}
           <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-xl font-bold text-gray-400 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                 {isAnonymous ? '?' : data.name.charAt(0).toUpperCase()}
              </div>
              
              {data.isActive && (
                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Active this month
                 </span>
              )}
           </div>

           {/* Name */}
           <h3 className={clsx(
               "text-lg font-bold mb-4 line-clamp-2",
               isAnonymous ? "text-gray-500 italic" : "text-gray-900"
           )}>
               {data.name}
           </h3>

           {/* Meta Data */}
           <div className="space-y-2.5 text-sm">
             {data.industry && (
               <div className="flex items-center gap-2.5 text-gray-600">
                 <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                 <span className="truncate">{data.industry}</span>
               </div>
             )}
             
             {data.location && (
               <div className="flex items-center gap-2.5 text-gray-600">
                 <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                 <span className="truncate">{data.location}</span>
               </div>
             )}
             
             {data.size && (
               <div className="flex items-center gap-2.5 text-gray-600">
                 <Users className="w-4 h-4 text-purple-500 shrink-0" />
                 <span className="truncate">{data.size} employees</span>
               </div>
             )}
           </div>
        </div>

        {/* Action Bottom */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
            <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition">
                View Business Profile &rarr;
            </button>
        </div>
    </div>
  );
}
