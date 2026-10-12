import { formatClock } from '../lib/chess-utils';

export function ChessClock({
  seconds,
  active,
  label,
}: {
  seconds: number;
  active: boolean;
  label?: string;
}) {
  const low = seconds <= 30;
  return (
    <div
      className={[
        'pill flex min-w-[72px] items-center justify-center gap-1.5 px-3 py-1.5 transition-all',
        active ? 'shadow-glow' : 'opacity-70',
      ].join(' ')}
      aria-label={label ? `${label} clock` : 'clock'}
    >
      <span
        className={[
          'font-mono text-sm font-semibold tabular-nums',
          low ? 'text-red-300' : 'text-1',
        ].join(' ')}
      >
        {formatClock(seconds)}
      </span>
    </div>
  );
}
