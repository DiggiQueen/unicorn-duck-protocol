// Dark Goose – großer Gegner, verfolgt den Spieler kurzzeitig vertikal.
import { TEX, GAME } from '../../config/constants.js';

export default class DarkGoose extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.GOOSE);
    this.enemyType = 'goose';
  }

  spawn(x, y, speed) {
    this.enableBody(true, x, y, true, true);
    this.body.setAllowGravity(false);
    this.setVelocity(-speed * 0.85, 0);
    this.setDepth(31);
    this.hp = 5;
    this.maxHp = 5;
    this.scoreValue = 25;
    this._chaseUntil = this.scene.time.now + 2200; // verfolgt 2,2s
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

    // Verfolgt den Spieler vertikal, solange im Verfolgungsfenster
    if (this.scene.player?.alive && time < this._chaseUntil) {
      const dy = this.scene.player.y - this.y;
      this.setVelocityY(Phaser.Math.Clamp(dy * 2, -160, 160));
    } else {
      this.setVelocityY(this.body.velocity.y * 0.96);
    }
    this.y = Phaser.Math.Clamp(this.y, 60, GAME.GROUND_Y - 30);
    if (this.x < -80) this.deactivate();
  }
}
