import { Home, Puzzle, History, User, Settings as SettingsIcon } from 'lucide-react';
import type { Screen } from '../types';

const ITEMS: { id: Screen; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'puzzles', label: 'Puzzles', Icon: Puzzle },
  { id: 'history', label: 'History', Icon: History },
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export function BottomNav({
  active,
  onNavigate,
}: {
  active: Screen;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <nav className="safe-bottom pointer-events-auto fixed inset-x-0 bottom-0 z-30 px-3 pb-2">
      <div className="glass glass-strong mx-auto flex max-w-md items-center justify-between rounded-3xl px-2 py-1.5">
        {ITEMS.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-label={label}
              aria-current={on ? 'page' : undefined}
              className={[
                'flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 transition-colors',
                on ? 'text-1' : 'text-3',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-2xl transition-all',
                  on
                    ? 'bg-gradient-to-br from-accent-blue/40 to-accent-violet/40 shadow-glow'
                    : '',
                ].join(' ')}
              >
                <Icon size={19} strokeWidth={on ? 2.4 : 2} />
              </span>
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
