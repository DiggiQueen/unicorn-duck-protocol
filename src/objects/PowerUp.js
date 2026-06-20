// Power-Up – eine Klasse, typgesteuert. Schwebt heran, leicht auf/ab pulsierend.
import { TEX, PU } from '../config/constants.js';

const TEX_BY_TYPE = {
  [PU.LASER]: TEX.PU_LASER,
  [PU.MAGNET]: TEX.PU_MAGNET,
  [PU.SHIELD]: TEX.PU_SHIELD,
  [PU.SLOWMO]: TEX.PU_SLOWMO,
};

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.PU_LASER);
    this.puType = PU.LASER;
  }

  spawn(x, y, speed, type) {
    this.puType = type;
    this.setTexture(TEX_BY_TYPE[type]);
    this.enableBody(true, x, y, true, true);
    this.setVelocity(-speed, 0);
    this.body.setAllowGravity(false);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setDepth(36);
    this._baseY = y;
    this._bob = this.scene.tweens.add({
      targets: this, y: y - 16, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this._pulse = this.scene.tweens.add({
      targets: this, scale: 1.18, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  deactivate() {
    if (this._bob) this._bob.stop();
    if (this._pulse) this._pulse.stop();
    this.setScale(1);
    this.disableBody(true, true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.active && this.x < -40) this.deactivate();
  }
}
