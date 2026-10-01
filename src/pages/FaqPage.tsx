import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'How does FileMaster Tools protect my documents and confidentiality?',
      a: 'The majority of our tools execute 100% locally within your web browser using HTML5 Canvas, WebAssembly, and JavaScript. Your confidential files never travel across the internet. For backend-dependent operations (e.g., DOCX rendering), temporary files are processed in volatile memory and purged immediately.'
    },
    {
      q: 'Is FileMaster Tools free to use?',
      a: 'Yes! All core tools are completely free for files up to 50 MB with batch processing up to 30 files at once. No registration or credit card is required.'
    },
    {
      q: 'Can I convert multiple JPG or PNG images into a single PDF document?',
      a: 'Yes, our "JPG to PDF" and "Multiple Images to PDF" tools allow you to upload up to 30 images, preview thumbnails, reorder page sequence, and set margins and orientations.'
    },
    {
      q: 'What is the maximum file size supported?',
      a: 'The free tier supports up to 50 MB per file, which comfortably accommodates almost all multi-page PDFs, high-res photos, and office spreadsheets.'
    },
    {
      q: 'Can I download all converted pages at once?',
      a: 'Yes! When converting PDFs to JPG or PNG, you can download any single page or click "Download All as ZIP" to get all pages organized in a clean zip archive.'
    },
    {
      q: 'Does FileMaster Tools work on mobile and tablet devices?',
      a: 'Yes. FileMaster Tools is built with a responsive mobile-first architecture that works seamlessly across smartphones, iPads, Chromebooks, Macs, and Windows PCs.'
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
          <HelpCircle className="h-4 w-4" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Everything you need to know about FileMaster Tools features, security, and limits.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
        {faqs.map((faq, idx) => (
          <div key={idx} className="py-5 first:pt-0 last:pb-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {faq.q}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
