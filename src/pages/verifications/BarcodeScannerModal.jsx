// import { XCircle, ZoomIn, ZoomOut, Lightbulb } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from "@zxing/library";

// export const BarcodeScannerModal = ({ isOpen, onClose, onScanned }) => {
//   const videoRef = useRef(null);
//   const reader = useRef(null);
//   const [torchSupported, setTorchSupported] = useState(false);
//   const [torchOn, setTorchOn] = useState(false);
//   const [guidance, setGuidance] = useState("Position barcode in frame");
//   const [scanAttempts, setScanAttempts] = useState(0);
//   const streamRef = useRef(null);

//   useEffect(() => {
//     if (!isOpen) return;

//     // Initialize reader with optimized hints for better detection
//     const hints = new Map();
//     const formats = [
//       BarcodeFormat.QR_CODE,
//       BarcodeFormat.EAN_13,
//       BarcodeFormat.EAN_8,
//       BarcodeFormat.CODE_128,
//       BarcodeFormat.CODE_39,
//       BarcodeFormat.UPC_A,
//       BarcodeFormat.UPC_E,
//       BarcodeFormat.ITF,
//       BarcodeFormat.CODABAR,
//       BarcodeFormat.DATA_MATRIX,
//       BarcodeFormat.PDF_417,
//     ];
//     hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
//     hints.set(DecodeHintType.TRY_HARDER, true);

//     reader.current = new BrowserMultiFormatReader(hints);

//     const startScanning = async () => {
//       try {
//         const constraints = {
//           video: {
//             facingMode: "environment",
//             width: { ideal: 1920 },
//             height: { ideal: 1080 },
//             focusMode: { ideal: "continuous" },
//           },
//         };

//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         streamRef.current = stream;

//         // Check for torch/flashlight support
//         const track = stream.getVideoTracks()[0];
//         const capabilities = track.getCapabilities?.();
//         if (capabilities?.torch) {
//           setTorchSupported(true);
//         }

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           await videoRef.current.play();

//           let lastAttemptTime = Date.now();
//           let attemptCount = 0;

//           reader.current.decodeFromVideoDevice(
//             undefined,
//             videoRef.current,
//             (result, err) => {
//               if (result) {
//                 const barcodeText = result.getText();
//                 setGuidance("✓ Barcode detected!");

//                 // Vibrate on success if supported
//                 if (navigator.vibrate) {
//                   navigator.vibrate(200);
//                 }

//                 onScanned(barcodeText);

//                 // Small delay before closing for visual feedback
//                 setTimeout(() => onClose(), 300);
//                 return;
//               }

//               // Track scan attempts for better user guidance
//               const now = Date.now();
//               if (now - lastAttemptTime > 500) {
//                 attemptCount++;
//                 setScanAttempts(attemptCount);
//                 lastAttemptTime = now;

//                 // Provide dynamic guidance based on attempts
//                 if (attemptCount > 3 && attemptCount < 8) {
//                   setGuidance("Try moving closer to the barcode");
//                 } else if (attemptCount >= 8 && attemptCount < 15) {
//                   setGuidance("Hold steady and ensure good lighting");
//                 } else if (attemptCount >= 15 && attemptCount < 25) {
//                   setGuidance("Try moving farther away");
//                 } else if (attemptCount >= 25) {
//                   setGuidance("Adjust angle or try better lighting");
//                 }
//               }
//             }
//           );
//         }
//       } catch (err) {
//         console.error("Camera access failed:", err);
//         setGuidance("Camera access denied");
//         alert(
//           "Unable to access camera. Please allow camera permissions in your browser settings."
//         );
//       }
//     };

//     startScanning();

//     return () => {
//       if (reader.current) {
//         reader.current.reset();
//       }
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [isOpen, onClose, onScanned]);

//   const toggleTorch = async () => {
//     if (!streamRef.current) return;

//     const track = streamRef.current.getVideoTracks()[0];
//     try {
//       await track.applyConstraints({
//         advanced: [{ torch: !torchOn }],
//       });
//       setTorchOn(!torchOn);
//     } catch (err) {
//       console.error("Torch toggle failed:", err);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black z-50 flex flex-col">
//       {/* Header */}
//       <div className="relative flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent text-white">
//         <h3 className="text-xl font-bold">Scan Barcode</h3>
//         <div className="flex items-center gap-3">
//           {torchSupported && (
//             <button
//               onClick={toggleTorch}
//               className={`p-2 rounded-full transition-colors ${
//                 torchOn ? "bg-yellow-500 text-black" : "bg-white/20 text-white"
//               }`}
//               aria-label="Toggle flashlight"
//             >
//               <Lightbulb className="w-6 h-6" />
//             </button>
//           )}
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
//             aria-label="Close scanner"
//           >
//             <XCircle className="w-8 h-8" />
//           </button>
//         </div>
//       </div>

//       {/* Video + Scanning Frame Overlay */}
//       <div className="relative flex-1 overflow-hidden">
//         <video
//           ref={videoRef}
//           className="absolute inset-0 w-full h-full object-cover"
//           playsInline
//           muted
//         />

//         {/* Dark overlay with cutout */}
//         <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>

//         {/* Scanning Frame Overlay */}
//         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
//           <div className="relative w-[85%] max-w-sm aspect-[4/3]">
//             {/* Main scanning frame */}
//             <div className="absolute inset-0 border-4 border-green-400 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.5)]"></div>

//             {/* Corner brackets - Enhanced */}
//             <div className="absolute -top-1 -left-1 w-16 h-16 border-l-[6px] border-t-[6px] border-green-400 rounded-tl-2xl"></div>
//             <div className="absolute -top-1 -right-1 w-16 h-16 border-r-[6px] border-t-[6px] border-green-400 rounded-tr-2xl"></div>
//             <div className="absolute -bottom-1 -left-1 w-16 h-16 border-l-[6px] border-b-[6px] border-green-400 rounded-bl-2xl"></div>
//             <div className="absolute -bottom-1 -right-1 w-16 h-16 border-r-[6px] border-b-[6px] border-green-400 rounded-br-2xl"></div>

//             {/* Animated scanning line */}
//             <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-scan-line"></div>

//             {/* Pulsing glow effect */}
//             <div className="absolute inset-0 border-2 border-green-400/30 rounded-xl animate-pulse-glow"></div>
//           </div>
//         </div>

//         {/* Distance guidance indicators */}
//         {scanAttempts > 5 && (
//           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex gap-8 pointer-events-none z-20">
//             <div className="flex flex-col items-center animate-bounce-slow">
//               <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
//               <span className="text-white text-xs mt-1 font-semibold drop-shadow-lg">Closer</span>
//             </div>
//             <div className="flex flex-col items-center animate-bounce-slow animation-delay-500">
//               <ZoomOut className="w-8 h-8 text-white drop-shadow-lg" />
//               <span className="text-white text-xs mt-1 font-semibold drop-shadow-lg">Farther</span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer Instructions with Dynamic Guidance */}
//       <div className="p-5 bg-gradient-to-t from-black to-transparent text-center space-y-2">
//         <div className="flex items-center justify-center gap-2">
//           <div className={`w-2 h-2 rounded-full animate-pulse ${
//             scanAttempts > 0 ? 'bg-green-400' : 'bg-gray-400'
//           }`}></div>
//           <p className="text-white text-lg font-semibold">{guidance}</p>
//         </div>

//         <div className="text-gray-300 text-sm space-y-1">
//           <p>• Hold steady for 1-2 seconds</p>
//           <p>• Ensure barcode is well-lit and in focus</p>
//           {scanAttempts > 10 && (
//             <p className="text-yellow-400 animate-pulse">• Clean camera lens if needed</p>
//           )}
//         </div>

//         {/* Supported formats hint */}
//         <p className="text-gray-400 text-xs mt-3">
//           Supports: QR, EAN, UPC, Code 128/39, and more
//         </p>
//       </div>

//       {/* Enhanced CSS Animations */}
//       <style jsx>{`
//         @keyframes scan-line {
//           0% {
//             top: 0%;
//             opacity: 0;
//           }
//           10% {
//             opacity: 1;
//           }
//           90% {
//             opacity: 1;
//           }
//           100% {
//             top: 100%;
//             opacity: 0;
//           }
//         }

//         @keyframes pulse-glow {
//           0%, 100% {
//             opacity: 0.3;
//             transform: scale(1);
//           }
//           50% {
//             opacity: 0.6;
//             transform: scale(1.02);
//           }
//         }

//         @keyframes bounce-slow {
//           0%, 100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-10px);
//           }
//         }

//         .animate-scan-line {
//           animation: scan-line 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }

//         .animate-pulse-glow {
//           animation: pulse-glow 2s ease-in-out infinite;
//         }

//         .animate-bounce-slow {
//           animation: bounce-slow 2s ease-in-out infinite;
//         }

//         .animation-delay-500 {
//           animation-delay: 0.5s;
//         }
//       `}</style>
//     </div>
//   );
// }

import { XCircle, ZoomIn, ZoomOut, Lightbulb } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from "@zxing/library";

export const BarcodeScannerModal = ({ isOpen, onClose, onScanned }) => {
  const videoRef = useRef(null);
  const reader = useRef(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [guidance, setGuidance] = useState("Position barcode in frame");
  const [scanAttempts, setScanAttempts] = useState(0);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const audioContextRef = useRef(null);
  const [scannedCode, setScannedCode] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Create success beep sound
  const playSuccessSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
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

    // Initialize reader with optimized hints for better detection
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

    reader.current = new BrowserMultiFormatReader(hints);

    const startScanning = async () => {
      try {
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            focusMode: { ideal: "continuous" },
            // Better settings for screen scanning
            aspectRatio: { ideal: 16 / 9 },
            frameRate: { ideal: 30, max: 60 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        // Check for torch/flashlight support
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.();
        if (capabilities?.torch) {
          setTorchSupported(true);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          let lastAttemptTime = Date.now();
          let attemptCount = 0;
          let consecutiveFailures = 0;

          reader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
            if (result) {
              const barcodeText = result.getText();

              // Prevent duplicate scans
              if (isScanning) return;
              setIsScanning(true);

              setGuidance("✓ Barcode scanned successfully!");

              // Play success sound
              playSuccessSound();

              // Vibrate on success if supported
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }

              onScanned(barcodeText);

              // Delay before closing for visual/audio feedback
              setTimeout(() => {
                onClose();
                setIsScanning(false);
              }, 500);
              return;
            }

            // Track scan attempts for better user guidance
            const now = Date.now();
            if (now - lastAttemptTime > 400) {
              attemptCount++;
              consecutiveFailures++;
              setScanAttempts(attemptCount);
              lastAttemptTime = now;

              // Provide dynamic guidance based on attempts
              if (attemptCount <= 3) {
                setGuidance("Position barcode in frame");
              } else if (attemptCount > 3 && attemptCount < 8) {
                setGuidance("Move closer to the barcode");
              } else if (attemptCount >= 8 && attemptCount < 15) {
                setGuidance("Hold steady - ensure good lighting");
              } else if (attemptCount >= 15 && attemptCount < 22) {
                setGuidance("Try tilting screen or camera slightly");
              } else if (attemptCount >= 22 && attemptCount < 30) {
                setGuidance("Reduce screen brightness if scanning from screen");
              } else if (attemptCount >= 30) {
                setGuidance("Try adjusting angle to reduce glare");
              }
            }
          });
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setGuidance("Camera access denied");
        alert("Unable to access camera. Please allow camera permissions in your browser settings.");
      }
    };

    startScanning();

    return () => {
      if (reader.current) {
        reader.current.reset();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
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
      console.error("Torch toggle failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="relative flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent text-white">
        <h3 className="text-xl font-bold">Scan Barcode</h3>
        <div className="flex items-center gap-3">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-full transition-colors ${torchOn ? "bg-yellow-500 text-black" : "bg-white/20 text-white"}`}
              aria-label="Toggle flashlight"
            >
              <Lightbulb className="w-6 h-6" />
            </button>
          )}
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors" aria-label="Close scanner">
            <XCircle className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Video + Scanning Frame Overlay */}
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

        {/* Dark overlay with cutout */}
        <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>

        {/* Scanning Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative w-[85%] max-w-sm aspect-[4/3]">
            {/* Main scanning frame */}
            <div className="absolute inset-0 border-4 border-green-400 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.5)]"></div>

            {/* Corner brackets - Enhanced */}
            <div className="absolute -top-1 -left-1 w-16 h-16 border-l-[6px] border-t-[6px] border-green-400 rounded-tl-2xl"></div>
            <div className="absolute -top-1 -right-1 w-16 h-16 border-r-[6px] border-t-[6px] border-green-400 rounded-tr-2xl"></div>
            <div className="absolute -bottom-1 -left-1 w-16 h-16 border-l-[6px] border-b-[6px] border-green-400 rounded-bl-2xl"></div>
            <div className="absolute -bottom-1 -right-1 w-16 h-16 border-r-[6px] border-b-[6px] border-green-400 rounded-br-2xl"></div>

            {/* Animated scanning line */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-scan-line"></div>

            {/* Pulsing glow effect */}
            <div className="absolute inset-0 border-2 border-green-400/30 rounded-xl animate-pulse-glow"></div>
          </div>
        </div>

        {/* Distance guidance indicators */}
        {scanAttempts > 5 && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex gap-8 pointer-events-none z-20">
            <div className="flex flex-col items-center animate-bounce-slow">
              <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
              <span className="text-white text-xs mt-1 font-semibold drop-shadow-lg">Closer</span>
            </div>
            <div className="flex flex-col items-center animate-bounce-slow animation-delay-500">
              <ZoomOut className="w-8 h-8 text-white drop-shadow-lg" />
              <span className="text-white text-xs mt-1 font-semibold drop-shadow-lg">Farther</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions with Dynamic Guidance */}
      <div className="p-5 bg-gradient-to-t from-black to-transparent text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${scanAttempts > 0 ? "bg-green-400" : "bg-gray-400"}`}></div>
          <p className="text-white text-lg font-semibold">{guidance}</p>
        </div>

        <div className="text-gray-300 text-sm space-y-1">
          <p>• Hold steady for 1-2 seconds</p>
          <p>• Ensure barcode is well-lit and in focus</p>
          {scanAttempts > 15 && <p className="text-yellow-400 animate-pulse">• Tilt to avoid screen glare/reflections</p>}
          {scanAttempts > 10 && <p className="text-yellow-400">• Reduce screen brightness if scanning from display</p>}
        </div>

        {/* Supported formats hint */}
        <p className="text-gray-400 text-xs mt-3">Supports: QR, EAN, UPC, Code 128/39, and more</p>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes scan-line {
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

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.02);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-scan-line {
          animation: scan-line 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};
