import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  RotateCw, 
  Check, 
  X, 
  AlertTriangle, 
  Upload, 
  Sparkles, 
  Sliders, 
  Scissors, 
  RefreshCcw,
  Maximize2
} from 'lucide-react';
import { processDiagramImage, ImageCropRect, ImageFilters } from '../utils/imageProcessing';

interface CameraScanViewProps {
  onCaptureComplete: (dataUrl: string, width: number, height: number) => void;
  onFallbackToUpload: () => void;
  onCancel: () => void;
}

export const CameraScanView: React.FC<CameraScanViewProps> = ({
  onCaptureComplete,
  onFallbackToUpload,
  onCancel
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'streaming' | 'captured' | 'error'>('streaming');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

  // Post capture filter states
  const [rotation, setRotation] = useState<number>(0);
  const [highContrastDoc, setHighContrastDoc] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(1.05);
  const [contrast, setContrast] = useState<number>(1.15);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Start Camera
  const startCamera = async () => {
    setCameraState('streaming');
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم الوصول المباشر للكاميرا. يرجى استخدام متصفح حديث أو رفع صورة.');
      }

      // Request back camera on phones (environment mode)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('[CameraScan] Camera error:', err);
      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('تم رفض إذن الكاميرا من المتصفح. يمكنك السماح بالوصول من شريط العنوان أو رفع صورة المخطط بدلاً من ذلك.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('لم يتم العثور على كاميرا متصلة بجهازك. يمكنك رفع ملف صورة المخطط مباشرة.');
      } else {
        setErrorMessage('تعذر تشغيل الكاميرا: ' + (err.message || 'خطأ غير معروف'));
      }
    }
  };

  // Stop camera tracks
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from video
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    setCapturedDataUrl(dataUrl);
    setCameraState('captured');
    stopCamera();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setRotation(0);
    startCamera();
  };

  // Confirm and process final enhanced diagram
  const handleConfirm = async () => {
    if (!capturedDataUrl) return;
    setIsProcessing(true);
    try {
      const filters: Partial<ImageFilters> = {
        rotation,
        highContrastDoc,
        brightness,
        contrast
      };

      const result = await processDiagramImage(capturedDataUrl, filters);
      onCaptureComplete(result.dataUrl, result.width, result.height);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden">
      
      {/* Live Viewfinder Mode */}
      {cameraState === 'streaming' && (
        <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Document Framing Guidelines Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 sm:p-12">
            <div className="relative w-full max-w-lg aspect-[4/3] border-2 border-dashed border-amber-400/70 rounded-2xl shadow-2xl flex flex-col justify-between p-4">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br" />

              <div className="self-center bg-slate-900/90 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                قم بمحاذاة ورقة المخطط أو شاشة الكمبيوتر داخل الإطار
              </div>
            </div>
          </div>

          {/* Bottom Viewfinder Action Controls */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-around px-6 z-20">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold backdrop-blur-md transition cursor-pointer"
            >
              إلغاء
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleSnap}
              className="w-16 h-16 rounded-full bg-white border-4 border-amber-500 shadow-2xl hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer group"
              title="التقاط صورة المخطط"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 group-hover:bg-amber-400 transition" />
            </button>

            <button
              onClick={onFallbackToUpload}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold backdrop-blur-md transition cursor-pointer"
              title="رفع صورة من الجهاز"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">رفع صورة</span>
            </button>
          </div>
        </div>
      )}

      {/* Captured Image Review & Enhancement Mode */}
      {cameraState === 'captured' && capturedDataUrl && (
        <div className="relative flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* Top Quick Controls Bar */}
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>معاينة وتحسين المخطط الملتقط</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
                title="تدوير 90 درجة"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>تدوير ({rotation}°)</span>
              </button>

              <button
                onClick={() => setHighContrastDoc(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                  highContrastDoc
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="تبييض الخلفية وتغميق الرموز والأسلاك"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحسين وضوح الرموز (Binarize)</span>
              </button>
            </div>
          </div>

          {/* Image Canvas Preview Area */}
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
            <div className="relative max-w-full max-h-[55vh] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-white">
              <img
                src={capturedDataUrl}
                alt="المخطط الملتقط"
                className="max-w-full max-h-[55vh] object-contain transition"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: [
                    `brightness(${brightness})`,
                    `contrast(${contrast})`,
                    highContrastDoc ? 'contrast(160%) grayscale(100%)' : ''
                  ].filter(Boolean).join(' ')
                }}
              />
            </div>
          </div>

          {/* Bottom Sliders & Action Buttons */}
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>السطوع:</span>
                  <span className="font-mono text-amber-400">{Math.round(brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>التباين:</span>
                  <span className="font-mono text-amber-400">{Math.round(contrast * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="2.0"
                  step="0.05"
                  value={contrast}
                  onChange={(e) => setContrast(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>إعادة الالتقاط</span>
              </button>

              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isProcessing ? 'جاري المعالجة...' : 'تأكيد وإدراج في مساحة العمل'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Permission / Error State */}
      {cameraState === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-base">تعذر تشغيل كاميرا المخططات</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onFallbackToUpload}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>رفع صورة بدلاً من ذلك</span>
            </button>

            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
