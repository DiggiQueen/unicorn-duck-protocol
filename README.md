# 🦄 Unicorn: Duck Protocol

Ein rasanter Neon-Action-Runner in **Phaser 3**. Das kampferprobte Einhorn **Nova**
rast durch das Jahr 2077, sammelt Entenfragmente, ballert sich durch die Shadow Ducks
und stellt sich am Ende **Emperor Duck X** – um die legendäre goldene Gummiente zu retten.

> Fester Lauf (~2 Minuten) → Bosskampf → Sieg → Highscore → nochmal.

## ✨ Features

- **Seiten-Scroller mit Auto-Lauf**, Springen (+ Doppelsprung), Dash und Auto-Schuss
- **3 Gegnertypen**: Shadow Duck Drone, Slime Blob, Dark Goose
- **4 Power-Ups**: Regenbogenlaser, Duck-Magnet, Schild, Zeitlupe
- **Bosskampf** als Zustandsmaschine (Laser, Entenraketen, Schockwellen, Enrage-Phase)
- **Game Juice**: Screenshake, Hit-Stop, Slow-Mo, Partikel, Neon-Glow, Parallax
- **Komplett prozedurale Grafik** – kein einziges externes Bild (alle Texturen werden zur Laufzeit gezeichnet)
- **Prozeduraler Sound** – SFX und Musik per Web Audio synthetisiert (keine Audiodateien)
- Hauptmenü, HUD, **Pause-Menü**, Game-Over/Sieg, **lokaler Highscore** (LocalStorage)
- **Responsive** (`Scale.FIT`) + Touch-Steuerung für Mobilgeräte

## 🎮 Steuerung

| Taste | Aktion |
|-------|--------|
| **Leertaste** | Springen / Doppelsprung |
| **Shift** | Dash (kurz unverwundbar, zerstört berührte Gegner) |
| **A / D** | leichte Seitwärtskorrektur |
| **ESC / P** | Pause |
| **M** | Ton an/aus |
| *Maus/Touch* | Buttons im Menü; auf Touch zusätzliche Sprung-/Dash-Buttons |

Die Waffe feuert **automatisch** nach vorn.

## ▶️ Lokal starten

ES-Module brauchen `http://` – **nicht** per Doppelklick öffnen, sondern über einen
statischen Server:

```bash
# Python
python -m http.server 8000
# dann http://localhost:8000 im Browser öffnen
```

## 🚀 Deployment auf GitHub Pages

Das Repo ist sofort deploybar – kein Build-Step.

**Variante A – automatisch (empfohlen, via GitHub Actions):**
1. Repo auf GitHub anlegen und pushen (Branch `main`).
2. In **Settings → Pages** unter *Build and deployment* die Quelle auf **GitHub Actions** stellen.
3. Der mitgelieferte Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   veröffentlicht die Seite bei jedem Push automatisch.
4. Die URL erscheint danach unter Settings → Pages (z. B. `https://<user>.github.io/<repo>/`).

**Variante B – klassisch (ohne Actions):**
1. Repo pushen.
2. **Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, Ordner `/ (root)`.
3. Die `.nojekyll`-Datei (bereits enthalten) verhindert Jekyll-Verarbeitung.

Alle Pfade sind **relativ**, daher funktioniert das Spiel auch im Unterpfad `/<repo>/`.

## 🧱 Projektstruktur

```
duck-protocol/
├── index.html              # lädt Phaser + src/main.js (ES-Modul)
├── vendor/phaser.min.js    # vendored Phaser 3.80 (CDN-Fallback in index.html)
├── src/
│   ├── main.js             # Game-Config, Scale, Szenen-Registrierung
│   ├── config/             # constants.js (Palette/Werte), difficulty.js (Timeline)
│   ├── scenes/             # Boot, Preload, Menu, Game, Hud, Pause, GameOver
│   ├── objects/            # Player, Projectile, Fragment, PowerUp, enemies/*
│   ├── systems/            # WeaponSystem, Spawner, PowerUpManager, Juice,
│   │                       # ParallaxBackground, AudioManager, ScoreStore
│   └── ui/NeonButton.js
└── .github/workflows/deploy.yml
```

## 🎚 Balancing

Tempo, Wellen und Boss-Zeitpunkt liegen zentral in
[`src/config/difficulty.js`](src/config/difficulty.js) und
[`src/config/constants.js`](src/config/constants.js) – dort lässt sich alles ohne
Eingriff in die Spiellogik justieren.

## 📜 Assets & Lizenz

Sämtliche Grafiken und Sounds werden **im Code erzeugt** – es gibt keine externen
Asset-Dateien und damit keine Lizenz-/Urheberrechtsprobleme. Engine: Phaser 3 (MIT).
