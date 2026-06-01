import Link from 'next/link';

const STEPS = [
  {
    number: '1',
    title: 'Build your invoice in 60 seconds',
    description:
      'Add your business details, client info, and line items. 7.5% FIRS VAT is pre-loaded. Totals calculate automatically — no spreadsheet needed.',
  },
  {
    number: '2',
    title: 'Send by email or WhatsApp',
    description:
      'One click to deliver a professional PDF to your client by email. Premium users can send directly via WhatsApp — straight to where clients actually read.',
  },
  {
    number: '3',
    title: 'Get paid faster',
    description:
      'Add your Nigerian bank details or a Paystack payment link so clients can pay by card, bank transfer, or USSD. Track who has paid from your dashboard.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            From zero to paid in three steps
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            No accounting degree required. No setup fees. No waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-px bg-teal-100" aria-hidden="true" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-teal-800 text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-md">
                {step.number}
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-base leading-snug">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/free-invoice-generator"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-teal-800 text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md"
          >
            Try it now — it&apos;s free
          </Link>
        </div>
      </div>
    </section>
  );
}
