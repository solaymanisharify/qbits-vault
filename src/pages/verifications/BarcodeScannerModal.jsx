import { XCircle, Lightbulb } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from "@zxing/library";

export const BarcodeScannerModal = ({ isOpen, onClose, onScanned }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [guidance, setGuidance] = useState("Position barcode in frame");
  const [scanAttempts, setScanAttempts] = useState(0);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.error("Sound playback failed:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const hints = new Map();
    const formats = [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417,
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    readerRef.current = new BrowserMultiFormatReader(hints);

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.();
        if (capabilities?.torch) {
          setTorchSupported(true);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };

          let lastAttemptTime = Date.now();
          let attemptCount = 0;

          readerRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
            if (result && !isScanning) {
              const barcodeText = result.getText();

              setIsScanning(true);
              console.log("✓ Barcode detected:", barcodeText);
              setGuidance("✓ Barcode scanned!");

              playSuccessSound();

              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }

              if (readerRef.current) {
                readerRef.current.reset();
              }

              setTimeout(() => {
                onScanned(barcodeText);
                onClose();
              }, 400);
              return;
            }

            const now = Date.now();
            if (now - lastAttemptTime > 500) {
              attemptCount++;
              setScanAttempts(attemptCount);
              lastAttemptTime = now;

              if (attemptCount <= 3) {
                setGuidance("Position barcode in frame");
              } else if (attemptCount <= 8) {
                setGuidance("Move closer to barcode");
              } else if (attemptCount <= 15) {
                setGuidance("Hold steady - ensure good light");
              } else if (attemptCount <= 25) {
                setGuidance("Try different angle or distance");
              } else {
                setGuidance("Adjust lighting or clean lens");
              }
            }
          });
        }
      } catch (err) {
        console.error("Camera error:", err);
        setGuidance("Camera access denied");
        alert("Please allow camera access in your browser settings.");
      }
    };

    startScanning();

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsScanning(false);
    };
  }, [isOpen, onClose, onScanned]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error("Torch failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent text-white z-20">
        <h3 className="text-xl font-bold">Scan Barcode</h3>
        <div className="flex items-center gap-3">
          {torchSupported && (
            <button onClick={toggleTorch} className={`p-2 rounded-full transition-colors ${torchOn ? "bg-yellow-400 text-black" : "bg-white/20 text-white"}`}>
              <Lightbulb className="w-6 h-6" />
            </button>
          )}
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors">
            <XCircle className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden bg-black">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain" playsInline muted autoPlay />

        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative w-[80%] max-w-sm aspect-[3/2]">
            <div className="absolute inset-0 border-4 border-green-400 rounded-2xl shadow-[0_0_30px_rgba(74,222,128,0.6)]"></div>

            <div className="absolute -top-1 -left-1 w-16 h-16 border-l-[6px] border-t-[6px] border-green-400 rounded-tl-2xl"></div>
            <div className="absolute -top-1 -right-1 w-16 h-16 border-r-[6px] border-t-[6px] border-green-400 rounded-tr-2xl"></div>
            <div className="absolute -bottom-1 -left-1 w-16 h-16 border-l-[6px] border-b-[6px] border-green-400 rounded-bl-2xl"></div>
            <div className="absolute -bottom-1 -right-1 w-16 h-16 border-r-[6px] border-b-[6px] border-green-400 rounded-br-2xl"></div>

            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80 shadow-[0_0_15px_rgba(74,222,128,0.9)] animate-scan"></div>

            <div className="absolute inset-0 border-2 border-green-400/30 rounded-2xl animate-pulse-slow"></div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-t from-black via-black/95 to-transparent text-center space-y-3 z-20">
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${scanAttempts > 0 ? "bg-green-400" : "bg-gray-400"}`}></div>
          <p className="text-white text-lg font-semibold">{guidance}</p>
        </div>

        <div className="text-gray-300 text-sm space-y-1.5">
          <p>• Hold phone 10-20cm from barcode</p>
          <p>• Ensure barcode is well-lit</p>
          {scanAttempts > 10 && <p className="text-yellow-400 animate-pulse">• Try tilting phone slightly</p>}
        </div>

        <p className="text-gray-400 text-xs mt-3">Supports QR, EAN, UPC, Code 128/39, and more</p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-scan {
          animation: scan 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
