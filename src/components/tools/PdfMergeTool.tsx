import React, { useState } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { mergePdfs, getPdfPageCount } from '../../services/pdfService';
import { UploadedFileItem, ConversionResult } from '../../types';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  FileText,
  Download,
  RotateCcw,
  CheckCircle,
  Plus,
  Layers
} from 'lucide-react';

interface PdfMergeToolProps {
  onRecordHistory?: (record: any) => void;
}

export const PdfMergeTool: React.FC<PdfMergeToolProps> = ({ onRecordHistory }) => {
  const [items, setItems] = useState<UploadedFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    const newItems: UploadedFileItem[] = [];
    for (const file of files) {
      let pageCount: number | undefined;
      try {
        pageCount = await getPdfPageCount(file);
      } catch {
        pageCount = undefined;
      }
      newItems.push({
        id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        pageCount,
      });
    }
    setItems((prev) => [...prev, ...newItems]);
    setError(null);
  };

  const removeFile = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

  const handleMerge = async () => {
    if (items.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStepText('Reading PDF documents...');
    setError(null);

    try {
      const files = items.map((i) => i.file);
      const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

      const mergedBlob = await mergePdfs(files, (p, text) => {
        setProgress(p);
        setStepText(text);
      });

      const downloadUrl = URL.createObjectURL(mergedBlob);
      const outputFileName = `filemaster_merged_${Date.now()}.pdf`;

      const conversionRes: ConversionResult = {
        fileName: outputFileName,
        blob: mergedBlob,
        downloadUrl,
        originalSize: totalOriginalSize,
        outputSize: mergedBlob.size,
        format: 'PDF',
      };

      setResult(conversionRes);
      setIsProcessing(false);

      onRecordHistory?.({
        toolId: 'pdf-merge',
        toolName: 'PDF Merge',
        originalFileName: `${items.length} PDF files`,
        outputFileName,
        originalSize: totalOriginalSize,
        outputSize: mergedBlob.size,
        format: 'PDF',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to merge PDF files.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
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
      {items.length === 0 && !result && (
        <DropZone
          acceptedFormats={['.pdf']}
          maxFiles={20}
          onFilesSelected={handleFilesSelected}
          title="Drag & Drop PDF files to merge"
          subtitle="Select 2 or more PDFs to combine into one"
        />
      )}

      {items.length > 0 && !result && !isProcessing && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                PDF Documents to Merge ({items.length})
              </h3>
              <p className="text-xs text-slate-500">
                Reorder the sequence below. The merged document will match this exact order.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer inline-flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <Plus className="h-3.5 w-3.5" />
                <span>Add More PDFs</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
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

          {/* List of PDFs to merge */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:px-4 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-bold text-xs">
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                      <span>{formatBytes(item.size)}</span>
                      {item.pageCount && (
                        <span>• {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-3">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="rounded p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="rounded p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="rounded p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length < 2 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              * Please add at least 1 more PDF file to activate the merge action.
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleMerge}
              disabled={items.length < 2}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition"
            >
              <Layers className="h-4 w-4" />
              <span>Merge {items.length} PDF Files</span>
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
          onRetry={handleMerge}
        />
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            PDF files merged successfully!
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Combined {items.length} files into <strong>{result.fileName}</strong>.
          </p>

          <div className="mt-4 inline-flex items-center gap-4 rounded-xl bg-white/80 px-4 py-2 text-xs font-mono text-slate-600 shadow-xs dark:bg-slate-900/80 dark:text-slate-300">
            <span>Merged Size: <strong>{formatBytes(result.outputSize)}</strong></span>
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
              <span>Download Merged PDF</span>
            </a>

            <button
              onClick={resetAll}
              className="flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Merge More PDFs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
