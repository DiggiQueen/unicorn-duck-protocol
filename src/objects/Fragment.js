// Sammelobjekt – gepoolt. Typgesteuert: Fragment (10), Edelstein (25),
// Mini-Gummientchen (50). Bei aktivem Duck-Magnet fliegt es zu Nova.
import { TEX, SCORE } from '../config/constants.js';

export default class Fragment extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.FRAGMENT);
    this.value = SCORE.FRAGMENT;
    this.kind = 'fragment';
    this._tw = null;
  }

  spawn(x, y, speed, opts = {}) {
    this.kind = opts.kind || 'fragment';
    this.value = opts.value || SCORE.FRAGMENT;
    this.setTexture(opts.texture || TEX.FRAGMENT);
    this.enableBody(true, x, y, true, true);
    this.setVelocity(-speed, 0);
    this.body.setAllowGravity(false);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setDepth(35);
    this.setScale(1).setAngle(0).setAlpha(1);

    // alten Tween stoppen (Pooling!) und passenden neuen starten
    if (this._tw) { this._tw.stop(); this._tw = null; }
    if (this.kind === 'duck') {
      this._tw = this.scene.tweens.add({
        targets: this, angle: { from: -8, to: 8 },
        duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    } else {
      this._tw = this.scene.tweens.add({ targets: this, angle: 360, duration: 1400, repeat: -1 });
    }
  }

  deactivate() {
    if (this._tw) { this._tw.stop(); this._tw = null; }
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
