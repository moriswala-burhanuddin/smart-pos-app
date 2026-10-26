import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Zap, AlertCircle, Sparkles } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose }) => {
  const { addByBarcode, products } = usePOS();
  const [scanError, setScanError] = useState<string>('');
  const [lastScanned, setLastScanned] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
      return;
    }

    setScanError('');
    setLastScanned('');

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('barcode-camera-view');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 260, height: 160 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success handler
            setLastScanned(decodedText);
            const res = addByBarcode(decodedText);
            if (!res.success) {
              setScanError(res.message);
            } else {
              setScanError('');
              // Keep scanning open for multi-item fast scanning!
            }
          },
          () => {
            // Frame scan failed (normal while pointing)
          }
        );
      } catch (err: unknown) {
        console.warn('Camera scanner init issue:', err);
        setScanError('Camera permission required or device camera is in use. You can also use the Quick Scan simulator below!');
      }
    };

    // Small delay to let DOM render
    const timer = setTimeout(startScanner, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const res = addByBarcode(manualCode.trim());
    if (res.success) {
      setLastScanned(manualCode.trim());
      setManualCode('');
      setScanError('');
    } else {
      setScanError(res.message);
    }
  };

  const handleQuickSimulator = (barcode: string) => {
    setLastScanned(barcode);
    const res = addByBarcode(barcode);
    if (!res.success) {
      setScanError(res.message);
    } else {
      setScanError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ios-red text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Barcode Scanner
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Point camera at product barcode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="p-4 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            {/* HTML5 Camera Target */}
            <div id="barcode-camera-view" className="w-full h-full" />

            {/* Red Laser Scanning Animation Guide */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-ios-red shadow-[0_0_10px_#DC2626] animate-pulse pointer-events-none" />
            
            <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                Continuous Scan Mode (Scan multiple items)
              </span>
            </div>
          </div>

          {/* Feedback messages */}
          {lastScanned && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Scanned Code: <strong>{lastScanned}</strong> (Item Added!)</span>
            </div>
          )}

          {scanError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Or enter barcode manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
            />
            <button
              type="submit"
              className="bg-ios-red hover:bg-ios-redHover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Add
            </button>
          </form>

          {/* Quick Scanner Simulator (Ideal for Demo / Testing without physical goods) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-2 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Test Barcodes (Click to simulate scan):</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {products.slice(0, 6).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleQuickSimulator(prod.barcode)}
                  className="bg-slate-100 hover:bg-ios-red hover:text-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                >
                  {prod.name.split(' ')[0]} {prod.name.split(' ')[1] || ''} (₹{prod.price})
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
          >
            Done Scanning
          </button>
        </div>

      </div>
    </div>
  );
};
