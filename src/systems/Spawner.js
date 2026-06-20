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

    // Fragment-Begleitung
    if (Math.random() < p.fragmentChance) {
      const n = Phaser.Math.Between(1, 3);
      const baseY = Phaser.Math.Between(180, GAME.GROUND_Y - 60);
      for (let i = 0; i < n; i++) {
        this.scene.spawnFragment(GAME.WIDTH + 40 + i * 36, baseY, this.scene.worldSpeed);
      }
    }

    // Power-Up
    if (Math.random() < p.powerupChance) {
      const t = Phaser.Utils.Array.GetRandom(this._puTypes);
      this.scene.spawnPowerUp(GAME.WIDTH + 60, Phaser.Math.Between(160, GAME.GROUND_Y - 80), this.scene.worldSpeed, t);
    }
  }

  // Restzeit bis Boss in ms (für HUD)
  get timeToBoss() {
    return Math.max(0, BOSS_TIME * 1000 - this.elapsed);
  }
}
