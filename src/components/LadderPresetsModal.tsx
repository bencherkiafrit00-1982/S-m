import React, { useState } from 'react';
import { CLASSIC_CONTROL_PRESETS } from '../data/ladderPresets';
import { ClassicControlPreset } from '../types/ladder';
import { 
  BookOpen, 
  X, 
  Check, 
  Play, 
  ChevronRight, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface LadderPresetsModalProps {
  isOpen: boolean;
  activePresetId: string;
  onClose: () => void;
  onSelectPreset: (preset: ClassicControlPreset) => void;
}

export const LadderPresetsModal: React.FC<LadderPresetsModalProps> = ({
  isOpen,
  activePresetId,
  onClose,
  onSelectPreset
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ClassicControlPreset>(
    CLASSIC_CONTROL_PRESETS.find(p => p.id === activePresetId) || CLASSIC_CONTROL_PRESETS[0]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full h-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                أمثلة ومشاريع التحكم الكلاسيكي (Classic Control Ladder Presets)
              </h3>
              <p className="text-xs text-slate-400">10 دوائر تعليمية قياسية جاهزة للمحاكاة والربط المباشر مع اللوحة الواقعية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Presets List (Left/Right) */}
          <div className="md:col-span-5 border-l border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950/40">
            {CLASSIC_CONTROL_PRESETS.map((preset, idx) => {
              const isSelected = selectedPreset.id === preset.id;
              const isActive = activePresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`w-full text-right p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{preset.titleAr}</h4>
                      {isActive && (
                        <span className="shrink-0 text-[9px] bg-emerald-950 border border-emerald-500 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          النشط
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">{preset.category}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details & Theory Preview */}
          <div className="md:col-span-7 flex flex-col justify-between p-5 overflow-y-auto bg-slate-900/80 space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-bold">
                  {selectedPreset.category}
                </span>
                <h2 className="text-base sm:text-lg font-black text-white mt-2">
                  {selectedPreset.titleAr}
                </h2>
                <h3 className="text-xs font-mono text-slate-400 mt-0.5">
                  {selectedPreset.titleEn}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {selectedPreset.descriptionAr}
                </p>
              </div>

              {/* Theory Points */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>الشرح الهندسي ومبدأ عمل الدائرة:</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {selectedPreset.theoryAr.map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ladder Rungs Summary */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">ملخص أسطر المخطط (Ladder Rungs):</span>
                <div className="space-y-1">
                  {selectedPreset.ladder.rungs.map(rung => (
                    <div key={rung.id} className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
                      <span className="text-sky-400 font-bold">[{String(rung.rungNumber).padStart(4, '0')}]</span>
                      <span className="text-slate-400 text-xs font-sans truncate">{rung.commentAr}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Load Button */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  onSelectPreset(selectedPreset);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>فتح وتشغيل الدائرة الآن</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
