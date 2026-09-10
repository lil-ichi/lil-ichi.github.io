/**
 * Cyberpunk Neural Soundscape & Procedural Synth Engine
 * Features a real-time procedural 118 BPM Cyberpunk / Darkwave synth sequencer,
 * sub-bass drone, filter sweeps, telemetry micro-beeps, and crisp sci-fi SFX.
 */
class CyberAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    // Sequencer State
    this.isPlayingMusic = false;
    this.bpm = 118;
    this.step = 0;
    this.timerId = null;
    this.filterNode = null;
    this.subOsc = null;
    this.subGain = null;
    this.droneGain = null;
    this.droneOscs = [];
    this.telemetryTimer = null;

    // Cyber Synth Bassline Pattern (Dm - Bb - C - Am progression)
    // MIDI frequencies for D2, F2, G2, A2, Bb2, C3, D3
    this.noteMap = {
      'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00,
      'A2': 110.00, 'Bb2': 116.54, 'C3': 130.81, 'D3': 146.83,
      'E3': 164.81, 'F3': 174.61, 'A3': 220.00, 'C4': 261.63,
      '.': 0 // Rest
    };

    // 16-step bassline sequence (Classic Cyberpunk 2077 / Synthwave drive)
    this.bassPattern = [
      'D2', 'D2', 'D3', 'D2',  'F2', 'D2', 'A2', 'G2',
      'Bb2', 'Bb2', 'D3', 'Bb2', 'C3', 'C3', 'A2', 'C3'
    ];

    // Counter Melody Arp Pattern
    this.leadPattern = [
      'D3', '.', 'F3', '.', 'A3', '.', 'D3', '.',
      'Bb2', '.', 'D3', '.', 'C3', '.', 'E3', '.'
    ];
  }

  async init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Dedicated Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Dedicated SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Resonant Lowpass Filter for the entire synth engine
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(850, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(4.5, this.ctx.currentTime);
      this.filterNode.connect(this.musicGain);
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
      this.startCyberMusic();
      this.startTelemetryGlips();
    } else {
      this.stopCyberMusic();
      this.stopTelemetryGlips();
    }

    return this.enabled;
  }

  // =========================================================================
  // PROCEDURAL CYBER MUSIC SEQUENCER
  // =========================================================================
  startCyberMusic() {
    if (!this.ctx || this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.step = 0;

    // Fade in music bus smoothly
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.001, now);
    this.musicGain.gain.exponentialRampToValueAtTime(0.24, now + 1.0);

    // Deep Sub-Bass Rumble
    try {
      this.subOsc = this.ctx.createOscillator();
      this.subGain = this.ctx.createGain();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(36.71, now); // D1 Sub-bass
      this.subGain.gain.setValueAtTime(0.18, now);
      this.subOsc.connect(this.subGain);
      this.subGain.connect(this.musicGain);
      this.subOsc.start();
    } catch (e) {}

    // Atmospheric Stereo Drone
    try {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.08, now);
      const droneFreqs = [73.42, 110.00, 146.83];
      this.droneOscs = droneFreqs.map((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq + (i * 0.35), now);
        osc.connect(this.droneGain);
        osc.start();
        return osc;
      });
      this.droneGain.connect(this.filterNode);
    } catch (e) {}

    // Run 16th note step clock
    const stepTimeMs = (60 / this.bpm / 4) * 1000;
    this.timerId = setInterval(() => this.onSequencerStep(), stepTimeMs);
  }

  stopCyberMusic() {
    this.isPlayingMusic = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    }

    setTimeout(() => {
      if (!this.isPlayingMusic) {
        if (this.subOsc) {
          try { this.subOsc.stop(); this.subOsc.disconnect(); } catch (e) {}
          this.subOsc = null;
        }
        this.droneOscs.forEach(o => {
          try { o.stop(); o.disconnect(); } catch (e) {}
        });
        this.droneOscs = [];
      }
    }, 450);
  }

  onSequencerStep() {
    if (!this.isPlayingMusic || !this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;

    const bassNote = this.bassPattern[this.step % this.bassPattern.length];
    const leadNote = this.leadPattern[this.step % this.leadPattern.length];

    // Trigger Synth Bass Voice
    if (bassNote && bassNote !== '.') {
      this.triggerSynthVoice(this.noteMap[bassNote], 0.16, 'sawtooth', 0.22, 1200);
    }

    // Trigger Lead Arp Voice
    if (leadNote && leadNote !== '.') {
      this.triggerSynthVoice(this.noteMap[leadNote], 0.12, 'square', 0.09, 2400);
    }

    // Subtle Kick / Pulse Accent every 4 steps (Beat)
    if (this.step % 4 === 0) {
      this.triggerCyberKick();
    }

    // High-hat / Cyber Noise tick on offbeats
    if (this.step % 2 === 1 && Math.random() > 0.25) {
      this.triggerCyberHiHat();
    }

    this.step = (this.step + 1) % 64;
  }

  triggerSynthVoice(freq, duration, type = 'sawtooth', volume = 0.2, filterPeak = 1400) {
    if (!freq || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const voiceFilter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      // Punchy Filter Envelope (Snappy Cyber Pluck)
      voiceFilter.type = 'lowpass';
      voiceFilter.frequency.setValueAtTime(filterPeak, now);
      voiceFilter.frequency.exponentialRampToValueAtTime(280, now + duration);
      voiceFilter.Q.setValueAtTime(5.0, now);

      // Amplitude Envelope
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(voiceFilter);
      voiceFilter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  triggerCyberKick() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  triggerCyberHiHat() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(6800, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.025);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  // Periodic Telemetry Glips & Radar Bleeps
  startTelemetryGlips() {
    if (this.telemetryTimer) clearInterval(this.telemetryTimer);
    this.telemetryTimer = setInterval(() => {
      if (this.enabled && this.ctx && Math.random() > 0.35) {
        this.playTelemetryChirp();
      }
    }, 3200);
  }

  stopTelemetryGlips() {
    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }
  }

  playTelemetryChirp() {
    if (!this.ctx || !this.enabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs = [1800, 2200, 2600, 3200];
      const startFreq = freqs[Math.floor(Math.random() * freqs.length)];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.setValueAtTime(startFreq * 1.25, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // =========================================================================
  // INTERACTIVE UI SOUND EFFECTS
  // =========================================================================

  // High-Tech Cyber Activation Fanfare
  playActivation() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880, 1174.66, 1479.98, 1760]; // D major cyber sweep
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);

        gain.gain.setValueAtTime(0.25, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.28);
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
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.035);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  // Sharp cyber mechanical click
  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.065);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.065);
    } catch (e) {}
  }

  // Terminal keystroke
  playKey() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 600 + (Math.random() * 300 - 150);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  // Access Granted / Uplink Success
  playSuccess() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
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
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.setValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }
}

window.cyberAudio = new CyberAudio();
