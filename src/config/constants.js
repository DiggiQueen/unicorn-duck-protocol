// Zentrale Konstanten: Maße, Geschwindigkeit, Neon-Palette, Score-Werte.
// Eine einzige Quelle der Wahrheit -> einfaches Balancing.

export const GAME = {
  WIDTH: 1280,
  HEIGHT: 720,
  GRAVITY: 1800,
  GROUND_Y: 640, // y-Höhe des Neon-Bodens
};

// Spielerwerte
export const PLAYER = {
  X: 320, // Nova bleibt im linken Drittel
  JUMP_VELOCITY: -760,
  MAX_HP: 3,
  DASH_VELOCITY: 900,
  DASH_DURATION: 220, // ms
  DASH_COOLDOWN: 900, // ms
  IFRAMES: 1100, // ms Unverwundbarkeit nach Treffer
  VERTICAL_SPEED: 520, // Steuergeschwindigkeit hoch/runter im Flug
};

// Welt-Scroll & Tempo
export const WORLD = {
  BASE_SPEED: 360, // Start-Scrollgeschwindigkeit (px/s)
  MAX_SPEED: 720,
  RUN_DURATION: 120000, // 2 Minuten bis Boss (ms)
};

// Waffe
export const WEAPON = {
  FIRE_RATE: 220, // ms zwischen Schüssen
  LASER_FIRE_RATE: 90, // mit Rainbow-Laser
  BULLET_SPEED: 900,
  BULLET_DAMAGE: 1,
};

// Punkte
export const SCORE = {
  FRAGMENT: 10,
  ENEMY: 25,
  BOSS_HIT: 50,
  BOSS_KILL: 500,
};

// Neon-Farbpalette (macht prozedurale Formen "designed" statt Platzhalter)
export const COLOR = {
  MAGENTA: 0xff4fd8,
  CYAN: 0x39f6ff,
  VIOLET: 0x9b5cff,
  BLUE: 0x4f7bff,
  GREEN: 0x49ff9e,
  DANGER: 0xff3b5c,
  GOLD: 0xffd34f,
  WHITE: 0xffffff,
  BG_TOP: 0x0a0420,
  BG_BOT: 0x1a0a3a,
};

// Texture-Keys (prozedural in BootScene erzeugt)
export const TEX = {
  NOVA: 'nova',
  BULLET: 'bullet',
  BULLET_LASER: 'bullet_laser',
  DRONE: 'drone',
  SLIME: 'slime',
  GOOSE: 'goose',
  BOSS: 'boss',
  ENEMY_BULLET: 'enemy_bullet',
  ROCKET: 'rocket',
  FRAGMENT: 'fragment',
  GOLDEN_DUCK: 'golden_duck',
  RUBBER_DUCK: 'rubber_duck',
  PARTICLE: 'particle',
  GLOW: 'glow',
  PU_LASER: 'pu_laser',
  PU_MAGNET: 'pu_magnet',
  PU_SHIELD: 'pu_shield',
  PU_SLOWMO: 'pu_slowmo',
  STARS: 'stars',
  GRID: 'grid',
  HEART: 'heart',
  RING: 'ring',
};

// Power-Up-Typen
export const PU = {
  LASER: 'laser',
  MAGNET: 'magnet',
  SHIELD: 'shield',
  SLOWMO: 'slowmo',
};

export const PU_DURATION = {
  [PU.LASER]: 10000,
  [PU.MAGNET]: 8000,
  [PU.SLOWMO]: 3000,
  // SHIELD ist nicht zeitbasiert (1 freier Treffer)
};
