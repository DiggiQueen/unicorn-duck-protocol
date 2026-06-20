// Pause-Overlay. Pausiert Game + Hud. Fortsetzen / Neustart / Hauptmenü.
import NeonButton from '../ui/NeonButton.js';
import { GAME, COLOR } from '../config/constants.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    this.audio = this.registry.get('audio');
    this.add.rectangle(0, 0, GAME.WIDTH, GAME.HEIGHT, 0x05010f, 0.78).setOrigin(0);

    this.add.text(GAME.WIDTH / 2, 200, 'PAUSE', {
      fontFamily: 'Trebuchet MS', fontSize: '64px', color: '#39f6ff', fontStyle: 'bold',
    }).setOrigin(0.5).setShadow(0, 0, '#9b5cff', 24, true, true);

    new NeonButton(this, GAME.WIDTH / 2, 320, '▶  WEITER', () => this.resumeGame(), { color: COLOR.GREEN });
    new NeonButton(this, GAME.WIDTH / 2, 400, '↻  NEUSTART', () => {
      this.scene.stop('Pause');
      this.scene.stop('Hud');
      this.scene.stop('Game');
      this.scene.start('Game');
    }, { color: COLOR.MAGENTA });
    new NeonButton(this, GAME.WIDTH / 2, 480, '⌂  HAUPTMENÜ', () => {
      this.scene.stop('Pause');
      this.scene.stop('Hud');
      this.scene.stop('Game');
      this.scene.start('Menu');
    }, { color: COLOR.VIOLET });

    this._muteText = this.add.text(GAME.WIDTH / 2, 560, '', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this._refreshMute();
    this._muteText.on('pointerdown', () => { this.audio?.toggleMute(); this._refreshMute(); });

    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard.on('keydown-P', () => this.resumeGame());
  }

  _refreshMute() {
    this._muteText.setText(this.audio?.isMuted ? '🔇 Ton aus' : '🔊 Ton an');
  }

  resumeGame() {
    this.scene.stop('Pause');
    this.scene.resume('Game');
    this.scene.resume('Hud');
  }
}
