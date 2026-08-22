// Web Audio API procedural atmospheric weather ASMR synthesizer
// Generates zero-dependency real-time ambient soundscapes matching live weather conditions

class WeatherAsmrEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentCondition: string = 'clear';
  private rainNoiseNode: AudioNode | null = null;
  private windNoiseNode: AudioNode | null = null;
  private toneOscillator: OscillatorNode | null = null;
  private dropletTimer: number | null = null;
  private thunderTimer: number | null = null;
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create a continuous white/pink noise buffer for wind and rain simulation
  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 3dB/octave pinking filter
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Synthesize soft raindrop transient
  private triggerDroplet() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = 1200 + Math.random() * 1400;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06 * Math.random(), this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Ignore transient errors
    }
  }

  // Synthesize distant deep thunderstorm rumble
  private triggerThunder() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 3.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 4.2);
    } catch {
      // Ignore transient errors
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public play(conditionType: string, isDay: boolean = true) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopNodes();
    this.isPlaying = true;
    this.currentCondition = conditionType.toLowerCase();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer();

    if (this.currentCondition.includes('rain') || this.currentCondition.includes('drizzle') || this.currentCondition.includes('shower')) {
      // Rain ASMR: Filtered pink noise + continuous droplet transients
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(0.7, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 1.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      this.rainNoiseNode = noise;

      // Regular random raindrop scheduler
      this.dropletTimer = window.setInterval(() => {
        if (Math.random() < 0.8) {
          this.triggerDroplet();
        }
      }, 70);

    } else if (this.currentCondition.includes('thunder') || this.currentCondition.includes('storm')) {
      // Thunderstorm ASMR: Heavier rain + low rumble bursts
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      this.rainNoiseNode = noise;

      this.dropletTimer = window.setInterval(() => {
        this.triggerDroplet();
      }, 50);

      this.thunderTimer = window.setInterval(() => {
        if (Math.random() < 0.45) {
          this.triggerThunder();
        }
      }, 7000);
      // Trigger one initial thunder rumble
      setTimeout(() => this.triggerThunder(), 1200);

    } else if (this.currentCondition.includes('wind') || this.currentCondition.includes('breeze') || this.currentCondition.includes('snow')) {
      // Wind / Snow ASMR: Swirling modulated lowpass wind soundscape
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(120, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      this.windNoiseNode = noise;

    } else {
      // Sunny / Clear ASMR: Tranquil warm harmonic drone with soft natural undertones
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const baseFreq = isDay ? 174 : 108; // Solfeggio tranquil frequencies

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 2.0);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc2.start(now);
      this.toneOscillator = osc;
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopNodes();
  }

  private stopNodes() {
    if (this.dropletTimer) {
      clearInterval(this.dropletTimer);
      this.dropletTimer = null;
    }
    if (this.thunderTimer) {
      clearInterval(this.thunderTimer);
      this.thunderTimer = null;
    }
    try {
      if (this.rainNoiseNode) {
        (this.rainNoiseNode as AudioBufferSourceNode).stop();
        this.rainNoiseNode.disconnect();
        this.rainNoiseNode = null;
      }
      if (this.windNoiseNode) {
        (this.windNoiseNode as AudioBufferSourceNode).stop();
        this.windNoiseNode.disconnect();
        this.windNoiseNode = null;
      }
      if (this.toneOscillator) {
        this.toneOscillator.stop();
        this.toneOscillator.disconnect();
        this.toneOscillator = null;
      }
    } catch {
      // Ignore disconnect errors
    }
  }
}

export const weatherAsmr = new WeatherAsmrEngine();
