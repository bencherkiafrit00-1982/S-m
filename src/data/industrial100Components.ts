export interface ComponentDefinition {
  id: number;
  tag: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  category: 
    | 'قواطع وحماية' 
    | 'مفاتيح وأزرار' 
    | 'كونتاكتورات ومرحلات' 
    | 'ملامسات وأطراف' 
    | 'أحمال ومحركات' 
    | 'إشارات وبيان' 
    | 'تغذية ومحولات' 
    | 'قياس ومراقبة' 
    | 'حساسات صناعية' 
    | 'أتمتة و PLC';
  symbolSvg: string; // SVG schematic symbol representation
  terminals: { id: string; name: string; x: number; y: number }[];
  defaultWidth?: number;
  defaultHeight?: number;
  description?: string;
}

export const INDUSTRIAL_100_COMPONENTS: ComponentDefinition[] = [
  // --- صفحة 1: قواطع وحماية (1 - 14) ---
  {
    id: 1,
    tag: 'QF',
    nameAr: 'قاطع آلي',
    nameFr: 'Disjoncteur',
    nameEn: 'Circuit breaker',
    category: 'قواطع وحماية',
    symbolSvg: 'circuit_breaker',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }],
    description: 'حماية من زيادة الحمل والقصر الكهربائي (Short-circuit & Overload protection)'
  },
  {
    id: 2,
    tag: 'Q1',
    nameAr: 'قاطع رئيسي',
    nameFr: 'Disjoncteur général',
    nameEn: 'Main breaker',
    category: 'قواطع وحماية',
    symbolSvg: 'main_breaker',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }],
    description: 'القاطع الرئيسي لعزل اللوحة الكهربائية وتغذيتها بالكامل'
  },
  {
    id: 3,
    tag: 'QS',
    nameAr: 'مفتاح فصل (عازل)',
    nameFr: 'Sectionneur',
    nameEn: 'Isolator',
    category: 'قواطع وحماية',
    symbolSvg: 'isolator',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 4,
    tag: 'F/FU',
    nameAr: 'مصهر (فيوز)',
    nameFr: 'Fusible',
    nameEn: 'Fuse',
    category: 'قواطع وحماية',
    symbolSvg: 'fuse',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 5,
    tag: 'FR',
    nameAr: 'مرحل حراري (أوفرلود)',
    nameFr: 'Relais thermique',
    nameEn: 'Thermal overload relay',
    category: 'قواطع وحماية',
    symbolSvg: 'thermal_relay',
    terminals: [{ id: '95', name: '95', x: 35, y: 0 }, { id: '96', name: '96', x: 65, y: 70 }]
  },
  {
    id: 6,
    tag: 'MPCB',
    nameAr: 'قاطع حماية المحرك',
    nameFr: 'Disjoncteur moteur',
    nameEn: 'Motor protection breaker',
    category: 'قواطع وحماية',
    symbolSvg: 'mpcb',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 7,
    tag: 'RCD',
    nameAr: 'جهاز حماية تفاضلي',
    nameFr: 'Dispositif différentiel',
    nameEn: 'Residual current device',
    category: 'قواطع وحماية',
    symbolSvg: 'rcd',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 8,
    tag: 'RCBO',
    nameAr: 'قاطع تفاضلي مع حماية التيار',
    nameFr: 'Disjoncteur différentiel',
    nameEn: 'RCBO',
    category: 'قواطع وحماية',
    symbolSvg: 'rcbo',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 9,
    tag: 'SPD',
    nameAr: 'واقي زيادة الجهد (مانع صواعق)',
    nameFr: 'Parafoudre',
    nameEn: 'Surge protector',
    category: 'قواطع وحماية',
    symbolSvg: 'spd',
    terminals: [{ id: 'L', name: 'L', x: 50, y: 0 }, { id: 'PE', name: 'PE', x: 50, y: 70 }]
  },
  {
    id: 10,
    tag: 'F1',
    nameAr: 'مصهر دائرة التحكم',
    nameFr: 'Fusible de commande',
    nameEn: 'Control fuse',
    category: 'قواطع وحماية',
    symbolSvg: 'fuse',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 11,
    tag: 'F2',
    nameAr: 'مصهر دائرة القدرة',
    nameFr: 'Fusible de puissance',
    nameEn: 'Power fuse',
    category: 'قواطع وحماية',
    symbolSvg: 'fuse',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 12,
    tag: 'ELCB',
    nameAr: 'قاطع التسرب الأرضي',
    nameFr: 'Disjoncteur de fuite à la terre',
    nameEn: 'Earth leakage breaker',
    category: 'قواطع وحماية',
    symbolSvg: 'elcb',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 13,
    tag: 'RCM',
    nameAr: 'مراقب تيار التسرب',
    nameFr: 'Contrôleur de courant résiduel',
    nameEn: 'Residual current monitor',
    category: 'قياس ومراقبة',
    symbolSvg: 'meter_circle',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 14,
    tag: 'IMD',
    nameAr: 'مراقب العزل الكهربائي',
    nameFr: "Contrôleur d'isolement",
    nameEn: 'Insulation monitor',
    category: 'قياس ومراقبة',
    symbolSvg: 'meter_circle',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },

  // --- صفحة 2: مفاتيح، أزرار وكونتاكتورات (15 - 31) ---
  {
    id: 15,
    tag: 'AFDD',
    nameAr: 'كاشف أعطال القوس الكهربائي',
    nameFr: "Détecteur d'arcs",
    nameEn: 'Arc fault detector',
    category: 'قواطع وحماية',
    symbolSvg: 'afdd',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 16,
    tag: 'S0',
    nameAr: 'زر إيقاف الطوارئ',
    nameFr: "Arrêt d'urgence",
    nameEn: 'Emergency stop',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'emergency_stop',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 17,
    tag: 'S1',
    nameAr: 'زر إيقاف (NC)',
    nameFr: "Bouton d'arrêt",
    nameEn: 'Stop pushbutton',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'pushbutton_nc',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 18,
    tag: 'S2',
    nameAr: 'زر تشغيل (NO)',
    nameFr: 'Bouton de marche',
    nameEn: 'Start pushbutton',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'pushbutton_no',
    terminals: [{ id: '3', name: '3', x: 50, y: 0 }, { id: '4', name: '4', x: 50, y: 70 }]
  },
  {
    id: 19,
    tag: 'SA',
    nameAr: 'مفتاح اختيار دوار (Selector)',
    nameFr: 'Commutateur sélecteur',
    nameEn: 'Selector switch',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'selector_switch',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 20,
    tag: 'S',
    nameAr: 'مفتاح تحكم',
    nameFr: 'Interrupteur de commande',
    nameEn: 'Control switch',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'control_switch',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 21,
    tag: 'SQ',
    nameAr: 'مفتاح نهاية مشوار (Limit switch)',
    nameFr: 'Fin de course',
    nameEn: 'Limit switch',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'limit_switch',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 22,
    tag: 'SR',
    nameAr: 'زر إعادة ضبط (Reset)',
    nameFr: 'Bouton de réarmement',
    nameEn: 'Reset button',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'reset_button',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 23,
    tag: 'SS',
    nameAr: 'مفتاح اختيار يدوي / آلي (Manual/Auto)',
    nameFr: 'Sélecteur manuel/auto',
    nameEn: 'Manual/auto selector',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'selector_switch',
    terminals: [{ id: 'C', name: 'C', x: 50, y: 0 }, { id: 'M', name: 'M', x: 30, y: 70 }, { id: 'A', name: 'A', x: 70, y: 70 }]
  },
  {
    id: 24,
    tag: 'S3',
    nameAr: 'زر ضاغط إضافي',
    nameFr: 'Bouton-poussoir',
    nameEn: 'Auxiliary pushbutton',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'pushbutton_no',
    terminals: [{ id: '3', name: '3', x: 50, y: 0 }, { id: '4', name: '4', x: 50, y: 70 }]
  },
  {
    id: 25,
    tag: 'SS1',
    nameAr: 'مفتاح تشغيل / إيقاف (ON/OFF)',
    nameFr: 'Commutateur marche/arrêt',
    nameEn: 'ON/OFF switch',
    category: 'مفاتيح وأزرار',
    symbolSvg: 'on_off_switch',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 26,
    tag: 'KM1',
    nameAr: 'ملف كونتاكتور رئيسي (KM1)',
    nameFr: 'Contacteur',
    nameEn: 'Contactor',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'contactor_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 27,
    tag: 'KM2',
    nameAr: 'ملف كونتاكتور ثانٍ (KM2)',
    nameFr: 'Contacteur',
    nameEn: 'Contactor',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'contactor_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 28,
    tag: 'KA1',
    nameAr: 'مرحل مساعد (Relay KA1)',
    nameFr: 'Relais auxiliaire',
    nameEn: 'Auxiliary relay',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'relay_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 29,
    tag: 'KA2',
    nameAr: 'مرحل مساعد ثانٍ (Relay KA2)',
    nameFr: 'Relais auxiliaire',
    nameEn: 'Auxiliary relay',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'relay_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 30,
    tag: 'KT1',
    nameAr: 'مرحل زمني (مؤقت On-Delay)',
    nameFr: 'Relais temporisé',
    nameEn: 'Timer relay',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'timer_relay',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 31,
    tag: 'K',
    nameAr: 'مرحل كهرومغناطيسي عام',
    nameFr: 'Relais électrique',
    nameEn: 'Electrical relay',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'relay_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },

  // --- صفحة 3: مراقبة وملامسات (32 - 48) ---
  {
    id: 32,
    tag: 'KPR',
    nameAr: 'مراقب الأطوار (Phase monitor)',
    nameFr: 'Relais de contrôle de phases',
    nameEn: 'Phase monitor relay',
    category: 'قياس ومراقبة',
    symbolSvg: 'relay_circle',
    terminals: [{ id: 'L1', name: 'L1', x: 25, y: 0 }, { id: 'L2', name: 'L2', x: 50, y: 0 }, { id: 'L3', name: 'L3', x: 75, y: 0 }, { id: '11', name: '11', x: 50, y: 70 }]
  },
  {
    id: 33,
    tag: 'KUV',
    nameAr: 'مراقب الجهد (Voltage monitor)',
    nameFr: 'Relais de contrôle de tension',
    nameEn: 'Voltage monitor relay',
    category: 'قياس ومراقبة',
    symbolSvg: 'relay_circle',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 34,
    tag: 'KOC',
    nameAr: 'مراقب زيادة التيار (Current monitor)',
    nameFr: 'Relais de contrôle de courant',
    nameEn: 'Current monitor relay',
    category: 'قياس ومراقبة',
    symbolSvg: 'relay_circle',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 35,
    tag: 'KA3',
    nameAr: 'مرحل وسيط (Interposing relay)',
    nameFr: 'Relais intermédiaire',
    nameEn: 'Interposing relay',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'relay_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 36,
    tag: 'KSR',
    nameAr: 'مرحل سلامة (Safety relay)',
    nameFr: 'Relais de sécurité',
    nameEn: 'Safety relay',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'safety_relay',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 37,
    tag: 'KM3',
    nameAr: 'كونتاكتور قدرة ثالث (KM3)',
    nameFr: 'Contacteur de puissance',
    nameEn: 'Power contactor',
    category: 'كونتاكتورات ومرحلات',
    symbolSvg: 'contactor_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 38,
    tag: 'KSPD',
    nameAr: 'مراقب سرعة الدوران',
    nameFr: 'Relais de vitesse',
    nameEn: 'Speed monitor relay',
    category: 'قياس ومراقبة',
    symbolSvg: 'relay_circle',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 39,
    tag: 'KDP',
    nameAr: 'مراقب الضغط (Pressure relay)',
    nameFr: 'Relais de pression',
    nameEn: 'Pressure monitor relay',
    category: 'قياس ومراقبة',
    symbolSvg: 'relay_circle',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 40,
    tag: 'KLV',
    nameAr: 'مراقب مستوى السائل (Level relay)',
    nameFr: 'Relais de niveau',
    nameEn: 'Level monitor relay',
    category: 'قياس ومراقبة',
    symbolSvg: 'relay_circle',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 41,
    tag: 'NO',
    nameAr: 'ملامس مفتوح عادةً (NO Contact)',
    nameFr: 'Contact NO',
    nameEn: 'Normally open contact',
    category: 'ملامسات وأطراف',
    symbolSvg: 'contact_no',
    terminals: [{ id: '13', name: '13', x: 50, y: 0 }, { id: '14', name: '14', x: 50, y: 70 }]
  },
  {
    id: 42,
    tag: 'NC',
    nameAr: 'ملامس مغلق عادةً (NC Contact)',
    nameFr: 'Contact NF',
    nameEn: 'Normally closed contact',
    category: 'ملامسات وأطراف',
    symbolSvg: 'contact_nc',
    terminals: [{ id: '21', name: '21', x: 50, y: 0 }, { id: '22', name: '22', x: 50, y: 70 }]
  },
  {
    id: 43,
    tag: '13-14',
    nameAr: 'ملامس مساعد مفتوح 13-14 (NO)',
    nameFr: 'Contact auxiliaire NO',
    nameEn: 'Auxiliary NO contact',
    category: 'ملامسات وأطراف',
    symbolSvg: 'contact_no',
    terminals: [{ id: '13', name: '13', x: 50, y: 0 }, { id: '14', name: '14', x: 50, y: 70 }]
  },
  {
    id: 44,
    tag: '21-22',
    nameAr: 'ملامس مساعد مغلق 21-22 (NC)',
    nameFr: 'Contact auxiliaire NF',
    nameEn: 'Auxiliary NC contact',
    category: 'ملامسات وأطراف',
    symbolSvg: 'contact_nc',
    terminals: [{ id: '21', name: '21', x: 50, y: 0 }, { id: '22', name: '22', x: 50, y: 70 }]
  },
  {
    id: 45,
    tag: 'A1-A2',
    nameAr: 'أطراف ملف التغذية (Coil terminals)',
    nameFr: 'Bornes de bobine',
    nameEn: 'Coil terminals',
    category: 'ملامسات وأطراف',
    symbolSvg: 'contactor_coil',
    terminals: [{ id: 'A1', name: 'A1', x: 50, y: 0 }, { id: 'A2', name: 'A2', x: 50, y: 70 }]
  },
  {
    id: 46,
    tag: 'L1-L2-L3',
    nameAr: 'مداخل أطوار القدرة (Power In)',
    nameFr: 'Entrées puissance',
    nameEn: 'Power input terminals',
    category: 'ملامسات وأطراف',
    symbolSvg: 'terminals_3phase',
    terminals: [{ id: 'L1', name: 'L1', x: 25, y: 35 }, { id: 'L2', name: 'L2', x: 50, y: 35 }, { id: 'L3', name: 'L3', x: 75, y: 35 }]
  },
  {
    id: 47,
    tag: 'T1-T2-T3',
    nameAr: 'مخارج القدرة للمحرك (Power Out)',
    nameFr: 'Sorties puissance',
    nameEn: 'Power output terminals',
    category: 'ملامسات وأطراف',
    symbolSvg: 'terminals_3phase',
    terminals: [{ id: 'T1', name: 'T1', x: 25, y: 35 }, { id: 'T2', name: 'T2', x: 50, y: 35 }, { id: 'T3', name: 'T3', x: 75, y: 35 }]
  },
  {
    id: 48,
    tag: '95-96',
    nameAr: 'ملامس حراري مغلق 95-96 (NC)',
    nameFr: 'Contact thermique NF',
    nameEn: 'Thermal relay NC',
    category: 'ملامسات وأطراف',
    symbolSvg: 'thermal_contact_nc',
    terminals: [{ id: '95', name: '95', x: 50, y: 0 }, { id: '96', name: '96', x: 50, y: 70 }]
  },

  // --- صفحة 4: أحمال، محركات ومصابيح (49 - 65) ---
  {
    id: 49,
    tag: '97-98',
    nameAr: 'ملامس حراري إشارة 97-98 (NO)',
    nameFr: 'Contact thermique NO',
    nameEn: 'Thermal relay NO',
    category: 'ملامسات وأطراف',
    symbolSvg: 'thermal_contact_no',
    terminals: [{ id: '97', name: '97', x: 50, y: 0 }, { id: '98', name: '98', x: 50, y: 70 }]
  },
  {
    id: 50,
    tag: '11-12-14',
    nameAr: 'ملامس قلاب تحويلي (Changeover)',
    nameFr: 'Contact inverseur',
    nameEn: 'Changeover contact',
    category: 'ملامسات وأطراف',
    symbolSvg: 'changeover_contact',
    terminals: [{ id: '11', name: '11', x: 50, y: 0 }, { id: '12', name: '12', x: 30, y: 70 }, { id: '14', name: '14', x: 70, y: 70 }]
  },
  {
    id: 51,
    tag: 'M1',
    nameAr: 'محرك كهربائي 3 أطوار (M1)',
    nameFr: 'Moteur électrique',
    nameEn: 'Electric motor',
    category: 'أحمال ومحركات',
    symbolSvg: 'motor',
    terminals: [{ id: 'U', name: 'U', x: 30, y: 15 }, { id: 'V', name: 'V', x: 60, y: 15 }, { id: 'W', name: 'W', x: 90, y: 15 }]
  },
  {
    id: 52,
    tag: 'M2',
    nameAr: 'محرك كهربائي ثانٍ (M2)',
    nameFr: 'Deuxième moteur',
    nameEn: 'Second motor',
    category: 'أحمال ومحركات',
    symbolSvg: 'motor',
    terminals: [{ id: 'U', name: 'U', x: 30, y: 15 }, { id: 'V', name: 'V', x: 60, y: 15 }, { id: 'W', name: 'W', x: 90, y: 15 }]
  },
  {
    id: 53,
    tag: 'M3',
    nameAr: 'محرك كهربائي ثالث (M3)',
    nameFr: 'Troisième moteur',
    nameEn: 'Third motor',
    category: 'أحمال ومحركات',
    symbolSvg: 'motor',
    terminals: [{ id: 'U', name: 'U', x: 30, y: 15 }, { id: 'V', name: 'V', x: 60, y: 15 }, { id: 'W', name: 'W', x: 90, y: 15 }]
  },
  {
    id: 54,
    tag: 'M',
    nameAr: 'محرك كهربائي أحادي الطور',
    nameFr: 'Moteur',
    nameEn: 'Motor',
    category: 'أحمال ومحركات',
    symbolSvg: 'motor',
    terminals: [{ id: '1', name: '1', x: 40, y: 15 }, { id: '2', name: '2', x: 80, y: 15 }]
  },
  {
    id: 55,
    tag: 'P',
    nameAr: 'مضخة كهربائية (Pump)',
    nameFr: 'Pompe',
    nameEn: 'Pump',
    category: 'أحمال ومحركات',
    symbolSvg: 'pump',
    terminals: [{ id: '1', name: '1', x: 40, y: 15 }, { id: '2', name: '2', x: 80, y: 15 }]
  },
  {
    id: 56,
    tag: 'V',
    nameAr: 'مروحة تهوية صناعية (Fan)',
    nameFr: 'Ventilateur',
    nameEn: 'Fan',
    category: 'أحمال ومحركات',
    symbolSvg: 'fan',
    terminals: [{ id: '1', name: '1', x: 40, y: 15 }, { id: '2', name: '2', x: 80, y: 15 }]
  },
  {
    id: 57,
    tag: 'E',
    nameAr: 'عنصر تسخين حراري (Heater)',
    nameFr: 'Résistance chauffante',
    nameEn: 'Heating element',
    category: 'أحمال ومحركات',
    symbolSvg: 'heater',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 58,
    tag: 'YV',
    nameAr: 'صمام كهرومغناطيسي (Solenoid valve)',
    nameFr: 'Électrovanne',
    nameEn: 'Solenoid valve',
    category: 'أحمال ومحركات',
    symbolSvg: 'solenoid_valve',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 59,
    tag: 'BR',
    nameAr: 'مقاومة كبح (Braking resistor)',
    nameFr: 'Résistance de freinage',
    nameEn: 'Braking resistor',
    category: 'أحمال ومحركات',
    symbolSvg: 'resistor',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 60,
    tag: 'MB',
    nameAr: 'مكبح كهرومغناطيسي',
    nameFr: 'Frein électromagnétique',
    nameEn: 'Electromagnetic brake',
    category: 'أحمال ومحركات',
    symbolSvg: 'em_brake',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 61,
    tag: 'H1',
    nameAr: 'مصباح بيان تشغيل (أخضر)',
    nameFr: 'Voyant de marche',
    nameEn: 'Run indicator lamp',
    category: 'إشارات وبيان',
    symbolSvg: 'lamp_green',
    terminals: [{ id: 'X1', name: 'X1', x: 50, y: 0 }, { id: 'X2', name: 'X2', x: 50, y: 70 }]
  },
  {
    id: 62,
    tag: 'H2',
    nameAr: 'مصباح بيان توقف (أحمر)',
    nameFr: "Voyant d'arrêt",
    nameEn: 'Stop indicator lamp',
    category: 'إشارات وبيان',
    symbolSvg: 'lamp_red',
    terminals: [{ id: 'X1', name: 'X1', x: 50, y: 0 }, { id: 'X2', name: 'X2', x: 50, y: 70 }]
  },
  {
    id: 63,
    tag: 'H3',
    nameAr: 'مصباح بيان عطل (أصفر/برتقالي)',
    nameFr: 'Voyant de défaut',
    nameEn: 'Fault indicator lamp',
    category: 'إشارات وبيان',
    symbolSvg: 'lamp_yellow',
    terminals: [{ id: 'X1', name: 'X1', x: 50, y: 0 }, { id: 'X2', name: 'X2', x: 50, y: 70 }]
  },
  {
    id: 64,
    tag: 'HA',
    nameAr: 'منبه صوتي (سارينة / بوق)',
    nameFr: 'Avertisseur sonore',
    nameEn: 'Audible alarm',
    category: 'إشارات وبيان',
    symbolSvg: 'alarm_buzzer',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 65,
    tag: 'HL',
    nameAr: 'مصباح إشارة ضوئية عام',
    nameFr: 'Voyant lumineux',
    nameEn: 'Signal lamp',
    category: 'إشارات وبيان',
    symbolSvg: 'lamp_white',
    terminals: [{ id: 'X1', name: 'X1', x: 50, y: 0 }, { id: 'X2', name: 'X2', x: 50, y: 70 }]
  },

  // --- صفحة 5: تغذية ومحولات وقياس (66 - 82) ---
  {
    id: 66,
    tag: 'T1',
    nameAr: 'محول كهربائي للجهد',
    nameFr: 'Transformateur',
    nameEn: 'Transformer',
    category: 'تغذية ومحولات',
    symbolSvg: 'transformer',
    terminals: [{ id: 'P1', name: 'P1', x: 30, y: 0 }, { id: 'P2', name: 'P2', x: 70, y: 0 }, { id: 'S1', name: 'S1', x: 30, y: 70 }, { id: 'S2', name: 'S2', x: 70, y: 70 }]
  },
  {
    id: 67,
    tag: 'TR1',
    nameAr: 'محول دائرة التحكم (400V/230V/24V)',
    nameFr: 'Transformateur de commande',
    nameEn: 'Control transformer',
    category: 'تغذية ومحولات',
    symbolSvg: 'transformer',
    terminals: [{ id: 'P1', name: 'P1', x: 30, y: 0 }, { id: 'P2', name: 'P2', x: 70, y: 0 }, { id: 'S1', name: 'S1', x: 30, y: 70 }, { id: 'S2', name: 'S2', x: 70, y: 70 }]
  },
  {
    id: 68,
    tag: 'PS1',
    nameAr: 'مزود طاقة تيار مستمر (Power Supply 24V)',
    nameFr: 'Alimentation',
    nameEn: 'Power supply',
    category: 'تغذية ومحولات',
    symbolSvg: 'power_supply',
    terminals: [{ id: 'L', name: 'L', x: 30, y: 0 }, { id: 'N', name: 'N', x: 70, y: 0 }, { id: '+', name: '+', x: 30, y: 70 }, { id: '-', name: '-', x: 70, y: 70 }]
  },
  {
    id: 69,
    tag: 'G',
    nameAr: 'مولد كهربائي (Generator)',
    nameFr: 'Générateur',
    nameEn: 'Generator',
    category: 'تغذية ومحولات',
    symbolSvg: 'generator',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 70,
    tag: 'BAT',
    nameAr: 'بطارية تيار مستمر (DC Battery)',
    nameFr: 'Batterie',
    nameEn: 'Battery',
    category: 'تغذية ومحولات',
    symbolSvg: 'battery',
    terminals: [{ id: '+', name: '+', x: 50, y: 0 }, { id: '-', name: '-', x: 50, y: 70 }]
  },
  {
    id: 71,
    tag: 'N',
    nameAr: 'المحايد (Neutral)',
    nameFr: 'Neutre',
    nameEn: 'Neutral',
    category: 'تغذية ومحولات',
    symbolSvg: 'neutral_rail',
    terminals: [{ id: 'N', name: 'N', x: 50, y: 35 }]
  },
  {
    id: 72,
    tag: 'PE',
    nameAr: 'تأريض الحماية (Ground PE)',
    nameFr: 'Terre de protection',
    nameEn: 'Protective earth',
    category: 'تغذية ومحولات',
    symbolSvg: 'earth_ground',
    terminals: [{ id: 'PE', name: 'PE', x: 50, y: 20 }]
  },
  {
    id: 73,
    tag: 'L1',
    nameAr: 'الطور الأول (Phase 1)',
    nameFr: 'Phase L1',
    nameEn: 'Phase 1',
    category: 'تغذية ومحولات',
    symbolSvg: 'phase_rail',
    terminals: [{ id: 'L1', name: 'L1', x: 50, y: 35 }]
  },
  {
    id: 74,
    tag: 'L2',
    nameAr: 'الطور الثاني (Phase 2)',
    nameFr: 'Phase L2',
    nameEn: 'Phase 2',
    category: 'تغذية ومحولات',
    symbolSvg: 'phase_rail',
    terminals: [{ id: 'L2', name: 'L2', x: 50, y: 35 }]
  },
  {
    id: 75,
    tag: 'L3',
    nameAr: 'الطور الثالث (Phase 3)',
    nameFr: 'Phase L3',
    nameEn: 'Phase 3',
    category: 'تغذية ومحولات',
    symbolSvg: 'phase_rail',
    terminals: [{ id: 'L3', name: 'L3', x: 50, y: 35 }]
  },
  {
    id: 76,
    tag: 'A',
    nameAr: 'مقياس التيار (Ampere meter)',
    nameFr: 'Ampèremètre',
    nameEn: 'Ammeter',
    category: 'قياس ومراقبة',
    symbolSvg: 'meter_A',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 77,
    tag: 'V',
    nameAr: 'مقياس الجهد (Volt meter)',
    nameFr: 'Voltmètre',
    nameEn: 'Voltmeter',
    category: 'قياس ومراقبة',
    symbolSvg: 'meter_V',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 78,
    tag: 'W',
    nameAr: 'مقياس القدرة (Watt meter)',
    nameFr: 'Wattmètre',
    nameEn: 'Wattmeter',
    category: 'قياس ومراقبة',
    symbolSvg: 'meter_W',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 79,
    tag: 'kWh',
    nameAr: 'عداد استهلاك الطاقة (Energy meter)',
    nameFr: "Compteur d'énergie",
    nameEn: 'Energy meter',
    category: 'قياس ومراقبة',
    symbolSvg: 'meter_kWh',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 80,
    tag: 'CT',
    nameAr: 'محول تيار (Current transformer)',
    nameFr: 'Transformateur de courant',
    nameEn: 'Current transformer',
    category: 'قياس ومراقبة',
    symbolSvg: 'transformer_ct',
    terminals: [{ id: 'S1', name: 'S1', x: 35, y: 70 }, { id: 'S2', name: 'S2', x: 65, y: 70 }]
  },
  {
    id: 81,
    tag: 'VT/PT',
    nameAr: 'محول جهد للقياس',
    nameFr: 'Transformateur de tension',
    nameEn: 'Voltage transformer',
    category: 'قياس ومراقبة',
    symbolSvg: 'transformer',
    terminals: [{ id: '1', name: '1', x: 35, y: 0 }, { id: '2', name: '2', x: 65, y: 70 }]
  },
  {
    id: 82,
    tag: 'Hz',
    nameAr: 'مقياس التردد (Frequency meter)',
    nameFr: 'Fréquencemètre',
    nameEn: 'Frequency meter',
    category: 'قياس ومراقبة',
    symbolSvg: 'meter_Hz',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },

  // --- صفحة 6: حساسات صناعية وأتمتة (83 - 99) ---
  {
    id: 83,
    tag: 'B1',
    nameAr: 'حساس تقاربي حثي (Inductive sensor)',
    nameFr: 'Capteur inductif',
    nameEn: 'Inductive sensor',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_proximity',
    terminals: [{ id: '+', name: '+', x: 30, y: 0 }, { id: 'OUT', name: 'OUT', x: 50, y: 70 }, { id: '-', name: '-', x: 70, y: 0 }]
  },
  {
    id: 84,
    tag: 'B2',
    nameAr: 'حساس تقاربي سعوي (Capacitive sensor)',
    nameFr: 'Capteur capacitif',
    nameEn: 'Capacitive sensor',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_proximity',
    terminals: [{ id: '+', name: '+', x: 30, y: 0 }, { id: 'OUT', name: 'OUT', x: 50, y: 70 }, { id: '-', name: '-', x: 70, y: 0 }]
  },
  {
    id: 85,
    tag: 'B3',
    nameAr: 'حساس كهروضوئي (Photoelectric sensor)',
    nameFr: 'Capteur photoélectrique',
    nameEn: 'Photoelectric sensor',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_photo',
    terminals: [{ id: '+', name: '+', x: 30, y: 0 }, { id: 'OUT', name: 'OUT', x: 50, y: 70 }, { id: '-', name: '-', x: 70, y: 0 }]
  },
  {
    id: 86,
    tag: 'PT100',
    nameAr: 'حساس حرارة مقاومي (Pt100 RTD)',
    nameFr: 'Sonde Pt100',
    nameEn: 'Pt100 RTD sensor',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_temp',
    terminals: [{ id: '1', name: '1', x: 50, y: 0 }, { id: '2', name: '2', x: 50, y: 70 }]
  },
  {
    id: 87,
    tag: 'TC',
    nameAr: 'مزدوج حراري (Thermocouple)',
    nameFr: 'Thermocouple',
    nameEn: 'Thermocouple',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_thermocouple',
    terminals: [{ id: '+', name: '+', x: 35, y: 70 }, { id: '-', name: '-', x: 65, y: 70 }]
  },
  {
    id: 88,
    tag: 'PS',
    nameAr: 'حساس ضغط (Pressure sensor)',
    nameFr: 'Capteur de pression',
    nameEn: 'Pressure sensor',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_box',
    terminals: [{ id: '+', name: '+', x: 35, y: 0 }, { id: 'OUT', name: 'OUT', x: 65, y: 70 }]
  },
  {
    id: 89,
    tag: 'LS',
    nameAr: 'حساس مستوى (Level sensor)',
    nameFr: 'Capteur de niveau',
    nameEn: 'Level sensor',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_box',
    terminals: [{ id: '+', name: '+', x: 35, y: 0 }, { id: 'OUT', name: 'OUT', x: 65, y: 70 }]
  },
  {
    id: 90,
    tag: 'FS',
    nameAr: 'حساس تدفق (Flow sensor)',
    nameFr: 'Capteur de débit',
    nameEn: 'Flow sensor',
    category: 'حساسات صناعية',
    symbolSvg: 'sensor_box',
    terminals: [{ id: '+', name: '+', x: 35, y: 0 }, { id: 'OUT', name: 'OUT', x: 65, y: 70 }]
  },
  {
    id: 91,
    tag: 'PLC/API',
    nameAr: 'متحكم منطقي مبرمج (PLC)',
    nameFr: 'Automate programmable',
    nameEn: 'PLC',
    category: 'أتمتة و PLC',
    symbolSvg: 'plc_unit',
    terminals: [
      { id: '24V', name: '24V', x: 25, y: 0 },
      { id: '0V', name: '0V', x: 50, y: 0 },
      { id: 'DI0', name: 'DI0', x: 75, y: 0 },
      { id: 'DO0', name: 'DO0', x: 50, y: 80 }
    ],
    defaultWidth: 160,
    defaultHeight: 90
  },
  {
    id: 92,
    tag: 'CPU',
    nameAr: 'وحدة المعالجة المركزية (PLC CPU)',
    nameFr: 'Unité centrale',
    nameEn: 'CPU',
    category: 'أتمتة و PLC',
    symbolSvg: 'plc_unit',
    terminals: [{ id: 'L', name: 'L', x: 35, y: 0 }, { id: 'M', name: 'M', x: 65, y: 0 }]
  },
  {
    id: 93,
    tag: 'DI',
    nameAr: 'وحدة مداخل رقمية (Digital Input)',
    nameFr: 'Entrée numérique',
    nameEn: 'Digital input',
    category: 'أتمتة و PLC',
    symbolSvg: 'plc_module',
    terminals: [{ id: 'I0', name: 'I0', x: 35, y: 0 }, { id: 'I1', name: 'I1', x: 65, y: 0 }]
  },
  {
    id: 94,
    tag: 'DO',
    nameAr: 'وحدة مخارج رقمية (Digital Output)',
    nameFr: 'Sortie numérique',
    nameEn: 'Digital output',
    category: 'أتمتة و PLC',
    symbolSvg: 'plc_module',
    terminals: [{ id: 'Q0', name: 'Q0', x: 35, y: 70 }, { id: 'Q1', name: 'Q1', x: 65, y: 70 }]
  },
  {
    id: 95,
    tag: 'AI',
    nameAr: 'وحدة مداخل تماثلية (Analog Input)',
    nameFr: 'Entrée analogique',
    nameEn: 'Analog input',
    category: 'أتمتة و PLC',
    symbolSvg: 'plc_module',
    terminals: [{ id: 'A0+', name: 'A0+', x: 35, y: 0 }, { id: 'A0-', name: 'A0-', x: 65, y: 0 }]
  },
  {
    id: 96,
    tag: 'AO',
    nameAr: 'وحدة مخارج تماثلية (Analog Output)',
    nameFr: 'Sortie analogique',
    nameEn: 'Analog output',
    category: 'أتمتة و PLC',
    symbolSvg: 'plc_module',
    terminals: [{ id: 'AQ0', name: 'AQ0', x: 35, y: 70 }, { id: 'GND', name: 'GND', x: 65, y: 70 }]
  },
  {
    id: 97,
    tag: 'HMI',
    nameAr: 'شاشة التحكم الصناعية (HMI Screen)',
    nameFr: 'Interface homme-machine',
    nameEn: 'HMI',
    category: 'أتمتة و PLC',
    symbolSvg: 'hmi_panel',
    terminals: [{ id: '+24V', name: '+24V', x: 35, y: 0 }, { id: '0V', name: '0V', x: 65, y: 0 }],
    defaultWidth: 160,
    defaultHeight: 100
  },
  {
    id: 98,
    tag: 'VFD',
    nameAr: 'مغير السرعة والتردد (Inverter / VFD)',
    nameFr: 'Variateur de fréquence',
    nameEn: 'Variable frequency drive',
    category: 'أتمتة و PLC',
    symbolSvg: 'vfd_drive',
    terminals: [
      { id: 'L1', name: 'L1', x: 25, y: 0 },
      { id: 'L2', name: 'L2', x: 50, y: 0 },
      { id: 'L3', name: 'L3', x: 75, y: 0 },
      { id: 'U', name: 'U', x: 25, y: 80 },
      { id: 'V', name: 'V', x: 50, y: 80 },
      { id: 'W', name: 'W', x: 75, y: 80 }
    ],
    defaultWidth: 170,
    defaultHeight: 100
  },
  {
    id: 99,
    tag: 'SS',
    nameAr: 'بادئ تشغيل ناعم (Soft Starter)',
    nameFr: 'Démarreur progressif',
    nameEn: 'Soft starter',
    category: 'أتمتة و PLC',
    symbolSvg: 'soft_starter',
    terminals: [
      { id: 'L1', name: 'L1', x: 30, y: 0 },
      { id: 'L2', name: 'L2', x: 60, y: 0 },
      { id: 'L3', name: 'L3', x: 90, y: 0 },
      { id: 'T1', name: 'T1', x: 30, y: 80 },
      { id: 'T2', name: 'T2', x: 60, y: 80 },
      { id: 'T3', name: 'T3', x: 90, y: 80 }
    ],
    defaultWidth: 170,
    defaultHeight: 100
  },

  // --- صفحة 7: حماية الأمان (100) ---
  {
    id: 100,
    tag: 'STO',
    nameAr: 'إيقاف آمن لعزم الدوران (Safe Torque Off)',
    nameFr: 'Suppression sûre du couple',
    nameEn: 'Safe torque off',
    category: 'قواطع وحماية',
    symbolSvg: 'sto_module',
    terminals: [{ id: 'T1', name: 'T1', x: 35, y: 0 }, { id: 'T2', name: 'T2', x: 65, y: 70 }]
  }
];
