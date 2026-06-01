import Link from 'next/link';

const TESTIMONIALS = [
  {
    quote:
      'I stopped using Excel completely. Clients take my business more seriously now, and my invoices look professional every single time.',
    name: 'Chinedu A.',
    role: 'Lagos Freelancer',
    initials: 'CA',
    colour: 'bg-amber-200',
  },
  {
    quote:
      'Sending invoices through WhatsApp changed everything. Clients see them immediately and I get paid far faster than before.',
    name: 'Tolu O.',
    role: 'Small Business Owner',
    initials: 'TO',
    colour: 'bg-sky-200',
  },
  {
    quote:
      'We now invoice clients faster and track exactly who has paid. No more guessing or digging through old emails to chase money.',
    name: 'Amina K.',
    role: 'Agency Founder',
    initials: 'AK',
    colour: 'bg-rose-200',
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5 mb-4" aria-label="5 out of 5 stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Why Nigerian businesses switched
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Thousands of freelancers and businesses now send invoices faster and get paid on time.
          </p>
        </div>

        {/* Swipeable carousel on mobile, 3-card grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-auto md:px-0 pb-2 md:pb-0 scrollbar-hide">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="snap-center shrink-0 w-[85%] sm:w-[70%] md:w-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col"
            >
              <Stars />
              <blockquote className="text-gray-700 text-sm leading-relaxed italic flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.colour} flex items-center justify-center text-xs font-bold text-gray-700 shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
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
