const DIFFERENTIATORS = [
  {
    title: 'Naira (₦) as default currency',
    detail: 'No hunting for NGN in a 180-currency dropdown. Naira is first, always.',
  },
  {
    title: '7.5% FIRS VAT pre-loaded',
    detail: 'Correct Nigerian tax rate from day one — no manual setup required.',
  },
  {
    title: 'Nigerian bank details on invoices',
    detail: 'GTBank, Zenith, Access, UBA — just type your account number and sort code.',
  },
  {
    title: 'Paystack payment links',
    detail: 'Accept card, bank transfer, and USSD payments — no Stripe account needed.',
  },
  {
    title: 'WhatsApp invoice delivery',
    detail: 'Reach clients where they actually read messages — not lost in an email inbox.',
  },
  {
    title: 'Built for Nigerian internet',
    detail: 'Optimised for lower-bandwidth connections. Fast on 3G, works on mobile data.',
  },
];

export default function WhyNigeria() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-900 border border-teal-700 rounded-full px-4 py-1.5 text-teal-300 text-xs font-semibold mb-4">
              🇳🇬 Made for Nigeria
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Built specifically for Nigeria
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Not a global tool with Nigeria tacked on — built from the ground up for how
              Nigerian businesses actually operate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {DIFFERENTIATORS.map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-xl bg-slate-800 border border-slate-700 hover:border-teal-700 transition-colors">
                <div className="shrink-0 mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
