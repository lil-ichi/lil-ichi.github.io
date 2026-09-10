/**
 * Cyberpunk HUD Web Audio API Sound Synthesizer & Ambient Engine
 * Procedural sci-fi sound effects + ambient cyberpunk drone generator.
 */
class CyberAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.ambientOscs = [];
    this.lfo = null;
    this.filter = null;
  }

  async init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  async toggle() {
    await this.init();
    this.enabled = !this.enabled;

    if (this.enabled) {
      this.playActivation();
      this.startAmbientDrone();
    } else {
      this.stopAmbientDrone();
    }

    return this.enabled;
  }

  // Continuous Ambient Cyber Synth Drone
  startAmbientDrone() {
    if (!this.ctx || !this.enabled) return;
    this.stopAmbientDrone();

    try {
      const now = this.ctx.currentTime;
      
      // Resonant Low-Pass Filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(450, now);
      this.filter.Q.setValueAtTime(3.5, now);

      // Low Frequency Oscillator for subtle breathing filter sweep
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.18, now); // Slow 0.18Hz sweep
      lfoGain.gain.setValueAtTime(150, now);
      this.lfo.connect(this.filter.frequency);
      this.lfo.start();

      // Cyber Drone Harmonics (C2 65.4Hz, G2 98.0Hz, C3 130.8Hz)
      const freqs = [65.41, 98.0, 130.81];
      this.ambientOscs = freqs.map((freq, i) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq + (i * 0.4), now); // subtle detune

        oscGain.gain.setValueAtTime(0.08, now);
        osc.connect(oscGain);
        oscGain.connect(this.filter);
        osc.start();
        return osc;
      });

      this.filter.connect(this.ambientGain);

      // Smooth Fade-In ambient drone
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.12, now + 1.2);
    } catch (e) {
      console.warn("Ambient audio start error:", e);
    }
  }

  stopAmbientDrone() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.ambientGain) {
        this.ambientGain.gain.cancelScheduledValues(now);
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      }
      setTimeout(() => {
        if (!this.enabled) {
          this.ambientOscs.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
          });
          this.ambientOscs = [];
          if (this.lfo) {
            try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) {}
            this.lfo = null;
          }
        }
      }, 550);
    } catch (e) {}
  }

  // High-Tech Cyber Activation Jingle
  playActivation() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major cyber sweep
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
    } catch (e) {}
  }

  // Laser chirp / UI Hover
  playHover() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Sharp cyber click
  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // Terminal keystroke
  playKey() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 520 + (Math.random() * 260 - 130);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  // Access Granted / Uplink Success
  playSuccess() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.14, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } catch (e) {}
  }

  // Glitch / Error alarm
  playError() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.setValueAtTime(160, now + 0.09);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

window.cyberAudio = new CyberAudio();
