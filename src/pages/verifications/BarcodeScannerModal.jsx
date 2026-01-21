import { XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export const BarcodeScannerModal = ({ isOpen, onClose, onScanned }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    codeReaderRef.current = new BrowserMultiFormatReader();

    codeReaderRef.current
      .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          const code = result.getText();
          console.log("Scanned:", code);
          
          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          onScanned(code);
          onClose();
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        alert("Cannot access camera. Please allow camera permission.");
      });

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [isOpen, onClose, onScanned]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black/50 flex justify-between items-center">
        <h3 className="text-white text-xl font-bold">Scan Barcode</h3>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-full"
        >
          <XCircle className="w-8 h-8" />
        </button>
      </div>

      {/* Video */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Scanning frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] max-w-sm aspect-video border-4 border-green-400 rounded-lg shadow-[0_0_20px_rgba(74,222,128,0.5)]"></div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 bg-black/50 text-center">
        <p className="text-white text-lg">Point camera at barcode</p>
        <p className="text-gray-300 text-sm mt-2">Hold steady for 1-2 seconds</p>
      </div>
    </div>
  );
};