import React, { useState } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { compressImage, CompressOptions } from '../../services/imageService';
import {
  Download,
  RotateCcw,
  CheckCircle,
  Minimize2,
  Sliders,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';

interface ImageCompressorToolProps {
  onRecordHistory?: (record: any) => void;
}

export const ImageCompressorTool: React.FC<ImageCompressorToolProps> = ({ onRecordHistory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [level, setLevel] = useState<'low' | 'medium' | 'high' | 'custom'>('medium');
  const [customQuality, setCustomQuality] = useState<number>(0.65);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<{
    downloadUrl: string;
    fileName: string;
    originalSize: number;
    compressedSize: number;
    savedSize: number;
    savingsPercentage: number;
  } | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(15);
    setStepText('Analyzing image pixels...');
    setError(null);

    try {
      const options: CompressOptions = {
        level,
        customQuality: level === 'custom' ? customQuality : undefined,
      };

      setProgress(50);
      setStepText('Applying quantization and size reduction...');

      const cmpRes = await compressImage(file, options);

      const downloadUrl = URL.createObjectURL(cmpRes.blob);
      const savedBytes = Math.max(0, cmpRes.originalSize - cmpRes.compressedSize);
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_compressed.${file.name.split('.').pop()}`;

      setResult({
        downloadUrl,
        fileName,
        originalSize: cmpRes.originalSize,
        compressedSize: cmpRes.compressedSize,
        savedSize: savedBytes,
        savingsPercentage: cmpRes.savingsPercentage,
      });

      setIsProcessing(false);

      onRecordHistory?.({
        toolId: 'image-compressor',
        toolName: 'Image Compressor',
        originalFileName: file.name,
        outputFileName: fileName,
        originalSize: cmpRes.originalSize,
        outputSize: cmpRes.compressedSize,
        format: file.name.split('.').pop()?.toUpperCase() || 'IMG',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image compression failed.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result?.downloadUrl) URL.revokeObjectURL(result.downloadUrl);
    setFile(null);
    setPreviewUrl(null);
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
      {!file && !result && (
        <DropZone
          acceptedFormats={['.jpg', '.jpeg', '.png', '.webp']}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          title="Drag & Drop image to compress"
          subtitle="Supports JPG, JPEG, PNG, and WEBP formats"
        />
      )}

      {file && !result && !isProcessing && (
        <div className="space-y-6">
          {/* File Card & Preview */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center space-x-4 min-w-0 w-full sm:w-auto">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                />
              )}
              <div className="min-w-0 truncate">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                  {file.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Original Size: <strong className="text-slate-700 dark:text-slate-300">{formatBytes(file.size)}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 self-end sm:self-center"
            >
              Choose different file
            </button>
          </div>

          {/* Compression Level Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Compression Level
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Low */}
              <button
                type="button"
                onClick={() => setLevel('low')}
                className={`rounded-2xl border p-4 text-left transition ${
                  level === 'low'
                    ? 'border-blue-600 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Low</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    ~15% saved
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Best quality, mild file reduction.
                </p>
              </button>

              {/* Medium */}
              <button
                type="button"
                onClick={() => setLevel('medium')}
                className={`rounded-2xl border p-4 text-left transition ${
                  level === 'medium'
                    ? 'border-blue-600 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Medium</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Recommended
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Great balance of size and visual clarity (~50% saved).
                </p>
              </button>

              {/* High */}
              <button
                type="button"
                onClick={() => setLevel('high')}
                className={`rounded-2xl border p-4 text-left transition ${
                  level === 'high'
                    ? 'border-blue-600 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">High</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Max Savings
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Smallest possible file size (~70%+ saved).
                </p>
              </button>

              {/* Custom */}
              <button
                type="button"
                onClick={() => setLevel('custom')}
                className={`rounded-2xl border p-4 text-left transition ${
                  level === 'custom'
                    ? 'border-blue-600 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Custom</span>
                  <Sliders className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Fine-tune custom quality slider.
                </p>
              </button>
            </div>

            {level === 'custom' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 mt-3">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Custom Quality</span>
                  <span className="font-mono text-blue-600">{Math.round(customQuality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={customQuality}
                  onChange={(e) => setCustomQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
              </div>
            )}
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleCompress}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Compress Image Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          progress={progress}
          stepText={stepText}
          isComplete={false}
          error={error}
          onRetry={handleCompress}
        />
      )}

      {/* Result Section displaying Original, Compressed, Saved, Percentage */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Compression Successful!
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Your image has been optimized and compressed.
            </p>
          </div>

          {/* Stats Box (Required in prompt Section 7) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400">Original Size</span>
              <p className="mt-1 font-mono text-base font-bold text-slate-800 dark:text-slate-100">
                {formatBytes(result.originalSize)}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-300 bg-white p-3 text-center dark:border-emerald-800 dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Compressed Size</span>
              <p className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatBytes(result.compressedSize)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400">Saved Size</span>
              <p className="mt-1 font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                {formatBytes(result.savedSize)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400">Compression</span>
              <p className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                {result.savingsPercentage}%
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={result.downloadUrl}
              download={result.fileName}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>Download Compressed File</span>
            </a>

            <button
              onClick={resetAll}
              className="flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Compress Another Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
