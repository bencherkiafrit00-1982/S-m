import React, { useState } from 'react';
import { CircuitProject, CircuitComponent, Wire } from '../types/circuit';
import { CIRCUIT_PRESETS } from '../data/presets';
import { createNewComponent } from '../utils/componentFactory';
import { 
  Plus, 
  FolderPlus, 
  Sparkles, 
  Layers, 
  X, 
  Check, 
  Cpu, 
  RotateCw, 
  Clock, 
  FileCode 
} from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: CircuitProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('تحكم صناعي');
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'dol' | 'reverse' | 'timer' | 'pumps'>('blank');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projName = title.trim() || 'مشروع تحكم جديد بدون اسم';
    let initComps: CircuitComponent[] = [];
    let initWires: Wire[] = [];

    if (selectedTemplate === 'blank') {
      // Blank canvas with just power rails ready for drawing!
      initComps = [
        createNewComponent('power_phase', 80, 80, 'L1'),
        createNewComponent('power_neutral', 80, 600, 'N')
      ];
      initWires = [];
    } else if (selectedTemplate === 'dol') {
      const p = CIRCUIT_PRESETS.find(cp => cp.id === 'dol_starter') || CIRCUIT_PRESETS[0];
      initComps = JSON.parse(JSON.stringify(p.components));
      initWires = JSON.parse(JSON.stringify(p.wires));
    } else if (selectedTemplate === 'reverse') {
      const p = CIRCUIT_PRESETS.find(cp => cp.id === 'forward_reverse') || CIRCUIT_PRESETS[3];
      initComps = JSON.parse(JSON.stringify(p.components));
      initWires = JSON.parse(JSON.stringify(p.wires));
    } else if (selectedTemplate === 'timer') {
      const p = CIRCUIT_PRESETS.find(cp => cp.id === 'timer_ton_sequence') || CIRCUIT_PRESETS[4];
      initComps = JSON.parse(JSON.stringify(p.components));
      initWires = JSON.parse(JSON.stringify(p.wires));
    } else if (selectedTemplate === 'pumps') {
      // Twin pumps circuit
      initComps = [
        createNewComponent('power_phase', 60, 60, 'L1'),
        createNewComponent('pushbutton_nc', 60, 180, 'S0_STOP'),
        createNewComponent('pushbutton_no', 60, 310, 'S1_START'),
        createNewComponent('contactor_contact_no', 240, 310, 'KM1-NO'),
        createNewComponent('contactor_coil', 60, 460, 'KM1_PUMP1'),
        createNewComponent('timer_coil', 240, 460, 'KT1'),
        createNewComponent('timer_contact_no', 420, 310, 'KT1-NO'),
        createNewComponent('contactor_coil', 420, 460, 'KM2_PUMP2'),
        createNewComponent('motor_3phase', 640, 200, 'M1_PUMP1'),
        createNewComponent('motor_3phase', 640, 440, 'M2_PUMP2'),
        createNewComponent('power_neutral', 240, 620, 'N')
      ];
      initWires = [
        { id: 'wp1', fromComponentId: initComps[0].id, fromTerminalId: 'L1', toComponentId: initComps[1].id, toTerminalId: '1' },
        { id: 'wp2', fromComponentId: initComps[1].id, fromTerminalId: '2', toComponentId: initComps[2].id, toTerminalId: '3' },
        { id: 'wp3', fromComponentId: initComps[1].id, fromTerminalId: '2', toComponentId: initComps[3].id, toTerminalId: '13' },
        { id: 'wp4', fromComponentId: initComps[2].id, fromTerminalId: '4', toComponentId: initComps[4].id, toTerminalId: 'A1' },
        { id: 'wp5', fromComponentId: initComps[3].id, fromTerminalId: '14', toComponentId: initComps[4].id, toTerminalId: 'A1' },
        { id: 'wp6', fromComponentId: initComps[4].id, fromTerminalId: 'A1', toComponentId: initComps[5].id, toTerminalId: 'A1' },
        { id: 'wp7', fromComponentId: initComps[1].id, fromTerminalId: '2', toComponentId: initComps[6].id, toTerminalId: '17' },
        { id: 'wp8', fromComponentId: initComps[6].id, fromTerminalId: '18', toComponentId: initComps[7].id, toTerminalId: 'A1' },
        { id: 'wp9', fromComponentId: initComps[4].id, fromTerminalId: 'A2', toComponentId: initComps[10].id, toTerminalId: 'N' },
        { id: 'wp10', fromComponentId: initComps[5].id, fromTerminalId: 'A2', toComponentId: initComps[10].id, toTerminalId: 'N' },
        { id: 'wp11', fromComponentId: initComps[7].id, fromTerminalId: 'A2', toComponentId: initComps[10].id, toTerminalId: 'N' }
      ];
    }

    const newProject: CircuitProject = {
      id: `proj_${Date.now()}`,
      title: projName,
      description: description.trim() || 'دائرة تحكم كهروميكانيكية مخصصة تم إنشاؤها عبر SimuRelay Studio.',
      category,
      updatedAt: new Date().toLocaleDateString('ar-EG'),
      components: initComps,
      wires: initWires,
      isCustom: true
    };

    onCreateProject(newProject);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إضافة مشروع دائرة جديد</h3>
              <p className="text-xs text-slate-400">إنشاء مخطط كهروميكانيكي جديد للرسم والمحاكاة وتوليد كود Kotlin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              اسم المشروع / عنوان الدائرة <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: دائرة تشغيل محركين بالتتابع أو تحكم بخط إنتاج"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Description & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                تصنيف المشروع
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="تحكم صناعي">تحكم صناعي (Industrial Control)</option>
                <option value="أتمتة ومؤقتات">أتمتة ومؤقتات (Automation & Timers)</option>
                <option value="حماية وتشغيل محركات">حماية وتشغيل محركات</option>
                <option value="مضخات ومراوح">مضخات ومراوح (Pumps & Fans)</option>
                <option value="تعليم وتدريب">تعليم وتدريب (Educational)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                وصف موجز للمشروع (اختياري)
              </label>
              <input
                type="text"
                placeholder="وظيفة الدائرة أو متطلبات الزبون"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              اختر قالب البداية (Starting Template):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Blank Canvas */}
              <div
                onClick={() => setSelectedTemplate('blank')}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedTemplate === 'blank'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedTemplate === 'blank' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">لوحة فارغة للتصميم من الصفر</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">تبدأ مع مصادر التغذية وتتيح لك إضافة العناصر والأسلاك بحرية</div>
                </div>
              </div>

              {/* Option 2: DOL Starter */}
              <div
                onClick={() => setSelectedTemplate('dol')}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedTemplate === 'dol'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedTemplate === 'dol' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">تشغيل مباشر DOL مع تعشيق</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">دائرة جاهزة بملف KM1 وزري التشغيل والإيقاف وأوفرلود F1</div>
                </div>
              </div>

              {/* Option 3: Forward / Reverse */}
              <div
                onClick={() => setSelectedTemplate('reverse')}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedTemplate === 'reverse'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedTemplate === 'reverse' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <RotateCw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">عكس اتجاه محرك مع قفل متبادل</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">كونتاكتوران KM1 و KM2 مع حماية التشابك الكهربائي NC</div>
                </div>
              </div>

              {/* Option 4: Twin Pumps with Timer */}
              <div
                onClick={() => setSelectedTemplate('pumps')}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedTemplate === 'pumps'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedTemplate === 'pumps' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">تشغيل تتابعي لمضختين بمؤقت</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">تشغيل المضخة الأولى ثم انتقال تلقائي للمضخة الثانية بعد ثوانٍ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>إنشاء المشروع وفتح المحاكي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
