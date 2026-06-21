// GameScene: der Kern-Lauf. Besitzt Welt, Physikgruppen, Player und alle Systeme.
// HUD läuft parallel. Bei Boss-Sieg/Tod -> GameOver.
import Player from '../objects/Player.js';
import WeaponSystem from '../systems/WeaponSystem.js';
import Spawner from '../systems/Spawner.js';
import PowerUpManager from '../systems/PowerUpManager.js';
import Juice from '../systems/Juice.js';
import ParallaxBackground from '../systems/ParallaxBackground.js';
import Fragment from '../objects/Fragment.js';
import PowerUp from '../objects/PowerUp.js';
import ShadowDuckDrone from '../objects/enemies/ShadowDuckDrone.js';
import SlimeBlob from '../objects/enemies/SlimeBlob.js';
import DarkGoose from '../objects/enemies/DarkGoose.js';
import BossEmperorDuck from '../objects/enemies/BossEmperorDuck.js';
import { GAME, PLAYER, WORLD, SCORE, COLOR, TEX, PU } from '../config/constants.js';
import { speedAt } from '../config/difficulty.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.audio = this.registry.get('audio');
    this.score = 0;
    this.registry.set('score', 0);
    this.bossActive = false;
    this.gameEnded = false;
    this.worldSpeed = WORLD.BASE_SPEED;

    this.physics.world.setBounds(0, 0, GAME.WIDTH, GAME.GROUND_Y - 4);

    // Systeme
    this.bg = new ParallaxBackground(this);
    this.juice = new Juice(this);

    // Player
    this.player = new Player(this, PLAYER.X, GAME.GROUND_Y - 80);
    this.player.setupInput(this);

    this.weapon = new WeaponSystem(this, this.player);
    this.powerups = new PowerUpManager(this, this.player);
    this.spawner = new Spawner(this);

    // Physikgruppen
    this.drones = this.physics.add.group({ classType: ShadowDuckDrone, maxSize: 30, runChildUpdate: true });
    this.slimes = this.physics.add.group({ classType: SlimeBlob, maxSize: 30, runChildUpdate: true });
    this.geese = this.physics.add.group({ classType: DarkGoose, maxSize: 20, runChildUpdate: true });
    this.fragments = this.physics.add.group({ classType: Fragment, maxSize: 60, runChildUpdate: true });
    this.powerupGroup = this.physics.add.group({ classType: PowerUp, maxSize: 12, runChildUpdate: true });
    this.enemyProjectiles = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: 60 });
    this.hazards = this.physics.add.group();

    this.enemyGroups = [this.drones, this.slimes, this.geese];

    this._setupCollisions();

    // HUD parallel starten
    this.scene.launch('Hud');
    this.scene.bringToTop('Hud');

    // Boden-Kollision (unsichtbare Plattform)
    this.ground = this.add.rectangle(GAME.WIDTH / 2, GAME.GROUND_Y + 30, GAME.WIDTH, 60, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
    this.physics.add.collider(this.player, this.ground);

    // Eingaben für Pause / Mute
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-M', () => {
      this.audio?.toggleMute();
      this.events.emit('mute-changed', this.audio?.isMuted);
    });

    // Touch-Befehle vom HUD
    this.events.on('touch-jump', () => this.player.touchJump());
    this.events.on('touch-dash', () => this.player.touchDash());
    this.events.on('touch-pause', () => this.togglePause());

    // Musik
    this.audio?.unlock();
    if (!this.audio?.isMuted) this.audio?.playMusic('run');

    // Aufräumen bei Szenenende
    this.events.once('shutdown', this._cleanup, this);

    this.cameras.main.fadeIn(300);
  }

  _setupCollisions() {
    // Projektile treffen Gegner
    this.enemyGroups.forEach(g => {
      this.physics.add.overlap(this.weapon.projectiles, g, this.onBulletHitEnemy, null, this);
      this.physics.add.overlap(this.player, g, this.onPlayerTouchEnemy, null, this);
    });
    // Player sammelt
    this.physics.add.overlap(this.player, this.fragments, this.onCollectFragment, null, this);
    this.physics.add.overlap(this.player, this.powerupGroup, this.onCollectPowerUp, null, this);
    // Player wird getroffen
    this.physics.add.overlap(this.player, this.enemyProjectiles, this.onPlayerHitProjectile, null, this);
    this.physics.add.overlap(this.player, this.hazards, this.onPlayerHitHazard, null, this);
  }

  // --- Spawn-Helfer (vom Spawner aufgerufen) -----------------------------

  spawnEnemy(type, speed) {
    // Spawn-Höhen im per Sprung/Doppelsprung erreichbaren Band (~470..580).
    if (type === 'drone') {
      const e = this.drones.get();
      if (e) e.spawn(GAME.WIDTH + 60, Phaser.Math.Between(470, 580), speed);
    } else if (type === 'slime') {
      const e = this.slimes.get();
      if (e) e.spawn(GAME.WIDTH + 60, speed);
    } else if (type === 'goose') {
      const e = this.geese.get();
      if (e) e.spawn(GAME.WIDTH + 80, Phaser.Math.Between(480, 580), speed);
    }
  }

  spawnFragment(x, y, speed) {
    const f = this.fragments.get();
    if (f) f.spawn(x, y, speed);
  }

  spawnPowerUp(x, y, speed, type) {
    const p = this.powerupGroup.get();
    if (p) p.spawn(x, y, speed, type);
  }

  // Vom Boss genutzt: feindliches Projektil/Rakete abfeuern.
  fireEnemyProjectile(x, y, angle, speed, texture) {
    const p = this.enemyProjectiles.get(x, y, texture);
    if (!p) return;
    p.setActive(true).setVisible(true);
    p.setTexture(texture);
    if (p.body) {
      p.body.enable = true;
      p.body.setAllowGravity(false);
    } else {
      this.physics.add.existing(p);
      p.body.setAllowGravity(false);
    }
    p.setPosition(x, y);
    p.setDepth(32);
    p.setBlendMode(Phaser.BlendModes.ADD);
    p.setRotation(angle);
    p.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  // --- Kollisions-Callbacks ----------------------------------------------

  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    if (!bullet.canHit(enemy)) return;

    const dead = enemy.hurt(bullet.damage);
    this.juice.spark(enemy.x, enemy.y, COLOR.CYAN, 6);

    if (dead) {
      this.juice.explode(enemy.x, enemy.y, COLOR.MAGENTA, 16);
      this.juice.shake(80, 0.004);
      this.audio?.explode();
      this.addScore(SCORE.ENEMY);
      this.events.emit('enemy-killed');
      enemy.deactivate();
    }
    if (!bullet.pierce) bullet.deactivate();
  }

  onPlayerTouchEnemy(player, enemy) {
    if (!enemy.active || !player.alive) return;
    const took = player.takeHit();
    if (took) {
      // Gegner stirbt bei Kontakt mit (ungeschütztem) Nova nicht automatisch,
      // aber Dash zerstört ihn:
      if (player.dashing) {
        this.juice.explode(enemy.x, enemy.y, COLOR.VIOLET, 14);
        enemy.deactivate();
      }
    }
    this._checkDeath();
  }

  onPlayerHitProjectile(player, proj) {
    if (!proj.active || !player.alive) return;
    proj.disableBody(true, true);
    player.takeHit();
    this._checkDeath();
  }

  onPlayerHitHazard(player, hazard) {
    if (!player.alive) return;
    player.takeHit();
    this._checkDeath();
  }

  onCollectFragment(player, frag) {
    if (!frag.active) return;
    frag.deactivate();
    this.addScore(SCORE.FRAGMENT);
    this.audio?.fragment();
    this.juice.spark(frag.x, frag.y, COLOR.GOLD, 5);
    this.events.emit('fragment-collected');
  }

  onCollectPowerUp(player, pu) {
    if (!pu.active) return;
    const type = pu.puType;
    pu.deactivate();
    this.powerups.apply(type);
    this.juice.explode(player.x, player.y, COLOR.CYAN, 12);
    this.events.emit('powerup-collected', type);
  }

  // --- Boss --------------------------------------------------------------

  startBossFight() {
    if (this.bossActive) return;
    this.bossActive = true;
    this.events.emit('boss-spawned');
    if (!this.audio?.isMuted) this.audio?.playMusic('boss');

    // Feld leeren
    this.enemyGroups.forEach(g => g.children.each(e => { if (e.active) e.deactivate(); }));

    this.boss = new BossEmperorDuck(this, GAME.WIDTH + 200, 470);
    this.physics.add.overlap(this.weapon.projectiles, this.boss, this.onBulletHitBoss, null, this);
    this.physics.add.overlap(this.player, this.boss, this.onPlayerTouchBoss, null, this);

    this.juice.shake(400, 0.012);
    this.cameras.main.flash(300, 120, 20, 40);
  }

  onBulletHitBoss(bullet, boss) {
    if (!bullet.active || !boss.alive) return;
    if (!bullet.canHit(boss)) return;
    const killed = boss.hurt(bullet.damage);
    this.juice.spark(bullet.x, boss.y, COLOR.GOLD, 6);
    this.addScore(SCORE.BOSS_HIT);
    if (!bullet.pierce) bullet.deactivate();
  }

  onPlayerTouchBoss(player, boss) {
    if (!boss.alive || !player.alive) return;
    player.takeHit();
    this._checkDeath();
  }

  onBossDefeated(x, y) {
    this.addScore(SCORE.BOSS_KILL);
    this.audio?.victory();
    // Goldene Ente erscheint
    const duck = this.add.image(x, y, TEX.GOLDEN_DUCK).setDepth(60).setScale(0.2)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: duck, scale: 1.6, duration: 900, ease: 'Back.easeOut' });
    this.tweens.add({ targets: duck, y: y - 40, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.juice.explode(x, y, COLOR.GOLD, 40);

    this.time.delayedCall(1900, () => this.endGame(true));
  }

  // --- Score / Ende ------------------------------------------------------

  addScore(n) {
    this.score += n;
    this.registry.set('score', this.score);
  }

  _checkDeath() {
    if (!this.player.alive && !this.gameEnded) {
      this.time.delayedCall(900, () => this.endGame(false));
    }
  }

  endGame(won) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    if (!won) this.audio?.gameover();
    this.audio?.stopMusic();
    this.scene.stop('Hud');
    this.cameras.main.fade(500, 5, 1, 15);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOver', { score: this.score, won });
    });
  }

  togglePause() {
    if (this.gameEnded) return;
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.pause('Hud');
    this.scene.launch('Pause');
    this.scene.bringToTop('Pause');
  }

  _cleanup() {
    if (this.weapon) this.weapon.destroy();
    if (this.juice) this.juice.destroy();
    if (this.powerups) this.powerups.clearAll();
  }

  // --- Update-Loop -------------------------------------------------------

  update(time, delta) {
    if (this.gameEnded) return;

    // Welt-Tempo hochfahren (nur während des Laufs, nicht im Boss)
    if (!this.bossActive) {
      this.worldSpeed = speedAt(this.spawner.elapsed, WORLD.BASE_SPEED, WORLD.MAX_SPEED, WORLD.RUN_DURATION);
      this.spawner.update(delta);
    }

    this.player.update();
    this.bg.update(delta, this.worldSpeed);

    // Feindliche Projektile aufräumen
    this.enemyProjectiles.children.each(p => {
      if (p.active && (p.x < -60 || p.y < -60 || p.y > GAME.HEIGHT + 60)) {
        p.disableBody(true, true);
      }
    });

    // HUD-Daten in Registry spiegeln
    this.registry.set('hp', this.player.hp);
    this.registry.set('shield', this.player.hasShield);
    this.registry.set('dashReady', this.player.dashReady);
    this.registry.set('bossActive', this.bossActive);
    this.registry.set('timeToBoss', this.spawner.timeToBoss);
  }
}
