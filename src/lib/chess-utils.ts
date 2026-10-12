import { Chess } from 'chess.js';
import type { Color, MoveRecord } from '../types';

export const PIECE_UNICODE: Record<string, string> = {
  wp: '\u2659', wn: '\u2658', wb: '\u2657', wr: '\u2656', wq: '\u2655', wk: '\u2654',
  bp: '\u265F', bn: '\u265E', bb: '\u265D', br: '\u265C', bq: '\u265B', bk: '\u265A',
};

export const PIECE_NAME: Record<string, string> = {
  p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King',
};

export const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function toHistory(game: Chess): MoveRecord[] {
  return game.history({ verbose: true }).map((m) => ({
    san: m.san,
    from: m.from,
    to: m.to,
    color: m.color as Color,
    piece: m.piece,
    captured: m.captured,
    promotion: m.promotion,
  }));
}

/** Captured pieces grouped by the colour that lost them. */
export function capturedPieces(game: Chess): { w: string[]; b: string[] } {
  const out: { w: string[]; b: string[] } = { w: [], b: [] };
  for (const m of game.history({ verbose: true })) {
    if (m.captured) out[m.color === 'w' ? 'b' : 'w'].push(m.captured);
  }
  return out;
}

export function materialAdvantage(cap: { w: string[]; b: string[] }): number {
  const val = (arr: string[]) => arr.reduce((s, p) => s + (PIECE_VALUE[p] ?? 0), 0);
  return val(cap.b) - val(cap.w); // positive => white is up
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function resultLabel(game: Chess): string {
  if (game.isCheckmate()) return `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins`;
  if (game.isStalemate()) return 'Stalemate — draw';
  if (game.isInsufficientMaterial()) return 'Draw — insufficient material';
  if (game.isThreefoldRepetition()) return 'Draw — threefold repetition';
  if (game.isDraw()) return 'Draw';
  if (game.isCheck()) return 'Check';
  return game.turn() === 'w' ? "White's turn" : "Black's turn";
}
