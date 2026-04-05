'use client';

import { useState, useEffect } from 'react';
import { Mail, Loader2, MapPin, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LeadsDashboard() {
  const [activeTab, setActiveTab] = useState<'available' | 'applied'>('available');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [pitchMessage, setPitchMessage] = useState('Hi, I am very interested in this job and have the skills required to complete it perfectly. Can we discuss the details?');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads?tab=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  const handleApply = async (leadId: string) => {
    if (!pitchMessage.trim()) return;
    
    setApplyingTo(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: pitchMessage })
      });

      if (res.ok) {
        alert('Application sent successfully!');
        setApplyingTo(null);
        fetchLeads(); // refresh
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to apply');
        setApplyingTo(null);
      }
    } catch (error) {
      alert('An error occurred.');
      setApplyingTo(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Lead Marketplace</h1>
          <p className="text-gray-500 font-medium">Find jobs matching your skills and start connecting with clients.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full mb-8 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('available')} 
          className={`pb-4 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'available' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Available Leads
        </button>
        <button 
          onClick={() => setActiveTab('applied')} 
          className={`pb-4 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'applied' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          My Applications
        </button>
      </div>

      {/* Leads List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} leads found</h3>
            <p className="text-gray-500">Check back later for new opportunities in your area.</p>
          </div>
        ) : (
          leads.map((item) => {
            const isAppliedView = activeTab === 'applied';
            const lead = isAppliedView ? item.lead : item;

            return (
              <div key={isAppliedView ? item.id : lead.id} className="bg-white border text-gray-900 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Left content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {lead.industry}
                      </span>
                      <span className="text-sm font-medium text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-3">{lead.serviceReq}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {lead.isRemote ? 'Remote / Online' : `${lead.locationCity}, ${lead.locationState}`}
                      </div>
                      <div className="flex items-center text-orange-600">
                        <Users className="w-4 h-4 mr-1" />
                        {lead.urgency === 'asap' ? 'Needs ASAP' : lead.urgency === 'week' ? 'Within 7 days' : 'Flexible timing'}
                      </div>
                    </div>

                    {isAppliedView && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Application Message</h4>
                        <p className="text-sm italic text-gray-700">"{item.message}"</p>
                      </div>
                    )}
                  </div>

                  {/* Right Action Box */}
                  <div className="w-full lg:w-[320px] shrink-0 bg-gray-50 rounded-lg p-5 border border-gray-100 flex flex-col justify-center">
                    
                    {!isAppliedView ? (
                      <>
                        <div className="text-center mb-4">
                          <div className="text-sm font-bold text-gray-900 mb-1">Customer: {lead.customerName}</div>
                          <div className="text-xs font-medium text-gray-500">Contact details hidden until you apply</div>
                        </div>

                        <div className="mb-4 bg-blue-50 text-blue-800 text-xs font-bold px-3 py-2 rounded text-center">
                          {lead.maxResponses - lead.currentResponses} of {lead.maxResponses} slots remaining
                        </div>
                        
                        {applyingTo === lead.id ? (
                          <div className="space-y-3">
                            <textarea
                              className="w-full p-3 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-600"
                              rows={3}
                              value={pitchMessage}
                              onChange={(e) => setPitchMessage(e.target.value)}
                            ></textarea>
                            <div className="flex gap-2">
                              <button onClick={() => setApplyingTo(null)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
                              <button onClick={() => handleApply(lead.id)} className="flex-1 bg-black text-white font-bold py-2 rounded text-sm hover:bg-gray-900">Send</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setApplyingTo(lead.id)}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                          >
                            Apply for Lead <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-center mb-4 pb-4 border-b border-gray-200">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <div className="font-bold text-gray-900">Application Sent</div>
                        </div>
                        <div className="space-y-2 text-sm text-center">
                          <div className="font-bold text-gray-900">{lead.customerName}</div>
                          <a href={`mailto:${lead.customerEmail}`} className="block text-blue-600 font-medium hover:underline">{lead.customerEmail}</a>
                          {lead.customerPhone && (
                            <a href={`tel:${lead.customerPhone}`} className="block text-gray-600 font-medium">{lead.customerPhone}</a>
                          )}
                        </div>
                      </>
                    )}

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
