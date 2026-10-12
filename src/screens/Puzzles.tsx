import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ChessBoard, type BoardCell } from '../components/ChessBoard';
import { useSettings } from '../context/ThemeProvider';
import { PUZZLES, dailyPuzzleIndex } from '../lib/puzzles';
import { sound } from '../lib/sound';
import type { Color, Puzzle } from '../types';

const FILTERS = ['Easy', 'Medium', 'Hard'] as const;

export function Puzzles({
  streak,
  onSolve,
}: {
  streak: number;
  onSolve: (solved: boolean) => void;
}) {
  const { settings } = useSettings();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Easy');
  const [puzzle, setPuzzle] = useState<Puzzle>(PUZZLES[dailyPuzzleIndex()]);

  const ranges: Record<(typeof FILTERS)[number], [number, number]> = {
    Easy: [0, 950],
    Medium: [950, 1200],
    Hard: [1200, 9999],
  };

  const pool = useMemo(
    () => PUZZLES.filter((p) => p.rating >= ranges[filter][0] && p.rating < ranges[filter][1]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter],
  );

  const pick = (p: Puzzle) => setPuzzle(p);

  return (
    <div className="safe-top space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-1">Puzzles</h1>
        <span className="pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-2">
          <Sparkles size={13} className="text-accent-cyan" /> Streak {streak}
        </span>
      </div>

      <button onClick={() => pick(PUZZLES[dailyPuzzleIndex()])} className="w-full text-left">
        <GlassCard hover className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-1">Daily Puzzle</p>
            <p className="text-[11px] text-3">Solve today's featured tactic</p>
          </div>
        </GlassCard>
      </button>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'pill flex-1 py-2 text-sm font-medium transition-all',
              filter === f ? 'bg-gradient-to-br from-accent-blue/50 to-accent-violet/40 text-1' : 'text-2',
            ].join(' ')}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {pool.map((p) => (
          <button
            key={p.id}
            onClick={() => pick(p)}
            className={[
              'pill shrink-0 px-3 py-1.5 text-xs font-medium',
              puzzle.id === p.id ? 'text-1 shadow-glow' : 'text-3',
            ].join(' ')}
          >
            {p.theme} · {p.rating}
          </button>
        ))}
        {pool.length === 0 && <span className="text-xs text-3">No puzzles in this band.</span>}
      </div>

      <PuzzlePlayer key={puzzle.id} puzzle={puzzle} onSolve={onSolve} settings={settings} />
    </div>
  );
}

function PuzzlePlayer({
  puzzle,
  onSolve,
  settings,
}: {
  puzzle: Puzzle;
  onSolve: (solved: boolean) => void;
  settings: ReturnType<typeof useSettings>['settings'];
}) {
  const gameRef = useRef(new Chess(puzzle.fen));
  const game = gameRef.current;
  const [fen, setFen] = useState(game.fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [legal, setLegal] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<'solving' | 'solved' | 'failed'>('solving');
  const [hint, setHint] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const board = useMemo<BoardCell[][]>(
    () => game.board().map((row) => row.map((c) => (c ? { square: c.square, type: c.type, color: c.color as Color } : null))),
    [game, fen],
  );

  const turn = game.turn() as Color;
  const interactive = state === 'solving' && turn === puzzle.sideToMove;

  const applyExpected = useCallback(
    (san: string) => {
      const mv = game.move(san);
      setLastMove({ from: mv.from, to: mv.to });
      setFen(game.fen());
      if (settings.moveSounds) sound.move();
    },
    [game, settings.moveSounds],
  );

  // auto-play the opponent's scripted reply
  useEffect(() => {
    if (state !== 'solving') return;
    if (step % 2 === 1 && step < puzzle.solution.length) {
      const id = setTimeout(() => {
        applyExpected(puzzle.solution[step]);
        setStep((s) => s + 1);
      }, 500);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, state]);

  useEffect(() => {
    if (state === 'solving' && step === puzzle.solution.length) {
      setState('solved');
      setMessage('Correct!');
      if (settings.moveSounds) sound.win();
      onSolve(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, state]);

  const tryMove = (from: string, to: string) => {
    const expectedSan = puzzle.solution[step];
    // Validate against the expected move by attempting it in a cloned game.
    const clone = new Chess(game.fen());
    let mv;
    try {
      mv = clone.move({ from, to, promotion: 'q' });
    } catch {
      mv = null;
    }
    if (!mv) return;
    if (mv.san === expectedSan || step % 2 === 1) {
      applyExpected(mv.san);
      setStep((s) => s + 1);
      setMessage(null);
    } else {
      setState('failed');
      setMessage(`Not quite — the best move was ${expectedSan}`);
      if (settings.moveSounds) sound.lose();
      onSolve(false);
    }
    setSelected(null);
    setLegal([]);
  };

  const onSquareTap = (sq: string) => {
    if (!interactive) return;
    const piece = game.get(sq as Square);
    if (selected && legal.includes(sq)) return tryMove(selected, sq);
    if (piece && piece.color === turn) {
      setSelected(sq);
      setLegal(game.moves({ square: sq as Square, verbose: true }).map((m) => m.to));
    } else {
      setSelected(null);
      setLegal([]);
    }
  };

  const expected = puzzle.solution[step];
  const hintFrom = hint && expected ? expected.replace(/[^a-h1-8]/g, '').slice(0, 2) : null;

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-1">{puzzle.objective}</p>
          <p className="text-[11px] text-3">
            {puzzle.theme} · {turn === 'w' ? 'White' : 'Black'} to move
          </p>
        </div>
        <span className="pill px-2.5 py-1 text-xs font-semibold text-2">{puzzle.rating}</span>
      </div>

      <ChessBoard
        board={board}
        orientation={puzzle.sideToMove}
        selected={hintFrom && hintFrom.length === 2 ? hintFrom : selected}
        legalTargets={settings.showLegalMoves ? legal : []}
        lastMove={lastMove}
        checkSquare={null}
        showCoordinates={settings.showCoordinates}
        boardTheme={settings.boardTheme}
        pieceStyle={settings.pieceStyle}
        animations={settings.animations}
        interactive={interactive}
        ply={step}
        onSquareTap={onSquareTap}
        onDropMove={tryMove}
      />

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={[
            'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm',
            state === 'solved' ? 'text-emerald-300' : state === 'failed' ? 'text-red-300' : 'text-2',
          ].join(' ')}
        >
          {state === 'solved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {message}
        </motion.div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setHint(true)}
          disabled={state !== 'solving'}
          className="glass glass-hover flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-medium text-2 disabled:opacity-40"
        >
          <Lightbulb size={16} /> Hint
        </button>
        <button
          onClick={() => {
            gameRef.current = new Chess(puzzle.fen);
            setFen(gameRef.current.fen());
            setStep(0);
            setState('solving');
            setSelected(null);
            setLegal([]);
            setLastMove(null);
            setHint(false);
            setMessage(null);
          }}
          className="glass glass-hover flex-1 rounded-2xl py-2.5 text-sm font-medium text-2"
        >
          Reset
        </button>
      </div>

      <p className="text-[11px] text-3">
        Solution: {puzzle.solution.join(' ')} — validated against the rules engine.
      </p>
    </GlassCard>
  );
}
