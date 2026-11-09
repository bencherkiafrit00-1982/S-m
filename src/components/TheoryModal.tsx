import React from 'react';
import { EducationalWalkthrough } from './EducationalWalkthrough';
import { CircuitPreset } from '../types/circuit';
import { X, BookOpen } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: CircuitPreset;
  onSelectPreset: (preset: CircuitPreset) => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  onSelectPreset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">الدليل التعليمي وخطوات تشغيل الدوائر الصناعية</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <EducationalWalkthrough
            currentPreset={currentPreset}
            onSelectPreset={onSelectPreset}
          />
        </div>
      </div>
    </div>
  );
};
