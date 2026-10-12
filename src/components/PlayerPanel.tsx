import { Crown } from 'lucide-react';
import { ChessClock } from './ChessClock';
import { PIECE_UNICODE } from '../lib/chess-utils';
import type { Color } from '../types';

export function PlayerPanel({
  name,
  rating,
  avatarColor,
  captured,
  material,
  seconds,
  active,
  isTurn,
  align = 'left',
}: {
  name: string;
  rating: number;
  avatarColor: string;
  captured: string[];
  material: number;
  seconds: number;
  active: boolean;
  isTurn: boolean;
  align?: 'left' | 'right';
}) {
  const showMaterial = material > 0;
  return (
    <div className={['flex items-center gap-3', align === 'right' ? 'flex-row-reverse' : ''].join(' ')}>
      <div
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-glass"
        style={{ background: avatarColor }}
        aria-hidden
      >
        {name.slice(0, 1).toUpperCase()}
        {isTurn && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent-cyan ring-2 ring-[color:var(--bg-0)]" />
        )}
      </div>

      <div className={['flex min-w-0 flex-1 flex-col', align === 'right' ? 'items-end' : ''].join(' ')}>
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-1">{name}</span>
          <span className="pill px-2 py-0.5 text-[10px] font-medium text-2">{rating}</span>
        </div>
        <div
          className={[
            'mt-0.5 flex h-5 items-center gap-0.5 text-base leading-none',
            align === 'right' ? 'flex-row-reverse' : '',
          ].join(' ')}
          aria-label="captured pieces"
        >
          {captured.map((p, i) => (
            <span key={i} className="opacity-80">
              {PIECE_UNICODE[(capturedIsWhite(p) ? 'w' : 'b') + p]}
            </span>
          ))}
          {showMaterial && (
            <span className="ml-1 text-[11px] font-semibold text-accent-cyan">+{material}</span>
          )}
        </div>
      </div>

      <ChessClock seconds={seconds} active={active} label={name} />
    </div>
  );
}

// Captured piece glyphs are shown in the opponent's colour; caller passes the
// piece letter only, so default to the dark glyph for readability.
function capturedIsWhite(_p: string): boolean {
  return false;
}

export function KingIcon() {
  return <Crown size={16} />;
}

export type { Color };
