// Emperor Duck X – Boss als endliche Zustandsmaschine.
// ENTER -> IDLE -> {LASER|ROCKETS|SHOCKWAVE} -> RECOVER -> IDLE ... -> ENRAGE (<50%) -> DEFEAT
import { TEX, COLOR, GAME, SCORE } from '../../config/constants.js';

export default class BossEmperorDuck extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.BOSS);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(33);
    this.body.setAllowGravity(false);
    this.body.setSize(220, 150).setOffset(20, 50);

    this.maxHp = 60;
    this.hp = this.maxHp;
    this.state_ = 'ENTER';
    this.enraged = false;
    this.lastAttack = null;
    this.vulnerable = false;
    this.alive = true;
    this._homeX = scene.scale.width - 230;
    this._homeY = 220;

    this.enterState('ENTER');
    this._bob = scene.tweens.add({
      targets: this, y: '+=24', duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  enterState(s) {
    this.state_ = s;
    const scene = this.scene;
    const interval = this.enraged ? 700 : 1200;

    switch (s) {
      case 'ENTER':
        this.vulnerable = false;
        scene.tweens.add({
          targets: this, x: this._homeX, duration: 1600, ease: 'Cubic.easeOut',
          onComplete: () => this.enterState('IDLE'),
        });
        break;

      case 'IDLE':
        this.vulnerable = false;
        this._timer = scene.time.delayedCall(interval, () => this.chooseAttack());
        break;

      case 'RECOVER':
        this.vulnerable = true; // verwundbares Fenster
        this.setTint(0xffffff);
        scene.tweens.add({ targets: this, alpha: 0.85, duration: 120, yoyo: true, repeat: 3 });
        this._timer = scene.time.delayedCall(this.enraged ? 900 : 1400, () => {
          this.clearTint();
          this.enterState('IDLE');
        });
        break;

      case 'DEFEAT':
        this.defeat();
        break;
    }
  }

  chooseAttack() {
    if (!this.alive) return;
    const pool = ['LASER', 'ROCKETS', 'SHOCKWAVE'].filter(a => a !== this.lastAttack);
    const attack = Phaser.Utils.Array.GetRandom(pool);
    this.lastAttack = attack;
    if (attack === 'LASER') this.attackLaser();
    else if (attack === 'ROCKETS') this.attackRockets();
    else this.attackShockwave();

    if (this.enraged && Math.random() < 0.5) {
      // Combo: zweite Attacke kurz danach
      this.scene.time.delayedCall(600, () => {
        if (this.alive) {
          const second = Phaser.Utils.Array.GetRandom(pool.filter(a => a !== attack));
          if (second === 'LASER') this.attackLaser();
          else if (second === 'ROCKETS') this.attackRockets();
          else this.attackShockwave();
        }
      });
    }
  }

  // --- Attacken ----------------------------------------------------------

  attackLaser() {
    const scene = this.scene;
    const targetY = scene.player?.alive ? scene.player.y : this._homeY;
    // Telegraph-Linie
    const warn = scene.add.rectangle(0, targetY, scene.scale.width, 6, COLOR.DANGER, 0.5)
      .setOrigin(0, 0.5).setDepth(34).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: warn, alpha: 0.15, duration: 120, yoyo: true, repeat: 3 });
    scene.audio?.bossRoar();

    scene.time.delayedCall(650, () => {
      warn.destroy();
      if (!this.alive) return;
      // Strahl
      const beam = scene.add.rectangle(this.x, targetY, this.x + 40, 36, COLOR.MAGENTA, 0.9)
        .setOrigin(1, 0.5).setDepth(34).setBlendMode(Phaser.BlendModes.ADD);
      scene.physics.add.existing(beam);
      beam.body.setAllowGravity(false);
      beam.isHazard = true;
      scene.hazards.add(beam);
      scene.juice?.shake(200, 0.01);
      scene.tweens.add({ targets: beam, scaleY: 1.2, duration: 100, yoyo: true, repeat: 6 });
      scene.time.delayedCall(900, () => beam.destroy());
    });
    this.enterState('RECOVER');
  }

  attackRockets() {
    const scene = this.scene;
    scene.audio?.bossRoar();
    const n = this.enraged ? 6 : 4;
    for (let i = 0; i < n; i++) {
      scene.time.delayedCall(i * 130, () => {
        if (!this.alive) return;
        const p = scene.player;
        const ang = p?.alive
          ? Phaser.Math.Angle.Between(this.x, this.y, p.x, p.y) + Phaser.Math.FloatBetween(-0.25, 0.25)
          : Math.PI;
        scene.fireEnemyProjectile(this.x - 40, this.y, ang, 360, TEX.ROCKET);
      });
    }
    this.enterState('RECOVER');
  }

  attackShockwave() {
    const scene = this.scene;
    scene.audio?.bossRoar();
    // expandierender Ring am Boden, der nach links wandert -> Sprung erzwingen
    const ring = scene.add.image(this.x - 60, GAME.GROUND_Y - 20, TEX.RING)
      .setDepth(34).setScale(0.2).setBlendMode(Phaser.BlendModes.ADD).setTint(COLOR.GOLD);
    scene.physics.add.existing(ring);
    ring.body.setAllowGravity(false);
    ring.body.setVelocityX(-460);
    ring.isHazard = true;
    scene.hazards.add(ring);
    scene.tweens.add({ targets: ring, scale: 1.4, duration: 1400, ease: 'Quad.easeOut' });
    scene.time.delayedCall(1600, () => ring.destroy());
    this.enterState('RECOVER');
  }

  // --- Schaden / Tod -----------------------------------------------------

  hurt(dmg) {
    if (!this.alive) return false;
    // im verwundbaren Fenster doppelter Schaden
    const eff = this.vulnerable ? dmg * 2 : dmg;
    this.hp -= eff;
    this.scene.audio?.bossHit();
    this.scene.juice?.punch(0.015);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => { if (this.alive) this.clearTint(); });

    if (!this.enraged && this.hp <= this.maxHp * 0.5) {
      this.enraged = true;
      this.setTint(0xff7a7a);
      this.scene.juice?.flash(200, 255, 60, 60);
      this.scene.juice?.shake(300, 0.012);
    }
    this.scene.events.emit('boss-hp', this.hp / this.maxHp);

    if (this.hp <= 0) {
      this.hp = 0;
      this.enterState('DEFEAT');
      return true;
    }
    return false;
  }

  defeat() {
    if (!this.alive) return;
    this.alive = false;
    this.vulnerable = false;
    if (this._timer) this._timer.remove();
    if (this._bob) this._bob.stop();
    const scene = this.scene;
    scene.juice?.slowmo(1400, 0.3);

    // Mehrere Explosionen + Screenshakes
    let n = 0;
    const boom = scene.time.addEvent({
      delay: 160, repeat: 7, callback: () => {
        n++;
        scene.juice?.explode(
          this.x + Phaser.Math.Between(-90, 90),
          this.y + Phaser.Math.Between(-70, 70),
          [COLOR.GOLD, COLOR.MAGENTA, COLOR.CYAN][n % 3], 26);
        scene.juice?.shake(160, 0.014);
      },
    });

    scene.tweens.add({
      targets: this, alpha: 0, scale: 1.3, duration: 1300,
      onComplete: () => {
        this.setVisible(false);
        scene.onBossDefeated(this.x, this.y);
      },
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
  }
}
