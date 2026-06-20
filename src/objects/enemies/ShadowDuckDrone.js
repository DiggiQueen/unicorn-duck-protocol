// Shadow Duck Drone – kleine fliegende Roboterente. Sinus-Flugbahn.
import { TEX, COLOR } from '../../config/constants.js';

export default class ShadowDuckDrone extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.DRONE);
    this.enemyType = 'drone';
  }

  spawn(x, y, speed) {
    this.enableBody(true, x, y, true, true);
    this.body.setAllowGravity(false);
    this.setVelocity(-speed, 0);
    this.setDepth(30);
    this.hp = 2;
    this.maxHp = 2;
    this.scoreValue = 25;
    this._baseY = y;
    this._t = 0;
    this._amp = Phaser.Math.Between(30, 70);
    this._freq = Phaser.Math.FloatBetween(0.003, 0.006);
    this.setTint(0xffffff);
  }

  hurt(dmg) {
    this.hp -= dmg;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => { if (this.active) this.clearTint(); });
    return this.hp <= 0;
  }

  deactivate() { this.disableBody(true, true); }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this._t += delta;
    this.y = this._baseY + Math.sin(this._t * this._freq) * this._amp;
    if (this.x < -60) this.deactivate();
  }
}
