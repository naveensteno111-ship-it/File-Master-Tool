import React, { useState } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import {
  deletePdfPages,
  rotatePdf,
  watermarkPdf,
  getPdfPageCount
} from '../../services/pdfService';
import { renderPdfThumbnails } from '../../services/pdfToImageService';
import {
  RotateCw,
  Trash2,
  Stamp,
  Copy,
  Download,
  RotateCcw,
  CheckCircle,
  FileText
} from 'lucide-react';

interface PdfPageModifierToolProps {
  mode: 'delete' | 'rotate' | 'watermark' | 'extract';
  title: string;
  onRecordHistory?: (record: any) => void;
}

export const PdfPageModifierTool: React.FC<PdfPageModifierToolProps> = ({
  mode,
  title,
  onRecordHistory,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<{ pageNumber: number; dataUrl: string }[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  // Mode specific options
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadUrl: string;
    fileName: string;
    outputSize: number;
  } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResult(null);

    try {
      const count = await getPdfPageCount(selected);
      setPageCount(count);
      setSelectedPages([]);
      renderPdfThumbnails(selected, 24).then((thumbs) => setThumbnails(thumbs));
    } catch {
      setError('Unable to parse PDF pages. Please verify the document is not password encrypted.');
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setStepText('Processing PDF modifications...');
    setError(null);

    try {
      let modifiedBlob: Blob;
      let outputFileName = '';

      if (mode === 'delete') {
        if (selectedPages.length === 0) {
          throw new Error('Please select at least one page to delete.');
        }
        if (selectedPages.length >= pageCount) {
          throw new Error('Cannot delete all pages in the PDF.');
        }
        modifiedBlob = await deletePdfPages(file, selectedPages, (p, t) => {
          setProgress(p);
          setStepText(t);
        });
        outputFileName = `${file.name.replace(/\.[^/.]+$/, '')}_cleansed.pdf`;
      } else if (mode === 'rotate') {
        const pagesToRotate = selectedPages.length > 0 ? selectedPages : undefined;
        modifiedBlob = await rotatePdf(file, rotationAngle, pagesToRotate, (p, t) => {
          setProgress(p);
          setStepText(t);
        });
        outputFileName = `${file.name.replace(/\.[^/.]+$/, '')}_rotated_${rotationAngle}deg.pdf`;
      } else if (mode === 'watermark') {
        if (!watermarkText.trim()) throw new Error('Please enter watermark text.');
        modifiedBlob = await watermarkPdf(file, watermarkText, { opacity: watermarkOpacity }, (p, t) => {
          setProgress(p);
          setStepText(t);
        });
        outputFileName = `${file.name.replace(/\.[^/.]+$/, '')}_watermarked.pdf`;
      } else {
        throw new Error('Unsupported mode.');
      }

      const downloadUrl = URL.createObjectURL(modifiedBlob);
      setResult({
        downloadUrl,
        fileName: outputFileName,
        outputSize: modifiedBlob.size,
      });

      setIsProcessing(false);

      onRecordHistory?.({
        toolId: `pdf-${mode}`,
        toolName: title,
        originalFileName: file.name,
        outputFileName,
        originalSize: file.size,
        outputSize: modifiedBlob.size,
        format: 'PDF',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Operation failed.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (result?.downloadUrl) URL.revokeObjectURL(result.downloadUrl);
    setFile(null);
    setPageCount(0);
    setThumbnails([]);
    setSelectedPages([]);
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
          acceptedFormats={['.pdf']}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          title={`Upload PDF to ${title}`}
          subtitle="Direct in-browser visual editing"
        />
      )}

      {file && !result && !isProcessing && (
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
                  {formatBytes(file.size)} • {pageCount} pages
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

          {/* Mode Controls */}
          {mode === 'rotate' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">
                Rotation Angle
              </label>
              <div className="flex space-x-3">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotationAngle(deg as any)}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                      rotationAngle === deg
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {deg}° Clockwise
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'watermark' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Transparency / Opacity</span>
                  <span className="font-mono font-bold text-blue-600">{Math.round(watermarkOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
              </div>
            </div>
          )}

          {/* Thumbnail Selection Grid */}
          {thumbnails.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {mode === 'delete'
                    ? 'Click Pages to Remove'
                    : mode === 'rotate'
                    ? 'Click Specific Pages (or leave empty to rotate all)'
                    : 'Pages Preview'}
                </span>
                {selectedPages.length > 0 && (
                  <span className="text-xs text-blue-600 font-semibold">
                    {selectedPages.length} pages selected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-64 overflow-y-auto p-1">
                {thumbnails.map((thumb) => {
                  const isMarked = selectedPages.includes(thumb.pageNumber);
                  return (
                    <div
                      key={thumb.pageNumber}
                      onClick={() => togglePage(thumb.pageNumber)}
                      className={`relative rounded-xl border overflow-hidden p-1 transition cursor-pointer ${
                        mode === 'delete' && isMarked
                          ? 'border-red-500 ring-2 ring-red-500 bg-red-50/60 dark:bg-red-950/40 opacity-60'
                          : isMarked
                          ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${thumb.pageNumber}`}
                        className="w-full aspect-3/4 object-cover rounded"
                      />
                      <div className="mt-1 text-center font-mono text-[10px] text-slate-500">
                        {mode === 'delete' && isMarked ? 'DELETE' : `p. ${thumb.pageNumber}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-end">
            <button
              onClick={handleProcess}
              className={`flex items-center space-x-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition ${
                mode === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
              }`}
            >
              {mode === 'delete' && <Trash2 className="h-4 w-4" />}
              {mode === 'rotate' && <RotateCw className="h-4 w-4" />}
              {mode === 'watermark' && <Stamp className="h-4 w-4" />}
              <span>
                {mode === 'delete'
                  ? `Delete ${selectedPages.length} Selected Page${selectedPages.length === 1 ? '' : 's'}`
                  : mode === 'rotate'
                  ? `Rotate PDF (${rotationAngle}°)`
                  : 'Apply Watermark'}
              </span>
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
          onRetry={handleProcess}
        />
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            PDF Updated Successfully!
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Saved as <strong>{result.fileName}</strong>.
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
              <span>Download Updated PDF</span>
            </a>

            <button
              onClick={resetAll}
              className="flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Process Another File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
