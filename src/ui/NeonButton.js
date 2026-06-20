// Wiederverwendbarer Neon-Button (Menü, Pause, GameOver).
import { COLOR } from '../config/constants.js';

export default class NeonButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, onClick, opts = {}) {
    super(scene, x, y);
    scene.add.existing(this);

    const w = opts.width || 280;
    const h = opts.height || 64;
    const color = opts.color || COLOR.CYAN;

    this.bg = scene.add.graphics();
    this._draw(this.bg, w, h, color, 0.12);

    this.glow = scene.add.graphics();
    this._draw(this.glow, w, h, color, 0.0, true);

    this.label = scene.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: opts.fontSize || '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.label.setShadow(0, 0, '#' + color.toString(16).padStart(6, '0'), 12, true, true);

    this.add([this.glow, this.bg, this.label]);
    this.setSize(w, h);
    this.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    this.on('pointerover', () => {
      scene.tweens.add({ targets: this, scale: 1.06, duration: 120 });
      this.glow.clear(); this._draw(this.glow, w, h, color, 0.25, true);
    });
    this.on('pointerout', () => {
      scene.tweens.add({ targets: this, scale: 1, duration: 120 });
      this.glow.clear();
    });
    this.on('pointerdown', () => {
      scene.tweens.add({ targets: this, scale: 0.96, duration: 60, yoyo: true });
      onClick && onClick();
    });
  }

  _draw(g, w, h, color, alpha, outline = false) {
    if (outline) {
      g.lineStyle(8, color, 0.3);
      g.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 16);
    } else {
      g.fillStyle(color, alpha);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      g.lineStyle(3, color, 0.9);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    }
  }
}
