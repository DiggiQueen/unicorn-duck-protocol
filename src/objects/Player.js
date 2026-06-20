// Nova – die Spielfigur. Auto-Lauf (Welt scrollt), Springen, vertikales Ausweichen,
// Dash mit i-Frames, Treffer-Logik. Eine Neon-Spur folgt ihr.
import { PLAYER, GAME, TEX, COLOR } from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.NOVA);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(50);
    this.setCollideWorldBounds(true);
    this.body.setSize(56, 50).setOffset(20, 26);
    this.body.setGravityY(GAME.GRAVITY);

    this.hp = PLAYER.MAX_HP;
    this.maxHp = PLAYER.MAX_HP;
    this.invulnerable = false;
    this.dashing = false;
    this.dashReady = true;
    this.hasShield = false;
    this.doubleJumpAvailable = false;
    this.alive = true;

    this._setupTrail(scene);
    this._setupShieldRing(scene);
  }

  _setupTrail(scene) {
    this.trail = scene.add.particles(0, 0, TEX.PARTICLE, {
      follow: this,
      followOffset: { x: -28, y: 6 },
      lifespan: 360,
      speed: { min: 10, max: 50 },
      angle: { min: 150, max: 210 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: [COLOR.MAGENTA, COLOR.CYAN, COLOR.VIOLET, COLOR.GOLD],
      blendMode: 'ADD',
      frequency: 24,
    });
    this.trail.setDepth(45);
  }

  _setupShieldRing(scene) {
    this.shieldRing = scene.add.image(this.x, this.y, TEX.RING)
      .setDepth(52).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: this.shieldRing, angle: 360, duration: 4000, repeat: -1 });
  }

  setupInput(scene) {
    this.keys = scene.input.keyboard.addKeys({
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
      downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });
  }

  // externe (Touch-)Befehle
  touchJump() { this._doJump(); }
  touchDash() { this._doDash(); }

  _doJump() {
    if (!this.alive) return;
    const onFloor = this.body.onFloor() || this.body.blocked.down;
    if (onFloor) {
      this.setVelocityY(PLAYER.JUMP_VELOCITY);
      this.doubleJumpAvailable = true;
      this.scene.audio?.jump();
    } else if (this.doubleJumpAvailable) {
      this.setVelocityY(PLAYER.JUMP_VELOCITY * 0.85);
      this.doubleJumpAvailable = false;
      this.scene.audio?.jump();
      this.scene.juice?.spark(this.x, this.y + 20, COLOR.CYAN, 6);
    }
  }

  _doDash() {
    if (!this.alive || !this.dashReady || this.dashing) return;
    this.dashing = true;
    this.dashReady = false;
    this.invulnerable = true;
    this.scene.audio?.dash();

    const ox = this.x;
    this.setVelocityX(PLAYER.DASH_VELOCITY);
    // Afterimage
    this.scene.juice?.spark(this.x, this.y, COLOR.VIOLET, 10);

    this.scene.time.delayedCall(PLAYER.DASH_DURATION, () => {
      this.dashing = false;
      this.setVelocityX(0);
      if (!this._blinkTween) this.invulnerable = false;
    });
    this.scene.time.delayedCall(PLAYER.DASH_COOLDOWN, () => { this.dashReady = true; });
  }

  update() {
    if (!this.alive) return;
    const k = this.keys;

    // Vertikales Ausweichen (im Flug zusätzlich steuerbar)
    let vy = this.body.velocity.y;
    // (Hauptbewegung bleibt Schwerkraft + Sprung; up/down geben leichten Schub)

    // Sprung
    if (k && (Phaser.Input.Keyboard.JustDown(k.jump))) this._doJump();
    // Dash
    if (k && (Phaser.Input.Keyboard.JustDown(k.dash))) this._doDash();

    // leichte horizontale Korrektur (optional A/D), nur wenn nicht im Dash
    if (!this.dashing && k) {
      if (k.left.isDown) this.setVelocityX(-200);
      else if (k.right.isDown) this.setVelocityX(200);
      else this.setVelocityX(0);
      // sanft zurück zur Startbahn
      if (!k.left.isDown && !k.right.isDown) {
        const dx = PLAYER.X - this.x;
        if (Math.abs(dx) > 4) this.setVelocityX(Phaser.Math.Clamp(dx * 4, -260, 260));
      }
    }

    // Neigung je nach Vertikalgeschwindigkeit (Lauf-/Sprunggefühl)
    this.setRotation(Phaser.Math.Clamp(this.body.velocity.y / 2600, -0.25, 0.35));

    // Schild-Ring nachführen
    if (this.shieldRing.visible) this.shieldRing.setPosition(this.x, this.y);
  }

  // Treffer einstecken. Gibt true zurück, wenn Schaden genommen wurde (für Score/Death-Logik).
  takeHit() {
    if (this.invulnerable || !this.alive) return false;

    if (this.hasShield) {
      this.hasShield = false;
      this.shieldRing.setVisible(false);
      this._iframes(700);
      this.scene.audio?.hit();
      this.scene.juice?.flash(120, 80, 240, 255);
      return false; // Schild absorbiert
    }

    this.hp -= 1;
    this.scene.audio?.hit();
    this.scene.juice?.shake(180, 0.012);
    this.scene.juice?.flash(140, 255, 60, 90);
    this._iframes(PLAYER.IFRAMES);

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return true;
  }

  _iframes(ms) {
    this.invulnerable = true;
    if (this._blinkTween) this._blinkTween.stop();
    this._blinkTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: Math.floor(ms / 180),
      onComplete: () => {
        this.setAlpha(1);
        this.invulnerable = false;
        this._blinkTween = null;
      },
    });
  }

  giveShield() {
    this.hasShield = true;
    this.shieldRing.setVisible(true).setPosition(this.x, this.y);
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.invulnerable = true;
    this.setVelocity(0, 0);
    this.body.setGravityY(0);
    this.trail.stop();
    this.shieldRing.setVisible(false);
    this.scene.juice?.explode(this.x, this.y, COLOR.MAGENTA, 30);
    this.scene.juice?.shake(280, 0.02);
    this.setVisible(false);
  }
}
