import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { invoiceTemplates } from '@/data/templates';
import { Download, Zap, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { Metadata } from 'next';
import InvoicePaper from '@/components/InvoicePaper';

// Static site generation
export function generateStaticParams() {
  return invoiceTemplates.map((template) => ({
    slug: template.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const template = invoiceTemplates.find((t) => t.slug === params.slug);
  if (!template) return { title: 'Not Found' };

  return {
    title: `${template.title} (PDF, Word, Excel) | Free Download`,
    description: template.description,
    keywords: template.metaKeywords.join(', '),
  };
}

export default function TemplateSlugPage({ params }: { params: { slug: string } }) {
  const template = invoiceTemplates.find((t) => t.slug === params.slug);
  if (!template) notFound();

  // Construct a dummy invoice object strictly for previewing the visual template
  const dummyInvoice: any = {
    id: 'placeholder',
    type: template.previewData?.type || 'invoice',
    invoiceNumber: 'INV-TEMP-001',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currency: 'USD',
    theme: template.themeColor,
    layout: 'modern',
    companyInfo: {
      name: "Your Company Ltd",
      email: "hello@yourcompany.com",
      address: "123 Business Road\nSuite 100\nCity, State 12345"
    },
    clientInfo: {
      name: "Client Name",
      email: "client@example.com",
      address: "456 Client Avenue\nCity, State 54321"
    },
    lineItems: template.previewData?.items || [
      { description: 'Professional Services', quantity: 1, rate: 1000, amount: 1000 }
    ],
    subtotal: 0,
    taxRate: template.previewData?.taxRate || 0,
    taxAmount: 0,
    total: 0,
    notes: template.previewData?.notes || 'Thank you for your business.',
    terms: 'Payment due within 14 days.',
  };

  // Recalculate totals for the preview
  dummyInvoice.subtotal = dummyInvoice.lineItems.reduce((acc: number, item: any) => acc + item.amount, 0);
  dummyInvoice.taxAmount = dummyInvoice.subtotal * (dummyInvoice.taxRate / 100);
  dummyInvoice.total = dummyInvoice.subtotal + dummyInvoice.taxAmount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/invoice-templates" className="hover:text-indigo-600">Templates</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">{template.title}</span>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full flex flex-col lg:flex-row gap-12">
        {/* Left Content Area */}
        <div className="flex-1 lg:max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
            <FileText className="w-4 h-4" />
            <span>{template.category}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            {template.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {template.description}
          </p>

          {/* Primary CTA (Generator) */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 mb-10 text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-2">Create this invoice online instantly.</h3>
            <p className="text-indigo-100 mb-6">Skip the manual Word and Excel files. Use our free generator to create, send, and track this exact template.</p>
            <Link 
              href="/free-invoice-generator"
              className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 text-lg font-bold text-indigo-600 bg-white border border-transparent rounded-xl hover:bg-gray-50 transition-all shadow-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Use Free Online Generator
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">{template.h2FeatureTitle}</h2>
          <p className="text-gray-600 mb-8">{template.featureDescription}</p>

          <div className="space-y-4 mb-10">
            {['Fully customizable fields', 'Automatic tax & total calculations', 'Professional structure and layout', 'Print-ready formatting'].map((feature, i) => (
               <div key={i} className="flex items-start">
                 <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0" />
                 <span className="text-gray-700 font-medium">{feature}</span>
               </div>
            ))}
          </div>

          {/* Fallback Downloads */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Or download a blank file:</h3>
            <div className="flex flex-wrap gap-4">
              <a href={`/api/templates/download?type=pdf&slug=${template.slug}`} className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                <Download className="w-4 h-4 mr-2 text-red-500" />
                Download PDF
              </a>
              <a href={`/api/templates/download?type=docx&slug=${template.slug}`} className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                <Download className="w-4 h-4 mr-2 text-blue-500" />
                Download Word
              </a>
              <a href={`/api/templates/download?type=xlsx&slug=${template.slug}`} className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                <Download className="w-4 h-4 mr-2 text-green-500" />
                Download Excel
              </a>
            </div>
          </div>
        </div>

        {/* Right Preview Area */}
        <div className="hidden lg:block flex-1 relative">
          <div className="sticky top-24">
             {/* We wrap InvoicePaper in a container that scales it down so it fits nicely on the page like an image */}
             <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden" style={{ minHeight: '800px', position: 'relative' }}>
                <div className="absolute inset-0 pointer-events-none z-10" style={{ transform: 'scale(0.85)', transformOrigin: 'top center', width: '117.6%', height: '117.6%' }}>
                  <InvoicePaper 
                    invoice={dummyInvoice as any} 
                    isEditable={false} 
                  />
                  {/* Overlay to prevent clicking */}
                  <div className="absolute inset-0 z-20 cursor-default"></div>
                </div>
             </div>
             
             {/* Decorative Elements */}
             <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${template.themeColor}-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -z-10 animate-blob`}></div>
             <div className={`absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -z-10 animate-blob animation-delay-2000`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
