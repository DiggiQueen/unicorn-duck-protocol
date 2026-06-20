// Einstiegspunkt: Phaser-Game-Konfiguration + Szenen-Registrierung.
import { GAME } from './config/constants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import HudScene from './scenes/HudScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#05010f',
  pixelArt: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Gravitation wird pro-Körper gesetzt (nur Nova)
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    HudScene,
    PauseScene,
    GameOverScene,
  ],
};

// Boot-Hinweis entfernen, sobald Phaser läuft.
const game = new Phaser.Game(config);
game.events.once('ready', () => {
  const boot = document.getElementById('boot');
  if (boot) boot.remove();
});

window.__game = game; // Debug-Zugriff
