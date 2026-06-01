const FAQS = [
  {
    q: 'Is InvoiceGenerator.ng really free?',
    a: 'Yes. Creating and downloading invoices is 100% free, forever. Premium plans unlock recurring invoices, AI generation, WhatsApp delivery, automated payment reminders, and more — but the core invoice tool stays free.',
  },
  {
    q: 'Does it support Naira (₦)?',
    a: 'Yes. Naira is the default currency on every new invoice. You can also invoice in USD, GBP, EUR, and 50+ other currencies if you work with international clients.',
  },
  {
    q: 'Can I create VAT invoices in Nigeria?',
    a: 'Yes. The 7.5% VAT rate is pre-loaded and applied automatically to your line items, so every invoice shows the correct VAT amount and total for your Nigerian clients.',
  },
  {
    q: 'Is this FIRS compliant?',
    a: 'Yes. The invoice format includes all the fields required by the Federal Inland Revenue Service (FIRS) — business details, TIN, VAT breakdown, and itemised charges — for compliant Nigerian invoicing.',
  },
  {
    q: 'Can freelancers use InvoiceGenerator.ng?',
    a: 'Absolutely. It is built for Nigerian freelancers, solo professionals, agencies, and small businesses. You can bill by project or hourly rate, add your bank details, and send invoices in seconds.',
  },
  {
    q: 'Is this better than using Excel?',
    a: 'Yes. Unlike Excel, totals and 7.5% VAT calculate automatically, invoices look professional with your logo, you can send by email or WhatsApp, and you can track who has paid — all without formulas or formatting headaches.',
  },
  {
    q: 'Do I need to sign up to use it?',
    a: 'No sign-up is required to create and download a single invoice. Create a free account to save your invoices, manage clients, track payment status, and access premium features.',
  },
  {
    q: 'Can I send invoices via WhatsApp?',
    a: 'Yes, on Premium. With one click, your invoice PDF is sent directly to your client on WhatsApp — no downloading and re-uploading required.',
  },
  {
    q: 'Can my clients pay online?',
    a: 'Yes, on Premium. Add a Paystack payment link to your invoice so Nigerian clients can pay by card, bank transfer, or USSD — without leaving the invoice.',
  },
  {
    q: 'What does Premium cost?',
    a: 'Premium is a single affordable monthly fee with a 30-day free trial — no card required to start. You can see the exact price for your region in the pricing section above, and you can cancel anytime.',
  },
  {
    q: 'Can I add my logo and Nigerian bank details?',
    a: 'Yes, on the free plan. Upload your business logo, add your GTBank, Zenith, Access, UBA, or any other Nigerian bank account details, and customise invoice colours.',
  },
  {
    q: 'What is a recurring invoice?',
    a: 'A recurring invoice is created automatically on a set schedule — weekly, monthly, quarterly — and sent to a repeat client without any manual action. This is a Premium feature.',
  },
  {
    q: 'Is my business data secure?',
    a: 'Yes. Your data is stored in an encrypted PostgreSQL database (Supabase). All connections use HTTPS/TLS. Passwords are hashed with bcrypt. We never sell or share your data.',
  },
];

export default function HomeFAQ() {
  return (
    <section className="py-20 bg-gray-50" id="faq">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-sm">
            Everything you need to know about InvoiceGenerator.ng
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-teal-200 transition-colors"
            >
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-sm list-none select-none">
                <span>{q}</span>
                <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-gray-500 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
