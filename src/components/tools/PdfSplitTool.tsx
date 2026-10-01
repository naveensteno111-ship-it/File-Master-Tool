import React, { useState } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { splitPdf, getPdfPageCount } from '../../services/pdfService';
import { renderPdfThumbnails } from '../../services/pdfToImageService';
import { UploadedFileItem } from '../../types';
import {
  Scissors,
  Download,
  RotateCcw,
  CheckCircle,
  FileText,
  FolderArchive,
  Layers
} from 'lucide-react';

interface PdfSplitToolProps {
  onRecordHistory?: (record: any) => void;
}

export const PdfSplitTool: React.FC<PdfSplitToolProps> = ({ onRecordHistory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<{ pageNumber: number; dataUrl: string }[]>([]);
  const [splitMode, setSplitMode] = useState<'all' | 'range' | 'extract'>('all');
  const [rangeFrom, setRangeFrom] = useState<number>(1);
  const [rangeTo, setRangeTo] = useState<number>(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadUrl: string;
    fileName: string;
    isZip: boolean;
    pageCountExtracted: number;
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
      setRangeFrom(1);
      setRangeTo(Math.min(count, 3));
      setSelectedPages([1]);

      // Async render thumbnails
      renderPdfThumbnails(selected, 16).then((thumbs) => setThumbnails(thumbs));
    } catch (e: any) {
      setError('Unable to parse PDF pages. Please verify the document is not password encrypted.');
    }
  };

  const togglePageSelect = (num: number) => {
    setSelectedPages((prev) =>
      prev.includes(num) ? prev.filter((p) => p !== num) : [...prev, num].sort((a, b) => a - b)
    );
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);
    setStepText('Analyzing pages...');
    setError(null);

    try {
      const splitRes = await splitPdf(
        file,
        splitMode,
        {
          from: rangeFrom,
          to: rangeTo,
          customPages: selectedPages,
        },
        (p, text) => {
          setProgress(p);
          setStepText(text);
        }
      );

      let downloadUrl = '';
      let fileName = '';
      let isZip = false;
      let outputSize = 0;

      if (splitRes.zipBlob) {
        downloadUrl = URL.createObjectURL(splitRes.zipBlob);
        fileName = `${file.name.replace(/\.[^/.]+$/, '')}_pages_split.zip`;
        isZip = true;
        outputSize = splitRes.zipBlob.size;
      } else if (splitRes.singlePdf) {
        downloadUrl = URL.createObjectURL(splitRes.singlePdf);
        fileName = `${file.name.replace(/\.[^/.]+$/, '')}_extracted.pdf`;
        isZip = false;
        outputSize = splitRes.singlePdf.size;
      }

      setResult({
        downloadUrl,
        fileName,
        isZip,
        pageCountExtracted: splitRes.count,
        outputSize,
      });

      setIsProcessing(false);

      onRecordHistory?.({
        toolId: 'pdf-split',
        toolName: 'PDF Split',
        originalFileName: file.name,
        outputFileName: fileName,
        originalSize: file.size,
        outputSize,
        format: isZip ? 'ZIP' : 'PDF',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to split PDF.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (result?.downloadUrl) URL.revokeObjectURL(result.downloadUrl);
    setFile(null);
    setPageCount(0);
    setThumbnails([]);
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
          title="Drag & Drop PDF to Split"
          subtitle="Extract pages, split every page, or cut by range"
        />
      )}

      {file && !result && !isProcessing && (
        <div className="space-y-6">
          {/* File Card info */}
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
                  {formatBytes(file.size)} • {pageCount} total pages
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

          {/* Split Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSplitMode('all')}
              className={`rounded-2xl border p-4 text-left transition ${
                splitMode === 'all'
                  ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
              }`}
            >
              <span className="block font-bold text-sm text-slate-900 dark:text-white">
                Split Every Page
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Save each of the {pageCount} pages as individual PDFs inside a ZIP.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSplitMode('range')}
              className={`rounded-2xl border p-4 text-left transition ${
                splitMode === 'range'
                  ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
              }`}
            >
              <span className="block font-bold text-sm text-slate-900 dark:text-white">
                Split by Page Range
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Extract continuous page intervals (e.g. Page 1 to Page 5).
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSplitMode('extract')}
              className={`rounded-2xl border p-4 text-left transition ${
                splitMode === 'extract'
                  ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
              }`}
            >
              <span className="block font-bold text-sm text-slate-900 dark:text-white">
                Extract Selected Pages
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Click specific page thumbnails to create a custom PDF.
              </span>
            </button>
          </div>

          {/* Range Configuration */}
          {splitMode === 'range' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                Select Page Range
              </span>
              <div className="mt-3 flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">From page:</span>
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-center text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <span className="text-slate-400">to</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">To page:</span>
                  <input
                    type="number"
                    min={rangeFrom}
                    max={pageCount}
                    value={rangeTo}
                    onChange={(e) => setRangeTo(Math.min(pageCount, parseInt(e.target.value) || pageCount))}
                    className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-center text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Thumbnails preview & click selector */}
          {thumbnails.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {splitMode === 'extract' ? 'Click Pages to Include' : 'Page Thumbnails Preview'}
                </span>
                {splitMode === 'extract' && (
                  <span className="text-xs text-blue-600 font-semibold">
                    {selectedPages.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-60 overflow-y-auto p-1">
                {thumbnails.map((thumb) => {
                  const isSelected = selectedPages.includes(thumb.pageNumber);
                  return (
                    <div
                      key={thumb.pageNumber}
                      onClick={() => splitMode === 'extract' && togglePageSelect(thumb.pageNumber)}
                      className={`relative rounded-lg border overflow-hidden p-1 transition cursor-pointer ${
                        splitMode === 'extract' && isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${thumb.pageNumber}`}
                        className="w-full aspect-3/4 object-cover rounded shadow-xs"
                      />
                      <div className="mt-1 text-center font-mono text-[10px] text-slate-500">
                        p. {thumb.pageNumber}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleSplit}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <Scissors className="h-4 w-4" />
              <span>
                {splitMode === 'all'
                  ? `Split All ${pageCount} Pages`
                  : splitMode === 'range'
                  ? `Extract Range (${rangeFrom} - ${rangeTo})`
                  : `Extract ${selectedPages.length} Selected Pages`}
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
          onRetry={handleSplit}
        />
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Split Complete!
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Successfully generated <strong>{result.fileName}</strong> containing {result.pageCountExtracted} page(s).
          </p>

          <div className="mt-4 inline-flex items-center gap-4 rounded-xl bg-white/80 px-4 py-2 text-xs font-mono text-slate-600 shadow-xs dark:bg-slate-900/80 dark:text-slate-300">
            <span>Size: <strong>{formatBytes(result.outputSize)}</strong></span>
            <span>•</span>
            <span>Format: <strong>{result.isZip ? 'ZIP Archive' : 'PDF Document'}</strong></span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={result.downloadUrl}
              download={result.fileName}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              {result.isZip ? <FolderArchive className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              <span>{result.isZip ? 'Download All as ZIP' : 'Download Split PDF'}</span>
            </a>

            <button
              onClick={resetAll}
              className="flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Split Another Document</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
