import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Keyboard, AlertCircle, Layers, Scan, CheckCircle2 } from 'lucide-react';

import type { Library } from '../types/book';

interface ScannerProps {
  isBatchMode: boolean;
  onToggleBatchMode: (isBatch: boolean) => void;
  batchCount: number;
  onScanSuccess: (decodedText: string) => void;
  onOpenManualEntry: () => void;
  onFinishBatch: () => void;
  resumeTrigger?: number;
  libraries: Library[];
  selectedLibraryId: string;
  onSelectLibrary: (id: string) => void;
}

export const ScannerComponent: React.FC<ScannerProps> = ({
  isBatchMode,
  onToggleBatchMode,
  batchCount,
  onScanSuccess,
  onOpenManualEntry,
  onFinishBatch,
  resumeTrigger,
  libraries,
  selectedLibraryId,
  onSelectLibrary,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'reader';

  const lastScanTimeRef = useRef<number>(0);
  const isBatchModeRef = useRef<boolean>(isBatchMode);

  useEffect(() => {
    isBatchModeRef.current = isBatchMode;
  }, [isBatchMode]);

  // Handle resume if scanner was paused in single mode
  useEffect(() => {
    if (scannerRef.current && scannerRef.current.getState() === 3 /* PAUSED */) {
      try {
        scannerRef.current.resume();
      } catch (e) {
        console.error('Error resuming scanner:', e);
      }
    }
  }, [resumeTrigger]);

  useEffect(() => {
    let isMounted = true;

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

            if (isBatchModeRef.current) {
              const now = Date.now();
              if (now - lastScanTimeRef.current < 3000) {
                // Ignore scans during 3-second cooldown
                return;
              }
              lastScanTimeRef.current = now;
              onScanSuccess(decodedText);
            } else {
              html5Qrcode.pause(true);
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Ignore decode error frames
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err) {
        console.error('Failed to start scanner:', err);
        if (isMounted) {
          setError('Nedařilo se spustit fotoaparát. Povolte prosím přístup k fotoaparátu v prohlížeči.');
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(err => console.error('Error stopping scanner:', err));
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Target Library Selector Dropdown */}
      <div className="w-full mb-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <label htmlFor="library-select" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <span>Pridat do knihovny:</span>
        </label>
        <select
          id="library-select"
          value={selectedLibraryId}
          onChange={(e) => onSelectLibrary(e.target.value)}
          className="w-full sm:w-auto flex-1 bg-slate-950 border border-slate-800 text-blue-400 font-semibold text-xs rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
        >
          {libraries.map((lib) => (
            <option key={lib.id} value={lib.id}>
              {lib.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mode selector toggle */}
      <div className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex gap-1 mb-4 shadow-md">
        <button
          onClick={() => onToggleBatchMode(false)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            !isBatchMode
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Jednotlivé skenování</span>
        </button>

        <button
          onClick={() => onToggleBatchMode(true)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            isBatchMode
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hromadné skenování</span>
        </button>
      </div>

      {/* Batch mode banner */}
      {isBatchMode && (
        <div className="w-full mb-3 bg-blue-950/60 border border-blue-500/30 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-medium text-blue-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Hromadný režim (pauza 3s mezi skeny)</span>
          </div>
          <span className="bg-blue-600/30 border border-blue-400/30 text-blue-100 px-2.5 py-0.5 rounded-full font-bold">
            {batchCount} knih
          </span>
        </div>
      )}

      {/* Camera View Area */}
      <div className="relative w-full aspect-square bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        <div id={regionId} className="w-full h-full object-cover" />

        {/* Animated Blue Laser Scanner Line */}
        {isScanning && !error && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
            <div className="relative w-full h-full">
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#3b82f6,0_0_25px_#60a5fa] animate-scanner-line" />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <p className="text-sm font-medium text-slate-200 mb-4">{error}</p>
            <button
              onClick={onOpenManualEntry}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition"
            >
              Zadat ISBN ručně
            </button>
          </div>
        )}

        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900">
            <Camera className="w-10 h-10 animate-pulse mb-2 text-blue-500" />
            <span className="text-xs font-medium">Spouštím skener fotoaparátu...</span>
          </div>
        )}
      </div>

      {/* Action buttons under scanner */}
      <div className="mt-5 w-full flex flex-col sm:flex-row gap-3">
        {isBatchMode && (
          <button
            onClick={onFinishBatch}
            className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-5 h-5" />
            Dokončit skenování ({batchCount})
          </button>
        )}

        <button
          onClick={onOpenManualEntry}
          className="flex-1 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 font-semibold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Keyboard className="w-5 h-5" />
          Zadat ISBN ručně
        </button>
      </div>
    </div>
  );
};
