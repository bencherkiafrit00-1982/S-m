import { 
  LadderDiagram, 
  LadderRung, 
  LadderBranch, 
  LadderParallelGroup, 
  LadderElement 
} from '../types/ladder';
import { CircuitComponent } from '../types/circuit';

export interface LadderEvaluationResult {
  ladder: LadderDiagram;
  hardwareComponents: CircuitComponent[];
  logs: string[];
}

/**
 * High-performance, scan-accurate simulation engine for Classic Control Ladder Diagrams.
 * Evaluates series-parallel rungs, edge contacts, set/reset latches, TON/TOF timers, and counters.
 * Synchronizes bi-directionally with realistic industrial hardware components.
 */
export function evaluateLadderDiagram(
  ladder: LadderDiagram,
  hardwareComponents: CircuitComponent[],
  deltaSeconds: number = 0.05,
  syncWithHardware: boolean = true,
  forcedInputs: Record<string, boolean> = {}
): LadderEvaluationResult {
  const startTime = performance.now();
  const logs: string[] = [];

  // Deep clone memory bits
  const memoryBits: Record<string, boolean> = { ...ladder.memoryBits };

  // 1. Build rapid lookup table of hardware component states
  const hwStateMap = new Map<string, {
    isActive: boolean;
    isPressed: boolean;
    isTripped: boolean;
    isEnergized: boolean;
    closed: boolean;
  }>();

  hardwareComponents.forEach(comp => {
    const isPressed = !!comp.isPressed;
    const isTripped = !!comp.isTripped;
    const isEnergized = !!comp.isEnergized;
    const closed = comp.closed !== false;

    // Normalization per component type:
    // For NO pushbuttons/contacts: signal is TRUE when pressed or closed.
    // For NC pushbuttons: signal is TRUE when pressed (actuated).
    // For thermal overload: signal is TRUE when tripped (fault active).
    // For breaker: signal is TRUE when tripped or manually open (fault/off).
    let isActive = false;
    if (comp.type === 'pushbutton_no') {
      isActive = isPressed || closed;
    } else if (comp.type === 'pushbutton_nc') {
      isActive = isPressed; // Actuated when pressed
    } else if (comp.type === 'thermal_overload') {
      isActive = isTripped; // Fault active when tripped
    } else if (comp.type === 'circuit_breaker') {
      isActive = isTripped || !closed; // Fault/Off when tripped or opened
    } else if (comp.type === 'contactor_coil' || comp.type === 'timer_coil' || comp.type === 'pilot_lamp') {
      isActive = isEnergized;
    } else if (comp.type === 'contactor_contact_no' || comp.type === 'timer_contact_no') {
      isActive = closed || isEnergized;
    } else if (comp.type === 'contactor_contact_nc' || comp.type === 'timer_contact_nc') {
      isActive = !closed;
    }

    hwStateMap.set(comp.tag, { isActive, isPressed, isTripped, isEnergized, closed });
    // Also index common variations (e.g. SB1, S0, FR, F1, KM1)
    if (comp.tag === 'S0') hwStateMap.set('SB1', { isActive, isPressed, isTripped, isEnergized, closed });
    if (comp.tag === 'S1') hwStateMap.set('SB2', { isActive, isPressed, isTripped, isEnergized, closed });
    if (comp.tag === 'S2') hwStateMap.set('SB3', { isActive, isPressed, isTripped, isEnergized, closed });
    if (comp.tag === 'F1') hwStateMap.set('FR', { isActive, isPressed, isTripped, isEnergized, closed });
    if (comp.tag === 'FR') hwStateMap.set('F1', { isActive, isPressed, isTripped, isEnergized, closed });
    if (comp.tag === 'Q1') hwStateMap.set('MCB', { isActive, isPressed, isTripped, isEnergized, closed });
  });

  // Helper to determine boolean signal for a given tag
  const getSignalState = (tag: string, linkedTag?: string): boolean => {
    // Check user forced inputs first
    if (forcedInputs[tag] !== undefined) return forcedInputs[tag];
    if (linkedTag && forcedInputs[linkedTag] !== undefined) return forcedInputs[linkedTag];

    // Check memory bits (from internal relays or coils)
    if (memoryBits[tag] !== undefined) return memoryBits[tag];
    if (linkedTag && memoryBits[linkedTag] !== undefined) return memoryBits[linkedTag];

    // Check hardware components
    if (hwStateMap.has(tag)) return hwStateMap.get(tag)!.isActive;
    if (linkedTag && hwStateMap.has(linkedTag)) return hwStateMap.get(linkedTag)!.isActive;

    return false;
  };

  // 2. Evaluate each Branch recursively
  const evaluateBranch = (branch: LadderBranch, incomingPower: boolean): boolean => {
    let currentPower = incomingPower;

    for (const item of branch.items) {
      if ('type' in item && item.type === 'parallel_group') {
        // Parallel group (OR logic): conducts if ANY branch conducts
        const group = item as LadderParallelGroup;
        let anyBranchConducted = false;

        for (const subBranch of group.branches) {
          const subConducted = evaluateBranch(subBranch, currentPower);
          if (subConducted) anyBranchConducted = true;
        }

        group.isPowerActive = currentPower && anyBranchConducted;
        currentPower = group.isPowerActive;
      } else {
        // Individual Ladder Element
        const el = item as LadderElement;
        const rawSignal = getSignalState(el.tag, el.linkedHardwareTag);
        let isConductive = false;

        switch (el.type) {
          case 'contact_no':
            // Normally Open: closes when signal is TRUE
            isConductive = rawSignal;
            break;

          case 'contact_nc':
            // Normally Closed: opens when signal is TRUE (conducts when signal is FALSE)
            isConductive = !rawSignal;
            break;

          case 'contact_rising': {
            // Rising Edge: conducts for exactly ONE scan when signal transitions from false to true
            const prev = el.prevInputState || false;
            isConductive = !prev && rawSignal;
            el.prevInputState = rawSignal;
            break;
          }

          case 'contact_falling': {
            // Falling Edge: conducts for ONE scan on transition from true to false
            const prev = el.prevInputState || false;
            isConductive = prev && !rawSignal;
            el.prevInputState = rawSignal;
            break;
          }

          case 'compare_block': {
            const v1 = parseFloat(el.compareVal1 || '0');
            const v2 = parseFloat(el.compareVal2 || '0');
            const op = el.compareOp || '==';
            if (op === '==') isConductive = v1 === v2;
            else if (op === '!=') isConductive = v1 !== v2;
            else if (op === '>') isConductive = v1 > v2;
            else if (op === '<') isConductive = v1 < v2;
            else if (op === '>=') isConductive = v1 >= v2;
            else if (op === '<=') isConductive = v1 <= v2;
            break;
          }

          default:
            isConductive = rawSignal;
            break;
        }

        el.isStateActive = isConductive;
        el.isPowerActive = currentPower && isConductive;
        currentPower = el.isPowerActive;
      }
    }

    branch.isPowerActive = currentPower;
    return currentPower;
  };

  // 3. Evaluate each Rung sequentially
  const updatedRungs = ladder.rungs.map(rung => {
    // Left power rail is energized (Phase potential = true)
    const rungInputPower = true;
    const conditionMet = evaluateBranch(rung.mainBranch, rungInputPower);
    rung.isPowerActive = conditionMet;

    // Evaluate action outputs on the right rail
    const updatedOutputs = rung.outputs.map(output => {
      output.isPowerActive = conditionMet;

      switch (output.type) {
        case 'coil_standard':
          output.isStateActive = conditionMet;
          memoryBits[output.tag] = conditionMet;
          break;

        case 'coil_set':
          if (conditionMet) {
            memoryBits[output.tag] = true;
          }
          output.isStateActive = !!memoryBits[output.tag];
          break;

        case 'coil_reset':
          if (conditionMet) {
            memoryBits[output.tag] = false;
          }
          output.isStateActive = !!memoryBits[output.tag];
          break;

        case 'coil_negated':
          output.isStateActive = !conditionMet;
          memoryBits[output.tag] = !conditionMet;
          break;

        case 'timer_ton': {
          const pt = output.presetTime || 3.0;
          let et = output.elapsedTime || 0;

          if (conditionMet) {
            et = Math.min(pt, et + deltaSeconds);
            const isDone = et >= pt;
            output.isStateActive = isDone;
            memoryBits[output.tag] = isDone;
          } else {
            et = 0;
            output.isStateActive = false;
            memoryBits[output.tag] = false;
          }
          output.elapsedTime = et;
          break;
        }

        case 'timer_tof': {
          const pt = output.presetTime || 3.0;
          let et = output.elapsedTime || 0;

          if (conditionMet) {
            et = 0;
            output.isStateActive = true;
            memoryBits[output.tag] = true;
          } else {
            // Timing off delay
            if (output.isStateActive) {
              et = Math.min(pt, et + deltaSeconds);
              if (et >= pt) {
                output.isStateActive = false;
                memoryBits[output.tag] = false;
              }
            }
          }
          output.elapsedTime = et;
          break;
        }

        case 'timer_tp': {
          const pt = output.presetTime || 3.0;
          let et = output.elapsedTime || 0;
          const wasActive = output.isStateActive || false;

          if (conditionMet && !wasActive) {
            et = 0;
            output.isStateActive = true;
            memoryBits[output.tag] = true;
          } else if (wasActive) {
            et = Math.min(pt, et + deltaSeconds);
            if (et >= pt) {
              output.isStateActive = false;
              memoryBits[output.tag] = false;
            }
          }
          output.elapsedTime = et;
          break;
        }

        case 'counter_ctu': {
          const pv = output.presetCount || 5;
          let cv = output.currentCount || 0;
          const prev = output.prevInputState || false;

          // Rising edge of count input
          if (!prev && conditionMet) {
            cv = Math.min(999, cv + 1);
          }
          output.prevInputState = conditionMet;
          output.currentCount = cv;
          output.isStateActive = cv >= pv;
          memoryBits[output.tag] = output.isStateActive;
          break;
        }

        default:
          output.isStateActive = conditionMet;
          memoryBits[output.tag] = conditionMet;
          break;
      }

      return output;
    });

    return {
      ...rung,
      outputs: updatedOutputs
    };
  });

  // 4. Two-Way Hardware Circuit Synchronization
  let updatedHardwareComponents = hardwareComponents;
  if (syncWithHardware) {
    updatedHardwareComponents = hardwareComponents.map(comp => {
      // Find if this hardware component corresponds to any coil or output in Ladder
      const matchingBit = memoryBits[comp.tag];

      // Contactor Coil synchronization (active if energized in ladder OR in hardware circuit)
      if (comp.type === 'contactor_coil') {
        const ladderActive = matchingBit === true;
        const circuitActive = comp.isEnergized === true;
        const isCoilActive = ladderActive || circuitActive;
        return {
          ...comp,
          isEnergized: isCoilActive
        };
      }

      // Auxiliary Contacts synchronization
      if (comp.type === 'contactor_contact_no') {
        const linkedActive = comp.linkedTag 
          ? (memoryBits[comp.linkedTag] === true || hardwareComponents.find(c => c.tag === comp.linkedTag)?.isEnergized === true)
          : false;
        const coilState = comp.linkedTag ? linkedActive : comp.closed;
        return {
          ...comp,
          closed: coilState,
          isEnergized: coilState
        };
      }

      if (comp.type === 'contactor_contact_nc') {
        const linkedActive = comp.linkedTag 
          ? (memoryBits[comp.linkedTag] === true || hardwareComponents.find(c => c.tag === comp.linkedTag)?.isEnergized === true)
          : false;
        const coilState = comp.linkedTag ? linkedActive : !comp.closed;
        return {
          ...comp,
          closed: !coilState,
          isEnergized: !coilState
        };
      }

      // Timer Coil synchronization
      if (comp.type === 'timer_coil') {
        const isTimerActive = (matchingBit === true) || comp.isEnergized;
        return {
          ...comp,
          isEnergized: isTimerActive
        };
      }

      // Pilot Lamp synchronization
      if (comp.type === 'pilot_lamp') {
        const isLampActive = (matchingBit === true) || comp.isEnergized;
        return {
          ...comp,
          isEnergized: isLampActive
        };
      }

      return comp;
    });

    // Evaluate motor running condition based on contactor states and overload
    const km1Active = (memoryBits['KM1'] === true) || !!updatedHardwareComponents.find(c => c.tag === 'KM1')?.isEnergized;
    const km2Active = (memoryBits['KM2'] === true) || !!updatedHardwareComponents.find(c => c.tag === 'KM2')?.isEnergized;
    const kmStarActive = (memoryBits['KM_STAR'] === true) || !!updatedHardwareComponents.find(c => c.tag === 'KM_STAR')?.isEnergized;
    const kmDeltaActive = (memoryBits['KM_DELTA'] === true) || !!updatedHardwareComponents.find(c => c.tag === 'KM_DELTA')?.isEnergized;
    const frOverload = updatedHardwareComponents.find(c => c.type === 'thermal_overload');
    const isOverloadTripped = frOverload?.isTripped;
    const mcb = updatedHardwareComponents.find(c => c.type === 'circuit_breaker');
    const isMcbOff = mcb ? (mcb.isTripped || mcb.closed === false) : false;

    updatedHardwareComponents = updatedHardwareComponents.map(comp => {
      if (comp.type === 'motor_3phase') {
        if (isOverloadTripped || isMcbOff) {
          return { ...comp, motorRunning: false, motorDirection: 'STOPPED', motorSpeed: 0 };
        } else if (km1Active && !km2Active) {
          const speed = kmStarActive ? 750 : 1450;
          const mode = kmStarActive ? 'STAR' : kmDeltaActive ? 'DELTA' : 'DOL';
          return { ...comp, motorRunning: true, motorDirection: 'CW', motorSpeed: speed, motorMode: mode };
        } else if (km2Active && !km1Active) {
          return { ...comp, motorRunning: true, motorDirection: 'CCW', motorSpeed: 1450 };
        } else {
          return { ...comp, motorRunning: false, motorDirection: 'STOPPED', motorSpeed: 0 };
        }
      }
      return comp;
    });
  }

  // Calculate Scan Cycle timing in milliseconds
  const elapsedMs = Math.max(0.2, performance.now() - startTime);

  return {
    ladder: {
      ...ladder,
      rungs: updatedRungs,
      memoryBits,
      scanCycleMs: parseFloat(elapsedMs.toFixed(2)),
      scanCount: (ladder.scanCount || 0) + 1
    },
    hardwareComponents: updatedHardwareComponents,
    logs
  };
}
