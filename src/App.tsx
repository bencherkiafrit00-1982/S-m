import React, { useState, useEffect, useRef } from 'react';
import { CIRCUIT_PRESETS } from './data/presets';
import { CircuitComponent, Wire, CircuitProject, ComponentType, CircuitRenderStyle } from './types/circuit';
import { solveCircuit } from './engine/simulationEngine';
import { createComponentFromDefinition } from './utils/componentFactory';
import { ComponentDefinition } from './data/industrial100Components';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { ComponentsLibraryModal } from './components/ComponentsLibraryModal';
import { ProjectsModal } from './components/ProjectsModal';
import { NewProjectModal } from './components/NewProjectModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { TheoryModal } from './components/TheoryModal';
import { AnalysisModal } from './components/AnalysisModal';
import { ImportDiagramModal } from './components/ImportDiagramModal';
import { DiagramAnalysisModal } from './components/DiagramAnalysisModal';
import { ImportedDiagram, DiagramAnalysisResult } from './types/diagram';
import { reconstructCircuitFromAnalysis } from './engine/diagramAnalyzer';
import { getDiagramDataUrl, deleteDiagramData } from './utils/diagramStorage';
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCw, 
  Smartphone, 
  FileText, 
  BookOpen, 
  Terminal, 
  Layers, 
  Plus,
  FolderOpen,
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  Wrench,
  Menu,
  X,
  Save,
  Cpu,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Volume1,
  Split,
  Eye,
  EyeOff,
  Activity,
  Maximize2,
  Upload,
  Sparkles,
  Lock,
  Unlock,
  Sliders
} from 'lucide-react';
import { soundEngine } from './engine/soundEngine';
import { LadderCanvas } from './components/LadderCanvas';
import { LadderPresetsModal } from './components/LadderPresetsModal';
import { CLASSIC_CONTROL_PRESETS } from './data/ladderPresets';
import { evaluateLadderDiagram } from './engine/ladderEngine';
import { LadderDiagram, ViewMode, ClassicControlPreset } from './types/ladder';


// Initial projects from presets
const INITIAL_PROJECTS: CircuitProject[] = CIRCUIT_PRESETS.map(p => ({
  id: p.id,
  title: p.titleAr,
  description: p.descriptionAr,
  category: p.category,
  updatedAt: new Date().toLocaleDateString('ar-EG'),
  components: p.components,
  wires: p.wires,
  isCustom: false
}));

export default function App() {
  // Modals state
  const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAndroidCodeModalOpen, setIsAndroidCodeModalOpen] = useState(false);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isLadderPresetsModalOpen, setIsLadderPresetsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDiagramAnalysisModalOpen, setIsDiagramAnalysisModalOpen] = useState(false);
  const [importedDiagram, setImportedDiagram] = useState<ImportedDiagram | null>(null);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Classic Control – Ladder Diagram States
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('simurelay_view_mode');
      if (saved === 'split_view' || saved === 'classic_ladder' || saved === 'real_circuit') {
        return saved as ViewMode;
      }
    } catch (e) {
      console.error(e);
    }
    return 'split_view';
  });

  const [activeClassicPresetId, setActiveClassicPresetId] = useState<string>(CLASSIC_CONTROL_PRESETS[0].id);
  const [ladderDiagram, setLadderDiagram] = useState<LadderDiagram>(() => 
    JSON.parse(JSON.stringify(CLASSIC_CONTROL_PRESETS[0].ladder))
  );
  const [syncWithHardware, setSyncWithHardware] = useState<boolean>(true);

  // Projects State
  const [projects, setProjects] = useState<CircuitProject[]>(() => {
    try {
      // Clear legacy storage to ensure old presets are completely removed
      localStorage.removeItem('simurelay_saved_projects_v2');
      const saved = localStorage.getItem('simurelay_saved_projects_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep custom user projects, while ensuring the 10 standard educational presets are fresh
          const customProjects = parsed.filter((p: CircuitProject) => p.isCustom);
          return [...INITIAL_PROJECTS, ...customProjects];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROJECTS;
  });

  const [currentProject, setCurrentProject] = useState<CircuitProject>(projects[0]);
  const [components, setComponents] = useState<CircuitComponent[]>(projects[0].components);
  const [wires, setWires] = useState<Wire[]>(projects[0].wires);

  const [projectToDelete, setProjectToDelete] = useState<CircuitProject | null>(null);
  const [appMode, setAppMode] = useState<'design' | 'run'>('design');
  const [isSimulating, setIsSimulating] = useState(false);
  const [shortCircuit, setShortCircuit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] جاهزية محاكي الدوائر الكهروميكانيكية v3.2`,
    `[${new Date().toLocaleTimeString()}] المخطط النشط: ${projects[0].title}`,
    `[${new Date().toLocaleTimeString()}] الوضع الحالي: وضع الإنشاء والتصميم (سحب، تدوير، توصيل أسلاك)`
  ]);

  const handleClearAllWires = () => {
    setWires([]);
    showToast('تم حذف كافة أسلاك التوصيل بنجاح ✂️');
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] تم مسح وحذف كافة أسلاك الدائرة`,
      ...prev.slice(0, 8)
    ]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [renderStyle, setRenderStyle] = useState<CircuitRenderStyle>(() => {
    try {
      const saved = localStorage.getItem('simurelay_render_style');
      if (saved === 'realistic' || saved === 'schematic') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'realistic';
  });

  const handleSetRenderStyle = (style: CircuitRenderStyle) => {
    setRenderStyle(style);
    try {
      localStorage.setItem('simurelay_render_style', style);
    } catch (e) {
      console.error(e);
    }
    showToast(style === 'realistic' ? 'نمط المكونات والقطع الحقيقية 🎛️' : 'نمط الرموز التخطيطية القياسية 📐');
  };

  // Restore active reference diagram on reload or initial mount
  useEffect(() => {
    try {
      const savedMeta = localStorage.getItem('simurelay_active_diagram_meta');
      if (savedMeta) {
        const parsed: ImportedDiagram = JSON.parse(savedMeta);
        if (parsed && parsed.id) {
          getDiagramDataUrl(parsed.id).then(storedDataUrl => {
            if (storedDataUrl) {
              setImportedDiagram({ ...parsed, dataUrl: storedDataUrl });
              console.log('[App] Restored active diagram from storage on mount:', parsed.name);
            } else if (parsed.dataUrl) {
              setImportedDiagram(parsed);
            }
          }).catch(err => {
            console.warn('[App] Error retrieving diagram dataUrl:', err);
          });
        }
      }
    } catch (e) {
      console.warn('[App] Error reading active diagram metadata:', e);
    }
  }, []);

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('simurelay_view_mode', mode);
    } catch (e) {
      console.error(e);
    }
    const label = 
      mode === 'split_view' ? 'عرض مقسّم: لوحة واقعية + مخطط Ladder ⚡' :
      mode === 'classic_ladder' ? 'مخطط التحكم الكلاسيكي Ladder Diagram 📐' :
      'لوحة المكونات الكهروميكانيكية الواقعية 🎛️';
    showToast(label);
  };

  const ladderDiagramRef = useRef(ladderDiagram);
  useEffect(() => {
    ladderDiagramRef.current = ladderDiagram;
  }, [ladderDiagram]);

  const syncWithHardwareRef = useRef(syncWithHardware);
  useEffect(() => {
    syncWithHardwareRef.current = syncWithHardware;
  }, [syncWithHardware]);

  // Single-scan execution for educational step-by-step
  const handleSingleScanStep = () => {
    const ladderResult = evaluateLadderDiagram(
      ladderDiagramRef.current,
      components,
      0.05,
      syncWithHardwareRef.current
    );
    setLadderDiagram(ladderResult.ladder);
    ladderDiagramRef.current = ladderResult.ladder;
    setComponents(ladderResult.hardwareComponents);
    showToast(`دورة مسح واحدة: Scan #${ladderResult.ladder.scanCount} (${ladderResult.ladder.scanCycleMs} ms) ⚡`);
  };

  // Interactive Ladder contact click (pulses physical pushbuttons or toggles overload/breaker)
  const handleContactClick = (tag: string, linkedTag?: string) => {
    const targetTag = linkedTag || tag;
    const targetComp = components.find(c => 
      c.tag.toUpperCase() === targetTag.toUpperCase() ||
      c.tag.toLowerCase() === targetTag.toLowerCase() ||
      c.id.toLowerCase().includes(targetTag.toLowerCase())
    );

    if (targetComp) {
      if (targetComp.type === 'pushbutton_no' || targetComp.type === 'pushbutton_nc') {
        handleButtonPress(targetComp.id, true);
        setTimeout(() => {
          handleButtonPress(targetComp.id, false);
        }, 280);
        showToast(`تم النقر على المفتاح ${targetComp.tag} في اللوحة ⚡`);
      } else if (targetComp.type === 'thermal_overload' || targetComp.type === 'circuit_breaker') {
        handleOverloadToggle(targetComp.id);
      }
    } else {
      // Internal memory bit toggle
      setLadderDiagram(prev => ({
        ...prev,
        memoryBits: {
          ...prev.memoryBits,
          [targetTag]: !prev.memoryBits[targetTag]
        }
      }));
      showToast(`تم تبديل بت الذاكرة ${targetTag}`);
    }
  };

  // Select Classic Control Preset
  const handleSelectClassicPreset = (preset: ClassicControlPreset) => {
    setActiveClassicPresetId(preset.id);
    const ladderCopy = JSON.parse(JSON.stringify(preset.ladder));
    setLadderDiagram(ladderCopy);
    ladderDiagramRef.current = ladderCopy;
    const compsCopy = JSON.parse(JSON.stringify(preset.hardwareComponents));
    const wiresCopy = JSON.parse(JSON.stringify(preset.hardwareWires));
    setComponents(compsCopy);
    setWires(wiresCopy);
    setIsLadderPresetsModalOpen(false);

    const updatedProj: CircuitProject = {
      id: preset.id,
      title: preset.titleAr,
      description: preset.descriptionAr,
      category: preset.category,
      updatedAt: new Date().toLocaleDateString('ar-EG'),
      components: compsCopy,
      wires: wiresCopy,
      isCustom: false
    };
    setCurrentProject(updatedProj);
    showToast(`تم تحميل دائرة: ${preset.titleAr} ⚡`);
  };

  // Sound Engine & Motor Audio State
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getIsMuted());
  const [soundVolume, setSoundVolume] = useState<number>(soundEngine.getVolume());
  const [motorAudiblyRunning, setMotorAudiblyRunning] = useState<boolean>(false);

  const handleToggleMute = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
    showToast(next ? 'تم كتم أصوات المحركات والمعدات 🔇' : 'تم تفعيل أصوات المحركات والمعدات 🔊');
  };

  const handleVolumeChange = (vol: number) => {
    soundEngine.setVolume(vol);
    setSoundVolume(vol);
    if (isMuted && vol > 0) {
      soundEngine.setMuted(false);
      setIsMuted(false);
    }
  };

  const persistProjects = (updatedProjects: CircuitProject[]) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem('simurelay_saved_projects_v3', JSON.stringify(updatedProjects));
    } catch (e) {
      console.error(e);
    }
  };

  // Switch Active Project
  const handleSelectProject = (project: CircuitProject, targetStyle?: CircuitRenderStyle) => {
    if (targetStyle) {
      setRenderStyle(targetStyle);
      try {
        localStorage.setItem('simurelay_render_style', targetStyle);
      } catch (e) {
        console.error(e);
      }
    }
    setCurrentProject(project);
    setComponents(JSON.parse(JSON.stringify(project.components)));
    setWires(JSON.parse(JSON.stringify(project.wires)));
    setShortCircuit(false);

    // Synchronize ladder diagram if this project has a matching ladder preset
    const matchingLadder = CLASSIC_CONTROL_PRESETS.find(lp => 
      lp.id === project.id ||
      (project.id === 'reverse_interlock' && lp.id === 'forward_reverse') ||
      (project.id === 'timer_control' && lp.id === 'timer_ton_sequence') ||
      (project.id === 'star_delta' && lp.id === 'star_delta') ||
      (project.id === 'two_motors_seq' && lp.id === 'two_motors_sequential') ||
      (project.id === 'overload_fault' && lp.id === 'thermal_overload_protection') ||
      (project.id === 'emergency_stop' && lp.id === 'emergency_stop_safety')
    );

    if (matchingLadder) {
      setActiveClassicPresetId(matchingLadder.id);
      const ladderCopy = JSON.parse(JSON.stringify(matchingLadder.ladder));
      setLadderDiagram(ladderCopy);
      ladderDiagramRef.current = ladderCopy;
    }

    // Restore imported reference diagram if project contains one
    if (project.importedDiagram) {
      const diagramCopy = { ...project.importedDiagram };
      if (!diagramCopy.dataUrl) {
        getDiagramDataUrl(diagramCopy.id).then(stored => {
          if (stored) {
            setImportedDiagram({ ...diagramCopy, dataUrl: stored });
          } else {
            setImportedDiagram(diagramCopy);
          }
        });
      } else {
        setImportedDiagram(diagramCopy);
      }
      try {
        const metaOnly = { ...diagramCopy, dataUrl: '' };
        localStorage.setItem('simurelay_active_diagram_meta', JSON.stringify(metaOnly));
      } catch {}
    } else {
      setImportedDiagram(null);
      try {
        localStorage.removeItem('simurelay_active_diagram_meta');
      } catch {}
    }

    showToast(`تم فتح: ${project.title}`);
  };

  // Diagram Handlers
  const handleUpdateImportedDiagram = (updates: Partial<ImportedDiagram>) => {
    setImportedDiagram(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setCurrentProject(curr => ({ ...curr, importedDiagram: updated }));
      try {
        const metaOnly = { ...updated, dataUrl: '' };
        localStorage.setItem('simurelay_active_diagram_meta', JSON.stringify(metaOnly));
      } catch {}
      return updated;
    });
  };

  const handleRemoveImportedDiagram = () => {
    if (importedDiagram) {
      deleteDiagramData(importedDiagram.id);
    }
    try {
      localStorage.removeItem('simurelay_active_diagram_meta');
    } catch {}
    setImportedDiagram(null);
    setCurrentProject(curr => ({ ...curr, importedDiagram: undefined }));
    showToast('تمت إزالة المخطط المرجعي من مساحة العمل');
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] تم حذف المخطط المرجعي`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleDiagramImported = (diag: ImportedDiagram) => {
    setImportedDiagram(diag);
    setCurrentProject(curr => ({ ...curr, importedDiagram: diag }));
    try {
      const metaOnly = { ...diag, dataUrl: '' };
      localStorage.setItem('simurelay_active_diagram_meta', JSON.stringify(metaOnly));
    } catch (err) {
      console.warn('[App] Error storing diagram metadata in localStorage:', err);
    }
    showToast(`تم استيراد المخطط "${diag.name}" وإدراجه في مساحة العمل بنجاح! 📐`);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] استيراد مخطط: ${diag.name} (${diag.sourceType}) [موقع: x:${diag.x}, y:${diag.y}, أبعاد: ${diag.width}x${diag.height}]`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleApplyDiagramReconstruction = (result: DiagramAnalysisResult, replaceExisting: boolean) => {
    const reconstructed = reconstructCircuitFromAnalysis(result, components, wires, replaceExisting);
    setComponents(reconstructed.components);
    setWires(reconstructed.wires);
    showToast(`تمت إعادة بناء ${result.detectedElements.filter(e => e.isSelected).length} مكونات قابلة للمحاكاة بنجاح ⚡`);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] إعادة بناء المخطط: ${result.titleAr} (${result.detectedElements.length} مكون)`,
      ...prev.slice(0, 8)
    ]);
  };

  // Create New Project Handler
  const handleCreateProject = (newProject: CircuitProject) => {
    const updated = [newProject, ...projects];
    persistProjects(updated);
    handleSelectProject(newProject);
    showToast(`تم إنشاء المشروع "${newProject.title}" بنجاح!`);
  };

  // Save Current Project
  const handleSaveCurrentProject = () => {
    const updated = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          components: JSON.parse(JSON.stringify(components)),
          wires: JSON.parse(JSON.stringify(wires)),
          importedDiagram: importedDiagram ? { ...importedDiagram } : undefined,
          updatedAt: new Date().toLocaleDateString('ar-EG')
        };
      }
      return p;
    });
    persistProjects(updated);
    showToast('تم حفظ تعديلات المخطط والمراجع بنجاح ✓');
  };

  // Delete Project Handler
  const handleDeleteProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    const filtered = projects.filter(p => p.id !== projectId);
    
    if (filtered.length === 0) {
      // Create empty default project if all projects are deleted
      const emptyProj: CircuitProject = {
        id: `proj_empty_${Date.now()}`,
        title: 'مشروع جديد فارغ',
        description: 'مخطط دائرة تحكم كهربائي صناعي فارغ للبدء من الصفر',
        category: 'مخطط جديد',
        updatedAt: new Date().toLocaleDateString('ar-EG'),
        components: [],
        wires: [],
        isCustom: true
      };
      persistProjects([emptyProj]);
      handleSelectProject(emptyProj);
    } else {
      persistProjects(filtered);
      if (currentProject.id === projectId) {
        handleSelectProject(filtered[0]);
      }
    }
    showToast(`تم حذف المشروع "${target?.title || ''}" بنجاح 🗑️`);
  };

  // Component 90-degree Rotation Handler
  const handleComponentRotate = (compId: string) => {
    setComponents(prev => prev.map(c => {
      if (c.id === compId) {
        const nextRotation = ((c.rotation || 0) + 90) % 360;
        return { ...c, rotation: nextRotation };
      }
      return c;
    }));
    const comp = components.find(c => c.id === compId);
    showToast(`تم تدوير ${comp?.tag || 'المكون'} بمقدار 90° 🔄`);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] تم تدوير المكون ${comp?.tag} ➔ ${(((comp?.rotation || 0) + 90) % 360)}°`,
      ...prev.slice(0, 8)
    ]);
  };

  // Export JSON
  const handleExportJson = () => {
    const data = {
      project: {
        ...currentProject,
        components,
        wires,
        importedDiagram: importedDiagram || undefined
      },
      exportedAt: new Date().toISOString(),
      version: '3.2'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.replace(/\s+/g, '_')}_circuit.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تصدير ملف المشروع JSON بنجاح');
  };

  // Import JSON
  const handleImportJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const projData = parsed.project || parsed;
      if (!projData.components || !Array.isArray(projData.components)) {
        throw new Error('ملف JSON غير صالح');
      }
      const importedProj: CircuitProject = {
        id: `proj_imported_${Date.now()}`,
        title: projData.title || 'مشروع مستورد',
        description: projData.description || 'مخطط كهربائي مستورد',
        category: projData.category || 'تحكم صناعي',
        updatedAt: new Date().toLocaleDateString('ar-EG'),
        components: projData.components,
        wires: projData.wires || [],
        importedDiagram: projData.importedDiagram || undefined,
        isCustom: true
      };
      handleCreateProject(importedProj);
    } catch (err: any) {
      alert(`فشل استيراد الملف: ${err.message || 'صيغة غير صالحة'}`);
    }
  };

  // Reset to initial preset state
  const handleReset = () => {
    handleSelectProject(currentProject);
  };

  // Add Component from the 100 PDF Definitions
  const handleSelect100Component = (def: ComponentDefinition) => {
    const x = 160 + (components.length % 5) * 80;
    const y = 160 + (components.length % 4) * 90;
    const newComp = createComponentFromDefinition(def, x, y);
    setComponents(prev => [...prev, newComp]);
    showToast(`تمت إضافة: ${def.nameAr} (${def.tag}) إلى اللوحة`);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] تم إدراج مكون من مكتبة الـ 100: ${def.nameAr} (${def.tag})`,
      ...prev.slice(0, 8)
    ]);
  };

  // Delete Component
  const handleComponentDelete = (compId: string) => {
    const comp = components.find(c => c.id === compId);
    setComponents(prev => prev.filter(c => c.id !== compId));
    setWires(prev => prev.filter(w => w.fromComponentId !== compId && w.toComponentId !== compId));
    showToast(`تم حذف العنصر ${comp?.tag || ''}`);
  };

  // Update Component
  const handleComponentUpdate = (compId: string, updates: Partial<CircuitComponent>) => {
    setComponents(prev => prev.map(c => c.id === compId ? { ...c, ...updates } : c));
    showToast('تم تحديث الخصائص ✓');
  };

  // Move Component on Canvas
  const handleComponentMove = (compId: string, x: number, y: number) => {
    setComponents(prev => prev.map(c => c.id === compId ? { ...c, x, y } : c));
  };

  // Add Wire between two terminals
  const handleAddWire = (fromCompId: string, fromTermId: string, toCompId: string, toTermId: string) => {
    const exists = wires.some(w => 
      (w.fromComponentId === fromCompId && w.fromTerminalId === fromTermId && w.toComponentId === toCompId && w.toTerminalId === toTermId) ||
      (w.fromComponentId === toCompId && w.fromTerminalId === toTermId && w.toComponentId === fromCompId && w.toTerminalId === fromTermId)
    );

    if (exists) {
      showToast('هذا السلك موصول مسبقاً!');
      return;
    }

    const fromComp = components.find(c => c.id === fromCompId);
    const toComp = components.find(c => c.id === toCompId);

    const newWire: Wire = {
      id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      fromComponentId: fromCompId,
      fromTerminalId: fromTermId,
      toComponentId: toCompId,
      toTerminalId: toTermId
    };

    setWires(prev => [...prev, newWire]);
    showToast(`تم توصيل السلك بين ${fromComp?.tag} و ${toComp?.tag} ⚡`);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] تم ربط سلك: ${fromComp?.tag}:${fromTermId} ➔ ${toComp?.tag}:${toTermId}`,
      ...prev.slice(0, 8)
    ]);
  };

  // Delete Wire
  const handleDeleteWire = (wireId: string) => {
    setWires(prev => prev.filter(w => w.id !== wireId));
    showToast('تم حذف السلك');
  };

  // References for tracking previous states for audio triggers
  const prevMotorStateRef = useRef<{ running: boolean; speed: number; mode: string }>({ running: false, speed: 0, mode: 'DOL' });
  const prevEnergizedCoilIdsRef = useRef<Set<string>>(new Set());
  const prevShortCircuitRef = useRef<boolean>(false);

  // Pushbutton Press with realistic tactile mechanical sound
  const handleButtonPress = (id: string, pressed: boolean) => {
    soundEngine.playButtonClick(pressed);
    setComponents(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isPressed: pressed };
      }
      return c;
    }));
  };

  // Overload Trip & Circuit Breaker Toggle with mechanical sound
  const handleOverloadToggle = (id: string) => {
    setComponents(prev => prev.map(c => {
      if (c.id === id) {
        if (c.type === 'circuit_breaker') {
          const nextClosed = c.closed === false ? true : false;
          soundEngine.playContactorClack(nextClosed);
          showToast(nextClosed ? `تم رفع وتشغيل القاطع ${c.tag} (ON) ⚡` : `تم إنزال وفصل القاطع ${c.tag} (OFF) ⏹`);
          return { ...c, closed: nextClosed, isTripped: !nextClosed };
        }
        const nextTripped = !c.isTripped;
        if (nextTripped) {
          soundEngine.playOverloadTrip();
        } else {
          soundEngine.playButtonClick(false);
        }
        showToast(nextTripped ? 'تم اختبار الفصل الحراري (Trip) ⚠️' : 'تمت إعادة ضبط الأوفرلود (Reset) ✓');
        return { ...c, isTripped: nextTripped, closed: !nextTripped };
      }
      return c;
    }));
  };

  // Keep wiresRef synced
  const wiresRef = useRef(wires);
  useEffect(() => {
    wiresRef.current = wires;
  }, [wires]);

  // Stop motor sound when simulation is paused or switched to design mode
  useEffect(() => {
    if (!isSimulating) {
      soundEngine.stopMotorSound(0.5);
      prevMotorStateRef.current = { running: false, speed: 0, mode: 'DOL' };
      setMotorAudiblyRunning(false);
    }
  }, [isSimulating]);

  // Simulation Clock Tick (20 FPS) with dynamic motor sound and contactor audio
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setComponents(currentComps => {
        // 1. Solve electrical circuit logic
        const result = solveCircuit(currentComps, wiresRef.current, 0.05);

        // 2. Evaluate and synchronize Classic Control Ladder Diagram
        const ladderResult = evaluateLadderDiagram(
          ladderDiagramRef.current,
          result.components,
          0.05,
          syncWithHardwareRef.current
        );

        setLadderDiagram(ladderResult.ladder);
        ladderDiagramRef.current = ladderResult.ladder;

        // Hardware components updated by ladder logic (e.g. KM1 energized, motor running)
        const finalComps = ladderResult.hardwareComponents;

        if (result.shortCircuit !== shortCircuit) {
          setShortCircuit(result.shortCircuit);
        }
        if (result.logs.length > 0 || ladderResult.logs.length > 0) {
          const newLogs = [...ladderResult.logs, ...result.logs];
          setLogs(prev => [...newLogs, ...prev.slice(0, 8)]);
        }

        // 1. Motor Running Sound Engine
        const activeMotor = finalComps.find(c => c.type === 'motor_3phase' && (c.motorRunning || c.isEnergized));
        const isRunning = !!activeMotor;
        const currentSpeed = activeMotor?.motorSpeed || 1450;
        const currentMode = (activeMotor?.motorMode as 'DOL' | 'STAR' | 'DELTA') || 'DOL';

        if (isRunning && !prevMotorStateRef.current.running) {
          soundEngine.startMotorSound(currentSpeed, currentMode);
          setMotorAudiblyRunning(true);
        } else if (!isRunning && prevMotorStateRef.current.running) {
          soundEngine.stopMotorSound(0.8);
          setMotorAudiblyRunning(false);
        } else if (isRunning && prevMotorStateRef.current.running && prevMotorStateRef.current.speed !== currentSpeed) {
          soundEngine.updateMotorSpeed(currentSpeed);
        }
        prevMotorStateRef.current = { running: isRunning, speed: currentSpeed, mode: currentMode };

        // 2. Contactor & Relay Coil Mechanical Snap / Clack Audio
        const currentEnergizedCoils = new Set(
          finalComps.filter(c => (c.type === 'contactor_coil' || c.type === 'timer_coil') && c.isEnergized).map(c => c.id)
        );
        let newlyEnergized = false;
        let newlyDeenergized = false;

        currentEnergizedCoils.forEach(id => {
          if (!prevEnergizedCoilIdsRef.current.has(id)) newlyEnergized = true;
        });
        prevEnergizedCoilIdsRef.current.forEach(id => {
          if (!currentEnergizedCoils.has(id)) newlyDeenergized = true;
        });

        if (newlyEnergized) {
          soundEngine.playContactorClack(true);
        } else if (newlyDeenergized) {
          soundEngine.playContactorClack(false);
        }
        prevEnergizedCoilIdsRef.current = currentEnergizedCoils;

        // 3. Short Circuit Arc & Spark Buzz
        if (result.shortCircuit && !prevShortCircuitRef.current) {
          soundEngine.playShortCircuit();
        }
        prevShortCircuitRef.current = result.shortCircuit;

        setWires(result.wires);
        return finalComps;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, shortCircuit]);

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none" dir="rtl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-2xl flex items-center gap-1.5 border border-amber-300 animate-in fade-in zoom-in-95">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Slim Margin Header (Ultra-Compact, Maximize Workspace for Mobile & Desktop) */}
      <header className="h-10 sm:h-11 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-3 flex items-center justify-between shrink-0 z-30">
        
        {/* Right Corner (أقصى اليمين): Drawer Menu Toggle + ViewMode Selector + Presets */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Side Drawer Toggle (☰) */}
          <button
            onClick={() => setIsRightDrawerOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 transition cursor-pointer shadow-sm"
            title="فتح لوحة التحكم والأدوات الجانبية"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* View Mode Switcher: Real Circuit | Split View | Ladder Diagram */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs shadow-inner">
            <button
              onClick={() => handleSetViewMode('real_circuit')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
                viewMode === 'real_circuit'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض اللوحة والمكونات الكهروميكانيكية الواقعية فقط"
            >
              <Cpu className="w-3 h-3" />
              <span className="hidden md:inline">لوحة واقعية</span>
            </button>

            <button
              onClick={() => handleSetViewMode('split_view')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
                viewMode === 'split_view'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض مقسم: لوحة واقعية ومخطط Ladder بالتزامن اللحظي"
            >
              <Split className="w-3 h-3" />
              <span>Split مقسّم</span>
            </button>

            <button
              onClick={() => handleSetViewMode('classic_ladder')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
                viewMode === 'classic_ladder'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض مخطط السلم الكهربائي Classic Control Ladder فقط"
            >
              <Activity className="w-3 h-3" />
              <span className="hidden md:inline">مخطط Ladder</span>
            </button>
          </div>

          {/* Classic Control 10 Presets Button */}
          <button
            onClick={() => setIsLadderPresetsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer shadow-sm"
            title="10 دوائر تحكم كلاسيكي جاهزة مع مخططات Ladder وشرح نظري"
          >
            <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">أمثلة Ladder (10)</span>
          </button>

          {/* Quick Simulation Mode Pill (Run / Design) */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs shadow-inner">
            <button
              onClick={() => {
                setAppMode('design');
                setIsSimulating(false);
                showToast('وضع الإنشاء والتصميم 🛠️');
              }}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                appMode === 'design'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="وضع الإنشاء: سحب وتدوير وتوصيل المكونات"
            >
              <Wrench className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setAppMode('run');
                setIsSimulating(true);
                showToast('وضع الرن والمحاكاة ⚡');
              }}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                appMode === 'run'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm animate-pulse'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="وضع الرن: تشغيل المحاكاة ومراقبة سريان التيار المنطقي"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Sound Toggle Button with Motor Running Pulse */}
          <button
            onClick={handleToggleMute}
            className={`h-7 px-2 rounded-lg border flex items-center gap-1.5 transition cursor-pointer text-xs font-bold ${
              isMuted
                ? 'bg-slate-950/80 border-slate-800 text-slate-500 hover:text-slate-300'
                : motorAudiblyRunning
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-500/20 animate-pulse'
                : 'bg-slate-950/80 border-slate-800 text-amber-400 hover:text-amber-300 shadow-sm'
            }`}
            title={
              isMuted
                ? 'أصوات المحركات والمعدات مكتومة 🔇 (انقر لتشغيل الصوت)'
                : motorAudiblyRunning
                ? 'المحرك يدور بصوت حقيقي 🔊 1450 RPM (انقر للكتم)'
                : 'أصوات المحركات والمعدات تعمل 🔊 (انقر للكتم)'
            }
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : motorAudiblyRunning ? (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-[10px] text-emerald-300 font-mono font-black">M1 🔊</span>
              </div>
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        </div>

        {/* Center / Left Side: Compact Project Title & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Primary Import Diagram Button (الميزة الرئيسية: استيراد مخطط كهربائي) */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer shadow-md shadow-blue-600/25 active:scale-95 shrink-0"
            title="استيراد مخطط كهربائي من PDF أو الصور أو كاميرا الهاتف"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>📥 استيراد مخطط</span>
          </button>

          {/* Quick Imported Diagram Status & Visibility Indicator */}
          {importedDiagram && (
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[10px] shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${importedDiagram.isVisible ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-cyan-300 font-bold hidden md:inline truncate max-w-[90px]">مرجع: {importedDiagram.name}</span>
              <button
                onClick={() => setImportedDiagram(prev => prev ? { ...prev, isVisible: !prev.isVisible } : null)}
                className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                title={importedDiagram.isVisible ? 'إخفاء المخطط المرجعي' : 'إظهار المخطط المرجعي'}
              >
                {importedDiagram.isVisible ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
              </button>
              <button
                onClick={() => setImportedDiagram(prev => prev ? { ...prev, isLocked: !prev.isLocked } : null)}
                className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                title={importedDiagram.isLocked ? 'المخطط مقفول كخلفية (انقر للتحريك)' : 'المخطط قابل للتحريك (انقر للقفل)'}
              >
                {importedDiagram.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-slate-400" />}
              </button>
              <button
                onClick={() => setIsDiagramAnalysisModalOpen(true)}
                className="p-0.5 text-slate-400 hover:text-cyan-300 cursor-pointer"
                title="تحليل رموز ومكونات المخطط"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </button>
            </div>
          )}

          {/* Small Component Library Button */}
          <button
            onClick={() => setIsComponentsModalOpen(true)}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow-md transition active:scale-95 cursor-pointer"
            title="مكتبة الـ 100 مكون كهربائي"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Project Selector Trigger */}
          <button
            onClick={() => setIsProjectsModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/80 text-xs font-semibold transition cursor-pointer shadow-sm truncate max-w-[130px] sm:max-w-[180px]"
            title="المشاريع والمخططات"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{currentProject.title}</span>
          </button>

          {/* Quick Save */}
          <button
            onClick={handleSaveCurrentProject}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="حفظ التعديلات"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {/* Quick Delete */}
          <button
            onClick={() => setProjectToDelete(currentProject)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition cursor-pointer"
            title="حذف المخطط الحالي"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Right-Side Flyout Drawer (شريط الأدوات المنبثق من الجانب الأيمن) */}
      {isRightDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in"
          onClick={() => setIsRightDrawerOpen(false)}
        />
      )}

      <aside className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-slate-900 border-l border-slate-800 z-50 shadow-2xl flex flex-col transform transition-transform duration-200 ease-out select-none ${
        isRightDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-sm font-bold text-white">لوحة الأدوات والتحكم</span>
          </div>
          <button
            onClick={() => setIsRightDrawerOpen(false)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {/* Active Project Card */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">المخطط النشط</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                {currentProject.category}
              </span>
            </div>
            <h4 className="font-bold text-white text-sm truncate">{currentProject.title}</h4>
            <div className="pt-2 flex items-center gap-1.5 border-t border-slate-850">
              <button
                onClick={() => {
                  setIsRightDrawerOpen(false);
                  setIsProjectsModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>تبديل المخطط</span>
              </button>
              <button
                onClick={() => {
                  setIsRightDrawerOpen(false);
                  setIsNewProjectModalOpen(true);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition cursor-pointer"
                title="مشروع جديد"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                onClick={handleSaveCurrentProject}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                title="حفظ التعديلات"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Imported Diagram & Reference Card in Drawer (استيراد المخططات الهندسية) */}
          <div className="p-3 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 rounded-xl border border-blue-500/40 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 font-bold text-xs flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>المخطط المرجعي (Reference Diagram)</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                importedDiagram ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {importedDiagram ? 'مدرج في اللوحة' : 'غير مدرج'}
              </span>
            </div>

            {importedDiagram ? (
              <div className="space-y-2 pt-1 border-t border-blue-900/50">
                <div className="text-[11px] text-white font-bold truncate">
                  {importedDiagram.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span>النوع: {importedDiagram.sourceType.toUpperCase()}</span>
                  <span>الشفافية: {Math.round(importedDiagram.opacity * 100)}%</span>
                  <span>{importedDiagram.isLocked ? '🔒 مقفول كخلفية' : '🔓 تحريك حر'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      setIsRightDrawerOpen(false);
                      setIsDiagramAnalysisModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition cursor-pointer text-xs shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تحليل المخطط</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRightDrawerOpen(false);
                      setIsImportModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer text-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>استبدال المخطط</span>
                  </button>
                </div>
                <button
                  onClick={handleRemoveImportedDiagram}
                  className="w-full flex items-center justify-center gap-1 py-1 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg text-[11px] transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>إزالة المخطط المرجعي</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-300 leading-relaxed">
                استورد مخططات كهربائية صناعية من ملفات PDF أو الصور أو كاميرا الهاتف لرسم الدائرة فوقها كخلفية مرجعية ومحاكاتها.
              </p>
            )}

            <button
              onClick={() => {
                setIsRightDrawerOpen(false);
                setIsImportModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-lg text-xs shadow-md transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{importedDiagram ? 'استيراد مخطط آخر' : '📥 استيراد مخطط هندسي جديد'}</span>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px] font-semibold">وضع المحاكاة</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setAppMode('design');
                  setIsSimulating(false);
                  showToast('وضع الإنشاء 🛠️');
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  appMode === 'design'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Wrench className="w-4 h-4 mb-1" />
                <span>وضع الإنشاء</span>
              </button>
              <button
                onClick={() => {
                  setAppMode('run');
                  setIsSimulating(true);
                  showToast('وضع الرن ⚡');
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  appMode === 'run'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Play className="w-4 h-4 mb-1 fill-current" />
                <span>وضع الرن (Run)</span>
              </button>
            </div>
          </div>

          {/* Classic Control View Mode Selector in Drawer */}
          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px] font-semibold">طريقة العرض ومحاكي Ladder</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleSetViewMode('real_circuit')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  viewMode === 'real_circuit'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-4 h-4 mb-1" />
                <span className="text-[10px]">لوحة فقط</span>
              </button>
              <button
                onClick={() => handleSetViewMode('split_view')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  viewMode === 'split_view'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Split className="w-4 h-4 mb-1" />
                <span className="text-[10px]">مقسّم Split</span>
              </button>
              <button
                onClick={() => handleSetViewMode('classic_ladder')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  viewMode === 'classic_ladder'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Activity className="w-4 h-4 mb-1" />
                <span className="text-[10px]">Ladder فقط</span>
              </button>
            </div>
          </div>

          {/* Classic Control 10 Educational Presets Card */}
          <div className="p-3 bg-gradient-to-r from-emerald-950/50 to-teal-950/50 rounded-xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                <span>التحكم الكلاسيكي (Ladder)</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">10 دوائر</span>
            </div>
            <p className="text-[11px] text-slate-300">دوائر تشغيل المحركات، المؤقتات TON/TOF، والعوازل الميكانيكية والكهربائية جاهزة للتشغيل الفوري.</p>
            <button
              onClick={() => {
                setIsRightDrawerOpen(false);
                setIsLadderPresetsModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs shadow-md transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>استعراض الـ 10 دوائر الجاهزة</span>
            </button>
          </div>

          {/* Circuit Representation Style Selector in Drawer */}
          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px] font-semibold">نمط تمثيل وعرض اللوحة الواقعية</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSetRenderStyle('schematic')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  renderStyle === 'schematic'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 mb-1" />
                <span>رموز تخطيطية</span>
              </button>
              <button
                onClick={() => handleSetRenderStyle('realistic')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  renderStyle === 'realistic'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-4 h-4 mb-1" />
                <span>قطع حقيقية</span>
              </button>
            </div>
          </div>

          {/* Industrial Sound & Audio Settings */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-semibold">أصوات المحركات والمعدات</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                motorAudiblyRunning 
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/50' 
                  : 'text-slate-500 bg-slate-950'
              }`}>
                {motorAudiblyRunning ? 'المحرك يدور 🔊' : isMuted ? 'مكتوم 🔇' : 'جاهز 🔉'}
              </span>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleToggleMute}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isMuted
                      ? 'bg-red-950/60 border border-red-500/40 text-red-300'
                      : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playContactorClack(true);
                    setTimeout(() => soundEngine.startMotorSound(1450, 'DOL'), 100);
                    setTimeout(() => soundEngine.stopMotorSound(0.6), 1500);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition cursor-pointer"
                  title="تجربة صوت المحرك والكونتاكتور"
                >
                  تجربة الصوت ⚡
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>مستوى الصوت:</span>
                  <span className="font-mono text-amber-400">{isMuted ? '0%' : `${Math.round(soundVolume * 100)}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : soundVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px] font-semibold">المكونات واللوحة</span>
            <div className="space-y-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setIsRightDrawerOpen(false);
                  setIsComponentsModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-white transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">مكتبة الـ 100 مكون كهربائي</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">100</span>
              </button>

              <button
                onClick={() => {
                  handleClearAllWires();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-950/40 text-slate-300 hover:text-red-400 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>مسح وحذف جميع الأسلاك</span>
              </button>
            </div>
          </div>

          {/* Tools & Academic Export */}
          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px] font-semibold">الأدوات والتصدير الأكاديمي</span>
            <div className="space-y-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setIsRightDrawerOpen(false);
                  setIsAndroidCodeModalOpen(true);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>كود أندرويد (Kotlin/Compose)</span>
              </button>

              <button
                onClick={() => {
                  setIsRightDrawerOpen(false);
                  setIsTheoryModalOpen(true);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>الشرح والدليل النظري</span>
              </button>

              <button
                onClick={() => {
                  setIsRightDrawerOpen(false);
                  setIsAnalysisModalOpen(true);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>تحليل التطبيق المعماري</span>
              </button>

              <button
                onClick={() => {
                  setIsRightDrawerOpen(false);
                  setIsLogDrawerOpen(!isLogDrawerOpen);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>سجل أحداث المحاكاة</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${isLogDrawerOpen ? 'bg-amber-400' : 'bg-slate-600'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span>SimuRelay Studio v3.2</span>
          <button
            onClick={() => {
              setIsRightDrawerOpen(false);
              setProjectToDelete(currentProject);
            }}
            className="text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>حذف المخطط</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace: Supports Split View, Classic Ladder, and Realistic Panel */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {viewMode === 'split_view' ? (
          <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
            {/* Split Panel 1 (Right in RTL): Realistic Industrial Electrical Panel */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative border-b lg:border-b-0 lg:border-l border-slate-800">
              <InteractiveCanvas
                components={components}
                wires={wires}
                isSimulating={isSimulating}
                shortCircuit={shortCircuit}
                mode={appMode}
                renderStyle={renderStyle}
                onToggleRenderStyle={handleSetRenderStyle}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onButtonPress={handleButtonPress}
                onOverloadToggle={handleOverloadToggle}
                onComponentMove={handleComponentMove}
                onComponentDelete={handleComponentDelete}
                onComponentRotate={handleComponentRotate}
                onComponentUpdate={handleComponentUpdate}
                onAddWire={handleAddWire}
                onDeleteWire={handleDeleteWire}
                onClearAllWires={handleClearAllWires}
                onReset={handleReset}
                onOpenComponentsModal={() => setIsComponentsModalOpen(true)}
                importedDiagram={importedDiagram}
                onUpdateImportedDiagram={handleUpdateImportedDiagram}
                onRemoveImportedDiagram={handleRemoveImportedDiagram}
                onOpenDiagramAnalysis={() => setIsDiagramAnalysisModalOpen(true)}
                onReimportDiagram={() => setIsImportModalOpen(true)}
              />
            </div>

            {/* Split Panel 2 (Left in RTL): Classic Control Ladder Diagram */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative bg-slate-950">
              <LadderCanvas
                ladder={ladderDiagram}
                isSimulating={isSimulating}
                syncWithHardware={syncWithHardware}
                onToggleSimulating={() => {
                  const next = !isSimulating;
                  setIsSimulating(next);
                  setAppMode(next ? 'run' : 'design');
                }}
                onToggleSyncWithHardware={() => {
                  setSyncWithHardware(prev => !prev);
                  showToast(!syncWithHardware ? 'تم تفعيل الربط اللحظي مع المكونات الواقعية ⚡' : 'تم تعطيل الربط مع المكونات الواقعية');
                }}
                onSingleScanStep={handleSingleScanStep}
                onUpdateLadder={(updated) => {
                  setLadderDiagram(updated);
                  ladderDiagramRef.current = updated;
                }}
                onContactClick={handleContactClick}
                onResetLadder={() => {
                  const preset = CLASSIC_CONTROL_PRESETS.find(p => p.id === activeClassicPresetId) || CLASSIC_CONTROL_PRESETS[0];
                  setLadderDiagram(JSON.parse(JSON.stringify(preset.ladder)));
                  showToast('تمت إعادة ضبط مخطط Ladder');
                }}
                compact={true}
                importedDiagram={importedDiagram}
                onUpdateImportedDiagram={handleUpdateImportedDiagram}
                onRemoveImportedDiagram={handleRemoveImportedDiagram}
                onOpenDiagramAnalysis={() => setIsDiagramAnalysisModalOpen(true)}
                onReimportDiagram={() => setIsImportModalOpen(true)}
              />
            </div>
          </div>
        ) : viewMode === 'classic_ladder' ? (
          <div className="w-full h-full relative bg-slate-950">
            <LadderCanvas
              ladder={ladderDiagram}
              isSimulating={isSimulating}
              syncWithHardware={syncWithHardware}
              onToggleSimulating={() => {
                const next = !isSimulating;
                setIsSimulating(next);
                setAppMode(next ? 'run' : 'design');
              }}
              onToggleSyncWithHardware={() => {
                setSyncWithHardware(prev => !prev);
                showToast(!syncWithHardware ? 'تم تفعيل الربط اللحظي مع المكونات الواقعية ⚡' : 'تم تعطيل الربط مع المكونات الواقعية');
              }}
              onSingleScanStep={handleSingleScanStep}
              onUpdateLadder={(updated) => {
                setLadderDiagram(updated);
                ladderDiagramRef.current = updated;
              }}
              onContactClick={handleContactClick}
              onResetLadder={() => {
                const preset = CLASSIC_CONTROL_PRESETS.find(p => p.id === activeClassicPresetId) || CLASSIC_CONTROL_PRESETS[0];
                setLadderDiagram(JSON.parse(JSON.stringify(preset.ladder)));
                showToast('تمت إعادة ضبط مخطط Ladder');
              }}
              compact={false}
              importedDiagram={importedDiagram}
              onUpdateImportedDiagram={handleUpdateImportedDiagram}
              onRemoveImportedDiagram={handleRemoveImportedDiagram}
              onOpenDiagramAnalysis={() => setIsDiagramAnalysisModalOpen(true)}
              onReimportDiagram={() => setIsImportModalOpen(true)}
            />
          </div>
        ) : (
          <InteractiveCanvas
            components={components}
            wires={wires}
            isSimulating={isSimulating}
            shortCircuit={shortCircuit}
            mode={appMode}
            renderStyle={renderStyle}
            onToggleRenderStyle={handleSetRenderStyle}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onButtonPress={handleButtonPress}
            onOverloadToggle={handleOverloadToggle}
            onComponentMove={handleComponentMove}
            onComponentDelete={handleComponentDelete}
            onComponentRotate={handleComponentRotate}
            onComponentUpdate={handleComponentUpdate}
            onAddWire={handleAddWire}
            onDeleteWire={handleDeleteWire}
            onClearAllWires={handleClearAllWires}
            onReset={handleReset}
            onOpenComponentsModal={() => setIsComponentsModalOpen(true)}
            importedDiagram={importedDiagram}
            onUpdateImportedDiagram={handleUpdateImportedDiagram}
            onRemoveImportedDiagram={handleRemoveImportedDiagram}
            onOpenDiagramAnalysis={() => setIsDiagramAnalysisModalOpen(true)}
            onReimportDiagram={() => setIsImportModalOpen(true)}
          />
        )}

        {/* Floating Quick Action Buttons */}
        <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2">
          {viewMode !== 'classic_ladder' && (
            <button
              onClick={() => setIsComponentsModalOpen(true)}
              className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-2xl shadow-amber-500/30 transition cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5 stroke-[3]" />
              <span>مكتبة الـ 100 مكون</span>
            </button>
          )}

          {/* Floating Import Diagram Trigger */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-2xl shadow-blue-600/30 backdrop-blur-md transition cursor-pointer border border-blue-400/40 transform hover:-translate-y-0.5 active:translate-y-0"
            title="استيراد مخطط كهربائي من PDF أو الصور أو كاميرا الهاتف"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>📥 استيراد مخطط</span>
          </button>

          {viewMode !== 'classic_ladder' && (
            <button
              onClick={() => setIsLadderPresetsModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-2xl backdrop-blur-md transition cursor-pointer border border-emerald-400/40"
            >
              <Zap className="w-4 h-4 fill-current text-white" />
              <span className="hidden sm:inline">مشاريع Ladder</span>
            </button>
          )}
        </div>

        {/* Minimal Event Log Drawer (Toggled from header) */}
        {isLogDrawerOpen && (
          <div className="absolute bottom-4 right-4 w-96 max-h-56 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-30 animate-in slide-in-from-bottom-4">
            <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 font-sans font-bold text-white">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>سجل أحداث المحاكاة</span>
              </span>
              <button 
                onClick={() => setIsLogDrawerOpen(false)}
                className="hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-3 space-y-1 font-mono text-[11px] overflow-y-auto max-h-44">
              {logs.map((log, idx) => (
                <div key={idx} className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- ALL POPUP MODALS --- */}

      {/* 1. 100 Components Popup Modal with IEC Symbols & Search */}
      <ComponentsLibraryModal
        isOpen={isComponentsModalOpen}
        onClose={() => setIsComponentsModalOpen(false)}
        onSelectComponent={handleSelect100Component}
      />

      {/* 2. Projects & Presets Modal */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        currentProject={currentProject}
        renderStyle={renderStyle}
        onSelectRenderStyle={handleSetRenderStyle}
        onSelectProject={handleSelectProject}
        onOpenNewModal={() => setIsNewProjectModalOpen(true)}
        onSaveCurrentProject={handleSaveCurrentProject}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onDeleteProject={handleDeleteProject}
      />

      {/* 3. New Project Creation Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* 4. Android Studio Code Modal */}
      <AndroidCodeModal
        isOpen={isAndroidCodeModalOpen}
        onClose={() => setIsAndroidCodeModalOpen(false)}
      />

      {/* 5. Theory & Step-by-Step Educational Walkthrough Modal */}
      <TheoryModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
        currentPreset={CIRCUIT_PRESETS.find(p => p.id === currentProject.id) || CIRCUIT_PRESETS[0]}
        onSelectPreset={(preset) => {
          const found = projects.find(p => p.id === preset.id);
          if (found) handleSelectProject(found);
        }}
      />

      {/* 6. Technical Analysis Modal */}
      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
      />

      {/* 7. Classic Control 10 Presets Modal */}
      <LadderPresetsModal
        isOpen={isLadderPresetsModalOpen}
        activePresetId={activeClassicPresetId}
        onClose={() => setIsLadderPresetsModalOpen(false)}
        onSelectPreset={handleSelectClassicPreset}
      />

      {/* 8. Import Electrical Diagram Modal (PDF, Images, Camera, Samples) */}
      <ImportDiagramModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDiagramImported={handleDiagramImported}
      />

      {/* 9. Diagram Analysis & Editable Circuit Reconstruction Modal */}
      <DiagramAnalysisModal
        isOpen={isDiagramAnalysisModalOpen}
        diagram={importedDiagram}
        onClose={() => setIsDiagramAnalysisModalOpen(false)}
        onApplyReconstruction={handleApplyDiagramReconstruction}
      />

      {/* In-app Project Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">حذف المشروع الحالي</h4>
                <p className="text-xs text-slate-400 mt-1">هل أنت متأكد من حذف "{projectToDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  handleDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
