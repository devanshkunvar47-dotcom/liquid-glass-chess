export type Screen =
  | 'home'
  | 'game'
  | 'puzzles'
  | 'history'
  | 'profile'
  | 'settings'
  | 'online'
  | 'leaderboard'
  | 'analysis';

export type GameMode = 'computer' | 'local' | 'online';

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export type Color = 'w' | 'b';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Settings {
  theme: ThemeMode;
  boardTheme: 'indigo' | 'emerald' | 'rose' | 'slate' | 'wood';
  pieceStyle: 'classic' | 'solid' | 'outline';
  showLegalMoves: boolean;
  showCoordinates: boolean;
  moveSounds: boolean;
  animations: boolean;
  boardOrientation: Color;
  clockMinutes: number;
}

export interface GameRecord {
  id: string;
  mode: GameMode;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  moves: number;
  date: number;
  pgn: string;
}

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  rating: number;
  theme: string;
  sideToMove: Color;
  objective: string;
}

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  color: Color;
  piece: string;
  captured?: string;
  promotion?: string;
}
