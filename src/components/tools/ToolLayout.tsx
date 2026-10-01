import React from 'react';
import { ToolDefinition } from '../../types';
import { ChevronRight, Home, Lock, Cpu, HelpCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { AdSlot } from '../common/AdSlot';
import { ToolCard } from '../common/ToolCard';
import { TOOLS_DATA } from '../../data/toolsData';
import { useAuth } from '../../context/AuthContext';

interface ToolLayoutProps {
  tool: ToolDefinition;
  onNavigate: (route: string) => void;
  onOpenPricing?: () => void;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  onNavigate,
  onOpenPricing,
  children,
}) => {
  const { isLimitReached, usage, user } = useAuth();

  const relatedTools = TOOLS_DATA.filter(
    (t) => t.id !== tool.id && (t.category === tool.category || t.popular)
  ).slice(0, 3);

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'pdf': return 'PDF Tools';
      case 'image': return 'Image Tools';
      case 'document': return 'Document Tools';
      case 'excel': return 'Excel & CSV';
      case 'powerpoint': return 'PowerPoint';
      case 'archive': return 'Archive & Utilities';
      case 'compress': return 'Compress';
      case 'merge': return 'Merge';
      default: return 'All Tools';
    }
  };

  const currentMaxMb = user?.plan === 'premium' || user?.plan === 'enterprise' ? 2048 : (tool.maxFileSizeMb || 50);

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Home className="h-3.5 w-3.5 mr-1" />
            <span>Home</span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <button
            onClick={() => onNavigate(`category:${tool.category}`)}
            className="hover:text-blue-600 dark:hover:text-blue-400 capitalize"
          >
            {getCategoryTitle(tool.category)}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {tool.name}
          </span>
        </nav>

        {/* Tool Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-3 border border-blue-100 dark:border-blue-900/50">
            {tool.isClientSide ? (
              <>
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>100% In-Browser Privacy Protected</span>
              </>
            ) : (
              <>
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
                <span>Secure Cloud Worker Pipeline</span>
              </>
            )}
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-mono text-[11px]">Max {currentMaxMb} MB</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {tool.name}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>

        {/* Daily limit reached banner */}
        {isLimitReached && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/60">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  Daily Limit Reached
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You have utilized all {usage?.dailyLimit || 20} free conversions for today.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPricing}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade Plan to Pro</span>
            </button>
          </div>
        )}

        {/* Work Area */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {!tool.isFunctional ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Cpu className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                This tool requires backend processing and is not enabled yet.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                The processing engine for <strong>{tool.name}</strong> is currently in the worker development queue.
                We never simulate fake results.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('all')}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Explore 20+ Working Tools
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Ad slot */}
        <AdSlot slot="in-feed" className="my-10" />

        {/* FAQs */}
        {tool.faqs && tool.faqs.length > 0 && (
          <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white mb-6">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tool.faqs.map((faq, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {faq.question}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Tools */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Related Tools
            </h2>
            <button
              onClick={() => onNavigate('all')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Browse all tools →
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedTools.map((t) => (
              <ToolCard
                key={t.id}
                tool={t}
                onOpenTool={(slug) => onNavigate(`tool:${slug}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
