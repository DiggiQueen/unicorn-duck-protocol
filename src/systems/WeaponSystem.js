// Auto-Fire-Waffe mit Projektil-Pool. Rainbow-Laser swappt Feuerrate + Pierce.
import Projectile from '../objects/Projectile.js';
import { WEAPON } from '../config/constants.js';

export default class WeaponSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: 64,
      runChildUpdate: true,
    });

    this.fireRate = WEAPON.FIRE_RATE;
    this._fireEvent = scene.time.addEvent({
      delay: this.fireRate,
      loop: true,
      callback: this.fire,
      callbackScope: this,
    });
  }

  fire() {
    if (!this.player.alive) return;
    const laser = this.scene.powerups?.isActive('laser');
    const bullet = this.projectiles.get();
    if (!bullet) return;
    bullet.fire(this.player.x + 36, this.player.y + 4, laser);
    if (laser) this.scene.audio?.laser();
    else this.scene.audio?.shoot();
  }

  // Feuerrate je nach Power-Up anpassen.
  setLaser(active) {
    const rate = active ? WEAPON.LASER_FIRE_RATE : WEAPON.FIRE_RATE;
    if (rate === this.fireRate) return;
    this.fireRate = rate;
    this._fireEvent.reset({ delay: rate, loop: true, callback: this.fire, callbackScope: this });
  }

  destroy() {
    if (this._fireEvent) this._fireEvent.remove();
  }
}
