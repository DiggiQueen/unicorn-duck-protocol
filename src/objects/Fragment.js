// Entenfragment – gepooltes Sammelobjekt. Bei aktivem Duck-Magnet fliegt es zu Nova.
import { TEX, COLOR } from '../config/constants.js';

export default class Fragment extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.FRAGMENT);
    this.magnetized = false;
  }

  spawn(x, y, speed) {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(-speed, 0);
    this.body.setAllowGravity(false);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setDepth(35);
    this.magnetized = false;
    this.scene.tweens.add({ targets: this, angle: 360, duration: 1400, repeat: -1 });
  }

  deactivate() {
    this.disableBody(true, true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    // Duck-Magnet: zum Spieler steuern
    if (this.scene.powerups?.isActive('magnet') && this.scene.player?.alive) {
      const p = this.scene.player;
      const ang = Phaser.Math.Angle.Between(this.x, this.y, p.x, p.y);
      const sp = 620;
      this.setVelocity(Math.cos(ang) * sp, Math.sin(ang) * sp);
    }

    if (this.x < -40) this.deactivate();
  }
}
