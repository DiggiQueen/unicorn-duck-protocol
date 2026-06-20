# Projektregeln – Unicorn: Duck Protocol (SKAILE Building Challenge)

**Thema der Challenge:** Im Minigame muss irgendwo eine **Gummiente** vorkommen.
→ Hier zentral: Nova rettet die legendäre goldene Gummiente; Gegner sind Shadow Ducks,
Boss ist Emperor Duck X. Thema erfüllt.

## Push-Regeln (verbindlich, in JEDER Session befolgen)
1. **Nach jedem abgeschlossenen Arbeitsschritt sofort committen und zu `origin` pushen**
   (`git add -A`, kurze klare Message, `git push`). Sehr regelmäßig, an den Fortschritt
   gekoppelt – kein Timer, sondern immer wenn wieder ein Stück fertig ist.
2. **Immer nur zu `origin` pushen** (mein eigenes Repo:
   `https://github.com/DiggiQueen/unicorn-duck-protocol`). Das Push-Ziel **nie** ändern.
3. **Zu Beginn jeder neuen Session** zuerst `git log` und `git status` ansehen, kurz
   orientieren, dann nahtlos weiterbauen – weiterhin mit Push nach jedem Schritt.

Ziel: Mein kompletter Fortschritt landet fortlaufend und nachvollziehbar in meinem
eigenen Repo (Bewertung schaut auf den Push-Verlauf).

## Technik
- **Engine:** Phaser 3 (vendored unter `vendor/phaser.min.js`, CDN-Fallback in `index.html`).
- **Kein Build-Step**, reine statische Seite, nur **relative** Pfade.
- Grafik komplett prozedural (BootScene), Sound prozedural via Web Audio
  (`src/systems/AudioManager.js`) – keine externen Asset-Dateien.

## Lokal testen
- Statischer Server (ES-Module brauchen `http://`): `python -m http.server 8000`
  → http://localhost:8000 . Niemals per Doppelklick (`file://`).

## Deployment
- Live über GitHub Pages: **https://diggiqueen.github.io/unicorn-duck-protocol/**
  (Quelle: Branch `main`, Root; `.nojekyll` vorhanden).
- Erst „fertig" melden, wenn die Live-URL nachweislich einwandfrei läuft.

## Balancing
- Tempo/Wellen/Boss-Zeitpunkt zentral in `src/config/difficulty.js` und
  `src/config/constants.js`.
