// Die "Game Juice"-Schicht – der Notenbringer.
// Screenshake, Hit-Stop, Slow-Mo, Flash, Partikel-Bursts. Alles zentral & wiederverwendbar.
import { TEX, COLOR } from '../config/constants.js';

export default class Juice {
  constructor(scene) {
    this.scene = scene;
    this.level = 1; // globaler Juice-Faktor (drosselbar bei Perf-Einbruch)
    this._slowmoActive = false;
    this._hitstopActive = false;

    // Ein wiederverwendbarer Explosions-Emitter (ADD-Blend = Neon-Glow gratis).
    this.burst = scene.add.particles(0, 0, TEX.PARTICLE, {
      lifespan: 520,
      speed: { min: 80, max: 320 },
      scale: { start: 1.1, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      emitting: false,
    });
    this.burst.setDepth(60);
  }

  // Partikel-Explosion in Farbe an (x,y).
  explode(x, y, color = COLOR.CYAN, count = 18) {
    this.burst.setParticleTint(color);
    this.burst.explode(Math.round(count * this.level), x, y);
  }

  // Kleiner Funkenstoß (Treffer).
  spark(x, y, color = COLOR.WHITE, count = 8) {
    this.burst.setParticleTint(color);
    this.burst.explode(Math.round(count * this.level), x, y);
  }

  shake(duration = 120, intensity = 0.006) {
    this.scene.cameras.main.shake(duration, intensity * this.level);
  }

  flash(duration = 120, r = 255, g = 255, b = 255) {
    this.scene.cameras.main.flash(duration, r, g, b);
  }

  // Kurzer Freeze für wuchtige Treffer (< 100ms). Real-time, nicht von timeScale abhängig.
  hitstop(ms = 70) {
    if (this._hitstopActive) return;
    this._hitstopActive = true;
    const world = this.scene.physics.world;
    world.isPaused = true;
    // setTimeout statt time.delayedCall -> unbeeinflusst von pausierter Physik.
    setTimeout(() => {
      world.isPaused = false;
      this._hitstopActive = false;
    }, ms);
  }

  // Slow-Mo: Zeit- und Physik-TimeScale herunterfahren, real-time wiederherstellen.
  slowmo(durationMs = 600, factor = 0.35) {
    if (this._slowmoActive) return;
    this._slowmoActive = true;
    this.scene.time.timeScale = factor;
    this.scene.physics.world.timeScale = 1 / factor; // physics nutzt invertierte Skala
    this.scene.tweens.timeScale = factor;
    setTimeout(() => {
      this.scene.time.timeScale = 1;
      this.scene.physics.world.timeScale = 1;
      this.scene.tweens.timeScale = 1;
      this._slowmoActive = false;
    }, durationMs);
  }

  // Kamera-Punch (kurzer Zoom-Stoß) für Boss-Treffer.
  punch(amount = 0.02) {
    const cam = this.scene.cameras.main;
    const base = 1;
    this.scene.tweens.add({
      targets: cam,
      zoom: base + amount * this.level,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  destroy() {
    if (this.burst) this.burst.destroy();
  }
}
