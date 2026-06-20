// Parallax-Neon-Hintergrund: mehrere TileSprite-Ebenen mit unterschiedlichem Tempo.
import { GAME, TEX, COLOR } from '../config/constants.js';

export default class ParallaxBackground {
  constructor(scene) {
    this.scene = scene;
    const w = GAME.WIDTH, h = GAME.HEIGHT;

    // Farbverlauf-Himmel (statisch)
    this.sky = scene.add.graphics();
    this.sky.fillGradientStyle(COLOR.BG_TOP, COLOR.BG_TOP, COLOR.BG_BOT, COLOR.BG_BOT, 1);
    this.sky.fillRect(0, 0, w, h);
    this.sky.setDepth(-30);

    // Sterne (langsam)
    this.stars = scene.add.tileSprite(0, 0, w, h, TEX.STARS).setOrigin(0, 0);
    this.stars.setDepth(-25);
    this.stars.setScrollFactor(0);

    // Ferne Glow-Hügel (Graphics, einmalig)
    this.hills = scene.add.graphics();
    this.hills.setDepth(-22);
    this._drawHills(w, h);

    // Neon-Grid-Boden (schnell, Geometry-Dash-Vibe)
    this.grid = scene.add.tileSprite(0, GAME.GROUND_Y - 40, w, 240, TEX.GRID).setOrigin(0, 0);
    this.grid.setDepth(-20);

    // Bodenlinie
    this.floor = scene.add.graphics();
    this.floor.setDepth(-18);
    this.floor.lineStyle(3, COLOR.MAGENTA, 0.9);
    this.floor.lineBetween(0, GAME.GROUND_Y, w, GAME.GROUND_Y);
    this.floor.lineStyle(10, COLOR.MAGENTA, 0.15);
    this.floor.lineBetween(0, GAME.GROUND_Y, w, GAME.GROUND_Y);

    this.speed = 1;
  }

  _drawHills(w, h) {
    const g = this.hills;
    g.fillStyle(COLOR.VIOLET, 0.25);
    let x = 0;
    const baseY = GAME.GROUND_Y - 30;
    g.beginPath();
    g.moveTo(0, baseY);
    while (x < w + 100) {
      const peak = baseY - (80 + ((x * 7) % 120));
      g.lineTo(x + 60, peak);
      g.lineTo(x + 120, baseY);
      x += 120;
    }
    g.lineTo(w, h); g.lineTo(0, h);
    g.closePath();
    g.fillPath();
  }

  update(dt, worldSpeed) {
    const s = (worldSpeed / 360) * (dt / 16.666);
    this.stars.tilePositionX += 0.4 * s;
    this.grid.tilePositionX += 6 * s;
  }

  setSpeed(s) { this.speed = s; }
}
