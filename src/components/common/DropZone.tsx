import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, AlertCircle, Plus } from 'lucide-react';

interface DropZoneProps {
  acceptedFormats: string[]; // e.g. ['.jpg', '.png', '.pdf']
  maxFiles?: number;
  maxSizeBytes?: number; // default 50MB
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  acceptedFormats,
  maxFiles = 30,
  maxSizeBytes = 50 * 1024 * 1024,
  onFilesSelected,
  title = 'Drag & Drop your files here',
  subtitle = 'or browse from your device',
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const rawFiles = Array.from(fileList);
    const validFiles: File[] = [];

    // Check dangerous executables
    const dangerousExts = ['.exe', '.bat', '.cmd', '.sh', '.bin', '.vbs', '.msi', '.com'];

    for (const file of rawFiles) {
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();

      if (dangerousExts.includes(ext)) {
        setErrorMessage('Executable and script file uploads are strictly prohibited.');
        return;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(`File "${file.name}" exceeds the maximum allowed size limit (${Math.round(maxSizeBytes / (1024 * 1024))} MB).`);
        return;
      }

      // Check accepted formats if specified
      if (acceptedFormats.length > 0 && !acceptedFormats.includes('*')) {
        const matchesExt = acceptedFormats.some((fmt) => fmt.toLowerCase() === ext);
        const matchesMime = acceptedFormats.some((fmt) => {
          if (fmt === '.jpg' || fmt === '.jpeg') return file.type === 'image/jpeg';
          if (fmt === '.png') return file.type === 'image/png';
          if (fmt === '.webp') return file.type === 'image/webp';
          if (fmt === '.pdf') return file.type === 'application/pdf';
          return false;
        });

        if (!matchesExt && !matchesMime) {
          setErrorMessage(`"${file.name}" is an unsupported file type. Accepted: ${acceptedFormats.join(', ')}`);
          return;
        }
      }

      validFiles.push(file);
    }

    if (validFiles.length > maxFiles) {
      setErrorMessage(`Maximum allowed files for this batch is ${maxFiles}. Uploading the first ${maxFiles}.`);
      onFilesSelected(validFiles.slice(0, maxFiles));
    } else if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formattedFormats = acceptedFormats
    .map((fmt) => fmt.replace('.', '').toUpperCase())
    .join(', ');

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          compact ? 'p-6' : 'p-10 sm:p-14'
        } ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/80 scale-[1.01] dark:border-blue-400 dark:bg-blue-950/40 shadow-lg shadow-blue-500/10'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedFormats.join(',')}
          className="hidden"
          onChange={(e) => validateAndAddFiles(e.target.files)}
        />

        {/* Animated Icon Box */}
        <div
          className={`flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
            compact ? 'h-12 w-12 mb-3' : 'h-16 w-16 mb-4'
          } ${
            isDragOver
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
              : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
          }`}
        >
          {compact ? <Plus className="h-6 w-6" /> : <UploadCloud className="h-8 w-8" />}
        </div>

        {/* Headings */}
        <h3 className={`font-bold text-slate-800 dark:text-slate-100 ${compact ? 'text-base' : 'text-xl'}`}>
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>

        {/* CTA Button */}
        <div className="mt-4">
          <span className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
            Choose File{maxFiles > 1 ? 's' : ''}
          </span>
        </div>

        {/* Supported formats pills */}
        {formattedFormats && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-medium">Supported:</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {formattedFormats}
            </span>
            <span className="text-slate-400 dark:text-slate-600">• Max 50 MB</span>
          </div>
        )}
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mt-3 flex items-start space-x-2 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
