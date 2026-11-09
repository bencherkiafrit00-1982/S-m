import React from 'react';

interface RealisticThumbnailProps {
  tag: string;
  category: string;
  symbolType?: string;
  width?: number;
  height?: number;
}

export const RealisticThumbnail: React.FC<RealisticThumbnailProps> = ({
  tag,
  category,
  symbolType,
  width = 36,
  height = 36
}) => {
  const upperTag = tag.toUpperCase();

  // 1. MCB / Circuit Breaker (QF, Q1, C16)
  if (category === 'قواطع وحماية' && !upperTag.startsWith('F')) {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <defs>
          <linearGradient id="mcbThumbBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
        {/* DIN rail back strip */}
        <rect x="2" y="14" width="36" height="12" rx="1.5" fill="#94a3b8" opacity="0.4" />
        {/* Breaker body */}
        <rect x="7" y="3" width="26" height="34" rx="3" fill="url(#mcbThumbBody)" stroke="#64748b" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))" />
        {/* Top/bottom screw recesses */}
        <circle cx="20" cy="6" r="2.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="18.5" y1="6" x2="21.5" y2="6" stroke="#e2e8f0" strokeWidth="0.6" />
        <circle cx="20" cy="34" r="2.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="18.5" y1="34" x2="21.5" y2="34" stroke="#e2e8f0" strokeWidth="0.6" />
        {/* Faceplate */}
        <rect x="10" y="9" width="20" height="22" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        {/* Blue Lever */}
        <rect x="14" y="12" width="12" height="9" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
        <line x1="16" y1="15" x2="24" y2="15" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
        <line x1="16" y1="18" x2="24" y2="18" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
        {/* Indicator window */}
        <rect x="12" y="24" width="5" height="4" rx="0.5" fill="#10b981" />
        <text x="23" y="27" textAnchor="middle" fill="#0f172a" fontSize="4.5" fontWeight="900" fontFamily="monospace">C16</text>
      </svg>
    );
  }

  // 2. Thermal Overload Relay (F1, FR, 95-96)
  if (category === 'قواطع وحماية' && upperTag.startsWith('F')) {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <defs>
          <linearGradient id="ovldThumbBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b4252" />
            <stop offset="100%" stopColor="#1e222a" />
          </linearGradient>
        </defs>
        <rect x="5" y="4" width="30" height="32" rx="3.5" fill="url(#ovldThumbBody)" stroke="#475569" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
        {/* Rotary dial */}
        <circle cx="15" cy="18" r="6.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.8" />
        <line x1="15" y1="18" x2="19" y2="15" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
        {/* Blue reset & Red test buttons */}
        <rect x="23" y="12" width="8" height="5" rx="1.2" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
        <rect x="23" y="20" width="8" height="5" rx="1.2" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.5" />
        {/* Optical trip flag */}
        <circle cx="15" cy="30" r="2" fill="#10b981" stroke="#0f172a" strokeWidth="0.5" />
        {/* Top/bottom terminal screws */}
        <circle cx="20" cy="6" r="1.8" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        <circle cx="20" cy="34" r="1.8" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
      </svg>
    );
  }

  // 3. Start Button (Green Pushbutton NO / Start)
  const isStartButton = 
    symbolType === 'pushbutton_no' || 
    (category === 'مفاتيح وأزرار' && (upperTag.includes('START') || upperTag.includes('NO') || upperTag === 'SB2' || upperTag === 'S1' || upperTag === 'S2'));

  if (isStartButton) {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <defs>
          <radialGradient id="greenThumbCap" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>
        </defs>
        {/* Base */}
        <rect x="4" y="8" width="32" height="24" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        {/* Chrome collar */}
        <circle cx="20" cy="20" r="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
        <circle cx="20" cy="20" r="10" fill="#090d16" />
        {/* Green cap */}
        <circle cx="20" cy="20" r="8.5" fill="url(#greenThumbCap)" stroke="#34d399" strokeWidth="1" />
        <text x="20" y="23" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900">I</text>
      </svg>
    );
  }

  // 4. Stop Button (Red Pushbutton NC / Stop / E-Stop)
  if (category === 'مفاتيح وأزرار' || symbolType === 'pushbutton_nc' || symbolType === 'emergency_stop') {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <defs>
          <radialGradient id="redThumbCap" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
        </defs>
        <rect x="4" y="8" width="32" height="24" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <circle cx="20" cy="20" r="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
        <circle cx="20" cy="20" r="10" fill="#090d16" />
        <circle cx="20" cy="20" r="8.5" fill="url(#redThumbCap)" stroke="#f87171" strokeWidth="1" />
        <text x="20" y="23" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900">O</text>
      </svg>
    );
  }

  // 5. Contactor (KM, LC1D)
  if (category === 'كونتاكتورات ومرحلات' && !upperTag.startsWith('KT')) {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <defs>
          <linearGradient id="kmThumbBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="32" height="32" rx="3.5" fill="url(#kmThumbBody)" stroke="#475569" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
        {/* Top header plate */}
        <rect x="7" y="6" width="26" height="5" rx="1" fill="#020617" />
        {/* Central armature window */}
        <rect x="13" y="14" width="14" height="12" rx="2" fill="#020617" stroke="#334155" strokeWidth="0.8" />
        {/* Orange plunger */}
        <rect x="15" y="16" width="10" height="8" rx="1.5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="0.6" />
        <line x1="17" y1="20" x2="23" y2="20" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
        {/* Screw terminals */}
        <circle cx="8" cy="6" r="1.5" fill="#cbd5e1" />
        <circle cx="20" cy="6" r="1.5" fill="#cbd5e1" />
        <circle cx="32" cy="6" r="1.5" fill="#cbd5e1" />
        <circle cx="8" cy="34" r="1.5" fill="#cbd5e1" />
        <circle cx="20" cy="34" r="1.5" fill="#cbd5e1" />
        <circle cx="32" cy="34" r="1.5" fill="#cbd5e1" />
      </svg>
    );
  }

  // 6. Timer Relay (KT, H3CR)
  if (category === 'كونتاكتورات ومرحلات' && upperTag.startsWith('KT')) {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <defs>
          <linearGradient id="ktThumbBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect x="5" y="4" width="30" height="32" rx="3.5" fill="url(#ktThumbBody)" stroke="#475569" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
        {/* Yellow trim */}
        <rect x="6" y="5" width="2" height="30" rx="1" fill="#f59e0b" />
        {/* Rotary dial */}
        <circle cx="16" cy="20" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
        <line x1="16" y1="20" x2="20" y2="17" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
        {/* Digital display */}
        <rect x="24" y="11" width="8" height="6" rx="1" fill="#020617" stroke="#334155" strokeWidth="0.6" />
        <text x="28" y="15.5" textAnchor="middle" fill="#38bdf8" fontSize="4" fontWeight="bold">3s</text>
        {/* LEDs */}
        <circle cx="26" cy="22" r="1.5" fill="#10b981" />
        <circle cx="26" cy="27" r="1.5" fill="#f59e0b" />
      </svg>
    );
  }

  // 7. Auxiliary Contact (13-14, 21-22)
  if (category === 'ملامسات وأطراف') {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <rect x="6" y="5" width="28" height="30" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
        <rect x="12" y="12" width="16" height="16" rx="2" fill="#090d16" stroke="#475569" strokeWidth="0.8" />
        <line x1="15" y1="23" x2="22" y2="16" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="7" r="1.8" fill="#cbd5e1" />
        <circle cx="20" cy="33" r="1.8" fill="#cbd5e1" />
      </svg>
    );
  }

  // 8. 3-Phase Induction Motor (M1, Pump, Fan)
  if (category === 'أحمال ومحركات') {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <defs>
          <linearGradient id="motorThumbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#155e75" />
          </linearGradient>
        </defs>
        {/* Top terminal box */}
        <rect x="12" y="3" width="16" height="6" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
        {/* Stator body with cooling fins */}
        <rect x="7" y="8" width="24" height="24" rx="3" fill="url(#motorThumbGrad)" stroke="#164e63" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))" />
        <line x1="9" y1="13" x2="29" y2="13" stroke="#083344" strokeWidth="1" />
        <line x1="9" y1="17" x2="29" y2="17" stroke="#083344" strokeWidth="1" />
        <line x1="9" y1="21" x2="29" y2="21" stroke="#083344" strokeWidth="1" />
        <line x1="9" y1="25" x2="29" y2="25" stroke="#083344" strokeWidth="1" />
        {/* Rear fan cowl */}
        <rect x="3" y="11" width="5" height="18" rx="1.5" fill="#1e293b" />
        {/* Shaft */}
        <rect x="30" y="17" width="7" height="6" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
        {/* Center label */}
        <circle cx="19" cy="20" r="5" fill="#020617" />
        <text x="19" y="22.5" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900">M</text>
      </svg>
    );
  }

  // 9. Pilot Lamp (H1, HL)
  if (category === 'إشارات وبيان') {
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <rect x="6" y="8" width="28" height="24" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <circle cx="20" cy="20" r="11" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
        <circle cx="20" cy="20" r="8" fill="#10b981" stroke="#34d399" strokeWidth="1.2" filter="drop-shadow(0 0 3px rgba(16,185,129,0.5))" />
        <circle cx="20" cy="20" r="4" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.8" />
      </svg>
    );
  }

  // 10. Power Supply / DIN Terminal Block (L1, N)
  if (category === 'تغذية ومحولات') {
    const isNeutral = upperTag.includes('N');
    return (
      <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
        <rect x="2" y="14" width="36" height="12" rx="1.5" fill="#94a3b8" opacity="0.4" />
        <rect x="8" y="7" width="24" height="26" rx="3" fill={isNeutral ? '#0284c7' : '#d97706'} stroke={isNeutral ? '#38bdf8' : '#fbbf24'} strokeWidth="1.2" />
        <circle cx="20" cy="20" r="4.5" fill="#cbd5e1" stroke="#334155" strokeWidth="0.8" />
        <line x1="17" y1="20" x2="23" y2="20" stroke="#1e293b" strokeWidth="1" />
        <line x1="20" y1="17" x2="20" y2="23" stroke="#1e293b" strokeWidth="1" />
      </svg>
    );
  }

  // Default Fallback
  return (
    <svg width={width} height={height} viewBox="0 0 40 40" className="overflow-visible select-none pointer-events-none">
      <rect x="6" y="6" width="28" height="28" rx="3.5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="20" y="24" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="900" fontFamily="monospace">
        {tag.slice(0, 3)}
      </text>
    </svg>
  );
};
