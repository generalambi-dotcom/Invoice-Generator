import GlobalInvoiceCounter from '@/components/GlobalInvoiceCounter';

export default function TrustBar() {
  const providers = ['Paystack', 'Stripe', 'PayPal', 'GTBank', 'Zenith Bank', 'Access Bank', 'UBA'];

  return (
    <section className="bg-teal-900 py-10 border-y border-teal-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-7">
          {/* Invoices — uses the SAME live counter as the hero (no conflicting numbers) */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              <GlobalInvoiceCounter plain />
            </div>
            <div className="text-xs text-teal-300 mt-1 font-medium">Invoices Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">50,000+</div>
            <div className="text-xs text-teal-300 mt-1 font-medium">Nigerian Businesses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">FIRS</div>
            <div className="text-xs text-teal-300 mt-1 font-medium">VAT Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">Free</div>
            <div className="text-xs text-teal-300 mt-1 font-medium">Forever</div>
          </div>
        </div>
        <p className="text-center text-xs text-teal-400 mb-4 font-medium tracking-wide uppercase">
          Works with Nigerian banks &amp; payment providers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          {providers.map((name) => (
            <span key={name} className="text-teal-300 text-xs font-semibold tracking-wide opacity-75 hover:opacity-100 transition-opacity">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
