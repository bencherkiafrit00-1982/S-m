import React, { useState, useEffect, useRef } from 'react';
import { CircuitComponent, Wire, CircuitRenderStyle } from '../types/circuit';
import { ImportedDiagram } from '../types/diagram';
import { ReferenceDiagramOverlay } from './ReferenceDiagramOverlay';
import { SchematicSymbol } from './SchematicSymbol';
import { SimuRelayCanvasComponent } from './SimuRelayCanvasComponent';
import { 
  Zap, 
  RotateCw, 
  AlertTriangle, 
  Power,
  Clock,
  Sparkles,
  Trash2,
  Settings2,
  X,
  Link,
  Move,
  Check,
  Scissors,
  Magnet,
  GripVertical,
  Palette,
  Layers,
  Wrench,
  Cpu,
  Eye,
  EyeOff,
  Crosshair,
  Maximize,
  ZoomIn,
  RotateCcw,
  FileText,
  SlidersHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';

interface InteractiveCanvasProps {
  components: CircuitComponent[];
  wires: Wire[];
  isSimulating: boolean;
  shortCircuit: boolean;
  mode?: 'design' | 'run';
  renderStyle?: CircuitRenderStyle;
  onToggleRenderStyle?: (style: CircuitRenderStyle) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onButtonPress: (id: string, pressed: boolean) => void;
  onOverloadToggle: (id: string) => void;
  onComponentMove?: (id: string, x: number, y: number) => void;
  onComponentDelete?: (id: string) => void;
  onComponentRotate?: (id: string) => void;
  onComponentUpdate?: (id: string, updates: Partial<CircuitComponent>) => void;
  onAddWire?: (fromCompId: string, fromTermId: string, toCompId: string, toTermId: string) => void;
  onDeleteWire?: (wireId: string) => void;
  onClearAllWires?: () => void;
  onReset: () => void;
  onOpenComponentsModal?: () => void;
  importedDiagram?: ImportedDiagram | null;
  onUpdateImportedDiagram?: (updated: Partial<ImportedDiagram>) => void;
  onRemoveImportedDiagram?: () => void;
  onOpenDiagramAnalysis?: () => void;
  onReimportDiagram?: () => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  components,
  wires,
  isSimulating,
  shortCircuit,
  mode = 'design',
  renderStyle,
  onToggleRenderStyle,
  isMuted,
  onToggleMute,
  onButtonPress,
  onOverloadToggle,
  onComponentMove,
  onComponentDelete,
  onComponentRotate,
  onComponentUpdate,
  onAddWire,
  onDeleteWire,
  onClearAllWires,
  onReset,
  onOpenComponentsModal,
  importedDiagram,
  onUpdateImportedDiagram,
  onRemoveImportedDiagram,
  onOpenDiagramAnalysis,
  onReimportDiagram
}) => {
  const [localRenderStyle, setLocalRenderStyle] = useState<CircuitRenderStyle>('realistic');
  const currentRenderStyle = renderStyle || localRenderStyle;

  const handleToggleRenderStyle = (target?: CircuitRenderStyle) => {
    const next = target || (currentRenderStyle === 'schematic' ? 'realistic' : 'schematic');
    setLocalRenderStyle(next);
    if (onToggleRenderStyle) onToggleRenderStyle(next);
  };

  const [zoom, setZoom] = useState(0.85);
  const [pendingTerminal, setPendingTerminal] = useState<{ compId: string; termId: string; name: string } | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [isDiagramSelected, setIsDiagramSelected] = useState<boolean>(false);
  const [wireDeleteMode, setWireDeleteMode] = useState<boolean>(false);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false); // Smooth free drag by default
  const [confirmClearWires, setConfirmClearWires] = useState<boolean>(false);
  const [editingComp, setEditingComp] = useState<CircuitComponent | null>(null);
  const [gridTheme, setGridTheme] = useState<'dark' | 'blueprint' | 'white'>('dark');
  const [wireStyle, setWireStyle] = useState<'orthogonal' | 'curved'>('orthogonal');
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  
  // Dragging State
  const [dragState, setDragState] = useState<{
    compId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Diagram Locator & Centering Helpers (Requirement 7)
  const scrollToDiagram = (diag?: ImportedDiagram | null) => {
    const target = diag || importedDiagram;
    if (!target || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const targetLeft = Math.max(0, (target.x * zoom) - (container.clientWidth / 2) + ((target.width * zoom) / 2));
    const targetTop = Math.max(0, (target.y * zoom) - (container.clientHeight / 2) + ((target.height * zoom) / 2));
    container.scrollTo({
      left: targetLeft,
      top: targetTop,
      behavior: 'smooth'
    });
  };

  // Center diagram in the canvas world coordinates and scroll to it
  const handleCenterDiagram = () => {
    if (!importedDiagram || !onUpdateImportedDiagram) return;
    const newX = Math.max(30, Math.round((1400 - importedDiagram.width) / 2));
    const newY = Math.max(30, Math.round((900 - importedDiagram.height) / 2));
    onUpdateDiagramCoordinates(newX, newY);
  };

  const onUpdateDiagramCoordinates = (x: number, y: number) => {
    if (!importedDiagram || !onUpdateImportedDiagram) return;
    onUpdateImportedDiagram({ x, y, isVisible: true });
    setTimeout(() => {
      scrollToDiagram({ ...importedDiagram, x, y });
    }, 50);
  };

  // Fit-to-screen transformation calculating bounding box against canvas clientWidth/clientHeight
  const fitDiagramToScreen = (diag: ImportedDiagram) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    // Canvas container viewport dimensions
    const clientWidth = container.clientWidth || window.innerWidth || 1200;
    const clientHeight = container.clientHeight || window.innerHeight || 800;

    // Diagram intrinsic dimensions and aspect ratio
    const imgWidth = diag.originalWidth && diag.originalWidth > 0 
      ? diag.originalWidth 
      : (diag.width && diag.width > 0 ? diag.width : 800);
    const imgHeight = diag.originalHeight && diag.originalHeight > 0 
      ? diag.originalHeight 
      : (diag.height && diag.height > 0 ? diag.height : 600);
    const aspectRatio = imgWidth / (imgHeight || 1);

    // Available screen viewport space leaving comfortable margins for toolbars
    const paddingX = Math.min(80, Math.max(30, clientWidth * 0.08));
    const paddingY = Math.min(80, Math.max(30, clientHeight * 0.08));
    const availableViewWidth = Math.max(300, clientWidth - (paddingX * 2));
    const availableViewHeight = Math.max(300, clientHeight - (paddingY * 2));

    // Base canvas workspace bounds
    const canvasWorldW = 1400;
    const canvasWorldH = 900;

    // Calculate maximum world dimensions that fit nicely inside standard workspace
    const maxWorldWidth = Math.min(1000, Math.max(500, canvasWorldW * 0.70));
    const maxWorldHeight = Math.min(750, Math.max(400, canvasWorldH * 0.75));

    let targetWidth: number;
    let targetHeight: number;

    if (aspectRatio >= maxWorldWidth / maxWorldHeight) {
      targetWidth = maxWorldWidth;
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else {
      targetHeight = maxWorldHeight;
      targetWidth = Math.round(targetHeight * aspectRatio);
    }

    // Centered world coordinates in the canvas
    const targetX = Math.max(30, Math.round((canvasWorldW - targetWidth) / 2));
    const targetY = Math.max(30, Math.round((canvasWorldH - targetHeight) / 2));

    // Calculate optimal zoom to fit diagram bounding box within the client view
    const fitScaleX = availableViewWidth / targetWidth;
    const fitScaleY = availableViewHeight / targetHeight;
    const rawZoom = Math.min(fitScaleX, fitScaleY, 1.0); // Never over-magnify above 1.0 by default
    const optimalZoom = Math.min(1.2, Math.max(0.45, Math.round(rawZoom * 20) / 20));

    // Apply zoom
    setZoom(optimalZoom);

    // Update diagram world position and bounding dimensions
    if (onUpdateImportedDiagram) {
      onUpdateImportedDiagram({
        x: targetX,
        y: targetY,
        width: targetWidth,
        height: targetHeight,
        isVisible: true
      });
    }

    // Center scroll container on diagram bounding box
    setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const c = scrollContainerRef.current;
      const cW = c.clientWidth || clientWidth;
      const cH = c.clientHeight || clientHeight;
      const scrollX = Math.max(0, (targetX * optimalZoom) - (cW / 2) + ((targetWidth * optimalZoom) / 2));
      const scrollY = Math.max(0, (targetY * optimalZoom) - (cH / 2) + ((targetHeight * optimalZoom) / 2));
      c.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
      });
    }, 60);
  };

  // Fit diagram to screen handler
  const handleFitDiagram = () => {
    if (!importedDiagram) return;
    fitDiagramToScreen(importedDiagram);
  };

  // Zoom to diagram
  const handleZoomToDiagram = () => {
    setZoom(1.0);
    setTimeout(() => scrollToDiagram(), 100);
  };

  // Reset diagram position
  const handleResetDiagramPosition = () => {
    if (!importedDiagram || !onUpdateImportedDiagram) return;
    const safeW = importedDiagram.originalWidth > 0 ? importedDiagram.originalWidth : 800;
    const safeH = importedDiagram.originalHeight > 0 ? importedDiagram.originalHeight : 600;
    const targetW = Math.min(900, Math.max(500, safeW >= safeH ? 800 : 600));
    const targetH = Math.round(targetW * (safeH / safeW));
    onUpdateImportedDiagram({
      x: 460,
      y: 50,
      width: targetW,
      height: targetH,
      rotation: 0,
      opacity: 0.95,
      isVisible: true
    });
    setTimeout(() => {
      scrollToDiagram({ ...importedDiagram, x: 460, y: 50, width: targetW, height: targetH });
    }, 50);
  };

  // useEffect: Trigger 'fit-to-screen' transformation when an importedDiagram is first loaded
  const prevDiagramIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!importedDiagram) {
      prevDiagramIdRef.current = null;
      return;
    }

    // Check if this diagram was just loaded or replaced
    if (importedDiagram.id !== prevDiagramIdRef.current) {
      prevDiagramIdRef.current = importedDiagram.id;
      // Allow DOM rendering cycle to compute accurate clientWidth and clientHeight
      const timer = setTimeout(() => {
        fitDiagramToScreen(importedDiagram);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [importedDiagram?.id]);

  // Helper map for component lookups
  const compMap = new Map<string, CircuitComponent>();
  components.forEach(c => compMap.set(c.id, c));

  const selectedComp = selectedCompId ? compMap.get(selectedCompId) : null;
  const selectedWire = selectedWireId ? wires.find(w => w.id === selectedWireId) : null;

  // Terminal global coords helper with component rotation support (0°, 90°, 180°, 270°)
  const getTerminalCoords = (comp: CircuitComponent, terminalId: string) => {
    const term = comp.terminals.find(t => t.id === terminalId);
    const defaultCenter = { x: comp.x + comp.width / 2, y: comp.y + comp.height / 2 };
    if (!term) return defaultCenter;

    const rot = comp.rotation || 0;
    if (rot === 0) {
      return {
        x: comp.x + term.x,
        y: comp.y + term.y
      };
    }

    const cx = comp.width / 2;
    const cy = comp.height / 2;
    const rad = (rot * Math.PI) / 180;
    const dx = term.x - cx;
    const dy = term.y - cy;
    const rotatedX = cx + (dx * Math.cos(rad) - dy * Math.sin(rad));
    const rotatedY = cy + (dx * Math.sin(rad) + dy * Math.cos(rad));

    return {
      x: comp.x + Math.round(rotatedX),
      y: comp.y + Math.round(rotatedY)
    };
  };

  // Keyboard shortcut listener for deleting (components/wires) and rotating
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isDiagramSelected && onRemoveImportedDiagram) {
          onRemoveImportedDiagram();
          setIsDiagramSelected(false);
        } else if (selectedWireId && onDeleteWire) {
          onDeleteWire(selectedWireId);
          setSelectedWireId(null);
        } else if (selectedCompId && onComponentDelete) {
          onComponentDelete(selectedCompId);
          setSelectedCompId(null);
        }
      } else if ((e.key === 'r' || e.key === 'R') && selectedCompId) {
        if (onComponentRotate) {
          onComponentRotate(selectedCompId);
        }
      } else if (e.key === 'Escape') {
        setSelectedCompId(null);
        setSelectedWireId(null);
        setIsDiagramSelected(false);
        setPendingTerminal(null);
        setMousePos(null);
        setWireDeleteMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCompId, selectedWireId, isDiagramSelected, onComponentDelete, onComponentRotate, onDeleteWire, onRemoveImportedDiagram]);

  // Global Mouse Move and Mouse Up for smooth, flexible and easy dragging
  useEffect(() => {
    if (!dragState) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!onComponentMove) return;
      const dx = (e.clientX - dragState.startX) / zoom;
      const dy = (e.clientY - dragState.startY) / zoom;
      const rawX = dragState.initialX + dx;
      const rawY = dragState.initialY + dy;
      
      // Shift key toggles snap on the fly
      const shouldSnap = e.shiftKey ? !snapToGrid : snapToGrid;
      const newX = Math.max(10, Math.min(2400, shouldSnap ? Math.round(rawX / 10) * 10 : Math.round(rawX)));
      const newY = Math.max(10, Math.min(1600, shouldSnap ? Math.round(rawY / 10) * 10 : Math.round(rawY)));
      onComponentMove(dragState.compId, newX, newY);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (!onComponentMove || !e.touches[0]) return;
      const touch = e.touches[0];
      const dx = (touch.clientX - dragState.startX) / zoom;
      const dy = (touch.clientY - dragState.startY) / zoom;
      const rawX = dragState.initialX + dx;
      const rawY = dragState.initialY + dy;
      const newX = Math.max(10, Math.min(2400, snapToGrid ? Math.round(rawX / 10) * 10 : Math.round(rawX)));
      const newY = Math.max(10, Math.min(1600, snapToGrid ? Math.round(rawY / 10) * 10 : Math.round(rawY)));
      onComponentMove(dragState.compId, newX, newY);
    };

    const handleWindowMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [dragState, zoom, onComponentMove, snapToGrid]);

  // Start dragging from anywhere on the component card (mouse)
  const startDrag = (compId: string, clientX: number, clientY: number) => {
    if (mode === 'run') return; // In Run mode, prevent card movement so controls can be operated smoothly
    const comp = compMap.get(compId);
    if (!comp) return;

    setSelectedCompId(compId);
    setSelectedWireId(null);
    setIsDiagramSelected(false);
    setDragState({
      compId,
      startX: clientX,
      startY: clientY,
      initialX: comp.x,
      initialY: comp.y
    });
  };

  // Handle Terminal click for wiring
  const handleTerminalClick = (compId: string, termId: string, termName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!pendingTerminal) {
      setPendingTerminal({ compId, termId, name: termName });
    } else {
      if (pendingTerminal.compId === compId && pendingTerminal.termId === termId) {
        setPendingTerminal(null);
        setMousePos(null);
      } else {
        if (onAddWire) {
          onAddWire(pendingTerminal.compId, pendingTerminal.termId, compId, termId);
        }
        setPendingTerminal(null);
        setMousePos(null);
      }
    }
  };

  const motor = components.find(c => c.type === 'motor_3phase');

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col select-none"
      onClick={() => {
        setSelectedCompId(null);
        setIsDiagramSelected(false);
      }}
    >
      {/* Floating Status Bar & Margin Controls - Ultra-Compact & Icon-Only */}
      <div className="absolute top-1.5 left-2 right-2 z-20 flex items-center justify-between pointer-events-none gap-1.5 text-xs">
        {/* Left indicators: Pure Icons & Badges */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Mode Icon Badge */}
          <div 
            className={`w-7 h-7 rounded-lg border backdrop-blur-md flex items-center justify-center shadow-md transition ${
              mode === 'run'
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-amber-950/90 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/30'
            }`}
            title={mode === 'run' ? 'وضع الرن (المحاكاة نشطة)' : 'وضع الإنشاء والتصميم'}
          >
            {mode === 'run' ? (
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
            ) : (
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>

          {/* Motor compact status with real audio indicator */}
          {motor && (
            <div 
              className={`h-7 px-2 rounded-lg border backdrop-blur-md text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md transition ${
                motor.motorRunning
                  ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
              title={motor.motorRunning ? `المحرك يعمل بصوت حي: ${motor.motorSpeed || 1450} RPM` : 'المحرك متوقف'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${motor.motorRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{motor.motorRunning ? `${motor.motorSpeed || 1450} RPM` : 'M1: OFF'}</span>
              {motor.motorRunning && (
                <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
              )}
            </div>
          )}

          {/* Short circuit warning badge */}
          {shortCircuit && (
            <div 
              className="h-7 px-2 bg-red-950 border border-red-500 rounded-lg text-red-200 text-[10px] font-bold flex items-center gap-1 animate-bounce shadow-lg"
              title="ماس كهربائي (Short Circuit)!"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>ماس كهربائي!</span>
            </div>
          )}

          {/* Wire delete mode active badge */}
          {wireDeleteMode && (
            <div className="h-7 px-2 bg-red-600 border border-red-400 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
              <Scissors className="w-3.5 h-3.5" />
              <button
                onClick={() => setWireDeleteMode(false)}
                className="hover:bg-red-700 p-0.5 rounded cursor-pointer"
                title="إلغاء وضع مقص الأسلاك"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Pending terminal wiring active */}
          {pendingTerminal && (
            <div className="h-7 px-2 bg-cyan-950 border border-cyan-500 rounded-lg text-cyan-200 text-[10px] font-mono flex items-center gap-1.5 shadow-lg animate-pulse">
              <Link className="w-3 h-3 text-cyan-400" />
              <span className="font-bold">{pendingTerminal.name}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingTerminal(null);
                  setMousePos(null);
                }}
                className="hover:text-white hover:bg-slate-800 p-0.5 rounded cursor-pointer"
                title="إلغاء التوصيل"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right floating canvas controls: Compact Icons in Margin */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Snap / Free Motion Toggle */}
          {mode === 'design' && (
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center backdrop-blur-md shadow-md transition cursor-pointer ${
                snapToGrid
                  ? 'bg-amber-950/90 border-amber-500/70 text-amber-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={snapToGrid ? 'محاذاة للشبكة 10px (انقر للتحريك الحر)' : 'تحريك حر سلس 1px (انقر للمحاذاة)'}
            >
              <Magnet className={`w-3.5 h-3.5 ${snapToGrid ? 'text-amber-400' : 'text-slate-400'}`} />
            </button>
          )}

          {/* Wire Cutter Tool Toggle */}
          {mode === 'design' && wires.length > 0 && (
            <button
              onClick={() => setWireDeleteMode(!wireDeleteMode)}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center backdrop-blur-md shadow-md transition cursor-pointer ${
                wireDeleteMode
                  ? 'bg-red-600 border-red-400 text-white animate-pulse'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-red-400'
              }`}
              title={wireDeleteMode ? 'إلغاء مقص الأسلاك' : 'مقص الأسلاك (انقر لحذف أي سلك)'}
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Clear All Wires Button */}
          {mode === 'design' && wires.length > 0 && onClearAllWires && (
            <button
              onClick={() => setConfirmClearWires(true)}
              className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-red-400 flex items-center justify-center shadow-md transition cursor-pointer"
              title="مسح جميع الأسلاك"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Circuit Representation Style Toggle: Schematic Symbols vs Realistic Industrial Parts */}
          <button
            onClick={() => handleToggleRenderStyle()}
            className={`h-7 px-2 rounded-lg border flex items-center gap-1.5 font-bold text-[11px] backdrop-blur-md shadow-md transition cursor-pointer ${
              currentRenderStyle === 'realistic'
                ? 'bg-purple-950/80 border-purple-500/70 text-purple-300 ring-1 ring-purple-500/30'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={
              currentRenderStyle === 'realistic'
                ? 'نمط مكونات وقطع حقيقية نشط (انقر للتحويل إلى نمط الرموز التخطيطية)'
                : 'نمط رموز تخطيطية نشط (انقر للتحويل إلى نمط المكونات والقطع الحقيقية)'
            }
          >
            {currentRenderStyle === 'realistic' ? (
              <>
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">قطع حقيقية</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">رموز تخطيطية</span>
              </>
            )}
          </button>

          {/* Wire Routing Style Toggle (Orthogonal 90° vs Curved) */}
          <button
            onClick={() => setWireStyle(prev => prev === 'orthogonal' ? 'curved' : 'orthogonal')}
            className={`h-7 px-1.5 rounded-lg border flex items-center justify-center font-mono text-xs font-black backdrop-blur-md shadow-md transition cursor-pointer ${
              wireStyle === 'orthogonal'
                ? 'bg-amber-950/80 border-amber-500/70 text-amber-300'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={wireStyle === 'orthogonal' ? 'أسلاك قائمة 90° (انقر للتحويل لمنحنية)' : 'أسلاك منحنية (انقر للتحويل لقائمة)'}
          >
            {wireStyle === 'orthogonal' ? '┌─┘' : '〜'}
          </button>

          {/* CAD Theme Color Dots Switcher */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-lg p-1 border border-slate-800 gap-1 shadow-md">
            <button
              onClick={() => setGridTheme('dark')}
              className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${
                gridTheme === 'dark' ? 'border-amber-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: '#020617' }}
              title="خلفية CAD داكنة"
            />
            <button
              onClick={() => setGridTheme('blueprint')}
              className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${
                gridTheme === 'blueprint' ? 'border-amber-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: '#0369a1' }}
              title="مخطط أزرق هندسي (Blueprint)"
            />
            <button
              onClick={() => setGridTheme('white')}
              className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${
                gridTheme === 'white' ? 'border-amber-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: '#f1f5f9' }}
              title="ورق هندسي أبيض (Technical White)"
            />
          </div>

          {/* Sound Mute/Unmute Quick Toggle */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center backdrop-blur-md shadow-md transition cursor-pointer ${
                isMuted
                  ? 'bg-slate-900/90 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-amber-950/90 border-amber-500/70 text-amber-300'
              }`}
              title={isMuted ? 'الصوت مكتوم 🔇 (انقر لتشغيل صوت المحرك والمعدات)' : 'أصوات المحركات والمعدات نشطة 🔊 (انقر للكتم)'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Reference Diagram Locator & Centering HUD (Requirement 7) */}
          {importedDiagram && (
            <div className="flex items-center bg-slate-900/95 backdrop-blur-md rounded-lg p-0.5 border border-amber-500/50 text-[11px] shadow-lg gap-0.5">
              <span className="text-[10px] text-amber-400 font-bold px-1.5 flex items-center gap-1 border-l border-slate-800">
                <span>📐 المخطط</span>
              </span>

              {/* Center Diagram */}
              <button
                onClick={handleCenterDiagram}
                className="px-2 py-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded flex items-center gap-1 transition cursor-pointer font-medium"
                title="توسيط المخطط في مساحة العمل"
              >
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">توسيط</span>
              </button>

              {/* Fit to Screen */}
              <button
                onClick={handleFitDiagram}
                className="px-2 py-1 hover:bg-slate-800 text-slate-300 hover:text-amber-300 rounded flex items-center gap-1 transition cursor-pointer font-medium"
                title="ملاءمة حجم المخطط مع الشاشة"
              >
                <Maximize className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">ملاءمة</span>
              </button>

              {/* Zoom to Diagram */}
              <button
                onClick={handleZoomToDiagram}
                className="p-1 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 rounded transition cursor-pointer"
                title="تكبير إلى المخطط (100%)"
              >
                <ZoomIn className="w-3 h-3 text-emerald-400" />
              </button>

              {/* Reset Position */}
              <button
                onClick={handleResetDiagramPosition}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                title="إعادة تعيين موضع وحجم المخطط"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              {/* Toggle Visibility */}
              <button
                onClick={() => onUpdateImportedDiagram && onUpdateImportedDiagram({ isVisible: !importedDiagram.isVisible })}
                className="p-1 hover:bg-slate-800 rounded transition cursor-pointer"
                title={importedDiagram.isVisible ? 'إخفاء المخطط المرجعي' : 'إظهار المخطط المرجعي'}
              >
                {importedDiagram.isVisible ? (
                  <Eye className="w-3 h-3 text-cyan-400" />
                ) : (
                  <EyeOff className="w-3 h-3 text-red-400" />
                )}
              </button>
            </div>
          )}

          {/* Zoom controls (Compact) */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-lg p-0.5 border border-slate-800 text-[11px] shadow-md">
            <button 
              onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
              className="w-5 h-6 hover:bg-slate-800 rounded text-slate-300 font-mono transition flex items-center justify-center cursor-pointer"
              title="تصغير"
            >
              -
            </button>
            <span className="px-1 font-mono text-slate-400 text-[10px]">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="w-5 h-6 hover:bg-slate-800 rounded text-slate-300 font-mono transition flex items-center justify-center cursor-pointer"
              title="تكبير"
            >
              +
            </button>
          </div>

          {/* Reset Zoom / View */}
          <button
            onClick={onReset}
            className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shadow-md transition cursor-pointer"
            title="إعادة ضبط اللوحة"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive SVG & Canvas Workspace */}
      <div 
        ref={scrollContainerRef}
        className={`relative flex-1 w-full h-full overflow-auto transition-colors duration-200 ${
          gridTheme === 'white' 
            ? 'circuit-grid-white text-slate-900' 
            : gridTheme === 'blueprint' 
            ? 'circuit-grid-blueprint text-sky-100' 
            : currentRenderStyle === 'realistic'
            ? 'industrial-panel-board text-slate-100'
            : 'circuit-grid text-slate-100'
        } ${wireDeleteMode ? 'cursor-crosshair' : ''}`}
        onClick={() => {
          setSelectedCompId(null);
          setSelectedWireId(null);
          setIsDiagramSelected(false);
        }}
      >
        <div 
          className="relative min-w-[1400px] min-h-[900px] p-8 transition-transform origin-top-left"
          style={{ transform: `scale(${zoom})` }}
          onMouseMove={(e) => {
            if (pendingTerminal) {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({
                x: (e.clientX - rect.left) / zoom,
                y: (e.clientY - rect.top) / zoom
              });
            }
          }}
        >
          {/* Reference Diagram Mode (Background CAD Schematic / PDF Overlay) */}
          <ReferenceDiagramOverlay
            diagram={importedDiagram || null}
            zoom={zoom}
            isSelected={isDiagramSelected}
            onSelect={() => {
              setIsDiagramSelected(true);
              setSelectedCompId(null);
              setSelectedWireId(null);
            }}
            onUpdateDiagram={onUpdateImportedDiagram || (() => {})}
            onRemoveDiagram={onRemoveImportedDiagram || (() => {})}
            onOpenAnalysis={onOpenDiagramAnalysis || (() => {})}
            onReimport={onReimportDiagram || (() => {})}
          />

          {/* SVG Wires Layer (z-[5] so wires remain visible over background diagrams) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
            <defs>
              <linearGradient id="energizedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <filter id="wireGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {wires.map(wire => {
              const fromComp = compMap.get(wire.fromComponentId);
              const toComp = compMap.get(wire.toComponentId);
              if (!fromComp || !toComp) return null;

              const p1 = getTerminalCoords(fromComp, wire.fromTerminalId);
              const p2 = getTerminalCoords(toComp, wire.toTerminalId);

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;

              let pathD = '';
              let midX = (p1.x + p2.x) * 0.5;
              let midY = (p1.y + p2.y) * 0.5;

              if (wireStyle === 'curved') {
                midY = p1.y + dy * 0.5;
                pathD = `M ${p1.x} ${p1.y} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
              } else {
                // Orthogonal 90° straight Manhattan routing (SimuRelay / CAD electrical schematic standard)
                if (Math.abs(dx) < 4) {
                  // Direct vertical line
                  pathD = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y}`;
                  midX = p1.x;
                  midY = (p1.y + p2.y) * 0.5;
                } else if (Math.abs(dy) < 4) {
                  // Direct horizontal line
                  pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p1.y}`;
                  midX = (p1.x + p2.x) * 0.5;
                  midY = p1.y;
                } else {
                  // Stepped orthogonal wire with crisp 90° sharp corners
                  const splitY = Math.round(p1.y + dy * 0.5);
                  pathD = `M ${p1.x} ${p1.y} L ${p1.x} ${splitY} L ${p2.x} ${splitY} L ${p2.x} ${p2.y}`;
                  midX = Math.round((p1.x + p2.x) * 0.5);
                  midY = splitY;
                }
              }

              const isLive = wire.isEnergized;
              const isSelected = selectedWireId === wire.id;

              return (
                <g 
                  key={wire.id} 
                  className="pointer-events-auto cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (wireDeleteMode) {
                      if (onDeleteWire) onDeleteWire(wire.id);
                    } else {
                      setSelectedWireId(isSelected ? null : wire.id);
                      setSelectedCompId(null);
                    }
                  }}
                >
                  {/* Generous hit area for easy selection and click */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                    strokeLinejoin="miter"
                  />

                  {/* Energized Wire Glow */}
                  {isLive && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="8"
                      strokeOpacity="0.3"
                      strokeLinejoin="miter"
                      strokeMiterlimit="4"
                      filter="url(#wireGlow)"
                    />
                  )}

                  {/* Selected Wire Glow */}
                  {isSelected && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="10"
                      strokeOpacity="0.5"
                      strokeLinejoin="miter"
                      strokeMiterlimit="4"
                      filter="url(#wireGlow)"
                    />
                  )}

                  {/* Core Wire Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isSelected
                        ? '#ef4444'
                        : isLive
                        ? '#f59e0b'
                        : gridTheme === 'white'
                        ? '#1e293b'
                        : gridTheme === 'blueprint'
                        ? '#60a5fa'
                        : '#64748b'
                    }
                    strokeWidth={isSelected ? '3.5' : isLive ? '3' : '2'}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeMiterlimit="4"
                    strokeDasharray={isSelected ? '6 3' : isLive ? '6 4' : 'none'}
                    className={`${isLive || isSelected ? 'animate-[dash_1s_linear_infinite]' : ''} group-hover:stroke-rose-400 transition-colors`}
                  />

                  {/* Terminal Anchor Dots */}
                  <circle cx={p1.x} cy={p1.y} r="3.5" fill={isSelected ? '#ef4444' : isLive ? '#fbbf24' : gridTheme === 'white' ? '#1e293b' : '#64748b'} />
                  <circle cx={p2.x} cy={p2.y} r="3.5" fill={isSelected ? '#ef4444' : isLive ? '#fbbf24' : gridTheme === 'white' ? '#1e293b' : '#64748b'} />

                  {/* Floating midpoint delete button (visible on hover, when selected, or in wireDeleteMode) */}
                  {mode === 'design' && (
                    <g
                      className={`${isSelected || wireDeleteMode ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'} transition-all duration-150 cursor-pointer`}
                      transform={`translate(${midX}, ${midY})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteWire) onDeleteWire(wire.id);
                        if (selectedWireId === wire.id) setSelectedWireId(null);
                      }}
                    >
                      <circle cx="0" cy="0" r="13" fill="#020617" opacity="0.9" />
                      <circle cx="0" cy="0" r="11" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-125 transition-transform" />
                      <path d="M -3.5 -3.5 L 3.5 3.5 M 3.5 -3.5 L -3.5 3.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Live Pending Wire with Orthogonal / Manhattan Preview */}
            {pendingTerminal && mousePos && (() => {
              const comp = compMap.get(pendingTerminal.compId);
              if (!comp) return null;
              const p1 = getTerminalCoords(comp, pendingTerminal.termId);
              const p2 = mousePos;
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;

              let previewD = '';
              if (wireStyle === 'curved') {
                const midY = p1.y + dy * 0.5;
                previewD = `M ${p1.x} ${p1.y} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
              } else {
                if (Math.abs(dx) < 4) {
                  previewD = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y}`;
                } else if (Math.abs(dy) < 4) {
                  previewD = `M ${p1.x} ${p1.y} L ${p2.x} ${p1.y}`;
                } else {
                  const splitY = Math.round(p1.y + dy * 0.5);
                  previewD = `M ${p1.x} ${p1.y} L ${p1.x} ${splitY} L ${p2.x} ${splitY} L ${p2.x} ${p2.y}`;
                }
              }

              return (
                <g className="pointer-events-none">
                  <path
                    d={previewD}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    strokeLinejoin="miter"
                    strokeMiterlimit="4"
                    className="animate-[dash_0.8s_linear_infinite]"
                  />
                  <circle cx={p1.x} cy={p1.y} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={p2.x} cy={p2.y} r="4" fill="#38bdf8" opacity="0.8" />
                </g>
              );
            })()}
          </svg>

          {/* Components Layer - SimuRelay Pure Electrical Schematic Symbols */}
          {components.map(comp => {
            const isSelected = selectedCompId === comp.id;
            const isDraggingThis = dragState?.compId === comp.id;

            return (
              <SimuRelayCanvasComponent
                key={comp.id}
                component={comp}
                isSelected={isSelected}
                isDragging={isDraggingThis}
                mode={mode}
                gridTheme={gridTheme}
                renderStyle={currentRenderStyle}
                pendingTerminalId={pendingTerminal?.compId === comp.id ? pendingTerminal.termId : null}
                onSelect={() => {
                  setSelectedCompId(comp.id);
                  setSelectedWireId(null);
                }}
                onTerminalClick={(termId, termName, e) => handleTerminalClick(comp.id, termId, termName, e)}
                onButtonPress={onButtonPress}
                onOverloadToggle={onOverloadToggle}
                onRotate={onComponentRotate}
                onDelete={onComponentDelete}
                onEdit={(c) => setEditingComp(c)}
                onStartDrag={(compId, clientX, clientY) => startDrag(compId, clientX, clientY)}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Selected Component Action Bar (Bottom Center) - Compact */}
      {selectedComp && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-bottom-2 text-xs">
          <div className="flex items-center gap-1.5 px-1.5 border-l border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-white font-mono">{selectedComp.tag}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Rotate button */}
            {onComponentRotate && (
              <button
                onClick={() => onComponentRotate(selectedComp.id)}
                className="flex items-center gap-1 px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/60 rounded-lg text-xs font-bold transition cursor-pointer"
                title="تدوير المكون 90 درجة (R)"
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>90°</span>
              </button>
            )}

            {/* Delete button */}
            {onComponentDelete && (
              <button
                onClick={() => {
                  onComponentDelete(selectedComp.id);
                  setSelectedCompId(null);
                }}
                className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/60 rounded-lg transition cursor-pointer"
                title="حذف هذا المكون (Delete)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            )}

            {/* Edit button */}
            {onComponentUpdate && (
              <button
                onClick={() => setEditingComp(selectedComp)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
                title="تعديل خصائص المكون"
              >
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            {/* Deselect button */}
            <button
              onClick={() => setSelectedCompId(null)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="إلغاء التحديد (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Selected Wire Action Bar (Bottom Center) */}
      {selectedWire && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-red-500/70 rounded-2xl shadow-2xl p-2.5 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-3 ring-1 ring-red-500/30">
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="font-bold text-white">سلك توصيل محدد:</span>
            <span className="text-amber-400 font-mono font-bold">
              {compMap.get(selectedWire.fromComponentId)?.tag || '?'}:{selectedWire.fromTerminalId}
            </span>
            <span className="text-slate-500">➔</span>
            <span className="text-amber-400 font-mono font-bold">
              {compMap.get(selectedWire.toComponentId)?.tag || '?'}:{selectedWire.toTerminalId}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onDeleteWire && (
              <button
                onClick={() => {
                  onDeleteWire(selectedWire.id);
                  setSelectedWireId(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-red-600/30 active:scale-95"
                title="حذف هذا السلك الكهربائي (Delete / Backspace)"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>حذف السلك الآن</span>
              </button>
            )}

            <button
              onClick={() => setSelectedWireId(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="إلغاء التحديد"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Selected Reference Diagram Action Bar (Bottom Center) */}
      {isDiagramSelected && importedDiagram && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-500/70 rounded-2xl shadow-2xl p-2.5 flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-3 ring-1 ring-amber-500/30" dir="rtl">
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-white">المخطط المحدد:</span>
            <span className="text-amber-300 font-bold truncate max-w-[130px]">{importedDiagram.name}</span>
            <span className="text-slate-400 font-mono text-[10px]">({importedDiagram.width}×{importedDiagram.height})</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCenterDiagram}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="توسيط المخطط في المنتصف"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>توسيط</span>
            </button>

            <button
              onClick={handleFitDiagram}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="ملاءمة الشاشة"
            >
              <Maximize className="w-3.5 h-3.5 text-amber-400" />
              <span>ملاءمة</span>
            </button>

            {onRemoveImportedDiagram && (
              <button
                onClick={() => {
                  onRemoveImportedDiagram();
                  setIsDiagramSelected(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-red-600/30"
                title="حذف المخطط من مساحة العمل (Delete / Backspace)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            )}

            <button
              onClick={() => setIsDiagramSelected(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="إلغاء التحديد (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal for Clearing All Wires */}
      {confirmClearWires && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">حذف كافة أسلاك التوصيل</h4>
                <p className="text-xs text-slate-400 mt-1">هل أنت متأكد من حذف جميع الأسلاك ({wires.length} أسلاك) والبدء من جديد؟</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setConfirmClearWires(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (onClearAllWires) onClearAllWires();
                  setConfirmClearWires(false);
                  setSelectedWireId(null);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                تأكيد حذف جميع الأسلاك
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Editor Modal */}
      {editingComp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <span>خصائص المكون ({editingComp.tag})</span>
              </h4>
              <button 
                onClick={() => setEditingComp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">رمز العنصر (Tag):</label>
              <input
                type="text"
                value={editingComp.tag}
                onChange={e => setEditingComp({ ...editingComp, tag: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            {(editingComp.type === 'contactor_contact_no' || 
              editingComp.type === 'contactor_contact_nc' || 
              editingComp.type === 'timer_contact_no') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ربط بملف (Linked Coil Tag):
                </label>
                <input
                  type="text"
                  placeholder="مثال: KM1 أو KM2 أو KT1"
                  value={editingComp.linkedTag || ''}
                  onChange={e => setEditingComp({ ...editingComp, linkedTag: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            )}

            {editingComp.type === 'timer_coil' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  مدة المؤقت بالثواني:
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={editingComp.timerSeconds || 3}
                  onChange={e => setEditingComp({ ...editingComp, timerSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingComp(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (onComponentUpdate) {
                    onComponentUpdate(editingComp.id, editingComp);
                  }
                  setEditingComp(null);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
