const OUTCOMES = [
  {
    colour: 'teal',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-700',
    tagBg: 'bg-teal-50',
    tagText: 'text-teal-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Stop chasing payments',
    body: 'Automated reminders by email before and after due dates. See at a glance who owes you and how long they have been overdue.',
    tags: ['Payment reminders', 'Overdue tracking', 'Email alerts'],
  },
  {
    colour: 'blue',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    tagBg: 'bg-blue-50',
    tagText: 'text-blue-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Look professional instantly',
    body: 'Upload your logo, choose your brand colour, and add your bank details. Clients trust businesses that look put-together.',
    tags: ['Company branding', 'Custom logo', 'Professional PDF'],
  },
  {
    colour: 'emerald',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    tagBg: 'bg-emerald-50',
    tagText: 'text-emerald-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Never miscalculate VAT again',
    body: "7.5% FIRS VAT is pre-loaded and auto-applied to every line item. Correct totals every time — no spreadsheet errors, no underpaying.",
    tags: ['FIRS 7.5% VAT', 'Auto calculations', 'Naira (₦) default'],
  },
  {
    colour: 'purple',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    tagBg: 'bg-purple-50',
    tagText: 'text-purple-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Send where your clients are',
    body: 'Deliver invoices by email or WhatsApp. Nigerian clients on mobile can open, view, and pay instantly — no login required.',
    tags: ['Email delivery', 'WhatsApp (Premium)', 'Mobile-friendly'],
  },
  {
    colour: 'amber',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    tagBg: 'bg-amber-50',
    tagText: 'text-amber-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Know your money at a glance',
    body: 'Your dashboard shows total invoiced, paid, overdue, and outstanding — updated in real time. Know exactly where your business stands today.',
    tags: ['Live dashboard', 'Payment history', 'Revenue reports'],
  },
];

export default function OutcomeCards() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything you need to get paid on time
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Built for Nigerian freelancers and small businesses who want to spend less time on
            paperwork and more time doing the work they love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {OUTCOMES.map((item) => (
            <div
              key={item.title}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 ${item.iconBg} ${item.iconText} rounded-lg flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.body}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className={`text-xs ${item.tagBg} ${item.tagText} px-2.5 py-1 rounded-full font-medium`}>
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
