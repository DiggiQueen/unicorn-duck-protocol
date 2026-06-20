// PreloadScene: erzeugt den AudioManager (in Registry) und zeigt kurz einen
// Neon-Ladebalken. Da alle Grafiken prozedural sind, ist hier wenig zu laden.
import AudioManager from '../systems/AudioManager.js';
import { GAME, COLOR } from '../config/constants.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create() {
    // AudioManager einmalig erzeugen und global verfügbar machen.
    if (!this.registry.get('audio')) {
      this.registry.set('audio', new AudioManager());
    }

    const cx = GAME.WIDTH / 2, cy = GAME.HEIGHT / 2;
    this.add.text(cx, cy - 60, 'UNICORN: DUCK PROTOCOL', {
      fontFamily: 'Trebuchet MS', fontSize: '40px', color: '#39f6ff', fontStyle: 'bold',
    }).setOrigin(0.5).setShadow(0, 0, '#9b5cff', 20, true, true);

    const barW = 420;
    const back = this.add.graphics();
    back.fillStyle(0x222244, 1).fillRoundedRect(cx - barW / 2, cy, barW, 18, 8);
    const fill = this.add.graphics();

    let p = 0;
    this.time.addEvent({
      delay: 16, repeat: 40, callback: () => {
        p = Math.min(1, p + 0.025);
        fill.clear();
        fill.fillStyle(COLOR.MAGENTA, 1).fillRoundedRect(cx - barW / 2, cy, barW * p, 18, 8);
        if (p >= 1) this.scene.start('Menu');
      },
    });
  }
}
