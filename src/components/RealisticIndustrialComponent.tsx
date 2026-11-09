import React from 'react';
import { CircuitComponent, Terminal } from '../types/circuit';

interface RealisticIndustrialComponentProps {
  component: CircuitComponent;
  isSelected: boolean;
  gridTheme?: 'dark' | 'blueprint' | 'white';
}

export const RealisticIndustrialComponent: React.FC<RealisticIndustrialComponentProps> = ({
  component,
  isSelected,
  gridTheme = 'dark'
}) => {
  const {
    tag,
    name,
    type,
    width,
    height,
    terminals,
    isEnergized = false,
    isPressed = false,
    isTripped = false,
    closed = false,
    motorRunning = false,
    color,
    linkedTag,
    timerSeconds = 3,
    timerElapsed = 0
  } = component;

  const cx = width / 2;
  const cy = height / 2;
  const termTop = terminals[0] || { id: '1', name: '1', x: cx, y: 0 };
  const termBottom = terminals[1] || { id: '2', name: '2', x: cx, y: height };

  // Helper for rendering high-fidelity recessed industrial screw terminal
  // Positioned directly at the terminal coordinates so wires connect directly to the screw center
  const renderScrewTerminal = (
    x: number,
    y: number,
    label: string,
    isLive: boolean,
    labelPosition: 'top' | 'bottom' | 'left' | 'right' = y < cy ? 'top' : 'bottom'
  ) => {
    let labelX = x;
    let labelY = y;
    let textAnchor: 'middle' | 'start' | 'end' = 'middle';

    if (labelPosition === 'top') {
      labelY = y - 9;
    } else if (labelPosition === 'bottom') {
      labelY = y + 14;
    } else if (labelPosition === 'left') {
      labelX = x - 11;
      labelY = y + 3;
      textAnchor = 'end';
    } else if (labelPosition === 'right') {
      labelX = x + 11;
      labelY = y + 3;
      textAnchor = 'start';
    }

    return (
      <g transform={`translate(${x}, ${y})`} className="pointer-events-none select-none">
        {/* Recessed well / lug collar */}
        <circle cx="0" cy="0" r="8" fill="#090d16" stroke="#334155" strokeWidth="1.2" />
        {/* Outer terminal clamp washer / bushing */}
        <circle
          cx="0"
          cy="0"
          r="6.2"
          fill={isLive ? '#f59e0b' : '#64748b'}
          stroke={isLive ? '#fbbf24' : '#475569'}
          strokeWidth="0.8"
          opacity="0.95"
        />
        {/* Nickel / Zinc screw head with bevel */}
        <circle
          cx="0"
          cy="0"
          r="4.8"
          fill={isLive ? 'url(#liveScrewGrad)' : 'url(#metalScrewGrad)'}
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))"
        />
        {/* Slotted & Phillips cross-cut groove */}
        <line x1="-3.2" y1="0" x2="3.2" y2="0" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="0" y1="-3.2" x2="0" y2="3.2" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" />
        {/* Specular highlight */}
        <circle cx="-1.5" cy="-1.5" r="1" fill="#ffffff" opacity="0.6" />

        {/* Crisp terminal number badge */}
        <text
          x={labelX - x}
          y={labelY - y}
          textAnchor={textAnchor}
          fill={isLive ? '#fbbf24' : '#cbd5e1'}
          fontSize="8"
          fontWeight="800"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      </g>
    );
  };

  // Shared SVG Gradients and Filters
  const renderSharedDefs = () => (
    <defs>
      {/* Screw Heads */}
      <linearGradient id="metalScrewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="45%" stopColor="#cbd5e1" />
        <stop offset="85%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="liveScrewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#f59e0b" />
        <stop offset="85%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>

      {/* Chrome Bezels & Collars */}
      <linearGradient id="chromeBezel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="75%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      {/* Industrial DIN Rail Metal Track */}
      <linearGradient id="dinRailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="30%" stopColor="#cbd5e1" />
        <stop offset="70%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* 3D Drop Shadows */}
      <filter id="realisticShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.55" />
      </filter>
      <filter id="recessedShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.7" />
      </filter>
    </defs>
  );

  switch (type) {
    // =========================================================================
    // 1. القاطع الكهربائي MCB (Miniature Circuit Breaker)
    // =========================================================================
    case 'circuit_breaker': {
      const isBreakerOn = closed && !isTripped;
      const bW = 80;
      const bH = 68;
      const rx = cx - bW / 2;
      const ry = cy - bH / 2;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="mcbBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="40%" stopColor="#e2e8f0" />
              <stop offset="85%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="leverBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Background DIN Rail Section behind breaker */}
          <rect x={rx - 4} y={cy - 16} width={bW + 8} height="32" fill="url(#dinRailGrad)" stroke="#475569" strokeWidth="0.8" rx="2" opacity="0.6" />
          <line x1={rx - 4} y1={cy - 12} x2={rx + bW + 4} y2={cy - 12} stroke="#334155" strokeWidth="0.8" opacity="0.5" />
          <line x1={rx - 4} y1={cy + 12} x2={rx + bW + 4} y2={cy + 12} stroke="#334155" strokeWidth="0.8" opacity="0.5" />

          {/* Internal Wire Leads to Terminals */}
          <line x1={termTop.x} y1={termTop.y} x2={termTop.x} y2={ry} stroke="#475569" strokeWidth="2.5" />
          <line x1={termBottom.x} y1={ry + bH} x2={termBottom.x} y2={termBottom.y} stroke="#475569" strokeWidth="2.5" />

          {/* Main MCB Enclosure Housing (RAL 7035 Light Grey) */}
          <rect
            x={rx}
            y={ry}
            width={bW}
            height={bH}
            rx="5"
            fill="url(#mcbBodyGrad)"
            stroke={isBreakerOn ? '#38bdf8' : '#64748b'}
            strokeWidth="1.5"
            filter="url(#realisticShadow)"
          />

          {/* DIN Rail Top/Bottom Mounting Tabs */}
          <rect x={cx - 10} y={ry - 2} width="20" height="4" rx="1" fill="#475569" />
          <rect x={cx - 10} y={ry + bH - 2} width="20" height="4" rx="1" fill="#475569" />

          {/* Stepped Front Operating Faceplate */}
          <rect x={rx + 8} y={ry + 8} width={bW - 16} height={bH - 16} rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />

          {/* Brand & Technical Rating Markings */}
          <text x={rx + 12} y={ry + 17} fill="#0f172a" fontSize="7" fontWeight="900" fontFamily="sans-serif">
            ABB
          </text>
          <text x={rx + 12} y={ry + 24} fill="#0284c7" fontSize="7.5" fontWeight="900" fontFamily="JetBrains Mono, monospace">
            C16
          </text>
          <text x={rx + 12} y={ry + 30} fill="#64748b" fontSize="5.5" fontWeight="bold">
            230V~ [6000]
          </text>

          {/* Central Toggle Lever Recess */}
          <rect x={cx - 1} y={cy - 18} width="28" height="36" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />

          {/* Trip Optical Indicator Window (Green = I / Red = 0) */}
          <rect x={cx + 1} y={cy - 16} width="10" height="6" rx="1" fill="#020617" />
          <rect
            x={cx + 2}
            y={cy - 15}
            width="8"
            height="4"
            rx="0.5"
            fill={isBreakerOn ? '#10b981' : '#ef4444'}
          />
          <text x={cx + 6} y={cy - 12} textAnchor="middle" fill="#ffffff" fontSize="4" fontWeight="bold">
            {isBreakerOn ? 'I' : '0'}
          </text>

          {/* Interactive Industrial Toggle Lever (ذراع القاطع) */}
          <g transform={`translate(${cx + 12}, ${cy})`}>
            {/* Lever Pivot Shadow */}
            <rect
              x="-8"
              y={isBreakerOn ? -14 : 2}
              width="18"
              height="14"
              rx="3"
              fill="url(#leverBlueGrad)"
              stroke="#0f172a"
              strokeWidth="1.2"
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))"
              className="transition-all duration-150"
            />
            {/* Lever Ribbed Grips */}
            <line x1="-5" y1={isBreakerOn ? -10 : 6} x2="7" y2={isBreakerOn ? -10 : 6} stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            <line x1="-5" y1={isBreakerOn ? -7 : 9} x2="7" y2={isBreakerOn ? -7 : 9} stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            <line x1="-5" y1={isBreakerOn ? -4 : 12} x2="7" y2={isBreakerOn ? -4 : 12} stroke="#ffffff" strokeWidth="1" opacity="0.6" />
          </g>

          {/* Single-Line Breaker Schematic Symbol on Housing */}
          <g transform={`translate(${rx + bW - 16}, ${cy + 10})`} stroke="#64748b" strokeWidth="0.8">
            <line x1="0" y1="-8" x2="0" y2="8" />
            <line x1="-3" y1="-2" x2="3" y2="2" />
            <line x1="-3" y1="2" x2="3" y2="-2" />
          </g>

          {/* Component Tag & State */}
          <text x={cx} y={ry + bH - 3} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold" fontFamily="monospace">
            {tag} • {isBreakerOn ? 'ON (1)' : 'OFF (0)'}
          </text>

          {/* Top & Bottom Screw Terminals (1 & 2) */}
          {renderScrewTerminal(termTop.x, termTop.y, termTop.name || '1', isEnergized && isBreakerOn)}
          {renderScrewTerminal(termBottom.x, termBottom.y, termBottom.name || '2', isEnergized && isBreakerOn)}
        </svg>
      );
    }

    // =========================================================================
    // 2. الكونتاكتور الكهروميكانيكي Contactor (Schneider TeSys LC1D)
    // =========================================================================
    case 'contactor_coil': {
      const cW = 90;
      const cH = 64;
      const rx = cx - cW / 2;
      const ry = cy - cH / 2;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="contactorHousing" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="25%" stopColor="#1e293b" />
              <stop offset="85%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="plungerActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="plungerIdle" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* DIN Rail Background */}
          <rect x={rx - 4} y={cy - 16} width={cW + 8} height="32" fill="url(#dinRailGrad)" stroke="#475569" strokeWidth="0.8" rx="2" opacity="0.6" />

          {/* Terminal Leads to Screw Centers */}
          <line x1={termTop.x} y1={termTop.y} x2={termTop.x} y2={ry} stroke="#64748b" strokeWidth="2.5" />
          <line x1={termBottom.x} y1={ry + cH} x2={termBottom.x} y2={termBottom.y} stroke="#64748b" strokeWidth="2.5" />

          {/* Main Heavy Polycarbonate Contactor Enclosure */}
          <rect
            x={rx}
            y={ry}
            width={cW}
            height={cH}
            rx="6"
            fill="url(#contactorHousing)"
            stroke={isEnergized ? '#f59e0b' : '#475569'}
            strokeWidth={isEnergized ? '2' : '1.5'}
            filter="url(#realisticShadow)"
          />

          {/* Side Ventilation Ribs */}
          {[-18, -9, 0, 9, 18].map((off) => (
            <g key={off}>
              <line x1={rx + 3} y1={cy + off} x2={rx + 9} y2={cy + off} stroke="#020617" strokeWidth="1.8" />
              <line x1={rx + cW - 9} y1={cy + off} x2={rx + cW - 3} y2={cy + off} stroke="#020617" strokeWidth="1.8" />
            </g>
          ))}

          {/* Top Brand / Model Identification Header Bar */}
          <rect x={rx + 10} y={ry + 4} width={cW - 20} height="10" rx="2" fill="#020617" stroke="#1e293b" strokeWidth="0.8" />
          <text x={cx} y={ry + 11.5} textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontWeight="900" fontFamily="monospace">
            Schneider TeSys LC1D
          </text>

          {/* Middle Terminal Markings Row */}
          <g fill="#94a3b8" fontSize="6" fontWeight="bold" fontFamily="monospace">
            <text x={rx + 15} y={ry + 20}>1/L1</text>
            <text x={rx + 30} y={ry + 20}>3/L2</text>
            <text x={rx + 60} y={ry + 20}>5/L3</text>
            <text x={rx + 75} y={ry + 20}>13 NO</text>
          </g>

          {/* Central Mechanical Armature / Magnetic Core Window (المكبس والقلب المتحرك) */}
          <rect x={cx - 16} y={cy - 12} width="32" height="24" rx="3" fill="#020617" stroke="#334155" strokeWidth="1.2" />

          {/* Magnetic Plunger (Moves downward when coil A1-A2 is energized) */}
          <rect
            x={cx - 13}
            y={isEnergized ? cy - 5 : cy - 9}
            width="26"
            height="16"
            rx="2.5"
            fill={isEnergized ? 'url(#plungerActive)' : 'url(#plungerIdle)'}
            stroke={isEnergized ? '#fbbf24' : '#64748b'}
            strokeWidth="1.2"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))"
            className="transition-all duration-100"
          />

          {/* Mechanical Motion Cross-Bar & Indication */}
          <line
            x1={cx - 9}
            y1={isEnergized ? cy + 2 : cy - 2}
            x2={cx + 9}
            y2={isEnergized ? cy + 2 : cy - 2}
            stroke={isEnergized ? '#ffffff' : '#cbd5e1'}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <text
            x={cx}
            y={isEnergized ? cy + 6 : cy + 4}
            textAnchor="middle"
            fill={isEnergized ? '#020617' : '#94a3b8'}
            fontSize="5.5"
            fontWeight="900"
          >
            {isEnergized ? 'PULL' : 'TEST'}
          </text>

          {/* Status Optical LED (Green = Pulled In) */}
          <circle
            cx={rx + cW - 10}
            cy={ry + 9}
            r="3"
            fill={isEnergized ? '#10b981' : '#1e293b'}
            stroke={isEnergized ? '#34d399' : '#475569'}
            strokeWidth="1"
          />

          {/* Bottom Terminal Row Markings */}
          <g fill="#94a3b8" fontSize="6" fontWeight="bold" fontFamily="monospace">
            <text x={rx + 15} y={ry + cH - 11}>2/T1</text>
            <text x={rx + 30} y={ry + cH - 11}>4/T2</text>
            <text x={rx + 60} y={ry + cH - 11}>6/T3</text>
            <text x={rx + 75} y={ry + cH - 11}>14 NO</text>
          </g>

          {/* Tag & Voltage Spec */}
          <text x={cx} y={ry + cH - 3} textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
            {tag} • 230V~ Coil
          </text>

          {/* Coil Terminals: A1 (top) and A2 (bottom) */}
          {renderScrewTerminal(termTop.x, termTop.y, 'A1', isEnergized)}
          {renderScrewTerminal(termBottom.x, termBottom.y, 'A2', isEnergized)}
        </svg>
      );
    }

    // =========================================================================
    // 3. الملامسات المساعدة للكونتاكتور Auxiliary Contacts (13-14 NO & 21-22 NC)
    // =========================================================================
    case 'contactor_contact_no':
    case 'contactor_contact_nc': {
      const isNC = type === 'contactor_contact_nc';
      const isContactClosed = closed;
      const bW = 82;
      const bH = 58;
      const rx = cx - bW / 2;
      const ry = cy - bH / 2;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="auxBlockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* Connecting Leads */}
          <line x1={termTop.x} y1={termTop.y} x2={termTop.x} y2={ry} stroke="#64748b" strokeWidth="2.5" />
          <line x1={termBottom.x} y1={ry + bH} x2={termBottom.x} y2={termBottom.y} stroke="#64748b" strokeWidth="2.5" />

          {/* Auxiliary Clip-on Block Body */}
          <rect
            x={rx}
            y={ry}
            width={bW}
            height={bH}
            rx="5"
            fill="url(#auxBlockGrad)"
            stroke={isContactClosed ? '#f59e0b' : '#334155'}
            strokeWidth="1.5"
            filter="url(#realisticShadow)"
          />

          {/* Snap-on Latches on top & bottom */}
          <rect x={rx + 6} y={ry + 2} width="14" height="4" rx="1" fill="#020617" />
          <rect x={rx + bW - 20} y={ry + 2} width="14" height="4" rx="1" fill="#020617" />

          {/* Central Transparent Inspection Window */}
          <rect x={cx - 16} y={cy - 14} width="32" height="28" rx="3" fill="#090d16" stroke="#475569" strokeWidth="1" />

          {/* Stationary Silver Contacts inside window */}
          <circle cx={cx - 9} cy={cy - 6} r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
          <circle cx={cx + 9} cy={cy - 6} r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
          <circle cx={cx - 9} cy={cy + 6} r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
          <circle cx={cx + 9} cy={cy + 6} r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />

          {/* Moving Mechanical Bridging Blade (Opens / Closes dynamically) */}
          <line
            x1={cx - 9}
            y1={cy}
            x2={isContactClosed ? cx + 9 : cx + 2}
            y2={isContactClosed ? cy : cy - 8}
            stroke={isContactClosed ? '#fbbf24' : '#ef4444'}
            strokeWidth="3.2"
            strokeLinecap="round"
            className="transition-all duration-150"
          />

          {/* Specification Text */}
          <text x={cx} y={ry + bH - 4} textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
            {tag} ({isNC ? '21-22 NC' : '13-14 NO'})
          </text>

          {/* Terminals (13-14 or 21-22) */}
          {renderScrewTerminal(termTop.x, termTop.y, termTop.name || (isNC ? '21' : '13'), isContactClosed)}
          {renderScrewTerminal(termBottom.x, termBottom.y, termBottom.name || (isNC ? '22' : '14'), isContactClosed)}
        </svg>
      );
    }

    // =========================================================================
    // 4. الريليه الزمني Timer Relay (On-Delay Industrial Timer)
    // =========================================================================
    case 'timer_coil': {
      const timW = 88;
      const timH = 68;
      const rx = cx - timW / 2;
      const ry = cy - timH / 2;
      const remaining = Math.max(0, timerSeconds - timerElapsed);
      const isUp = remaining === 0 && isEnergized;

      // Pointer angle for rotary potentiometer dial (0 to 270 degrees)
      const dialAngle = ((timerSeconds % 30) / 30) * 270 - 135;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="timerHousing" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="35%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <radialGradient id="timerDialGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="85%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>

          {/* DIN Rail Section */}
          <rect x={rx - 4} y={cy - 16} width={timW + 8} height="32" fill="url(#dinRailGrad)" stroke="#475569" strokeWidth="0.8" rx="2" opacity="0.6" />

          {/* Leads */}
          <line x1={termTop.x} y1={termTop.y} x2={termTop.x} y2={ry} stroke="#64748b" strokeWidth="2.5" />
          <line x1={termBottom.x} y1={ry + timH} x2={termBottom.x} y2={termBottom.y} stroke="#64748b" strokeWidth="2.5" />

          {/* Main Housing */}
          <rect
            x={rx}
            y={ry}
            width={timW}
            height={timH}
            rx="6"
            fill="url(#timerHousing)"
            stroke={isEnergized ? '#f59e0b' : '#475569'}
            strokeWidth={isEnergized ? '2' : '1.5'}
            filter="url(#realisticShadow)"
          />

          {/* Yellow Industrial Accent Trim on left */}
          <rect x={rx + 2} y={ry + 3} width="3.5" height={timH - 6} rx="1.5" fill="#f59e0b" />

          {/* Brand & Range header */}
          <text x={rx + 10} y={ry + 9} fill="#38bdf8" fontSize="6.5" fontWeight="900" fontFamily="monospace">
            OMRON H3CR
          </text>
          <text x={rx + timW - 10} y={ry + 9} textAnchor="end" fill="#94a3b8" fontSize="5.5" fontWeight="bold">
            ON-DELAY
          </text>

          {/* Circular Analogue Time Adjustment Dial (قرص ضبط الثواني الدائري) */}
          <g transform={`translate(${cx - 18}, ${cy + 4})`}>
            {/* Outer Dial Calibrated Ring */}
            <circle cx="0" cy="0" r="14" fill="url(#timerDialGrad)" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="11" fill="#0f172a" />

            {/* Calibration Tick Marks (0s to 30s) */}
            {[-135, -90, -45, 0, 45, 90, 135].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 11 * Math.cos(rad);
              const y1 = 11 * Math.sin(rad);
              const x2 = 14 * Math.cos(rad);
              const y2 = 14 * Math.sin(rad);
              return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1" />;
            })}

            {/* Red / Yellow Tactile Adjustment Knob Pointer */}
            <g transform={`rotate(${dialAngle})`}>
              <circle cx="0" cy="0" r="4" fill="#f59e0b" stroke="#020617" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="-10" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="0,-12 -2,-8 2,-8" fill="#fbbf24" />
            </g>

            <text x="0" y="19" textAnchor="middle" fill="#fbbf24" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
              {timerSeconds}s
            </text>
          </g>

          {/* Live Digital Countdown Display Box (شاشة الثواني المتبقية) */}
          <g transform={`translate(${cx + 8}, ${cy - 16})`}>
            <rect x="0" y="0" width="30" height="15" rx="3" fill="#020617" stroke="#334155" strokeWidth="1" />
            <text x="15" y="11" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="900" fontFamily="JetBrains Mono, monospace">
              {isEnergized ? `${remaining.toFixed(1)}s` : `${timerSeconds}.0s`}
            </text>
          </g>

          {/* Status Optical LEDs (PWR & UP/OUT) */}
          <g transform={`translate(${cx + 9}, ${cy + 4})`}>
            {/* PWR LED (Green) */}
            <circle cx="4" cy="4" r="3" fill={isEnergized ? '#10b981' : '#1e293b'} stroke={isEnergized ? '#34d399' : '#475569'} strokeWidth="1" />
            <text x="11" y="6.5" fill="#cbd5e1" fontSize="6" fontWeight="bold">PWR</text>

            {/* UP / OUT LED (Amber) */}
            <circle cx="4" cy="14" r="3" fill={isUp ? '#f59e0b' : '#1e293b'} stroke={isUp ? '#fbbf24' : '#475569'} strokeWidth="1" />
            <text x="11" y="16.5" fill="#cbd5e1" fontSize="6" fontWeight="bold">OUT</text>
          </g>

          {/* Model & Coil Spec */}
          <text x={cx} y={ry + timH - 3} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="monospace">
            {tag} • 24-240V AC/DC
          </text>

          {/* Terminals (A1 & A2) */}
          {renderScrewTerminal(termTop.x, termTop.y, 'A1', isEnergized)}
          {renderScrewTerminal(termBottom.x, termBottom.y, 'A2', isEnergized)}
        </svg>
      );
    }

    // =========================================================================
    // 5. زر التشغيل الأخضر Start Push Button (NO 3-4)
    // =========================================================================
    case 'pushbutton_no': {
      const isDown = !!isPressed;
      const isClosed = isPressed || !!closed;
      const radius = 22;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <radialGradient id="greenCapGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="45%" stopColor="#10b981" />
              <stop offset="85%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
            <radialGradient id="greenCapDepressed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="70%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
          </defs>

          {/* Enclosure Base Plate */}
          <rect
            x={cx - 52}
            y={cy - 26}
            width="104"
            height="52"
            rx="8"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
            filter="url(#realisticShadow)"
          />
          {/* Inner Recessed Face */}
          <rect x={cx - 48} y={cy - 22} width="96" height="44" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

          {/* Internal Leads to Terminals with dynamic electrical glow */}
          <line 
            x1={termTop.x} 
            y1={termTop.y} 
            x2={cx} 
            y2={cy - radius} 
            stroke={isEnergized ? '#f59e0b' : '#475569'} 
            strokeWidth="2.5" 
          />
          <line 
            x1={cx} 
            y1={cy + radius} 
            x2={termBottom.x} 
            y2={termBottom.y} 
            stroke={isEnergized && isClosed ? '#f59e0b' : '#475569'} 
            strokeWidth="2.5" 
          />

          {/* Internal Miniature NO Contact Block Preview (Left side of button) */}
          <g transform={`translate(${cx - 36}, ${cy - 12})`} opacity="0.9">
            {/* Contact housing badge */}
            <rect x="-1" y="-1" width="12" height="26" rx="2" fill="#064e3b" stroke="#047857" strokeWidth="0.8" />
            {/* Fixed contact rivets */}
            <circle cx="5" cy="4" r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="5" cy="20" r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            {/* Moving contact blade: open at rest, connects rivets when pressed */}
            <line
              x1="5"
              y1="20"
              x2={isClosed ? "5" : "1"}
              y2={isClosed ? "4" : "9"}
              stroke={isClosed ? '#34d399' : '#cbd5e1'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* Panel Mount Chrome Knurled Bezel Collar (22mm) */}
          <circle cx={cx} cy={cy} r={radius + 4} fill="url(#chromeBezel)" stroke="#1e293b" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={radius + 1} fill="#090d16" stroke="#047857" strokeWidth="1" />

          {/* Green Actuator Cap (Depresses visually inward on press) */}
          <circle
            cx={cx}
            cy={cy + (isDown ? 2.5 : 0)}
            r={isDown ? radius - 3.5 : radius - 2.5}
            fill={isDown ? 'url(#greenCapDepressed)' : 'url(#greenCapGrad)'}
            stroke={isDown ? '#a7f3d0' : '#34d399'}
            strokeWidth={isDown ? '2.5' : '1.5'}
            filter={isDown ? 'url(#recessedShadow)' : 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))'}
            className="transition-all duration-75"
          />

          {/* Highlight crescent on top rim in resting position */}
          {!isDown && (
            <ellipse cx={cx} cy={cy - 10} rx="11" ry="3.5" fill="#ffffff" opacity="0.4" />
          )}

          {/* Pushbutton Engraved Legend (START / I) */}
          <text
            x={cx}
            y={cy + (isDown ? 5.5 : 4)}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            letterSpacing="1"
            className="select-none"
          >
            {isDown ? 'I' : 'START'}
          </text>

          {/* Contact Block Specification Label */}
          <text x={cx - 36} y={cy + 18} fill={isClosed ? '#34d399' : '#10b981'} fontSize="6.5" fontWeight="bold">
            {isClosed ? 'NO مغلق' : 'NO مفتوح'}
          </text>
          <text x={cx + 38} y={cy + 3} textAnchor="end" fill="#cbd5e1" fontSize="7" fontWeight="bold" fontFamily="monospace">
            {tag}
          </text>

          {/* Terminals: NO (3 & 4) */}
          {renderScrewTerminal(termTop.x, termTop.y, termTop.name || '3', isEnergized)}
          {renderScrewTerminal(termBottom.x, termBottom.y, termBottom.name || '4', isEnergized && isClosed)}
        </svg>
      );
    }

    // =========================================================================
    // 6. زر الإيقاف الأحمر Stop Push Button (NC 1-2)
    // =========================================================================
    case 'pushbutton_nc': {
      const isDown = !!isPressed;
      const isNcClosed = component.closed !== undefined ? component.closed : !isPressed;
      const isConductive = isNcClosed && !isPressed;
      const radius = 22;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <radialGradient id="redCapGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="45%" stopColor="#dc2626" />
              <stop offset="85%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>
            <radialGradient id="redCapDepressed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="70%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>
          </defs>

          {/* Enclosure Base Plate */}
          <rect
            x={cx - 52}
            y={cy - 26}
            width="104"
            height="52"
            rx="8"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
            filter="url(#realisticShadow)"
          />
          <rect x={cx - 48} y={cy - 22} width="96" height="44" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

          {/* Internal Leads to Terminals with dynamic electrical glow */}
          <line 
            x1={termTop.x} 
            y1={termTop.y} 
            x2={cx} 
            y2={cy - radius} 
            stroke={isEnergized ? '#f59e0b' : '#475569'} 
            strokeWidth="2.5" 
          />
          <line 
            x1={cx} 
            y1={cy + radius} 
            x2={termBottom.x} 
            y2={termBottom.y} 
            stroke={isEnergized && isConductive ? '#f59e0b' : '#475569'} 
            strokeWidth="2.5" 
          />

          {/* Internal Miniature NC Contact Block Preview (Left side of button) */}
          <g transform={`translate(${cx - 36}, ${cy - 12})`} opacity="0.9">
            {/* Contact housing badge */}
            <rect x="-1" y="-1" width="12" height="26" rx="2" fill="#7f1d1d" stroke="#b91c1c" strokeWidth="0.8" />
            {/* Fixed contact rivets */}
            <circle cx="5" cy="4" r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="5" cy="20" r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            {/* Moving bridge: connects rivets at rest, pulled away to x=1 when pressed */}
            {isConductive ? (
              <line
                x1="5"
                y1="4"
                x2="5"
                y2="20"
                stroke={isEnergized ? '#f59e0b' : '#34d399'}
                strokeWidth="1.6"
              />
            ) : (
              // Open gap when pressed
              <line
                x1="1"
                y1="6"
                x2="1"
                y2="18"
                stroke="#ef4444"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* Chrome Bezel Collar (22mm) */}
          <circle cx={cx} cy={cy} r={radius + 4} fill="url(#chromeBezel)" stroke="#1e293b" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={radius + 1} fill="#090d16" stroke="#b91c1c" strokeWidth="1" />

          {/* Red Flush / Mushroom Cap (Depresses visually on press) */}
          <circle
            cx={cx}
            cy={cy + (isDown ? 2.5 : 0)}
            r={isDown ? radius - 3.5 : radius - 2.5}
            fill={isDown ? 'url(#redCapDepressed)' : 'url(#redCapGrad)'}
            stroke={isDown ? '#fecaca' : '#ef4444'}
            strokeWidth={isDown ? '2.5' : '1.5'}
            filter={isDown ? 'url(#recessedShadow)' : 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))'}
            className="transition-all duration-75"
          />

          {/* Highlight crescent on top rim in resting position */}
          {!isDown && (
            <ellipse cx={cx} cy={cy - 10} rx="11" ry="3.5" fill="#ffffff" opacity="0.35" />
          )}

          {/* Legend (STOP / O) */}
          <text
            x={cx}
            y={cy + (isDown ? 5.5 : 4)}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            letterSpacing="1"
            className="select-none"
          >
            {isDown ? 'O' : 'STOP'}
          </text>

          {/* Status Label */}
          <text x={cx - 36} y={cy + 18} fill={isConductive ? '#34d399' : '#ef4444'} fontSize="6.5" fontWeight="bold">
            {isConductive ? 'NC متصل' : 'NC مفصول'}
          </text>
          <text x={cx + 38} y={cy + 3} textAnchor="end" fill="#cbd5e1" fontSize="7" fontWeight="bold" fontFamily="monospace">
            {tag}
          </text>

          {/* Terminals: NC (1 & 2) */}
          {renderScrewTerminal(termTop.x, termTop.y, termTop.name || '1', isEnergized)}
          {renderScrewTerminal(termBottom.x, termBottom.y, termBottom.name || '2', isEnergized && isConductive)}
        </svg>
      );
    }

    // =========================================================================
    // 7. الريليه الحراري Thermal Overload Relay (LRD / F1)
    // =========================================================================
    case 'thermal_overload': {
      const tW = 88;
      const tH = 64;
      const rx = cx - tW / 2;
      const ry = cy - tH / 2;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="overloadHousing" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b4252" />
              <stop offset="35%" stopColor="#2e3440" />
              <stop offset="100%" stopColor="#1e222a" />
            </linearGradient>
            <radialGradient id="amperageDial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>
          </defs>

          {/* Connection Leads */}
          <line x1={termTop.x} y1={termTop.y} x2={termTop.x} y2={ry} stroke="#64748b" strokeWidth="2.5" />
          <line x1={termBottom.x} y1={ry + tH} x2={termBottom.x} y2={termBottom.y} stroke="#64748b" strokeWidth="2.5" />

          {/* Overload Body Housing */}
          <rect
            x={rx}
            y={ry}
            width={tW}
            height={tH}
            rx="6"
            fill="url(#overloadHousing)"
            stroke={isTripped ? '#ef4444' : '#475569'}
            strokeWidth={isTripped ? '2' : '1.5'}
            filter="url(#realisticShadow)"
          />

          {/* Header Markings */}
          <text x={rx + 10} y={ry + 9} fill="#38bdf8" fontSize="6.5" fontWeight="900" fontFamily="monospace">
            TeSys LRD-10
          </text>
          <text x={rx + tW - 10} y={ry + 9} textAnchor="end" fill="#94a3b8" fontSize="6" fontWeight="bold">
            CLASS 10A
          </text>

          {/* Rotary Amperage Adjustment Dial (قرص معايرة الأمبير) */}
          <g transform={`translate(${cx - 18}, ${cy + 3})`}>
            <circle cx="0" cy="0" r="13" fill="url(#amperageDial)" stroke="#1e293b" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="10" fill="#0f172a" />

            {/* Calibration Ticks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={idx}
                  x1={8 * Math.cos(rad)}
                  y1={8 * Math.sin(rad)}
                  x2={11 * Math.cos(rad)}
                  y2={11 * Math.sin(rad)}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Red Pointer Arrow */}
            <polygon points="0,-10 -3,-5 3,-5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="900">
              5.5A
            </text>
            <text x="0" y="18" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontWeight="bold">
              4-6.3A
            </text>
          </g>

          {/* Blue RESET Button (Hand / Auto) */}
          <g transform={`translate(${cx + 8}, ${cy - 12})`}>
            <rect x="0" y="0" width="18" height="11" rx="2.5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))" />
            <text x="9" y="8" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="900">
              RESET
            </text>
          </g>

          {/* Red TEST / STOP Button */}
          <g transform={`translate(${cx + 8}, ${cy + 3})`}>
            <rect x="0" y="0" width="18" height="11" rx="2.5" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))" />
            <text x="9" y="8" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="900">
              TEST
            </text>
          </g>

          {/* Optical Trip Flag Indicator Window (يتحول للأحمر عند الفصل) */}
          <g transform={`translate(${rx + tW - 14}, ${cy - 5})`}>
            <rect x="0" y="0" width="8" height="10" rx="1.5" fill="#020617" stroke="#475569" strokeWidth="0.8" />
            <rect
              x="1.5"
              y="1.5"
              width="5"
              height="7"
              rx="1"
              fill={isTripped ? '#ef4444' : '#10b981'}
              className={isTripped ? 'animate-pulse' : ''}
            />
          </g>

          {/* Tag & Function */}
          <text x={cx} y={ry + tH - 3} textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="bold" fontFamily="monospace">
            {tag} • 95-96 NC {isTripped ? '(TRIPPED!)' : '(READY)'}
          </text>

          {/* Terminals: 95 & 96 NC */}
          {renderScrewTerminal(termTop.x, termTop.y, '95', isEnergized && !isTripped)}
          {renderScrewTerminal(termBottom.x, termBottom.y, '96', isEnergized && !isTripped)}
        </svg>
      );
    }

    // =========================================================================
    // 8. المحرك الكهربائي ثلاثي الأطوار 3-Phase Induction Motor (M1)
    // =========================================================================
    case 'motor_3phase': {
      const isRunning = motorRunning || isEnergized;
      const mW = 120;
      const mH = 70;
      const rx = cx - mW / 2;
      const ry = cy - mH / 2;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="statorBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="25%" stopColor="#0e7490" />
              <stop offset="70%" stopColor="#155e75" />
              <stop offset="100%" stopColor="#164e63" />
            </linearGradient>
            <linearGradient id="motorShaft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Heavy Cast-Iron Mounting Feet with Anchor Bolt Holes */}
          <rect x={rx + 16} y={ry + mH - 4} width="18" height="8" rx="2" fill="#0e7490" stroke="#164e63" strokeWidth="1" />
          <circle cx={rx + 25} cy={ry + mH} r="2" fill="#020617" />
          <rect x={rx + mW - 34} y={ry + mH - 4} width="18" height="8" rx="2" fill="#0e7490" stroke="#164e63" strokeWidth="1" />
          <circle cx={rx + mW - 25} cy={ry + mH} r="2" fill="#020617" />

          {/* Terminal Box at the top (صندوق روزيتة التوصيل) */}
          <rect
            x={cx - 36}
            y={ry - 10}
            width="72"
            height="18"
            rx="3.5"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1.2"
            filter="url(#recessedShadow)"
          />
          <text x={cx} y={ry + 2} textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="900" fontFamily="JetBrains Mono, monospace">
            U1 • V1 • W1
          </text>

          {/* Stator Main Cylindrical Body */}
          <rect
            x={rx + 18}
            y={ry + 6}
            width={mW - 42}
            height={mH - 12}
            rx="6"
            fill="url(#statorBlueGrad)"
            stroke={isRunning ? '#10b981' : '#155e75'}
            strokeWidth={isRunning ? '2' : '1.5'}
            filter="url(#realisticShadow)"
          />

          {/* Cooling Fins (زعانف التبريد الأفقية المصبوبة) */}
          {[12, 18, 24, 30, 36, 42, 48].map((finY, idx) => (
            <line
              key={idx}
              x1={rx + 19}
              y1={ry + finY}
              x2={rx + mW - 25}
              y2={ry + finY}
              stroke="#083344"
              strokeWidth="1.6"
            />
          ))}

          {/* Rear Fan Cowl Housing (غطاء مروحة التبريد الخلفي) */}
          <rect x={rx + 4} y={ry + 9} width="15" height={mH - 18} rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {[14, 20, 26, 32, 38, 44].map((ventY, idx) => (
            <line key={`v_${idx}`} x1={rx + 6} y1={ry + ventY} x2={rx + 16} y2={ry + ventY} stroke="#0f172a" strokeWidth="1.4" />
          ))}

          {/* Front Bearing Hub & Steel Output Drive Shaft (عمود الدوران مع الخابور) */}
          <rect x={rx + mW - 24} y={ry + 15} width="14" height={mH - 30} rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect
            x={rx + mW - 10}
            y={cy - 6}
            width="22"
            height="12"
            rx="1.5"
            fill="url(#motorShaft)"
            stroke="#475569"
            strokeWidth="1"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))"
          />

          {/* Dynamic Rotating Keyway & Shaft Rotation Effect */}
          {isRunning ? (
            <g className="origin-center animate-spin" style={{ transformOrigin: `${rx + mW + 1}px ${cy}px`, animationDuration: '0.6s' }}>
              <line x1={rx + mW - 6} y1={cy - 5} x2={rx + mW + 8} y2={cy - 5} stroke="#0f172a" strokeWidth="2" />
              <line x1={rx + mW - 6} y1={cy + 5} x2={rx + mW + 8} y2={cy + 5} stroke="#0f172a" strokeWidth="2" />
              <circle cx={rx + mW + 1} cy={cy} r="3" fill="#10b981" opacity="0.6" />
            </g>
          ) : (
            <line x1={rx + mW - 6} y1={cy - 2} x2={rx + mW + 8} y2={cy - 2} stroke="#334155" strokeWidth="1.8" />
          )}

          {/* Rating Nameplate */}
          <rect x={cx - 24} y={cy - 10} width="48" height="20" rx="2" fill="#020617" stroke="#0e7490" strokeWidth="1" />
          <text x={cx} y={cy - 2} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
            3~ INDUCTION
          </text>
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fill={isRunning ? '#34d399' : '#94a3b8'}
            fontSize="6.5"
            fontWeight="900"
            fontFamily="monospace"
          >
            {isRunning ? '1450 RPM ⟳' : '0 RPM (OFF)'}
          </text>

          {/* Terminals in Top Connection Box (U, V, W) */}
          {terminals.map((t, idx) => (
            <g key={t.id}>
              {renderScrewTerminal(t.x, t.y, t.name || (idx === 0 ? 'U1' : idx === 1 ? 'V1' : 'W1'), isRunning)}
            </g>
          ))}
        </svg>
      );
    }

    // =========================================================================
    // 9. مصباح البيان Pilot Indicator Lamp (H1)
    // =========================================================================
    case 'pilot_lamp': {
      const lampColorHex = color === 'red' ? '#ef4444' : color === 'amber' ? '#f59e0b' : color === 'blue' ? '#38bdf8' : '#10b981';
      const lampGlowHex = color === 'red' ? 'rgba(239, 68, 68, 0.45)' : color === 'amber' ? 'rgba(245, 158, 11, 0.45)' : color === 'blue' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(16, 185, 129, 0.45)';
      const radius = 20;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <radialGradient id={`lampLens_${color || 'green'}`} cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={isEnergized ? "0.95" : "0.35"} />
              <stop offset="40%" stopColor={lampColorHex} stopOpacity={isEnergized ? "0.95" : "0.7"} />
              <stop offset="85%" stopColor={lampColorHex} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>

          {/* Terminal Leads */}
          <line x1={termTop.x} y1={termTop.y} x2={cx} y2={cy - radius} stroke="#64748b" strokeWidth="2.5" />
          <line x1={cx} y1={cy + radius} x2={termBottom.x} y2={termBottom.y} stroke="#64748b" strokeWidth="2.5" />

          {/* Enclosure Base */}
          <rect x={cx - 38} y={cy - 24} width="76" height="48" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.2" filter="url(#realisticShadow)" />

          {/* Active Radial Glow when energized */}
          {isEnergized && (
            <circle cx={cx} cy={cy} r={radius + 14} fill={lampGlowHex} className="animate-pulse" />
          )}

          {/* Chrome Knurled Locking Bezel */}
          <circle cx={cx} cy={cy} r={radius + 4} fill="url(#chromeBezel)" stroke="#1e293b" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={radius + 1} fill="#090d16" stroke="#334155" strokeWidth="0.8" />

          {/* Prismatic Fresnel Lens Dome */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill={`url(#lampLens_${color || 'green'})`}
            stroke={isEnergized ? '#ffffff' : '#334155'}
            strokeWidth={isEnergized ? '2' : '1'}
          />

          {/* Diamond Cut Refraction Facets */}
          <circle cx={cx} cy={cy} r={radius * 0.65} fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 3" opacity={isEnergized ? 0.75 : 0.25} />
          <circle cx={cx} cy={cy} r={radius * 0.35} fill="none" stroke="#ffffff" strokeWidth="1" opacity={isEnergized ? 0.9 : 0.3} />

          {/* Tag & Rating */}
          <text x={cx} y={cy + 30} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontWeight="bold">
            {tag} • 22mm LED
          </text>

          {/* Terminals (X1 & X2) */}
          {renderScrewTerminal(termTop.x, termTop.y, 'X1', isEnergized)}
          {renderScrewTerminal(termBottom.x, termBottom.y, 'X2', isEnergized)}
        </svg>
      );
    }

    // =========================================================================
    // 10. مربط التغذية طور Phase L1 (DIN Terminal Block)
    // =========================================================================
    case 'power_phase': {
      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="phaseBlockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="40%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* DIN Rail Section */}
          <rect x={cx - 36} y={cy - 16} width="72" height="32" fill="url(#dinRailGrad)" stroke="#475569" strokeWidth="0.8" rx="2" opacity="0.6" />

          {/* Industrial Terminal Block */}
          <rect
            x={cx - 32}
            y={cy - 16}
            width="64"
            height="32"
            rx="4"
            fill="url(#phaseBlockGrad)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            filter="url(#realisticShadow)"
          />

          {/* Wire Funnel & Danger Symbol */}
          <rect x={cx - 26} y={cy - 12} width="52" height="10" rx="2" fill="#020617" />
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="900" fontFamily="JetBrains Mono, monospace">
            ⚡ L1 • 230V~
          </text>

          {/* Screw Terminal */}
          {renderScrewTerminal(termTop.x, termTop.y, 'L1', true, 'right')}
        </svg>
      );
    }

    // =========================================================================
    // 11. مربط التغذية محايد Neutral N (Blue DIN Terminal Block)
    // =========================================================================
    case 'power_neutral': {
      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <defs>
            <linearGradient id="neutralBlockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="40%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
          </defs>

          <rect x={cx - 36} y={cy - 16} width="72" height="32" fill="url(#dinRailGrad)" stroke="#475569" strokeWidth="0.8" rx="2" opacity="0.6" />

          <rect
            x={cx - 32}
            y={cy - 16}
            width="64"
            height="32"
            rx="4"
            fill="url(#neutralBlockGrad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            filter="url(#realisticShadow)"
          />

          <rect x={cx - 26} y={cy - 12} width="52" height="10" rx="2" fill="#020617" />
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="900" fontFamily="JetBrains Mono, monospace">
            N • 0V (Neutral)
          </text>

          {renderScrewTerminal(termTop.x, termTop.y, 'N', false, 'right')}
        </svg>
      );
    }

    // Default Fallback
    default: {
      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">
          {renderSharedDefs()}
          <line x1={termTop.x} y1={termTop.y} x2={cx} y2={cy - 20} stroke="#64748b" strokeWidth="2.5" />
          <line x1={cx} y1={cy + 20} x2={termBottom.x} y2={termBottom.y} stroke="#64748b" strokeWidth="2.5" />

          <rect x={cx - 38} y={cy - 22} width="76" height="44" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" filter="url(#realisticShadow)" />
          <text x={cx} y={cy + 3} textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="bold">
            {tag} ({name})
          </text>

          {renderScrewTerminal(termTop.x, termTop.y, termTop.name || '1', isEnergized)}
          {renderScrewTerminal(termBottom.x, termBottom.y, termBottom.name || '2', isEnergized)}
        </svg>
      );
    }
  }
};
