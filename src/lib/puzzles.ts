import type { Puzzle } from '../types';

/**
 * Tactical puzzles. Each `solution` is a full SAN line: the player must play
 * the even-indexed moves; the app auto-plays the opponent's scripted replies.
 * Every line is validated by src/lib/puzzles.test.ts against chess.js, so a
 * puzzle cannot be shipped unless its solution is legal and its objective
 * (mate / material) actually holds.
 */
export const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: ['Re8#'],
    rating: 800,
    theme: 'Back-rank mate',
    sideToMove: 'w',
    objective: 'Mate in 1',
  },
  {
    id: 'p2',
    fen: '7k/6pp/8/8/8/8/8/5QK1 w - - 0 1',
    solution: ['Qf8#'],
    rating: 750,
    theme: 'Queen mate',
    sideToMove: 'w',
    objective: 'Mate in 1',
  },
  {
    id: 'p3',
    fen: '3k4/8/3K4/8/8/8/8/6R1 w - - 0 1',
    solution: ['Rg8#'],
    rating: 900,
    theme: 'Rook and king mate',
    sideToMove: 'w',
    objective: 'Mate in 1',
  },
  {
    id: 'p4',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: ['Ra8#'],
    rating: 820,
    theme: 'Back-rank mate',
    sideToMove: 'w',
    objective: 'Mate in 1',
  },
  {
    id: 'p5',
    fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
    solution: ['Nc7+', 'Kd7', 'Nxa8'],
    rating: 1100,
    theme: 'Knight fork',
    sideToMove: 'w',
    objective: 'Win the rook',
  },
];

export function dailyPuzzleIndex(day = new Date()): number {
  const start = Date.UTC(day.getUTCFullYear(), 0, 1);
  const days = Math.floor((day.getTime() - start) / 86400000);
  return days % PUZZLES.length;
}
