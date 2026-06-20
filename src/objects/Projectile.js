// Gepooltes Projektil (Nova-Schuss). Wird via group.get() recycelt.
import { TEX, WEAPON } from '../config/constants.js';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.BULLET);
    this.damage = WEAPON.BULLET_DAMAGE;
    this.pierce = false;
    this.hitSet = null; // Set getroffener Gegner bei Pierce
  }

  fire(x, y, laser) {
    this.enableBody(true, x, y, true, true);
    this.setTexture(laser ? TEX.BULLET_LASER : TEX.BULLET);
    this.pierce = !!laser;
    this.damage = laser ? 2 : WEAPON.BULLET_DAMAGE;
    this.hitSet = laser ? new Set() : null;
    this.setVelocity(WEAPON.BULLET_SPEED, 0);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.body.setAllowGravity(false);
    this.setDepth(40);
  }

  // gegner-spezifischer Treffer-Check (für Pierce nur 1x pro Gegner)
  canHit(enemy) {
    if (!this.pierce) return true;
    if (this.hitSet.has(enemy)) return false;
    this.hitSet.add(enemy);
    return true;
  }

  deactivate() {
    this.disableBody(true, true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.active && this.x > this.scene.scale.width + 60) {
      this.deactivate();
    }
  }
}
