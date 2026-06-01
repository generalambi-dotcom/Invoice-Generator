import Link from 'next/link';

const USE_CASES = [
  { emoji: '💻', industry: 'Freelancers & Designers', tagline: 'Bill clients by project or hourly rate' },
  { emoji: '🏗️', industry: 'Construction & Contractors', tagline: 'Quote jobs, invoice stages, track retentions' },
  { emoji: '🩺', industry: 'Healthcare Professionals', tagline: 'Invoice patients, clinics, and insurers' },
  { emoji: '🎓', industry: 'Tutors & Educators', tagline: 'Recurring invoices for term fees' },
  { emoji: '🛒', industry: 'Retailers & Traders', tagline: 'Itemised receipts with stock quantities' },
  { emoji: '⚖️', industry: 'Legal & Consultants', tagline: 'Time-based billing with hourly rates' },
  { emoji: '🏠', industry: 'Real Estate Agents', tagline: 'Commission invoices and lease statements' },
  { emoji: '🎤', industry: 'Events & Entertainment', tagline: 'Deposit invoices and balance billing' },
];

export default function UseCases() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Who uses InvoiceGenerator.ng?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            From solo freelancers to growing agencies — invoicing that fits your business.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {USE_CASES.map((item) => (
            <div
              key={item.industry}
              className="flex flex-col items-center text-center p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <h3 className="font-bold text-gray-900 text-xs mb-1 leading-snug">{item.industry}</h3>
              <p className="text-gray-400 text-[11px] leading-snug">{item.tagline}</p>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-gray-500">
          Not on the list?{' '}
          <Link href="/free-invoice-generator" className="text-teal-700 font-semibold hover:underline underline-offset-2">
            InvoiceGenerator.ng works for any Nigerian business →
          </Link>
        </p>
      </div>
    </section>
  );
}
