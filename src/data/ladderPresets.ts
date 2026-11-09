import { ClassicControlPreset } from '../types/ladder';
import { CIRCUIT_PRESETS } from './presets';

export const CLASSIC_CONTROL_PRESETS: ClassicControlPreset[] = [
  // 1. DOL Starter
  {
    id: 'dol_starter',
    titleAr: 'دائرة التشغيل المباشر للمحرك (DOL Starter) مع التعشيق الذاتي',
    titleEn: 'Direct-on-Line (DOL) Motor Starter with Self-Holding Latch',
    category: 'الأساسيات الصناعية',
    descriptionAr: 'الدائرة القياسية المعتمدة في التحكم الكلاسيكي: زر إيقاف SB1 (NC)، مرحل حراري FR (NC)، زر تشغيل SB2 (NO) بالتوازي مع نقطة تعشيق KM1 (NO) لتغذية ملف الكونتاكتور KM1 وتشغيل المحرك M1.',
    theoryAr: [
      '1. التيار المنطقي يمر عبر ملامس الإيقاف SB1 المغلق طبيعياً وملامس الأوفرلود FR السليم.',
      '2. عند الضغط على زر التشغيل SB2 (NO)، يكتمل مسار التيار في Rung 1 فيعمل ملف الكونتاكتور KM1.',
      '3. تغذية KM1 تغلق نقطة التلامس المساعدة KM1 (NO) الموضوعة على التوازي مع زر التشغيل، فتحافظ على استمرار التغذية (Self-Holding) حتى بعد رفع اليد عن SB2.',
      '4. ملامس KM1 في Rung 2 يغلق فيضيء مصباح التشغيل الأخضر H1_RUN ويدور المحرك M1 بسرعة 1450 RPM.',
      '5. عند الضغط على زر الإيقاف SB1 أو حدوث فصل حراري في FR، ينقطع التيار فوراً ويسقط الكونتاكتور ويتوقف المحرك.'
    ],
    ladder: {
      id: 'ladder_dol',
      titleAr: 'مخطط السلم الكهربائي: DOL Starter',
      titleEn: 'Ladder Diagram: DOL Starter',
      descriptionAr: 'تحكم مباشر بمحرك 3 أطوار مع نقطة تعشيق موازية',
      memoryBits: {},
      scanCycleMs: 0.8,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_1',
          rungNumber: 1,
          commentAr: 'Rung 1: دائرة التحكم في تشغيل وإيقاف ملف الكونتاكتور KM1 والتعشيق الذاتي',
          mainBranch: {
            id: 'b1',
            items: [
              {
                id: 'c_sb1',
                type: 'contact_nc',
                tag: 'SB1',
                labelAr: 'زر إيقاف SB1 (NC)',
                linkedHardwareTag: 'S0'
              },
              {
                id: 'c_fr',
                type: 'contact_nc',
                tag: 'FR',
                labelAr: 'مرحل حراري FR (NC)',
                linkedHardwareTag: 'F1'
              },
              {
                id: 'p_group_start_latch',
                type: 'parallel_group',
                branches: [
                  {
                    id: 'branch_start',
                    items: [
                      {
                        id: 'c_sb2',
                        type: 'contact_no',
                        tag: 'SB2',
                        labelAr: 'زر تشغيل SB2 (NO)',
                        linkedHardwareTag: 'S1'
                      }
                    ]
                  },
                  {
                    id: 'branch_latch',
                    items: [
                      {
                        id: 'c_km1_latch',
                        type: 'contact_no',
                        tag: 'KM1',
                        labelAr: 'نقطة تعشيق KM1 (NO)',
                        linkedHardwareTag: 'KM1'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          outputs: [
            {
              id: 'coil_km1',
              type: 'coil_standard',
              tag: 'KM1',
              labelAr: 'ملف الكونتاكتور KM1',
              linkedHardwareTag: 'KM1'
            }
          ]
        },
        {
          id: 'rung_2',
          rungNumber: 2,
          commentAr: 'Rung 2: بيان تشغيل المحرك بواسطة مصباح الإشارة الأخضر H1',
          mainBranch: {
            id: 'b2',
            items: [
              {
                id: 'c_km1_run_ind',
                type: 'contact_no',
                tag: 'KM1',
                labelAr: 'ملامس مساعد KM1 (NO)',
                linkedHardwareTag: 'KM1'
              }
            ]
          },
          outputs: [
            {
              id: 'coil_h1_run',
              type: 'coil_standard',
              tag: 'H1',
              labelAr: 'مصباح بيان التشغيل H1',
              linkedHardwareTag: 'H1'
            }
          ]
        },
        {
          id: 'rung_3',
          rungNumber: 3,
          commentAr: 'Rung 3: إشارة إنذار وتنبيه العطل الحراري Overload Trip بواسطة مصباح التحذير H2',
          mainBranch: {
            id: 'b3',
            items: [
              {
                id: 'c_fr_trip',
                type: 'contact_no',
                tag: 'FR',
                labelAr: 'نقطة أوفرلود 97-98 (NO)',
                linkedHardwareTag: 'F1'
              }
            ]
          },
          outputs: [
            {
              id: 'coil_h2_trip',
              type: 'coil_standard',
              tag: 'H2',
              labelAr: 'مصباح إنذار العطل H2 (أحمر)',
              linkedHardwareTag: 'H2'
            }
          ]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[0].wires
  },

  // 2. Self-Holding Latch
  {
    id: 'self_holding',
    titleAr: 'دائرة التعشيق الذاتي ونقاط الاستمرارية (Self-Holding Latch)',
    titleEn: 'Self-Holding Contact Circuit with Auxiliary Interlock',
    category: 'الأساسيات الصناعية',
    descriptionAr: 'تطبيق مفصل لكيفية تحويل الإشارة اللحظية من زر ضاغط نبضي إلى حالة استمرارية دائمة باستخدام ملامس الكونتاكتور المساعد (NO 13-14).',
    theoryAr: [
      'الأزرار الضاغطة في اللوحات الصناعية ترتد تلقائياً بمجرد رفع الإصبع.',
      'لذلك يتم ربط ملامس مساعد مفتوح (NO) على التوازي مع زر التشغيل.',
      'هذا التوصيل يُسمى "دائرة الحفظ الذاتي" أو Seal-in Circuit.'
    ],
    ladder: {
      id: 'ladder_holding',
      titleAr: 'مخطط التعشيق الذاتي',
      titleEn: 'Self-Holding Latch Diagram',
      descriptionAr: 'دراسة وتحليل نقطة الاستمرارية',
      memoryBits: {},
      scanCycleMs: 0.6,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_h1',
          rungNumber: 1,
          commentAr: 'Rung 1: حلقة التعشيق الذاتي بين زر التشغيل والملامس المساعد',
          mainBranch: {
            id: 'bh1',
            items: [
              { id: 'ch_sb1', type: 'contact_nc', tag: 'SB1', labelAr: 'زر إيقاف NC', linkedHardwareTag: 'S0' },
              {
                id: 'pg_hold',
                type: 'parallel_group',
                branches: [
                  { id: 'b_sb2', items: [{ id: 'ch_sb2', type: 'contact_no', tag: 'SB2', labelAr: 'نبضة تشغيل NO', linkedHardwareTag: 'S1' }] },
                  { id: 'b_km1', items: [{ id: 'ch_km1', type: 'contact_no', tag: 'KM1', labelAr: 'ملامس تعشيق 13-14', linkedHardwareTag: 'KM1' }] }
                ]
              }
            ]
          },
          outputs: [
            { id: 'coil_hold_km1', type: 'coil_standard', tag: 'KM1', labelAr: 'ملف الكونتاكتور KM1', linkedHardwareTag: 'KM1' }
          ]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[1]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[1]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 3. Interlocking Between Two Motors
  {
    id: 'interlocking',
    titleAr: 'التشابك الكهربائي المتبادل بين محركين (Interlocking)',
    titleEn: 'Electrical Interlock Between Two Contactors',
    category: 'التحكم المتقدم',
    descriptionAr: 'منع تشغيل كونتاكتورين في نفس الوقت لحماية التجهيزات من التضارب، باستخدام ملامس NC من الكونتاكتور الأول في مسار الثاني والعكس.',
    theoryAr: [
      '1. عند تشغيل KM1 يفتح ملامسه المغلق طبيعياً (KM1 NC) في مسار KM2، فيمنع عمله حتى لو تم الضغط على زر التشغيل الثاني.',
      '2. بالمثل، عند عمل KM2 يفتح ملامسه (KM2 NC) في مسار KM1 لمنع تشغيله.',
      '3. هذا التشابك الكهربائي أساسي ومحوري في جميع تطبيقات الأمان الكهربائي الصناعي.'
    ],
    ladder: {
      id: 'ladder_interlock',
      titleAr: 'مخطط التشابك المتبادل (Interlocking)',
      titleEn: 'Interlock Ladder Diagram',
      descriptionAr: 'قفل كهربائي متبادل بين KM1 و KM2',
      memoryBits: {},
      scanCycleMs: 0.9,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_int1',
          rungNumber: 1,
          commentAr: 'Rung 1: تشغيل المحرك 1 (KM1) مع قفل كهربائي بواسطة ملامس KM2 NC',
          mainBranch: {
            id: 'b_int1',
            items: [
              { id: 'c_s0_int', type: 'contact_nc', tag: 'SB1', labelAr: 'زر إيقاف رئيسي NC', linkedHardwareTag: 'S0' },
              { id: 'c_km2_lock', type: 'contact_nc', tag: 'KM2', labelAr: 'قفل كهربائي (KM2 NC)', linkedHardwareTag: 'KM2' },
              {
                id: 'pg_m1',
                type: 'parallel_group',
                branches: [
                  { id: 'b_s1', items: [{ id: 'c_s1', type: 'contact_no', tag: 'SB2', labelAr: 'تشغيل M1', linkedHardwareTag: 'S1' }] },
                  { id: 'b_km1_l', items: [{ id: 'c_km1_l', type: 'contact_no', tag: 'KM1', labelAr: 'استمرارية KM1', linkedHardwareTag: 'KM1' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_km1', type: 'coil_standard', tag: 'KM1', labelAr: 'كونتاكتور M1 (KM1)' }]
        },
        {
          id: 'rung_int2',
          rungNumber: 2,
          commentAr: 'Rung 2: تشغيل المحرك 2 (KM2) مع قفل كهربائي بواسطة ملامس KM1 NC',
          mainBranch: {
            id: 'b_int2',
            items: [
              { id: 'c_s0_int2', type: 'contact_nc', tag: 'SB1', labelAr: 'زر إيقاف رئيسي NC', linkedHardwareTag: 'S0' },
              { id: 'c_km1_lock', type: 'contact_nc', tag: 'KM1', labelAr: 'قفل كهربائي (KM1 NC)', linkedHardwareTag: 'KM1' },
              {
                id: 'pg_m2',
                type: 'parallel_group',
                branches: [
                  { id: 'b_s2', items: [{ id: 'c_s2', type: 'contact_no', tag: 'SB3', labelAr: 'تشغيل M2', linkedHardwareTag: 'S2' }] },
                  { id: 'b_km2_l', items: [{ id: 'c_km2_l', type: 'contact_no', tag: 'KM2', labelAr: 'استمرارية KM2', linkedHardwareTag: 'KM2' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_km2', type: 'coil_standard', tag: 'KM2', labelAr: 'كونتاكتور M2 (KM2)' }]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[2]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[2]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 4. Forward / Reverse
  {
    id: 'forward_reverse',
    titleAr: 'Forward / Reverse (تشغيل محرك في اتجاهين مع قفل كهربائي)',
    titleEn: 'Forward and Reverse Motor Starter with Reversing Contactors',
    category: 'التحكم المتقدم',
    descriptionAr: 'التحكم الكامل في تبديل دوران المحرك للأمام (CW) أو للخلف (CCW) مع تشابك كهربائي لحماية الأطوار من حدوث قصر كهربائي مباشر (Phase-to-Phase Short).',
    theoryAr: [
      '1. الضغط على زر الأمام SB2 يشغل كونتاكتور رقم 1 (KM1) ويدور المحرك باتجاه عقارب الساعة.',
      '2. لا يمكن تشغيل كونتاكتور رقم 2 (KM2) مطلقاً أثناء دوران الأمام بفضل القفل KM1 NC.',
      '3. لعكس الاتجاه، يجب الضغط على إيقاف SB1 ثم الضغط على زر الخلف SB3 لتشغيل كونتاكتور رقم 2 (KM2).'
    ],
    ladder: {
      id: 'ladder_fwd_rev',
      titleAr: 'مخطط تشغيل محرك في اتجاهين',
      titleEn: 'Forward/Reverse Ladder Diagram',
      descriptionAr: 'عكس الحركة مع القفل الكهربائي بين الكونتاكتورين KM1 و KM2',
      memoryBits: {},
      scanCycleMs: 0.9,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_fwd',
          rungNumber: 1,
          commentAr: 'Rung 1: اتجاه الدوران للأمام - تشغيل كونتاكتور رقم 1 (KM1)',
          mainBranch: {
            id: 'b_fwd',
            items: [
              { id: 'c_stop_fr', type: 'contact_nc', tag: 'SB1', labelAr: 'إيقاف عام (S0)', linkedHardwareTag: 'S0' },
              { id: 'c_rev_lock', type: 'contact_nc', tag: 'KM2', labelAr: 'قفل متبادل كونتاكتور 2 (KM2 NC)', linkedHardwareTag: 'KM2' },
              {
                id: 'pg_fwd',
                type: 'parallel_group',
                branches: [
                  { id: 'b_sfwd', items: [{ id: 'c_sfwd', type: 'contact_no', tag: 'SB2', labelAr: 'زر الأمام NO (S1)', linkedHardwareTag: 'S1' }] },
                  { id: 'b_km1f', items: [{ id: 'c_km1f', type: 'contact_no', tag: 'KM1', labelAr: 'تعشيق KM1', linkedHardwareTag: 'KM1' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_fwd', type: 'coil_standard', tag: 'KM1', labelAr: 'كونتاكتور رقم 1 للأمام (KM1)', linkedHardwareTag: 'KM1' }]
        },
        {
          id: 'rung_rev',
          rungNumber: 2,
          commentAr: 'Rung 2: اتجاه الدوران للخلف - تشغيل كونتاكتور رقم 2 (KM2)',
          mainBranch: {
            id: 'b_rev',
            items: [
              { id: 'c_stop_fr2', type: 'contact_nc', tag: 'SB1', labelAr: 'إيقاف عام (S0)', linkedHardwareTag: 'S0' },
              { id: 'c_fwd_lock', type: 'contact_nc', tag: 'KM1', labelAr: 'قفل متبادل كونتاكتور 1 (KM1 NC)', linkedHardwareTag: 'KM1' },
              {
                id: 'pg_rev',
                type: 'parallel_group',
                branches: [
                  { id: 'b_srev', items: [{ id: 'c_srev', type: 'contact_no', tag: 'SB3', labelAr: 'زر الخلف NO (S2)', linkedHardwareTag: 'S2' }] },
                  { id: 'b_km2r', items: [{ id: 'c_km2r', type: 'contact_no', tag: 'KM2', labelAr: 'تعشيق KM2', linkedHardwareTag: 'KM2' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_rev', type: 'coil_standard', tag: 'KM2', labelAr: 'كونتاكتور رقم 2 للخلف (KM2)', linkedHardwareTag: 'KM2' }]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[3]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[3]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 5. Timer TON Sequence
  {
    id: 'timer_ton_sequence',
    titleAr: 'تشغيل محرك بمؤقت TON (On-Delay Motor Timer Starter)',
    titleEn: 'On-Delay Timer (TON) Controlled Motor Starting',
    category: 'المؤقتات والأتمتة',
    descriptionAr: 'تأخير تشغيل المحرك لمهلة زمنية محددة (5 ثوانٍ) بعد الضغط على زر التشغيل باستخدام مؤقت تأخير التوصيل TON.',
    theoryAr: [
      '1. عند الضغط على SB2، يتغذى موديول المؤقت T1 (TON) ويبدأ العد التنازلي للزمن المضبوط (5s).',
      '2. يظل خرج المؤقت Q مفتوحاً أثناء فترة العد.',
      '3. عند وصول الزمن المنقضي ET إلى الزمن المضبوط PT، يغلق ملامس T1 وتصل التغذية لملف الكونتاكتور KM1 ليبدأ المحرك بالدوران.'
    ],
    ladder: {
      id: 'ladder_ton',
      titleAr: 'مخطط المؤقت الزمني TON',
      titleEn: 'TON Timer Ladder Diagram',
      descriptionAr: 'تأخير التشغيل بمؤقت TON',
      memoryBits: {},
      scanCycleMs: 0.7,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_ton1',
          rungNumber: 1,
          commentAr: 'Rung 1: بدء تشغيل المؤقت الزمني T1 (TON - 5.0s)',
          mainBranch: {
            id: 'b_ton1',
            items: [
              { id: 'c_stop_t', type: 'contact_nc', tag: 'SB1', labelAr: 'إيقاف NC' },
              {
                id: 'pg_t',
                type: 'parallel_group',
                branches: [
                  { id: 'b_st', items: [{ id: 'c_st', type: 'contact_no', tag: 'SB2', labelAr: 'زر تشغيل' }] },
                  { id: 'b_lt', items: [{ id: 'c_lt', type: 'contact_no', tag: 'M0.0', labelAr: 'استمرارية المؤقت' }] }
                ]
              }
            ]
          },
          outputs: [
            { id: 'coil_m0', type: 'coil_standard', tag: 'M0.0', labelAr: 'ريليه وسيط M0.0' },
            { id: 'ton_t1', type: 'timer_ton', tag: 'T1', labelAr: 'مؤقت TON (5s)', presetTime: 5.0, elapsedTime: 0 }
          ]
        },
        {
          id: 'rung_ton2',
          rungNumber: 2,
          commentAr: 'Rung 2: تشغيل الكونتاكتور KM1 فور انتهاء زمن المؤقت T1',
          mainBranch: {
            id: 'b_ton2',
            items: [
              { id: 'c_t1_done', type: 'contact_no', tag: 'T1', labelAr: 'ملامس المؤقت T1 (NO)' }
            ]
          },
          outputs: [
            { id: 'coil_km1_ton', type: 'coil_standard', tag: 'KM1', labelAr: 'كونتاكتور المحرك KM1' }
          ]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[4]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[4]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 6. Star-Delta Starter
  {
    id: 'star_delta',
    titleAr: 'دائرة بدء التشغيل نجمة / مثلث (Star-Delta Starter)',
    titleEn: 'Automatic Star-Delta Induction Motor Starter',
    category: 'التحكم المتقدم',
    descriptionAr: 'تقليل تيار البدء العالي للمحركات الكبيرة بتشغيلها بتوصيلة النجمة (Star) لمدة 4 ثوانٍ ثم الانتقال التلقائي إلى توصيلة المثلث (Delta).',
    theoryAr: [
      '1. عند بدء التشغيل، يعمل الكونتاكتور الرئيسي KM_MAIN وكونتاكتور النجمة KM_STAR ويبدأ المؤقت T1.',
      '2. ينخفض تيار البدء إلى ثلث قيمته المباشرة لحماية الشبكة.',
      '3. بعد 4 ثوانٍ، يفصل KM_STAR وتدخل توصيلة المثلث KM_DELTA للدوران بالعزم الكامل والجهد الاسمي.'
    ],
    ladder: {
      id: 'ladder_star_delta',
      titleAr: 'مخطط نجمة / مثلث',
      titleEn: 'Star-Delta Ladder Diagram',
      descriptionAr: 'تحكم تسلسلي Star-Delta',
      memoryBits: {},
      scanCycleMs: 1.1,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_sd1',
          rungNumber: 1,
          commentAr: 'Rung 1: تشغيل الكونتاكتور الرئيسي والمؤقت الزمني',
          mainBranch: {
            id: 'b_sd1',
            items: [
              { id: 'c_sd_stop', type: 'contact_nc', tag: 'SB1', labelAr: 'إيقاف NC' },
              {
                id: 'pg_sd1',
                type: 'parallel_group',
                branches: [
                  { id: 'b_sd_s1', items: [{ id: 'c_sd_s1', type: 'contact_no', tag: 'SB2', labelAr: 'تشغيل NO' }] },
                  { id: 'b_sd_m', items: [{ id: 'c_sd_m', type: 'contact_no', tag: 'KM1', labelAr: 'تعشيق KM_MAIN' }] }
                ]
              }
            ]
          },
          outputs: [
            { id: 'coil_km_main', type: 'coil_standard', tag: 'KM1', labelAr: 'الكونتاكتور الرئيسي KM1' },
            { id: 'timer_sd', type: 'timer_ton', tag: 'T1', labelAr: 'مؤقت التحويل (4s)', presetTime: 4.0, elapsedTime: 0 }
          ]
        },
        {
          id: 'rung_sd2',
          rungNumber: 2,
          commentAr: 'Rung 2: تشغيل كونتاكتور النجمة (Star) خلال فترة العد الأولى فقط',
          mainBranch: {
            id: 'b_sd2',
            items: [
              { id: 'c_km1_sd', type: 'contact_no', tag: 'KM1', labelAr: 'ملامس KM1 الرئيسي' },
              { id: 'c_t1_sd_nc', type: 'contact_nc', tag: 'T1', labelAr: 'ملامس مؤقت NC (يفصل بعد 4s)' },
              { id: 'c_delta_lock', type: 'contact_nc', tag: 'KM_DELTA', labelAr: 'قفل متبادل (Delta NC)' }
            ]
          },
          outputs: [{ id: 'coil_km_star', type: 'coil_standard', tag: 'KM_STAR', labelAr: 'كونتاكتور النجمة KM_STAR' }]
        },
        {
          id: 'rung_sd3',
          rungNumber: 3,
          commentAr: 'Rung 3: تشغيل كونتاكتور المثلث (Delta) بعد انقضاء زمن المؤقت',
          mainBranch: {
            id: 'b_sd3',
            items: [
              { id: 'c_km1_sd3', type: 'contact_no', tag: 'KM1', labelAr: 'ملامس KM1 الرئيسي' },
              { id: 'c_t1_sd_no', type: 'contact_no', tag: 'T1', labelAr: 'ملامس مؤقت NO (يغلق بعد 4s)' },
              { id: 'c_star_lock', type: 'contact_nc', tag: 'KM_STAR', labelAr: 'قفل متبادل (Star NC)' }
            ]
          },
          outputs: [{ id: 'coil_km_delta', type: 'coil_standard', tag: 'KM_DELTA', labelAr: 'كونتاكتور المثلث KM_DELTA' }]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[5]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[5]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 7. Two Motors Sequential Starting
  {
    id: 'two_motors_sequential',
    titleAr: 'تشغيل محركين بالتتابع الزمني (Sequential Motors Starting)',
    titleEn: 'Sequential Starting of Two Motors',
    category: 'الأتمتة والتتابع',
    descriptionAr: 'اشتراط عمل المحرك الأول M1 أولاً، ثم تشغيل المحرك الثاني M2 إما يدوياً أو آلياً، لضمان استقرار العمليات الإنتاجية وسيور النقل.',
    theoryAr: [
      '1. في سيور النقل، يجب أن يبدأ السير المستلم (M1) بالدوران قبل السير المغذي (M2) لتجنب تراكم المواد.',
      '2. يتم وضع ملامس مفتوح طبيعياً من KM1 في طريق تشغيل KM2.',
      '3. لا يستجيب زر تشغيل المحرك الثاني ما لم يكن المحرك الأول دائراً بالفعل.'
    ],
    ladder: {
      id: 'ladder_seq',
      titleAr: 'مخطط التتابع الزمني',
      titleEn: 'Sequential Motors Ladder Diagram',
      descriptionAr: 'تشغيل تتابعي للمحركين',
      memoryBits: {},
      scanCycleMs: 0.8,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_seq1',
          rungNumber: 1,
          commentAr: 'Rung 1: تشغيل المحرك الأول M1 (KM1)',
          mainBranch: {
            id: 'b_seq1',
            items: [
              { id: 'c_seq_stop', type: 'contact_nc', tag: 'SB1', labelAr: 'إيقاف عام' },
              {
                id: 'pg_seq1',
                type: 'parallel_group',
                branches: [
                  { id: 'b_s1', items: [{ id: 'c_s1', type: 'contact_no', tag: 'SB2', labelAr: 'تشغيل M1' }] },
                  { id: 'b_km1_s', items: [{ id: 'c_km1_s', type: 'contact_no', tag: 'KM1', labelAr: 'تعشيق KM1' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_seq_km1', type: 'coil_standard', tag: 'KM1', labelAr: 'كونتاكتور M1' }]
        },
        {
          id: 'rung_seq2',
          rungNumber: 2,
          commentAr: 'Rung 2: تشغيل المحرك الثاني M2 مشروطاً بعمل المحرك الأول KM1',
          mainBranch: {
            id: 'b_seq2',
            items: [
              { id: 'c_seq_stop2', type: 'contact_nc', tag: 'SB1', labelAr: 'إيقاف عام' },
              { id: 'c_km1_permissive', type: 'contact_no', tag: 'KM1', labelAr: 'شرط دوران M1 (KM1 NO)' },
              {
                id: 'pg_seq2',
                type: 'parallel_group',
                branches: [
                  { id: 'b_s2', items: [{ id: 'c_s2', type: 'contact_no', tag: 'SB3', labelAr: 'تشغيل M2' }] },
                  { id: 'b_km2_s', items: [{ id: 'c_km2_s', type: 'contact_no', tag: 'KM2', labelAr: 'تعشيق KM2' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_seq_km2', type: 'coil_standard', tag: 'KM2', labelAr: 'كونتاكتور M2' }]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[6]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[6]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 8. Timer & Pilot Lamp Control
  {
    id: 'timer_lamp_blink',
    titleAr: 'التحكم في مصباح بواسطة Timer ومؤقت النبضات (Pulsed Lamp)',
    titleEn: 'Timer Pulse and Pilot Indicator Lamp Control',
    category: 'المؤقتات والأتمتة',
    descriptionAr: 'توليد نبضات وإشارات تنبيه ضوئية دورية أو مؤجلة للتحذير من بدء تشغيل الماكينة قبل الحركة الميكانيكية.',
    theoryAr: [
      '1. استخدام مؤقت نبضات TP لتشغيل المصباح لمهلة 3 ثوانٍ قبل الإقلاع.',
      '2. يعطي المشغلين في محيط الماكينة إشعاراً مرئياً للسلامة المهنية.'
    ],
    ladder: {
      id: 'ladder_lamp',
      titleAr: 'مخطط التحكم في المصباح',
      titleEn: 'Timer Lamp Diagram',
      descriptionAr: 'نبضات إشارة ضوئية للتحذير',
      memoryBits: {},
      scanCycleMs: 0.7,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_l1',
          rungNumber: 1,
          commentAr: 'Rung 1: إطلاق نبضة مؤقت TP لمدة 3 ثوانٍ',
          mainBranch: {
            id: 'b_l1',
            items: [
              { id: 'c_sb2_pulse', type: 'contact_no', tag: 'SB2', labelAr: 'زر البدء NO' }
            ]
          },
          outputs: [
            { id: 'tp_lamp', type: 'timer_tp', tag: 'T1', labelAr: 'مؤقت نبضة TP (3s)', presetTime: 3.0, elapsedTime: 0 },
            { id: 'coil_lamp_h1', type: 'coil_standard', tag: 'H1', labelAr: 'مصباح التنبيه H1' }
          ]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[7]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[7]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 9. Thermal Overload Protection & Alarm
  {
    id: 'thermal_overload_protection',
    titleAr: 'دائرة الحماية الحرارية والتنبيه الصوتي والضوئي (Overload Trip & Alarm)',
    titleEn: 'Thermal Overload Trip Circuit with Audible & Visual Alarm',
    category: 'الحماية الصناعية',
    descriptionAr: 'استجابة الدائرة لعطل الحمل الزائد: فصل فوري لملف الكونتاكتور وإطلاق مصباح تنبيه أحمر وجرس إنذار.',
    theoryAr: [
      '1. عند حدوث تيار زائد مستمر، تتمدد شرائح البي-ميتال في المرحل الحراري FR.',
      '2. تفتح النقطة 95-96 فتفصل ملف الكونتاكتور KM1 فوراً ويتوقف المحرك عن الدوران لحرق الملفات.',
      '3. في نفس اللحظة تغلق النقطة 97-98 لتغذية لمبة التنبيه H2 وصفارة الإنذار.'
    ],
    ladder: {
      id: 'ladder_ovld',
      titleAr: 'مخطط حماية الأوفرلود',
      titleEn: 'Thermal Overload Alarm Diagram',
      descriptionAr: 'حماية متكاملة مع إنذار صوتي وضوئي',
      memoryBits: {},
      scanCycleMs: 0.8,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_o1',
          rungNumber: 1,
          commentAr: 'Rung 1: مسار تشغيل المحرك الطبيعي المحمي بالنقطة المغلقة FR 95-96',
          mainBranch: {
            id: 'b_o1',
            items: [
              { id: 'c_o_stop', type: 'contact_nc', tag: 'SB1', labelAr: 'إيقاف NC' },
              { id: 'c_o_fr_nc', type: 'contact_nc', tag: 'FR', labelAr: 'أوفرلود NC (95-96)' },
              {
                id: 'pg_o1',
                type: 'parallel_group',
                branches: [
                  { id: 'b_ostart', items: [{ id: 'c_ostart', type: 'contact_no', tag: 'SB2', labelAr: 'تشغيل' }] },
                  { id: 'b_okm', items: [{ id: 'c_okm', type: 'contact_no', tag: 'KM1', labelAr: 'تعشيق KM1' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_o_km1', type: 'coil_standard', tag: 'KM1', labelAr: 'كونتاكتور المحرك KM1' }]
        },
        {
          id: 'rung_o2',
          rungNumber: 2,
          commentAr: 'Rung 2: مسار إنذار العطل بنقطة الأوفرلود المفتوحة FR 97-98',
          mainBranch: {
            id: 'b_o2',
            items: [
              { id: 'c_o_fr_no', type: 'contact_no', tag: 'FR', labelAr: 'أوفرلود NO (97-98)' }
            ]
          },
          outputs: [
            { id: 'out_h2_fault', type: 'coil_standard', tag: 'H2', labelAr: 'مصباح إنذار أحمر H2' }
          ]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[8]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[8]?.wires || CIRCUIT_PRESETS[0].wires
  },

  // 10. Emergency Stop Safety
  {
    id: 'emergency_stop_safety',
    titleAr: 'دائرة التوقف في حالات الطوارئ (Emergency Stop with Safety Reset)',
    titleEn: 'Emergency Stop Mushroom Safety Circuit with Arming Reset',
    category: 'السلامة الصناعية',
    descriptionAr: 'نظام إيقاف طوارئ صناعي قياسي (E-Stop) مع زر مشروم ذي قفل ميكانيكي وملامس ثنائي، يتطلب ضغط زر إعادة التسليح (Reset) يدوياً قبل السماح بأي تشغيل جديد.',
    theoryAr: [
      '1. زر الطوارئ (E-Stop) يفصل التغذية عن جميع الحركات فوراً عند كبسه ويثبت ميكانيكياً.',
      '2. بعد تحرير الزر بالتدوير، لا تعود الماكينة للحركة تلقائياً، بل تتطلب الضغط على زر إعادة التسليح Safety Reset.',
      '3. هذا الإجراء يمنع الحوادث المفاجئة ويحقق المعايير الدولية للسلامة الصناعية ISO 13849.'
    ],
    ladder: {
      id: 'ladder_estop',
      titleAr: 'مخطط أمان الطوارئ (E-Stop)',
      titleEn: 'Emergency Stop Safety Ladder',
      descriptionAr: 'سلامة صناعية مع إعادة تسليح',
      memoryBits: {},
      scanCycleMs: 0.9,
      scanCount: 0,
      isPaused: false,
      rungs: [
        {
          id: 'rung_es1',
          rungNumber: 1,
          commentAr: 'Rung 1: ريليه الأمان الرئيسي (Master Safety Relay - MSR / K1) مع زر Reset',
          mainBranch: {
            id: 'b_es1',
            items: [
              { id: 'c_estop_btn', type: 'contact_nc', tag: 'ESTOP', labelAr: 'زر طوارئ مشروم (E-Stop NC)' },
              {
                id: 'pg_es',
                type: 'parallel_group',
                branches: [
                  { id: 'b_rst', items: [{ id: 'c_rst', type: 'contact_no', tag: 'RESET', labelAr: 'زر تسليح Reset (NO)' }] },
                  { id: 'b_msr', items: [{ id: 'c_msr', type: 'contact_no', tag: 'MSR', labelAr: 'استمرارية K1' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'coil_msr', type: 'coil_standard', tag: 'MSR', labelAr: 'ريليه الأمان K1 (MSR)' }]
        },
        {
          id: 'rung_es2',
          rungNumber: 2,
          commentAr: 'Rung 2: تشغيل محرك الإنتاج KM1 مشروط بسلامة وتفعيل ريليه الأمان MSR',
          mainBranch: {
            id: 'b_es2',
            items: [
              { id: 'c_msr_perm', type: 'contact_no', tag: 'MSR', labelAr: 'ملامس ريليه الأمان K1' },
              { id: 'c_es_stop', type: 'contact_nc', tag: 'SB1', labelAr: 'زر إيقاف عادي NC' },
              {
                id: 'pg_es_km',
                type: 'parallel_group',
                branches: [
                  { id: 'b_es_s', items: [{ id: 'c_es_s', type: 'contact_no', tag: 'SB2', labelAr: 'زر تشغيل' }] },
                  { id: 'b_es_km', items: [{ id: 'c_es_km', type: 'contact_no', tag: 'KM1', labelAr: 'تعشيق KM1' }] }
                ]
              }
            ]
          },
          outputs: [{ id: 'out_es_km1', type: 'coil_standard', tag: 'KM1', labelAr: 'كونتاكتور المحرك KM1' }]
        }
      ]
    },
    hardwareComponents: CIRCUIT_PRESETS[9]?.components || CIRCUIT_PRESETS[0].components,
    hardwareWires: CIRCUIT_PRESETS[9]?.wires || CIRCUIT_PRESETS[0].wires
  }
];
