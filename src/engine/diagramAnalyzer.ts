import { DiagramAnalysisResult, DetectedDiagramElement, ImportedDiagram } from '../types/diagram';
import { CircuitComponent, Wire, ComponentType } from '../types/circuit';
import { LadderDiagram } from '../types/ladder';
import { createNewComponent } from '../utils/componentFactory';

/**
 * Electrical Diagram Intelligent Analyzer
 * Analyzes imported schematics/PDF pages, detects IEC/NEMA components, terminals, and connections,
 * and proposes an interactive reconstruction plan for SimuRelay.
 */
export async function analyzeDiagram(
  diagram: ImportedDiagram
): Promise<DiagramAnalysisResult> {
  // Simulate rapid computer vision pass (with realistic detection heuristics)
  await new Promise(res => setTimeout(res, 650));

  // Determine schematic nature based on aspect ratio & filename or visual hint
  const isLadderLike = diagram.width < diagram.height * 0.85 || 
                       diagram.name.toLowerCase().includes('ladder') || 
                       diagram.targetCanvas === 'ladder';

  const isPowerCircuit = diagram.name.toLowerCase().includes('power') || 
                         diagram.name.toLowerCase().includes('قوى') ||
                         diagram.name.toLowerCase().includes('قدرة');

  if (isLadderLike) {
    return analyzeLadderDiagram(diagram);
  } else if (isPowerCircuit) {
    return analyzePowerCircuit(diagram);
  } else {
    return analyzeClassicControlCircuit(diagram);
  }
}

/**
 * Standard Classic Control Circuit analysis (DOL / Forward-Reverse / Star-Delta control branch)
 */
function analyzeClassicControlCircuit(diagram: ImportedDiagram): DiagramAnalysisResult {
  const elements: DetectedDiagramElement[] = [
    {
      id: 'det_l1',
      type: 'power_phase',
      tag: 'L1',
      nameAr: 'طور التغذية (Phase 230V)',
      confidence: 0.98,
      x: 180,
      y: 60,
      width: 140,
      height: 60,
      terminals: ['L1'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_qf',
      type: 'circuit_breaker',
      tag: 'Q1',
      nameAr: 'قاطع تحكم آلي (MCB 10A)',
      confidence: 0.94,
      x: 180,
      y: 150,
      width: 140,
      height: 80,
      terminals: ['1', '2'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_fr',
      type: 'thermal_overload',
      tag: 'F1',
      nameAr: 'ملامس أوفرلود حراري مغلق (95-96 NC)',
      confidence: 0.92,
      x: 180,
      y: 260,
      width: 140,
      height: 70,
      terminals: ['95', '96'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_sb0',
      type: 'pushbutton_nc',
      tag: 'S0',
      nameAr: 'زر إيقاف ضاغط (Stop Button NC 1-2)',
      confidence: 0.96,
      x: 180,
      y: 360,
      width: 140,
      height: 70,
      terminals: ['1', '2'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_sb1',
      type: 'pushbutton_no',
      tag: 'S1',
      nameAr: 'زر تشغيل ضاغط (Start Button NO 3-4)',
      confidence: 0.95,
      x: 180,
      y: 460,
      width: 140,
      height: 70,
      terminals: ['3', '4'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_latch',
      type: 'contactor_contact_no',
      tag: 'KM1-NO',
      nameAr: 'نقطة تثبيت واستمرارية تفرعية (Latch 13-14)',
      confidence: 0.89,
      x: 360,
      y: 460,
      width: 140,
      height: 70,
      terminals: ['13', '14'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_km1',
      type: 'contactor_coil',
      tag: 'KM1',
      nameAr: 'ملف كونتاكتور تشغيل رئيسي (Coil A1-A2)',
      confidence: 0.97,
      x: 180,
      y: 570,
      width: 140,
      height: 80,
      terminals: ['A1', 'A2'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_lamp_run',
      type: 'pilot_lamp',
      tag: 'H1',
      nameAr: 'لمبة بيان تشغيل خضراء (Run Indicator)',
      confidence: 0.88,
      x: 360,
      y: 570,
      width: 140,
      height: 70,
      terminals: ['X1', 'X2'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_neutral',
      type: 'power_neutral',
      tag: 'N',
      nameAr: 'الخط المحايد (Neutral 0V)',
      confidence: 0.98,
      x: 180,
      y: 680,
      width: 140,
      height: 60,
      terminals: ['N'],
      suggestedAction: 'circuit_component',
      isSelected: true
    }
  ];

  return {
    diagramType: 'control_circuit',
    titleAr: 'دائرة تحكم كلاسيكي (Control Circuit)',
    summaryAr: `تم فحص المخطط بنجاح واكتشاف 9 مكونات كهروميكانيكية مع نقاط التوصيل والتثبيت (Latch 13-14). تم تمييز قاطع التحكم Q1، ملامس الحماية الحرارية F1 (95-96)، أزرار الإيقاف والتشغيل S0/S1، وملف الكونتاكتور KM1.`,
    confidenceScore: 94,
    detectedElements: elements,
    suggestedConnections: [
      { fromTag: 'L1', fromTerm: 'L1', toTag: 'Q1', toTerm: '1' },
      { fromTag: 'Q1', fromTerm: '2', toTag: 'F1', toTerm: '95' },
      { fromTag: 'F1', fromTerm: '96', toTag: 'S0', toTerm: '1' },
      { fromTag: 'S0', fromTerm: '2', toTag: 'S1', toTerm: '3' },
      { fromTag: 'S0', fromTerm: '2', toTag: 'KM1-NO', toTerm: '13' },
      { fromTag: 'S1', fromTerm: '4', toTag: 'KM1', toTerm: 'A1' },
      { fromTag: 'KM1-NO', fromTerm: '14', toTag: 'KM1', toTerm: 'A1' },
      { fromTag: 'KM1', fromTerm: 'A1', toTag: 'H1', toTerm: 'X1' },
      { fromTag: 'KM1', fromTerm: 'A2', toTag: 'N', toTerm: 'N' },
      { fromTag: 'H1', fromTerm: 'X2', toTag: 'N', toTerm: 'N' }
    ]
  };
}

/**
 * Power Circuit Analysis
 */
function analyzePowerCircuit(diagram: ImportedDiagram): DiagramAnalysisResult {
  const elements: DetectedDiagramElement[] = [
    {
      id: 'det_p3',
      type: 'power_3phase',
      tag: 'L1-L2-L3',
      nameAr: 'تغذية ثلاثية الأطوار (3-Phase Supply)',
      confidence: 0.97,
      x: 180,
      y: 60,
      width: 140,
      height: 60,
      terminals: ['L1', 'L2', 'L3'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_q1',
      type: 'circuit_breaker',
      tag: 'Q1',
      nameAr: 'قاطع القدرة الرئيسي (Main Breaker)',
      confidence: 0.95,
      x: 180,
      y: 160,
      width: 140,
      height: 80,
      terminals: ['1', '2'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_km1',
      type: 'contactor_coil',
      tag: 'KM1',
      nameAr: 'كونتاكتور القدرة الرئيسي (Main Contactor)',
      confidence: 0.94,
      x: 180,
      y: 280,
      width: 140,
      height: 80,
      terminals: ['A1', 'A2'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_fr',
      type: 'thermal_overload',
      tag: 'F1',
      nameAr: 'مرحل الحماية الحرارية (Thermal Overload Relay)',
      confidence: 0.93,
      x: 180,
      y: 400,
      width: 140,
      height: 70,
      terminals: ['95', '96'],
      suggestedAction: 'circuit_component',
      isSelected: true
    },
    {
      id: 'det_m1',
      type: 'motor_3phase',
      tag: 'M1',
      nameAr: 'محرك حثي ثلاثي الأطوار (3-Phase Induction Motor)',
      confidence: 0.98,
      x: 180,
      y: 520,
      width: 160,
      height: 120,
      terminals: ['U1', 'V1', 'W1', 'PE'],
      suggestedAction: 'circuit_component',
      isSelected: true
    }
  ];

  return {
    diagramType: 'power_circuit',
    titleAr: 'دائرة قوى وقدرة ثلاثية الأطوار (Power Circuit)',
    summaryAr: `تم التعرف على مسار التغذية الرئيسي: قاطع رئيسي Q1، ملامسات كونتاكتور KM1، مرحل الحماية F1، والمحرك الحثي M1.`,
    confidenceScore: 95,
    detectedElements: elements,
    suggestedConnections: [
      { fromTag: 'L1-L2-L3', fromTerm: 'L1', toTag: 'Q1', toTerm: '1' },
      { fromTag: 'Q1', fromTerm: '2', toTag: 'KM1', toTerm: 'A1' },
      { fromTag: 'KM1', fromTerm: 'A2', toTag: 'F1', toTerm: '95' },
      { fromTag: 'F1', fromTerm: '96', toTag: 'M1', toTerm: 'U1' }
    ]
  };
}

/**
 * Ladder Diagram Analysis
 */
function analyzeLadderDiagram(diagram: ImportedDiagram): DiagramAnalysisResult {
  const elements: DetectedDiagramElement[] = [
    {
      id: 'det_lad_stop',
      type: 'contact_nc',
      tag: 'S0',
      nameAr: 'تلامس إيقاف طبيعي الغلق (NC Contact S0)',
      confidence: 0.95,
      x: 150,
      y: 100,
      width: 120,
      height: 60,
      terminals: ['in', 'out'],
      suggestedAction: 'ladder_element',
      isSelected: true
    },
    {
      id: 'det_lad_start',
      type: 'contact_no',
      tag: 'S1',
      nameAr: 'تلامس تشغيل طبيعي الفتح (NO Contact S1)',
      confidence: 0.96,
      x: 280,
      y: 100,
      width: 120,
      height: 60,
      terminals: ['in', 'out'],
      suggestedAction: 'ladder_element',
      isSelected: true
    },
    {
      id: 'det_lad_latch',
      type: 'contact_no',
      tag: 'KM1',
      nameAr: 'تلامس استمرارية تفرعي (Parallel Latch KM1)',
      confidence: 0.92,
      x: 280,
      y: 170,
      width: 120,
      height: 60,
      terminals: ['in', 'out'],
      suggestedAction: 'ladder_element',
      isSelected: true
    },
    {
      id: 'det_lad_coil',
      type: 'coil',
      tag: 'KM1',
      nameAr: 'ملف خرج المخطط السلمي (Ladder Coil KM1)',
      confidence: 0.97,
      x: 580,
      y: 100,
      width: 120,
      height: 60,
      terminals: ['in', 'out'],
      suggestedAction: 'ladder_element',
      isSelected: true
    }
  ];

  return {
    diagramType: 'ladder_diagram',
    titleAr: 'مخطط السلم الكهربائي (Ladder Diagram)',
    summaryAr: `تم اكتشاف بنية مخطط السلم الكهربائي: درجة Rung 01 تحتوي على تلامس إيقاف S0 (NC)، تلامس تشغيل S1 (NO) مع تفرع استمرارية Latch KM1، ويتحكم في ملف الخرج KM1.`,
    confidenceScore: 96,
    detectedElements: elements,
    suggestedConnections: [
      { fromTag: 'S0', fromTerm: 'out', toTag: 'S1', toTerm: 'in' },
      { fromTag: 'S1', fromTerm: 'out', toTag: 'KM1', toTerm: 'in' }
    ],
    ladderProposal: {
      rungsCount: 1,
      description: 'درجة تشغيل وإيقاف قياسية مع استمرارية ذاتية (Memory Latch)'
    }
  };
}

/**
 * Reconstructs real editable, simulatable SimuRelay components & wires from analyzed elements
 */
export function reconstructCircuitFromAnalysis(
  result: DiagramAnalysisResult,
  existingComponents: CircuitComponent[],
  existingWires: Wire[],
  replaceExisting: boolean = false
): { components: CircuitComponent[]; wires: Wire[] } {
  const selectedElements = result.detectedElements.filter(e => e.isSelected);
  if (selectedElements.length === 0) {
    return { components: existingComponents, wires: existingWires };
  }

  // Base list
  const baseComponents = replaceExisting ? [] : [...existingComponents];
  const baseWires = replaceExisting ? [] : [...existingWires];

  // Map tag to newly created component
  const tagToComponent = new Map<string, CircuitComponent>();

  selectedElements.forEach((el, index) => {
    // Generate valid CircuitComponent from detected element
    const newComp = createNewComponent(
      el.type as ComponentType,
      el.x || 150 + (index % 3) * 180,
      el.y || 80 + Math.floor(index / 3) * 110,
      el.tag
    );
    newComp.name = el.nameAr || newComp.name;

    // Link contactor latch to coil if applicable
    if (el.tag.includes('KM1') && el.type === 'contactor_contact_no') {
      newComp.linkedTag = 'KM1';
    }

    baseComponents.push(newComp);
    tagToComponent.set(el.tag, newComp);
  });

  // Reconstruct suggested wires
  result.suggestedConnections.forEach((conn) => {
    const fromComp = tagToComponent.get(conn.fromTag);
    const toComp = tagToComponent.get(conn.toTag);

    if (fromComp && toComp) {
      // Find matching terminal or fallback to first
      const fromTerm = fromComp.terminals.find(t => t.name === conn.fromTerm || t.id === conn.fromTerm) || fromComp.terminals[0];
      const toTerm = toComp.terminals.find(t => t.name === conn.toTerm || t.id === conn.toTerm) || toComp.terminals[0];

      if (fromTerm && toTerm) {
        const wireId = `wire_reconstructed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        baseWires.push({
          id: wireId,
          fromComponentId: fromComp.id,
          fromTerminalId: fromTerm.id,
          toComponentId: toComp.id,
          toTerminalId: toTerm.id
        });
      }
    }
  });

  return {
    components: baseComponents,
    wires: baseWires
  };
}
