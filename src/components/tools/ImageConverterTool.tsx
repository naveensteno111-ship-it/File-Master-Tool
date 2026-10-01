import React, { useState } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { convertImageFormat } from '../../services/imageService';
import { UploadedFileItem } from '../../types';
import JSZip from 'jszip';
import {
  Download,
  FolderArchive,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';

interface ImageConverterToolProps {
  sourceExt: string; // e.g. 'jpg', 'png', 'webp'
  targetExt: 'jpg' | 'png' | 'webp';
  toolId: string;
  toolName: string;
  onRecordHistory?: (record: any) => void;
}

export const ImageConverterTool: React.FC<ImageConverterToolProps> = ({
  sourceExt,
  targetExt,
  toolId,
  toolName,
  onRecordHistory,
}) => {
  const [items, setItems] = useState<UploadedFileItem[]>([]);
  const [quality, setQuality] = useState<number>(0.92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [convertedResults, setConvertedResults] = useState<{
    id: string;
    originalName: string;
    outputName: string;
    downloadUrl: string;
    blob: Blob;
    previewUrl: string;
    originalSize: number;
    outputSize: number;
  }[]>([]);

  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState<number>(0);

  const getTargetMime = (): 'image/jpeg' | 'image/png' | 'image/webp' => {
    switch (targetExt) {
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      default: return 'image/jpeg';
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const newItems: UploadedFileItem[] = files.map((file) => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

  const handleConvert = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setStepText(`Converting ${items.length} images to ${targetExt.toUpperCase()}...`);
    setError(null);

    try {
      const targetMime = getTargetMime();
      const results = [];
      const zip = new JSZip();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const progressVal = 10 + Math.round((i / items.length) * 80);
        setProgress(progressVal);
        setStepText(`Converting ${item.name} (${i + 1} of ${items.length})...`);

        const convertedBlob = await convertImageFormat(item.file, targetMime, quality);
        const outputName = `${item.name.replace(/\.[^/.]+$/, '')}.${targetExt}`;
        const downloadUrl = URL.createObjectURL(convertedBlob);

        results.push({
          id: item.id,
          originalName: item.name,
          outputName,
          downloadUrl,
          blob: convertedBlob,
          previewUrl: downloadUrl,
          originalSize: item.size,
          outputSize: convertedBlob.size,
        });

        zip.file(outputName, convertedBlob);
      }

      setConvertedResults(results);

      if (results.length > 1) {
        setProgress(95);
        setStepText('Creating ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setZipUrl(URL.createObjectURL(zipBlob));
        setZipSize(zipBlob.size);
      }

      setIsProcessing(false);

      const totalOriginalSize = items.reduce((acc, f) => acc + f.size, 0);
      const totalOutputSize = results.reduce((acc, r) => acc + r.outputSize, 0);

      onRecordHistory?.({
        toolId,
        toolName,
        originalFileName: items.length === 1 ? items[0].name : `${items.length} files`,
        outputFileName: items.length === 1 ? results[0].outputName : `converted_${targetExt}.zip`,
        originalSize: totalOriginalSize,
        outputSize: totalOutputSize,
        format: targetExt.toUpperCase(),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image conversion failed.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    convertedResults.forEach((res) => {
      if (res.downloadUrl) URL.revokeObjectURL(res.downloadUrl);
    });
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setItems([]);
    setConvertedResults([]);
    setZipUrl(null);
    setZipSize(0);
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
      {items.length === 0 && convertedResults.length === 0 && (
        <DropZone
          acceptedFormats={sourceExt === '*' ? ['*'] : [`.${sourceExt}`, `.${sourceExt === 'jpg' ? 'jpeg' : ''}`]}
          maxFiles={20}
          onFilesSelected={handleFilesSelected}
          title={`Drag & Drop images to convert to ${targetExt.toUpperCase()}`}
          subtitle="Instant browser-side image re-encoding"
        />
      )}

      {items.length > 0 && convertedResults.length === 0 && !isProcessing && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                Selected Images ({items.length})
              </h3>
              <p className="text-xs text-slate-500">
                Will be converted directly to <strong>.{targetExt}</strong>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer inline-flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <Plus className="h-3.5 w-3.5" />
                <span>Add More</span>
                <input
                  type="file"
                  multiple
                  accept={sourceExt === '*' ? 'image/*' : `.${sourceExt}`}
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

          {/* Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-2 truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {formatBytes(item.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(item.id)}
                  className="absolute top-3 right-3 rounded-md bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Quality slider for lossy formats */}
          {(targetExt === 'jpg' || targetExt === 'webp') && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Output Quality ({targetExt.toUpperCase()})</span>
                <span className="font-mono font-bold text-blue-600">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleConvert}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Convert to {targetExt.toUpperCase()}</span>
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
          onRetry={handleConvert}
        />
      )}

      {/* Results */}
      {convertedResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Conversion Complete ({convertedResults.length} files)</span>
              </h3>
              <p className="text-xs text-slate-500">
                All files encoded into <strong>.{targetExt}</strong> successfully.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {zipUrl && (
                <a
                  href={zipUrl}
                  download={`converted_${targetExt}_files.zip`}
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  <FolderArchive className="h-4 w-4" />
                  <span>Download All as ZIP ({formatBytes(zipSize)})</span>
                </a>
              )}
              <button
                onClick={resetAll}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Convert More
              </button>
            </div>
          </div>

          {/* Result items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {convertedResults.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={res.previewUrl}
                    alt={res.outputName}
                    className="h-12 w-12 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {res.outputName}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                      <span>{formatBytes(res.outputSize)}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={res.downloadUrl}
                  download={res.outputName}
                  className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 shrink-0 ml-2"
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
