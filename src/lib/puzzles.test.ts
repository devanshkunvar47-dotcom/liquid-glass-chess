import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { PUZZLES } from './puzzles';

describe('puzzle solutions', () => {
  for (const p of PUZZLES) {
    it(`${p.id} (${p.theme}) has a legal, correct line`, () => {
      const game = new Chess(p.fen);
      expect(game.turn()).toBe(p.sideToMove);

      p.solution.forEach((san, i) => {
        const res = game.move(san);
        expect(res, `move ${san} should be legal in ${p.id}`).toBeTruthy();
        const isLast = i === p.solution.length - 1;
        if (isLast && p.objective.startsWith('Mate')) {
          expect(game.isCheckmate(), `${p.id}: final move should be mate`).toBe(true);
        }
      });
    });
  }

  it('fork puzzle wins material', () => {
    const game = new Chess(PUZZLES.find((p) => p.id === 'p5')!.fen);
    const before = game.board().flat().filter(Boolean).length;
    for (const san of ['Nc7+', 'Kd7', 'Nxa8']) game.move(san);
    const after = game.board().flat().filter(Boolean).length;
    expect(after).toBe(before - 1); // black lost the rook
  });
});
