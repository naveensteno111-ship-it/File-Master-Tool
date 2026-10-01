import React, { useState } from 'react';
import { TOOLS_DATA, CATEGORIES } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { DropZone } from '../components/common/DropZone';
import { AdSlot } from '../components/common/AdSlot';
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  FileCheck2,
  Users,
  HardDriveDownload,
  Layers,
  ChevronRight
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onFileDropToTool: (files: File[]) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  favorites,
  onToggleFavorite,
  onFileDropToTool,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = TOOLS_DATA.filter((tool) => {
    if (selectedCategory === 'all') return true;
    return tool.category === selectedCategory;
  });

  const popularTools = TOOLS_DATA.filter((t) => t.popular).slice(0, 8);

  const handleHeroFiles = (files: File[]) => {
    if (files.length === 0) return;
    onFileDropToTool(files);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        {/* Soft background ambient gradient */}
        <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-indigo-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] dark:opacity-15" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300 mb-6 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>Fast, Secure & Private Online File Utilities</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.15]">
            All Your File Tools in{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              One Place
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Convert, compress, merge, split and manage your documents, PDFs and images quickly and easily. Free, privacy-first, and zero signup required.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('tool:jpg-to-pdf')}
              className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition"
            >
              <span>Choose File</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('all')}
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
            >
              <span>Explore All Tools</span>
            </button>
          </div>

          {/* Hero Drag and Drop Area */}
          <div className="mt-10 max-w-2xl mx-auto">
            <DropZone
              acceptedFormats={['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt', '.csv']}
              maxFiles={20}
              onFilesSelected={handleHeroFiles}
              title="Drag & Drop your files here"
              subtitle="or browse from your device to auto-detect the best tool"
            />
          </div>
        </div>
      </section>

      {/* Ad slot between hero and tools */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot="top-banner" />
      </div>

      {/* TOOL CATEGORIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Popular File Utilities
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select a category to filter or pick one of the frequently used tools below
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredTools.slice(0, 16).map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
              onOpenTool={(slug) => onNavigate(`tool:${slug}`)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('all')}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 transition shadow-xs"
          >
            <span>View All 40+ File Tools</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* WHY CHOOSE FILEMASTER TOOLS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-8 sm:p-12 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-950">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Why FileMaster Tools
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Engineered for Speed, Privacy & Precision
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              We reimagined online file utilities with client-side execution to keep your confidential documents safe.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-xs dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                100% Client-Side Privacy
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Most PDF and image conversions run directly in your web browser. Your confidential contracts, IDs, and financial records never leave your machine.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-xs dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Lightning Fast Conversion
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No slow uploads, no waiting in server queues. Processing begins the millisecond your file is dropped into the workspace.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-xs dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 mb-4">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Registration Required
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Jump straight to work. Convert, compress, and merge unlimited files without creating an account or providing an email address.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            How It Works
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Three Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-extrabold dark:bg-blue-950 dark:text-blue-300">
              1
            </div>
            <h3 className="mt-4 font-bold text-base text-slate-900 dark:text-white">
              Upload Files
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Drag and drop your PDF, photos, or documents directly into any tool.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-extrabold dark:bg-indigo-950 dark:text-indigo-300">
              2
            </div>
            <h3 className="mt-4 font-bold text-base text-slate-900 dark:text-white">
              Customize Settings
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Reorder pages, set compression levels, choose orientations, and crop.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-extrabold dark:bg-emerald-950 dark:text-emerald-300">
              3
            </div>
            <h3 className="mt-4 font-bold text-base text-slate-900 dark:text-white">
              Instant Download
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Download your optimized file immediately or save all pages as a ZIP.
            </p>
          </div>
        </div>
      </section>

      {/* Ad slot */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot="footer-banner" />
      </div>
    </div>
  );
};
