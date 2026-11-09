import React from 'react';
import { CIRCUIT_PRESETS } from '../data/presets';
import { CircuitPreset } from '../types/circuit';
import { BookOpen, Sparkles, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface EducationalWalkthroughProps {
  currentPreset: CircuitPreset;
  onSelectPreset: (preset: CircuitPreset) => void;
}

export const EducationalWalkthrough: React.FC<EducationalWalkthroughProps> = ({
  currentPreset,
  onSelectPreset
}) => {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
      {/* Preset Selector Tabs */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>مكتبة الدوائر التعليمية والصناعية الجاهزة (Circuit Presets)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CIRCUIT_PRESETS.map(preset => {
            const isSelected = preset.id === currentPreset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-4 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {preset.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مُفعّل</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {preset.titleAr}
                  </h4>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono truncate">
                  {preset.titleEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Preset Deep Dive & Operation Steps */}
      <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-4">
        <div>
          <span className="text-xs font-bold text-amber-400 font-mono">
            الشرح النظري والخطوات التشغيلية للدائرة:
          </span>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {currentPreset.descriptionAr}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            تسلسل سريان التيار الكهروميكانيكي (Step-by-Step Sequence):
          </span>
          <div className="grid grid-cols-1 gap-2">
            {currentPreset.theoryAr.map((step, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-850 text-xs text-slate-300"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
