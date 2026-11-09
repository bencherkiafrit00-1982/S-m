import React, { useState } from 'react';
import { 
  LadderDiagram, 
  LadderRung, 
  LadderBranch, 
  LadderParallelGroup, 
  LadderElement, 
  LadderElementType 
} from '../types/ladder';
import { ImportedDiagram } from '../types/diagram';
import { ReferenceDiagramOverlay } from './ReferenceDiagramOverlay';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Plus, 
  Trash2, 
  Settings2, 
  Check, 
  Zap, 
  Clock, 
  Cpu, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowRight,
  Split,
  Eye,
  EyeOff,
  Crosshair,
  Maximize,
  RotateCcw,
  Activity,
  Maximize2
} from 'lucide-react';

interface LadderCanvasProps {
  ladder: LadderDiagram;
  isSimulating: boolean;
  syncWithHardware: boolean;
  onToggleSimulating: () => void;
  onToggleSyncWithHardware: () => void;
  onSingleScanStep: () => void;
  onUpdateLadder: (updated: LadderDiagram) => void;
  onContactClick: (tag: string, linkedTag?: string) => void;
  onAddRung?: () => void;
  onResetLadder?: () => void;
  compact?: boolean;
  importedDiagram?: ImportedDiagram | null;
  onUpdateImportedDiagram?: (updated: Partial<ImportedDiagram>) => void;
  onRemoveImportedDiagram?: () => void;
  onOpenDiagramAnalysis?: () => void;
  onReimportDiagram?: () => void;
}

export const LadderCanvas: React.FC<LadderCanvasProps> = ({
  ladder,
  isSimulating,
  syncWithHardware,
  onToggleSimulating,
  onToggleSyncWithHardware,
  onSingleScanStep,
  onUpdateLadder,
  onContactClick,
  onAddRung,
  onResetLadder,
  compact = false,
  importedDiagram,
  onUpdateImportedDiagram,
  onRemoveImportedDiagram,
  onOpenDiagramAnalysis,
  onReimportDiagram
}) => {
  const [zoom, setZoom] = useState<number>(0.95);
  const [editingElement, setEditingElement] = useState<LadderElement | null>(null);
  const [activePaletteType, setActivePaletteType] = useState<LadderElementType | null>(null);

  // Rung wire spacing constants
  const railLeftX = 60;
  const railRightX = 780;
  const rungSpacingY = 140;

  // Render a single Ladder Contact
  const renderContact = (
    el: LadderElement, 
    x: number, 
    y: number, 
    incomingPower: boolean, 
    outgoingPower: boolean
  ) => {
    const isLive = el.isPowerActive;
    const isState = el.isStateActive;
    const isNC = el.type === 'contact_nc';
    const isRising = el.type === 'contact_rising';
    const isFalling = el.type === 'contact_falling';

    const wireColor = isLive ? '#22c55e' : '#475569';
    const contactColor = isLive ? '#22c55e' : '#94a3b8';
    const glowFilter = isLive ? 'url(#powerGlow)' : undefined;

    return (
      <g 
        key={el.id} 
        transform={`translate(${x}, ${y})`}
        className="cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          onContactClick(el.tag, el.linkedHardwareTag);
        }}
      >
        {/* Generous hit area for clicking */}
        <rect x="-25" y="-30" width="50" height="60" fill="transparent" />

        {/* Ingoing and outgoing horizontal lead wires */}
        <line x1="-25" y1="0" x2="-8" y2="0" stroke={incomingPower ? '#22c55e' : '#475569'} strokeWidth="2.5" filter={incomingPower ? 'url(#powerGlow)' : undefined} />
        <line x1="8" y1="0" x2="25" y2="0" stroke={outgoingPower ? '#22c55e' : '#475569'} strokeWidth="2.5" filter={outgoingPower ? 'url(#powerGlow)' : undefined} />

        {/* Contact Plate 1 (Left) */}
        <line x1="-8" y1="-14" x2="-8" y2="14" stroke={contactColor} strokeWidth="3" strokeLinecap="round" filter={glowFilter} />

        {/* Contact Plate 2 (Right) */}
        <line x1="8" y1="-14" x2="8" y2="14" stroke={contactColor} strokeWidth="3" strokeLinecap="round" filter={glowFilter} />

        {/* NC Diagonal Slash */}
        {isNC && (
          <line x1="-12" y1="12" x2="12" y2="-12" stroke={isState ? '#ef4444' : contactColor} strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Edge Indicator Letters */}
        {isRising && (
          <text x="0" y="4" textAnchor="middle" fill={contactColor} fontSize="10" fontWeight="900" fontFamily="monospace">P</text>
        )}
        {isFalling && (
          <text x="0" y="4" textAnchor="middle" fill={contactColor} fontSize="10" fontWeight="900" fontFamily="monospace">N</text>
        )}

        {/* Tag Name Label (Above contact) */}
        <text 
          x="0" 
          y="-20" 
          textAnchor="middle" 
          fill={isLive ? '#4ade80' : '#f8fafc'} 
          fontSize="11" 
          fontWeight="900" 
          fontFamily="JetBrains Mono, monospace"
          className="group-hover:fill-amber-400 transition-colors"
        >
          {el.tag}
        </text>

        {/* Arabic / Secondary Description Label (Below contact) */}
        {el.labelAr && (
          <text 
            x="0" 
            y="26" 
            textAnchor="middle" 
            fill="#94a3b8" 
            fontSize="8.5" 
            fontWeight="bold"
            className="group-hover:fill-slate-200 transition-colors"
          >
            {el.labelAr}
          </text>
        )}

        {/* Dynamic state badge (ON / OFF) */}
        <circle 
          cx="0" 
          cy="0" 
          r="3" 
          fill={isState ? '#22c55e' : '#334155'} 
          stroke={isState ? '#86efac' : '#1e293b'} 
          strokeWidth="1" 
        />
      </g>
    );
  };

  // Render a Ladder Output Coil
  const renderCoil = (
    coil: LadderElement, 
    x: number, 
    y: number, 
    incomingPower: boolean
  ) => {
    const isLive = coil.isPowerActive;
    const isEnergized = coil.isStateActive;
    const isSet = coil.type === 'coil_set';
    const isReset = coil.type === 'coil_reset';
    const isNegated = coil.type === 'coil_negated';

    const coilColor = isEnergized ? '#22c55e' : '#94a3b8';
    const glowFilter = isEnergized ? 'url(#powerGlow)' : undefined;

    return (
      <g 
        key={coil.id} 
        transform={`translate(${x}, ${y})`}
        className="cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          setEditingElement(coil);
        }}
      >
        <rect x="-30" y="-30" width="60" height="60" fill="transparent" />

        {/* Lead from left logic & Lead to right neutral rail */}
        <line x1="-30" y1="0" x2="-14" y2="0" stroke={incomingPower ? '#22c55e' : '#475569'} strokeWidth="2.5" filter={incomingPower ? 'url(#powerGlow)' : undefined} />
        <line x1="14" y1="0" x2="30" y2="0" stroke={isEnergized ? '#22c55e' : '#475569'} strokeWidth="2.5" />

        {/* Left Parenthesis arc: ( */}
        <path d="M -8 -15 C -15 -8, -15 8, -8 15" fill="none" stroke={coilColor} strokeWidth="3" strokeLinecap="round" filter={glowFilter} />

        {/* Right Parenthesis arc: ) */}
        <path d="M 8 -15 C 15 -8, 15 8, 8 15" fill="none" stroke={coilColor} strokeWidth="3" strokeLinecap="round" filter={glowFilter} />

        {/* Inner Symbol letters: S for Set, R for Reset, / for Negated */}
        {isSet && (
          <text x="0" y="4" textAnchor="middle" fill={coilColor} fontSize="11" fontWeight="900" fontFamily="monospace">S</text>
        )}
        {isReset && (
          <text x="0" y="4" textAnchor="middle" fill={coilColor} fontSize="11" fontWeight="900" fontFamily="monospace">R</text>
        )}
        {isNegated && (
          <line x1="-7" y1="8" x2="7" y2="-8" stroke={coilColor} strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Central glowing indicator core when coil is pulled in */}
        {isEnergized && (
          <circle cx="0" cy="0" r="4.5" fill="#22c55e" className="animate-pulse" />
        )}

        {/* Tag Name above coil */}
        <text 
          x="0" 
          y="-20" 
          textAnchor="middle" 
          fill={isEnergized ? '#4ade80' : '#f8fafc'} 
          fontSize="11" 
          fontWeight="900" 
          fontFamily="JetBrains Mono, monospace"
        >
          {coil.tag}
        </text>

        {/* Label below coil */}
        {coil.labelAr && (
          <text 
            x="0" 
            y="26" 
            textAnchor="middle" 
            fill="#94a3b8" 
            fontSize="8.5" 
            fontWeight="bold"
          >
            {coil.labelAr}
          </text>
        )}
      </g>
    );
  };

  // Render Timer Block (TON / TOF / TP)
  const renderTimerBlock = (
    timer: LadderElement, 
    x: number, 
    y: number, 
    incomingPower: boolean
  ) => {
    const isLive = timer.isPowerActive;
    const isDone = timer.isStateActive;
    const pt = timer.presetTime || 3.0;
    const et = timer.elapsedTime || 0;
    const progress = Math.min(1, et / pt);

    return (
      <g 
        key={timer.id} 
        transform={`translate(${x}, ${y})`}
        className="cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          setEditingElement(timer);
        }}
      >
        {/* In & Out leads */}
        <line x1="-50" y1="0" x2="-35" y2="0" stroke={incomingPower ? '#22c55e' : '#475569'} strokeWidth="2.5" />
        <line x1="35" y1="0" x2="50" y2="0" stroke={isDone ? '#22c55e' : '#475569'} strokeWidth="2.5" />

        {/* Timer Box Housing */}
        <rect 
          x="-35" 
          y="-28" 
          width="70" 
          height="56" 
          rx="5" 
          fill="#0f172a" 
          stroke={isDone ? '#22c55e' : isLive ? '#f59e0b' : '#334155'} 
          strokeWidth="1.8" 
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
        />

        {/* Header Bar */}
        <rect x="-35" y="-28" width="70" height="15" rx="4" fill="#1e293b" />
        <text x="0" y="-17" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="900" fontFamily="monospace">
          {timer.type === 'timer_tof' ? 'TOF' : timer.type === 'timer_tp' ? 'TP' : 'TON'} : {timer.tag}
        </text>

        {/* Live Elapsed / Preset Bar */}
        <rect x="-28" y="-7" width="56" height="5" rx="2" fill="#020617" />
        <rect 
          x="-28" 
          y="-7" 
          width={56 * progress} 
          height="5" 
          rx="2" 
          fill={isDone ? '#22c55e' : '#f59e0b'} 
          className="transition-all duration-75"
        />

        {/* Live seconds readout */}
        <text x="0" y="10" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
          {et.toFixed(1)}s / {pt.toFixed(1)}s
        </text>

        {/* Status indicator pin */}
        <circle 
          cx="28" 
          cy="18" 
          r="3" 
          fill={isDone ? '#22c55e' : '#334155'} 
          stroke={isDone ? '#86efac' : '#1e293b'} 
          strokeWidth="1" 
        />
        <text x="22" y="20.5" textAnchor="end" fill="#94a3b8" fontSize="6.5" fontWeight="bold">Q</text>
      </g>
    );
  };

  // Render Counter Block (CTU / CTD)
  const renderCounterBlock = (
    counter: LadderElement,
    x: number,
    y: number,
    incomingPower: boolean
  ) => {
    const isDone = counter.isStateActive;
    const pv = counter.presetCount || 5;
    const cv = counter.currentCount || 0;

    return (
      <g 
        key={counter.id}
        transform={`translate(${x}, ${y})`}
        className="cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          setEditingElement(counter);
        }}
      >
        <line x1="-50" y1="0" x2="-35" y2="0" stroke={incomingPower ? '#22c55e' : '#475569'} strokeWidth="2.5" />
        <line x1="35" y1="0" x2="50" y2="0" stroke={isDone ? '#22c55e' : '#475569'} strokeWidth="2.5" />

        <rect 
          x="-35" 
          y="-28" 
          width="70" 
          height="56" 
          rx="5" 
          fill="#0f172a" 
          stroke={isDone ? '#22c55e' : '#334155'} 
          strokeWidth="1.8" 
        />
        <rect x="-35" y="-28" width="70" height="15" rx="4" fill="#1e293b" />
        <text x="0" y="-17" textAnchor="middle" fill="#a855f7" fontSize="8.5" fontWeight="900" fontFamily="monospace">
          CTU : {counter.tag}
        </text>

        <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="monospace">
          {cv} / {pv}
        </text>

        <text x="0" y="18" textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontWeight="bold">
          {isDone ? 'COUNT DONE ✓' : 'COUNTING'}
        </text>
      </g>
    );
  };

  // Render a Rung
  const renderRung = (rung: LadderRung, rungIndex: number) => {
    const rungY = 60 + rungIndex * rungSpacingY;
    const isRungActive = !!rung.isPowerActive;

    // Calculate positions along the horizontal axis
    // Series items on main branch
    const branchItems = rung.mainBranch.items;
    const startX = railLeftX + 30;
    const outputStartX = railRightX - 80;

    return (
      <g key={rung.id} className="select-none">
        {/* Rung Number Badge & Arabic Comment */}
        <g transform={`translate(${railLeftX - 10}, ${rungY - 45})`}>
          <rect x="-35" y="0" width="30" height="16" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <text x="-20" y="11.5" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
            [{String(rung.rungNumber).padStart(4, '0')}]
          </text>
          {rung.commentAr && (
            <text x="5" y="12" fill="#94a3b8" fontSize="9.5" fontWeight="bold" fontFamily="Cairo, sans-serif">
              {rung.commentAr}
            </text>
          )}
        </g>

        {/* Lead from Left Power Rail to first component */}
        <line 
          x1={railLeftX} 
          y1={rungY} 
          x2={startX} 
          y2={rungY} 
          stroke="#22c55e" 
          strokeWidth="3" 
          filter="url(#powerGlow)" 
        />

        {/* Render series items & parallel branches on main branch */}
        {(() => {
          let currX = startX;
          let runningPower = true;

          return branchItems.map((item, idx) => {
            if ('type' in item && item.type === 'parallel_group') {
              // Parallel OR group (e.g. Start SB2 in parallel with Aux KM1 latch)
              const group = item as LadderParallelGroup;
              const groupWidth = 140;
              const branchHeight = 44;
              const gX = currX;
              const gEndY = rungY + branchHeight;
              const gEndX = gX + groupWidth;

              const isGroupActive = group.isPowerActive;
              currX = gEndX;

              return (
                <g key={group.id}>
                  {/* Top branch line */}
                  <line 
                    x1={gX} 
                    y1={rungY} 
                    x2={gX + 25} 
                    y2={rungY} 
                    stroke={runningPower ? '#22c55e' : '#475569'} 
                    strokeWidth="2.5" 
                  />
                  {/* Vertical drop line down to parallel branch */}
                  <line 
                    x1={gX + 10} 
                    y1={rungY} 
                    x2={gX + 10} 
                    y2={gEndY} 
                    stroke={runningPower ? '#22c55e' : '#475569'} 
                    strokeWidth="2.5" 
                  />
                  <line 
                    x1={gX + 10} 
                    y1={gEndY} 
                    x2={gX + 25} 
                    y2={gEndY} 
                    stroke={runningPower ? '#22c55e' : '#475569'} 
                    strokeWidth="2.5" 
                  />

                  {/* Render Branch 1 element (Upper: e.g. Start button SB2) */}
                  {group.branches[0]?.items[0] && (
                    renderContact(
                      group.branches[0].items[0] as LadderElement,
                      gX + 70,
                      rungY,
                      runningPower,
                      group.branches[0].items[0].isPowerActive || false
                    )
                  )}

                  {/* Render Branch 2 element (Lower: e.g. Latch contact KM1) */}
                  {group.branches[1]?.items[0] && (
                    renderContact(
                      group.branches[1].items[0] as LadderElement,
                      gX + 70,
                      gEndY,
                      runningPower,
                      group.branches[1].items[0].isPowerActive || false
                    )
                  )}

                  {/* Right rejoin line */}
                  <line 
                    x1={gX + 115} 
                    y1={rungY} 
                    x2={gEndX} 
                    y2={rungY} 
                    stroke={isGroupActive ? '#22c55e' : '#475569'} 
                    strokeWidth="2.5" 
                    filter={isGroupActive ? 'url(#powerGlow)' : undefined}
                  />
                  <line 
                    x1={gX + 115} 
                    y1={gEndY} 
                    x2={gEndX - 10} 
                    y2={gEndY} 
                    stroke={group.branches[1]?.isPowerActive ? '#22c55e' : '#475569'} 
                    strokeWidth="2.5" 
                  />
                  <line 
                    x1={gEndX - 10} 
                    y1={gEndY} 
                    x2={gEndX - 10} 
                    y2={rungY} 
                    stroke={group.branches[1]?.isPowerActive ? '#22c55e' : '#475569'} 
                    strokeWidth="2.5" 
                  />
                </g>
              );
            } else {
              // Regular Series element (Contact or block)
              const el = item as LadderElement;
              const elX = currX + 45;
              const incoming = runningPower;
              const outgoing = el.isPowerActive || false;
              runningPower = outgoing;
              currX += 90;

              return renderContact(el, elX, rungY, incoming, outgoing);
            }
          });
        })()}

        {/* Extension Wire to Outputs on the Right */}
        <line 
          x1={startX + (branchItems.length > 2 ? 320 : 250)} 
          y1={rungY} 
          x2={outputStartX - 30} 
          y2={rungY} 
          stroke={isRungActive ? '#22c55e' : '#475569'} 
          strokeWidth="2.5" 
          filter={isRungActive ? 'url(#powerGlow)' : undefined}
        />

        {/* Action Outputs on the Right (Coils, Timers, Counters) */}
        {rung.outputs.map((out, outIdx) => {
          const outX = outputStartX + outIdx * 80;

          if (out.type.startsWith('timer_')) {
            return renderTimerBlock(out, outX, rungY, isRungActive);
          } else if (out.type.startsWith('counter_')) {
            return renderCounterBlock(out, outX, rungY, isRungActive);
          } else {
            return renderCoil(out, outX, rungY, isRungActive);
          }
        })}

        {/* Connection to Right Neutral Rail */}
        <line 
          x1={outputStartX + 30} 
          y1={rungY} 
          x2={railRightX} 
          y2={rungY} 
          stroke={rung.outputs.some(o => o.isStateActive) ? '#38bdf8' : '#475569'} 
          strokeWidth="2.5" 
        />
      </g>
    );
  };

  const totalHeight = Math.max(500, ladder.rungs.length * rungSpacingY + 120);

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col overflow-hidden select-none" dir="ltr">
      {/* Top Ladder Telemetry & Scan Control Bar */}
      <div className="h-10 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
        {/* Left: Mode Title & Real-time Scan Telemetry */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 font-bold font-mono text-[11px] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LADDER PLC SCAN</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
            <span>Scan: <strong className="text-emerald-400">{ladder.scanCycleMs} ms</strong></span>
            <span>•</span>
            <span>Cycles: <strong className="text-amber-400">{ladder.scanCount}</strong></span>
          </div>

          {/* Sync Hardware Toggle */}
          <button
            onClick={onToggleSyncWithHardware}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
              syncWithHardware
                ? 'bg-purple-950/80 border-purple-500/70 text-purple-300 ring-1 ring-purple-500/40'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="تزامن مخطط Ladder مباشرة مع الدائرة الواقعية للمحرك والمعدات"
          >
            <Activity className="w-3 h-3 text-purple-400" />
            <span>Sync Hardware: {syncWithHardware ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Simulation & Single-Step Actions */}
        <div className="flex items-center gap-1.5">
          {/* Single Scan Step Button (تنفيذ دورة مسح واحدة) */}
          <button
            onClick={onSingleScanStep}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
            title="تنفيذ Scan دورة مسح واحدة لأغراض التعليم والتشخيص"
          >
            <ArrowRight className="w-3 h-3 text-amber-400" />
            <span>1-Step Scan</span>
          </button>

          {/* Run / Pause Toggle */}
          <button
            onClick={onToggleSimulating}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md transition cursor-pointer ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isSimulating ? 'PAUSE' : 'RUN'}</span>
          </button>

          {/* Add Rung */}
          {onAddRung && (
            <button
              onClick={onAddRung}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
              title="إضافة سطر جديد (Add Rung)"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* Reference Diagram Locator HUD */}
          {importedDiagram && (importedDiagram.targetCanvas === 'ladder' || importedDiagram.targetCanvas === 'both') && (
            <div className="flex items-center bg-slate-950 rounded-lg border border-amber-500/50 p-0.5 text-[11px] gap-0.5">
              <span className="text-[10px] text-amber-400 font-bold px-1 flex items-center gap-1 border-l border-slate-800">
                <span>📐 المخطط</span>
              </span>

              {/* Center Diagram */}
              <button
                onClick={() => onUpdateImportedDiagram && onUpdateImportedDiagram({
                  x: Math.max(20, Math.round((850 - importedDiagram.width) / 2)),
                  y: 40,
                  isVisible: true
                })}
                className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded flex items-center gap-1 transition cursor-pointer text-[10px]"
                title="توسيط المخطط في مخطط Ladder"
              >
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span>توسيط</span>
              </button>

              {/* Fit Diagram */}
              <button
                onClick={() => {
                  if (!onUpdateImportedDiagram) return;
                  const targetW = 800;
                  const ratio = (importedDiagram.originalWidth || 800) / (importedDiagram.originalHeight || 600);
                  onUpdateImportedDiagram({
                    x: 20,
                    y: 30,
                    width: targetW,
                    height: Math.round(targetW / ratio),
                    isVisible: true
                  });
                }}
                className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 hover:text-amber-300 rounded flex items-center gap-1 transition cursor-pointer text-[10px]"
                title="ملاءمة المخطط"
              >
                <Maximize className="w-3 h-3 text-amber-400" />
                <span>ملاءمة</span>
              </button>

              {/* Reset Position */}
              <button
                onClick={() => onUpdateImportedDiagram && onUpdateImportedDiagram({
                  x: 30,
                  y: 30,
                  width: Math.min(800, importedDiagram.originalWidth || 700),
                  height: Math.round(Math.min(800, importedDiagram.originalWidth || 700) * ((importedDiagram.originalHeight || 600) / (importedDiagram.originalWidth || 700))),
                  rotation: 0,
                  opacity: 0.95,
                  isVisible: true
                })}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                title="إعادة تعيين موضع المخطط"
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

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5 text-[10px] font-mono">
            <button 
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} 
              className="px-1.5 hover:text-white text-slate-400 cursor-pointer"
            >
              -
            </button>
            <span className="text-slate-300">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(1.4, zoom + 0.1))} 
              className="px-1.5 hover:text-white text-slate-400 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Ladder Canvas */}
      <div className="flex-1 w-full h-full overflow-auto p-4 circuit-grid">
        <div 
          className="relative min-w-[850px] transition-transform origin-top-left"
          style={{ transform: `scale(${zoom})`, height: `${totalHeight}px` }}
        >
          {importedDiagram && (importedDiagram.targetCanvas === 'ladder' || importedDiagram.targetCanvas === 'both') && (
            <ReferenceDiagramOverlay
              diagram={importedDiagram}
              zoom={zoom}
              onUpdateDiagram={onUpdateImportedDiagram || (() => {})}
              onRemoveDiagram={onRemoveImportedDiagram || (() => {})}
              onOpenAnalysis={onOpenDiagramAnalysis || (() => {})}
              onReimport={onReimportDiagram || (() => {})}
            />
          )}

          <svg className="w-full h-full overflow-visible">
            <defs>
              {/* Power Flow Glow Filter */}
              <filter id="powerGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Left Power Rail (L / Phase potential) */}
            <g>
              <line 
                x1={railLeftX} 
                y1={20} 
                x2={railLeftX} 
                y2={totalHeight - 40} 
                stroke="#22c55e" 
                strokeWidth="4" 
                strokeLinecap="round"
                filter="url(#powerGlow)"
              />
              <rect x={railLeftX - 22} y={10} width="44" height="20" rx="3" fill="#020617" stroke="#22c55e" strokeWidth="1.5" />
              <text x={railLeftX} y={23.5} textAnchor="middle" fill="#4ade80" fontSize="9.5" fontWeight="900" fontFamily="JetBrains Mono, monospace">
                ⚡ L1
              </text>
            </g>

            {/* Right Neutral Rail (N / Return potential) */}
            <g>
              <line 
                x1={railRightX} 
                y1={20} 
                x2={railRightX} 
                y2={totalHeight - 40} 
                stroke="#38bdf8" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
              <rect x={railRightX - 20} y={10} width="40" height="20" rx="3" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
              <text x={railRightX} y={23.5} textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="900" fontFamily="JetBrains Mono, monospace">
                N
              </text>
            </g>

            {/* Render All Rungs */}
            {ladder.rungs.map((rung, idx) => renderRung(rung, idx))}
          </svg>
        </div>
      </div>

      {/* Element Properties Modal */}
      {editingElement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-400" />
                <span>خصائص عنصر Ladder ({editingElement.tag})</span>
              </h4>
              <button onClick={() => setEditingElement(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">رمز العنصر (Tag):</label>
              <input
                type="text"
                value={editingElement.tag}
                onChange={e => setEditingElement({ ...editingElement, tag: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الوصف بالعربية:</label>
              <input
                type="text"
                value={editingElement.labelAr || ''}
                onChange={e => setEditingElement({ ...editingElement, labelAr: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                placeholder="مثال: زر تشغيل، ملامس تعشيق..."
              />
            </div>

            {editingElement.presetTime !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">الزمن المضبوط (Preset Time بالثواني):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="60"
                  value={editingElement.presetTime}
                  onChange={e => setEditingElement({ ...editingElement, presetTime: parseFloat(e.target.value) || 3.0 })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
            )}

            {editingElement.presetCount !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">عدد العدات المضبوط (Preset Count):</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={editingElement.presetCount}
                  onChange={e => setEditingElement({ ...editingElement, presetCount: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingElement(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const updatedRungs = ladder.rungs.map(rung => ({
                    ...rung,
                    outputs: rung.outputs.map(out => out.id === editingElement.id ? editingElement : out),
                    mainBranch: {
                      ...rung.mainBranch,
                      items: rung.mainBranch.items.map(item => item.id === editingElement.id ? editingElement : item)
                    }
                  }));
                  onUpdateLadder({ ...ladder, rungs: updatedRungs });
                  setEditingElement(null);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
