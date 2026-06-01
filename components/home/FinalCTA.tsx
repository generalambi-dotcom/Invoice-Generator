import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-teal-800 to-teal-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-snug">
            Your next invoice is<br className="hidden sm:block" /> 60 seconds away.
          </h2>
          <p className="text-teal-100 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Join 50,000+ Nigerian businesses who get paid faster with InvoiceGenerator.ng
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/free-invoice-generator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold rounded-full bg-white text-teal-800 hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
            >
              Create Invoice — It&apos;s Free
            </Link>
            <Link
              href="/upgrade"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold rounded-full bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all"
            >
              Start Premium Free
            </Link>
          </div>

          <p className="text-teal-200 text-xs">
            No credit card required · Cancel anytime · Free plan stays free forever
          </p>
        </div>
      </div>
    </section>
  );
}
