import React, { useState } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { convertPdfToImages, ConvertedPageImage } from '../../services/pdfToImageService';
import {
  Download,
  FolderArchive,
  RotateCcw,
  CheckCircle,
  FileSpreadsheet,
  Settings,
  Eye,
  FileText
} from 'lucide-react';

interface PdfToJpgToolProps {
  format?: 'image/jpeg' | 'image/png';
  title?: string;
  onRecordHistory?: (record: any) => void;
}

export const PdfToJpgTool: React.FC<PdfToJpgToolProps> = ({
  format = 'image/jpeg',
  title = 'PDF to JPG Converter',
  onRecordHistory,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.92);
  const [scale, setScale] = useState<number>(2.0); // 2.0 = crisp 150-200 DPI

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [convertedPages, setConvertedPages] = useState<ConvertedPageImage[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState<number>(0);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(5);
    setStepText('Reading PDF content...');
    setError(null);

    try {
      const res = await convertPdfToImages(
        file,
        {
          format,
          quality,
          scale,
        },
        (p, text) => {
          setProgress(p);
          setStepText(text);
        }
      );

      const zipDownloadUrl = URL.createObjectURL(res.zipBlob);
      setConvertedPages(res.pages);
      setZipUrl(zipDownloadUrl);
      setZipSize(res.zipBlob.size);
      setIsProcessing(false);

      const ext = format === 'image/png' ? 'png' : 'jpg';
      onRecordHistory?.({
        toolId: format === 'image/png' ? 'pdf-to-png' : 'pdf-to-jpg',
        toolName: format === 'image/png' ? 'PDF to PNG' : 'PDF to JPG',
        originalFileName: file.name,
        outputFileName: `${file.name.replace(/\.[^/.]+$/, '')}_images.zip`,
        originalSize: file.size,
        outputSize: res.zipBlob.size,
        format: ext.toUpperCase(),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to render PDF to images.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setFile(null);
    setConvertedPages([]);
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

  const ext = format === 'image/png' ? 'png' : 'jpg';

  return (
    <div className="space-y-6">
      {!file && convertedPages.length === 0 && (
        <DropZone
          acceptedFormats={['.pdf']}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          title={`Drag & Drop PDF to convert to ${ext.toUpperCase()}`}
          subtitle="Extract high-resolution image pages from PDF"
        />
      )}

      {file && convertedPages.length === 0 && !isProcessing && (
        <div className="space-y-6">
          {/* File Card */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center space-x-3 truncate">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="truncate">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                  {file.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400"
            >
              Replace
            </button>
          </div>

          {/* Settings Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Settings className="h-4 w-4" />
              <span>Image Output Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quality slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Image Quality
                  </label>
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Standard (50%)</span>
                  <span>Maximum (100%)</span>
                </div>
              </div>

              {/* Resolution / DPI */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Resolution Density (DPI)
                </label>
                <select
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value={1.5}>Medium (150 DPI - Compact file size)</option>
                  <option value={2.0}>High (200 DPI - Optimal clarity)</option>
                  <option value={3.0}>Ultra High (300 DPI - Print quality)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleConvert}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Convert PDF to {ext.toUpperCase()}</span>
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

      {/* Results grid */}
      {convertedPages.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Extracted {convertedPages.length} {ext.toUpperCase()} Pages</span>
              </h3>
              <p className="text-xs text-slate-500">
                Download individual pages or download all together in a single ZIP file.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {zipUrl && (
                <a
                  href={zipUrl}
                  download={`${file?.name.replace(/\.[^/.]+$/, '')}_all_pages.zip`}
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
                Convert Another
              </button>
            </div>
          </div>

          {/* Grid of pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {convertedPages.map((page) => (
              <div
                key={page.pageNumber}
                className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute top-1.5 left-1.5 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                    Page {page.pageNumber}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {formatBytes(page.blob.size)}
                  </span>
                  <a
                    href={page.dataUrl}
                    download={`${file?.name.replace(/\.[^/.]+$/, '')}_page_${page.pageNumber}.${ext}`}
                    className="flex items-center space-x-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400"
                    title={`Download Page ${page.pageNumber}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
