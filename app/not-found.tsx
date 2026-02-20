import Link from 'next/link';
import { FileQuestion, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4 bg-gray-50">
      <div className="w-24 h-24 bg-teal-100/50 text-teal-600 rounded-full flex items-center justify-center mb-8 border border-teal-200">
        <FileQuestion className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Oops! Page Not Found</h1>
      <p className="text-gray-500 mb-10 max-w-md leading-relaxed">
        We couldn't find the invoice or page you're looking for. It might have been moved, or the link may be broken. Don't worry, you can easily create a new one!
      </p>
      <Link
        href="/free-invoice-generator"
        className="inline-flex items-center gap-2 px-8 py-4 bg-teal-800 text-white font-semibold rounded-full hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
      >
        Return to Generator
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
