import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last revised: October 2026 • FileMaster Tools
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing and using FileMaster Tools ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you should not access or use the Service.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Acceptable Use</h2>
        <p>
          You agree not to upload or convert any malicious code, virus-infected archives, illegal material, or copyrighted content for which you do not possess legal authorization or ownership. FileMaster Tools reserves the right to terminate access or reject files that violate acceptable use principles.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Intellectual Property Rights</h2>
        <p>
          You retain full ownership of all documents, images, and files uploaded or processed through the Service. FileMaster Tools claims no intellectual property rights over your content.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. FileMaster Tools does not guarantee that file conversions will be completely error-free or uninterrupted.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Limitation of Liability</h2>
        <p>
          In no event shall FileMaster Tools or its operators be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the file utilities.
        </p>
      </div>
    </div>
  );
};
