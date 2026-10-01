import React from 'react';
import { Globe, Search, CheckCircle2, FileCode, ArrowRight, ExternalLink } from 'lucide-react';

export const GscGuidePage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
          <Globe className="h-4 w-4" />
          <span>Webmaster Guide</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Google Search Console & SEO Indexing Guide
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
          FileMaster Tools is pre-configured with canonical tags, sitemap.xml, robots.txt, and meta verification hooks. Follow these 5 steps to submit your domain to Google.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
              1
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Add Website Property in Google Search Console
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-10">
            Navigate to{' '}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-semibold inline-flex items-center gap-1"
            >
              Google Search Console <ExternalLink className="h-3 w-3" />
            </a>
            . Select <strong>URL prefix</strong> and enter your public production domain (e.g. <code>https://your-domain.com</code>).
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
              2
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Verify Ownership via HTML Meta Tag or Admin Console
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-10">
            Choose the <strong>HTML Tag</strong> verification method. Copy the verification code (e.g. <code>google-site-verification=...</code>) and paste it into the <strong>Admin Console → Global Settings → SEO</strong> panel, or into your <code>index.html</code> header. Click <strong>Verify</strong> in Google Search Console.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
              3
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Submit XML Sitemap
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-10">
            In the Search Console sidebar, navigate to <strong>Sitemaps</strong>. Enter <code>sitemap.xml</code> and click <strong>Submit</strong>. FileMaster Tools automatically serves this file at <code>/sitemap.xml</code> with canonical index priorities.
          </p>
        </div>

        {/* Step 4 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
              4
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Inspect Important URLs
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-10">
            Use the <strong>URL Inspection tool</strong> at the top bar for high-volume conversion landing pages:
            <code className="block mt-2 rounded bg-slate-100 p-2 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              /jpg-to-pdf<br />
              /pdf-to-jpg<br />
              /merge-pdf<br />
              /image-compressor
            </code>
            Click <strong>Request Indexing</strong> to accelerate crawler discovery.
          </p>
        </div>

        {/* Step 5 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
              5
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Monitor Indexing & Core Web Vitals
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-10">
            Google will process your pages within 48 to 72 hours. Check the <strong>Pages coverage report</strong> to ensure zero 404 or canonical errors. FileMaster Tools achieves near 100/100 Core Web Vitals with in-browser lazy rendering.
          </p>
        </div>
      </div>
    </div>
  );
};
