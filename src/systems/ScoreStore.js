// Highscore-Persistenz via LocalStorage – jetzt mit Namen (Top-5-Bestenliste).
// try/catch für Private-Mode-Browser -> In-Memory-Fallback für die Sitzung.
const LIST_KEY = 'udp_highscores';
const NAME_KEY = 'udp_lastname';
const MAX = 5;

let memList = [];
let memName = '';

export const ScoreStore = {
  // [{ name, score }] absteigend sortiert, max 5
  getList() {
    try {
      const a = JSON.parse(localStorage.getItem(LIST_KEY) || '[]');
      return Array.isArray(a) ? a.filter(e => e && typeof e.score === 'number') : [];
    } catch (e) {
      return memList.slice();
    }
  },

  getHighscore() {
    const l = this.getList();
    return l.length ? Math.max(...l.map(e => e.score || 0)) : 0;
  },

  isHighscore(score) {
    const l = this.getList();
    return score > 0 && (l.length < MAX || score > Math.min(...l.map(e => e.score)));
  },

  // Fügt einen Eintrag hinzu. Gibt den Rang (0-basiert) in der Top-5 zurück, oder -1.
  addEntry(name, score) {
    name = (name || '???').toString().trim().toUpperCase().slice(0, 10) || '???';
    const entry = { name, score };
    let list = this.getList();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, MAX);
    try {
      localStorage.setItem(LIST_KEY, JSON.stringify(list));
      localStorage.setItem(NAME_KEY, name);
    } catch (e) {
      memList = list;
      memName = name;
    }
    return list.indexOf(entry);
  },

  getLastName() {
    try {
      return localStorage.getItem(NAME_KEY) || '';
    } catch (e) {
      return memName;
    }
  },
};
