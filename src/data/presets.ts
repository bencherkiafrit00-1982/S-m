import { CircuitPreset } from '../types/circuit';

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  // =========================================================================
  // 1. تشغيل وإيقاف DOL (Direct-on-Line Motor Starter)
  // =========================================================================
  {
    id: 'dol_starter',
    titleAr: 'تشغيل وإيقاف DOL (Direct-On-Line Motor Starter)',
    titleEn: 'Direct-on-Line (DOL) Motor Starter with Self-Holding Latch',
    category: 'الأساسيات الصناعية',
    descriptionAr: 'الدائرة القياسية المعتمدة في اللوحات الكهربائية: قاطع آلي MCB C16، مرحل حراري F1 (95-96)، زر إيقاف S0 (NC)، زر تشغيل S1 (NO) بالتوازي مع نقطة تعشيق KM1 (NO 13-14) لتغذية ملف الكونتاكتور KM1 ومصباح التشغيل H1 وتشغيل المحرك M1.',
    theoryAr: [
      '1. في الحالة الطبيعية: القاطع Q1 مغلق، وزر الإيقاف S0 مغلق، ومفتاح الحماية الحرارية F1 سليم.',
      '2. عند الضغط على زر التشغيل S1: يمر التيار عبر S0 و F1 إلى ملف الكونتاكتور KM1 ومنه إلى المحايد N.',
      '3. تغذية ملف KM1 تؤدي فوراً إلى سحب القلب الحديدي وإغلاق نقطة التعشيق KM1 (NO 13-14) الموضوعة على التوازي مع زر التشغيل.',
      '4. بعد تحرير زر S1: يستمر مرور التيار عبر نقطة التعشيق الموازية، فيظل المحرك دائراً (Self-Holding).',
      '5. عند الضغط على زر الإيقاف S0 أو حدوث حمل زائد (Overload F1) أو فصل القاطع Q1: تنقطع التغذية فوراً ويسقط الكونتاكتور ويتوقف المحرك.'
    ],
    components: [
      {
        id: 'p_phase',
        name: 'مصدر الطور (L1 / 230V)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'q1_mcb',
        name: 'قاطع آلي (MCB C16)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [
          { id: '1', name: '1', x: 70, y: 0 },
          { id: '2', name: '2', x: 70, y: 75 }
        ]
      },
      {
        id: 'f1_overload',
        name: 'المرحل الحراري (F1 95-96)',
        tag: 'F1',
        type: 'thermal_overload',
        x: 60,
        y: 240,
        width: 140,
        height: 70,
        closed: true,
        isTripped: false,
        terminals: [
          { id: '95', name: '95', x: 70, y: 0 },
          { id: '96', name: '96', x: 70, y: 70 }
        ]
      },
      {
        id: 's0_stop',
        name: 'زر الإيقاف (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 350,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [
          { id: '1', name: '1', x: 70, y: 0 },
          { id: '2', name: '2', x: 70, y: 70 }
        ]
      },
      {
        id: 's1_start',
        name: 'زر التشغيل (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 460,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [
          { id: '3', name: '3', x: 70, y: 0 },
          { id: '4', name: '4', x: 70, y: 70 }
        ]
      },
      {
        id: 'km1_aux_no',
        name: 'نقطة الاستمرارية (KM1 NO 13-14)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 220,
        y: 460,
        width: 130,
        height: 70,
        closed: false,
        terminals: [
          { id: '13', name: '13', x: 65, y: 0 },
          { id: '14', name: '14', x: 65, y: 70 }
        ]
      },
      {
        id: 'km1_coil',
        name: 'ملف الكونتاكتور (KM1 Coil)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 60,
        y: 580,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [
          { id: 'A1', name: 'A1', x: 70, y: 0 },
          { id: 'A2', name: 'A2', x: 70, y: 70 }
        ]
      },
      {
        id: 'lamp_run',
        name: 'مصباح التشغيل (H1 - أخضر)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 220,
        y: 580,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [
          { id: 'X1', name: 'X1', x: 60, y: 0 },
          { id: 'X2', name: 'X2', x: 60, y: 70 }
        ]
      },
      {
        id: 'p_neutral',
        name: 'المحايد (Neutral / N)',
        tag: 'N',
        type: 'power_neutral',
        x: 60,
        y: 700,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_m1',
        name: 'محرك حثي 3 أطوار (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 440,
        y: 280,
        width: 180,
        height: 200,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [
          { id: 'U', name: 'U', x: 45, y: 20 },
          { id: 'V', name: 'V', x: 90, y: 20 },
          { id: 'W', name: 'W', x: 135, y: 20 }
        ]
      }
    ],
    wires: [
      { id: 'w0', fromComponentId: 'p_phase', fromTerminalId: 'L1', toComponentId: 'q1_mcb', toTerminalId: '1' },
      { id: 'w1', fromComponentId: 'q1_mcb', fromTerminalId: '2', toComponentId: 'f1_overload', toTerminalId: '95' },
      { id: 'w2', fromComponentId: 'f1_overload', fromTerminalId: '96', toComponentId: 's0_stop', toTerminalId: '1' },
      { id: 'w3', fromComponentId: 's0_stop', fromTerminalId: '2', toComponentId: 's1_start', toTerminalId: '3' },
      // Parallel latch branch
      { id: 'w4', fromComponentId: 's0_stop', fromTerminalId: '2', toComponentId: 'km1_aux_no', toTerminalId: '13' },
      { id: 'w5', fromComponentId: 's1_start', fromTerminalId: '4', toComponentId: 'km1_coil', toTerminalId: 'A1' },
      { id: 'w6', fromComponentId: 'km1_aux_no', fromTerminalId: '14', toComponentId: 'km1_coil', toTerminalId: 'A1' },
      // Lamp parallel with coil
      { id: 'w7', fromComponentId: 'km1_coil', fromTerminalId: 'A1', toComponentId: 'lamp_run', toTerminalId: 'X1' },
      { id: 'w8', fromComponentId: 'km1_coil', fromTerminalId: 'A2', toComponentId: 'lamp_run', toTerminalId: 'X2' },
      // Coil to Neutral
      { id: 'w9', fromComponentId: 'km1_coil', fromTerminalId: 'A2', toComponentId: 'p_neutral', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 2. Self Holding (دائرة التعشيق الذاتي ونقاط الاستمرارية)
  // =========================================================================
  {
    id: 'self_holding',
    titleAr: 'Self Holding (دائرة التعشيق الذاتي ونقاط الاستمرارية)',
    titleEn: 'Self-Holding Contact Circuit with Auxiliary Interlock',
    category: 'الأساسيات الصناعية',
    descriptionAr: 'تطبيق مفصل لمفهوم الحفظ الذاتي (Seal-in / Holding Contact): زر إيقاف S0، نبضة تشغيل من زر S1، ملامس مساعد مفتوح 13-14 من KM1 يحافظ على تغذية الملف بعد تحرير زر التشغيل، مع مصباح بيان H1.',
    theoryAr: [
      '1. الأزرار الضاغطة في اللوحات الصناعية ترتد تلقائياً بمجرد رفع الإصبع.',
      '2. لذلك يتم ربط ملامس مساعد مفتوح (NO 13-14) على التوازي مع زر التشغيل S1.',
      '3. هذا التوصيل يُسمى "دائرة الحفظ الذاتي" أو Seal-in Circuit.',
      '4. تغذية ملف KM1 تغلق هذا الملامس، فيستمر التيار بالمرور حتى بعد فتح ملامسات زر التشغيل.'
    ],
    components: [
      {
        id: 'p_phase_sh',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'q1_mcb_sh',
        name: 'قاطع آلي (MCB C16)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 's0_stop_sh',
        name: 'زر الإيقاف (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 250,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      {
        id: 's1_start_sh',
        name: 'زر التشغيل (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 370,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'km1_aux_sh',
        name: 'نقطة التعشيق الذاتي (KM1 NO 13-14)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 220,
        y: 370,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'km1_coil_sh',
        name: 'كونتاكتور التعشيق (KM1 Coil)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 60,
        y: 500,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_sh',
        name: 'مصباح استمرارية العمل (H1)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 220,
        y: 500,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'p_neutral_sh',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 60,
        y: 630,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_sh',
        name: 'محرك حثي (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 440,
        y: 280,
        width: 180,
        height: 200,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'wsh0', fromComponentId: 'p_phase_sh', fromTerminalId: 'L1', toComponentId: 'q1_mcb_sh', toTerminalId: '1' },
      { id: 'wsh1', fromComponentId: 'q1_mcb_sh', fromTerminalId: '2', toComponentId: 's0_stop_sh', toTerminalId: '1' },
      { id: 'wsh2', fromComponentId: 's0_stop_sh', fromTerminalId: '2', toComponentId: 's1_start_sh', toTerminalId: '3' },
      { id: 'wsh3', fromComponentId: 's0_stop_sh', fromTerminalId: '2', toComponentId: 'km1_aux_sh', toTerminalId: '13' },
      { id: 'wsh4', fromComponentId: 's1_start_sh', fromTerminalId: '4', toComponentId: 'km1_coil_sh', toTerminalId: 'A1' },
      { id: 'wsh5', fromComponentId: 'km1_aux_sh', fromTerminalId: '14', toComponentId: 'km1_coil_sh', toTerminalId: 'A1' },
      { id: 'wsh6', fromComponentId: 'km1_coil_sh', fromTerminalId: 'A1', toComponentId: 'lamp_sh', toTerminalId: 'X1' },
      { id: 'wsh7', fromComponentId: 'km1_coil_sh', fromTerminalId: 'A2', toComponentId: 'lamp_sh', toTerminalId: 'X2' },
      { id: 'wsh8', fromComponentId: 'km1_coil_sh', fromTerminalId: 'A2', toComponentId: 'p_neutral_sh', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 3. Interlocking بين محركين (التشابك الكهربائي المتبادل)
  // =========================================================================
  {
    id: 'interlocking',
    titleAr: 'Interlocking بين محركين (التشابك الكهربائي المتبادل)',
    titleEn: 'Electrical Interlock Between Two Motors and Contactors',
    category: 'التحكم المتقدم',
    descriptionAr: 'منع تشغيل المحرك الثاني ما دام المحرك الأول دائراً والعكس صحيح، باستخدام ملامس مغلق طبيعياً (KM1 NC) في مسار KM2 وملامس (KM2 NC) في مسار KM1، مع محركين مستقلين M1 و M2 لمنع التضارب في خطوط الإنتاج.',
    theoryAr: [
      '1. عند تشغيل المحرك الأول KM1: تفتح نقطة تلامسه المساعدة NC (21-22) الموضوعة في مسار المحرك الثاني.',
      '2. محاولة تشغيل المحرك الثاني S2 أثناء دوران الأول لن تؤدي لأي استجابة، لحماية المنظومة.',
      '3. بالمثل، عند تشغيل المحرك الثاني KM2 تفتح نقطته NC في مسار المحرك الأول لمنع تشغيله.',
      '4. لتغيير المحرك الشغال، يجب الضغط على زر الإيقاف العام S0 أولاً ثم اختيار المحرك المراد.'
    ],
    components: [
      {
        id: 'p_phase_int',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'q1_mcb_int',
        name: 'قاطع آلي (MCB C16)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 'f1_ov_int',
        name: 'مرحل حراري عام (F1 95-96)',
        tag: 'F1',
        type: 'thermal_overload',
        x: 60,
        y: 230,
        width: 140,
        height: 70,
        closed: true,
        isTripped: false,
        terminals: [{ id: '95', name: '95', x: 70, y: 0 }, { id: '96', name: '96', x: 70, y: 70 }]
      },
      {
        id: 's0_stop_int',
        name: 'زر الإيقاف العام (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 330,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      // Channel 1: Motor 1 (KM1)
      {
        id: 's1_m1',
        name: 'زر تشغيل المحرك 1 (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 440,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'km1_latch_int',
        name: 'تعشيق KM1 (NO)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 200,
        y: 440,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'km2_nc_int',
        name: 'قفل KM2 المغلق (NC 21-22)',
        tag: 'KM2-NC',
        linkedTag: 'KM2',
        type: 'contactor_contact_nc',
        x: 60,
        y: 550,
        width: 140,
        height: 70,
        closed: true,
        terminals: [{ id: '21', name: '21', x: 70, y: 0 }, { id: '22', name: '22', x: 70, y: 70 }]
      },
      {
        id: 'km1_coil_int',
        name: 'كونتاكتور المحرك 1 (KM1 Coil)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 60,
        y: 660,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_m1',
        name: 'بيان المحرك 1 (H1)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 200,
        y: 660,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      // Channel 2: Motor 2 (KM2)
      {
        id: 's2_m2',
        name: 'زر تشغيل المحرك 2 (S2 - NO)',
        tag: 'S2',
        type: 'pushbutton_no',
        x: 360,
        y: 440,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'km2_latch_int',
        name: 'تعشيق KM2 (NO)',
        tag: 'KM2-NO',
        linkedTag: 'KM2',
        type: 'contactor_contact_no',
        x: 500,
        y: 440,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'km1_nc_int',
        name: 'قفل KM1 المغلق (NC 21-22)',
        tag: 'KM1-NC',
        linkedTag: 'KM1',
        type: 'contactor_contact_nc',
        x: 360,
        y: 550,
        width: 140,
        height: 70,
        closed: true,
        terminals: [{ id: '21', name: '21', x: 70, y: 0 }, { id: '22', name: '22', x: 70, y: 70 }]
      },
      {
        id: 'km2_coil_int',
        name: 'كونتاكتور المحرك 2 (KM2 Coil)',
        tag: 'KM2',
        type: 'contactor_coil',
        x: 360,
        y: 660,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_m2',
        name: 'بيان المحرك 2 (H2)',
        tag: 'H2',
        type: 'pilot_lamp',
        color: 'cyan',
        x: 500,
        y: 660,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'p_neutral_int',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 200,
        y: 780,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      // Dual Motors
      {
        id: 'motor_int_1',
        name: 'المحرك الأول (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 680,
        y: 200,
        width: 180,
        height: 190,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      },
      {
        id: 'motor_int_2',
        name: 'المحرك الثاني (M2)',
        tag: 'M2',
        type: 'motor_3phase',
        x: 680,
        y: 470,
        width: 180,
        height: 190,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'wi0', fromComponentId: 'p_phase_int', fromTerminalId: 'L1', toComponentId: 'q1_mcb_int', toTerminalId: '1' },
      { id: 'wi1', fromComponentId: 'q1_mcb_int', fromTerminalId: '2', toComponentId: 'f1_ov_int', toTerminalId: '95' },
      { id: 'wi2', fromComponentId: 'f1_ov_int', fromTerminalId: '96', toComponentId: 's0_stop_int', toTerminalId: '1' },
      // Power distribution after stop button
      { id: 'wi3', fromComponentId: 's0_stop_int', fromTerminalId: '2', toComponentId: 's1_m1', toTerminalId: '3' },
      { id: 'wi4', fromComponentId: 's0_stop_int', fromTerminalId: '2', toComponentId: 'km1_latch_int', toTerminalId: '13' },
      { id: 'wi5', fromComponentId: 's0_stop_int', fromTerminalId: '2', toComponentId: 's2_m2', toTerminalId: '3' },
      { id: 'wi6', fromComponentId: 's0_stop_int', fromTerminalId: '2', toComponentId: 'km2_latch_int', toTerminalId: '13' },
      // Motor 1 path through KM2 NC
      { id: 'wi7', fromComponentId: 's1_m1', fromTerminalId: '4', toComponentId: 'km2_nc_int', toTerminalId: '21' },
      { id: 'wi8', fromComponentId: 'km1_latch_int', fromTerminalId: '14', toComponentId: 'km2_nc_int', toTerminalId: '21' },
      { id: 'wi9', fromComponentId: 'km2_nc_int', fromTerminalId: '22', toComponentId: 'km1_coil_int', toTerminalId: 'A1' },
      { id: 'wi10', fromComponentId: 'km1_coil_int', fromTerminalId: 'A1', toComponentId: 'lamp_m1', toTerminalId: 'X1' },
      { id: 'wi11', fromComponentId: 'km1_coil_int', fromTerminalId: 'A2', toComponentId: 'lamp_m1', toTerminalId: 'X2' },
      // Motor 2 path through KM1 NC
      { id: 'wi12', fromComponentId: 's2_m2', fromTerminalId: '4', toComponentId: 'km1_nc_int', toTerminalId: '21' },
      { id: 'wi13', fromComponentId: 'km2_latch_int', fromTerminalId: '14', toComponentId: 'km1_nc_int', toTerminalId: '21' },
      { id: 'wi14', fromComponentId: 'km1_nc_int', fromTerminalId: '22', toComponentId: 'km2_coil_int', toTerminalId: 'A1' },
      { id: 'wi15', fromComponentId: 'km2_coil_int', fromTerminalId: 'A1', toComponentId: 'lamp_m2', toTerminalId: 'X1' },
      { id: 'wi16', fromComponentId: 'km2_coil_int', fromTerminalId: 'A2', toComponentId: 'lamp_m2', toTerminalId: 'X2' },
      // Returns to neutral
      { id: 'wi17', fromComponentId: 'km1_coil_int', fromTerminalId: 'A2', toComponentId: 'p_neutral_int', toTerminalId: 'N' },
      { id: 'wi18', fromComponentId: 'km2_coil_int', fromTerminalId: 'A2', toComponentId: 'p_neutral_int', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 4. Forward / Reverse (عكس اتجاه دوران المحرك مع كونتاكتورين كاملين)
  // =========================================================================
  {
    id: 'forward_reverse',
    titleAr: 'Forward / Reverse (تشغيل محرك في اتجاهين مع قفل كهربائي)',
    titleEn: 'Forward and Reverse Motor Starter with Reversing Contactors',
    category: 'التحكم المتقدم',
    descriptionAr: 'التحكم في دوران محرك ثلاثي الطور للأمام (Forward - KM1) أو للخلف (Reverse - KM2) مع قفل متبادل لمنع تشغيل الكونتاكتورين معاً، ومصباح أخضر للأمام وبرتقالي للخلف.',
    theoryAr: [
      '1. عند الضغط على S1: يعمل كونتاكتور الأمام KM1 ويدور المحرك باتجاه عقارب الساعة (CW).',
      '2. في الوقت نفسه: تفتح النقطة المساعدة KM1 NC (21-22) الموضوعة في مسار تغذية KM2، لمنع تشغيله نهائياً.',
      '3. إذا حاول المشغّل الضغط على زر الرجوع S2 أثناء دوران المحرك، فلن يستجيب الكونتاكتور KM2 بفضل القفل الكهربائي المتبادل.',
      '4. لتغيير الاتجاه، يجب الضغط على زر الإيقاف S0 أولاً ثم الضغط على زر الرجوع S2 لتشغيل KM2 (CCW).'
    ],
    components: [
      {
        id: 'p_phase_fr',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'q1_mcb_fr',
        name: 'قاطع آلي (MCB C16)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 'f1_ov_fr',
        name: 'مرحل حراري (F1 95-96)',
        tag: 'F1',
        type: 'thermal_overload',
        x: 60,
        y: 230,
        width: 140,
        height: 70,
        closed: true,
        isTripped: false,
        terminals: [{ id: '95', name: '95', x: 70, y: 0 }, { id: '96', name: '96', x: 70, y: 70 }]
      },
      {
        id: 's0_stop_fr',
        name: 'زر الإيقاف العام (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 330,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      // Forward Column (KM1)
      {
        id: 's1_fwd_fr',
        name: 'زر تشغيل الأمام (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 440,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'km1_latch_fr',
        name: 'تعشيق KM1 (NO 13-14)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 200,
        y: 440,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'km2_nc_fr',
        name: 'قفل كهربائي متبادل (KM2 NC)',
        tag: 'KM2-NC',
        linkedTag: 'KM2',
        type: 'contactor_contact_nc',
        x: 60,
        y: 550,
        width: 140,
        height: 70,
        closed: true,
        terminals: [{ id: '21', name: '21', x: 70, y: 0 }, { id: '22', name: '22', x: 70, y: 70 }]
      },
      {
        id: 'km1_coil_fr',
        name: 'كونتاكتور رقم 1 للأمام (KM1)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 60,
        y: 660,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_fwd_fr',
        name: 'بيان الأمام (H1 - أخضر)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 200,
        y: 660,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      // Reverse Column (KM2 - Contactor #2!)
      {
        id: 's2_rev_fr',
        name: 'زر تشغيل الخلف (S2 - NO)',
        tag: 'S2',
        type: 'pushbutton_no',
        x: 360,
        y: 440,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'km2_latch_fr',
        name: 'تعشيق KM2 (NO 13-14)',
        tag: 'KM2-NO',
        linkedTag: 'KM2',
        type: 'contactor_contact_no',
        x: 500,
        y: 440,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'km1_nc_fr',
        name: 'قفل كهربائي متبادل (KM1 NC)',
        tag: 'KM1-NC',
        linkedTag: 'KM1',
        type: 'contactor_contact_nc',
        x: 360,
        y: 550,
        width: 140,
        height: 70,
        closed: true,
        terminals: [{ id: '21', name: '21', x: 70, y: 0 }, { id: '22', name: '22', x: 70, y: 70 }]
      },
      {
        id: 'km2_coil_fr',
        name: 'كونتاكتور رقم 2 للخلف (KM2)',
        tag: 'KM2',
        type: 'contactor_coil',
        x: 360,
        y: 660,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_rev_fr',
        name: 'بيان الخلف (H2 - برتقالي)',
        tag: 'H2',
        type: 'pilot_lamp',
        color: 'amber',
        x: 500,
        y: 660,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'p_neutral_fr',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 200,
        y: 780,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_fr',
        name: 'محرك عكس الحركة (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 680,
        y: 350,
        width: 180,
        height: 200,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'wfr0', fromComponentId: 'p_phase_fr', fromTerminalId: 'L1', toComponentId: 'q1_mcb_fr', toTerminalId: '1' },
      { id: 'wfr1', fromComponentId: 'q1_mcb_fr', fromTerminalId: '2', toComponentId: 'f1_ov_fr', toTerminalId: '95' },
      { id: 'wfr2', fromComponentId: 'f1_ov_fr', fromTerminalId: '96', toComponentId: 's0_stop_fr', toTerminalId: '1' },
      // Distribute after stop button
      { id: 'wfr3', fromComponentId: 's0_stop_fr', fromTerminalId: '2', toComponentId: 's1_fwd_fr', toTerminalId: '3' },
      { id: 'wfr4', fromComponentId: 's0_stop_fr', fromTerminalId: '2', toComponentId: 'km1_latch_fr', toTerminalId: '13' },
      { id: 'wfr5', fromComponentId: 's0_stop_fr', fromTerminalId: '2', toComponentId: 's2_rev_fr', toTerminalId: '3' },
      { id: 'wfr6', fromComponentId: 's0_stop_fr', fromTerminalId: '2', toComponentId: 'km2_latch_fr', toTerminalId: '13' },
      // Forward path through KM2 NC interlock
      { id: 'wfr7', fromComponentId: 's1_fwd_fr', fromTerminalId: '4', toComponentId: 'km2_nc_fr', toTerminalId: '21' },
      { id: 'wfr8', fromComponentId: 'km1_latch_fr', fromTerminalId: '14', toComponentId: 'km2_nc_fr', toTerminalId: '21' },
      { id: 'wfr9', fromComponentId: 'km2_nc_fr', fromTerminalId: '22', toComponentId: 'km1_coil_fr', toTerminalId: 'A1' },
      { id: 'wfr10', fromComponentId: 'km1_coil_fr', fromTerminalId: 'A1', toComponentId: 'lamp_fwd_fr', toTerminalId: 'X1' },
      { id: 'wfr11', fromComponentId: 'km1_coil_fr', fromTerminalId: 'A2', toComponentId: 'lamp_fwd_fr', toTerminalId: 'X2' },
      // Reverse path through KM1 NC interlock
      { id: 'wfr12', fromComponentId: 's2_rev_fr', fromTerminalId: '4', toComponentId: 'km1_nc_fr', toTerminalId: '21' },
      { id: 'wfr13', fromComponentId: 'km2_latch_fr', fromTerminalId: '14', toComponentId: 'km1_nc_fr', toTerminalId: '21' },
      { id: 'wfr14', fromComponentId: 'km1_nc_fr', fromTerminalId: '22', toComponentId: 'km2_coil_fr', toTerminalId: 'A1' },
      { id: 'wfr15', fromComponentId: 'km2_coil_fr', fromTerminalId: 'A1', toComponentId: 'lamp_rev_fr', toTerminalId: 'X1' },
      { id: 'wfr16', fromComponentId: 'km2_coil_fr', fromTerminalId: 'A2', toComponentId: 'lamp_rev_fr', toTerminalId: 'X2' },
      // Neutral returns
      { id: 'wfr17', fromComponentId: 'km1_coil_fr', fromTerminalId: 'A2', toComponentId: 'p_neutral_fr', toTerminalId: 'N' },
      { id: 'wfr18', fromComponentId: 'km2_coil_fr', fromTerminalId: 'A2', toComponentId: 'p_neutral_fr', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 5. تشغيل محرك بمؤقت TON (On-Delay Motor Timer Starter)
  // =========================================================================
  {
    id: 'timer_ton_sequence',
    titleAr: 'تشغيل محرك بمؤقت TON (On-Delay Motor Timer Starter)',
    titleEn: 'On-Delay Timer (TON) Controlled Motor Starting',
    category: 'المؤقتات والأتمتة',
    descriptionAr: 'تأخير إقلاع المحرك لمهلة زمنية محددة بعد الضغط على زر التشغيل S1: ريليه مسك KA1 يبدأ المؤقت الزمني KT1 (TON)، وبعد انتهاء العد يغلق ملامس KT1 ويغذي كونتاكتور KM1 ليبدأ المحرك بالدوران.',
    theoryAr: [
      '1. عند الضغط على زر S1: يتغذى ريليه الاستمرارية KA1 ويمسك نفسه عبر نقطته المساعدة 13-14.',
      '2. في الوقت نفسه: تصل التغذية إلى مؤقت التأخير الزمني KT1 (TON) ويبدأ العداد الزمني (5 ثوانٍ).',
      '3. أثناء فترة العد: يظل ملامس المؤقت مفتوحاً ويبقى المحرك متوقفاً.',
      '4. فور انقضاء المهلة الزمنية: يغلق ملامس المؤقت 17-18 وتصل التغذية لكونتاكتور KM1 ليبدأ دوران المحرك.',
      '5. الضغط على زر S0 يقطع التغذية ويعيد تصفير المؤقت وإيقاف المحرك.'
    ],
    components: [
      {
        id: 'pt_phase',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'qt_mcb',
        name: 'قاطع آلي (MCB C16)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 'st_stop',
        name: 'زر الإيقاف (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 240,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      {
        id: 'st_start',
        name: 'زر التشغيل (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 350,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'ka1_latch',
        name: 'تعشيق الريليه (KA1 NO)',
        tag: 'KA1-NO',
        linkedTag: 'KA1',
        type: 'contactor_contact_no',
        x: 200,
        y: 350,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'ka1_relay',
        name: 'ريليه وسيط (KA1 Relay)',
        tag: 'KA1',
        type: 'contactor_coil',
        x: 60,
        y: 470,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'kt1_timer',
        name: 'المؤقت الزمني (KT1 - TON 5s)',
        tag: 'KT1',
        type: 'timer_coil',
        timerSeconds: 5,
        timerElapsed: 0,
        x: 200,
        y: 470,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'kt1_contact_no',
        name: 'ملامس المؤقت (KT1 NO 17-18)',
        tag: 'KT1-NO',
        linkedTag: 'KT1',
        type: 'timer_contact_no',
        x: 360,
        y: 350,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '17', name: '17', x: 65, y: 0 }, { id: '18', name: '18', x: 65, y: 70 }]
      },
      {
        id: 'km1_timer_coil',
        name: 'كونتاكتور المحرك (KM1)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 360,
        y: 470,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_timer_run',
        name: 'بيان تشغيل المحرك (H1)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 500,
        y: 470,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'pt_neutral',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 200,
        y: 600,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_timer',
        name: 'المحرك الحثي (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 580,
        y: 200,
        width: 180,
        height: 200,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'wt0', fromComponentId: 'pt_phase', fromTerminalId: 'L1', toComponentId: 'qt_mcb', toTerminalId: '1' },
      { id: 'wt1', fromComponentId: 'qt_mcb', fromTerminalId: '2', toComponentId: 'st_stop', toTerminalId: '1' },
      { id: 'wt2', fromComponentId: 'st_stop', fromTerminalId: '2', toComponentId: 'st_start', toTerminalId: '3' },
      { id: 'wt3', fromComponentId: 'st_stop', fromTerminalId: '2', toComponentId: 'ka1_latch', toTerminalId: '13' },
      { id: 'wt4', fromComponentId: 'st_stop', fromTerminalId: '2', toComponentId: 'kt1_contact_no', toTerminalId: '17' },
      // Latch coil branch
      { id: 'wt5', fromComponentId: 'st_start', fromTerminalId: '4', toComponentId: 'ka1_relay', toTerminalId: 'A1' },
      { id: 'wt6', fromComponentId: 'ka1_latch', fromTerminalId: '14', toComponentId: 'ka1_relay', toTerminalId: 'A1' },
      // Relay energizes timer
      { id: 'wt7', fromComponentId: 'ka1_relay', fromTerminalId: 'A1', toComponentId: 'kt1_timer', toTerminalId: 'A1' },
      // Timer NO contact energizes motor contactor KM1
      { id: 'wt8', fromComponentId: 'kt1_contact_no', fromTerminalId: '18', toComponentId: 'km1_timer_coil', toTerminalId: 'A1' },
      { id: 'wt9', fromComponentId: 'km1_timer_coil', fromTerminalId: 'A1', toComponentId: 'lamp_timer_run', toTerminalId: 'X1' },
      { id: 'wt10', fromComponentId: 'km1_timer_coil', fromTerminalId: 'A2', toComponentId: 'lamp_timer_run', toTerminalId: 'X2' },
      // Neutral returns
      { id: 'wt11', fromComponentId: 'ka1_relay', fromTerminalId: 'A2', toComponentId: 'pt_neutral', toTerminalId: 'N' },
      { id: 'wt12', fromComponentId: 'kt1_timer', fromTerminalId: 'A2', toComponentId: 'pt_neutral', toTerminalId: 'N' },
      { id: 'wt13', fromComponentId: 'km1_timer_coil', fromTerminalId: 'A2', toComponentId: 'pt_neutral', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 6. تشغيل نجمة/مثلث Star-Delta
  // =========================================================================
  {
    id: 'star_delta',
    titleAr: 'تشغيل نجمة/مثلث Star-Delta (Automatic Star-Delta Starter)',
    titleEn: 'Automatic Star-Delta Motor Starter with Transition Timer',
    category: 'التحكم المتقدم',
    descriptionAr: 'إقلاع المحرك أولاً على النجمة (KM_STAR) لتقليل تيار البدء العالي، ثم بعد انقضاء زمن المؤقت KT1 يسقط كونتاكتور النجمة ويعمل كونتاكتور المثلث (KM_DELTA) ليعمل المحرك بكامل عزم وسرعة الدوران.',
    theoryAr: [
      '1. تيار البدء في المحركات الحثية الكبيرة قد يصل إلى 6-8 أضعاف التيار الاسمي.',
      '2. يتم توصيل المحرك أولاً بطريقة النجمة (Star) مما يقلل الجهد المطبق على كل طور إلى 58% والتيار إلى الثلث.',
      '3. بعد تسارع المحرك (4 ثوانٍ)، يفصل مؤقت الانتقال KT1 كونتاكتور النجمة KM_STAR ويوصل كونتاكتور المثلث KM_DELTA.',
      '4. يدور المحرك في وضع النجمة بسرعة 750 RPM ثم ينتقل إلى السرعة الكاملة 1450 RPM في وضع المثلث.'
    ],
    components: [
      {
        id: 'ps_phase',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'qs_mcb',
        name: 'قاطع آلي (MCB C25)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 'fs_overload',
        name: 'مرحل حراري (F1 95-96)',
        tag: 'F1',
        type: 'thermal_overload',
        x: 60,
        y: 230,
        width: 140,
        height: 70,
        closed: true,
        isTripped: false,
        terminals: [{ id: '95', name: '95', x: 70, y: 0 }, { id: '96', name: '96', x: 70, y: 70 }]
      },
      {
        id: 'ss_stop',
        name: 'زر الإيقاف (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 330,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      {
        id: 'ss_start',
        name: 'زر التشغيل (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 440,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'kms_latch',
        name: 'تعشيق KM1 (NO)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 200,
        y: 440,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'km1_main_coil',
        name: 'كونتاكتور الخط الرئيسي (KM1)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 60,
        y: 560,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'kts_timer',
        name: 'مؤقت التحويل نجمة/مثلث (KT1 4s)',
        tag: 'KT1',
        type: 'timer_coil',
        timerSeconds: 4,
        timerElapsed: 0,
        x: 200,
        y: 560,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'km_star_coil',
        name: 'كونتاكتور النجمة (KM_STAR)',
        tag: 'KM_STAR',
        type: 'contactor_coil',
        x: 360,
        y: 560,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'km_delta_coil',
        name: 'كونتاكتور المثلث (KM_DELTA)',
        tag: 'KM_DELTA',
        type: 'contactor_coil',
        x: 520,
        y: 560,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'ps_neutral',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 200,
        y: 700,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_sd',
        name: 'محرك نجمة / مثلث (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 680,
        y: 280,
        width: 180,
        height: 200,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        motorMode: 'STAR',
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'ws0', fromComponentId: 'ps_phase', fromTerminalId: 'L1', toComponentId: 'qs_mcb', toTerminalId: '1' },
      { id: 'ws1', fromComponentId: 'qs_mcb', fromTerminalId: '2', toComponentId: 'fs_overload', toTerminalId: '95' },
      { id: 'ws2', fromComponentId: 'fs_overload', fromTerminalId: '96', toComponentId: 'ss_stop', toTerminalId: '1' },
      { id: 'ws3', fromComponentId: 'ss_stop', fromTerminalId: '2', toComponentId: 'ss_start', toTerminalId: '3' },
      { id: 'ws4', fromComponentId: 'ss_stop', fromTerminalId: '2', toComponentId: 'kms_latch', toTerminalId: '13' },
      // Latch KM1
      { id: 'ws5', fromComponentId: 'ss_start', fromTerminalId: '4', toComponentId: 'km1_main_coil', toTerminalId: 'A1' },
      { id: 'ws6', fromComponentId: 'kms_latch', fromTerminalId: '14', toComponentId: 'km1_main_coil', toTerminalId: 'A1' },
      // KM1 activates timer and initial star coil
      { id: 'ws7', fromComponentId: 'km1_main_coil', fromTerminalId: 'A1', toComponentId: 'kts_timer', toTerminalId: 'A1' },
      { id: 'ws8', fromComponentId: 'km1_main_coil', fromTerminalId: 'A1', toComponentId: 'km_star_coil', toTerminalId: 'A1' },
      // Returns to neutral
      { id: 'ws9', fromComponentId: 'km1_main_coil', fromTerminalId: 'A2', toComponentId: 'ps_neutral', toTerminalId: 'N' },
      { id: 'ws10', fromComponentId: 'kts_timer', fromTerminalId: 'A2', toComponentId: 'ps_neutral', toTerminalId: 'N' },
      { id: 'ws11', fromComponentId: 'km_star_coil', fromTerminalId: 'A2', toComponentId: 'ps_neutral', toTerminalId: 'N' },
      { id: 'ws12', fromComponentId: 'km_delta_coil', fromTerminalId: 'A2', toComponentId: 'ps_neutral', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 7. تشغيل محركين بالتتابع (Sequential Starting of Two Motors)
  // =========================================================================
  {
    id: 'two_motors_sequential',
    titleAr: 'تشغيل محركين بالتتابع (Sequential Starting of Two Motors)',
    titleEn: 'Automatic Sequential Starting of Two 3-Phase Motors',
    category: 'الأتمتة والتتابع',
    descriptionAr: 'تشغيل المحرك الأول M1 بواسطة زر S1، مما يبدأ مؤقت التتابع KT1، وبعد انقضاء المهلة (3 ثوانٍ) يعمل المحرك الثاني M2 تلقائياً، مع إيقاف عام للمنظومة عبر S0.',
    theoryAr: [
      '1. في سيور النقل والكسارات، يجب أن يدور السير المستلم (M1) أولاً قبل السير المغذي (M2) لتجنب تراكم المواد.',
      '2. عند الضغط على S1: يعمل كونتاكتور KM1 ويدور المحرك الأول ويبدأ المؤقت KT1.',
      '3. بعد انقضاء زمن المؤقت المضبوط: يغلق ملامس KT1 المغذي لملف KM2، فيبدأ المحرك الثاني بالدوران تلقائياً.',
      '4. في حال إيقاف المحرك الأول أو حدوث عطل فيه، يتوقف المحرك الثاني فوراً لمنع الحوادث.'
    ],
    components: [
      {
        id: 'p2_phase',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'q2_mcb',
        name: 'قاطع آلي (MCB C20)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 's2_stop_seq',
        name: 'زر الإيقاف العام (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 240,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      {
        id: 's2_start_seq',
        name: 'زر تشغيل المنظومة (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 350,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'km1_latch_seq',
        name: 'تعشيق KM1 (NO)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 200,
        y: 350,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'km1_coil_seq',
        name: 'كونتاكتور المحرك 1 (KM1)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 60,
        y: 480,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'kt2_timer',
        name: 'مؤقت التتابع (KT1 - 3s)',
        tag: 'KT1',
        type: 'timer_coil',
        timerSeconds: 3,
        timerElapsed: 0,
        x: 200,
        y: 480,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'kt2_contact_no',
        name: 'ملامس المؤقت (KT1 NO 17-18)',
        tag: 'KT1-NO',
        linkedTag: 'KT1',
        type: 'timer_contact_no',
        x: 360,
        y: 350,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '17', name: '17', x: 65, y: 0 }, { id: '18', name: '18', x: 65, y: 70 }]
      },
      {
        id: 'km2_coil_seq',
        name: 'كونتاكتور المحرك 2 (KM2)',
        tag: 'KM2',
        type: 'contactor_coil',
        x: 360,
        y: 480,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'p2_neutral',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 200,
        y: 620,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_seq_1',
        name: 'المحرك الأول المستلم (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 560,
        y: 180,
        width: 180,
        height: 190,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      },
      {
        id: 'motor_seq_2',
        name: 'المحرك الثاني المغذي (M2)',
        tag: 'M2',
        type: 'motor_3phase',
        x: 560,
        y: 440,
        width: 180,
        height: 190,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'w20', fromComponentId: 'p2_phase', fromTerminalId: 'L1', toComponentId: 'q2_mcb', toTerminalId: '1' },
      { id: 'w21', fromComponentId: 'q2_mcb', fromTerminalId: '2', toComponentId: 's2_stop_seq', toTerminalId: '1' },
      { id: 'w22', fromComponentId: 's2_stop_seq', fromTerminalId: '2', toComponentId: 's2_start_seq', toTerminalId: '3' },
      { id: 'w23', fromComponentId: 's2_stop_seq', fromTerminalId: '2', toComponentId: 'km1_latch_seq', toTerminalId: '13' },
      { id: 'w24', fromComponentId: 's2_stop_seq', fromTerminalId: '2', toComponentId: 'kt2_contact_no', toTerminalId: '17' },
      // Latch KM1
      { id: 'w25', fromComponentId: 's2_start_seq', fromTerminalId: '4', toComponentId: 'km1_coil_seq', toTerminalId: 'A1' },
      { id: 'w26', fromComponentId: 'km1_latch_seq', fromTerminalId: '14', toComponentId: 'km1_coil_seq', toTerminalId: 'A1' },
      // KM1 powers timer KT1
      { id: 'w27', fromComponentId: 'km1_coil_seq', fromTerminalId: 'A1', toComponentId: 'kt2_timer', toTerminalId: 'A1' },
      // Timer powers KM2
      { id: 'w28', fromComponentId: 'kt2_contact_no', fromTerminalId: '18', toComponentId: 'km2_coil_seq', toTerminalId: 'A1' },
      // Neutral returns
      { id: 'w29', fromComponentId: 'km1_coil_seq', fromTerminalId: 'A2', toComponentId: 'p2_neutral', toTerminalId: 'N' },
      { id: 'w30', fromComponentId: 'kt2_timer', fromTerminalId: 'A2', toComponentId: 'p2_neutral', toTerminalId: 'N' },
      { id: 'w31', fromComponentId: 'km2_coil_seq', fromTerminalId: 'A2', toComponentId: 'p2_neutral', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 8. التحكم في مصباح بواسطة Timer
  // =========================================================================
  {
    id: 'timer_lamp_blink',
    titleAr: 'التحكم في مصباح بواسطة Timer (Timer Controlled Indicator Light)',
    titleEn: 'Timer Pulse and Pilot Indicator Lamp Control',
    category: 'المؤقتات والأتمتة',
    descriptionAr: 'التحكم في مصباح بيان H1 بواسطة مؤقت زمني: عند الضغط على زر التشغيل S1 يبدأ المؤقت KT1 بالعد، ليعطي إشارة ضوئية منبهة بعد انتهاء المهلة الزمنية المحددة قبل تشغيل المعدة.',
    theoryAr: [
      '1. في المصانع، يُستخدم إطلاق تنبيه ضوئي أو صوتي مؤقت قبل بدء دوران السيور والماكينات لضمان سلامة العمال.',
      '2. الضغط على زر التشغيل S1 ينشط ريليه المسك KA1 ويبدأ المؤقت الزمني KT1.',
      '3. بعد انقضاء زمن المؤقت المضبوط (3 ثوانٍ)، يغلق ملامس KT1 ويضيء مصباح البيان الأخضر H1.',
      '4. مصباح H2 يعمل كإشارة استعداد أولية أثناء فترة الانتظار.'
    ],
    components: [
      {
        id: 'pl_phase',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'ql_mcb',
        name: 'قاطع آلي (MCB C10)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 'sl_stop',
        name: 'زر الإيقاف (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 240,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      {
        id: 'sl_start',
        name: 'زر التشغيل (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 350,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'kl_latch',
        name: 'تعشيق KA1 (NO)',
        tag: 'KA1-NO',
        linkedTag: 'KA1',
        type: 'contactor_contact_no',
        x: 200,
        y: 350,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'kl_relay',
        name: 'ريليه التثبيت (KA1)',
        tag: 'KA1',
        type: 'contactor_coil',
        x: 60,
        y: 480,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'kt_timer',
        name: 'المؤقت الزمني (KT1 3s)',
        tag: 'KT1',
        type: 'timer_coil',
        timerSeconds: 3,
        timerElapsed: 0,
        x: 200,
        y: 480,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'kt_contact',
        name: 'ملامس المؤقت (KT1 NO)',
        tag: 'KT1-NO',
        linkedTag: 'KT1',
        type: 'timer_contact_no',
        x: 360,
        y: 350,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '17', name: '17', x: 65, y: 0 }, { id: '18', name: '18', x: 65, y: 70 }]
      },
      {
        id: 'lamp_timed',
        name: 'مصباح الإشارة المؤجل (H1 - أخضر)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 360,
        y: 480,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'lamp_ready',
        name: 'مصباح الاستعداد (H2 - برتقالي)',
        tag: 'H2',
        type: 'pilot_lamp',
        color: 'amber',
        x: 500,
        y: 480,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'pl_neutral',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 200,
        y: 620,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      }
    ],
    wires: [
      { id: 'wl0', fromComponentId: 'pl_phase', fromTerminalId: 'L1', toComponentId: 'ql_mcb', toTerminalId: '1' },
      { id: 'wl1', fromComponentId: 'ql_mcb', fromTerminalId: '2', toComponentId: 'sl_stop', toTerminalId: '1' },
      { id: 'wl2', fromComponentId: 'sl_stop', fromTerminalId: '2', toComponentId: 'sl_start', toTerminalId: '3' },
      { id: 'wl3', fromComponentId: 'sl_stop', fromTerminalId: '2', toComponentId: 'kl_latch', toTerminalId: '13' },
      { id: 'wl4', fromComponentId: 'sl_stop', fromTerminalId: '2', toComponentId: 'kt_contact', toTerminalId: '17' },
      // KA1 latch and timer
      { id: 'wl5', fromComponentId: 'sl_start', fromTerminalId: '4', toComponentId: 'kl_relay', toTerminalId: 'A1' },
      { id: 'wl6', fromComponentId: 'kl_latch', fromTerminalId: '14', toComponentId: 'kl_relay', toTerminalId: 'A1' },
      { id: 'wl7', fromComponentId: 'kl_relay', fromTerminalId: 'A1', toComponentId: 'kt_timer', toTerminalId: 'A1' },
      { id: 'wl8', fromComponentId: 'kl_relay', fromTerminalId: 'A1', toComponentId: 'lamp_ready', toTerminalId: 'X1' },
      // Timed contact powers H1
      { id: 'wl9', fromComponentId: 'kt_contact', fromTerminalId: '18', toComponentId: 'lamp_timed', toTerminalId: 'X1' },
      // Neutral returns
      { id: 'wl10', fromComponentId: 'kl_relay', fromTerminalId: 'A2', toComponentId: 'pl_neutral', toTerminalId: 'N' },
      { id: 'wl11', fromComponentId: 'kt_timer', fromTerminalId: 'A2', toComponentId: 'pl_neutral', toTerminalId: 'N' },
      { id: 'wl12', fromComponentId: 'lamp_ready', fromTerminalId: 'X2', toComponentId: 'pl_neutral', toTerminalId: 'N' },
      { id: 'wl13', fromComponentId: 'lamp_timed', fromTerminalId: 'X2', toComponentId: 'pl_neutral', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 9. دائرة حماية حرارية (Thermal Overload Protection with Fault Alarm)
  // =========================================================================
  {
    id: 'thermal_overload_protection',
    titleAr: 'دائرة حماية حرارية (Thermal Overload Protection with Fault Alarm)',
    titleEn: 'Thermal Overload Protection Circuit with NC Cutoff and NO Fault Alarm',
    category: 'الحماية الصناعية',
    descriptionAr: 'حماية المحرك من ارتفاع الحمل والحرارة الزائدة: النقطة 95-96 المغلقة طبيعياً تفصل التغذية عن ملف الكونتاكتور KM1 وتوقف المحرك فوراً، والنقطة 97-98 المفتوحة طبيعياً تغلق لتشعل مصباح إنذار العطل الأحمر H2.',
    theoryAr: [
      '1. في الظروف العادية: نقطة الأوفرلود 95-96 مغلقة طبيعياً (NC) وتمرر التيار لدائرة التحكم.',
      '2. عند سحب تيار أعلى من التيار المقنن لفترة زمنية محددة: تسخن الشرائح ثنائية المعدن (Bimetal) داخل الأوفرلود F1.',
      '3. يؤدي ذلك إلى فصل النقطة 95-96 فوراً فينقطع التيار عن الكونتاكتور KM1 ويتوقف المحرك لحمايته من الاحتراق.',
      '4. في نفس اللحظة: تغلق النقطة المفتوحة 97-98 (NO) فيضيء مصباح الإنذار الأحمر H2 لتحذير الفني بوجود عطل.',
      '5. لا يمكن تشغيل المحرك مجدداً إلا بعد تبريد الجهاز والضغط يدوياً على زر إعادة الضبط Reset في الأوفرلود.'
    ],
    components: [
      {
        id: 'po_phase',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'qo_mcb',
        name: 'قاطع آلي (MCB C16)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 'fo_overload',
        name: 'المرحل الحراري (Overload Relay F1)',
        tag: 'F1',
        type: 'thermal_overload',
        x: 60,
        y: 230,
        width: 140,
        height: 70,
        closed: true,
        isTripped: false,
        terminals: [
          { id: '95', name: '95', x: 70, y: 0 },
          { id: '96', name: '96', x: 70, y: 70 }
        ]
      },
      {
        id: 'so_stop',
        name: 'زر الإيقاف (S0 - NC)',
        tag: 'S0',
        type: 'pushbutton_nc',
        x: 60,
        y: 340,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      {
        id: 'so_start',
        name: 'زر التشغيل (S1 - NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 60,
        y: 450,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'kmo_latch',
        name: 'تعشيق KM1 (NO 13-14)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 200,
        y: 450,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'kmo_coil',
        name: 'كونتاكتور المحرك (KM1)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 60,
        y: 570,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_normal',
        name: 'بيان التشغيل العادي (H1 - أخضر)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 200,
        y: 570,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'lamp_trip',
        name: 'إنذار عطل الأوفرلود (H2 - أحمر)',
        tag: 'H2',
        type: 'pilot_lamp',
        color: 'red',
        x: 360,
        y: 570,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'po_neutral',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 60,
        y: 700,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_overload',
        name: 'محرك ثلاثي الطور (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 500,
        y: 260,
        width: 180,
        height: 200,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'wo0', fromComponentId: 'po_phase', fromTerminalId: 'L1', toComponentId: 'qo_mcb', toTerminalId: '1' },
      { id: 'wo1', fromComponentId: 'qo_mcb', fromTerminalId: '2', toComponentId: 'fo_overload', toTerminalId: '95' },
      // Normal operating path through 95-96
      { id: 'wo2', fromComponentId: 'fo_overload', fromTerminalId: '96', toComponentId: 'so_stop', toTerminalId: '1' },
      { id: 'wo3', fromComponentId: 'so_stop', fromTerminalId: '2', toComponentId: 'so_start', toTerminalId: '3' },
      { id: 'wo4', fromComponentId: 'so_stop', fromTerminalId: '2', toComponentId: 'kmo_latch', toTerminalId: '13' },
      { id: 'wo5', fromComponentId: 'so_start', fromTerminalId: '4', toComponentId: 'kmo_coil', toTerminalId: 'A1' },
      { id: 'wo6', fromComponentId: 'kmo_latch', fromTerminalId: '14', toComponentId: 'kmo_coil', toTerminalId: 'A1' },
      { id: 'wo7', fromComponentId: 'kmo_coil', fromTerminalId: 'A1', toComponentId: 'lamp_normal', toTerminalId: 'X1' },
      { id: 'wo8', fromComponentId: 'kmo_coil', fromTerminalId: 'A2', toComponentId: 'lamp_normal', toTerminalId: 'X2' },
      // Overload trip indicator H2
      { id: 'wo9', fromComponentId: 'qo_mcb', fromTerminalId: '2', toComponentId: 'lamp_trip', toTerminalId: 'X1' },
      // Returns to neutral
      { id: 'wo10', fromComponentId: 'kmo_coil', fromTerminalId: 'A2', toComponentId: 'po_neutral', toTerminalId: 'N' },
      { id: 'wo11', fromComponentId: 'lamp_trip', fromTerminalId: 'X2', toComponentId: 'po_neutral', toTerminalId: 'N' }
    ]
  },

  // =========================================================================
  // 10. دائرة Emergency Stop تعليمية
  // =========================================================================
  {
    id: 'emergency_stop_safety',
    titleAr: 'دائرة Emergency Stop تعليمية (Industrial Safety E-Stop Circuit)',
    titleEn: 'Emergency Stop Mushroom Safety Circuit with Arming Reset',
    category: 'السلامة الصناعية',
    descriptionAr: 'دائرة أمان صناعية قياسية بزر طوارئ مشروم (E-Stop): الضغط على زر الطوارئ يفصل التغذية عن ريليه الأمان MSR فوراً، ولا يمكن إعادة تشغيل المحرك حتى بعد تحرير زر الطوارئ إلا بعد الضغط على زر إعادة التسليح Safety Reset.',
    theoryAr: [
      '1. زر الطوارئ (E-Stop) يفصل التغذية عن جميع التجهيزات فوراً عند كبسه ويثبت ميكانيكياً.',
      '2. بعد تحرير الزر بالتدوير، لا تعود الماكينة للحركة تلقائياً، بل تتطلب الضغط على زر إعادة التسليح Safety Reset.',
      '3. ريليه الأمان (Master Safety Relay - MSR) يغلق ملامسه المساعد ليسمح بتغذية زر تشغيل المحرك S1.',
      '4. هذا الإجراء يمنع الحوادث المفاجئة ويحقق المعايير الدولية للسلامة الصناعية ISO 13849.'
    ],
    components: [
      {
        id: 'pe_phase',
        name: 'مصدر الطور (L1)',
        tag: 'L1',
        type: 'power_phase',
        x: 60,
        y: 40,
        width: 140,
        height: 60,
        terminals: [{ id: 'L1', name: 'L1', x: 70, y: 30, polarity: 'phase' }]
      },
      {
        id: 'qe_mcb',
        name: 'قاطع آلي (MCB C16)',
        tag: 'Q1',
        type: 'circuit_breaker',
        x: 60,
        y: 130,
        width: 140,
        height: 75,
        closed: true,
        isTripped: false,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 75 }]
      },
      {
        id: 'se_estop',
        name: 'زر طوارئ مشروم (E-Stop NC)',
        tag: 'ESTOP',
        type: 'pushbutton_nc',
        x: 60,
        y: 230,
        width: 140,
        height: 70,
        isPressed: false,
        closed: true,
        terminals: [{ id: '1', name: '1', x: 70, y: 0 }, { id: '2', name: '2', x: 70, y: 70 }]
      },
      {
        id: 'se_reset',
        name: 'زر إعادة التسليح (Reset NO)',
        tag: 'RESET',
        type: 'pushbutton_no',
        x: 60,
        y: 340,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'msr_latch',
        name: 'استمرارية ريليه الأمان (MSR NO)',
        tag: 'MSR-NO',
        linkedTag: 'MSR',
        type: 'contactor_contact_no',
        x: 200,
        y: 340,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'msr_coil',
        name: 'ريليه الأمان الرئيسي (MSR)',
        tag: 'MSR',
        type: 'contactor_coil',
        x: 60,
        y: 460,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      // Machine section conditional on MSR safety
      {
        id: 'msr_contact_perm',
        name: 'شرط أمان MSR (NO)',
        tag: 'MSR-PERM',
        linkedTag: 'MSR',
        type: 'contactor_contact_no',
        x: 360,
        y: 230,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'se_start_motor',
        name: 'زر تشغيل المحرك (S1 NO)',
        tag: 'S1',
        type: 'pushbutton_no',
        x: 360,
        y: 340,
        width: 140,
        height: 70,
        isPressed: false,
        closed: false,
        terminals: [{ id: '3', name: '3', x: 70, y: 0 }, { id: '4', name: '4', x: 70, y: 70 }]
      },
      {
        id: 'kme_latch',
        name: 'تعشيق KM1 (NO)',
        tag: 'KM1-NO',
        linkedTag: 'KM1',
        type: 'contactor_contact_no',
        x: 500,
        y: 340,
        width: 130,
        height: 70,
        closed: false,
        terminals: [{ id: '13', name: '13', x: 65, y: 0 }, { id: '14', name: '14', x: 65, y: 70 }]
      },
      {
        id: 'kme_coil',
        name: 'كونتاكتور المحرك (KM1)',
        tag: 'KM1',
        type: 'contactor_coil',
        x: 360,
        y: 460,
        width: 140,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'A1', name: 'A1', x: 70, y: 0 }, { id: 'A2', name: 'A2', x: 70, y: 70 }]
      },
      {
        id: 'lamp_safe_run',
        name: 'بيان تشغيل آمن (H1 - أخضر)',
        tag: 'H1',
        type: 'pilot_lamp',
        color: 'emerald',
        x: 500,
        y: 460,
        width: 120,
        height: 70,
        isEnergized: false,
        terminals: [{ id: 'X1', name: 'X1', x: 60, y: 0 }, { id: 'X2', name: 'X2', x: 60, y: 70 }]
      },
      {
        id: 'pe_neutral',
        name: 'المحايد (N)',
        tag: 'N',
        type: 'power_neutral',
        x: 200,
        y: 600,
        width: 140,
        height: 60,
        terminals: [{ id: 'N', name: 'N', x: 70, y: 30, polarity: 'neutral' }]
      },
      {
        id: 'motor_estop',
        name: 'محرك ماكينة الإنتاج (M1)',
        tag: 'M1',
        type: 'motor_3phase',
        x: 640,
        y: 250,
        width: 180,
        height: 200,
        motorRunning: false,
        motorDirection: 'STOPPED',
        motorSpeed: 0,
        terminals: [{ id: 'U', name: 'U', x: 45, y: 20 }, { id: 'V', name: 'V', x: 90, y: 20 }, { id: 'W', name: 'W', x: 135, y: 20 }]
      }
    ],
    wires: [
      { id: 'we0', fromComponentId: 'pe_phase', fromTerminalId: 'L1', toComponentId: 'qe_mcb', toTerminalId: '1' },
      // E-Stop safety loop
      { id: 'we1', fromComponentId: 'qe_mcb', fromTerminalId: '2', toComponentId: 'se_estop', toTerminalId: '1' },
      { id: 'we2', fromComponentId: 'se_estop', fromTerminalId: '2', toComponentId: 'se_reset', toTerminalId: '3' },
      { id: 'we3', fromComponentId: 'se_estop', fromTerminalId: '2', toComponentId: 'msr_latch', toTerminalId: '13' },
      // Reset arming
      { id: 'we4', fromComponentId: 'se_reset', fromTerminalId: '4', toComponentId: 'msr_coil', toTerminalId: 'A1' },
      { id: 'we5', fromComponentId: 'msr_latch', fromTerminalId: '14', toComponentId: 'msr_coil', toTerminalId: 'A1' },
      // MSR safety permission contact for motor control
      { id: 'we6', fromComponentId: 'qe_mcb', fromTerminalId: '2', toComponentId: 'msr_contact_perm', toTerminalId: '13' },
      { id: 'we7', fromComponentId: 'msr_contact_perm', fromTerminalId: '14', toComponentId: 'se_start_motor', toTerminalId: '3' },
      { id: 'we8', fromComponentId: 'msr_contact_perm', fromTerminalId: '14', toComponentId: 'kme_latch', toTerminalId: '13' },
      { id: 'we9', fromComponentId: 'se_start_motor', fromTerminalId: '4', toComponentId: 'kme_coil', toTerminalId: 'A1' },
      { id: 'we10', fromComponentId: 'kme_latch', fromTerminalId: '14', toComponentId: 'kme_coil', toTerminalId: 'A1' },
      { id: 'we11', fromComponentId: 'kme_coil', fromTerminalId: 'A1', toComponentId: 'lamp_safe_run', toTerminalId: 'X1' },
      { id: 'we12', fromComponentId: 'kme_coil', fromTerminalId: 'A2', toComponentId: 'lamp_safe_run', toTerminalId: 'X2' },
      // Neutral returns
      { id: 'we13', fromComponentId: 'msr_coil', fromTerminalId: 'A2', toComponentId: 'pe_neutral', toTerminalId: 'N' },
      { id: 'we14', fromComponentId: 'kme_coil', fromTerminalId: 'A2', toComponentId: 'pe_neutral', toTerminalId: 'N' }
    ]
  }
];
