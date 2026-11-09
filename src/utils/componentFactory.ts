import { CircuitComponent, ComponentType } from '../types/circuit';

let compCounter = 1;

export function createNewComponent(
  type: ComponentType,
  x: number = 200,
  y: number = 200,
  customTag?: string
): CircuitComponent {
  const uniqueId = `comp_${Date.now()}_${compCounter++}`;

  switch (type) {
    case 'power_phase':
      return {
        id: uniqueId,
        name: 'مصدر الطور (L1)',
        tag: customTag || 'L1',
        type: 'power_phase',
        x,
        y,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      };

    case 'power_neutral':
      return {
        id: uniqueId,
        name: 'المحايد (N)',
        tag: customTag || 'N',
        type: 'power_neutral',
        x,
        y,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      };

    case 'circuit_breaker':
      return {
        id: uniqueId,
        name: 'قاطع آلي (MCB C16)',
        tag: customTag || `Q${compCounter}`,
        type: 'circuit_breaker',
        x,
        y,
        width: 140,
        height: 80,
        closed: true,
        isTripped: false,
        terminals: [
          { id: '1', name: '1', x: 70, y: 0 },
          { id: '2', name: '2', x: 70, y: 80 }
        ]
      };

    case 'pushbutton_no':
      return {
        id: uniqueId,
        name: 'زر تشغيل (NO)',
        tag: customTag || `S${compCounter}`,
        type: 'pushbutton_no',
        x,
        y,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [
          { id: '3', name: '3', x: 70, y: 0 },
          { id: '4', name: '4', x: 70, y: 70 }
        ]
      };

    case 'pushbutton_nc':
      return {
        id: uniqueId,
        name: 'زر إيقاف (NC)',
        tag: customTag || `S0_${compCounter}`,
        type: 'pushbutton_nc',
        x,
        y,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [
          { id: '1', name: '1', x: 70, y: 0 },
          { id: '2', name: '2', x: 70, y: 70 }
        ]
      };

    case 'contactor_coil':
      return {
        id: uniqueId,
        name: 'ملف كونتاكتور',
        tag: customTag || `KM${compCounter}`,
        type: 'contactor_coil',
        x,
        y,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [
          { id: 'A1', name: 'A1', x: 70, y: 0 },
          { id: 'A2', name: 'A2', x: 70, y: 70 }
        ]
      };

    case 'contactor_contact_no':
      return {
        id: uniqueId,
        name: 'نقطة مساعدة مفتوحة (NO)',
        tag: customTag || 'KM-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x,
        y,
        width: 140,
        height: 70,
        closed: false,
        terminals: [
          { id: '13', name: '13', x: 70, y: 0 },
          { id: '14', name: '14', x: 70, y: 70 }
        ]
      };

    case 'contactor_contact_nc':
      return {
        id: uniqueId,
        name: 'نقطة قفل مغلقة (NC)',
        tag: customTag || 'KM-NC',
        linkedTag: 'KM1',
        type: 'contactor_contact_nc',
        x,
        y,
        width: 140,
        height: 70,
        closed: true,
        terminals: [
          { id: '21', name: '21', x: 70, y: 0 },
          { id: '22', name: '22', x: 70, y: 70 }
        ]
      };

    case 'timer_coil':
      return {
        id: uniqueId,
        name: 'مؤقت زمني On-Delay',
        tag: customTag || `KT${compCounter}`,
        type: 'timer_coil',
        timerSeconds: 3,
        timerElapsed: 0,
        x,
        y,
        width: 140,
        height: 80,
        isEnergized: false,
        terminals: [
          { id: 'A1', name: 'A1', x: 70, y: 0 },
          { id: 'A2', name: 'A2', x: 70, y: 80 }
        ]
      };

    case 'timer_contact_no':
      return {
        id: uniqueId,
        name: 'نقطة مؤقت (NO)',
        tag: customTag || 'KT-NO',
        linkedTag: 'KT1',
        type: 'timer_contact_no',
        x,
        y,
        width: 140,
        height: 70,
        closed: false,
        terminals: [
          { id: '17', name: '17', x: 70, y: 0 },
          { id: '18', name: '18', x: 70, y: 70 }
        ]
      };

    case 'thermal_overload':
      return {
        id: uniqueId,
        name: 'مرحل حراري (Overload)',
        tag: customTag || `F${compCounter}`,
        type: 'thermal_overload',
        x,
        y,
        width: 140,
        height: 70,
        closed: true,
        isTripped: false,
        terminals: [
          { id: '95', name: '95', x: 70, y: 0 },
          { id: '96', name: '96', x: 70, y: 70 }
        ]
      };

    case 'motor_3phase':
      return {
        id: uniqueId,
        name: 'محرك 3 أطوار',
        tag: customTag || `M${compCounter}`,
        type: 'motor_3phase',
        x,
        y,
        width: 180,
        height: 190,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [
          { id: 'U', name: 'U', x: 45, y: 20 },
          { id: 'V', name: 'V', x: 90, y: 20 },
          { id: 'W', name: 'W', x: 135, y: 20 }
        ]
      };

    case 'pilot_lamp':
      return {
        id: uniqueId,
        name: 'مصباح إشارة (Lamp)',
        tag: customTag || `H${compCounter}`,
        type: 'pilot_lamp',
        color: 'emerald',
        x,
        y,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [
          { id: 'X1', name: 'X1', x: 60, y: 0 },
          { id: 'X2', name: 'X2', x: 60, y: 70 }
        ]
      };

    default:
      return {
        id: uniqueId,
        name: 'عنصر كهربائي',
        tag: 'E1',
        type,
        x,
        y,
        width: 120,
        height: 70,
        terminals: [{ id: '1', name: '1', x: 60, y: 0 }, { id: '2', name: '2', x: 60, y: 70 }]
      };
  }
}

import { ComponentDefinition } from '../data/industrial100Components';

export function createComponentFromDefinition(
  def: ComponentDefinition,
  x: number = 200,
  y: number = 200
): CircuitComponent {
  const uniqueId = `comp_${def.tag.toLowerCase()}_${Date.now()}_${compCounter++}`;
  const width = def.defaultWidth || (def.terminals.length > 2 ? 160 : 130);
  const height = def.defaultHeight || 80;

  // Map terminals according to width and height
  const mappedTerminals = def.terminals.map((t, idx) => {
    let relX = t.x;
    let relY = t.y;

    // Normalize relative positions to current card width & height
    if (t.y === 0) relY = 0;
    else if (t.y >= 70) relY = height;
    else relY = (t.y / 70) * height;

    if (def.terminals.length === 1) {
      relX = width / 2;
    } else {
      relX = (t.x / 100) * width;
    }

    const pol: 'phase' | 'neutral' | 'none' = (def.tag === 'L1' || def.tag === 'L2' || def.tag === 'L3') 
      ? 'phase' 
      : (def.tag === 'N' ? 'neutral' : 'none');

    return {
      id: t.id,
      name: t.name,
      x: relX,
      y: relY,
      polarity: pol
    };
  });

  // Determine underlying simulation component type
  let type: ComponentType = 'pushbutton_no';
  let closed = false;

  if (def.category === 'قواطع وحماية') {
    if (def.tag.startsWith('F')) {
      type = 'thermal_overload';
      closed = true;
    } else {
      type = 'circuit_breaker';
      closed = true;
    }
  } else if (def.category === 'مفاتيح وأزرار') {
    const isNcButton = 
      def.symbolSvg === 'pushbutton_nc' || 
      def.nameAr.includes('إيقاف') || 
      def.nameAr.includes('NC') || 
      (def.nameEn && def.nameEn.toLowerCase().includes('stop')) ||
      def.tag === 'S0' ||
      def.tag === 'SB1';

    if (isNcButton) {
      type = 'pushbutton_nc';
      closed = true;
    } else {
      type = 'pushbutton_no';
      closed = false;
    }
  } else if (def.category === 'كونتاكتورات ومرحلات') {
    if (def.tag.startsWith('KT')) {
      type = 'timer_coil';
    } else {
      type = 'contactor_coil';
    }
  } else if (def.category === 'ملامسات وأطراف') {
    if (def.tag.includes('NC') || def.tag === '21-22' || def.tag === '95-96') {
      type = 'contactor_contact_nc';
      closed = true;
    } else {
      type = 'contactor_contact_no';
      closed = false;
    }
  } else if (def.category === 'أحمال ومحركات') {
    if (def.tag.startsWith('M') || def.tag === 'P' || def.tag === 'V') {
      type = 'motor_3phase';
    } else {
      type = 'pilot_lamp';
    }
  } else if (def.category === 'إشارات وبيان') {
    type = 'pilot_lamp';
  } else if (def.category === 'تغذية ومحولات') {
    if (def.tag === 'N') {
      type = 'power_neutral';
    } else {
      type = 'power_phase';
    }
  }

  return {
    id: uniqueId,
    name: def.nameAr,
    tag: def.tag,
    type,
    x,
    y,
    width,
    height,
    terminals: mappedTerminals,
    symbolSvg: def.symbolSvg,
    closed,
    isPressed: false,
    isEnergized: false,
    isTripped: false,
    timerSeconds: def.tag.startsWith('KT') ? 3 : undefined,
    timerElapsed: 0,
    linkedTag: def.tag.includes('NO') || def.tag.includes('NC') ? 'KM1' : undefined
  };
}
