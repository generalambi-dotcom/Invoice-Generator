const TESTIMONIALS = [
  {
    quote:
      'Finally an invoice tool that understands Nigerian banking. I just type my Zenith account number and it\'s on the invoice. No more copy-pasting into Word documents.',
    name: 'Tobi A.',
    role: 'Graphic Designer',
    location: 'Lagos',
    initials: 'TA',
    colour: 'bg-amber-200',
  },
  {
    quote:
      'My clients pay faster since I started adding Paystack links. The dashboard shows me who still owes me without digging through emails.',
    name: 'Amaka O.',
    role: 'Marketing Consultant',
    location: 'Abuja',
    initials: 'AO',
    colour: 'bg-sky-200',
  },
  {
    quote:
      'I send about 20 invoices a month. The recurring invoice feature saves me hours every billing cycle. Worth every kobo of the premium plan.',
    name: 'Emeka S.',
    role: 'IT Support Specialist',
    location: 'Port Harcourt',
    initials: 'ES',
    colour: 'bg-rose-200',
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5 mb-4" aria-label="5 stars">
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
            Nigerian businesses trust us to get paid
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Real feedback from freelancers and business owners across Nigeria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col"
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
                  <div className="text-xs text-gray-400">
                    {t.role} · {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
