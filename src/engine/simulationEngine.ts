import { CircuitComponent, Wire } from '../types/circuit';

export interface EngineResult {
  components: CircuitComponent[];
  wires: Wire[];
  shortCircuit: boolean;
  logs: string[];
}

export function solveCircuit(
  components: CircuitComponent[],
  wires: Wire[],
  deltaSeconds: number = 0.05
): EngineResult {
  const compMap = new Map<string, CircuitComponent>();
  // Clone components deeply
  components.forEach(c => {
    compMap.set(c.id, {
      ...c,
      terminals: c.terminals.map(t => ({ ...t, isEnergized: false, polarity: 'none' }))
    });
  });

  const logs: string[] = [];
  let shortCircuit = false;

  // Track energized coil tags (KM1, KT1, etc.)
  const energizedCoilTags = new Set<string>();
  const timedOutTimerTags = new Set<string>();

  // Advance timers for already active timer coils
  compMap.forEach(comp => {
    if (comp.type === 'timer_coil' && comp.isEnergized) {
      const elapsed = (comp.timerElapsed || 0) + deltaSeconds;
      comp.timerElapsed = elapsed;
      if (elapsed >= (comp.timerSeconds || 3)) {
        timedOutTimerTags.add(comp.tag);
      }
    } else if (comp.type === 'timer_coil' && !comp.isEnergized) {
      comp.timerElapsed = 0;
    }
  });

  // Iterative propagation loop (steady state convergence)
  const MAX_ITERATIONS = 12;
  let changed = true;
  let iteration = 0;
  let terminalPolarity = new Map<string, 'phase' | 'neutral' | 'none'>();

  while (changed && iteration < MAX_ITERATIONS) {
    changed = false;
    iteration++;

    // 1. Identify which coils are currently energized
    const currentCoils = new Set<string>();
    compMap.forEach(c => {
      if ((c.type === 'contactor_coil' || c.type === 'timer_coil') && c.isEnergized) {
        currentCoils.add(c.tag);
      }
    });

    // 2. Update contact conductivities based on coil and push-button states
    compMap.forEach(c => {
      if (c.type === 'pushbutton_no') {
        c.closed = !!c.isPressed;
      } else if (c.type === 'pushbutton_nc') {
        c.closed = !c.isPressed;
      } else if (c.type === 'circuit_breaker') {
        c.closed = !c.isTripped && c.closed !== false;
      } else if (c.type === 'contactor_contact_no') {
        c.closed = c.linkedTag ? currentCoils.has(c.linkedTag) : false;
      } else if (c.type === 'contactor_contact_nc') {
        c.closed = c.linkedTag ? !currentCoils.has(c.linkedTag) : true;
      } else if (c.type === 'timer_contact_no') {
        c.closed = c.linkedTag ? timedOutTimerTags.has(c.linkedTag) : false;
      } else if (c.type === 'timer_contact_nc') {
        c.closed = c.linkedTag ? !timedOutTimerTags.has(c.linkedTag) : true;
      } else if (c.type === 'thermal_overload') {
        c.closed = !c.isTripped;
      }
    });

    // 3. Build electrical node connectivity graph
    // Terminal global key = `${comp.id}:${term.id}`
    terminalPolarity = new Map<string, 'phase' | 'neutral' | 'none'>();

    // Initialize supply points
    compMap.forEach(c => {
      if (c.type === 'power_phase' || c.type === 'power_3phase') {
        c.terminals.forEach(t => terminalPolarity.set(`${c.id}:${t.id}`, 'phase'));
      } else if (c.type === 'power_neutral') {
        c.terminals.forEach(t => terminalPolarity.set(`${c.id}:${t.id}`, 'neutral'));
      }
    });

    // Connectivity propagation across wires and closed component paths
    let propChanged = true;
    let propIter = 0;
    while (propChanged && propIter < 20) {
      propChanged = false;
      propIter++;

      // Propagate across wires
      wires.forEach(w => {
        const keyA = `${w.fromComponentId}:${w.fromTerminalId}`;
        const keyB = `${w.toComponentId}:${w.toTerminalId}`;
        const polA = terminalPolarity.get(keyA) || 'none';
        const polB = terminalPolarity.get(keyB) || 'none';

        if (polA !== 'none' && polB === 'none') {
          terminalPolarity.set(keyB, polA);
          propChanged = true;
        } else if (polB !== 'none' && polA === 'none') {
          terminalPolarity.set(keyA, polB);
          propChanged = true;
        } else if (polA !== 'none' && polB !== 'none' && polA !== polB) {
          // Direct short-circuit between Phase and Neutral!
          shortCircuit = true;
        }
      });

      // Propagate internal conductive paths through closed contacts / switches
      compMap.forEach(c => {
        if (c.closed) {
          if (c.terminals.length >= 2) {
            const key1 = `${c.id}:${c.terminals[0].id}`;
            const key2 = `${c.id}:${c.terminals[1].id}`;
            const p1 = terminalPolarity.get(key1) || 'none';
            const p2 = terminalPolarity.get(key2) || 'none';

            if (p1 !== 'none' && p2 === 'none') {
              terminalPolarity.set(key2, p1);
              propChanged = true;
            } else if (p2 !== 'none' && p1 === 'none') {
              terminalPolarity.set(key1, p2);
              propChanged = true;
            }
          }
        }
      });
    }

    // 4. Check load elements (Coils, Lamps, Motors)
    compMap.forEach(c => {
      if (c.type === 'contactor_coil' || c.type === 'timer_coil' || c.type === 'pilot_lamp') {
        if (c.terminals.length >= 2) {
          const pA1 = terminalPolarity.get(`${c.id}:${c.terminals[0].id}`) || 'none';
          const pA2 = terminalPolarity.get(`${c.id}:${c.terminals[1].id}`) || 'none';
          const isEnergized = (pA1 === 'phase' && pA2 === 'neutral') || (pA1 === 'neutral' && pA2 === 'phase');

          if (c.isEnergized !== isEnergized) {
            c.isEnergized = isEnergized;
            changed = true;
            if (isEnergized) {
              logs.push(`[${new Date().toLocaleTimeString()}] تم تغذية ملف ${c.tag}`);
            }
          }
        }
      }
    });
  }

  // Final pass: Update terminal visuals, wire currents, and motor operation
  compMap.forEach(c => {
    c.terminals = c.terminals.map(t => {
      const pol = terminalPolarity.get(`${c.id}:${t.id}`) || 'none';
      return {
        ...t,
        polarity: pol,
        isEnergized: pol !== 'none'
      };
    });

    // If contact is closed and carrying phase potential, mark it energized
    if (c.closed && c.terminals.some(t => t.polarity === 'phase')) {
      c.isEnergized = true;
    }
  });

  const updatedComponents = Array.from(compMap.values());
  const updatedWires = wires.map(w => {
    const polFrom = terminalPolarity.get(`${w.fromComponentId}:${w.fromTerminalId}`) || 'none';
    const polTo = terminalPolarity.get(`${w.toComponentId}:${w.toTerminalId}`) || 'none';
    // Wire is live if either end has phase potential
    const isEnergized = polFrom === 'phase' || polTo === 'phase';
    return { ...w, isEnergized };
  });

  // Evaluate motors
  updatedComponents.forEach(c => {
    if (c.type === 'motor_3phase') {
      // Find controlling contactors (KM1 for forward, KM2 for reverse)
      const km1 = updatedComponents.find(comp => comp.tag === 'KM1' && comp.type === 'contactor_coil');
      const km2 = updatedComponents.find(comp => comp.tag === 'KM2' && comp.type === 'contactor_coil');
      const kmStar = updatedComponents.find(comp => comp.tag === 'KM_STAR' && comp.type === 'contactor_coil');
      const kmDelta = updatedComponents.find(comp => comp.tag === 'KM_DELTA' && comp.type === 'contactor_coil');
      const overload = updatedComponents.find(comp => comp.type === 'thermal_overload');

      const isOverloadTripped = overload?.isTripped;
      const mcb = updatedComponents.find(comp => comp.type === 'circuit_breaker');
      const isMcbOff = mcb ? (mcb.isTripped || mcb.closed === false) : false;

      if (isOverloadTripped || isMcbOff) {
        c.motorRunning = false;
        c.motorDirection = 'STOPPED';
        c.motorSpeed = 0;
      } else if (km1?.isEnergized && km2?.isEnergized && c.tag !== 'M2') {
        // Direct phase interlock clash!
        shortCircuit = true;
        c.motorRunning = false;
        c.motorDirection = 'STOPPED';
      } else if (c.tag === 'M2') {
        // Dedicated Motor 2 driven by KM2
        if (km2?.isEnergized) {
          c.motorRunning = true;
          c.motorDirection = 'CW';
          c.motorSpeed = 1450;
          c.motorMode = 'DOL';
        } else {
          c.motorRunning = false;
          c.motorDirection = 'STOPPED';
          c.motorSpeed = 0;
        }
      } else if (km1?.isEnergized) {
        c.motorRunning = true;
        c.motorDirection = 'CW';
        if (kmStar?.isEnergized) {
          c.motorMode = 'STAR';
          c.motorSpeed = 750;
        } else if (kmDelta?.isEnergized) {
          c.motorMode = 'DELTA';
          c.motorSpeed = 1450;
        } else {
          c.motorMode = 'DOL';
          c.motorSpeed = 1450;
        }
      } else if (km2?.isEnergized) {
        c.motorRunning = true;
        c.motorDirection = 'CCW';
        c.motorSpeed = 1450;
      } else {
        c.motorRunning = false;
        c.motorDirection = 'STOPPED';
        c.motorSpeed = 0;
      }
    }
  });

  return {
    components: updatedComponents,
    wires: updatedWires,
    shortCircuit,
    logs
  };
}
