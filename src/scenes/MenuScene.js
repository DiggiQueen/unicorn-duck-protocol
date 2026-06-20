// Hauptmenü: Titel, Start, Highscore, Steuerungs-Legende, Mute-Toggle.
import NeonButton from '../ui/NeonButton.js';
import ParallaxBackground from '../systems/ParallaxBackground.js';
import { ScoreStore } from '../systems/ScoreStore.js';
import { GAME, COLOR, TEX } from '../config/constants.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.audio = this.registry.get('audio');
    this.bg = new ParallaxBackground(this);

    // dekorative Nova (links) + die zu rettende Gummiente (rechts)
    const nova = this.add.image(GAME.WIDTH / 2 - 150, 300, TEX.NOVA).setScale(2.2).setDepth(5);
    this.tweens.add({ targets: nova, y: 282, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const duck = this.add.image(GAME.WIDTH / 2 + 170, 300, TEX.RUBBER_DUCK).setScale(2.0).setDepth(5);
    this.tweens.add({ targets: duck, y: 318, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: duck, angle: -6, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(GAME.WIDTH / 2 + 170, 380, '★ RETTE MICH!', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffd34f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ffd34f', 10, true, true);

    const title = this.add.text(GAME.WIDTH / 2, 130, 'UNICORN: DUCK PROTOCOL', {
      fontFamily: 'Trebuchet MS', fontSize: '56px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);
    title.setShadow(0, 0, '#ff4fd8', 24, true, true);
    this.tweens.add({ targets: title, scale: 1.03, duration: 1400, yoyo: true, repeat: -1 });

    this.add.text(GAME.WIDTH / 2, 180, 'Rette die legendäre Gummiente', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#39f6ff',
    }).setOrigin(0.5).setDepth(6);

    // Highscore
    const hs = ScoreStore.getHighscore();
    this.add.text(GAME.WIDTH / 2, 430, 'HIGHSCORE: ' + hs, {
      fontFamily: 'Trebuchet MS', fontSize: '26px', color: '#ffd34f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ffd34f', 12, true, true);

    // Start
    new NeonButton(this, GAME.WIDTH / 2, 510, '▶  START', () => {
      this.audio?.unlock();
      this.audio?.stopMusic();
      this.scene.start('Game');
    }, { color: COLOR.MAGENTA, width: 300 }).setDepth(6);

    // Steuerung
    this.add.text(GAME.WIDTH / 2, 600,
      'LEERTASTE: Springen (Doppelsprung)   •   SHIFT: Dash   •   Waffe feuert automatisch', {
      fontFamily: 'Trebuchet MS', fontSize: '17px', color: '#bdb3e0',
    }).setOrigin(0.5).setDepth(6);

    // Mute-Toggle
    this._muteText = this.add.text(GAME.WIDTH - 20, 20, '', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffffff',
    }).setOrigin(1, 0).setDepth(6).setInteractive({ useHandCursor: true });
    this._refreshMute();
    this._muteText.on('pointerdown', () => {
      this.audio?.unlock();
      this.audio?.toggleMute();
      this._refreshMute();
      if (!this.audio?.isMuted) this.audio?.playMusic('menu');
    });

    // Musik startet erst nach erster Interaktion (Autoplay-Policy).
    this.input.once('pointerdown', () => {
      this.audio?.unlock();
      if (!this.audio?.isMuted) this.audio?.playMusic('menu');
    });
    this.input.keyboard.once('keydown', () => {
      this.audio?.unlock();
      if (!this.audio?.isMuted) this.audio?.playMusic('menu');
    });

    // Enter startet ebenfalls
    this.input.keyboard.on('keydown-ENTER', () => {
      this.audio?.unlock();
      this.audio?.stopMusic();
      this.scene.start('Game');
    });
  }

  _refreshMute() {
    this._muteText.setText(this.audio?.isMuted ? '🔇 Ton aus (M)' : '🔊 Ton an (M)');
  }

  update(time, delta) {
    this.bg.update(delta, 360);
  }
}
