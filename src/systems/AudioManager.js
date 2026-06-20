// Prozeduraler Sound via Web Audio API – keine Audiodateien nötig.
// SFX = kurze synthetisierte Töne/Noise. Musik = geloopte Arpeggio/Bass-Sequenz.
// Wird einmal erzeugt und in der Registry gehalten (überlebt Szenenwechsel).

const MUTE_KEY = 'udp_muted';

export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = this._loadMuted();
    this.musicTimer = null;
    this.currentTrack = null;
    this._lastShoot = 0;
  }

  _loadMuted() {
    try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; }
  }
  _saveMuted() {
    try { localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0'); } catch (e) {}
  }

  // Muss durch eine User-Geste ausgelöst werden (Autoplay-Policy).
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.32;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.master);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    this._saveMuted();
    return this.muted;
  }

  get isMuted() { return this.muted; }

  // --- Low-level Synth ---------------------------------------------------

  _now() { return this.ctx ? this.ctx.currentTime : 0; }

  _tone(freq, dur, type, gain, dest, slideTo) {
    if (!this.ctx) return;
    const t = this._now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(dest || this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  _noise(dur, gain, filterFreq) {
    if (!this.ctx) return;
    const t = this._now();
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterFreq || 2200;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    src.start(t);
  }

  // --- SFX ---------------------------------------------------------------

  shoot() {
    if (!this.ctx) return;
    // Auto-Fire drosseln, damit es nicht surrt.
    const t = this._now();
    if (t - this._lastShoot < 0.05) return;
    this._lastShoot = t;
    this._tone(880, 0.08, 'square', 0.10, this.sfxGain, 420);
  }
  laser() { this._tone(1400, 0.06, 'sawtooth', 0.08, this.sfxGain, 900); }
  jump() { this._tone(420, 0.16, 'square', 0.14, this.sfxGain, 720); }
  dash() { this._tone(220, 0.18, 'sawtooth', 0.14, this.sfxGain, 660); this._noise(0.12, 0.06, 1200); }
  explode() { this._noise(0.32, 0.22, 1400); this._tone(140, 0.3, 'triangle', 0.12, this.sfxGain, 60); }
  hit() { this._tone(180, 0.25, 'sawtooth', 0.2, this.sfxGain, 70); this._noise(0.18, 0.14, 900); }
  powerup() {
    this._tone(523, 0.09, 'square', 0.12);
    setTimeout(() => this._tone(784, 0.09, 'square', 0.12), 70);
    setTimeout(() => this._tone(1046, 0.14, 'square', 0.12), 140);
  }
  fragment() { this._tone(1320, 0.05, 'sine', 0.06); }
  bossHit() { this._tone(110, 0.12, 'square', 0.16, this.sfxGain, 80); this._noise(0.1, 0.1, 1600); }
  bossRoar() { this._tone(70, 0.8, 'sawtooth', 0.3, this.sfxGain, 40); this._noise(0.6, 0.18, 600); }
  victory() {
    const seq = [523, 659, 784, 1046, 1318];
    seq.forEach((f, i) => setTimeout(() => this._tone(f, 0.22, 'square', 0.16), i * 120));
  }
  gameover() {
    const seq = [440, 349, 262, 196];
    seq.forEach((f, i) => setTimeout(() => this._tone(f, 0.3, 'triangle', 0.16), i * 160));
  }

  // --- Musik (geloopte Sequenz) -----------------------------------------

  playMusic(track) {
    if (!this.ctx) return;
    if (this.currentTrack === track && this.musicTimer) return;
    this.stopMusic();
    this.currentTrack = track;

    const tracks = {
      menu: { root: 220, scale: [0, 3, 5, 7, 10], bpm: 96, wave: 'triangle' },
      run:  { root: 262, scale: [0, 2, 3, 5, 7], bpm: 132, wave: 'sawtooth' },
      boss: { root: 196, scale: [0, 1, 3, 5, 6], bpm: 150, wave: 'square' },
    };
    const cfg = tracks[track] || tracks.menu;
    const stepDur = 60 / cfg.bpm / 2; // Achtelnoten
    let step = 0;

    const midi = (semi) => cfg.root * Math.pow(2, semi / 12);
    const tick = () => {
      const arpNote = cfg.scale[step % cfg.scale.length] + (Math.floor(step / cfg.scale.length) % 2) * 12;
      this._tone(midi(arpNote), stepDur * 0.9, cfg.wave, 0.05, this.musicGain);
      // Bass alle 4 Schritte
      if (step % 4 === 0) {
        this._tone(midi(cfg.scale[(Math.floor(step / 4)) % cfg.scale.length] - 12), stepDur * 3.5, 'triangle', 0.08, this.musicGain);
      }
      // Hi-Hat-Noise auf Off-Beats
      if (step % 2 === 1) this._noise(0.04, 0.015, 6000);
      step++;
    };
    tick();
    this.musicTimer = setInterval(tick, stepDur * 1000);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
    this.currentTrack = null;
  }
}
