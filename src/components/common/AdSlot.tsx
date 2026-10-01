import React from 'react';

interface AdSlotProps {
  slot: 'top-banner' | 'in-feed' | 'tool-sidebar' | 'footer-banner';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slot, className = '' }) => {
  return (
    <div
      className={`relative mx-auto my-6 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center dark:border-slate-800 dark:bg-slate-900/40 ${className}`}
      aria-label="Sponsor advertisement"
    >
      <div className="flex flex-col items-center justify-center space-y-1 text-xs text-slate-400 dark:text-slate-500">
        <span className="font-semibold uppercase tracking-wider text-[10px]">Advertisement</span>
        <div className="flex items-center space-y-0.5 text-center">
          {slot === 'top-banner' && (
            <div className="py-2 text-slate-400">
              <span className="font-medium">Responsive Display Ad Slot</span> (728×90 / 320×50)
            </div>
          )}
          {slot === 'in-feed' && (
            <div className="py-3 text-slate-400">
              <span className="font-medium">Native Sponsor Placement</span> (Google AdSense / Mediavine Ready)
            </div>
          )}
          {slot === 'tool-sidebar' && (
            <div className="py-6 text-slate-400">
              <span className="font-medium">Sidebar Rectangle Ad</span> (300×250)
            </div>
          )}
          {slot === 'footer-banner' && (
            <div className="py-2 text-slate-400">
              <span className="font-medium">Partner Banner Placement</span> (Leaderboard)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
