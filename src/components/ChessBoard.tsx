import { motion } from 'framer-motion';
import type { Color, Settings } from '../types';

export type BoardCell = { square: string; type: string; color: Color } | null;

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const GLYPH: Record<string, Record<string, string>> = {
  // classic: white pieces use the outline set, black pieces the filled set
  classic: { w: '\u2654\u2655\u2656\u2657\u2658\u2659', b: '\u265A\u265B\u265C\u265D\u265E\u265F' },
  // solid: every piece uses the filled glyphs, tinted by side
  solid: { w: '\u265A\u265B\u265C\u265D\u265E\u265F', b: '\u265A\u265B\u265C\u265D\u265E\u265F' },
  // outline: every piece uses the outline glyphs, tinted by side
  outline: { w: '\u2654\u2655\u2656\u2657\u2658\u2659', b: '\u2654\u2655\u2656\u2657\u2658\u2659' },
};
const ORDER = ['k', 'q', 'r', 'b', 'n', 'p'];

const BOARD_THEMES: Record<Settings['boardTheme'], { light: string; dark: string }> = {
  indigo: { light: '#DCE4FF', dark: '#4F6BD8' },
  emerald: { light: '#E3F5EA', dark: '#3E8E6E' },
  rose: { light: '#FBE7EF', dark: '#C15A7B' },
  slate: { light: '#E6EAF2', dark: '#4A5568' },
  wood: { light: '#EAD9B8', dark: '#A9763F' },
};

function glyphFor(type: string, color: Color, style: Settings['pieceStyle']): string {
  const set = GLYPH[style]?.[color] ?? GLYPH.classic[color];
  return set[ORDER.indexOf(type)] ?? '';
}

export function ChessBoard({
  board,
  orientation,
  selected,
  legalTargets,
  lastMove,
  checkSquare,
  showCoordinates,
  boardTheme,
  pieceStyle,
  animations,
  interactive,
  ply,
  onSquareTap,
  onDropMove,
}: {
  board: BoardCell[][];
  orientation: Color;
  selected: string | null;
  legalTargets: string[];
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  showCoordinates: boolean;
  boardTheme: Settings['boardTheme'];
  pieceStyle: Settings['pieceStyle'];
  animations: boolean;
  interactive: boolean;
  ply: number;
  onSquareTap: (square: string) => void;
  onDropMove: (from: string, to: string) => void;
}) {
  const theme = BOARD_THEMES[boardTheme] ?? BOARD_THEMES.indigo;

  // Build the display grid for the current orientation.
  const ranks = orientation === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  const toDisplay = (fileIdx: number, rankIdx: number) => ({
    col: orientation === 'w' ? fileIdx : 7 - fileIdx,
    row: orientation === 'w' ? 7 - rankIdx : rankIdx,
  });

  return (
    <div className="relative w-full">
      <div
        className="glass relative aspect-square w-full overflow-hidden rounded-[26px] p-1.5"
        role="grid"
        aria-label="Chessboard"
      >
        <div className="grid h-full w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-[20px]">
          {ranks.map((rankIdx) =>
            files.map((fileIdx) => {
              const cell = board[rankIdx][fileIdx];
              const square = FILES[fileIdx] + (rankIdx + 1);
              const isLight = (fileIdx + rankIdx) % 2 === 1;
              const isSelected = selected === square;
              const isTarget = legalTargets.includes(square);
              const isCapture = isTarget && !!cell;
              const isLast = lastMove && (lastMove.from === square || lastMove.to === square);
              const isCheck = checkSquare === square;

              return (
                <div
                  key={square}
                  role="gridcell"
                  aria-label={square}
                  onClick={() => interactive && onSquareTap(square)}
                  onDragOver={(e) => {
                    if (interactive) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (!interactive) return;
                    e.preventDefault();
                    const from = e.dataTransfer.getData('text/plain');
                    if (from) onDropMove(from, square);
                  }}
                  className={[
                    'board-square',
                    isLight ? 'sq-light' : 'sq-dark',
                    isSelected ? 'sq-selected' : '',
                    isLast && !isSelected ? 'sq-lastmove' : '',
                    isCheck ? 'sq-check' : '',
                    isTarget && !isCapture ? 'sq-hint' : '',
                    isTarget && isCapture ? 'sq-hint-capture' : '',
                    interactive ? 'cursor-pointer' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {cell && (
                    <PieceGlyph
                      cell={cell}
                      pieceStyle={pieceStyle}
                      animations={animations}
                      square={square}
                      lastMove={lastMove}
                      toDisplay={toDisplay}
                      fileIdx={fileIdx}
                      rankIdx={rankIdx}
                      ply={ply}
                      interactive={interactive}
                    />
                  )}

                  {showCoordinates && (
                    <>
                      {fileIdx === files[files.length - 1] && (
                        <span className="pointer-events-none absolute bottom-0.5 right-1 text-[9px] font-semibold opacity-50">
                          {(rankIdx + 1)}
                        </span>
                      )}
                      {rankIdx === ranks[ranks.length - 1] && (
                        <span className="pointer-events-none absolute bottom-0.5 left-1 text-[9px] font-semibold opacity-50">
                          {FILES[fileIdx]}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

function PieceGlyph({
  cell,
  pieceStyle,
  animations,
  square,
  lastMove,
  toDisplay,
  fileIdx,
  rankIdx,
  ply,
  interactive,
}: {
  cell: NonNullable<BoardCell>;
  pieceStyle: Settings['pieceStyle'];
  animations: boolean;
  square: string;
  lastMove: { from: string; to: string } | null;
  toDisplay: (f: number, r: number) => { col: number; row: number };
  fileIdx: number;
  rankIdx: number;
  ply: number;
  interactive: boolean;
}) {
  const isWhite = cell.color === 'w';
  const style: React.CSSProperties = {
    color: isWhite ? '#F8FAFC' : '#0B1220',
    textShadow: isWhite
      ? '0 0 1px rgba(11,18,32,.9), 0 2px 3px rgba(0,0,0,.55)'
      : '0 0 1px rgba(255,255,255,.45), 0 2px 3px rgba(0,0,0,.5)',
  };

  // Slide the piece that just landed on `lastMove.to` from where it came.
  let initial: { x: string; y: string } | undefined;
  if (animations && lastMove && square === lastMove.to) {
    const from = toDisplay(FILES.indexOf(lastMove.from[0]), parseInt(lastMove.from[1], 10) - 1);
    const to = toDisplay(fileIdx, rankIdx);
    initial = { x: `${(from.col - to.col) * 100}%`, y: `${(from.row - to.row) * 100}%` };
  }

  return (
    <motion.span
      key={initial ? `${square}:${ply}` : square}
      className="piece pointer-events-auto absolute text-[min(9vw,52px)] leading-none"
      style={style}
      draggable={interactive}
      onDragStart={(e) => {
        const ev = e as unknown as React.DragEvent;
        ev.dataTransfer?.setData('text/plain', square);
      }}
      initial={initial}
      animate={{ x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
    >
      {glyphFor(cell.type, cell.color, pieceStyle)}
    </motion.span>
  );
}
