import React, { useState } from 'react';
import { CircuitComponent, Terminal, CircuitRenderStyle } from '../types/circuit';
import { RealisticIndustrialComponent } from './RealisticIndustrialComponent';
import { 
  RotateCw, 
  Trash2, 
  Settings2, 
  Power, 
  Clock, 
  Check, 
  AlertTriangle,
  Zap,
  Play,
  Square
} from 'lucide-react';

interface SimuRelayCanvasComponentProps {
  component: CircuitComponent;
  isSelected: boolean;
  isDragging: boolean;
  mode: 'design' | 'run';
  gridTheme?: 'dark' | 'blueprint' | 'white';
  renderStyle?: CircuitRenderStyle;
  pendingTerminalId?: string | null;
  onSelect: (e: React.MouseEvent) => void;
  onTerminalClick: (termId: string, termName: string, e: React.MouseEvent) => void;
  onButtonPress: (id: string, pressed: boolean) => void;
  onOverloadToggle: (id: string) => void;
  onRotate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (comp: CircuitComponent) => void;
  onStartDrag: (compId: string, clientX: number, clientY: number) => void;
}

export const SimuRelayCanvasComponent: React.FC<SimuRelayCanvasComponentProps> = ({
  component,
  isSelected,
  isDragging,
  mode,
  gridTheme = 'dark',
  renderStyle = 'schematic',
  pendingTerminalId,
  onSelect,
  onTerminalClick,
  onButtonPress,
  onOverloadToggle,
  onRotate,
  onDelete,
  onEdit,
  onStartDrag
}) => {
  const [hoveredTerminal, setHoveredTerminal] = useState<string | null>(null);

  const {
    id,
    tag,
    name,
    type,
    x,
    y,
    width,
    height,
    terminals,
    isEnergized = false,
    isPressed = false,
    isTripped = false,
    closed = false,
    rotation = 0,
    motorRunning = false,
    color,
    linkedTag,
    timerSeconds = 3,
    timerElapsed = 0,
    symbolSvg
  } = component;

  // Determine colors based on gridTheme and electrical state
  const isLightTheme = gridTheme === 'white';
  const defaultStroke = isLightTheme ? '#334155' : '#cbd5e1';
  const energizedStroke = '#f59e0b'; // Amber electrical glow
  const neutralStroke = '#38bdf8'; // Sky blue neutral
  const trippedStroke = '#ef4444'; // Red fault

  const strokeColor = isTripped
    ? trippedStroke
    : isEnergized
    ? energizedStroke
    : defaultStroke;

  // Compact, sleek CAD stroke width & dimensions (SimuRelay Compact Sizing)
  const strokeWidth = 1.8;
  const cx = width / 2;
  const cy = height / 2;

  // Standard terminal pins
  const termTop = terminals[0] || { id: '1', name: '1', x: cx, y: 0 };
  const termBottom = terminals[1] || { id: '2', name: '2', x: cx, y: height };

  // Alignment trunk X (wire axis)
  const trunkX = termTop.x;

  // Correct default contact state: NC pushbuttons are naturally CLOSED at rest (closed: true)
  const isNc = type === 'pushbutton_nc';
  const effectiveClosed = component.closed !== undefined ? component.closed : (isNc ? true : false);

  // Render Compact Schematic Symbol Core (IEC / SimuRelay standard)
  const renderSymbolCore = () => {
    switch (type) {
      // 1. Pushbutton NO (زر تشغيل مفتوح عادة - SB / Start)
      case 'pushbutton_no': {
        const isClosed = isPressed || effectiveClosed;
        const contactTopY = cy - 9;
        const contactBottomY = cy + 9;

        return (
          <g>
            {/* Top lead to contact point */}
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={contactTopY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactTopY} r="2.5" fill={strokeColor} />

            {/* Bottom lead to contact point */}
            <line x1={trunkX} y1={contactBottomY} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactBottomY} r="2.5" fill={strokeColor} />

            {/* Switch Blade: open at rest, connects to contactTopY when closed/pressed */}
            <line
              x1={trunkX}
              y1={contactBottomY}
              x2={isClosed ? trunkX : trunkX - 11}
              y2={isClosed ? contactTopY : cy - 3}
              stroke={isClosed ? energizedStroke : strokeColor}
              strokeWidth={strokeWidth + 0.4}
              strokeLinecap="round"
              className="transition-all duration-100"
            />

            {/* Compact Pushbutton mechanical stem & T-actuator */}
            <line 
              x1={isClosed ? trunkX - 2 : trunkX - 7} 
              y1={cy} 
              x2={isClosed ? trunkX - 12 : trunkX - 16} 
              y2={cy} 
              stroke={defaultStroke} 
              strokeWidth="1.4" 
              strokeDasharray="2 1.5" 
            />
            <line 
              x1={isClosed ? trunkX - 12 : trunkX - 16} 
              y1={cy - 7} 
              x2={isClosed ? trunkX - 12 : trunkX - 16} 
              y2={cy + 7} 
              stroke={isClosed ? '#10b981' : defaultStroke} 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />
          </g>
        );
      }

      // 2. Pushbutton NC (زر إيقاف مغلق عادة - SB / Stop)
      case 'pushbutton_nc': {
        const isOpened = isPressed || !effectiveClosed;
        const contactTopY = cy - 9;
        const contactBottomY = cy + 9;

        return (
          <g>
            {/* Top lead */}
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={contactTopY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactTopY} r="2.5" fill={strokeColor} />

            {/* Bottom lead */}
            <line x1={trunkX} y1={contactBottomY} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactBottomY} r="2.5" fill={strokeColor} />

            {/* NC Contact Bridge: bridges between terminals at rest, pulled away to trunkX-9 when open/pressed */}
            {isOpened ? (
              // Open position when pressed (clear physical air gap)
              <line 
                x1={trunkX - 9} 
                y1={cy + 6} 
                x2={trunkX - 9} 
                y2={cy - 6} 
                stroke="#ef4444" 
                strokeWidth={strokeWidth + 0.4} 
                strokeLinecap="round"
              />
            ) : (
              // Closed position normally (passes power through)
              <line 
                x1={trunkX} 
                y1={contactTopY} 
                x2={trunkX} 
                y2={contactBottomY} 
                stroke={isEnergized ? energizedStroke : strokeColor} 
                strokeWidth={strokeWidth + 0.4} 
              />
            )}

            {/* Pushbutton Stem & NC bracket (mechanically connected to moving contact) */}
            <line 
              x1={isOpened ? trunkX - 9 : trunkX} 
              y1={cy} 
              x2={isOpened ? trunkX - 18 : trunkX - 15} 
              y2={cy} 
              stroke={defaultStroke} 
              strokeWidth="1.4" 
              strokeDasharray="2 1.5" 
            />
            <line 
              x1={isOpened ? trunkX - 18 : trunkX - 15} 
              y1={cy - 7} 
              x2={isOpened ? trunkX - 18 : trunkX - 15} 
              y2={cy + 7} 
              stroke={isOpened ? '#ef4444' : '#dc2626'} 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />
          </g>
        );
      }

      // 3. Contactor Auxiliary Contact NO (ملامس مساعد مفتوح 13-14)
      case 'contactor_contact_no': {
        const isClosed = closed;
        const contactTopY = cy - 9;
        const contactBottomY = cy + 9;

        return (
          <g>
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={contactTopY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactTopY} r="2.5" fill={strokeColor} />

            <line x1={trunkX} y1={contactBottomY} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactBottomY} r="2.5" fill={strokeColor} />

            {/* Switch Blade */}
            <line
              x1={trunkX}
              y1={contactBottomY}
              x2={isClosed ? trunkX : trunkX - 11}
              y2={isClosed ? contactTopY : cy - 3}
              stroke={isClosed ? energizedStroke : strokeColor}
              strokeWidth={strokeWidth + 0.4}
              strokeLinecap="round"
              className="transition-all duration-150"
            />

            {/* Auxiliary mechanical link line */}
            {linkedTag && (
              <line x1={trunkX - 5} y1={cy + 1} x2={trunkX - 15} y2={cy + 1} stroke={defaultStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
            )}
          </g>
        );
      }

      // 4. Contactor Auxiliary Contact NC (ملامس مساعد مغلق 21-22)
      case 'contactor_contact_nc': {
        const isOpened = !closed;
        const contactTopY = cy - 9;
        const contactBottomY = cy + 9;

        return (
          <g>
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={contactTopY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactTopY} r="2.5" fill={strokeColor} />

            <line x1={trunkX} y1={contactBottomY} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactBottomY} r="2.5" fill={strokeColor} />

            {isOpened ? (
              <line 
                x1={trunkX} 
                y1={contactBottomY} 
                x2={trunkX - 11} 
                y2={cy - 3} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth + 0.4} 
                strokeLinecap="round"
              />
            ) : (
              <g>
                <line x1={trunkX} y1={contactTopY} x2={trunkX} y2={contactBottomY} stroke={strokeColor} strokeWidth={strokeWidth + 0.4} />
                {/* Standard IEC NC diagonal slash */}
                <line x1={trunkX - 5} y1={cy - 3} x2={trunkX + 5} y2={cy + 3} stroke={strokeColor} strokeWidth="1.6" />
              </g>
            )}

            {linkedTag && (
              <line x1={trunkX - 6} y1={cy} x2={trunkX - 15} y2={cy} stroke={defaultStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
            )}
          </g>
        );
      }

      // 5. Contactor Coil (ملف كونتاكتور A1-A2 - Compact IEC Box)
      case 'contactor_coil': {
        const coilW = 26;
        const coilH = 18;
        const rx = trunkX - coilW / 2;
        const ry = cy - coilH / 2;

        return (
          <g>
            {/* Terminal leads */}
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={ry} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={trunkX} y1={ry + coilH} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />

            {/* Energized Glow */}
            {isEnergized && (
              <rect
                x={rx - 3}
                y={ry - 3}
                width={coilW + 6}
                height={coilH + 6}
                rx="3"
                fill="rgba(245, 158, 11, 0.3)"
                className="animate-pulse"
              />
            )}

            {/* IEC Coil Rectangle */}
            <rect
              x={rx}
              y={ry}
              width={coilW}
              height={coilH}
              rx="2"
              fill={isEnergized ? 'rgba(245, 158, 11, 0.25)' : isLightTheme ? '#ffffff' : '#0f172a'}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Coil Internal Marking */}
            <line x1={rx} y1={ry + coilH} x2={rx + coilW} y2={ry} stroke={strokeColor} strokeWidth="1.2" strokeDasharray={isEnergized ? undefined : "2.5 1.5"} />
            <text
              x={trunkX}
              y={cy + 3}
              textAnchor="middle"
              fill={isEnergized ? '#fbbf24' : defaultStroke}
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {tag.slice(0, 4)}
            </text>
          </g>
        );
      }

      // 6. Timer Coil (ملف مؤقت زمني On-Delay)
      case 'timer_coil': {
        const coilW = 26;
        const coilH = 18;
        const rx = trunkX - coilW / 2;
        const ry = cy - coilH / 2;
        const remaining = Math.max(0, timerSeconds - timerElapsed);

        return (
          <g>
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={ry} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={trunkX} y1={ry + coilH} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />

            <rect
              x={rx}
              y={ry}
              width={coilW}
              height={coilH}
              rx="2"
              fill={isEnergized ? 'rgba(245, 158, 11, 0.25)' : isLightTheme ? '#ffffff' : '#0f172a'}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* On-Delay hatched section */}
            <rect
              x={rx}
              y={ry}
              width={coilW * 0.35}
              height={coilH}
              fill={isEnergized ? '#f59e0b' : defaultStroke}
              opacity={isEnergized ? 0.8 : 0.4}
            />
            <line x1={rx} y1={ry} x2={rx + coilW * 0.35} y2={ry + coilH} stroke="#ffffff" strokeWidth="1" />

            {/* Live countdown */}
            <g transform={`translate(${rx + coilW + 6}, ${cy - 7})`}>
              <rect x="0" y="0" width="38" height="14" rx="3" fill="#020617" stroke="#f59e0b" strokeWidth="1" />
              <text x="19" y="10" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                {isEnergized ? `${remaining.toFixed(1)}s` : `${timerSeconds}s`}
              </text>
            </g>
          </g>
        );
      }

      // 7. Timer Contacts (NO / NC)
      case 'timer_contact_no':
      case 'timer_contact_nc': {
        const isNC = type === 'timer_contact_nc';
        const isClosed = closed;
        const contactTopY = cy - 9;
        const contactBottomY = cy + 9;

        return (
          <g>
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={contactTopY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactTopY} r="2.5" fill={strokeColor} />

            <line x1={trunkX} y1={contactBottomY} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactBottomY} r="2.5" fill={strokeColor} />

            <line
              x1={trunkX}
              y1={contactBottomY}
              x2={isClosed ? trunkX : trunkX - 11}
              y2={isClosed ? contactTopY : cy - 3}
              stroke={strokeColor}
              strokeWidth={strokeWidth + 0.4}
              strokeLinecap="round"
            />

            {/* Parachute hook */}
            <path
              d={`M ${trunkX - 6} ${cy - 3} Q ${trunkX - 12} ${cy - 3} ${trunkX - 12} ${cy + 4}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.6"
            />

            {isNC && !isClosed && (
              <line x1={trunkX - 5} y1={cy - 3} x2={trunkX + 5} y2={cy + 3} stroke={strokeColor} strokeWidth="1.6" />
            )}
          </g>
        );
      }

      // 8. Thermal Overload Relay (F1 95-96 NC)
      case 'thermal_overload': {
        const isClosed = !isTripped && closed;
        const contactTopY = cy - 9;
        const contactBottomY = cy + 9;

        return (
          <g>
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={contactTopY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactTopY} r="2.5" fill={strokeColor} />

            <line x1={trunkX} y1={contactBottomY} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactBottomY} r="2.5" fill={strokeColor} />

            {isClosed ? (
              <g>
                <line x1={trunkX} y1={contactTopY} x2={trunkX} y2={contactBottomY} stroke={strokeColor} strokeWidth={strokeWidth + 0.4} />
                {/* Bimetal square wave symbol */}
                <path
                  d={`M ${trunkX} ${cy - 4} L ${trunkX + 6} ${cy - 4} L ${trunkX + 6} ${cy + 4} L ${trunkX} ${cy + 4}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="1.6"
                />
              </g>
            ) : (
              <g>
                <line x1={trunkX} y1={contactBottomY} x2={trunkX - 11} y2={cy - 4} stroke="#ef4444" strokeWidth={strokeWidth + 0.5} />
                <path
                  d={`M ${trunkX - 8} ${cy - 4} L ${trunkX - 2} ${cy - 4} L ${trunkX - 2} ${cy + 4} L ${trunkX - 8} ${cy + 4}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.6"
                />
              </g>
            )}
          </g>
        );
      }

      // 9. Pilot Lamp (مصباح بيان X1-X2)
      case 'pilot_lamp': {
        const lampRadius = 12;
        const lampActualColor = color === 'red' ? '#ef4444' : color === 'amber' ? '#f59e0b' : color === 'blue' ? '#38bdf8' : '#10b981';

        return (
          <g>
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={cy - lampRadius} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={trunkX} y1={cy + lampRadius} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />

            {isEnergized && (
              <circle
                cx={trunkX}
                cy={cy}
                r={lampRadius + 5}
                fill={lampActualColor}
                opacity="0.35"
                className="animate-pulse"
              />
            )}

            <circle
              cx={trunkX}
              cy={cy}
              r={lampRadius}
              fill={isEnergized ? lampActualColor : isLightTheme ? '#ffffff' : '#0f172a'}
              stroke={isEnergized ? lampActualColor : defaultStroke}
              strokeWidth={strokeWidth}
            />

            {/* IEC Lamp Cross (X) */}
            {(() => {
              const d = lampRadius * 0.707;
              return (
                <g stroke={isEnergized ? '#ffffff' : defaultStroke} strokeWidth="1.8" strokeLinecap="round">
                  <line x1={trunkX - d} y1={cy - d} x2={trunkX + d} y2={cy + d} />
                  <line x1={trunkX + d} y1={cy - d} x2={trunkX - d} y2={cy + d} />
                </g>
              );
            })()}
          </g>
        );
      }

      // 10. 3-Phase Induction Motor (محرك 3 أطوار M1 - Compact)
      case 'motor_3phase': {
        const motorRadius = 24;
        const isRunning = motorRunning || isEnergized;

        return (
          <g>
            {terminals.map((t) => (
              <line
                key={t.id}
                x1={t.x}
                y1={t.y}
                x2={t.x}
                y2={cy - motorRadius + 2}
                stroke={isRunning ? energizedStroke : defaultStroke}
                strokeWidth={strokeWidth}
              />
            ))}

            <circle
              cx={cx}
              cy={cy}
              r={motorRadius}
              fill={isRunning ? 'rgba(16, 185, 129, 0.15)' : isLightTheme ? '#ffffff' : '#0f172a'}
              stroke={isRunning ? '#10b981' : defaultStroke}
              strokeWidth={strokeWidth + 0.6}
            />

            {isRunning && (
              <g className="origin-center animate-spin" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: '2s' }}>
                <circle cx={cx} cy={cy} r={motorRadius - 6} fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="5 3" />
                <line x1={cx - motorRadius + 7} y1={cy} x2={cx + motorRadius - 7} y2={cy} stroke="#10b981" strokeWidth="1.5" />
                <line x1={cx} y1={cy - motorRadius + 7} x2={cx} y2={cy + motorRadius - 7} stroke="#10b981" strokeWidth="1.5" />
              </g>
            )}

            <text
              x={cx}
              y={cy + 3}
              textAnchor="middle"
              fill={isRunning ? '#10b981' : defaultStroke}
              fontSize="13"
              fontWeight="900"
            >
              M
            </text>
            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              fill={isRunning ? '#10b981' : defaultStroke}
              fontSize="8"
              fontWeight="bold"
            >
              3 ~
            </text>
          </g>
        );
      }

      // 11. Power Phase (L1)
      case 'power_phase': {
        return (
          <g>
            <line x1={trunkX - 18} y1={cy} x2={trunkX + 18} y2={cy} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={trunkX} cy={cy} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <text x={trunkX + 22} y={cy + 3} fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
              230V~
            </text>
          </g>
        );
      }

      // 12. Power Neutral (N)
      case 'power_neutral': {
        return (
          <g>
            <line x1={trunkX - 18} y1={cy} x2={trunkX + 18} y2={cy} stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={trunkX} cy={cy} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <text x={trunkX + 22} y={cy + 3} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
              N (0V)
            </text>
          </g>
        );
      }

      // 13. Circuit Breaker / MPCB
      default: {
        const contactTopY = cy - 9;
        const contactBottomY = cy + 9;

        return (
          <g>
            <line x1={termTop.x} y1={termTop.y} x2={trunkX} y2={contactTopY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactTopY} r="2.5" fill={strokeColor} />

            <line x1={trunkX} y1={contactBottomY} x2={termBottom.x} y2={termBottom.y} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={trunkX} cy={contactBottomY} r="2.5" fill={strokeColor} />

            <line
              x1={trunkX}
              y1={contactBottomY}
              x2={closed ? trunkX : trunkX - 11}
              y2={closed ? contactTopY : cy - 4}
              stroke={strokeColor}
              strokeWidth={strokeWidth + 0.4}
            />

            <line x1={trunkX - 7} y1={cy} x2={trunkX - 2} y2={cy - 5} stroke={strokeColor} strokeWidth="1.6" />
            <line x1={trunkX - 7} y1={cy - 5} x2={trunkX - 2} y2={cy} stroke={strokeColor} strokeWidth="1.6" />
          </g>
        );
      }
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: 'center center'
      }}
      className={`z-10 select-none touch-none transition-shadow ${
        mode === 'run'
          ? (type === 'pushbutton_no' || type === 'pushbutton_nc' || type === 'circuit_breaker' || type === 'thermal_overload'
              ? 'cursor-pointer hover:brightness-105'
              : 'cursor-default')
          : isDragging
          ? 'cursor-grabbing z-40 scale-[1.02]'
          : 'cursor-grab'
      }`}
      onPointerDown={(e) => {
        if (mode === 'run') {
          if (type === 'pushbutton_no' || type === 'pushbutton_nc') {
            e.stopPropagation();
            onButtonPress(id, true);
          }
          return;
        }
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('.no-drag')) return;
        onStartDrag(id, e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (mode === 'run') {
          if (type === 'pushbutton_no' || type === 'pushbutton_nc') {
            e.stopPropagation();
            onButtonPress(id, false);
          }
        }
      }}
      onPointerCancel={() => {
        if (mode === 'run' && isPressed) {
          onButtonPress(id, false);
        }
      }}
      onPointerLeave={() => {
        if (mode === 'run' && isPressed) {
          onButtonPress(id, false);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (mode === 'design') {
          onSelect(e);
        } else if (mode === 'run') {
          if (type === 'circuit_breaker') {
            onOverloadToggle(id);
          } else if (type === 'thermal_overload') {
            onOverloadToggle(id);
          }
        }
      }}
    >
      {/* Subtle CAD Selection Box in Design Mode */}
      {isSelected && mode === 'design' && (
        <div className="absolute -inset-1 border border-cyan-400/80 border-dashed rounded-lg pointer-events-none z-30 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
          <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
        </div>
      )}

      {/* Floating Quick Action Toolbar (Design Mode) */}
      {isSelected && mode === 'design' && (
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-2 py-0.5 rounded-xl border border-cyan-500/50 shadow-2xl z-50 no-drag whitespace-nowrap animate-in fade-in zoom-in-95"
          style={{ transform: rotation ? `rotate(-${rotation}deg)` : undefined }}
        >
          <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded text-[10px] font-mono font-bold">
            {tag}
          </span>

          {onRotate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRotate(id);
              }}
              className="p-1 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg transition cursor-pointer"
              title="تدوير 90° (R)"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(component);
              }}
              className="p-1 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-lg transition cursor-pointer"
              title="خصائص المكون"
            >
              <Settings2 className="w-3 h-3" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="p-1 hover:bg-red-950/80 text-red-400 hover:text-red-300 rounded-lg transition cursor-pointer"
              title="حذف المكون (Delete)"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* CAD Tag Label (Clean, Compact) */}
      <div 
        className="absolute top-0.5 left-1 pointer-events-none select-none z-20"
        style={{ transform: rotation ? `rotate(-${rotation}deg)` : undefined }}
      >
        <div className="flex items-center gap-1 font-mono font-bold leading-none">
          <span className={`text-[10px] ${
            isTripped
              ? 'text-red-400'
              : isEnergized
              ? 'text-amber-400'
              : isLightTheme
              ? 'text-slate-800'
              : 'text-slate-300'
          }`}>
            {tag.startsWith('-') ? tag : `-${tag}`}
          </span>
          {linkedTag && (
            <span className="text-[8px] text-cyan-400/90 font-mono">
              ({linkedTag})
            </span>
          )}
        </div>
      </div>

      {/* Main Representation: Realistic Component OR Schematic Symbol */}
      {renderStyle === 'realistic' ? (
        <RealisticIndustrialComponent
          component={component}
          isSelected={isSelected}
          gridTheme={gridTheme}
        />
      ) : (
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible pointer-events-none"
        >
          {/* Core IEC schematic symbol */}
          {renderSymbolCore()}

          {/* Standard Schematic Terminal Points with designation numbers */}
          {terminals.map((term) => {
            const isPending = pendingTerminalId === term.id;
            const isHovered = hoveredTerminal === term.id;

            const isTop = term.y <= height * 0.3;
            const isBottom = term.y >= height * 0.7;
            const textOffsetY = isTop ? 11 : isBottom ? -8 : -6;
            const textOffsetX = 9;

            return (
              <g key={term.id}>
                {/* Terminal Pin Circle */}
                <circle
                  cx={term.x}
                  cy={term.y}
                  r={isPending ? 4.5 : isHovered ? 3.5 : 2.5}
                  fill={isPending ? '#22d3ee' : isEnergized ? energizedStroke : isLightTheme ? '#ffffff' : '#0b0f19'}
                  stroke={isPending ? '#ffffff' : isEnergized ? energizedStroke : strokeColor}
                  strokeWidth={isPending ? 2 : 1.6}
                />

                {/* Terminal Designation Number */}
                <text
                  x={term.x + textOffsetX}
                  y={term.y + textOffsetY}
                  textAnchor="start"
                  fill={isLightTheme ? '#475569' : '#94a3b8'}
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                  className="select-none pointer-events-none"
                >
                  {term.name}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* 🟢 RUN MODE INTERACTIVE CONTROLS (Direct Operation in Simulation) */}
      {mode === 'run' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none no-drag">
          {/* Pushbutton NO: Press and hold / Tap to pulse */}
          {type === 'pushbutton_no' && (
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                onButtonPress(id, true);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch {}
                onButtonPress(id, false);
              }}
              onPointerCancel={() => {
                onButtonPress(id, false);
              }}
              className={`pointer-events-auto px-2.5 py-1 rounded-full text-[9px] font-bold shadow-lg transition-transform cursor-pointer flex items-center gap-1 select-none ${
                isPressed
                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-white scale-95 shadow-emerald-500/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
              title="اضغط مع الاستمرار لتوصيل الدائرة (Start NO 3-4)"
            >
              <Power className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>{isPressed ? 'مغلق (مضغوط)' : 'تشغيل (NO)'}</span>
            </button>
          )}

          {/* Pushbutton NC: Press and hold / Tap to break */}
          {type === 'pushbutton_nc' && (
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                onButtonPress(id, true);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch {}
                onButtonPress(id, false);
              }}
              onPointerCancel={() => {
                onButtonPress(id, false);
              }}
              className={`pointer-events-auto px-2.5 py-1 rounded-full text-[9px] font-bold shadow-lg transition-transform cursor-pointer flex items-center gap-1 select-none ${
                isPressed
                  ? 'bg-red-400 text-slate-950 ring-2 ring-white scale-95 shadow-red-500/50'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
              }`}
              title="اضغط مع الاستمرار لفصل الدائرة (Stop NC 1-2)"
            >
              <Power className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>{isPressed ? 'مفصول (مضغوط)' : 'إيقاف (NC)'}</span>
            </button>
          )}

          {/* Circuit Breaker MCB: Toggle Lever ON / OFF */}
          {type === 'circuit_breaker' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOverloadToggle(id);
              }}
              className={`pointer-events-auto px-2 py-0.5 rounded-full text-[9px] font-bold shadow-lg transition-transform cursor-pointer flex items-center gap-1 active:scale-95 ${
                closed && !isTripped
                  ? 'bg-sky-600 hover:bg-sky-500 text-white ring-2 ring-sky-300'
                  : 'bg-red-600 hover:bg-red-500 text-white animate-pulse ring-2 ring-red-400'
              }`}
              title="انقر لتشغيل أو فصل القاطع الآلي (ON/OFF)"
            >
              <Power className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>{closed && !isTripped ? 'قاطع: تشغيل (ON)' : 'قاطع: مفصول (OFF)'}</span>
            </button>
          )}

          {/* Thermal Overload: Click to test trip/reset */}
          {type === 'thermal_overload' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOverloadToggle(id);
              }}
              className={`pointer-events-auto px-1.5 py-0.5 rounded text-[8px] font-bold shadow-md cursor-pointer transition ${
                isTripped
                  ? 'bg-red-600 text-white ring-2 ring-red-400 animate-bounce'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="انقر لاختبار الفصل الحراري (Trip/Reset)"
            >
              {isTripped ? 'إعادة ضبط RST' : 'فصل TRIP'}
            </button>
          )}

          {/* Motor Running Status Badge */}
          {type === 'motor_3phase' && (
            <div className={`pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap shadow-md ${
              motorRunning || isEnergized
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {motorRunning || isEnergized ? '1450 RPM ⟳ دوران' : 'متوقف'}
            </div>
          )}
        </div>
      )}

      {/* 🛠️ DESIGN MODE INTERACTIVE TERMINAL CLICK TARGETS */}
      {mode === 'design' && (
        <div className="absolute inset-0 pointer-events-none no-drag">
          {terminals.map((term) => {
            const isPending = pendingTerminalId === term.id;
            return (
              <button
                key={`btn_${term.id}`}
                style={{
                  position: 'absolute',
                  left: `${term.x - 12}px`,
                  top: `${term.y - 12}px`,
                  width: '24px',
                  height: '24px'
                }}
                onMouseEnter={() => setHoveredTerminal(term.id)}
                onMouseLeave={() => setHoveredTerminal(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onTerminalClick(term.id, term.name, e);
                }}
                className={`pointer-events-auto rounded-full flex items-center justify-center transition-all cursor-crosshair ${
                  isPending
                    ? 'ring-4 ring-cyan-400 bg-cyan-400/40 scale-125 animate-pulse'
                    : 'hover:ring-2 hover:ring-amber-400 hover:bg-amber-400/20'
                }`}
                title={`مربط ${term.name} - انقر لتوصيل سلك`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
