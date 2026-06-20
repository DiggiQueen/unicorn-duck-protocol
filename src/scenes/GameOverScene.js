// Game Over / Sieg. Doppelt genutzt: won=true -> goldene Ente gerettet.
import NeonButton from '../ui/NeonButton.js';
import ParallaxBackground from '../systems/ParallaxBackground.js';
import { ScoreStore } from '../systems/ScoreStore.js';
import { GAME, COLOR, TEX } from '../config/constants.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.won = !!data.won;
  }

  create() {
    this.audio = this.registry.get('audio');
    this.bg = new ParallaxBackground(this);

    const isNew = ScoreStore.submit(this.finalScore);
    const hs = ScoreStore.getHighscore();

    const cx = GAME.WIDTH / 2;

    if (this.won) {
      this.add.image(cx, 200, TEX.GOLDEN_DUCK).setScale(2.2).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
      this.add.text(cx, 320, 'GUMMIENTE GERETTET!', {
        fontFamily: 'Trebuchet MS', fontSize: '56px', color: '#ffd34f', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ffd34f', 24, true, true);
      this.add.text(cx, 372, 'Der Regenbogen-Kern ist gerettet. Nova ist die Heldin von 2077.', {
        fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#39f6ff',
      }).setOrigin(0.5).setDepth(6);
    } else {
      this.add.image(cx, 210, TEX.NOVA).setScale(2).setDepth(5).setAlpha(0.6);
      this.add.text(cx, 330, 'GAME OVER', {
        fontFamily: 'Trebuchet MS', fontSize: '64px', color: '#ff3b5c', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ff3b5c', 24, true, true);
      this.add.text(cx, 384, 'Die Shadow Ducks haben Nova erwischt ...', {
        fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#bdb3e0',
      }).setOrigin(0.5).setDepth(6);
    }

    this.add.text(cx, 440, 'SCORE: ' + this.finalScore, {
      fontFamily: 'Trebuchet MS', fontSize: '36px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#39f6ff', 12, true, true);

    const hsText = this.add.text(cx, 484, (isNew ? '★ NEUER HIGHSCORE: ' : 'HIGHSCORE: ') + hs, {
      fontFamily: 'Trebuchet MS', fontSize: '24px', color: isNew ? '#ffd34f' : '#bdb3e0', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);
    if (isNew) {
      hsText.setShadow(0, 0, '#ffd34f', 16, true, true);
      this.tweens.add({ targets: hsText, scale: 1.1, duration: 500, yoyo: true, repeat: -1 });
    }

    new NeonButton(this, cx, 560, '↻  NOCHMAL', () => {
      this.scene.start('Game');
    }, { color: COLOR.MAGENTA, width: 280 }).setDepth(6);

    new NeonButton(this, cx, 632, '⌂  HAUPTMENÜ', () => {
      this.scene.start('Menu');
    }, { color: COLOR.CYAN, width: 280 }).setDepth(6);

    if (this.won && !this.audio?.isMuted) this.audio?.victory();

    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('Game'));
    this.cameras.main.fadeIn(400);
  }

  update(time, delta) {
    this.bg.update(delta, 200);
  }
}
