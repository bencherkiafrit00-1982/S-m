export interface ImportedDiagram {
  id: string;
  name: string;
  sourceType: 'pdf' | 'image' | 'camera' | 'sample';
  dataUrl: string; // Base64 or object URL (also backed up in IndexedDB)
  pageNumber?: number;
  totalPages?: number;
  fileName?: string;
  fileSize?: number;
  
  // Canvas coordinate & transformation
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  rotation: number; // 0, 90, 180, 270
  opacity: number; // 0.05 to 1.0 (default: 0.70)
  
  // Interaction & display states
  isLocked: boolean; // When locked, clicks pass through or don't move diagram
  isVisible: boolean; // Show / hide
  hasWhiteBackdrop?: boolean; // Clean white sheet backing for high contrast readability
  layerPosition?: 'front' | 'back'; // Display in front of components or as background under components
  
  // Image filter adjustments
  brightness: number; // 0.5 to 1.5 (default 1)
  contrast: number; // 0.5 to 2.0 (default 1)
  grayscale: boolean; // Monochromatic filter
  invert: boolean; // Invert colors (ideal for dark schematic mode)
  highContrastDoc: boolean; // High contrast binarization for clear symbols

  // Target viewport
  targetCanvas: 'circuit' | 'ladder' | 'both';
  createdAt: string;
}

export interface DetectedDiagramElement {
  id: string;
  type: string;
  tag: string;
  nameAr: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  terminals: string[];
  suggestedAction: 'circuit_component' | 'ladder_element' | 'wire_connection';
  isSelected: boolean;
}

export interface DiagramAnalysisResult {
  diagramType: 'control_circuit' | 'power_circuit' | 'ladder_diagram' | 'mixed_panel';
  titleAr: string;
  summaryAr: string;
  confidenceScore: number;
  detectedElements: DetectedDiagramElement[];
  suggestedConnections: {
    fromTag: string;
    fromTerm: string;
    toTag: string;
    toTerm: string;
  }[];
  ladderProposal?: {
    rungsCount: number;
    description: string;
  };
}
