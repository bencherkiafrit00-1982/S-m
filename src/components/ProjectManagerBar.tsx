import React, { useRef } from 'react';
import { CircuitProject, CircuitRenderStyle } from '../types/circuit';
import { 
  FolderPlus, 
  FolderOpen, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  Sparkles,
  ChevronDown,
  Layers,
  Cpu
} from 'lucide-react';

interface ProjectManagerBarProps {
  projects: CircuitProject[];
  currentProject: CircuitProject;
  renderStyle?: CircuitRenderStyle;
  onToggleRenderStyle?: (style: CircuitRenderStyle) => void;
  onSelectProject: (project: CircuitProject) => void;
  onOpenNewModal: () => void;
  onSaveCurrentProject: () => void;
  onExportJson: () => void;
  onImportJson: (jsonString: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectManagerBar: React.FC<ProjectManagerBarProps> = ({
  projects,
  currentProject,
  renderStyle = 'schematic',
  onToggleRenderStyle,
  onSelectProject,
  onOpenNewModal,
  onSaveCurrentProject,
  onExportJson,
  onImportJson,
  onDeleteProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJson(content);
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
      {/* Current Project Info & Selector */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Layers className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">المشروع الحالي:</span>
            <div className="relative inline-block">
              <select
                value={currentProject.id}
                onChange={(e) => {
                  const p = projects.find(item => item.id === e.target.value);
                  if (p) onSelectProject(p);
                }}
                className="bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.isCustom ? '★ (مخصص)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
              {currentProject.category}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate max-w-md">
            {currentProject.description}
          </p>
        </div>
      </div>

      {/* Action Buttons & Style Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Render Style Switcher: Schematic Symbols vs Realistic Parts */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1 shadow-inner">
          <button
            onClick={() => onToggleRenderStyle && onToggleRenderStyle('schematic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              renderStyle === 'schematic'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="النمط الأول: رموز تخطيطية قياسية (IEC 60617)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>رموز تخطيطية</span>
          </button>

          <button
            onClick={() => onToggleRenderStyle && onToggleRenderStyle('realistic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              renderStyle === 'realistic'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="النمط الثاني: مكونات وقطع حقيقية (ثلاثية الأبعاد)"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>قطع حقيقية</span>
          </button>
        </div>

        {/* Create New Project */}
        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          title="إنشاء مشروع دائرة جديدة من البداية أو من قالب"
        >
          <FolderPlus className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة مشروع جديد</span>
        </button>

        {/* Save Project */}
        <button
          onClick={onSaveCurrentProject}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          title="حفظ التعديلات على هذا المشروع في المتصفح"
        >
          <Save className="w-4 h-4 text-emerald-400" />
          <span>حفظ المخطط</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={onExportJson}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          title="تصدير المخطط كملف JSON للمشاركة"
        >
          <Download className="w-4 h-4 text-sky-400" />
          <span>تصدير JSON</span>
        </button>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          title="استيراد مخطط دائرة محفوظ من ملف JSON"
        >
          <Upload className="w-4 h-4 text-purple-400" />
          <span>استيراد JSON</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Delete if custom */}
        {currentProject.isCustom && onDeleteProject && (
          <button
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف المشروع "${currentProject.title}"؟`)) {
                onDeleteProject(currentProject.id);
              }
            }}
            className="p-2 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700 transition cursor-pointer"
            title="حذف هذا المشروع المخصص"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
