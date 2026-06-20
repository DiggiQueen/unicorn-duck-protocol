// BootScene: erzeugt ALLE Texturen prozedural via Graphics -> generateTexture.
// Kein externes Bild nötig -> kein Asset-Risiko. Danach -> PreloadScene.
import { COLOR, TEX, GAME } from '../config/constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.makeSoftDot(TEX.PARTICLE, 16, COLOR.WHITE);
    this.makeSoftDot(TEX.GLOW, 64, COLOR.WHITE);

    // Projektile
    this.makeBullet(TEX.BULLET, COLOR.CYAN);
    this.makeBullet(TEX.BULLET_LASER, COLOR.MAGENTA, true);
    this.makeBullet(TEX.ENEMY_BULLET, COLOR.DANGER);
    this.makeRocket(TEX.ROCKET, COLOR.DANGER);

    // Gegner
    this.makeDrone(TEX.DRONE);
    this.makeSlime(TEX.SLIME);
    this.makeGoose(TEX.GOOSE);
    this.makeBoss(TEX.BOSS);

    // Sammelobjekte
    this.makeFragment(TEX.FRAGMENT, COLOR.CYAN);
    // Klassische gelbe Quietsche-Ente (Thema!) + goldene Legenden-Version
    this.makeDuck(TEX.RUBBER_DUCK, 0xffe23d, 0xff8c1a, COLOR.GOLD);
    this.makeDuck(TEX.GOLDEN_DUCK, COLOR.GOLD, 0xff9b1f, COLOR.GOLD);

    // Power-Up-Icons
    this.makePowerup(TEX.PU_LASER, COLOR.MAGENTA, 'laser');
    this.makePowerup(TEX.PU_MAGNET, COLOR.GOLD, 'magnet');
    this.makePowerup(TEX.PU_SHIELD, COLOR.CYAN, 'shield');
    this.makePowerup(TEX.PU_SLOWMO, COLOR.VIOLET, 'slowmo');

    // UI / HUD
    this.makeHeart(TEX.HEART, COLOR.DANGER);
    this.makeRing(TEX.RING, COLOR.CYAN);

    // Hintergrund-Ebenen
    this.makeStars(TEX.STARS);
    this.makeGrid(TEX.GRID);

    // Nova zuletzt (komplexere Zeichnung)
    this.makeNova(TEX.NOVA);

    this.scene.start('Preload');
  }

  // --- Helfer ------------------------------------------------------------

  // Weicher, runder Glow-Punkt (für Partikel & ADD-Blend-Glow)
  makeSoftDot(key, size, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const r = size / 2;
    for (let i = r; i > 0; i--) {
      const a = Math.pow(i / r, 2) * 0.06 + 0.02;
      g.fillStyle(color, 1 - i / r > 0 ? a : a);
      g.fillCircle(r, r, i);
    }
    g.fillStyle(color, 0.9);
    g.fillCircle(r, r, Math.max(1, r * 0.35));
    g.generateTexture(key, size, size);
    g.destroy();
  }

  // Zeichnet eine Form mit Neon-Glow: erst 3 größere Low-Alpha-Kopien.
  glowShape(g, drawFn, color, glowColor) {
    const gc = glowColor !== undefined ? glowColor : color;
    drawFn(g, gc, 0.12, 8);
    drawFn(g, gc, 0.18, 4);
    drawFn(g, color, 1, 0);
  }

  makeBullet(key, color, big = false) {
    const w = big ? 44 : 28;
    const h = big ? 14 : 10;
    const g = this.make.graphics({ add: false });
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      gg.fillRoundedRect(2 - pad, (h / 2 - h / 2) + 2 - pad, w - 4 + pad * 2, h - 4 + pad * 2, (h - 4) / 2 + pad);
    }, color);
    g.generateTexture(key, w + 16, h + 16);
    g.destroy();
  }

  makeRocket(key, color) {
    const g = this.make.graphics({ add: false });
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      gg.fillTriangle(4 - pad, 8 - pad, 4 - pad, 24 + pad, 30 + pad, 16);
      gg.fillRoundedRect(4 - pad, 10 - pad, 18 + pad, 12 + pad * 2, 4);
    }, color, COLOR.GOLD);
    g.generateTexture(key, 40, 34);
    g.destroy();
  }

  makeDrone(key) {
    const g = this.make.graphics({ add: false });
    const s = 44;
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      // Diamant-Körper
      gg.fillPoints([
        { x: s / 2, y: 6 - pad }, { x: s - 4 + pad, y: s / 2 },
        { x: s / 2, y: s - 6 + pad }, { x: 4 - pad, y: s / 2 },
      ], true);
    }, COLOR.DANGER, COLOR.MAGENTA);
    // Auge
    g.fillStyle(COLOR.CYAN, 1);
    g.fillCircle(s / 2, s / 2, 5);
    g.fillStyle(COLOR.WHITE, 1);
    g.fillCircle(s / 2, s / 2, 2);
    g.generateTexture(key, s, s);
    g.destroy();
  }

  makeSlime(key) {
    const g = this.make.graphics({ add: false });
    const s = 48;
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      gg.fillCircle(s / 2, s / 2 + 4, s / 2 - 6 + pad);
    }, COLOR.GREEN, COLOR.GREEN);
    g.fillStyle(COLOR.WHITE, 0.95);
    g.fillCircle(s / 2 - 7, s / 2, 4);
    g.fillCircle(s / 2 + 7, s / 2, 4);
    g.fillStyle(0x06210f, 1);
    g.fillCircle(s / 2 - 7, s / 2 + 1, 2);
    g.fillCircle(s / 2 + 7, s / 2 + 1, 2);
    g.generateTexture(key, s, s + 6);
    g.destroy();
  }

  makeGoose(key) {
    const g = this.make.graphics({ add: false });
    const w = 72, h = 64;
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      gg.fillEllipse(w / 2, h / 2 + 6, w - 12 + pad * 2, h - 22 + pad * 2); // Körper
      gg.fillCircle(w - 18, 20, 14 + pad); // Kopf
    }, COLOR.VIOLET, COLOR.MAGENTA);
    // Schnabel
    g.fillStyle(COLOR.GOLD, 1);
    g.fillTriangle(w - 6, 16, w - 6, 26, w + 6, 21);
    // Auge
    g.fillStyle(COLOR.DANGER, 1);
    g.fillCircle(w - 14, 16, 4);
    g.generateTexture(key, w + 8, h + 8);
    g.destroy();
  }

  makeBoss(key) {
    const g = this.make.graphics({ add: false });
    const w = 260, h = 220;
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      gg.fillRoundedRect(20 - pad, 50 - pad, w - 40 + pad * 2, h - 70 + pad * 2, 30); // Mech-Körper
      gg.fillCircle(w - 56, 60, 46 + pad); // Kopf
    }, COLOR.DANGER, COLOR.MAGENTA);
    // Panzerplatten
    g.lineStyle(4, COLOR.GOLD, 0.9);
    g.strokeRoundedRect(34, 64, w - 68, h - 98, 24);
    // Schnabel
    g.fillStyle(COLOR.GOLD, 1);
    g.fillTriangle(w - 14, 48, w - 14, 74, w + 18, 61);
    // Augen (böse)
    g.fillStyle(COLOR.CYAN, 1);
    g.fillCircle(w - 66, 52, 9);
    g.fillStyle(COLOR.WHITE, 1);
    g.fillCircle(w - 66, 52, 4);
    // Kernreaktor
    g.fillStyle(COLOR.GOLD, 0.9);
    g.fillCircle(w / 2 - 20, h / 2 + 20, 18);
    g.generateTexture(key, w + 24, h + 12);
    g.destroy();
  }

  makeFragment(key, color) {
    const g = this.make.graphics({ add: false });
    const s = 26;
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      gg.fillPoints([
        { x: s / 2, y: 2 - pad }, { x: s - 4 + pad, y: s / 2 },
        { x: s / 2, y: s - 2 + pad }, { x: 4 - pad, y: s / 2 },
      ], true);
    }, color, COLOR.GOLD);
    g.fillStyle(COLOR.WHITE, 0.8);
    g.fillCircle(s / 2, s / 2, 3);
    g.generateTexture(key, s, s);
    g.destroy();
  }

  // Klassische Quietsche-Enten-Silhouette (für gelbe + goldene Variante).
  makeDuck(key, body, beak, glow) {
    const g = this.make.graphics({ add: false });
    const w = 108, h = 96;

    // Neon-Glow-Aura
    g.fillStyle(glow, 0.10); g.fillCircle(54, 52, 50);
    g.fillStyle(glow, 0.10); g.fillCircle(60, 50, 40);

    // Körper (fette untere Ellipse) + erhobener Schwanz
    g.fillStyle(body, 1);
    g.fillEllipse(52, 62, 84, 52);
    g.fillTriangle(12, 60, 34, 44, 26, 70); // Schwanz hoch-links

    // Kopf (großer Kreis oben rechts)
    g.fillCircle(78, 34, 27);

    // Wange-Glanz
    g.fillStyle(0xffffff, 0.18);
    g.fillEllipse(68, 56, 40, 18);
    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(70, 28, 9);

    // Flügel-Andeutung
    g.fillStyle(0x000000, 0.10);
    g.fillEllipse(50, 64, 44, 24);

    // Schnabel (orange, klassisch flach)
    g.fillStyle(beak, 1);
    g.fillEllipse(102, 38, 30, 15);
    g.fillTriangle(96, 31, 116, 38, 96, 45);
    g.fillStyle(0x000000, 0.12);
    g.fillRect(90, 38, 22, 2); // Schnabelspalt

    // Auge
    g.fillStyle(0x1a1206, 1);
    g.fillCircle(84, 27, 4.5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(85.5, 25, 1.8);

    g.generateTexture(key, w + 12, h + 8);
    g.destroy();
  }

  makePowerup(key, color, kind) {
    const g = this.make.graphics({ add: false });
    const s = 44;
    // Kapsel-Rahmen
    this.glowShape(g, (gg, c, a, pad) => {
      gg.lineStyle(4 + pad, c, a === 1 ? 1 : a);
      gg.strokeCircle(s / 2, s / 2, s / 2 - 5 + pad / 2);
    }, color);
    g.fillStyle(color, 0.18);
    g.fillCircle(s / 2, s / 2, s / 2 - 6);
    // Icon
    g.fillStyle(COLOR.WHITE, 1);
    const cx = s / 2, cy = s / 2;
    if (kind === 'laser') {
      g.fillRect(cx - 12, cy - 2, 24, 4);
      g.fillTriangle(cx + 10, cy - 6, cx + 10, cy + 6, cx + 18, cy);
    } else if (kind === 'magnet') {
      g.lineStyle(4, COLOR.WHITE, 1);
      g.beginPath();
      g.arc(cx, cy + 2, 9, Math.PI, 0, false);
      g.strokePath();
      g.fillRect(cx - 11, cy + 1, 4, 8);
      g.fillRect(cx + 7, cy + 1, 4, 8);
    } else if (kind === 'shield') {
      g.fillPoints([
        { x: cx, y: cy - 11 }, { x: cx + 9, y: cy - 5 },
        { x: cx + 9, y: cy + 4 }, { x: cx, y: cy + 11 },
        { x: cx - 9, y: cy + 4 }, { x: cx - 9, y: cy - 5 },
      ], true);
      g.fillStyle(color, 1);
      g.fillCircle(cx, cy, 3);
    } else if (kind === 'slowmo') {
      g.lineStyle(3, COLOR.WHITE, 1);
      g.strokeCircle(cx, cy, 9);
      g.lineStyle(3, COLOR.WHITE, 1);
      g.lineBetween(cx, cy, cx, cy - 6);
      g.lineBetween(cx, cy, cx + 5, cy + 2);
    }
    g.generateTexture(key, s, s);
    g.destroy();
  }

  makeHeart(key, color) {
    const g = this.make.graphics({ add: false });
    const s = 30;
    this.glowShape(g, (gg, c, a, pad) => {
      gg.fillStyle(c, a);
      gg.fillCircle(s / 2 - 6, s / 2 - 3, 7 + pad);
      gg.fillCircle(s / 2 + 6, s / 2 - 3, 7 + pad);
      gg.fillTriangle(s / 2 - 12 - pad, s / 2 - 1, s / 2 + 12 + pad, s / 2 - 1, s / 2, s - 4 + pad);
    }, color, COLOR.MAGENTA);
    g.generateTexture(key, s, s);
    g.destroy();
  }

  makeRing(key, color) {
    const g = this.make.graphics({ add: false });
    const s = 140;
    g.lineStyle(6, color, 0.9);
    g.strokeCircle(s / 2, s / 2, s / 2 - 6);
    g.lineStyle(14, color, 0.15);
    g.strokeCircle(s / 2, s / 2, s / 2 - 6);
    g.generateTexture(key, s, s);
    g.destroy();
  }

  makeStars(key) {
    const w = GAME.WIDTH, h = GAME.HEIGHT;
    const g = this.make.graphics({ add: false });
    // deterministisches Pseudo-Random (kein Math.random nötig, aber hier ok in Scene)
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 140; i++) {
      const x = rnd() * w, y = rnd() * h * 0.85;
      const r = rnd() * 1.8 + 0.4;
      const c = [COLOR.CYAN, COLOR.MAGENTA, COLOR.WHITE, COLOR.VIOLET][Math.floor(rnd() * 4)];
      g.fillStyle(c, rnd() * 0.6 + 0.3);
      g.fillCircle(x, y, r);
    }
    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeGrid(key) {
    const w = GAME.WIDTH, h = 240;
    const g = this.make.graphics({ add: false });
    const horizonY = 20;
    g.lineStyle(2, COLOR.VIOLET, 0.5);
    // horizontale Linien (perspektivisch dichter werdend)
    for (let i = 0; i <= 10; i++) {
      const k = i / 10;
      const y = horizonY + Math.pow(k, 1.8) * (h - horizonY);
      g.lineStyle(2, COLOR.MAGENTA, 0.12 + k * 0.5);
      g.lineBetween(0, y, w, y);
    }
    // vertikale Fluchtlinien
    const vx = w / 2;
    for (let i = -10; i <= 10; i++) {
      const xBottom = vx + i * (w / 12);
      g.lineStyle(2, COLOR.CYAN, 0.35);
      g.lineBetween(vx + i * 18, horizonY, xBottom, h);
    }
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // Stilisiertes Neon-Einhorn "Nova" (komplett gezeichnet, keine Datei).
  makeNova(key) {
    const g = this.make.graphics({ add: false });
    const w = 96, h = 84;
    const body = COLOR.WHITE;
    const accent = COLOR.MAGENTA;

    // Glow-Aura
    g.fillStyle(COLOR.CYAN, 0.10);
    g.fillCircle(w / 2, h / 2, 50);
    g.fillStyle(accent, 0.10);
    g.fillCircle(w / 2 + 6, h / 2, 42);

    // Beine (dynamische Lauf-Pose)
    g.fillStyle(body, 1);
    g.fillRoundedRect(26, 56, 8, 22, 4);
    g.fillRoundedRect(44, 58, 8, 20, 4);
    g.fillRoundedRect(58, 56, 8, 22, 4);
    g.fillRoundedRect(70, 58, 8, 18, 4);

    // Rumpf
    g.fillStyle(body, 1);
    g.fillEllipse(50, 48, 64, 34);

    // Hals + Kopf
    g.fillRoundedRect(64, 18, 18, 34, 9);
    g.fillEllipse(80, 22, 30, 24);
    // Schnauze
    g.fillEllipse(92, 28, 16, 14);

    // Ohr
    g.fillTriangle(70, 12, 78, 14, 72, 2);

    // Auge
    g.fillStyle(0x10122a, 1);
    g.fillCircle(84, 20, 3.2);
    g.fillStyle(COLOR.CYAN, 1);
    g.fillCircle(85, 19, 1.3);

    // Neon-Horn
    g.fillStyle(COLOR.CYAN, 1);
    g.fillTriangle(82, 8, 90, 12, 100, -10);
    g.fillStyle(COLOR.WHITE, 0.6);
    g.fillTriangle(84, 8, 88, 10, 98, -8);

    // Regenbogen-Mähne (mehrfarbige Strähnen)
    const mane = [COLOR.MAGENTA, COLOR.VIOLET, COLOR.CYAN, COLOR.GREEN, COLOR.GOLD];
    for (let i = 0; i < mane.length; i++) {
      g.fillStyle(mane[i], 1);
      g.fillTriangle(
        66 - i * 4, 16 + i * 6,
        78 - i * 4, 14 + i * 6,
        58 - i * 5, 30 + i * 7
      );
    }
    // Schweif (Regenbogen)
    for (let i = 0; i < mane.length; i++) {
      g.fillStyle(mane[i], 1);
      g.fillTriangle(
        22, 40 + i * 3,
        30, 42 + i * 3,
        6 - i * 2, 30 + i * 6
      );
    }

    // Glanz auf dem Rumpf
    g.fillStyle(accent, 0.25);
    g.fillEllipse(48, 42, 40, 14);

    g.generateTexture(key, w + 8, h + 8);
    g.destroy();
  }
}
