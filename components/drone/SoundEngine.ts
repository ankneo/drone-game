export class SoundEngine {
  ctx: AudioContext | null = null;
  thrustOsc: OscillatorNode | null = null;
  thrustGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    this.thrustOsc = this.ctx.createOscillator();
    this.thrustOsc.type = 'sawtooth';
    this.thrustOsc.frequency.value = 60;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    this.thrustGain = this.ctx.createGain();
    this.thrustGain.gain.value = 0;

    this.thrustOsc.connect(filter);
    filter.connect(this.thrustGain);
    this.thrustGain.connect(this.ctx.destination);
    this.thrustOsc.start();
  }

  setThrust(active: boolean) {
    if (!this.ctx || !this.thrustGain) return;
    const target = active ? 0.15 : 0;
    this.thrustGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
  }

  playCrash() {
    if (!this.ctx) return;
    this.setThrust(false);
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playWin() {
    if (!this.ctx) return;
    this.setThrust(false);
    const playNote = (freq: number, timeOffset: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, this.ctx!.currentTime + timeOffset);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + timeOffset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + timeOffset + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + timeOffset);
      osc.stop(this.ctx!.currentTime + timeOffset + 0.4);
    };
    playNote(523.25, 0);    // C5
    playNote(659.25, 0.15); // E5
    playNote(783.99, 0.3);  // G5
    playNote(1046.50, 0.45); // C6
  }

  playClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playPowerup() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}
