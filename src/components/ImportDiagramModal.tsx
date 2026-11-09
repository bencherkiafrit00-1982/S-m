import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Camera, 
  Upload, 
  X, 
  Check, 
  RotateCw, 
  Sliders, 
  Scissors, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  FileSearch,
  Eye,
  Layers,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Cpu,
  StopCircle
} from 'lucide-react';
import { ImportedDiagram } from '../types/diagram';
import { 
  loadPdfDocument, 
  renderPdfPageToDataUrl, 
  destroyLoadedPdf,
  cancelActivePdfRender,
  LoadedPdf
} from '../utils/pdfRenderer';
import { 
  processDiagramImage, 
  fileToDataUrl, 
  ImageFilters 
} from '../utils/imageProcessing';
import { CameraScanView } from './CameraScanView';
import { saveDiagramDataUrl } from '../utils/diagramStorage';
import { 
  getDeviceMemoryProfile, 
  formatByteSize, 
  isMobileDevice 
} from '../utils/memoryOptimizer';

interface ImportDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiagramImported: (diagram: ImportedDiagram) => void;
}

type ImportTab = 'pdf' | 'image' | 'camera' | 'samples';

export const ImportDiagramModal: React.FC<ImportDiagramModalProps> = ({
  isOpen,
  onClose,
  onDiagramImported
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('pdf');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Device memory profile & low memory mode state
  const deviceProfile = useMemo(() => getDeviceMemoryProfile(), []);
  const [lowMemoryMode, setLowMemoryMode] = useState<boolean>(deviceProfile.isLowMemoryDevice);
  const [fileWarning, setFileWarning] = useState<string | null>(null);

  // --- PDF States ---
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [selectedPdfPage, setSelectedPdfPage] = useState<number>(1);
  const [pageInputVal, setPageInputVal] = useState<string>('1');
  const [renderedPdfDataUrl, setRenderedPdfDataUrl] = useState<string | null>(null);
  const [renderedPdfDimensions, setRenderedPdfDimensions] = useState<{ width: number; height: number } | null>(null);

  // --- Image States ---
  const [rawImageDataUrl, setRawImageDataUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [fileSizeInfo, setFileSizeInfo] = useState<string>('');
  const [fileByteSize, setFileByteSize] = useState<number | undefined>(undefined);
  const [rawImageDimensions, setRawImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [imageFilters, setImageFilters] = useState<ImageFilters>({
    brightness: 1.0,
    contrast: 1.0,
    invert: false,
    grayscale: false,
    highContrastDoc: false,
    rotation: 0
  });

  // File Inputs & Abort Handles
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up PDF resources on modal close or unmount
  useEffect(() => {
    return () => {
      cancelActivePdfRender();
      if (loadedPdf) {
        destroyLoadedPdf(loadedPdf);
      }
    };
  }, [loadedPdf]);

  // Handle Close safely with complete memory release
  const handleSafeClose = () => {
    cancelActivePdfRender();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (loadedPdf) {
      destroyLoadedPdf(loadedPdf);
      setLoadedPdf(null);
    }
    setRenderedPdfDataUrl(null);
    setRawImageDataUrl(null);
    onClose();
  };

  // User manual abort of current loading/rendering task
  const handleAbortCurrentOperation = () => {
    cancelActivePdfRender();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setStatusMessage('');
    setErrorMessage('تم إيقاف المعالجة بطلب من المستخدم.');
  };

  if (!isOpen) return null;

  // Render a specific PDF page safely without loop memory bloat
  const renderSinglePage = async (pdfDoc: any, pageNumber: number, isLowMem: boolean) => {
    setIsLoading(true);
    setStatusMessage(`جاري معالجة الصفحة ${pageNumber} (وضع الحماية من استهلاك الذاكرة)...`);
    setErrorMessage(null);

    try {
      const rendered = await renderPdfPageToDataUrl(pdfDoc, pageNumber, {
        lowMemoryMode: isLowMem,
        maxDimension: isLowMem ? 1400 : 2048,
        quality: isLowMem ? 0.82 : 0.88
      });

      setRenderedPdfDataUrl(rendered.dataUrl);
      setRenderedPdfDimensions({ width: rendered.width, height: rendered.height });
      console.log(`[ImportModal] Page ${pageNumber} rendered safely: ${rendered.width}x${rendered.height} px`);
    } catch (err: any) {
      if (err.message !== 'تم إلغاء معالجة الصفحة') {
        console.error('[ImportModal] Page render error:', err);
        setErrorMessage('تعذر عرض الصفحة: ' + (err.message || 'خطأ في فك تشفير الصفحة'));
      }
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Handle PDF file selection
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset old document if existing
    if (loadedPdf) {
      destroyLoadedPdf(loadedPdf);
      setLoadedPdf(null);
    }
    setRenderedPdfDataUrl(null);

    const sizeFormatted = formatByteSize(file.size);
    setFileSizeInfo(sizeFormatted);
    setFileByteSize(file.size);

    console.log(`[ImportModal] PDF selected: ${file.name}, size: ${sizeFormatted}`);

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('الملف المحدد ليس بصيغة PDF. يرجى اختيار ملف PDF صالح للمخططات الكهربائية.');
      return;
    }

    // Auto-enable low memory mode for large files to avoid Android crash
    const isLargeFile = file.size > 7 * 1024 * 1024;
    const shouldEnforceLowMem = isLargeFile || deviceProfile.isLowMemoryDevice;
    if (shouldEnforceLowMem) {
      setLowMemoryMode(true);
    }
    if (isLargeFile) {
      setFileWarning(`ملف كبير الحجم (${sizeFormatted}) - تم تفعيل نمط توفير الذاكرة للهواتف تلقائياً لتفادي خروج المتصفح.`);
    } else {
      setFileWarning(null);
    }

    setIsLoading(true);
    setStatusMessage('جاري فك تشفير مستند الـ PDF...');
    setErrorMessage(null);
    setPdfFileName(file.name);

    abortControllerRef.current = new AbortController();

    try {
      const pdf = await loadPdfDocument(file, abortControllerRef.current.signal);
      setLoadedPdf(pdf);
      setSelectedPdfPage(1);
      setPageInputVal('1');

      if (pdf.numPages > 15) {
        setFileWarning(`المستند يحتوي على ${pdf.numPages} صفحة. تم تفعيل المعالجة التدريجية الفردية لتوفير الذاكرة.`);
      }

      // Render ONLY page 1 progressively (Never loop all 15 pages!)
      await renderSinglePage(pdf.pdfDoc, 1, shouldEnforceLowMem);
    } catch (err: any) {
      console.error('[ImportModal] PDF loading error:', err);
      setErrorMessage('تعذر قراءة ملف PDF: ' + (err.message || 'الملف قد يكون تالفاً أو غير مدعوم'));
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Change selected PDF page on-demand
  const handleSelectPdfPage = async (pageNumber: number) => {
    if (!loadedPdf) return;
    const clampedPage = Math.max(1, Math.min(loadedPdf.numPages, pageNumber));
    setSelectedPdfPage(clampedPage);
    setPageInputVal(String(clampedPage));

    await renderSinglePage(loadedPdf.pdfDoc, clampedPage, lowMemoryMode);
  };

  // Load built-in sample PDF
  const handleLoadSamplePdf = async () => {
    if (loadedPdf) {
      destroyLoadedPdf(loadedPdf);
      setLoadedPdf(null);
    }
    setRenderedPdfDataUrl(null);

    setIsLoading(true);
    setStatusMessage('جاري تحميل المخطط القياسي المرفق (100 رمز ومخطط كهربائي)...');
    setErrorMessage(null);
    setPdfFileName('industrial_electrical_components_100_symbols.pdf');
    setFileSizeInfo('1.2 MB');
    setFileWarning(null);

    abortControllerRef.current = new AbortController();

    try {
      const pdf = await loadPdfDocument(
        '/assets/aistudio/industrial_electrical_components_100_symbols_c727ffdf.pdf',
        abortControllerRef.current.signal
      );
      setLoadedPdf(pdf);
      setSelectedPdfPage(1);
      setPageInputVal('1');

      // Render single page progressively
      await renderSinglePage(pdf.pdfDoc, 1, lowMemoryMode);
    } catch (err: any) {
      setErrorMessage('تعذر تحميل النموذج التجريبي: ' + err.message);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Handle Image file selection (JPG, PNG, WEBP)
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = formatByteSize(file.size);
    setFileSizeInfo(sizeFormatted);
    setFileByteSize(file.size);

    console.log(`[ImportModal] Image file chosen: ${file.name}, size: ${sizeFormatted}`);

    const isImage = 
      file.type.startsWith('image/') || 
      /\.(jpe?g|png|webp|svg|bmp)$/i.test(file.name);

    if (!isImage) {
      setErrorMessage('صيغة الملف غير مدعومة. يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFileWarning(`صورة عالية الدقة (${sizeFormatted}) - سيتم معالجتها بحدود ذاكرة آمنة لحماية الهاتف.`);
      setLowMemoryMode(true);
    } else {
      setFileWarning(null);
    }

    setIsLoading(true);
    setStatusMessage('جاري قراءة ملف الصورة واستخراج الأبعاد الهندسية...');
    setErrorMessage(null);
    setImageFileName(file.name);

    try {
      const dataUrl = await fileToDataUrl(file);
      setRawImageDataUrl(dataUrl);

      // Measure natural dimensions
      const nativeImg = new Image();
      await new Promise<void>((resolve, reject) => {
        nativeImg.onload = () => resolve();
        nativeImg.onerror = () => reject(new Error('تعذر فك تشفير صورة المخطط'));
        nativeImg.src = dataUrl;
      });

      const naturalW = nativeImg.naturalWidth || 800;
      const naturalH = nativeImg.naturalHeight || 600;
      setRawImageDimensions({ width: naturalW, height: naturalH });

      // Reset filters
      setImageFilters({
        brightness: 1.0,
        contrast: 1.0,
        invert: false,
        grayscale: false,
        highContrastDoc: false,
        rotation: 0
      });
    } catch (err: any) {
      console.error('[ImportModal] Image load error:', err);
      setErrorMessage('فشل تحميل الصورة: ' + (err.message || 'الملف قد يكون تالفاً'));
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Fast GPU CSS filter string for live preview without re-allocating memory
  const previewCssFilter = useMemo(() => {
    const parts = [
      `brightness(${imageFilters.brightness})`,
      `contrast(${imageFilters.contrast})`,
      imageFilters.invert ? 'invert(1)' : '',
      imageFilters.grayscale ? 'grayscale(1)' : '',
      imageFilters.highContrastDoc ? 'contrast(2) brightness(1.1)' : ''
    ];
    return parts.filter(Boolean).join(' ');
  }, [imageFilters]);

  // Finish and insert into workspace
  const handleConfirmImport = async (
    sourceDataUrl: string, 
    width: number, 
    height: number, 
    name: string, 
    type: 'pdf' | 'image' | 'camera' | 'sample'
  ) => {
    setIsLoading(true);
    setStatusMessage('جاري إدراج المخطط في مساحة العمل...');

    try {
      let finalDataUrl = sourceDataUrl;
      let finalW = width;
      let finalH = height;

      // If user rotated or modified image filters on an image file, process once cleanly
      if (type === 'image' && (imageFilters.rotation !== 0 || imageFilters.highContrastDoc)) {
        const processed = await processDiagramImage(sourceDataUrl, imageFilters, undefined, lowMemoryMode);
        finalDataUrl = processed.dataUrl;
        finalW = processed.width;
        finalH = processed.height;
      }

      const diagramId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Safe positive canvas dimensions
      const safeW = finalW > 0 ? finalW : 800;
      const safeH = finalH > 0 ? finalH : 600;
      const targetWidth = Math.min(950, Math.max(500, safeW >= safeH ? 800 : 600));
      const targetHeight = Math.max(300, Math.round(targetWidth * (safeH / safeW)));

      // Center in workspace canvas (1400 x 900)
      const centerX = Math.max(30, Math.round((1400 - targetWidth) / 2));
      const centerY = Math.max(30, Math.round((900 - targetHeight) / 2));

      // Save to bounded IndexedDB storage
      await saveDiagramDataUrl(diagramId, finalDataUrl).catch(err => {
        console.warn('[ImportModal] Storage warning:', err);
      });

      const imported: ImportedDiagram = {
        id: diagramId,
        name,
        sourceType: type,
        dataUrl: finalDataUrl,
        pageNumber: type === 'pdf' ? selectedPdfPage : undefined,
        totalPages: loadedPdf?.numPages,
        fileName: name,
        fileSize: fileByteSize,
        x: centerX,
        y: centerY,
        width: targetWidth,
        height: targetHeight,
        originalWidth: safeW,
        originalHeight: safeH,
        rotation: 0,
        opacity: 0.95,
        isLocked: false,
        isVisible: true,
        hasWhiteBackdrop: true,
        layerPosition: 'front',
        brightness: imageFilters.brightness,
        contrast: imageFilters.contrast,
        grayscale: imageFilters.grayscale,
        invert: imageFilters.invert,
        highContrastDoc: imageFilters.highContrastDoc,
        targetCanvas: 'both',
        createdAt: new Date().toLocaleTimeString('ar-EG')
      };

      console.log('[ImportModal] Successfully inserted diagram into workspace:', imported.name);
      onDiagramImported(imported);
      handleSafeClose();
    } catch (err: any) {
      console.error('[ImportModal] Confirm import error:', err);
      setErrorMessage('حدث خطأ أثناء إدراج المخطط: ' + err.message);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header with Mobile Low Memory Shield Indicator */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Upload className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">استيراد المخططات الهندسية والكهربائية</h3>
                {/* Low Memory Protection Badge */}
                <button
                  onClick={() => setLowMemoryMode(!lowMemoryMode)}
                  className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    lowMemoryMode
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title={lowMemoryMode ? 'نمط توفير الذاكرة نشط (يمنع خروج المتصفح على الهواتف)' : 'انقر لتفعيل نمط توفير الذاكرة للهواتف'}
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{lowMemoryMode ? 'توفير الذاكرة نشط ⚡' : 'دقة عادية'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">إدراج مخططات PDF والصور وكاميرا المسح الضوئي كمرجع تفاعلي هندسي</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile low memory toggle button */}
            <button
              onClick={() => setLowMemoryMode(!lowMemoryMode)}
              className={`sm:hidden p-1.5 rounded-xl border transition ${
                lowMemoryMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="نمط توفير الذاكرة"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={handleSafeClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (PDF / Image / Camera / Samples) */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/60 border-b border-slate-800 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => { setActiveTab('pdf'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'pdf'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>استيراد PDF</span>
          </button>

          <button
            onClick={() => { setActiveTab('image'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'image'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>استيراد صورة (JPG / PNG)</span>
          </button>

          <button
            onClick={() => { setActiveTab('camera'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>مسح بالكاميرا (Camera Scan)</span>
          </button>

          <button
            onClick={() => { setActiveTab('samples'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'samples'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>مخططات ونماذج جاهزة</span>
          </button>
        </div>

        {/* File Warning Banner */}
        {fileWarning && (
          <div className="mx-4 mt-2.5 p-2.5 bg-amber-950/70 border border-amber-500/50 rounded-2xl flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{fileWarning}</span>
            </div>
            <button onClick={() => setFileWarning(null)} className="text-amber-400 hover:text-white px-1">✕</button>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mx-4 mt-2.5 p-2.5 bg-red-950/70 border border-red-500/50 rounded-2xl flex items-center justify-between text-xs text-red-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white px-1">✕</button>
          </div>
        )}

        {/* Tab 1: PDF Import Body */}
        {activeTab === 'pdf' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            {/* Hidden File Input */}
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handlePdfFileSelect}
            />

            {!loadedPdf ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-3xl bg-slate-950/40 text-center space-y-4 transition">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-bold text-white text-base">اختر ملف PDF للمخططات الكهربائية</h4>
                  <p className="text-xs text-slate-400">
                    يدعم ملفات PDF متعددة الصفحات والمخططات الهندسية مع معالجة تدريجية صفحة بصفحة لحماية ذاكرة الهاتف ومنع خروج المتصفح.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 stroke-[3]" />
                    <span>تصفح ملف PDF من جهازك</span>
                  </button>

                  <button
                    onClick={handleLoadSamplePdf}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer border border-slate-700"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>تجربة مخطط الـ 100 رمز النموذجي</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>معالجة آمنة: لا يتم تحميل جميع الصفحات دفعة واحدة، مما يحافظ على استقرار الهاتف.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* PDF Header & Controls */}
                <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white truncate max-w-xs">{pdfFileName}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      {loadedPdf.numPages} صفحات
                    </span>
                    {fileSizeInfo && (
                      <span className="text-[10px] text-slate-400 font-mono">({fileSizeInfo})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLowMemoryMode(!lowMemoryMode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        lowMemoryMode
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {lowMemoryMode ? 'وضع توفير الذاكرة ⚡' : 'وضع الدقة القصوى 🌟'}
                    </button>
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      تغيير الملف
                    </button>
                  </div>
                </div>

                {/* Progressive Page Selector Toolbar (Zero OOM - No massive 15-canvas loops!) */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300 text-xs">الصفحة الحالية:</span>
                    <button
                      disabled={selectedPdfPage <= 1 || isLoading}
                      onClick={() => handleSelectPdfPage(selectedPdfPage - 1)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition cursor-pointer"
                      title="الصفحة السابقة"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 font-mono text-xs">
                      <input
                        type="number"
                        min="1"
                        max={loadedPdf.numPages}
                        value={pageInputVal}
                        onChange={(e) => setPageInputVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt(pageInputVal, 10);
                            if (!isNaN(val)) handleSelectPdfPage(val);
                          }
                        }}
                        className="w-12 px-1.5 py-1 text-center bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold"
                      />
                      <span className="text-slate-400">من {loadedPdf.numPages}</span>
                    </div>

                    <button
                      disabled={selectedPdfPage >= loadedPdf.numPages || isLoading}
                      onClick={() => handleSelectPdfPage(selectedPdfPage + 1)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition cursor-pointer"
                      title="الصفحة التالية"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick-jump Page Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
                    {Array.from({ length: Math.min(10, loadedPdf.numPages) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        disabled={isLoading}
                        onClick={() => handleSelectPdfPage(p)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer shrink-0 ${
                          selectedPdfPage === p
                            ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    {loadedPdf.numPages > 10 && (
                      <span className="text-[10px] text-slate-500 font-mono px-1">... +{loadedPdf.numPages - 10}</span>
                    )}
                  </div>
                </div>

                {/* Page Preview Container */}
                {renderedPdfDataUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>معاينة الصفحة {selectedPdfPage}:</span>
                      </span>
                      {renderedPdfDimensions && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {renderedPdfDimensions.width} × {renderedPdfDimensions.height} px • {lowMemoryMode ? 'توفير الذاكرة' : 'دقة عادية'}
                        </span>
                      )}
                    </div>

                    <div className="max-h-[38vh] overflow-auto p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
                      <img
                        src={renderedPdfDataUrl}
                        alt={`معاينة الصفحة ${selectedPdfPage}`}
                        className="max-h-[35vh] object-contain rounded-lg border border-slate-700/60 shadow-xl bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Image Import Body */}
        {activeTab === 'image' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleImageFileSelect}
            />

            {!rawImageDataUrl ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-3xl bg-slate-950/40 text-center space-y-4 transition">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-bold text-white text-base">اختر صورة المخطط الكهربائي</h4>
                  <p className="text-xs text-slate-400">
                    يدعم JPG و PNG و WEBP مع تحسين التباين، التدوير، ومعالجة محسنة للذاكرة تناسب الهواتف.
                  </p>
                </div>

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 stroke-[3]" />
                  <span>تصفح صورة من جهازك</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Image Toolbar */}
                <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white truncate max-w-xs">{imageFileName}</span>
                    {rawImageDimensions && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({rawImageDimensions.width}×{rawImageDimensions.height})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Rotate */}
                    <button
                      onClick={() => setImageFilters(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="تدوير 90 درجة"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>تدوير ({imageFilters.rotation}°)</span>
                    </button>

                    {/* High Contrast Binarization */}
                    <button
                      onClick={() => setImageFilters(prev => ({ ...prev, highContrastDoc: !prev.highContrastDoc }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        imageFilters.highContrastDoc
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                      title="تحسين الوثائق: جعل الخلفية بيضاء وتغميق الخطوط والرموز"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تباين فائق للرموز</span>
                    </button>

                    {/* Invert */}
                    <button
                      onClick={() => setImageFilters(prev => ({ ...prev, invert: !prev.invert }))}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        imageFilters.invert
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                      title="عكس الألوان"
                    >
                      عكس الألوان
                    </button>

                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                    >
                      تغيير
                    </button>
                  </div>
                </div>

                {/* Brightness & Contrast Sliders (Uses GPU CSS Filters for Zero Memory Lag!) */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>السطوع (Brightness):</span>
                      <span className="font-mono text-amber-400">{Math.round(imageFilters.brightness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={imageFilters.brightness}
                      onChange={(e) => setImageFilters(prev => ({ ...prev, brightness: parseFloat(e.target.value) }))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>التباين (Contrast):</span>
                      <span className="font-mono text-amber-400">{Math.round(imageFilters.contrast * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={imageFilters.contrast}
                      onChange={(e) => setImageFilters(prev => ({ ...prev, contrast: parseFloat(e.target.value) }))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Live Preview (Rendered via Hardware-Accelerated CSS Filters) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 text-xs">معاينة فورية (معالجة فائقة السرعة بدون استهلاك ذاكرة):</span>
                  </div>

                  <div className="max-h-[38vh] overflow-auto p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
                    <img
                      src={rawImageDataUrl}
                      alt="معاينة الصورة"
                      className="max-h-[35vh] object-contain rounded-lg border border-slate-700/60 shadow-xl bg-white transition-all"
                      style={{
                        filter: previewCssFilter,
                        transform: `rotate(${imageFilters.rotation}deg)`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Camera Scan Body */}
        {activeTab === 'camera' && (
          <div className="flex-1 h-[65vh] overflow-hidden">
            <CameraScanView
              onCaptureComplete={(dataUrl, width, height) => {
                handleConfirmImport(dataUrl, width, height, 'مخطط ملتقط بالكاميرا', 'camera');
              }}
              onFallbackToUpload={() => {
                setActiveTab('image');
                setTimeout(() => imageInputRef.current?.click(), 100);
              }}
              onCancel={handleSafeClose}
            />
          </div>
        )}

        {/* Tab 4: Samples Body */}
        {activeTab === 'samples' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">مخططات تحكم كلاسيكي وLadder صناعية نموذجية</h4>
                <p className="text-slate-400 text-xs">مخططات قياسية جاهزة للاستيراد الفوري كمرجع هندسي.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sample 1: DOL Starter Schematic */}
              <div 
                onClick={handleLoadSamplePdf}
                className="p-4 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-2xl transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm group-hover:text-amber-400 transition flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>مخطط تشغيل مباشر DOL (قوى وتحكم)</span>
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">PDF Standard</span>
                </div>
                <p className="text-slate-400 text-xs">مخطط IEC قياسي يحتوي على قاطع Q1، أوفرلود F1، أزرار S0/S1، وكونتاكتور KM1.</p>
                <div className="pt-2 flex items-center text-amber-400 text-xs font-bold gap-1">
                  <span>فتح واستيراد من الـ PDF المرفق</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Sample 2: Star-Delta Automatic Starter */}
              <div 
                onClick={handleLoadSamplePdf}
                className="p-4 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-2xl transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>مخطط ستار دلتا التلقائي Star-Delta</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Timer TON</span>
                </div>
                <p className="text-slate-400 text-xs">مخطط تبديل ملفات المحرك مع مؤقت زمني وعوازل كهربائية لحماية الكونتاكتورات.</p>
                <div className="pt-2 flex items-center text-emerald-400 text-xs font-bold gap-1">
                  <span>فتح واستيراد المخطط</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {activeTab !== 'camera' && (
          <div className="px-4 sm:px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={handleSafeClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              إلغاء
            </button>

            {/* Action Buttons */}
            {activeTab === 'pdf' && renderedPdfDataUrl && renderedPdfDimensions && (
              <button
                onClick={() => handleConfirmImport(
                  renderedPdfDataUrl,
                  renderedPdfDimensions.width,
                  renderedPdfDimensions.height,
                  `مخطط PDF (صفحة ${selectedPdfPage}) - ${pdfFileName}`,
                  'pdf'
                )}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer text-xs"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>إدراج الصفحة {selectedPdfPage} في مساحة العمل</span>
              </button>
            )}

            {activeTab === 'image' && rawImageDataUrl && rawImageDimensions && (
              <button
                onClick={() => handleConfirmImport(
                  rawImageDataUrl,
                  rawImageDimensions.width,
                  rawImageDimensions.height,
                  imageFileName || 'مخطط صورة مستورد',
                  'image'
                )}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer text-xs"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>إدراج الصورة في مساحة العمل</span>
              </button>
            )}
          </div>
        )}

        {/* Loading Overlay with User Abort / Cancel Button */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-30 p-4">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-amber-300 text-xs text-center max-w-sm">{statusMessage}</p>
            <button
              onClick={handleAbortCurrentOperation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-300 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer shadow-md mt-2"
            >
              <StopCircle className="w-3.5 h-3.5 text-red-400" />
              <span>إيقاف المعالجة</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
