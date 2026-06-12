export interface DailyRecord {
  date: string;
  singScores: number[];
  listenScores: number[];
  totalSessions: number;
}

export interface UserProgress {
  history: DailyRecord[];
  streak: number;
  lastSessionDate: string | null;
  totalSessions: number;
  bestScore: number;
}

const STORAGE_KEY = "pitchperfect_progress";

export function getProgress(): UserProgress {
  if (typeof window === "undefined") {
    return { history: [], streak: 0, lastSessionDate: null, totalSessions: 0, bestScore: 0 };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { history: [], streak: 0, lastSessionDate: null, totalSessions: 0, bestScore: 0 };
  }
  return JSON.parse(stored);
}

export function saveSessionResult(mode: "sing" | "listen", scores: number[]): void {
  const progress = getProgress();
  const today = new Date().toISOString().split("T")[0];

  let todayRecord = progress.history.find((r) => r.date === today);
  if (!todayRecord) {
    todayRecord = { date: today, singScores: [], listenScores: [], totalSessions: 0 };
    progress.history.push(todayRecord);
  }

  if (mode === "sing") {
    todayRecord.singScores.push(...scores);
  } else {
    todayRecord.listenScores.push(...scores);
  }
  todayRecord.totalSessions++;

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  if (avgScore > progress.bestScore) {
    progress.bestScore = avgScore;
  }

  if (progress.lastSessionDate) {
    const lastDate = new Date(progress.lastSessionDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      progress.streak++;
    } else if (diffDays > 1) {
      progress.streak = 1;
    }
  } else {
    progress.streak = 1;
  }

  progress.lastSessionDate = today;
  progress.totalSessions++;

  // Keep only last 30 days
  progress.history = progress.history.slice(-30);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
