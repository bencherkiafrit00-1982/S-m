// Industrial Electrical & Motor Sound Synthesis Engine (Web Audio API)
// Provides realistic 3-phase induction motor running sound, startup ramp-up,
// contactor mechanical clack, pushbutton clicks, overload trips, and electrical buzzes.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  // Active motor audio nodes
  private motorGainNode: GainNode | null = null;
  private motorHumOsc: OscillatorNode | null = null;
  private motorHarmonicOsc: OscillatorNode | null = null;
  private motorRotorOsc: OscillatorNode | null = null;
  private motorAirFilter: BiquadFilterNode | null = null;
  private motorNoiseNode: AudioNode | null = null;
  private isMotorRunning: boolean = false;

  constructor() {
    try {
      const savedMute = localStorage.getItem('simurelay_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('simurelay_sound_volume');
      if (savedVol !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
    } catch (e) {
      console.warn('Could not read sound preferences from localStorage', e);
    }
  }

  // Ensure AudioContext is initialized and resumed (browsers require user interaction)
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('simurelay_sound_muted', muted ? 'true' : 'false');
    } catch (e) {}

    if (muted && this.isMotorRunning) {
      this.stopMotorSound(0.1);
    }
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('simurelay_sound_volume', this.volume.toString());
    } catch (e) {}

    if (this.motorGainNode && this.ctx) {
      this.motorGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.45, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // 1. 3-Phase Induction Motor Running Sound (صوت المحرك الحثي ثلاثي الأطوار)
  public startMotorSound(speedRpm: number = 1450, mode: 'DOL' | 'STAR' | 'DELTA' = 'DOL'): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.isMotorRunning) {
      // Motor already humming, update speed pitch if changed
      this.updateMotorSpeed(speedRpm);
      return;
    }

    this.isMotorRunning = true;
    const now = ctx.currentTime;

    // Master Motor Volume Node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    // Smooth ramp up over 0.7s to simulate rotor inertia and acceleration
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.volume * 0.45), now + 0.7);
    masterGain.connect(ctx.destination);
    this.motorGainNode = masterGain;

    // Target base frequency for motor shaft & magnetic field:
    // 50Hz base mains hum + rotor fundamental (~95Hz for 1450 RPM, ~60Hz for 750 RPM Star mode)
    const targetFreq = mode === 'STAR' ? 62 : 108;

    // Oscillator 1: Low 50Hz electromagnetic hum (sine wave)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(45, now);
    humOsc.frequency.exponentialRampToValueAtTime(50, now + 0.6);
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.6, now);
    humOsc.connect(humGain);
    humGain.connect(masterGain);
    humOsc.start(now);
    this.motorHumOsc = humOsc;

    // Oscillator 2: 100Hz electromagnetic double harmonic (sawtooth wave filtered)
    const harmOsc = ctx.createOscillator();
    harmOsc.type = 'sawtooth';
    harmOsc.frequency.setValueAtTime(80, now);
    harmOsc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
    const harmFilter = ctx.createBiquadFilter();
    harmFilter.type = 'lowpass';
    harmFilter.frequency.setValueAtTime(180, now);
    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.25, now);
    harmOsc.connect(harmFilter);
    harmFilter.connect(harmGain);
    harmGain.connect(masterGain);
    harmOsc.start(now);
    this.motorHarmonicOsc = harmOsc;

    // Oscillator 3: Rotor mechanical whine & speed frequency (triangle wave with acceleration ramp)
    const rotorOsc = ctx.createOscillator();
    rotorOsc.type = 'triangle';
    rotorOsc.frequency.setValueAtTime(25, now);
    rotorOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.8);
    const rotorGain = ctx.createGain();
    rotorGain.gain.setValueAtTime(0.4, now);
    rotorOsc.connect(rotorGain);
    rotorGain.connect(masterGain);
    rotorOsc.start(now);
    this.motorRotorOsc = rotorOsc;

    // Noise Generator: Fan blade airflow and bearing whirr (filtered noise)
    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Pink-ish noise
        lastOut = output[i];
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(180, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(320, now + 0.8);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start(now);

      this.motorNoiseNode = noiseSource;
      this.motorAirFilter = noiseFilter;
    } catch (e) {
      console.warn('Could not start noise layer', e);
    }
  }

  // Update speed when switching Star to Delta or changing speed
  public updateMotorSpeed(speedRpm: number): void {
    if (!this.isMotorRunning || !this.ctx || !this.motorRotorOsc) return;
    const targetFreq = speedRpm <= 800 ? 62 : 108;
    this.motorRotorOsc.frequency.cancelScheduledValues(this.ctx.currentTime);
    this.motorRotorOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.4);
  }

  // Stop motor sound with deceleration / inertia spin-down (تدرج توقف المحرك)
  public stopMotorSound(duration: number = 0.8): void {
    if (!this.isMotorRunning || !this.ctx) return;
    this.isMotorRunning = false;
    const now = this.ctx.currentTime;

    if (this.motorGainNode) {
      this.motorGainNode.gain.cancelScheduledValues(now);
      this.motorGainNode.gain.setValueAtTime(this.motorGainNode.gain.value, now);
      this.motorGainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    if (this.motorRotorOsc) {
      this.motorRotorOsc.frequency.cancelScheduledValues(now);
      this.motorRotorOsc.frequency.setValueAtTime(this.motorRotorOsc.frequency.value, now);
      this.motorRotorOsc.frequency.exponentialRampToValueAtTime(15, now + duration);
    }

    setTimeout(() => {
      try {
        this.motorHumOsc?.stop();
        this.motorHumOsc?.disconnect();
        this.motorHarmonicOsc?.stop();
        this.motorHarmonicOsc?.disconnect();
        this.motorRotorOsc?.stop();
        this.motorRotorOsc?.disconnect();
        if (this.motorNoiseNode && 'stop' in this.motorNoiseNode) {
          (this.motorNoiseNode as AudioScheduledSourceNode).stop();
          this.motorNoiseNode.disconnect();
        }
      } catch (e) {}

      this.motorHumOsc = null;
      this.motorHarmonicOsc = null;
      this.motorRotorOsc = null;
      this.motorNoiseNode = null;
      this.motorGainNode = null;
      this.motorAirFilter = null;
    }, duration * 1000 + 50);
  }

  // 2. Heavy Contactor Clack / Snap (صوت لقطة الكونتاكتور الكهرومغناطيسي)
  public playContactorClack(isEnergized: boolean): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(this.volume * (isEnergized ? 0.7 : 0.5), now);
    master.connect(ctx.destination);

    // High frequency metallic strike (iron armature slamming against core)
    const clickOsc = ctx.createOscillator();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(isEnergized ? 650 : 850, now);
    clickOsc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.9, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    clickOsc.connect(clickGain);
    clickGain.connect(master);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // Deep body thud / enclosure resonance
    const thudOsc = ctx.createOscillator();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(isEnergized ? 160 : 210, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0.8, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    thudOsc.connect(thudGain);
    thudGain.connect(master);
    thudOsc.start(now);
    thudOsc.stop(now + 0.1);
  }

  // 3. Tactile Pushbutton Click (صوت كبس وتكة الزر الضاغط)
  public playButtonClick(isPressed: boolean): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isPressed ? 1200 : 950, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.025);

    const clickEnv = ctx.createGain();
    clickEnv.gain.setValueAtTime(0.8, now);
    clickEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(clickEnv);
    clickEnv.connect(gain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // 4. Thermal Overload Trip Alert / Latch Sound (صوت فصل الأوفرلود)
  public playOverloadTrip(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.65, now);
    gain.connect(ctx.destination);

    // Mechanical spring release latch
    const latchOsc = ctx.createOscillator();
    latchOsc.type = 'sawtooth';
    latchOsc.frequency.setValueAtTime(400, now);
    latchOsc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

    const latchGain = ctx.createGain();
    latchGain.gain.setValueAtTime(0.8, now);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    latchOsc.connect(latchGain);
    latchGain.connect(gain);
    latchOsc.start(now);
    latchOsc.stop(now + 0.08);

    // Dual warning chirps
    [0.08, 0.22].forEach(timeOffset => {
      const beepOsc = ctx.createOscillator();
      beepOsc.type = 'sine';
      beepOsc.frequency.setValueAtTime(880, now + timeOffset);

      const beepGain = ctx.createGain();
      beepGain.gain.setValueAtTime(0.001, now + timeOffset);
      beepGain.gain.linearRampToValueAtTime(0.5, now + timeOffset + 0.02);
      beepGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.09);

      beepOsc.connect(beepGain);
      beepGain.connect(gain);
      beepOsc.start(now + timeOffset);
      beepOsc.stop(now + timeOffset + 0.1);
    });
  }

  // 5. Short Circuit Spark & Electrical Arc Buzz (صوت ماس كهربائي وشرارة)
  public playShortCircuit(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(this.volume * 0.8, now);
    master.connect(ctx.destination);

    // Harsh electrical arc buzz (100Hz buzz + noise burst)
    const buzzOsc = ctx.createOscillator();
    buzzOsc.type = 'sawtooth';
    buzzOsc.frequency.setValueAtTime(100, now);

    const buzzGain = ctx.createGain();
    buzzGain.gain.setValueAtTime(0.85, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    buzzOsc.connect(buzzGain);
    buzzGain.connect(master);
    buzzOsc.start(now);
    buzzOsc.stop(now + 0.36);

    // High frequency electric crackle
    try {
      const bufferSize = ctx.sampleRate * 0.3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'highpass';
      bandpass.frequency.setValueAtTime(1500, now);

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0.6, now);

      noiseSource.connect(bandpass);
      bandpass.connect(crackleGain);
      crackleGain.connect(master);
      noiseSource.start(now);
    } catch (e) {}
  }

  // 6. Timer Relay Complete Chime (صوت تكة المؤقت واكتمال العد)
  public playTimerComplete(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // C6 clear chime
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.15);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.6, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(env);
    env.connect(gain);
    osc.start(now);
    osc.stop(now + 0.22);
  }
}

// Global Singleton Instance
export const soundEngine = new SoundEngine();
