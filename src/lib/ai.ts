import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { Difficulty } from '../types';

/**
 * A genuine (if modest) chess engine: alpha-beta minimax over chess.js
 * legal move generation, with material + piece-square evaluation and
 * capture-first move ordering.
 *
 * This is NOT Stockfish. It is a self-contained engine that runs fully
 * offline on the device — no engine binary or network is required.
 */

const VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// Piece-square tables from White's point of view, index 0 = a8 ... 63 = h1.
const PAWN_PST = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];
const KNIGHT_PST = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const DEPTH: Record<Difficulty, number> = {
  beginner: 1,
  easy: 2,
  medium: 2,
  hard: 3,
  expert: 3,
};

// Chance the engine picks a random (worse) legal move — keeps low levels beatable.
const BLUNDER: Record<Difficulty, number> = {
  beginner: 0.7,
  easy: 0.4,
  medium: 0.18,
  hard: 0.05,
  expert: 0,
};

function squareIndex(file: number, rankFromTop: number): number {
  return rankFromTop * 8 + file;
}

function evaluate(game: Chess): number {
  if (game.isCheckmate()) return game.turn() === 'w' ? -100000 : 100000;
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) return 0;

  const board = game.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const idx = squareIndex(f, r);
      const white = sq.color === 'w';
      let v = VALUE[sq.type] ?? 0;
      if (sq.type === 'p') v += PAWN_PST[idx];
      else if (sq.type === 'n') v += KNIGHT_PST[idx];
      score += white ? v : -v;
    }
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => scoreMove(b) - scoreMove(a));
}

function scoreMove(m: Move): number {
  let s = 0;
  if (m.captured) s += 10 * (VALUE[m.captured] ?? 0) - (VALUE[m.piece] ?? 0);
  if (m.promotion) s += VALUE[m.promotion] ?? 0;
  if (m.san.includes('+')) s += 30;
  if (m.san.includes('#')) s += 100000;
  return s;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game);
  const moves = orderMoves(game.moves({ verbose: true }) as Move[]);
  if (moves.length === 0) return evaluate(game);

  if (game.turn() === 'w') {
    let best = -Infinity;
    for (const m of moves) {
      game.move(m);
      best = Math.max(best, minimax(game, depth - 1, alpha, beta));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    game.move(m);
    best = Math.min(best, minimax(game, depth - 1, alpha, beta));
    game.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

/** Choose a move for the side to move in `fen`. Returns null if no moves. */
export function chooseMove(fen: string, difficulty: Difficulty): Move | null {
  const game = new Chess(fen);
  const moves = orderMoves(game.moves({ verbose: true }) as Move[]);
  if (moves.length === 0) return null;

  if (Math.random() < BLUNDER[difficulty]) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = DEPTH[difficulty];
  const maximizing = game.turn() === 'w';
  let bestScore = maximizing ? -Infinity : Infinity;
  let best: Move[] = [];

  for (const m of moves) {
    game.move(m);
    const score = minimax(game, depth - 1, -Infinity, Infinity);
    game.undo();
    if (score === bestScore) {
      best.push(m);
    } else if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      best = [m];
    }
  }
  return best[Math.floor(Math.random() * best.length)] ?? moves[0];
}

/** Static evaluation in centipawns from White's perspective (for the analysis bar). */
export function evaluatePosition(fen: string): number {
  return evaluate(new Chess(fen));
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};
