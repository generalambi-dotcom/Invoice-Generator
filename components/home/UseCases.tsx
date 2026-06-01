import Link from 'next/link';

const USE_CASES = [
  { emoji: '💻', industry: 'Freelancers', tagline: 'Bill clients by project or hour and get paid without the back-and-forth' },
  { emoji: '🏢', industry: 'Agencies', tagline: 'Invoice retainers and projects, and track which clients have paid' },
  { emoji: '👗', industry: 'Fashion businesses', tagline: 'Send branded invoices for orders, deposits, and balance payments' },
  { emoji: '🏗️', industry: 'Contractors', tagline: 'Quote jobs, invoice by stage, and track retentions cleanly' },
  { emoji: '⚖️', industry: 'Consultants', tagline: 'Bill by the hour or by deliverable with professional records' },
  { emoji: '🚚', industry: 'Logistics businesses', tagline: 'Invoice deliveries and recurring routes, paid via Paystack' },
];

export default function UseCases() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Built for Nigerian businesses
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Whether you&apos;re freelancing, running an agency or managing clients,
            InvoiceGenerator.ng helps you get paid faster.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {USE_CASES.map((item) => (
            <div
              key={item.industry}
              className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-200 hover:shadow-md transition-all group"
            >
              <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.industry}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.tagline}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/free-invoice-generator"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-teal-800 text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            Create Free Invoice
          </Link>
        </div>
      </div>
    </section>
  );
}
