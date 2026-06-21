// Difficulty-Director: liest die Timeline und spawnt Gegner/Fragmente/Power-Ups.
// Bei BOSS_TIME stoppt der reguläre Spawn und der Boss wird getriggert.
import { phaseAt, BOSS_TIME } from '../config/difficulty.js';
import { GAME, PU } from '../config/constants.js';

export default class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.elapsed = 0; // ms
    this.bossTriggered = false;
    this._sinceSpawn = 0;
    this.currentPhase = phaseAt(0);
    this._puTypes = [PU.LASER, PU.MAGNET, PU.SHIELD, PU.SLOWMO];
  }

  update(delta) {
    if (this.bossTriggered) return;
    this.elapsed += delta;
    const sec = this.elapsed / 1000;

    // Boss-Trigger
    if (sec >= BOSS_TIME) {
      this.bossTriggered = true;
      this.scene.startBossFight();
      return;
    }

    this.currentPhase = phaseAt(sec);
    this._sinceSpawn += delta;
    if (this._sinceSpawn >= this.currentPhase.interval) {
      this._sinceSpawn = 0;
      this.spawnWave();
    }
  }

  spawnWave() {
    const p = this.currentPhase;
    const type = Phaser.Utils.Array.GetRandom(p.enemies);
    this.scene.spawnEnemy(type, p.enemySpeed);

    // Sammelobjekte als Muster (Bogen/Zickzack/Linie), im erreichbaren Band
    if (Math.random() < p.fragmentChance) {
      this.spawnCollectiblePattern();
    }
    // gelegentlich ein Bonus-Gummientchen (50 P.)
    if (Math.random() < 0.13) {
      this.scene.spawnCollectible(GAME.WIDTH + 60, Phaser.Math.Between(490, 560), this.scene.worldSpeed, 'duck');
    }

    // Power-Up (im erreichbaren Höhenband)
    if (Math.random() < p.powerupChance) {
      const t = Phaser.Utils.Array.GetRandom(this._puTypes);
      this.scene.spawnPowerUp(GAME.WIDTH + 60, Phaser.Math.Between(480, 565), this.scene.worldSpeed, t);
    }
  }

  // Sammelobjekte in einem von drei Mustern (Linie / Bogen / Zickzack).
  spawnCollectiblePattern() {
    const sp = this.scene.worldSpeed;
    const pattern = Phaser.Math.Between(0, 2);
    const baseY = Phaser.Math.Between(515, 565);
    const n = Phaser.Math.Between(3, 6);
    const mid = Math.floor(n / 2);
    for (let i = 0; i < n; i++) {
      let y = baseY;
      if (pattern === 1) y = baseY - Math.sin((i / (n - 1)) * Math.PI) * 70; // Bogen
      else if (pattern === 2) y = baseY - (i % 2) * 60;                       // Zickzack
      // gelegentlich ein Edelstein in der Mitte einer Linie
      const kind = (pattern === 0 && i === mid && Math.random() < 0.5) ? 'gem' : 'fragment';
      this.scene.spawnCollectible(GAME.WIDTH + 40 + i * 46, y, sp, kind);
    }
  }

  // Restzeit bis Boss in ms (für HUD)
  get timeToBoss() {
    return Math.max(0, BOSS_TIME * 1000 - this.elapsed);
  }
}
