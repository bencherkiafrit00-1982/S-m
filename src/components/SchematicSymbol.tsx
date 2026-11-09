import React from 'react';

interface SchematicSymbolProps {
  symbolType: string;
  className?: string;
  width?: number;
  height?: number;
  isEnergized?: boolean;
  closed?: boolean;
  color?: string;
}

export const SchematicSymbol: React.FC<SchematicSymbolProps> = ({
  symbolType,
  className = '',
  width = 50,
  height = 50,
  isEnergized = false,
  closed = false,
  color = '#94a3b8'
}) => {
  const strokeColor = isEnergized ? '#f59e0b' : color;
  const fillColor = isEnergized ? 'rgba(245, 158, 11, 0.15)' : 'none';

  switch (symbolType) {
    // 1. Pushbutton NO (زر تشغيل مفتوح عادة - IEC)
    case 'pushbutton_no': {
      const isClosed = !!closed;
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="18" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="32" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="18" r="2.5" fill={strokeColor} />
          <circle cx="25" cy="32" r="2.5" fill={strokeColor} />
          {/* Moving contact blade: open at rest (15,20), closed when pressed (25,18) */}
          <line 
            x1="25" 
            y1="32" 
            x2={isClosed ? "25" : "15"} 
            y2={isClosed ? "18" : "20"} 
            stroke={isClosed ? '#10b981' : strokeColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Actuator T-stem */}
          <line 
            x1={isClosed ? "25" : "16"} 
            y1="25" 
            x2={isClosed ? "15" : "8"} 
            y2="25" 
            stroke={strokeColor} 
            strokeWidth="2" 
            strokeDasharray="2 1.5" 
          />
          <line 
            x1={isClosed ? "15" : "8"} 
            y1="19" 
            x2={isClosed ? "15" : "8"} 
            y2="31" 
            stroke={isClosed ? '#10b981' : strokeColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
        </svg>
      );
    }

    // 2. Pushbutton NC (زر إيقاف مغلق عادة - IEC)
    case 'pushbutton_nc':
    case 'emergency_stop': {
      const isNcClosed = closed !== false;
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          {/* Fixed terminals */}
          <line x1="25" y1="5" x2="25" y2="18" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="32" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="18" r="2.5" fill={strokeColor} />
          <circle cx="25" cy="32" r="2.5" fill={strokeColor} />
          
          {/* Contact bridge: closed at rest bridging (25,18)-(25,32), pulled away to x=16 when pressed/open */}
          {isNcClosed ? (
            <line 
              x1="25" 
              y1="18" 
              x2="25" 
              y2="32" 
              stroke={isEnergized ? '#f59e0b' : strokeColor} 
              strokeWidth="2.5" 
            />
          ) : (
            // Open air gap showing disconnected circuit
            <line 
              x1="15" 
              y1="18" 
              x2="15" 
              y2="32" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          )}

          {/* Actuator stem mechanically connected to the contact bar */}
          <line 
            x1={isNcClosed ? "25" : "15"} 
            y1="25" 
            x2={isNcClosed ? "10" : "6"} 
            y2="25" 
            stroke={isNcClosed ? strokeColor : '#ef4444'} 
            strokeWidth="2" 
            strokeDasharray="2 1.5" 
          />
          {symbolType === 'emergency_stop' ? (
            // Mushroom head
            <path 
              d={isNcClosed ? "M 10 18 Q 4 25 10 32 Z" : "M 6 18 Q 0 25 6 32 Z"} 
              fill="#ef4444" 
              stroke="#b91c1c" 
              strokeWidth="1.5" 
            />
          ) : (
            // Standard flush pushbutton head
            <line 
              x1={isNcClosed ? "10" : "6"} 
              y1="19" 
              x2={isNcClosed ? "10" : "6"} 
              y2="31" 
              stroke={isNcClosed ? '#dc2626' : '#ef4444'} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
          )}
        </svg>
      );
    }

    // 3. Contact NO (ملامس مفتوح عادة)
    case 'contact_no':
    case 'contactor_contact_no':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="17" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="33" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="17" r="2.5" fill={strokeColor} />
          <circle cx="25" cy="33" r="2.5" fill={strokeColor} />
          <line 
            x1="25" 
            y1="33" 
            x2={closed ? "25" : "15"} 
            y2={closed ? "17" : "19"} 
            stroke={closed ? '#10b981' : strokeColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
        </svg>
      );

    // 4. Contact NC (ملامس مغلق عادة)
    case 'contact_nc':
    case 'contactor_contact_nc': {
      const isNcClosed = closed !== false;
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="17" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="33" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="17" r="2.5" fill={strokeColor} />
          <circle cx="25" cy="33" r="2.5" fill={strokeColor} />
          {isNcClosed ? (
            <>
              <line x1="25" y1="17" x2="25" y2="33" stroke={strokeColor} strokeWidth="2.5" />
              <line x1="20" y1="22" x2="30" y2="28" stroke={strokeColor} strokeWidth="2" />
            </>
          ) : (
            <>
              {/* Displaced open blade */}
              <line x1="25" y1="33" x2="16" y2="19" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="23" x2="20" y2="29" stroke="#ef4444" strokeWidth="2" />
            </>
          )}
        </svg>
      );
    }

    // 5. Contactor Coil (ملف كونتاكتور - IEC)
    case 'contactor_coil':
    case 'relay_coil':
    case 'safety_relay':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="15" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="35" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <rect x="13" y="15" width="24" height="20" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
          <line x1="13" y1="35" x2="37" y2="15" stroke={strokeColor} strokeWidth="1.5" strokeDasharray={isEnergized ? undefined : "3 2"} />
          <text x="25" y="29" textAnchor="middle" fill={strokeColor} fontSize="10" fontWeight="bold" fontFamily="monospace">KM</text>
        </svg>
      );

    // 6. Timer Relay & Contacts (مؤقت زمني On-Delay)
    case 'timer_coil':
    case 'timer_relay':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="15" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="35" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <rect x="13" y="15" width="24" height="20" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
          {/* On-Delay hatched flag */}
          <rect x="13" y="15" width="8" height="20" fill={strokeColor} opacity="0.6" />
          <line x1="13" y1="15" x2="21" y2="35" stroke="#ffffff" strokeWidth="1" />
          <text x="29" y="29" textAnchor="middle" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">KT</text>
        </svg>
      );

    case 'timer_contact_no':
    case 'timer_contact_nc':
      const isNC = symbolType === 'timer_contact_nc';
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="17" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="33" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="17" r="2.5" fill={strokeColor} />
          <circle cx="25" cy="33" r="2.5" fill={strokeColor} />
          <line x1="25" y1="33" x2={closed ? "25" : "15"} y2={closed ? "17" : "19"} stroke={strokeColor} strokeWidth="2.5" />
          {/* Parachute hook */}
          <path d="M 18 22 Q 12 22 12 28" fill="none" stroke={strokeColor} strokeWidth="2" />
          {isNC && <line x1="20" y1="23" x2="30" y2="27" stroke={strokeColor} strokeWidth="2" />}
        </svg>
      );

    // 7. Thermal relay (المرحل الحراري)
    case 'thermal_relay':
    case 'thermal_overload':
    case 'thermal_contact_nc':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="16" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="34" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="16" r="2.5" fill={strokeColor} />
          <circle cx="25" cy="34" r="2.5" fill={strokeColor} />
          {/* Thermal hook / square wave */}
          <line x1="25" y1="16" x2="25" y2="34" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 25 21 L 31 21 L 31 29 L 25 29" fill="none" stroke={strokeColor} strokeWidth="2" />
        </svg>
      );

    // 8. 3-Phase Motor
    case 'motor':
    case 'motor_3phase':
    case 'pump':
    case 'fan':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <circle cx="25" cy="25" r="18" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
          <text x="25" y="27" textAnchor="middle" dominantBaseline="middle" fill={strokeColor} fontSize="14" fontWeight="bold">
            {symbolType === 'pump' ? 'P' : symbolType === 'fan' ? 'V' : 'M'}
          </text>
          <text x="25" y="38" textAnchor="middle" fill={strokeColor} fontSize="8">
            3~
          </text>
        </svg>
      );

    // 9. Pilot Lamps
    case 'pilot_lamp':
    case 'lamp_green':
    case 'lamp_red':
    case 'lamp_yellow':
    case 'lamp_white':
      const lampColor = symbolType === 'lamp_red' ? '#ef4444' : symbolType === 'lamp_yellow' ? '#f59e0b' : symbolType === 'lamp_white' ? '#38bdf8' : '#10b981';
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="11" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="39" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="25" r="14" fill={isEnergized ? lampColor : fillColor} stroke={isEnergized ? lampColor : strokeColor} strokeWidth="2.5" />
          {/* Cross inside lamp */}
          <line x1="16" y1="16" x2="34" y2="34" stroke={isEnergized ? '#ffffff' : strokeColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="16" x2="16" y2="34" stroke={isEnergized ? '#ffffff' : strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // 10. Circuit breaker
    case 'circuit_breaker':
    case 'main_breaker':
    case 'mpcb':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="16" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="25" y1="34" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="25" cy="16" r="2.5" fill={strokeColor} />
          <circle cx="25" cy="34" r="2.5" fill={strokeColor} />
          <line x1="25" y1="34" x2={closed ? "25" : "15"} y2={closed ? "16" : "19"} stroke={strokeColor} strokeWidth="2.5" />
          {/* Automatic breaker cross */}
          <line x1="13" y1="23" x2="19" y2="29" stroke={strokeColor} strokeWidth="2" />
          <line x1="19" y1="23" x2="13" y2="29" stroke={strokeColor} strokeWidth="2" />
        </svg>
      );

    // 11. Fuse
    case 'fuse':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="5" x2="25" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <rect x="17" y="14" width="16" height="22" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
        </svg>
      );

    // 12. Power rails
    case 'power_phase':
    case 'phase_rail':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="8" y1="25" x2="42" y2="25" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="25" cy="25" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <text x="25" y="42" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">L1</text>
        </svg>
      );

    case 'power_neutral':
    case 'neutral_rail':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="8" y1="25" x2="42" y2="25" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="25" cy="25" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <text x="25" y="42" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">N</text>
        </svg>
      );

    // 13. Earth Ground
    case 'earth_ground':
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <line x1="25" y1="10" x2="25" y2="25" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="12" y1="25" x2="38" y2="25" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="17" y1="31" x2="33" y2="31" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="37" x2="28" y2="37" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 50 50" width={width} height={height} className={className}>
          <rect x="10" y="10" width="30" height="30" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
          <line x1="10" y1="20" x2="40" y2="20" stroke={strokeColor} strokeWidth="1" />
          <text x="25" y="33" textAnchor="middle" fill={strokeColor} fontSize="10" fontWeight="bold" fontFamily="monospace">
            {symbolType.toUpperCase().slice(0, 4)}
          </text>
        </svg>
      );
  }
};
