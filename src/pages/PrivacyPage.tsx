import React from 'react';
import { ShieldCheck, Lock, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
          <ShieldCheck className="h-4 w-4" />
          <span>Your Privacy Matters</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Privacy Policy & Security Architecture
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Last updated: October 2026 • Honest, transparent disclosure of how files are processed
        </p>
      </div>

      {/* Core Principle Notice */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 dark:border-emerald-900/60 dark:bg-emerald-950/30 space-y-4">
        <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Lock className="h-5 w-5 text-emerald-600" />
          <span>Browser-First Processing (Zero Server Exposure)</span>
        </h2>
        <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
          Where technically feasible, <strong>FileMaster Tools performs file operations locally inside your web browser</strong> using client-side WebAssembly, JavaScript, and Canvas APIs. For these tools (including JPG to PDF, PNG to PDF, PDF Merge, PDF Split, Image Converter, Image Compressor, and Image Resizer), your files never leave your device and are never sent over the Internet.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 space-y-8">
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Which Tools Run 100% In-Browser?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The following tools execute exclusively in your device's memory:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>JPG, PNG, WEBP to PDF</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>PDF Merge & Combine</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>PDF Split & Range Extraction</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>PDF to JPG / PNG / ZIP</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>PDF Rotate, Delete & Watermark</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Image Compressor & Resizer</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Image Cropper & Format Converter</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>TXT to PDF & CSV formatting</span>
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Server-Side Processing Disclosures
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Certain advanced conversions (such as Microsoft Office DOCX, XLSX, and PPTX rendering) cannot be reliably converted in frontend JavaScript with accurate font kerning and layout fidelity.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            For these specific tasks, files are transferred over TLS 1.3 encrypted connections to our isolated backend workers (<code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-slate-800">/api/convert</code>). Temporary files are held solely in volatile memory or encrypted ephemeral storage and are <strong>automatically purged immediately after processing</strong>. We never store, index, sell, or inspect user files.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            3. File Security & Anti-Malware Safeguards
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            To protect users and platform integrity, our backend and frontend enforce strict security controls:
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
            <li>Strict MIME-type and extension validation</li>
            <li>Rejection of dangerous executables (.exe, .bat, .sh, .bin, .vbs)</li>
            <li>Enforced file size limits (50 MB per file on Community Free tier)</li>
            <li>Sanitized safe file names to prevent directory traversal</li>
            <li>Cross-Origin Opener and Embedder policies for WebAssembly safety</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            4. Local Session Storage
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Your recent conversion logs and bookmarked favorite tools are saved strictly in your own browser's <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-slate-800">localStorage</code>. You can delete your history at any time from the Workspace Dashboard.
          </p>
        </section>
      </div>
    </div>
  );
};
