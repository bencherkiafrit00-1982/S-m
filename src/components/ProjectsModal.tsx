import React, { useState, useRef } from 'react';
import { CircuitProject, CircuitRenderStyle } from '../types/circuit';
import { 
  FolderPlus, 
  FolderOpen, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  X, 
  Check, 
  Layers, 
  Sparkles,
  Calendar,
  CheckCircle2,
  Cpu,
  SlidersHorizontal,
  Eye,
  Zap,
  ArrowRight
} from 'lucide-react';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: CircuitProject[];
  currentProject: CircuitProject;
  renderStyle?: CircuitRenderStyle;
  onSelectRenderStyle?: (style: CircuitRenderStyle) => void;
  onSelectProject: (project: CircuitProject, style?: CircuitRenderStyle) => void;
  onOpenNewModal: () => void;
  onSaveCurrentProject: () => void;
  onExportJson: () => void;
  onImportJson: (jsonString: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProject,
  renderStyle = 'schematic',
  onSelectRenderStyle,
  onSelectProject,
  onOpenNewModal,
  onSaveCurrentProject,
  onExportJson,
  onImportJson,
  onDeleteProject
}) => {
  const [activeStyle, setActiveStyle] = useState<CircuitRenderStyle>(renderStyle);
  const [deletingProjId, setDeletingProjId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleChange = (newStyle: CircuitRenderStyle) => {
    setActiveStyle(newStyle);
    if (onSelectRenderStyle) {
      onSelectRenderStyle(newStyle);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJson(content);
        onClose();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">لوحة إدارة مشاريع ومخططات الدوائر</h3>
              <p className="text-xs text-slate-400">اختر مشروعاً للعمل عليه، أو أنشئ مخططاً جديداً، أو احفظ وصدر أعمالك</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Render Style Selection Banner (نمط الرموز التخطيطية vs نمط المكونات والقطع الحقيقية) */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>اختر نمط عرض وتصميم دوائر المشاريع:</span>
            </span>
            <span className="text-[11px] text-amber-400/90 font-mono">
              النمط النشط: {activeStyle === 'realistic' ? 'مكونات وقطع حقيقية 🎛️' : 'رموز تخطيطية قياسية 📐'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Style 1: Schematic Symbols (نمط رموز تخطيطية) */}
            <button
              onClick={() => handleStyleChange('schematic')}
              className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between relative group ${
                activeStyle === 'schematic'
                  ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40 text-amber-200'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${activeStyle === 'schematic' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'}`}>
                    <Layers className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">النمط الأول: رموز تخطيطية (Schematic)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">مخطط كهربائي هندسي وفق مواصفات IEC 60617</p>
                  </div>
                </div>

                {activeStyle === 'schematic' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>محدد</span>
                  </span>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300">ملفات KM</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300">ملامسات 13-14</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300">أزرار SB</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300">محرك M 3~</span>
              </div>
            </button>

            {/* Style 2: Realistic Components (نمط مكونات وقطع حقيقية) */}
            <button
              onClick={() => handleStyleChange('realistic')}
              className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between relative group ${
                activeStyle === 'realistic'
                  ? 'bg-purple-500/15 border-purple-500 shadow-md ring-1 ring-purple-500/40 text-purple-200'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${activeStyle === 'realistic' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-purple-400'}`}>
                    <Cpu className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">النمط الثاني: قطع حقيقية (Realistic)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">محاكاة ثلاثية الأبعاد للمكونات الصناعية الحقيقية</p>
                  </div>
                </div>

                {activeStyle === 'realistic' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>محدد</span>
                  </span>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-purple-300">كونتاكتور TeSys</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-purple-300">أزرار ضاغطة</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-purple-300">أوفرلود LRD</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-purple-300">محرك حقيقي</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenNewModal();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 stroke-[2.5]" />
              <span>مشروع جديد (+)</span>
            </button>

            <button
              onClick={onSaveCurrentProject}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>حفظ المخطط الحالي</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              title="تصدير كملف JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>تصدير JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              title="استيراد من JSON"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>استيراد JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Projects List with style previews & actions */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>المشاريع والمخططات المتاحة ({projects.length})</span>
            <span className="text-[11px] font-normal lowercase font-mono text-slate-500">
              انقر لفتح المشروع بالنمط المختار ({activeStyle === 'realistic' ? 'قطع حقيقية' : 'رموز تخطيطية'})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {projects.map(proj => {
              const isSelected = proj.id === currentProject.id;

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj, activeStyle);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {proj.category}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          activeStyle === 'realistic'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {activeStyle === 'realistic' ? <Cpu className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                          <span>{activeStyle === 'realistic' ? 'عرض بقطع حقيقية' : 'عرض برموز تخطيطية'}</span>
                        </span>

                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>النشط</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Component Chips Preview */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.components.slice(0, 5).map(c => (
                        <span key={c.id} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {c.tag}
                        </span>
                      ))}
                      {proj.components.length > 5 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-500">
                          +{proj.components.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-850 text-[11px] text-slate-500 font-mono">
                    <span>{proj.components.length} عناصر • {proj.wires.length} أسلاك</span>
                    
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      {/* Direct Launch Buttons for Both Styles */}
                      <button
                        onClick={() => {
                          handleStyleChange('schematic');
                          onSelectProject(proj, 'schematic');
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-[10px] font-bold transition cursor-pointer"
                        title="فتح المشروع بنمط الرموز التخطيطية"
                      >
                        📐 رموز
                      </button>

                      <button
                        onClick={() => {
                          handleStyleChange('realistic');
                          onSelectProject(proj, 'realistic');
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-800 text-[10px] font-bold transition cursor-pointer"
                        title="فتح المشروع بنمط المكونات والقطع الحقيقية"
                      >
                        🎛️ حقيقي
                      </button>

                      {onDeleteProject && (
                        <div>
                          {deletingProjId === proj.id ? (
                            <div className="flex items-center gap-1 bg-red-950/90 border border-red-500/80 px-2 py-0.5 rounded-lg text-[10px] animate-in fade-in">
                              <span className="text-red-200">حذف؟</span>
                              <button
                                onClick={() => {
                                  onDeleteProject(proj.id);
                                  setDeletingProjId(null);
                                }}
                                className="text-red-400 hover:text-white font-bold px-1"
                              >
                                نعم
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                onClick={() => setDeletingProjId(null)}
                                className="text-slate-400 hover:text-white px-1"
                              >
                                لا
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingProjId(proj.id)}
                              className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                              title="حذف هذا المشروع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

