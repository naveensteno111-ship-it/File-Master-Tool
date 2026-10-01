import React from 'react';
import { Layers, ShieldCheck, Lock, Cpu, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-600 dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                FileMaster <span className="text-blue-600 dark:text-blue-400">Tools</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Convert, Compress, Merge & Manage Your Files Online with fast, secure, browser-first tools for PDFs, images, and documents.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Privacy-First: In-browser processing for confidential documents</span>
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              PDF Tools
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('tool:jpg-to-pdf')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  JPG to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:pdf-to-jpg')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  PDF to JPG
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:merge-pdf')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Merge PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:split-pdf')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Split PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:pdf-compressor')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Compress PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Image Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Image Tools
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('tool:jpg-to-png')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  JPG to PNG
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:png-to-jpg')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  PNG to JPG
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:image-compressor')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Image Compressor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:image-resizer')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Image Resizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tool:image-cropper')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Image Cropper
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Company & Legal
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cookies')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gsc-guide')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition text-blue-600 dark:text-blue-400 font-semibold"
                >
                  SEO & Search Console
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200/80 pt-6 sm:flex-row dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2026 FileMaster Tools. All rights reserved.
          </p>
          <div className="mt-4 flex items-center space-x-6 text-xs text-slate-500 sm:mt-0">
            <span className="flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-blue-500" /> WebAssembly & Canvas Engine
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-500" /> 100% Client-Side Ready
            </span>
            <button
              onClick={() => onNavigate('admin')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px]"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
