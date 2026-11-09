import React, { useState, useRef, useEffect } from 'react';
import { ImportedDiagram } from '../types/diagram';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Trash2, 
  Sparkles, 
  Sliders, 
  Maximize, 
  Move, 
  ZoomIn, 
  ZoomOut,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Sun,
  Contrast,
  SunMedium,
  Crosshair,
  Layers,
  FileText,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface ReferenceDiagramOverlayProps {
  diagram: ImportedDiagram | null;
  zoom: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdateDiagram: (updated: Partial<ImportedDiagram>) => void;
  onRemoveDiagram: () => void;
  onOpenAnalysis: () => void;
  onReimport: () => void;
}

export const ReferenceDiagramOverlay: React.FC<ReferenceDiagramOverlayProps> = ({
  diagram,
  zoom,
  isSelected = false,
  onSelect,
  onUpdateDiagram,
  onRemoveDiagram,
  onOpenAnalysis,
  onReimport
}) => {
  if (!diagram || !diagram.isVisible) return null;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imgErrorText, setImgErrorText] = useState<string | null>(null);

  // Reset image loading status whenever dataUrl changes
  useEffect(() => {
    setImgStatus('loading');
    setImgErrorText(null);
  }, [diagram.dataUrl]);

  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: diagram.x,
    initY: diagram.y
  });

  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    initW: number;
    initH: number;
    initX: number;
    initY: number;
    aspectRatio: number;
  }>({
    startX: 0,
    startY: 0,
    initW: diagram.width,
    initH: diagram.height,
    initX: diagram.x,
    initY: diagram.y,
    aspectRatio: diagram.width / (diagram.height || 1)
  });

  // Handle Drag Move (when unlocked)
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    if (diagram.isLocked) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: diagram.x,
      initY: diagram.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStartRef.current.startX) / zoom;
      const dy = (e.clientY - dragStartRef.current.startY) / zoom;
      onUpdateDiagram({
        x: Math.round(dragStartRef.current.initX + dx),
        y: Math.round(dragStartRef.current.initY + dy)
      });
    } else if (isResizing && resizeCorner) {
      const dx = (e.clientX - resizeStartRef.current.startX) / zoom;
      const dy = (e.clientY - resizeStartRef.current.startY) / zoom;
      const { initW, initH, initX, initY, aspectRatio } = resizeStartRef.current;

      let newW = initW;
      let newH = initH;
      let newX = initX;
      let newY = initY;

      if (resizeCorner === 'se') {
        newW = Math.max(150, initW + dx);
        newH = Math.round(newW / aspectRatio);
      } else if (resizeCorner === 'sw') {
        newW = Math.max(150, initW - dx);
        newH = Math.round(newW / aspectRatio);
        newX = initX + (initW - newW);
      } else if (resizeCorner === 'ne') {
        newW = Math.max(150, initW + dx);
        newH = Math.round(newW / aspectRatio);
        newY = initY + (initH - newH);
      } else if (resizeCorner === 'nw') {
        newW = Math.max(150, initW - dx);
        newH = Math.round(newW / aspectRatio);
        newX = initX + (initW - newW);
        newY = initY + (initH - newH);
      }

      onUpdateDiagram({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      });
    }
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeCorner(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const startResize = (corner: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initW: diagram.width,
      initH: diagram.height,
      initX: diagram.x,
      initY: diagram.y,
      aspectRatio: diagram.width / (diagram.height || 1)
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Rotate 90 degrees
  const handleRotate90 = () => {
    const nextRot = (diagram.rotation + 90) % 360;
    onUpdateDiagram({
      rotation: nextRot,
      width: diagram.height,
      height: diagram.width
    });
  };

  // Center diagram in the workspace canvas (1400 x 900)
  const handleCenterInCanvas = () => {
    const centerX = Math.max(30, Math.round((1400 - diagram.width) / 2));
    const centerY = Math.max(30, Math.round((900 - diagram.height) / 2));
    onUpdateDiagram({
      x: centerX,
      y: centerY
    });
  };

  // Fit to standard drawing area and center
  const handleFitToArea = () => {
    const targetW = 850;
    const ratio = (diagram.originalWidth || 800) / (diagram.originalHeight || 600);
    const targetH = Math.round(targetW / ratio);
    const centerX = Math.max(30, Math.round((1400 - targetW) / 2));
    const centerY = Math.max(30, Math.round((900 - targetH) / 2));
    onUpdateDiagram({
      x: centerX,
      y: centerY,
      width: targetW,
      height: targetH
    });
  };

  // Reset position, scale and rotation to default clear viewport
  const handleResetPosition = () => {
    const safeW = diagram.originalWidth > 0 ? diagram.originalWidth : 800;
    const safeH = diagram.originalHeight > 0 ? diagram.originalHeight : 600;
    const targetW = Math.min(900, Math.max(500, safeW >= safeH ? 800 : 600));
    const targetH = Math.round(targetW * (safeH / safeW));
    onUpdateDiagram({
      x: 460,
      y: 50,
      width: targetW,
      height: targetH,
      rotation: 0,
      opacity: 0.95
    });
  };

  // Toggle white paper backdrop sheet for high contrast readability
  const handleToggleBackdrop = () => {
    onUpdateDiagram({
      hasWhiteBackdrop: diagram.hasWhiteBackdrop !== false ? false : true
    });
  };

  // Toggle Layer (Front above components / Background beneath components)
  const handleToggleLayer = () => {
    const next = diagram.layerPosition === 'front' ? 'back' : 'front';
    onUpdateDiagram({ layerPosition: next });
  };

  // CSS filters string
  const filterStyles = [
    `brightness(${diagram.brightness ?? 1.0})`,
    `contrast(${diagram.contrast ?? 1.0})`,
    diagram.grayscale ? 'grayscale(100%)' : '',
    diagram.invert ? 'invert(100%)' : ''
  ].filter(Boolean).join(' ');

  // Dynamic z-index:
  // If layerPosition is explicitly 'back' AND diagram is locked, put at zIndex 1 (behind wires at 5 and components at 10)
  // Otherwise, default to zIndex 35 (on top so user can see, drag, resize, and inspect without obstruction!)
  const overlayZIndex = (diagram.layerPosition === 'back' && diagram.isLocked) ? 1 : 35;

  // Determine if top toolbar should render above (-top-11) or inside the card (if y < 45)
  const isNearTopEdge = diagram.y < 46;

  return (
    <div
      className={`absolute transition-all rounded-2xl ${
        diagram.isLocked 
          ? 'pointer-events-auto' 
          : 'pointer-events-auto select-none'
      } ${
        isSelected
          ? 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.45)]'
          : !diagram.isLocked
          ? 'ring-2 ring-amber-400/80 shadow-2xl'
          : 'shadow-lg hover:ring-2 hover:ring-cyan-400/40'
      }`}
      style={{
        left: `${diagram.x}px`,
        top: `${diagram.y}px`,
        width: `${diagram.width}px`,
        height: `${diagram.height}px`,
        zIndex: overlayZIndex
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect();
      }}
      onPointerMove={handlePointerMoveDrag}
      onPointerUp={handlePointerUpDrag}
    >
      {/* Paper Sheet Backdrop Card: Guarantees high-contrast visibility on dark canvas */}
      <div 
        className={`relative w-full h-full rounded-2xl overflow-hidden transition-all flex items-center justify-center ${
          diagram.hasWhiteBackdrop !== false
            ? 'bg-white shadow-2xl border border-slate-300'
            : 'bg-transparent'
        }`}
      >
        {/* Loading State Spinner */}
        {imgStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm z-20 text-xs text-amber-300 font-bold gap-2">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>جاري عرض وتجهيز المخطط...</span>
          </div>
        )}

        {/* Error Diagnostic Fallback View */}
        {imgStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-red-200 p-5 text-center z-20 rounded-2xl border-2 border-red-500/60 space-y-3" dir="rtl">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">تعذر تحميل أو عرض صورة المخطط</div>
              <p className="text-xs text-slate-400 max-w-sm">
                {imgErrorText || 'تعذر فك تشفير بيانات المخطط. تأكد من أن الملف سليم بصيغة PDF أو صورة مدعومة.'}
              </p>
            </div>
            <div className="bg-slate-950/80 rounded-xl px-3 py-1.5 border border-slate-800 text-[11px] font-mono text-slate-400">
              الملف: {diagram.name} • الأبعاد: {diagram.originalWidth}x{diagram.originalHeight} px
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReimport();
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md transition"
              >
                إعادة الاستيراد الآن
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveDiagram();
                }}
                className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-xl text-xs cursor-pointer transition"
              >
                حذف المخطط
              </button>
            </div>
          </div>
        )}

        {/* Actual Image / PDF Page Render with Filter Styles & Event Handlers */}
        <img
          src={diagram.dataUrl}
          alt={diagram.name || 'مخطط كهربائي مستورد'}
          draggable={false}
          className="w-full h-full object-contain pointer-events-none select-none"
          style={{
            opacity: diagram.opacity,
            filter: filterStyles || undefined,
            transform: `rotate(${diagram.rotation}deg)`,
            transformOrigin: 'center center'
          }}
          onLoad={() => {
            setImgStatus('loaded');
            setImgErrorText(null);
          }}
          onError={() => {
            setImgStatus('error');
            setImgErrorText('فشل تحميل محتوى المخطط. يرجى التحقق من الملف أو إعادة الاستيراد.');
          }}
        />

        {/* Subtle Bottom Diagnostics Badge when selected */}
        {isSelected && (
          <div className="absolute bottom-2 right-2 bg-slate-950/90 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold z-10 pointer-events-none shadow-md backdrop-blur-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{diagram.name}</span>
            <span className="text-slate-500">|</span>
            <span>{diagram.width}×{diagram.height}</span>
          </div>
        )}
      </div>

      {/* When Unlocked: Overlay Drag Zone & Bounding Frame */}
      {!diagram.isLocked && (
        <div
          className="absolute inset-0 border-2 border-dashed border-amber-400/90 rounded-2xl cursor-move bg-amber-500/5 hover:bg-amber-500/10 transition flex items-center justify-center group"
          onPointerDown={handlePointerDownDrag}
        >
          {/* Subtle drag hint */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/95 text-amber-300 border border-amber-500/50 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md shadow-2xl pointer-events-none">
            <Move className="w-4 h-4 text-amber-400" />
            <span>اسحب لتحريك المخطط • اسحب الزوايا لتغيير الأبعاد</span>
          </div>

          {/* Corner Resize Handles */}
          <div
            className="absolute -top-3 -left-3 w-6 h-6 bg-amber-400 border-2 border-slate-950 rounded-lg cursor-nwse-resize shadow-xl hover:scale-125 transition"
            onPointerDown={(e) => startResize('nw', e)}
            title="تغيير الحجم من الزاوية"
          />
          <div
            className="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 border-2 border-slate-950 rounded-lg cursor-nesw-resize shadow-xl hover:scale-125 transition"
            onPointerDown={(e) => startResize('ne', e)}
            title="تغيير الحجم من الزاوية"
          />
          <div
            className="absolute -bottom-3 -left-3 w-6 h-6 bg-amber-400 border-2 border-slate-950 rounded-lg cursor-nesw-resize shadow-xl hover:scale-125 transition"
            onPointerDown={(e) => startResize('sw', e)}
            title="تغيير الحجم من الزاوية"
          />
          <div
            className="absolute -bottom-3 -right-3 w-6 h-6 bg-amber-400 border-2 border-slate-950 rounded-lg cursor-nwse-resize shadow-xl hover:scale-125 transition"
            onPointerDown={(e) => startResize('se', e)}
            title="تغيير الحجم من الزاوية"
          />
        </div>
      )}

      {/* Floating Control Bar for Reference Diagram */}
      <div 
        className={`absolute right-0 left-auto pointer-events-auto flex flex-wrap items-center gap-1 bg-slate-950/95 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md z-30 text-xs ${
          isNearTopEdge ? 'top-2 right-2' : '-top-12'
        }`}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock / Unlock Toggle */}
        <button
          onClick={() => onUpdateDiagram({ isLocked: !diagram.isLocked })}
          className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
            diagram.isLocked 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700'
          }`}
          title={diagram.isLocked ? 'المخطط مقفول كخلفية (انقر للتحريك وتغيير الحجم)' : 'المخطط قابل للتحريك (انقر لقفله وتثبيته)'}
        >
          {diagram.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{diagram.isLocked ? 'مقفول' : 'تحريك'}</span>
        </button>

        {/* Center Diagram in Workspace (Requirement 7) */}
        <button
          onClick={handleCenterInCanvas}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 rounded-xl transition cursor-pointer font-semibold"
          title="توسيط المخطط في مساحة العمل"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>توسيط</span>
        </button>

        {/* Fit to Area / Screen (Requirement 7) */}
        <button
          onClick={handleFitToArea}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded-xl transition cursor-pointer font-semibold"
          title="ملاءمة حجم المخطط مع الشاشة"
        >
          <Maximize className="w-3.5 h-3.5 text-amber-400" />
          <span>ملاءمة</span>
        </button>

        {/* Reset Position (Requirement 7) */}
        <button
          onClick={handleResetPosition}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="إعادة تعيين موضع وحجم المخطط"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Layer (Front / Back) */}
        <button
          onClick={handleToggleLayer}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
            diagram.layerPosition === 'front' || !diagram.isLocked
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title="تبديل الطبقة: في المقدمة فوق المكونات أو كخلفية تحت المكونات"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>{diagram.layerPosition === 'back' && diagram.isLocked ? 'خلفية' : 'مقدمة'}</span>
        </button>

        {/* Toggle White Paper Sheet Backdrop */}
        <button
          onClick={handleToggleBackdrop}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
            diagram.hasWhiteBackdrop !== false
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="تبديل ورقة بيضاء عالية التباين أو رسم شفاف"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>ورقة بيضاء</span>
        </button>

        {/* Opacity Slider */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400">شفافية:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={diagram.opacity}
            onChange={(e) => onUpdateDiagram({ opacity: parseFloat(e.target.value) })}
            className="w-16 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            title={`الشفافية: ${Math.round(diagram.opacity * 100)}%`}
          />
          <span className="text-[10px] font-mono text-amber-400 w-7">{Math.round(diagram.opacity * 100)}%</span>
        </div>

        {/* Rotate Button */}
        {!diagram.isLocked && (
          <button
            onClick={handleRotate90}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="تدوير 90 درجة"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Contrast / Invert Color Filter Popover Toggle */}
        <button
          onClick={() => setShowFilterPopover(!showFilterPopover)}
          className={`p-1.5 rounded-xl transition cursor-pointer ${
            showFilterPopover || diagram.invert || diagram.highContrastDoc
              ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="فلاتر التباين والإضاءة للمخطط"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Analyze Diagram Button */}
        <button
          onClick={onOpenAnalysis}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-[11px]"
          title="تحليل رموز ومكونات المخطط واقتراح إعادة البناء"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 fill-cyan-200" />
          <span>تحليل المخطط</span>
        </button>

        {/* Re-import / Replace */}
        <button
          onClick={onReimport}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="استبدال أو إعادة استيراد المخطط"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Remove Diagram */}
        <button
          onClick={onRemoveDiagram}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition cursor-pointer"
          title="حذف المخطط المرجعي"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>


      {/* Filter Adjustments Popover */}
      {showFilterPopover && (
        <div 
          className="absolute -top-40 right-0 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md z-30 space-y-2.5 text-xs pointer-events-auto"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>فلاتر ووضوح المخطط</span>
            </span>
            <button
              onClick={() => setShowFilterPopover(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Invert Colors (Black to White for Dark Backgrounds) */}
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-slate-300">عكس الألوان (Invert):</span>
            <input
              type="checkbox"
              checked={diagram.invert}
              onChange={(e) => onUpdateDiagram({ invert: e.target.checked })}
              className="accent-purple-500 rounded cursor-pointer"
            />
          </label>

          {/* High Contrast Mode */}
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-slate-300">تباين فائق للوثائق (High Contrast):</span>
            <input
              type="checkbox"
              checked={diagram.highContrastDoc}
              onChange={(e) => onUpdateDiagram({ highContrastDoc: e.target.checked })}
              className="accent-purple-500 rounded cursor-pointer"
            />
          </label>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>السطوع:</span>
              <span className="font-mono text-purple-300">{Math.round((diagram.brightness ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={diagram.brightness ?? 1}
              onChange={(e) => onUpdateDiagram({ brightness: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>التباين:</span>
              <span className="font-mono text-purple-300">{Math.round((diagram.contrast ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={diagram.contrast ?? 1}
              onChange={(e) => onUpdateDiagram({ contrast: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
