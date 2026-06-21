// Game Over / Sieg. Doppelt genutzt (won=true -> goldene Ente gerettet).
// Mit Namenseingabe + Top-5-Bestenliste.
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
    this.nameSaved = false;
    this.playerName = '';
    this.savedRank = -1;
  }

  create() {
    this.audio = this.registry.get('audio');
    this.bg = new ParallaxBackground(this);
    const cx = GAME.WIDTH / 2;

    this.qualifies = ScoreStore.isHighscore(this.finalScore);
    this.playerName = (ScoreStore.getLastName() || 'NOVA').toUpperCase();

    // --- Kopf (Sieg / Niederlage) ---
    if (this.won) {
      this.add.image(cx, 90, TEX.GOLDEN_DUCK).setScale(1.4).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
      this.add.text(cx, 150, 'GUMMIENTE GERETTET!', {
        fontFamily: 'Trebuchet MS', fontSize: '46px', color: '#ffd34f', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ffd34f', 22, true, true);
    } else {
      this.add.text(cx, 110, 'GAME OVER', {
        fontFamily: 'Trebuchet MS', fontSize: '56px', color: '#ff3b5c', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#ff3b5c', 22, true, true);
    }

    this.add.text(cx, this.won ? 196 : 168, 'SCORE: ' + this.finalScore, {
      fontFamily: 'Trebuchet MS', fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#39f6ff', 12, true, true);

    // --- Namenseingabe (nur wenn es für die Top-5 reicht) ---
    this.entryY = 250;
    if (this.qualifies) {
      this.add.text(cx, this.entryY, '★ NEUER HIGHSCORE – TRAG DICH EIN:', {
        fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ffd34f', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6);

      // Eingabefeld (Box + Text). Klick öffnet Prompt (Handy), sonst tippen.
      this.nameBox = this.add.rectangle(cx, this.entryY + 42, 320, 50, 0x1a0a3a, 0.9)
        .setStrokeStyle(3, COLOR.CYAN).setDepth(6).setInteractive({ useHandCursor: true });
      this.nameText = this.add.text(cx, this.entryY + 42, '', {
        fontFamily: 'Trebuchet MS', fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(7);
      this._updateNameText(true);

      this.add.text(cx, this.entryY + 78, '(A–Z, 0–9  ·  ENTER speichert  ·  Klick für Eingabe am Handy)', {
        fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#bdb3e0',
      }).setOrigin(0.5).setDepth(6);

      // Cursor-Blinken
      this._cursorOn = true;
      this.time.addEvent({
        delay: 450, loop: true, callback: () => {
          if (this.nameSaved) return;
          this._cursorOn = !this._cursorOn;
          this._updateNameText(this._cursorOn);
        },
      });

      // Tastatur-Eingabe
      this.input.keyboard.on('keydown', this._onKey, this);
      // Klick -> Prompt (Touch-Geräte)
      this.nameBox.on('pointerdown', () => {
        if (this.nameSaved) return;
        const v = window.prompt('Dein Name (max. 10 Zeichen):', this.playerName);
        if (v !== null) {
          this.playerName = v.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 10);
          this._updateNameText(true);
          this._saveName();
        }
      });

      new NeonButton(this, cx, this.entryY + 122, '💾  SPEICHERN', () => this._saveName(),
        { color: COLOR.GOLD, width: 240, fontSize: '22px' }).setDepth(6);
    }

    // --- Bestenliste ---
    this.listTop = this.qualifies ? 440 : 250;
    this.add.text(cx, this.listTop, '🏆 BESTENLISTE', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', color: '#39f6ff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#39f6ff', 10, true, true);
    this.listContainer = this.add.container(0, 0).setDepth(6);
    this._renderList();

    // --- Buttons ---
    new NeonButton(this, cx - 150, 660, '↻  NOCHMAL', () => this.scene.start('Game'),
      { color: COLOR.MAGENTA, width: 260 }).setDepth(6);
    new NeonButton(this, cx + 150, 660, '⌂  MENÜ', () => this.scene.start('Menu'),
      { color: COLOR.CYAN, width: 260 }).setDepth(6);

    if (this.won && !this.audio?.isMuted) this.audio?.victory();
    this.cameras.main.fadeIn(400);
  }

  _onKey(e) {
    if (this.nameSaved) return;
    if (e.key === 'Enter') { this._saveName(); return; }
    if (e.key === 'Backspace') { this.playerName = this.playerName.slice(0, -1); this._updateNameText(true); return; }
    if (e.key.length === 1 && this.playerName.length < 10 && /[A-Za-z0-9 ]/.test(e.key)) {
      this.playerName += e.key.toUpperCase();
      this._updateNameText(true);
    }
  }

  _updateNameText(cursor) {
    if (!this.nameText) return;
    this.nameText.setText(this.playerName + (cursor && !this.nameSaved ? '_' : ''));
  }

  _saveName() {
    if (this.nameSaved || !this.qualifies) return;
    if (!this.playerName.trim()) this.playerName = 'NOVA';
    this.nameSaved = true;
    this.savedRank = ScoreStore.addEntry(this.playerName, this.finalScore);
    this._updateNameText(false);
    this.audio?.powerup();
    if (this.nameBox) {
      this.nameBox.setStrokeStyle(3, COLOR.GREEN);
      this.add.text(GAME.WIDTH / 2, this.entryY + 42 + 0, '', {}); // no-op spacing
    }
    this._renderList();
  }

  _renderList() {
    this.listContainer.removeAll(true);
    const cx = GAME.WIDTH / 2;
    const list = ScoreStore.getList();
    if (list.length === 0) {
      this.listContainer.add(this.add.text(cx, this.listTop + 36, 'Noch keine Einträge – sei der/die Erste!', {
        fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#bdb3e0',
      }).setOrigin(0.5));
      return;
    }
    const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
    list.forEach((e, i) => {
      const y = this.listTop + 34 + i * 30;
      const highlight = this.nameSaved && i === this.savedRank;
      const color = highlight ? '#ffd34f' : (i === 0 ? '#ffffff' : '#cfc6ec');
      const row = this.add.text(cx, y, `${medals[i]}  ${e.name.padEnd(10, ' ')}  ${e.score}`, {
        fontFamily: 'Courier New, monospace', fontSize: '20px', color, fontStyle: highlight ? 'bold' : 'normal',
      }).setOrigin(0.5);
      if (highlight) {
        row.setShadow(0, 0, '#ffd34f', 12, true, true);
        this.tweens.add({ targets: row, scale: 1.08, duration: 500, yoyo: true, repeat: -1 });
      }
      this.listContainer.add(row);
    });
  }

  update(time, delta) {
    this.bg.update(delta, 200);
  }
}
