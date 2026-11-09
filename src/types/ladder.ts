import { CircuitComponent, Wire } from './circuit';

export type LadderContactType = 
  | 'contact_no'       // Normally Open: —| |—
  | 'contact_nc'       // Normally Closed: —|/|—
  | 'contact_rising'   // Rising Edge: —|P|—
  | 'contact_falling'; // Falling Edge: —|N|—

export type LadderCoilType = 
  | 'coil_standard'    // Standard Output: —( )—
  | 'coil_set'         // Set / Latch: —(S)—
  | 'coil_reset'       // Reset / Unlatch: —(R)—
  | 'coil_negated';    // Negated Output: —(/)—

export type LadderBlockType = 
  | 'timer_ton'        // On-Delay Timer
  | 'timer_tof'        // Off-Delay Timer
  | 'timer_tp'         // Pulse Timer
  | 'counter_ctu'      // Count Up
  | 'counter_ctd'      // Count Down
  | 'counter_ctud'     // Count Up/Down
  | 'compare_block'    // Comparison: ==, !=, >, <, >=, <=
  | 'memory_bit';      // Internal Memory Bit flag

export type LadderElementType = LadderContactType | LadderCoilType | LadderBlockType;

export interface LadderElement {
  id: string;
  type: LadderElementType;
  tag: string; // e.g. SB1, SB2, KM1, FR, T1, C1, M0.0
  labelAr?: string; // Arabic description (e.g. زر إيقاف NC)
  linkedHardwareTag?: string; // Links directly to CircuitComponent.tag in realistic circuit

  // Timer configuration & state
  presetTime?: number; // PT in seconds (e.g. 5.0s)
  elapsedTime?: number; // ET in seconds

  // Counter configuration & state
  presetCount?: number; // PV
  currentCount?: number; // CV

  // Compare block
  compareOp?: '==' | '!=' | '>' | '<' | '>=' | '<=';
  compareVal1?: string;
  compareVal2?: string;

  // Real-time evaluation state (calculated per scan cycle)
  isPowerActive?: boolean; // Power flowing through this element
  isStateActive?: boolean; // Contact is closed or coil energized
  prevInputState?: boolean; // Used for edge detection (Rising P / Falling N)
}

export interface LadderBranch {
  id: string;
  items: (LadderElement | LadderParallelGroup)[];
  isPowerActive?: boolean;
}

export interface LadderParallelGroup {
  id: string;
  type: 'parallel_group';
  branches: LadderBranch[]; // Multiple parallel paths (OR logic)
  isPowerActive?: boolean;
}

export interface LadderRung {
  id: string;
  rungNumber: number;
  commentAr?: string;
  mainBranch: LadderBranch; // Condition branch on the left
  outputs: LadderElement[];  // Action coils / timers on the right
  isPowerActive?: boolean;
}

export interface LadderDiagram {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  rungs: LadderRung[];
  memoryBits: Record<string, boolean>; // M0.0, B1, etc.
  scanCycleMs: number; // e.g. 0.8 ms
  scanCount: number;
  isPaused: boolean;
}

export type ViewMode = 'real_circuit' | 'classic_ladder' | 'split_view';

export interface ClassicControlPreset {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  descriptionAr: string;
  theoryAr: string[];
  ladder: LadderDiagram;
  hardwareComponents: CircuitComponent[];
  hardwareWires: Wire[];
}
