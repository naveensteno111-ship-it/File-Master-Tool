import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  stepText: string; // e.g. "Uploading...", "Processing...", "Converting..."
  isComplete: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  stepText,
  isComplete,
  error,
  onRetry,
}) => {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/60">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h4 className="mt-3 text-base font-bold text-red-800 dark:text-red-200">
          Something went wrong
        </h4>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300 max-w-md mx-auto">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2.5">
          {!isComplete ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {isComplete ? 'Processing complete!' : stepText || 'Working on your file...'}
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
          {Math.min(100, Math.round(progress))}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isComplete
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Fast browser execution</span>
        <span>{isComplete ? 'Ready for download' : 'Applying security filters...'}</span>
      </div>
    </div>
  );
};
