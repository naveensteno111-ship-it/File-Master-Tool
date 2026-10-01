import React from 'react';
import { Check, X, Sparkles, Shield, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fair & Transparent Limits</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Free forever, expandable for power users
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enjoy full in-browser processing with zero account required. Premium tiers scale for enterprise volume.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Free Tier */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 p-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Community Free</span>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Current Plan
                </span>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="ml-1 text-sm text-slate-500">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ideal for everyday document and photo tasks without any signup.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Unlimited in-browser conversions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Max file size: <strong>50 MB per file</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Batch processing up to 30 files</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>100% private client-side execution</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400">
                  <X className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                  <span>Non-intrusive banner ads</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              Continue with Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-blue-600 bg-gradient-to-b from-blue-50/50 to-white p-6 dark:from-blue-950/20 dark:to-slate-900 shadow-xl shadow-blue-500/10">
            <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Upcoming Tier
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Pro Studio</span>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$6.99</span>
                <span className="ml-1 text-sm text-slate-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                For professionals, teams, and high-frequency document processing.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Max file size: <strong>2.0 GB per file</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Unlimited batch file uploads</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>High-performance Cloud OCR pipeline</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>100% Ad-free experience</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Priority server queue</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <span className="block w-full rounded-xl bg-slate-200/80 py-2.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Coming Soon in Next Release
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
