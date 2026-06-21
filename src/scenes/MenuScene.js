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
    const nova = this.add.image(GAME.WIDTH / 2 - 165, 278, TEX.NOVA).setScale(1.6).setDepth(5);
    this.tweens.add({ targets: nova, y: 266, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const duck = this.add.image(GAME.WIDTH / 2 + 165, 280, TEX.RUBBER_DUCK).setScale(1.55).setDepth(5);
    this.tweens.add({ targets: duck, y: 294, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: duck, angle: -6, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(GAME.WIDTH / 2 + 165, 366, '★ RETTE MICH!', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffd34f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ffd34f', 10, true, true);

    const title = this.add.text(GAME.WIDTH / 2, 104, 'UNICORN: DUCK PROTOCOL', {
      fontFamily: 'Trebuchet MS', fontSize: '52px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);
    title.setShadow(0, 0, '#ff4fd8', 24, true, true);
    this.tweens.add({ targets: title, scale: 1.03, duration: 1400, yoyo: true, repeat: -1 });

    this.add.text(GAME.WIDTH / 2, 154, 'Rette die legendäre Gummiente', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#39f6ff',
    }).setOrigin(0.5).setDepth(6);

    // Bestenliste (Top 3 mit Namen)
    const list = ScoreStore.getList();
    this.add.text(GAME.WIDTH / 2, 404, '🏆 BESTENLISTE', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ffd34f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ffd34f', 10, true, true);
    const medals = ['🥇', '🥈', '🥉'];
    if (list.length === 0) {
      this.add.text(GAME.WIDTH / 2, 436, 'Noch kein Eintrag – spiel die erste Runde!', {
        fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#bdb3e0',
      }).setOrigin(0.5).setDepth(6);
    } else {
      list.slice(0, 3).forEach((e, i) => {
        this.add.text(GAME.WIDTH / 2, 436 + i * 26, `${medals[i]}  ${e.name.padEnd(10, ' ')}  ${e.score}`, {
          fontFamily: 'Courier New, monospace', fontSize: '18px', color: i === 0 ? '#ffffff' : '#cfc6ec',
        }).setOrigin(0.5).setDepth(6);
      });
    }

    // Start
    new NeonButton(this, GAME.WIDTH / 2, 542, '▶  START', () => {
      this.audio?.unlock();
      this.audio?.stopMusic();
      this.scene.start('Game');
    }, { color: COLOR.MAGENTA, width: 300 }).setDepth(6);

    // Steuerung
    this.add.text(GAME.WIDTH / 2, 602,
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
