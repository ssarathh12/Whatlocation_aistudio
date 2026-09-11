import { GameStats, GameHistoryItem } from '../types';

const STORAGE_KEY = 'geopuzzle_stats_v1';

export function getStoredStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load stats from localStorage:', e);
  }

  return {
    gamesPlayed: 0,
    gamesCompleted: 0,
    totalTimeElapsed: 0,
    bestTime: null,
    totalShuffles: 0,
    history: [],
  };
}

export function saveGameSession(item: Omit<GameHistoryItem, 'id' | 'date'>): GameStats {
  const current = getStoredStats();
  const newItem: GameHistoryItem = {
    ...item,
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString(),
  };

  const updated: GameStats = {
    gamesPlayed: current.gamesPlayed + 1,
    gamesCompleted: current.gamesCompleted + (item.completed ? 1 : 0),
    totalTimeElapsed: current.totalTimeElapsed + item.timeElapsed,
    bestTime: item.completed
      ? current.bestTime === null
        ? item.timeElapsed
        : Math.min(current.bestTime, item.timeElapsed)
      : current.bestTime,
    totalShuffles: current.totalShuffles + item.shuffles,
    history: [newItem, ...current.history].slice(0, 50), // Keep recent 50
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save stats to localStorage:', e);
  }

  return updated;
}

export function clearGameStats(): GameStats {
  const empty: GameStats = {
    gamesPlayed: 0,
    gamesCompleted: 0,
    totalTimeElapsed: 0,
    bestTime: null,
    totalShuffles: 0,
    history: [],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
  } catch (e) {
    console.error('Failed to clear stats:', e);
  }
  return empty;
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
