import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Keyboard, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onOpenManualEntry: () => void;
}

export const ScannerComponent: React.FC<ScannerProps> = ({
  onScanSuccess,
  onOpenManualEntry,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'reader';

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
            if (isMounted) {
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
      <div className="relative w-full aspect-square bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        <div id={regionId} className="w-full h-full object-cover" />

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

      <div className="mt-6 w-full flex justify-center">
        <button
          onClick={onOpenManualEntry}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 font-semibold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Keyboard className="w-5 h-5" />
          Zadat ISBN čísla ručně
        </button>
      </div>
    </div>
  );
};
