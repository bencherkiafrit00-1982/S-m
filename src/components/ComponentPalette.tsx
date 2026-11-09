import React, { useState } from 'react';
import { ComponentType } from '../types/circuit';
import { SchematicSymbol } from './SchematicSymbol';
import { RealisticThumbnail } from './RealisticThumbnail';
import { 
  Plus, 
  FolderPlus
} from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
  onOpenNewProjectModal: () => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onAddComponent,
  onOpenNewProjectModal
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'control' | 'switching' | 'loads'>('all');

  const paletteItems: { type: ComponentType; name: string; tag: string; category: string; thumbCategory: string; symbolSvg: string; color: string }[] = [
    { type: 'circuit_breaker', name: 'قاطع آلي (MCB C16)', tag: 'Q1', category: 'switching', thumbCategory: 'قواطع وحماية', symbolSvg: 'breaker_mcb', color: 'text-sky-400' },
    { type: 'pushbutton_no', name: 'زر تشغيل (NO)', tag: 'S1', category: 'control', thumbCategory: 'مفاتيح وأزرار', symbolSvg: 'pushbutton_no', color: 'text-emerald-400' },
    { type: 'pushbutton_nc', name: 'زر إيقاف (NC)', tag: 'S0', category: 'control', thumbCategory: 'مفاتيح وأزرار', symbolSvg: 'pushbutton_nc', color: 'text-red-400' },
    { type: 'contactor_coil', name: 'ملف كونتاكتور', tag: 'KM1', category: 'switching', thumbCategory: 'كونتاكتورات ومرحلات', symbolSvg: 'contactor_coil', color: 'text-blue-400' },
    { type: 'contactor_contact_no', name: 'نقطة مساعدة (NO)', tag: '13-14', category: 'switching', thumbCategory: 'ملامسات وأطراف', symbolSvg: 'contact_no', color: 'text-amber-400' },
    { type: 'contactor_contact_nc', name: 'نقطة قفل (NC)', tag: '21-22', category: 'switching', thumbCategory: 'ملامسات وأطراف', symbolSvg: 'contact_nc', color: 'text-purple-400' },
    { type: 'timer_coil', name: 'مؤقت On-Delay', tag: 'KT1', category: 'control', thumbCategory: 'كونتاكتورات ومرحلات', symbolSvg: 'timer_coil', color: 'text-amber-400' },
    { type: 'timer_contact_no', name: 'نقطة مؤقت (NO)', tag: '17-18', category: 'control', thumbCategory: 'ملامسات وأطراف', symbolSvg: 'timer_contact_no', color: 'text-amber-300' },
    { type: 'thermal_overload', name: 'مرحل حراري F1', tag: '95-96', category: 'switching', thumbCategory: 'قواطع وحماية', symbolSvg: 'thermal_overload', color: 'text-red-300' },
    { type: 'motor_3phase', name: 'محرك 3 أطوار', tag: 'M1', category: 'loads', thumbCategory: 'أحمال ومحركات', symbolSvg: 'motor_3phase', color: 'text-teal-400' },
    { type: 'pilot_lamp', name: 'مصباح بيان', tag: 'H1', category: 'loads', thumbCategory: 'إشارات وبيان', symbolSvg: 'pilot_lamp', color: 'text-emerald-300' },
    { type: 'power_phase', name: 'طور (Phase L1)', tag: 'L1', category: 'control', thumbCategory: 'تغذية ومحولات', symbolSvg: 'power_phase', color: 'text-amber-400' },
    { type: 'power_neutral', name: 'محايد (Neutral N)', tag: 'N', category: 'control', thumbCategory: 'تغذية ومحولات', symbolSvg: 'power_neutral', color: 'text-sky-400' }
  ];

  const filteredItems = activeCategory === 'all' 
    ? paletteItems 
    : paletteItems.filter(item => item.category === activeCategory);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">رموز العناصر التخطيطية (SimuRelay Palette)</span>
          <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full font-mono">
            رموز IEC القياسية
          </span>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>مشروع جديد (+)</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
            activeCategory === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          الكل ({paletteItems.length})
        </button>
        <button
          onClick={() => setActiveCategory('control')}
          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
            activeCategory === 'control' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          التحكم والتغذية
        </button>
        <button
          onClick={() => setActiveCategory('switching')}
          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
            activeCategory === 'switching' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          الكونتاكتورات والحماية
        </button>
        <button
          onClick={() => setActiveCategory('loads')}
          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
            activeCategory === 'loads' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          الأحمال والمحركات
        </button>
      </div>

      {/* Items Grid with Schematic Symbols */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
        {filteredItems.map(item => (
          <button
            key={item.type + item.name}
            onClick={() => onAddComponent(item.type)}
            className="flex items-center gap-2 p-2 bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/50 rounded-xl transition text-right group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
              <RealisticThumbnail tag={item.tag} category={item.thumbCategory} symbolType={item.symbolSvg} width={28} height={28} />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition truncate">
                {item.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {item.tag}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
