import type { GameRecord, Settings } from '../types';

const SETTINGS_KEY = 'lgc.settings.v1';
const HISTORY_KEY = 'lgc.history.v1';
const PROFILE_KEY = 'lgc.profile.v1';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  boardTheme: 'indigo',
  pieceStyle: 'classic',
  showLegalMoves: true,
  showCoordinates: true,
  moveSounds: true,
  animations: true,
  boardOrientation: 'w',
  clockMinutes: 10,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

export function loadSettings(): Settings {
  return safeParse<Settings>(localStorage.getItem(SETTINGS_KEY), DEFAULT_SETTINGS);
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as GameRecord[]) : [];
  } catch {
    return [];
  }
}

export function addGame(rec: GameRecord): GameRecord[] {
  const next = [rec, ...loadHistory()].slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export interface Profile {
  name: string;
  rating: number;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  streak: number;
  bestStreak: number;
  level: number;
  xp: number;
}

export const DEFAULT_PROFILE: Profile = {
  name: 'ChessMaster',
  rating: 1200,
  games: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  streak: 0,
  bestStreak: 0,
  level: 1,
  xp: 0,
};

export function loadProfile(): Profile {
  return safeParse<Profile>(localStorage.getItem(PROFILE_KEY), DEFAULT_PROFILE);
}

export function saveProfile(p: Profile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function winRate(p: Profile): number {
  if (p.games === 0) return 0;
  return Math.round((p.wins / p.games) * 100);
}
