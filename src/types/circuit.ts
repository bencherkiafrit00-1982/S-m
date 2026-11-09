export type CircuitRenderStyle = 'schematic' | 'realistic';

export type ComponentType = 
  | 'power_phase'
  | 'power_neutral'
  | 'power_3phase'
  | 'circuit_breaker'
  | 'pushbutton_no'
  | 'pushbutton_nc'
  | 'contactor_coil'
  | 'contactor_contact_no'
  | 'contactor_contact_nc'
  | 'timer_coil'
  | 'timer_contact_no'
  | 'timer_contact_nc'
  | 'thermal_overload'
  | 'motor_3phase'
  | 'pilot_lamp';

export interface Terminal {
  id: string;
  name: string;
  x: number;
  y: number;
  isEnergized?: boolean;
  polarity?: 'phase' | 'neutral' | 'none';
}

export interface CircuitComponent {
  id: string;
  name: string;
  tag: string; // e.g., KM1, S0, S1, KT1, M1, F1, H1
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  terminals: Terminal[];
  
  // Dynamic state
  isPressed?: boolean; // For pushbuttons
  isEnergized?: boolean; // For coils / lamps / motors
  isTripped?: boolean; // For thermal overload / breakers
  closed?: boolean; // Contact closed or open
  
  // Linkages
  linkedTag?: string; // Links a contact to a coil (e.g. KM1 NO -> KM1 coil)
  timerSeconds?: number; // Configured timer duration
  timerElapsed?: number; // Current timer elapsed progress
  
  // Specific properties
  rotation?: number; // 0, 90, 180, 270 degrees
  motorRunning?: boolean;
  motorDirection?: 'CW' | 'CCW' | 'STOPPED';
  motorSpeed?: number;
  motorMode?: 'STAR' | 'DELTA' | 'DOL';
  color?: string; // For lamps: green, red, amber, blue
  symbolSvg?: string; // Schematic symbol type
}

export interface Wire {
  id: string;
  fromComponentId: string;
  fromTerminalId: string;
  toComponentId: string;
  toTerminalId: string;
  isEnergized?: boolean;
  type?: 'control' | 'power';
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // 1x, 0.5x, 2x
  shortCircuitDetected: boolean;
  activePathIds: Set<string>;
  stepCount: number;
  logs: string[];
}

export interface CircuitPreset {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  descriptionAr: string;
  components: CircuitComponent[];
  wires: Wire[];
  theoryAr: string[];
}

import { ImportedDiagram } from './diagram';

export interface CircuitProject {
  id: string;
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  components: CircuitComponent[];
  wires: Wire[];
  isCustom?: boolean;
  importedDiagram?: ImportedDiagram;
}
