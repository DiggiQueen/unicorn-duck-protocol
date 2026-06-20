// Datengetriebene Schwierigkeits-Timeline. Der Spawner liest pro Sekunde,
// welche Phase aktiv ist. Komplettes Balancing passiert hier.
// t = Sekunden seit Laufbeginn.

export const TIMELINE = [
  { t: 0,   enemies: ['drone'],                    interval: 1600, enemySpeed: 320, fragmentChance: 0.7, powerupChance: 0.0 },
  { t: 15,  enemies: ['drone', 'slime'],           interval: 1400, enemySpeed: 340, fragmentChance: 0.7, powerupChance: 0.04 },
  { t: 30,  enemies: ['drone', 'slime'],           interval: 1200, enemySpeed: 360, fragmentChance: 0.65, powerupChance: 0.05 },
  { t: 50,  enemies: ['drone', 'slime', 'goose'],  interval: 1100, enemySpeed: 380, fragmentChance: 0.6, powerupChance: 0.05 },
  { t: 70,  enemies: ['drone', 'slime', 'goose'],  interval: 950,  enemySpeed: 410, fragmentChance: 0.6, powerupChance: 0.06 },
  { t: 90,  enemies: ['drone', 'slime', 'goose'],  interval: 800,  enemySpeed: 440, fragmentChance: 0.55, powerupChance: 0.06 },
  { t: 105, enemies: ['drone', 'slime', 'goose'],  interval: 700,  enemySpeed: 470, fragmentChance: 0.55, powerupChance: 0.07 },
  // Bei t=120 stoppt der Spawner regulär und triggert den Boss (siehe Spawner).
];

export const BOSS_TIME = 120; // Sekunden bis Boss

// Welt-Scrollgeschwindigkeit interpoliert von BASE_SPEED nach MAX_SPEED über die Laufzeit.
export function speedAt(elapsedMs, base, max, runDuration) {
  const k = Math.min(1, elapsedMs / runDuration);
  return base + (max - base) * k;
}

export function phaseAt(elapsedSec) {
  let current = TIMELINE[0];
  for (const p of TIMELINE) {
    if (elapsedSec >= p.t) current = p;
    else break;
  }
  return current;
}
