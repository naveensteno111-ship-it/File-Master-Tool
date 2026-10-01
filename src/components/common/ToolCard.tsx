import React from 'react';
import { ToolDefinition } from '../../types';
import {
  FileText,
  FileImage,
  Image,
  Images,
  Layers,
  Scissors,
  Minimize2,
  RotateCw,
  Copy,
  Trash2,
  ArrowUpDown,
  Stamp,
  RefreshCw,
  Zap,
  Sparkles,
  Maximize2,
  Crop,
  Table,
  FileCode,
  File,
  Grid,
  Presentation,
  Archive,
  Star,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  FileImage,
  Image,
  Images,
  Layers,
  Scissors,
  Minimize2,
  Minimize: Minimize2,
  RotateCw,
  Copy,
  Trash2,
  ArrowUpDown,
  Stamp,
  RefreshCw,
  Zap,
  Sparkles,
  Maximize2,
  Crop,
  Table,
  FileCode,
  File,
  Grid,
  Presentation,
  Archive,
  ImageDown: Image,
  FileSpreadsheet: Table,
};

interface ToolCardProps {
  tool: ToolDefinition;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: string) => void;
  onOpenTool: (slug: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite = false,
  onToggleFavorite,
  onOpenTool,
}) => {
  const IconComponent = ICON_MAP[tool.icon] || FileText;

  // Category color accents
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'pdf':
        return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60';
      case 'image':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60';
      case 'document':
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60';
      case 'compress':
        return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60';
      case 'merge':
        return 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div
      onClick={() => onOpenTool(tool.slug)}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-500/60 transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top header inside card */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-colors duration-200 shadow-xs">
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="flex items-center space-x-1.5">
            {tool.popular && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/60">
                Popular
              </span>
            )}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(tool.id);
                }}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                  isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label="Favorite tool"
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title and description */}
        <h4 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
          {tool.name}
        </h4>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      {/* Footer tags and action */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getCategoryBadgeColor(
            tool.category
          )}`}
        >
          {tool.category}
        </span>

        <span className="flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
          <span>Open Tool</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};
