import type { MoveRecord } from '../types';

export function MoveHistory({
  moves,
  onJump,
  activeIndex,
}: {
  moves: MoveRecord[];
  onJump?: (index: number) => void;
  activeIndex?: number;
}) {
  if (moves.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-3">
        No moves yet. White to play.
      </p>
    );
  }

  const rows: { no: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  moves.forEach((m, i) => {
    const no = Math.floor(i / 2) + 1;
    if (i % 2 === 0) rows.push({ no, white: m });
    else rows[rows.length - 1].black = m;
  });

  return (
    <div className="max-h-64 overflow-y-auto pr-1">
      <table className="w-full border-separate border-spacing-y-0.5 text-sm">
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r.no} className={ri % 2 === 0 ? '' : 'bg-white/[0.03]'}>
              <td className="w-8 py-1 pl-1 text-3 tabular-nums">{r.no}.</td>
              {[r.white, r.black].map((m, ci) => {
                const idx = ri * 2 + ci;
                const on = activeIndex === idx;
                return (
                  <td key={ci} className="py-1">
                    {m && (
                      <button
                        onClick={() => onJump?.(idx)}
                        disabled={!onJump}
                        className={[
                          'rounded-lg px-2 py-0.5 text-left font-medium transition-colors',
                          on ? 'bg-accent-blue/30 text-1' : 'text-2',
                          onJump ? 'hover:bg-white/10' : 'cursor-default',
                        ].join(' ')}
                      >
                        {m.san}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
