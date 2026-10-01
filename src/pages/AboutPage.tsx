import React from 'react';
import { Layers, ShieldCheck, Zap, Lock, Cpu, Heart, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
          <Layers className="h-4 w-4" />
          <span>About FileMaster Tools</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Convert, Compress, Merge & Manage Your Files Online
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          FileMaster Tools is an all-in-one suite of modern browser-first file utilities created to free users from expensive subscriptions, intrusive ads, and privacy risks.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Our Mission: Complete Privacy by Default
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Traditional document websites require you to upload your sensitive contracts, tax documents, medical records, and family photos to their servers. We asked: <em>why transfer files over the wire when modern browsers are faster and more powerful than ever?</em>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Using WebAssembly, HTML5 Canvas APIs, and in-memory cryptography engines, FileMaster Tools processes the vast majority of tasks right inside your web browser. No cloud storage, no data breaches, and zero permanent footprints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Zap className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Ultra Fast</h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Eliminating network roundtrips means images and PDFs are converted in milliseconds.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Lock className="h-8 w-8 text-emerald-600 mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Confidential</h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Client-side tasks ensure your documents never leave your laptop or smartphone.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Cpu className="h-8 w-8 text-violet-600 mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Enterprise Scaled</h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Where cloud workers are required, dedicated endpoints (/api/convert) validate and wipe files automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
