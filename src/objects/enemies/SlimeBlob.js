// Slime Blob – rollt über den Boden, leichtes Hüpfen.
import { TEX, GAME } from '../../config/constants.js';

export default class SlimeBlob extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.SLIME);
    this.enemyType = 'slime';
  }

  spawn(x, speed) {
    const y = GAME.GROUND_Y - 18;
    this.enableBody(true, x, y, true, true);
    this.body.setAllowGravity(false);
    this.setVelocity(-speed * 1.05, 0);
    this.setDepth(30);
    this.hp = 3;
    this.maxHp = 3;
    this.scoreValue = 25;
    this._t = 0;
    this._groundY = y;
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
    // Hüpfen + Squash
    const hop = Math.abs(Math.sin(this._t * 0.008)) * 26;
    this.y = this._groundY - hop;
    this.setScale(1 + Math.sin(this._t * 0.008) * 0.12, 1 - Math.sin(this._t * 0.008) * 0.12);
    this.setRotation(this._t * 0.006);
    if (this.x < -60) this.deactivate();
  }
}
