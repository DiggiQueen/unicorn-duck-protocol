// HUD: parallele Overlay-Szene. Liest Spielzustand aus der Registry + Events.
// Score, HP-Herzen, Schild/Dash, Power-Up-Timerbalken, Boss-HP, Touch-Buttons.
import { GAME, COLOR, TEX, PLAYER, PU } from '../config/constants.js';

export default class HudScene extends Phaser.Scene {
  constructor() {
    super('Hud');
  }

  create() {
    this.game_ = this.scene.get('Game');

    // Score
    this.scoreText = this.add.text(24, 18, 'SCORE 0', {
      fontFamily: 'Trebuchet MS', fontSize: '30px', color: '#ffffff', fontStyle: 'bold',
    }).setShadow(0, 0, '#39f6ff', 12, true, true);

    // HP-Herzen
    this.hearts = [];
    for (let i = 0; i < PLAYER.MAX_HP; i++) {
      this.hearts.push(this.add.image(34 + i * 36, 70, TEX.HEART).setScale(1));
    }

    // Schild- / Dash-Status
    this.statusText = this.add.text(24, 92, '', {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#39f6ff',
    });

    // Power-Up-Timerbalken (oben rechts)
    this.puBars = {};
    const puList = [
      { type: PU.LASER, label: 'LASER', color: COLOR.MAGENTA },
      { type: PU.MAGNET, label: 'MAGNET', color: COLOR.GOLD },
      { type: PU.SLOWMO, label: 'SLOW-MO', color: COLOR.VIOLET },
    ];
    puList.forEach((pu, i) => {
      const y = 20 + i * 26;
      const label = this.add.text(GAME.WIDTH - 220, y, pu.label, {
        fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ffffff',
      }).setVisible(false);
      const bar = this.add.graphics();
      this.puBars[pu.type] = { label, bar, color: pu.color, y };
    });

    // Boss-HP-Bar (versteckt bis Boss da ist)
    this.bossBarBg = this.add.graphics().setVisible(false);
    this.bossBar = this.add.graphics().setVisible(false);
    this.bossLabel = this.add.text(GAME.WIDTH / 2, 24, 'EMPEROR DUCK X', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ff3b5c', fontStyle: 'bold',
    }).setOrigin(0.5).setVisible(false).setShadow(0, 0, '#ff3b5c', 10, true, true);
    this.bossHpRatio = 1;

    // Fortschritt bis Boss
    this.progressText = this.add.text(GAME.WIDTH / 2, 700, '', {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#bdb3e0',
    }).setOrigin(0.5);

    // Pause-Hinweis / Button
    this.add.text(GAME.WIDTH - 20, GAME.HEIGHT - 24, 'ESC / P: Pause   M: Ton', {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#7a719e',
    }).setOrigin(1, 1);

    this._setupTouchControls();

    // Events von GameScene
    this.game_.events.on('boss-spawned', () => {
      this.bossBarBg.setVisible(true);
      this.bossBar.setVisible(true);
      this.bossLabel.setVisible(true);
      this.bossHpRatio = 1;
    });
    this.game_.events.on('boss-hp', (ratio) => { this.bossHpRatio = ratio; });
    this.game_.events.on('enemy-killed', () => this._popScore());
  }

  _popScore() {
    this.tweens.add({ targets: this.scoreText, scale: 1.12, duration: 80, yoyo: true });
  }

  _setupTouchControls() {
    // Nur sinnvoll auf Touch-Geräten; schaden auf Desktop nicht (transparent unten).
    const mk = (x, label, color, evt) => {
      const c = this.add.container(x, GAME.HEIGHT - 90);
      const g = this.add.graphics();
      g.fillStyle(color, 0.18); g.fillCircle(0, 0, 50);
      g.lineStyle(3, color, 0.6); g.strokeCircle(0, 0, 50);
      const t = this.add.text(0, 0, label, {
        fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#ffffff',
      }).setOrigin(0.5);
      c.add([g, t]);
      c.setSize(100, 100);
      c.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
      c.on('pointerdown', () => this.game_.events.emit(evt));
      c.setAlpha(this.sys.game.device.input.touch ? 0.9 : 0.0);
      return c;
    };
    mk(110, 'SPRUNG', COLOR.CYAN, 'touch-jump');
    mk(230, 'DASH', COLOR.VIOLET, 'touch-dash');
  }

  update() {
    const r = this.registry;
    this.scoreText.setText('SCORE ' + (r.get('score') || 0));

    // Herzen
    const hp = r.get('hp');
    if (hp !== undefined) {
      this.hearts.forEach((h, i) => h.setAlpha(i < hp ? 1 : 0.18));
    }

    // Status
    const parts = [];
    if (r.get('shield')) parts.push('🛡 SCHILD');
    parts.push(r.get('dashReady') ? '⚡ DASH BEREIT' : '⚡ ...');
    this.statusText.setText(parts.join('    '));

    // Power-Up-Balken
    const pm = this.game_.powerups;
    if (pm) {
      Object.entries(this.puBars).forEach(([type, ui]) => {
        const rem = pm.remaining(type);
        const on = pm.isActive(type) && rem > 0;
        ui.label.setVisible(on);
        ui.bar.clear();
        if (on) {
          ui.bar.fillStyle(0x222244, 0.8).fillRoundedRect(GAME.WIDTH - 150, ui.y + 2, 130, 12, 4);
          ui.bar.fillStyle(ui.color, 1).fillRoundedRect(GAME.WIDTH - 150, ui.y + 2, 130 * rem, 12, 4);
        }
      });
    }

    // Boss-HP
    if (this.bossBar.visible) {
      const w = 600, x = GAME.WIDTH / 2 - w / 2, y = 46;
      this.bossBarBg.clear().fillStyle(0x330011, 0.85).fillRoundedRect(x, y, w, 16, 6);
      this.bossBar.clear()
        .fillStyle(COLOR.DANGER, 1).fillRoundedRect(x, y, w * this.bossHpRatio, 16, 6)
        .lineStyle(2, COLOR.GOLD, 0.8).strokeRoundedRect(x, y, w, 16, 6);
    }

    // Fortschritt
    if (!r.get('bossActive')) {
      const t = Math.ceil((r.get('timeToBoss') || 0) / 1000);
      this.progressText.setText('Boss in ' + t + 's');
    } else {
      this.progressText.setText('');
    }
  }
}
