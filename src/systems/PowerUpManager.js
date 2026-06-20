// Verwaltet aktive Power-Up-Effekte + Timer. HUD liest getRemaining() für Balken.
import { PU, PU_DURATION, COLOR } from '../config/constants.js';

export default class PowerUpManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.active = {}; // type -> { timer, duration }
  }

  isActive(type) {
    return !!this.active[type];
  }

  // 0..1 verbleibend (für HUD-Balken)
  remaining(type) {
    const e = this.active[type];
    if (!e || !e.timer) return 0;
    return Phaser.Math.Clamp(e.timer.getRemaining() / e.duration, 0, 1);
  }

  apply(type) {
    this.scene.audio?.powerup();

    if (type === PU.SHIELD) {
      this.player.giveShield();
      return;
    }

    const duration = PU_DURATION[type];
    // bereits aktiv -> Timer auffrischen
    if (this.active[type]?.timer) this.active[type].timer.remove();

    if (type === PU.LASER) this.scene.weapon?.setLaser(true);
    if (type === PU.SLOWMO) this.scene.juice?.slowmo(duration, 0.45);

    const timer = this.scene.time.delayedCall(duration, () => this.expire(type));
    this.active[type] = { timer, duration };
  }

  expire(type) {
    if (type === PU.LASER) this.scene.weapon?.setLaser(false);
    delete this.active[type];
  }

  clearAll() {
    Object.keys(this.active).forEach(t => {
      if (this.active[t]?.timer) this.active[t].timer.remove();
    });
    this.active = {};
  }
}
