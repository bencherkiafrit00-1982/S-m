import React, { useState, useMemo } from 'react';
import { INDUSTRIAL_100_COMPONENTS, ComponentDefinition } from '../data/industrial100Components';
import { SchematicSymbol } from './SchematicSymbol';
import { RealisticThumbnail } from './RealisticThumbnail';
import { 
  Search, 
  X, 
  Plus, 
  Layers, 
  List, 
  LayoutGrid
} from 'lucide-react';

interface ComponentsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (componentDef: ComponentDefinition) => void;
}

export const ComponentsLibraryModal: React.FC<ComponentsLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectComponent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list'); // Default to standard list per user request

  const categories = [
    'الكل',
    'قواطع وحماية',
    'مفاتيح وأزرار',
    'كونتاكتورات ومرحلات',
    'ملامسات وأطراف',
    'أحمال ومحركات',
    'إشارات وبيان',
    'تغذية ومحولات',
    'قياس ومراقبة',
    'حساسات صناعية',
    'أتمتة و PLC'
  ];

  const filteredComponents = useMemo(() => {
    return INDUSTRIAL_100_COMPONENTS.filter(comp => {
      const matchesCategory = selectedCategory === 'الكل' || comp.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch = 
        comp.tag.toLowerCase().includes(query) ||
        comp.nameAr.toLowerCase().includes(query) ||
        comp.nameEn.toLowerCase().includes(query) ||
        comp.nameFr.toLowerCase().includes(query) ||
        comp.id.toString() === query;

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-3xl bg-slate-900 border-0 sm:border sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Compact & Mobile Friendly */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  مكتبة المكونات الكهربائية
                </h3>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                  100 عنصر
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle List / Grid */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewLayout === 'list' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="عرض قائمة عادية"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewLayout === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="عرض شبكي"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 space-y-2 shrink-0">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرمز (KM1, QF, SB1, M1, KT1...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                مسح
              </button>
            )}
          </div>

          {/* Category Chips - Fast Scroll on Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Components View: Standard List (Default) or Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {filteredComponents.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center">
              <Search className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-semibold">لم يتم العثور على عنصر يطابق "{searchQuery}"</p>
              <p className="text-xs text-slate-500 mt-1">جرب البحث بكلمة مثل: قاطع، مرحل، محرك، زر</p>
            </div>
          ) : viewLayout === 'list' ? (
            /* Standard Vertical List View - Highly usable & intuitive */
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              {filteredComponents.map(comp => (
                <div
                  key={comp.id}
                  onClick={() => {
                    onSelectComponent(comp);
                    onClose();
                  }}
                  className="group flex items-center justify-between px-3 py-2.5 hover:bg-slate-800/70 transition cursor-pointer select-none"
                >
                  {/* Right side: Symbol thumbnail + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Realistic Component Thumbnail Box */}
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center p-1 group-hover:border-amber-500/50 group-hover:bg-slate-800/80 transition shadow-inner">
                      <RealisticThumbnail
                        tag={comp.tag}
                        category={comp.category}
                        symbolType={comp.symbolSvg}
                        width={32}
                        height={32}
                      />
                    </div>

                    {/* Component Name and Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 truncate transition">
                          {comp.nameAr}
                        </span>
                        <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700/60">
                          {comp.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
                        <span className="truncate">{comp.nameEn}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500 shrink-0">{comp.category}</span>
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <span className="text-slate-500 shrink-0 hidden sm:inline">{comp.terminals.length} أطراف</span>
                      </div>
                    </div>
                  </div>

                  {/* Left Action: Quick Insert Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComponent(comp);
                      onClose();
                    }}
                    className="shrink-0 mr-2 flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold rounded-lg border border-amber-500/30 transition cursor-pointer"
                    title="إدراج في اللوحة"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إدراج</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Compact Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredComponents.map(comp => (
                <div
                  key={comp.id}
                  onClick={() => {
                    onSelectComponent(comp);
                    onClose();
                  }}
                  className="group relative p-2.5 bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/60 rounded-xl transition cursor-pointer flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-500">#{comp.id}</span>
                    <span className="px-1.5 py-0.2 bg-slate-800 text-amber-400 rounded text-[10px] font-mono font-bold">
                      {comp.tag}
                    </span>
                  </div>

                  <div className="h-16 flex items-center justify-center bg-slate-900/90 rounded-lg p-1.5 my-1 border border-slate-800/80 shadow-inner group-hover:border-amber-500/40 transition">
                    <RealisticThumbnail
                      tag={comp.tag}
                      category={comp.category}
                      symbolType={comp.symbolSvg}
                      width={38}
                      height={38}
                    />
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate mt-1">
                    {comp.nameAr}
                  </h4>
                  <span className="text-[10px] text-slate-500 truncate">{comp.nameEn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            العناصر: <strong>{filteredComponents.length}</strong> من <strong>100</strong>
          </span>
          <span className="text-[11px] text-slate-500">
            انقر على أي سطر لإضافته مباشرة للوحة
          </span>
        </div>

      </div>
    </div>
  );
};
