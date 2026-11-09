import React, { useState, useEffect } from 'react';
import { ImportedDiagram, DiagramAnalysisResult, DetectedDiagramElement } from '../types/diagram';
import { analyzeDiagram } from '../engine/diagramAnalyzer';
import { 
  Sparkles, 
  Check, 
  AlertCircle, 
  Cpu, 
  Layers, 
  Activity, 
  ArrowRight, 
  FileCheck, 
  X, 
  Info,
  Zap,
  CheckCircle2,
  ListFilter
} from 'lucide-react';

interface DiagramAnalysisModalProps {
  isOpen: boolean;
  diagram: ImportedDiagram | null;
  onClose: () => void;
  onApplyReconstruction: (result: DiagramAnalysisResult, replaceExisting: boolean) => void;
}

export const DiagramAnalysisModal: React.FC<DiagramAnalysisModalProps> = ({
  isOpen,
  diagram,
  onClose,
  onApplyReconstruction
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiagramAnalysisResult | null>(null);
  const [replaceMode, setReplaceMode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && diagram) {
      setLoading(true);
      analyzeDiagram(diagram)
        .then((res) => {
          setAnalysisResult(res);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, diagram]);

  if (!isOpen || !diagram) return null;

  const toggleElementSelected = (id: string) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      detectedElements: analysisResult.detectedElements.map(el => 
        el.id === id ? { ...el, isSelected: !el.isSelected } : el
      )
    });
  };

  const selectedCount = analysisResult?.detectedElements.filter(e => e.isSelected).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>تحليل المخطط الهندسي واستخراج المكونات</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono">
                  Smart CV Engine
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">فحص الرموز الكهربائية القياسية والأطراف واقتراح إعادة البناء التفاعلي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-slate-300 text-sm">جاري تحليل رموز المخطط والمسارات الكهربائية...</p>
              <p className="text-slate-500 text-xs">استخراج القواطع، الكونتاكتورات، الأوفرلود، والأزرار الضاغطة</p>
            </div>
          ) : analysisResult ? (
            <>
              {/* Important Engineering Notice Required by Prompt */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300 text-xs">تنبيه هندسي للتمييز بين حالات المخطط:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-200 block mb-0.5">1. صورة مرجعية ثابتة:</span>
                      <span>تظهر كخلفية إرشادية للرسم والمطابقة اليدوية.</span>
                    </div>
                    <div className="p-2 bg-cyan-950/50 rounded-xl border border-cyan-500/30">
                      <span className="font-bold text-cyan-200 block mb-0.5">2. مخطط تم تحليل عناصره:</span>
                      <span>رموز وأطراف تم التعرف عليها ومراجعتها حالياً.</span>
                    </div>
                    <div className="p-2 bg-emerald-950/50 rounded-xl border border-emerald-500/30">
                      <span className="font-bold text-emerald-200 block mb-0.5">3. دائرة SimuRelay قابلة للمحاكاة:</span>
                      <span>عناصر وأسلاك حقيقية تتفاعل مع المحرك والأصوات.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Summary Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{analysisResult.titleAr}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      {analysisResult.diagramType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>دقة التعرف: {analysisResult.confidenceScore}%</span>
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{analysisResult.summaryAr}</p>
              </div>

              {/* Detected Elements List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <ListFilter className="w-4 h-4 text-cyan-400" />
                    <span>المكونات والأطراف المكتشفة ({selectedCount} من {analysisResult.detectedElements.length})</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">انقر لتحديد أو استثناء أي عنصر</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {analysisResult.detectedElements.map((el) => (
                    <div
                      key={el.id}
                      onClick={() => toggleElementSelected(el.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                        el.isSelected
                          ? 'bg-slate-950 border-cyan-500/50 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={el.isSelected}
                          onChange={() => {}}
                          className="accent-cyan-500 rounded cursor-pointer"
                        />
                        <span className="font-mono font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {el.tag}
                        </span>
                        <div>
                          <div className="font-bold text-xs">{el.nameAr}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            الأطراف: {el.terminals.join(', ') || 'Standard'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          {Math.round(el.confidence * 100)}% ثقة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reconstruction Options */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">طريقة إضافة العناصر لمساحة العمل:</span>
                  <span className="text-[11px] text-slate-400">
                    {replaceMode 
                      ? 'استبدال الدائرة الحالية بالدائرة المستخرجة' 
                      : 'دمج المكونات مع الدائرة الحالية دون مسح ما قمت برسمه'}
                  </span>
                </div>
                <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setReplaceMode(false)}
                    className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                      !replaceMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    دمج وإضافة
                  </button>
                  <button
                    onClick={() => setReplaceMode(true)}
                    className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                      replaceMode ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    استبدال الدائرة
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs"
          >
            إغلاق المراجعة
          </button>

          {analysisResult && (
            <button
              onClick={() => {
                onApplyReconstruction(analysisResult, replaceMode);
                onClose();
              }}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer text-xs"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>إعادة بناء المخطط كمكونات قابلة للمحاكاة ({selectedCount})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
