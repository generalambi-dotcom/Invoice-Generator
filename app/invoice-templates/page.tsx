import React from 'react';
import Link from 'next/link';
import { invoiceTemplates } from '@/data/templates';
import { ArrowRight, FileText, Download, Zap } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Invoice Templates (PDF, Word, Excel) | InvoiceGenerator',
  description: 'Download professionally designed, free invoice templates for every industry. Available in PDF, Word, and Excel formats, or use our free online invoice generator.',
};

export default function InvoiceTemplatesDirectory() {
  // Group templates by category
  const groupedTemplates = invoiceTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof invoiceTemplates>);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Free Invoice Templates for Every Business
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Download professional, battle-tested invoice templates for your specific industry in PDF, Word, or Excel format. Or create one instantly online.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/free-invoice-generator" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              <Zap className="w-5 h-5 mr-2" />
              Use Free Online Generator
            </Link>
          </div>
        </div>
      </section>

      {/* Templates Grid Grid */}
      <section className="py-16 px-4 flex-grow">
        <div className="max-w-7xl mx-auto">
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category} className="mb-16 last:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                  <Link 
                    key={template.id} 
                    href={`/invoice-templates/${template.slug}`}
                    className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`h-3 bg-${template.themeColor}-500 w-full`}></div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className={`w-12 h-12 rounded-xl bg-${template.themeColor}-50 flex items-center justify-center mb-6`}>
                        <FileText className={`w-6 h-6 text-${template.themeColor}-600`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                        {template.description}
                      </p>
                      <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                        <span>Get Template</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
