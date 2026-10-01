import React, { useState, useRef, useEffect } from 'react';
import { DropZone } from '../common/DropZone';
import { ProgressBar } from '../common/ProgressBar';
import { cropImage, loadImageFromFile } from '../../services/imageService';
import {
  Crop,
  Download,
  RotateCcw,
  CheckCircle,
  Square,
  Maximize2
} from 'lucide-react';

interface ImageCropperToolProps {
  onRecordHistory?: (record: any) => void;
}

export const ImageCropperTool: React.FC<ImageCropperToolProps> = ({ onRecordHistory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [aspectPreset, setAspectPreset] = useState<'1:1' | '4:3' | '16:9' | 'free'>('1:1');

  // Crop percentage bounds [0..1]
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.8,
  });

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

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResult(null);

    try {
      const img = await loadImageFromFile(selected);
      setImageEl(img);
      applyAspectRatio('1:1', img.naturalWidth, img.naturalHeight);
    } catch {
      setError('Unable to load selected image.');
    }
  };

  const applyAspectRatio = (ratio: '1:1' | '4:3' | '16:9' | 'free', nw?: number, nh?: number) => {
    setAspectPreset(ratio);
    const width = nw || imageEl?.naturalWidth || 800;
    const height = nh || imageEl?.naturalHeight || 600;

    let targetRatio = 1;
    if (ratio === '1:1') targetRatio = 1;
    else if (ratio === '4:3') targetRatio = 4 / 3;
    else if (ratio === '16:9') targetRatio = 16 / 9;
    else {
      setCropBox({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
      return;
    }

    const imgAspect = width / height;
    let boxW = 0.8;
    let boxH = 0.8;

    if (imgAspect > targetRatio) {
      boxH = 0.8;
      boxW = (boxH * targetRatio) / imgAspect;
    } else {
      boxW = 0.8;
      boxH = boxW / (targetRatio * imgAspect);
    }

    setCropBox({
      x: (1 - boxW) / 2,
      y: (1 - boxH) / 2,
      w: boxW,
      h: boxH,
    });
  };

  const handleCrop = async () => {
    if (!file || !imageEl) return;

    setIsProcessing(true);
    setProgress(35);
    setStepText('Cropping selection...');
    setError(null);

    try {
      const nw = imageEl.naturalWidth;
      const nh = imageEl.naturalHeight;

      const cropArea = {
        x: Math.round(cropBox.x * nw),
        y: Math.round(cropBox.y * nh),
        width: Math.max(10, Math.round(cropBox.w * nw)),
        height: Math.max(10, Math.round(cropBox.h * nh)),
      };

      const format = (file.type as any) || 'image/jpeg';
      const croppedBlob = await cropImage(file, cropArea, format);

      const downloadUrl = URL.createObjectURL(croppedBlob);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_cropped.${ext}`;

      setResult({
        downloadUrl,
        fileName,
        outputSize: croppedBlob.size,
        width: cropArea.width,
        height: cropArea.height,
      });

      setIsProcessing(false);

      onRecordHistory?.({
        toolId: 'image-cropper',
        toolName: 'Image Cropper',
        originalFileName: file.name,
        outputFileName: fileName,
        originalSize: file.size,
        outputSize: croppedBlob.size,
        format: ext.toUpperCase(),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image cropping failed.');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (result?.downloadUrl) URL.revokeObjectURL(result.downloadUrl);
    setFile(null);
    setImageEl(null);
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
          title="Drag & Drop image to crop"
          subtitle="Square, widescreen, custom crop"
        />
      )}

      {file && imageEl && !result && !isProcessing && (
        <div className="space-y-6">
          {/* Header controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Adjust Crop Area
              </h4>
              <p className="text-xs text-slate-500">
                Select an aspect ratio preset or adjust the crop box
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center space-x-1.5">
              {(['1:1', '4:3', '16:9', 'free'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => applyAspectRatio(ratio)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    aspectPreset === ratio
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {ratio === 'free' ? 'Freeform' : ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive visual canvas representation */}
          <div
            ref={containerRef}
            className="relative mx-auto flex max-h-[460px] items-center justify-center overflow-hidden rounded-2xl bg-slate-900/90 p-4"
          >
            <div className="relative inline-block">
              <img
                src={imageEl.src}
                alt="Source preview"
                className="max-h-[420px] max-w-full object-contain block select-none pointer-events-none"
              />

              {/* Crop box overlay */}
              <div
                className="absolute border-2 border-white shadow-2xl ring-1 ring-black/40 bg-blue-500/10"
                style={{
                  left: `${cropBox.x * 100}%`,
                  top: `${cropBox.y * 100}%`,
                  width: `${cropBox.w * 100}%`,
                  height: `${cropBox.h * 100}%`,
                }}
              >
                {/* 3x3 Rule of Thirds Grid */}
                <div className="h-full w-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-b border-white border-dashed"></div>
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-b border-white border-dashed"></div>
                  <div className="border-r border-white border-dashed"></div>
                  <div className="border-r border-white border-dashed"></div>
                  <div></div>
                </div>

                {/* Corner markers */}
                <span className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 bg-blue-500 border border-white rounded-xs"></span>
                <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-blue-500 border border-white rounded-xs"></span>
                <span className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 bg-blue-500 border border-white rounded-xs"></span>
                <span className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 bg-blue-500 border border-white rounded-xs"></span>
              </div>
            </div>
          </div>

          {/* Quick Adjustment Slider for Box Size */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Crop Window Zoom</span>
              <span className="font-mono text-blue-600">{Math.round(cropBox.w * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={cropBox.w}
              onChange={(e) => {
                const newW = parseFloat(e.target.value);
                const ratio = cropBox.h / cropBox.w;
                const newH = Math.min(1.0, newW * ratio);
                setCropBox({
                  x: (1 - newW) / 2,
                  y: (1 - newH) / 2,
                  w: newW,
                  h: newH,
                });
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
            />
          </div>

          {/* Action */}
          <div className="flex justify-between items-center">
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400"
            >
              Choose different image
            </button>

            <button
              onClick={handleCrop}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <Crop className="h-4 w-4" />
              <span>Apply Crop & Export</span>
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
          onRetry={handleCrop}
        />
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Image Cropped Successfully!
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Exported dimensions: <strong>{result.width} × {result.height} px</strong>
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
              <span>Download Cropped Image</span>
            </a>

            <button
              onClick={resetAll}
              className="flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Crop Another Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
