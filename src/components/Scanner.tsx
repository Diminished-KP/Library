import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, Keyboard, AlertCircle, Layers, Scan, CheckCircle2, BookPlus, Loader2, Check, FileText, Barcode } from 'lucide-react';

import type { Library } from '../types/book';
import type { Translations, Language } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { recognizeIsbnsFromImage } from '../services/ocrService';
import { IsbnSelectionModal } from './IsbnSelectionModal';

export type ScanInputType = 'barcode' | 'text';

interface ScannerProps {
  isBatchMode: boolean;
  onToggleBatchMode: (isBatch: boolean) => void;
  batchCount: number;
  onScanSuccess: (decodedText: string) => Promise<boolean | void> | void;
  onOpenManualEntry: () => void;
  onOpenManualEntryNoIsbn?: () => void;
  onFinishBatch: () => void;
  resumeTrigger?: number;
  isProcessing?: boolean;
  showSuccessCheck?: boolean;
  libraries: Library[];
  selectedLibraryId: string;
  onSelectLibrary: (id: string) => void;
  t: Translations;
  currentLanguage?: Language;
  currentTheme?: ThemeId;
}

export const ScannerComponent: React.FC<ScannerProps> = ({
  isBatchMode,
  onToggleBatchMode,
  batchCount,
  onScanSuccess,
  onOpenManualEntry,
  onOpenManualEntryNoIsbn,
  onFinishBatch,
  resumeTrigger,
  isProcessing = false,
  showSuccessCheck = false,
  libraries,
  selectedLibraryId,
  onSelectLibrary,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  const [scanType, setScanType] = useState<ScanInputType>('barcode');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [detectedIsbns, setDetectedIsbns] = useState<string[]>([]);
  const [isIsbnSelectionOpen, setIsIsbnSelectionOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'reader';

  const scanTypeRef = useRef<ScanInputType>(scanType);
  const isBatchModeRef = useRef<boolean>(isBatchMode);
  const isProcessingRef = useRef<boolean>(isProcessing);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    scanTypeRef.current = scanType;
  }, [scanType]);

  useEffect(() => {
    isBatchModeRef.current = isBatchMode;
  }, [isBatchMode]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  // Handle resume if scanner was paused in single mode
  useEffect(() => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.getState() === Html5QrcodeScannerState.PAUSED) {
          scannerRef.current.resume();
        }
      } catch (e) {
        console.error('Error resuming scanner:', e);
      }
    }
  }, [resumeTrigger]);

  useEffect(() => {
    let isMounted = true;

    const stopAndClearScanner = async (scanner: Html5Qrcode | null) => {
      if (!scanner) return;
      try {
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scanner.stop();
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        try {
          scanner.clear();
        } catch (clearErr) {
          console.error('Error clearing scanner:', clearErr);
        }
      }
    };

    const startScanner = async () => {
      try {
        setError(null);
        const html5Qrcode = new Html5Qrcode(regionId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });

        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isMounted) return;

            // If in text OCR mode, ignore continuous barcode detection
            if (scanTypeRef.current === 'text') {
              return;
            }

            // If scanner is currently processing a book or waiting on cooldown, ignore incoming scans
            if (isProcessingRef.current) {
              return;
            }

            if (isBatchModeRef.current) {
              onScanSuccessRef.current(decodedText);
            } else {
              try {
                if (html5Qrcode.getState() === Html5QrcodeScannerState.SCANNING) {
                  html5Qrcode.pause(true);
                }
              } catch (e) {
                console.error('Error pausing scanner:', e);
              }
              onScanSuccessRef.current(decodedText);
            }
          },
          () => {
            // Ignore decode error frames
          }
        );

        if (!isMounted) {
          await stopAndClearScanner(html5Qrcode);
          return;
        }

        setIsScanning(true);
      } catch (err) {
        console.error('Failed to start scanner:', err);
        if (isMounted) {
          setError(t.cameraError);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        stopAndClearScanner(scanner);
      }
    };
  }, [onScanSuccess, t.cameraError]);

  const handleCaptureTextIsbn = async () => {
    if (isProcessing || isOcrProcessing) return;

    // Grab frame from video element inside container
    const container = document.getElementById(regionId);
    const video = container?.querySelector('video');

    if (!video) {
      // Fallback: directly open modal with manual input if video element not found
      setDetectedIsbns([]);
      setIsIsbnSelectionOpen(true);
      return;
    }

    try {
      setIsOcrProcessing(true);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const { isbns } = await recognizeIsbnsFromImage(canvas);
      setDetectedIsbns(isbns);
      setIsIsbnSelectionOpen(true);
    } catch (err) {
      console.error('Error during text ISBN capture:', err);
      setDetectedIsbns([]);
      setIsIsbnSelectionOpen(true);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleConfirmSelectedIsbn = (isbn: string) => {
    setIsIsbnSelectionOpen(false);
    onScanSuccess(isbn);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Target Library Selector Dropdown */}
      <div className={`w-full mb-4 ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md`}>
        <label htmlFor="library-select" className={`text-xs font-semibold ${activeThemeConfig.textSecondaryClass} flex items-center gap-2`}>
          <span>{t.addToLibraryLabel}</span>
        </label>
        <select
          id="library-select"
          value={selectedLibraryId}
          onChange={(e) => onSelectLibrary(e.target.value)}
          className={`w-full sm:w-auto flex-1 ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.accentClass} font-semibold text-xs rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer`}
        >
          {libraries.map((lib) => (
            <option key={lib.id} value={lib.id}>
              {lib.name}
            </option>
          ))}
        </select>
      </div>

      {/* Target input mode toggle (Možnost A: Barcode vs Text ISBN) */}
      <div className={`w-full ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} p-1.5 rounded-2xl flex gap-1 mb-3 shadow-md`}>
        <button
          type="button"
          onClick={() => setScanType('barcode')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            scanType === 'barcode'
              ? `${activeThemeConfig.buttonPrimaryClass} shadow-md`
              : `${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass}`
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>{t.barcodeScannerTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setScanType('text')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            scanType === 'text'
              ? `${activeThemeConfig.buttonPrimaryClass} shadow-md`
              : `${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass}`
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t.textIsbnScannerTab}</span>
        </button>
      </div>

      {/* Single vs Batch selector toggle */}
      <div className={`w-full ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} p-1.5 rounded-2xl flex gap-1 mb-4 shadow-md`}>
        <button
          onClick={() => onToggleBatchMode(false)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            !isBatchMode
              ? `${activeThemeConfig.buttonPrimaryClass} shadow-md`
              : `${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass}`
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>{t.singleScanning}</span>
        </button>

        <button
          onClick={() => onToggleBatchMode(true)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            isBatchMode
              ? `${activeThemeConfig.buttonPrimaryClass} shadow-md`
              : `${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass}`
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.batchScanning}</span>
        </button>
      </div>

      {/* Batch mode banner */}
      {isBatchMode && (
        <div className={`w-full mb-3 ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-medium ${activeThemeConfig.textPrimaryClass} animate-in fade-in`}>
          <div className="flex items-center gap-2">
            <Layers className={`w-4 h-4 ${activeThemeConfig.accentClass} animate-pulse`} />
            <span>{t.batchMode}</span>
          </div>
          <span className={`bg-black/20 border ${activeThemeConfig.borderClass} ${activeThemeConfig.accentClass} px-2.5 py-0.5 rounded-full font-bold`}>
            {batchCount} {t.bookMany}
          </span>
        </div>
      )}

      {/* Camera View Area */}
      <div className={`relative w-full aspect-square ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center`}>
        <div id={regionId} className="w-full h-full object-cover" />

        {/* Animated Blue Laser Scanner Line (only in continuous barcode mode) */}
        {isScanning && !error && !isProcessing && !isOcrProcessing && scanType === 'barcode' && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
            <div className="relative w-full h-full">
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#3b82f6,0_0_25px_#60a5fa] animate-scanner-line" />
            </div>
          </div>
        )}

        {/* Text Mode Framing Guide */}
        {isScanning && !error && !isProcessing && !isOcrProcessing && scanType === 'text' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className="w-full h-24 border-2 border-dashed border-blue-400/80 rounded-2xl bg-blue-500/5 flex items-center justify-center">
              <span className="text-[11px] font-semibold text-blue-300 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                {t.textIsbnScannerTab}
              </span>
            </div>
          </div>
        )}

        {/* Ready status pill when scanner is scanning and ready */}
        {isScanning && !error && !isProcessing && !isOcrProcessing && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 border border-emerald-400/40 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{t.scannerReady}</span>
            </div>
          </div>
        )}

        {/* Corner Success Checkmark (appears in top-right corner when a book is added) */}
        {showSuccessCheck && (
          <div
            data-testid="scanner-success-checkmark"
            className="absolute top-4 right-4 z-30 pointer-events-none flex items-center gap-1.5 bg-emerald-500 text-white px-3.5 py-1.5 rounded-2xl shadow-xl shadow-emerald-500/40 border border-emerald-400 font-bold text-xs animate-in zoom-in-95 duration-200"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t.bookAddedCheck}</span>
          </div>
        )}

        {/* In-camera processing overlay with spinning loader (book fetch or OCR) */}
        {(isProcessing || isOcrProcessing) && (
          <div
            data-testid="scanner-processing-overlay"
            className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-150"
          >
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col items-center gap-2 max-w-[200px]">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="text-white text-xs font-semibold tracking-wide">
                {isOcrProcessing ? t.ocrProcessing : t.scannerProcessing}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className={`absolute inset-0 ${activeThemeConfig.bgClass}/90 p-6 flex flex-col items-center justify-center text-center`}>
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <p className={`text-sm font-medium ${activeThemeConfig.textPrimaryClass} mb-4`}>{error}</p>
            <button
              onClick={onOpenManualEntry}
              className={`px-5 py-2.5 ${activeThemeConfig.buttonPrimaryClass} text-sm font-semibold rounded-xl transition`}
            >
              {t.manualInput}
            </button>
          </div>
        )}

        {!isScanning && !error && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${activeThemeConfig.textSecondaryClass} ${activeThemeConfig.cardBgClass}`}>
            <Camera className={`w-10 h-10 animate-pulse mb-2 ${activeThemeConfig.accentClass}`} />
            <span className="text-xs font-medium">{t.startingCamera}</span>
          </div>
        )}
      </div>

      {/* Camera shutter trigger button when in Text ISBN mode */}
      {scanType === 'text' && (
        <div className="w-full mt-3">
          <button
            type="button"
            onClick={handleCaptureTextIsbn}
            disabled={isProcessing || isOcrProcessing}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold rounded-2xl transition flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 text-sm cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span>{t.captureTextIsbnButton}</span>
          </button>
        </div>
      )}

      {/* Action buttons under scanner */}
      <div className="mt-4 w-full flex flex-col sm:flex-row gap-3">
        {isBatchMode && (
          <button
            onClick={onFinishBatch}
            className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-5 h-5" />
            {t.finishScanning} ({batchCount})
          </button>
        )}

        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onOpenManualEntry}
            className={`flex-1 px-4 py-3.5 ${activeThemeConfig.buttonSecondaryClass} font-semibold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-lg`}
          >
            <Keyboard className={`w-4 h-4 ${activeThemeConfig.accentClass}`} />
            <span>{t.manualInput}</span>
          </button>

          {onOpenManualEntryNoIsbn && (
            <button
              onClick={onOpenManualEntryNoIsbn}
              className={`flex-1 px-4 py-3.5 ${activeThemeConfig.buttonSecondaryClass} font-semibold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-lg`}
            >
              <BookPlus className={`w-4 h-4 ${activeThemeConfig.accentClass}`} />
              <span>{t.manualInputNoIsbn}</span>
            </button>
          )}
        </div>
      </div>

      {/* ISBN Selection & Confirmation Modal */}
      <IsbnSelectionModal
        isOpen={isIsbnSelectionOpen}
        isbns={detectedIsbns}
        onConfirm={handleConfirmSelectedIsbn}
        onCancel={() => setIsIsbnSelectionOpen(false)}
        onRetake={() => {
          setIsIsbnSelectionOpen(false);
          handleCaptureTextIsbn();
        }}
        t={t}
        currentTheme={currentTheme}
      />
    </div>
  );
};
