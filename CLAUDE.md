# Projektregeln – Unicorn: Duck Protocol

Dieses Projekt ist ein Beitrag zur SKAILE Academy Building Challenge.

## Arbeitsweise
- **Nach jedem abgeschlossenen Arbeitsschritt sofort committen und zu `origin` pushen**
  (`git add -A`, kurze klare Commit-Message, `git push`).
- Commit-Messages knapp und im Imperativ (z. B. `feat: Boss-Enrage-Phase`, `fix: Sprung-Timing`).
- Immer einen lauffähigen Stand pushen – nichts Kaputtes auf `main`.

## Technik
- **Engine:** Phaser 3 (vendored unter `vendor/phaser.min.js`, CDN-Fallback in `index.html`).
- **Kein Build-Step**, reine statische Seite, nur relative Pfade.
- Alle Grafiken werden prozedural erzeugt (BootScene), Sound prozedural via Web Audio
  (`src/systems/AudioManager.js`) – keine externen Asset-Dateien.

## Lokal testen
- Über statischen Server starten (ES-Module brauchen `http://`):
  `python -m http.server 8000` → http://localhost:8000
- Niemals per Doppelklick (`file://`) öffnen.

## Deployment
- Ziel: GitHub Pages unter `https://diggiqueen.github.io/unicorn-duck-protocol/`.
- `.nojekyll` liegt vor; Auto-Deploy-Workflow unter `.github/workflows/deploy.yml`.
- Alternativ Vercel (`npx vercel`) möglich.
- Erst als fertig melden, wenn die Live-URL nachweislich einwandfrei läuft.

## Balancing
- Tempo/Wellen/Boss-Zeitpunkt zentral in `src/config/difficulty.js` und
  `src/config/constants.js`.
