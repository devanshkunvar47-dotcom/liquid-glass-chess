import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Info } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ChessBoard, type BoardCell } from '../components/ChessBoard';
import { MoveHistory } from '../components/MoveHistory';
import { useSettings } from '../context/ThemeProvider';
import { evaluatePosition } from '../lib/ai';
import { capturedPieces, materialAdvantage, toHistory } from '../lib/chess-utils';
import type { Color, GameRecord } from '../types';

export function Analysis({ history }: { history: GameRecord[] }) {
  const { settings } = useSettings();
  const [gameId, setGameId] = useState<string>('start');
  const [index, setIndex] = useState(0);

  const source = useMemo(() => {
    if (gameId === 'start') return { pgn: '', label: 'Starting position' };
    const g = history.find((h) => h.id === gameId);
    return { pgn: g?.pgn ?? '', label: g ? `vs ${g.opponent}` : 'Game' };
  }, [gameId, history]);

  // Replay the PGN into a list of positions.
  const positions = useMemo(() => {
    const base = new Chess();
    const fens: string[] = [base.fen()];
    if (source.pgn) {
      const parsed = new Chess();
      try {
        parsed.loadPgn(source.pgn);
        for (const m of parsed.history()) {
          base.move(m);
          fens.push(base.fen());
        }
      } catch {
        /* malformed pgn — keep start position only */
      }
    }
    return fens;
  }, [source.pgn]);

  useEffect(() => setIndex(positions.length - 1), [positions]);

  const current = positions[Math.min(index, positions.length - 1)];
  const view = useMemo(() => {
    const g = new Chess(current);
    return {
      board: g.board().map((row) =>
        row.map((c) => (c ? { square: c.square, type: c.type, color: c.color as Color } : null)),
      ) as BoardCell[][],
      moves: toHistory(g),
      captured: capturedPieces(g),
      material: materialAdvantage(capturedPieces(g)),
      turn: g.turn() as Color,
    };
  }, [current]);

  const evalCp = useMemo(() => evaluatePosition(current), [current]);
  const evalPawns = evalCp / 100;
  const evalPct = Math.max(4, Math.min(96, 50 + evalPawns * 4));

  return (
    <div className="safe-top space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-1">Game Analysis</h1>
        <select
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="pill bg-transparent px-3 py-1.5 text-xs text-2 outline-none"
        >
          <option value="start" className="bg-midnight-700">
            Starting position
          </option>
          {history.map((g) => (
            <option key={g.id} value={g.id} className="bg-midnight-700">
              vs {g.opponent}
            </option>
          ))}
        </select>
      </div>

      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-3">
          <span className="text-2">{source.label}</span>
          <span>·</span>
          <span>
            Move {index}/{positions.length - 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-midnight-800">
            <div className="h-full rounded-full bg-white/80" style={{ width: `${evalPct}%` }} />
          </div>
          <span className="w-14 text-right font-mono text-xs text-2">
            {evalPawns > 0 ? '+' : ''}
            {evalPawns.toFixed(1)}
          </span>
        </div>

        <ChessBoard
          board={view.board}
          orientation={settings.boardOrientation}
          selected={null}
          legalTargets={[]}
          lastMove={null}
          checkSquare={null}
          showCoordinates={settings.showCoordinates}
          boardTheme={settings.boardTheme}
          pieceStyle={settings.pieceStyle}
          animations={false}
          interactive={false}
          ply={index}
          onSquareTap={() => {}}
          onDropMove={() => {}}
        />

        <div className="flex items-center justify-center gap-2">
          <NavBtn onClick={() => setIndex(0)} disabled={index === 0}>
            <ChevronsLeft size={18} />
          </NavBtn>
          <NavBtn onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
            <ChevronLeft size={18} />
          </NavBtn>
          <NavBtn
            onClick={() => setIndex((i) => Math.min(positions.length - 1, i + 1))}
            disabled={index >= positions.length - 1}
          >
            <ChevronRight size={18} />
          </NavBtn>
          <NavBtn onClick={() => setIndex(positions.length - 1)} disabled={index >= positions.length - 1}>
            <ChevronsRight size={18} />
          </NavBtn>
        </div>

        <div className="flex items-center justify-between text-xs text-3">
          <span>Material: {view.material === 0 ? 'even' : view.material > 0 ? `White +${view.material}` : `Black +${-view.material}`}</span>
          <span>{view.turn === 'w' ? "White's move" : "Black's move"}</span>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Move list</p>
        <MoveHistory moves={view.moves} activeIndex={index - 1} onJump={(i) => setIndex(i + 1)} />
      </GlassCard>

      <GlassCard className="flex items-start gap-3">
        <Info size={16} className="mt-0.5 shrink-0 text-accent-cyan" />
        <p className="text-[12px] leading-relaxed text-2">
          The evaluation bar uses the app's built-in engine (a self-contained minimax, not Stockfish).
          Loading a game shows the real move history; the eval is an approximation of who stands better.
        </p>
      </GlassCard>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glass glass-hover flex h-10 w-12 items-center justify-center rounded-2xl text-2 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
