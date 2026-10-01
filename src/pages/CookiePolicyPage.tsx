import React from 'react';
import { Cookie, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
          <Cookie className="h-4 w-4" />
          <span>Transparency & Tracking Disclosure</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Cookie & Local Storage Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last revised: October 2026 • FileMaster Tools
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          1. What Are Cookies and Local Storage?
        </h2>
        <p>
          Cookies are small text files stored on your computer or mobile device when you load web pages. Modern web applications also use <strong>HTML5 LocalStorage</strong>, which operates inside your browser sandbox to remember user preferences without transmitting data across networks.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          2. How FileMaster Tools Uses Storage
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200">Strictly Necessary & Functional:</strong>
              <p className="mt-0.5 text-xs">
                We store your visual theme preference (dark/light mode), active session tokens, and bookmarked favorite tools so you don't need to reconfigure them each time you visit.
              </p>
            </div>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200">Local Conversion History:</strong>
              <p className="mt-0.5 text-xs">
                To guarantee complete privacy, your history log of processed documents is saved exclusively in your own browser's local storage and is never mirrored to a remote tracking database.
              </p>
            </div>
          </li>
        </ul>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          3. Third-Party Advertising
        </h2>
        <p>
          When optional advertisements are enabled, advertising partners (e.g. Google AdSense) may set cookies to serve relevant contextual ads. These partners adhere to applicable privacy frameworks (including GDPR and CCPA). You can disable personalized cookies in your browser settings at any time.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          4. How to Manage or Delete Cookies
        </h2>
        <p>
          You can clear your local storage at any time by clicking "Clear History" in your Workspace Dashboard or via your browser developer tools / settings.
        </p>
      </div>
    </div>
  );
};
