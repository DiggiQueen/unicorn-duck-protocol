// Highscore-Persistenz via LocalStorage. try/catch für Private-Mode-Browser
// (dort wirft localStorage) -> In-Memory-Fallback für die Sitzung.
const KEY = 'udp_highscore';
const LIST_KEY = 'udp_highscores';
let memoryFallback = 0;
let memoryList = [];

export const ScoreStore = {
  getHighscore() {
    try {
      return parseInt(localStorage.getItem(KEY) || '0', 10) || 0;
    } catch (e) {
      return memoryFallback;
    }
  },

  // Gibt true zurück, wenn ein neuer Rekord aufgestellt wurde.
  submit(score) {
    const isNew = score > this.getHighscore();
    try {
      if (isNew) localStorage.setItem(KEY, String(score));
      // Top-5-Liste pflegen
      const list = this.getList();
      list.push(score);
      list.sort((a, b) => b - a);
      localStorage.setItem(LIST_KEY, JSON.stringify(list.slice(0, 5)));
    } catch (e) {
      if (isNew) memoryFallback = score;
      memoryList.push(score);
      memoryList.sort((a, b) => b - a);
      memoryList = memoryList.slice(0, 5);
    }
    return isNew;
  },

  getList() {
    try {
      return JSON.parse(localStorage.getItem(LIST_KEY) || '[]');
    } catch (e) {
      return memoryList.slice();
    }
  },
};
