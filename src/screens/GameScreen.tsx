import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ChessBoard, type BoardCell } from '../components/ChessBoard';
import { PlayerPanel } from '../components/PlayerPanel';
import { MoveHistory } from '../components/MoveHistory';
import { GameControls } from '../components/GameControls';
import { GameOverModal, type Outcome } from '../components/GameOverModal';
import { GlassCard } from '../components/GlassCard';
import { useSettings } from '../context/ThemeProvider';
import { chooseMove, DIFFICULTY_LABELS } from '../lib/ai';
import { capturedPieces, materialAdvantage, resultLabel, toHistory } from '../lib/chess-utils';
import { sound, vibrate } from '../lib/sound';
import type { Color, Difficulty, GameMode, GameRecord } from '../types';

const OPPONENT_RATING: Record<Difficulty, number> = {
  beginner: 800,
  easy: 1000,
  medium: 1300,
  hard: 1600,
  expert: 2000,
};

export function GameScreen({
  mode,
  difficulty,
  playerColor,
  onExit,
  onRecord,
}: {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: Color;
  onExit: () => void;
  onRecord: (r: GameRecord) => void;
}) {
  const { settings, update } = useSettings();
  const gameRef = useRef(new Chess());
  const game = gameRef.current;

  const [fen, setFen] = useState(game.fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [legal, setLegal] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [clocks, setClocks] = useState({ w: settings.clockMinutes * 60, b: settings.clockMinutes * 60 });
  const [thinking, setThinking] = useState(false);
  const [over, setOver] = useState<{ outcome: Outcome; title: string; detail?: string } | null>(null);
  const [orientation, setOrientation] = useState<Color>(playerColor);
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [ply, setPly] = useState(0);
  const recordedRef = useRef(false);

  const sync = useCallback(() => {
    setFen(game.fen());
    setPly(game.history().length);
  }, [game]);

  const board = useMemo<BoardCell[][]>(() => {
    return game.board().map((row) =>
      row.map((c) => (c ? { square: c.square, type: c.type, color: c.color as Color } : null)),
    );
  }, [game, fen]);

  const moves = useMemo(() => toHistory(game), [game, fen]);
  const captured = useMemo(() => capturedPieces(game), [game, fen]);
  const material = useMemo(() => materialAdvantage(captured), [captured]);

  const turn = game.turn() as Color;
  const playerCanMove = mode === 'local' || turn === playerColor;
  const interactive = !over && !thinking && playerCanMove;

  const checkSquare = useMemo(() => {
    if (!game.isCheck()) return null;
    for (const row of game.board()) {
      for (const c of row) {
        if (c && c.type === 'k' && c.color === turn) return c.square;
      }
    }
    return null;
  }, [game, fen, turn]);

  const finish = useCallback(
    (outcome: Outcome, title: string, detail?: string) => {
      setOver({ outcome, title, detail });
      if (settings.moveSounds) {
        if (outcome === 'win') sound.win();
        else if (outcome === 'loss') sound.lose();
        else sound.check();
      }
      if (!recordedRef.current) {
        recordedRef.current = true;
        onRecord({
          id: `${Date.now()}`,
          mode,
          result: outcome,
          opponent: mode === 'computer' ? `${DIFFICULTY_LABELS[difficulty]} AI` : mode === 'online' ? 'Online' : 'Local Player',
          moves: game.history().length,
          date: Date.now(),
          pgn: game.pgn(),
        });
      }
    },
    [game, mode, difficulty, settings.moveSounds, onRecord],
  );

  const evaluateEnd = useCallback(() => {
    if (!game.isGameOver()) return false;
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'b' : 'w';
      if (mode === 'local') finish('win', 'Checkmate', `${winner === 'w' ? 'White' : 'Black'} wins`);
      else finish(winner === playerColor ? 'win' : 'loss', winner === playerColor ? 'You win!' : 'You lost', 'Checkmate');
    } else if (game.isStalemate()) {
      finish('draw', 'Draw', 'Stalemate');
    } else if (game.isThreefoldRepetition()) {
      finish('draw', 'Draw', 'Threefold repetition');
    } else if (game.isInsufficientMaterial()) {
      finish('draw', 'Draw', 'Insufficient material');
    } else {
      finish('draw', 'Draw', 'Fifty-move rule');
    }
    return true;
  }, [game, mode, playerColor, finish]);

  const playFor = useCallback(
    (from: string, to: string, promotion?: string) => {
      let mv;
      try {
        mv = game.move({ from, to, promotion: promotion ?? 'q' });
      } catch {
        return false;
      }
      if (!mv) return false;
      setLastMove({ from, to });
      setSelected(null);
      setLegal([]);
      sync();
      if (settings.moveSounds) {
        if (game.isCheckmate()) sound.check();
        else if (mv.captured) sound.capture();
        else sound.move();
      }
      if (settings.moveSounds) vibrate(mv.captured ? 25 : 12);
      evaluateEnd();
      return true;
    },
    [game, sync, settings.moveSounds, evaluateEnd],
  );

  const isPromotion = useCallback(
    (from: string, to: string) => {
      const piece = game.get(from as Square);
      return piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
    },
    [game],
  );

  const onSquareTap = useCallback(
    (sq: string) => {
      if (!interactive) return;
      const piece = game.get(sq as Square);
      if (selected) {
        if (legal.includes(sq)) {
          if (isPromotion(selected, sq)) setPromo({ from: selected, to: sq });
          else playFor(selected, sq);
          return;
        }
      }
      if (piece && piece.color === turn) {
        setSelected(sq);
        setLegal(game.moves({ square: sq as Square, verbose: true }).map((m) => m.to));
      } else {
        setSelected(null);
        setLegal([]);
      }
    },
    [interactive, game, selected, legal, turn, isPromotion, playFor],
  );

  const onDropMove = useCallback(
    (from: string, to: string) => {
      if (!interactive) return;
      const piece = game.get(from as Square);
      if (!piece || piece.color !== turn) return;
      const targets = game.moves({ square: from as Square, verbose: true }).map((m) => m.to);
      if (!targets.includes(to as Square)) return;
      if (isPromotion(from, to)) setPromo({ from, to });
      else playFor(from, to);
    },
    [interactive, game, turn, isPromotion, playFor],
  );

  // ---- clocks --------------------------------------------------------
  useEffect(() => {
    if (over) return;
    const id = setInterval(() => {
      setClocks((c) => {
        const t = game.turn() as Color;
        const next = { ...c, [t]: Math.max(0, c[t] - 1) };
        if (next[t] === 0 && !over) {
          finish(t === playerColor || mode === 'local' ? (mode === 'local' ? 'win' : 'loss') : 'win', 'Time out', `${t === 'w' ? 'White' : 'Black'} ran out of time`);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, over, mode, playerColor]);

  // ---- computer opponent --------------------------------------------
  useEffect(() => {
    if (mode !== 'computer' || over) return;
    if (game.turn() === playerColor) return;
    setThinking(true);
    const id = setTimeout(() => {
      const mv = chooseMove(game.fen(), difficulty);
      if (mv) {
        game.move(mv);
        setLastMove({ from: mv.from, to: mv.to });
        sync();
        if (settings.moveSounds) {
          if (mv.captured) sound.capture();
          else sound.move();
        }
        evaluateEnd();
      }
      setThinking(false);
    }, 420);
    return () => {
      clearTimeout(id);
      setThinking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, mode, over, playerColor, difficulty]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  // ---- controls ------------------------------------------------------
  const newGame = () => {
    gameRef.current = new Chess();
    recordedRef.current = false;
    setSelected(null);
    setLegal([]);
    setLastMove(null);
    setOver(null);
    setPromo(null);
    setClocks({ w: settings.clockMinutes * 60, b: settings.clockMinutes * 60 });
    sync();
  };

  const undo = () => {
    if (game.history().length === 0) return;
    game.undo();
    if (mode === 'computer' && game.turn() !== playerColor && game.history().length > 0) game.undo();
    setLastMove(null);
    setSelected(null);
    setLegal([]);
    setOver(null);
    recordedRef.current = false;
    sync();
  };

  const resign = () => {
    if (over) return;
    if (window.confirm('Resign this game?')) finish('loss', 'Resigned', 'You resigned the game');
  };

  const offerDraw = () => {
    if (over) return;
    if (mode === 'local') {
      if (window.confirm('Agree to a draw?')) finish('draw', 'Draw', 'Agreed draw');
      return;
    }
    // vs computer: accept only if the position is roughly balanced.
    const diff = Math.abs(material);
    if (diff <= 1 && game.history().length >= 16) finish('draw', 'Draw', 'Draw agreed');
    else setToast('Draw declined by opponent');
  };

  const statusText = over ? over.title : resultLabel(game);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="glass glass-hover flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium text-2"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <span className="pill px-3 py-1.5 text-xs font-semibold text-2">
          {mode === 'computer'
            ? `vs ${DIFFICULTY_LABELS[difficulty]} AI`
            : mode === 'online'
              ? 'Online'
              : 'Local Multiplayer'}
        </span>
      </div>

      <GlassCard className="space-y-3">
        <PlayerPanel
          name={mode === 'computer' ? `${DIFFICULTY_LABELS[difficulty]} AI` : mode === 'online' ? 'Opponent' : 'Player 2'}
          rating={mode === 'computer' ? OPPONENT_RATING[difficulty] : 1200}
          avatarColor="linear-gradient(135deg,#8B5CF6,#22D3EE)"
          captured={playerColor === 'w' ? captured.w : captured.b}
          material={playerColor === 'w' ? Math.max(0, -material) : Math.max(0, material)}
          seconds={playerColor === 'w' ? clocks.b : clocks.w}
          active={turn !== playerColor && !over}
          isTurn={turn !== playerColor && !over}
        />

        <ChessBoard
          board={board}
          orientation={orientation}
          selected={selected}
          legalTargets={settings.showLegalMoves ? legal : []}
          lastMove={lastMove}
          checkSquare={checkSquare}
          showCoordinates={settings.showCoordinates}
          boardTheme={settings.boardTheme}
          pieceStyle={settings.pieceStyle}
          animations={settings.animations}
          interactive={interactive}
          ply={ply}
          onSquareTap={onSquareTap}
          onDropMove={onDropMove}
        />

        <PlayerPanel
          name={mode === 'local' ? 'Player 1' : 'You'}
          rating={1200}
          avatarColor="linear-gradient(135deg,#3B82F6,#22D3EE)"
          captured={playerColor === 'w' ? captured.b : captured.w}
          material={playerColor === 'w' ? Math.max(0, material) : Math.max(0, -material)}
          seconds={playerColor === 'w' ? clocks.w : clocks.b}
          active={turn === playerColor && !over}
          isTurn={turn === playerColor && !over}
        />

        <div className="flex items-center justify-center gap-2 pt-1 text-sm">
          {thinking && <Loader2 size={15} className="animate-spin text-accent-cyan" />}
          <span className="font-medium text-2">{thinking ? 'Computer is thinking…' : statusText}</span>
        </div>
      </GlassCard>

      {toast && (
        <div className="glass glass-strong rounded-2xl px-4 py-2 text-center text-sm text-1">{toast}</div>
      )}

      <GameControls
        onNewGame={newGame}
        onUndo={undo}
        onDraw={offerDraw}
        onResign={resign}
        onFlip={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))}
        onToggleSound={() => update({ moveSounds: !settings.moveSounds })}
        onSettings={() => onExit()}
        onExit={onExit}
        soundOn={settings.moveSounds}
        canUndo={game.history().length > 0 && !over}
      />

      <GlassCard>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Moves</p>
        <MoveHistory moves={moves} />
      </GlassCard>

      {promo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <GlassCard strong className="w-full max-w-xs text-center">
            <p className="mb-3 text-sm font-semibold text-1">Promote to</p>
            <div className="flex justify-center gap-2">
              {[
                { p: 'q', g: '\u265B' },
                { p: 'r', g: '\u265C' },
                { p: 'b', g: '\u265D' },
                { p: 'n', g: '\u265E' },
              ].map((o) => (
                <button
                  key={o.p}
                  className="glass glass-hover flex h-14 w-14 items-center justify-center rounded-2xl text-3xl text-1"
                  onClick={() => {
                    playFor(promo.from, promo.to, o.p);
                    setPromo(null);
                  }}
                >
                  {o.g}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      <GameOverModal
        open={!!over}
        outcome={over?.outcome ?? 'draw'}
        title={over?.title ?? ''}
        detail={over?.detail}
        onRematch={newGame}
        onHome={onExit}
      />
    </div>
  );
}
