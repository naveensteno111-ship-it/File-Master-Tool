import React, { useState, useEffect } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { resizeImage, loadImageFromFile } from '../../services/imageService';
import {
  Maximize2,
  Lock,
  Unlock,
  Download,
  RotateCcw,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';

interface ImageResizerToolProps {
  onRecordHistory?: (record: any) => void;
}

export const ImageResizerTool: React.FC<ImageResizerToolProps> = ({ onRecordHistory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<{
    downloadUrl: string;
    fileName: string;
    outputSize: number;
    width: number;
    height: number;
  } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);

    try {
      const img = await loadImageFromFile(selected);
      setOriginalDims({ width: img.naturalWidth, height: img.naturalHeight });
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
    } catch {
      setError('Unable to load image dimensions.');
    }
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspect && originalDims.width > 0) {
      const ratio = originalDims.height / originalDims.width;
      setTargetHeight(Math.round(w * ratio));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspect && originalDims.height > 0) {
      const ratio = originalDims.width / originalDims.height;
      setTargetWidth(Math.round(h * ratio));
    }
  };

  const applyPreset = (percent: number) => {
    const w = Math.round((originalDims.width * percent) / 100);
    const h = Math.round((originalDims.height * percent) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleResize = async () => {
    if (!file || targetWidth <= 0 || targetHeight <= 0) return;

    setIsProcessing(true);
    setProgress(30);
    setStepText('Interpolating pixels to new resolution...');
    setError(null);

    try {
      const resizedBlob = await resizeImage(file, {
        width: targetWidth,
        height: targetHeight,
        maintainAspectRatio: lockAspect,
      });

      const downloadUrl = URL.createObjectURL(resizedBlob);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_${targetWidth}x${targetHeight}.${ext}`;

      setResult({
        downloadUrl,
        fileName,
        outputSize: resizedBlob.size,
        width: targetWidth,
        height: targetHeight,
      });

      setIsProcessing(false);

      onRecordHistory?.({
        toolId: 'image-resizer',
        toolName: 'Image Resizer',
        originalFileName: file.name,
        outputFileName: fileName,
        originalSize: file.size,
        outputSize: resizedBlob.size,
        format: ext.toUpperCase(),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image resizing failed.');
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
          title="Drag & Drop image to resize"
          subtitle="Change pixel dimensions or scale percentage"
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
                  Original: {originalDims.width} × {originalDims.height} px • {formatBytes(file.size)}
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

          {/* Quick scale presets */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Scale Percentage Presets
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyPreset(pct)}
                  className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimension Inputs */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Exact Dimensions (Pixels)
              </span>
              <button
                type="button"
                onClick={() => setLockAspect(!lockAspect)}
                className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  lockAspect
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {lockAspect ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                <span>{lockAspect ? 'Aspect Ratio Locked' : 'Freeform Ratio'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleResize}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Resize to {targetWidth} × {targetHeight} px</span>
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
          onRetry={handleResize}
        />
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Image Resized Successfully!
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            New dimensions: <strong>{result.width} × {result.height} px</strong>
          </p>

          <div className="mt-4 inline-flex items-center gap-4 rounded-xl bg-white/80 px-4 py-2 text-xs font-mono text-slate-600 shadow-xs dark:bg-slate-900/80 dark:text-slate-300">
            <span>Size: <strong>{formatBytes(result.outputSize)}</strong></span>
            <span>•</span>
            <span>Output: <strong>{result.fileName}</strong></span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={result.downloadUrl}
              download={result.fileName}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>Download Resized Image</span>
            </a>

            <button
              onClick={resetAll}
              className="flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resize Another Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
