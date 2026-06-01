const CATEGORIES = [
  'Freelancers',
  'Agencies',
  'Contractors',
  'Fashion businesses',
  'Consultants',
  'Vendors',
  'Logistics',
  'Small businesses',
];

export default function TrustCategories() {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-400 mb-5">
          Trusted by Nigerian businesses like yours
        </p>
        {/* Horizontal scroll on mobile, wrap+centre on larger screens */}
        <div className="flex gap-2.5 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {CATEGORIES.map((name) => (
            <span
              key={name}
              className="shrink-0 whitespace-nowrap text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 hover:border-teal-300 hover:text-teal-700 transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
