import React, { useState } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { imagesToPdf, ImageToPdfOptions } from '../../services/pdfService';
import { UploadedFileItem, ConversionResult } from '../../types';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  FileImage,
  Download,
  RotateCcw,
  CheckCircle,
  Settings,
  Plus
} from 'lucide-react';

interface JpgToPdfToolProps {
  acceptedFormats?: string[];
  title?: string;
  onRecordHistory?: (record: any) => void;
}

export const JpgToPdfTool: React.FC<JpgToPdfToolProps> = ({
  acceptedFormats = ['.jpg', '.jpeg', '.png', '.webp'],
  title = 'JPG to PDF Converter',
  onRecordHistory,
}) => {
  const [items, setItems] = useState<UploadedFileItem[]>([]);
  const [options, setOptions] = useState<ImageToPdfOptions>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'small',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const newItems: UploadedFileItem[] = files.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...newItems]);
    setError(null);
  };

  const removeFile = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setItems((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setStepText('Preparing images for conversion...');
    setError(null);

    try {
      const files = items.map((item) => item.file);
      const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

      const pdfBlob = await imagesToPdf(files, options, (p, text) => {
        setProgress(p);
        setStepText(text);
      });

      const downloadUrl = URL.createObjectURL(pdfBlob);
      const outputFileName = items.length === 1
        ? `${items[0].name.replace(/\.[^/.]+$/, "")}.pdf`
        : `filemaster_converted_${Date.now()}.pdf`;

      const conversionRes: ConversionResult = {
        fileName: outputFileName,
        blob: pdfBlob,
        downloadUrl,
        originalSize: totalOriginalSize,
        outputSize: pdfBlob.size,
        format: 'PDF',
      };

      setResult(conversionRes);
      setIsProcessing(false);

      onRecordHistory?.({
        toolId: 'jpg-to-pdf',
        toolName: 'JPG to PDF',
        originalFileName: items.length === 1 ? items[0].name : `${items.length} images combined`,
        outputFileName,
        originalSize: totalOriginalSize,
        outputSize: pdfBlob.size,
        format: 'PDF',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to convert images to PDF.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    if (result?.downloadUrl) URL.revokeObjectURL(result.downloadUrl);
    setItems([]);
    setResult(null);
    setProgress(0);
    setError(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {items.length === 0 && !result && (
        <DropZone
          acceptedFormats={acceptedFormats}
          maxFiles={30}
          onFilesSelected={handleFilesSelected}
          title="Drag & Drop JPG or Images here"
          subtitle="or browse photos from your computer or phone"
        />
      )}

      {/* Selected Items List & Settings */}
      {items.length > 0 && !result && !isProcessing && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                Uploaded Images ({items.length})
              </h3>
              <p className="text-xs text-slate-500">
                Drag or use arrows to rearrange page sequence
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer inline-flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <Plus className="h-3.5 w-3.5" />
                <span>Add More</span>
                <input
                  type="file"
                  multiple
                  accept={acceptedFormats.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  }}
                />
              </label>
              <button
                onClick={resetAll}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 px-2 py-1.5"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Image Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-96 overflow-y-auto p-1">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    #{index + 1}
                  </div>
                </div>

                <div className="mt-2 truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {formatBytes(item.size)}
                  </p>
                </div>

                {/* Card controls */}
                <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-1.5 dark:border-slate-800">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                      title="Move left"
                    >
                      <ArrowUp className="h-3 w-3 -rotate-90" />
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                      title="Move right"
                    >
                      <ArrowDown className="h-3 w-3 -rotate-90" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="rounded p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Settings Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-4">
              <Settings className="h-4 w-4" />
              <span>PDF Layout Options</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page Size */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Page Size
                </label>
                <select
                  value={options.pageSize}
                  onChange={(e) =>
                    setOptions({ ...options, pageSize: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="A4">A4 (Standard 210 × 297 mm)</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                  <option value="Legal">US Legal (8.5 × 14 in)</option>
                  <option value="A3">A3 (297 × 420 mm)</option>
                  <option value="Original">Fit to Image Size</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Orientation
                </label>
                <select
                  value={options.orientation}
                  onChange={(e) =>
                    setOptions({ ...options, orientation: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Page Margins
                </label>
                <select
                  value={options.margin}
                  onChange={(e) =>
                    setOptions({ ...options, margin: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="none">No Margin (Full Bleed)</option>
                  <option value="small">Small (0.25 inch)</option>
                  <option value="medium">Medium (0.5 inch)</option>
                  <option value="large">Large (0.75 inch)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleConvert}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <span>Convert to PDF</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                {items.length} {items.length === 1 ? 'Page' : 'Pages'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <ProgressBar
          progress={progress}
          stepText={stepText}
          isComplete={false}
          error={error}
          onRetry={handleConvert}
        />
      )}

      {/* Result Section */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Your PDF is ready!
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Successfully generated <strong>{result.fileName}</strong> from {items.length} image{items.length > 1 ? 's' : ''}.
          </p>

          <div className="mt-4 inline-flex items-center gap-4 rounded-xl bg-white/80 px-4 py-2 text-xs font-mono text-slate-600 shadow-xs dark:bg-slate-900/80 dark:text-slate-300">
            <span>Size: <strong>{formatBytes(result.outputSize)}</strong></span>
            <span>•</span>
            <span>Format: <strong>PDF Document</strong></span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={result.downloadUrl}
              download={result.fileName}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={resetAll}
              className="flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Convert Another File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
