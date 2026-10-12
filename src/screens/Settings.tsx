import { Moon, Sun, Monitor } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useSettings } from '../context/ThemeProvider';
import type { Settings as SettingsType } from '../types';

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-1">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={[
        'relative h-7 w-12 rounded-full transition-colors',
        on ? 'bg-gradient-to-r from-accent-blue to-accent-violet' : 'bg-white/15',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
          on ? 'left-6' : 'left-1',
        ].join(' ')}
      />
    </button>
  );
}

const BOARD_THEMES: SettingsType['boardTheme'][] = ['indigo', 'emerald', 'rose', 'slate', 'wood'];
const PIECE_STYLES: SettingsType['pieceStyle'][] = ['classic', 'solid', 'outline'];
const CLOCKS = [1, 3, 5, 10, 30];

export function Settings() {
  const { settings, update } = useSettings();

  return (
    <div className="safe-top space-y-4 pt-4">
      <h1 className="text-lg font-bold text-1">Settings</h1>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Appearance</p>
        <GlassCard className="space-y-3">
          <div className="flex gap-2">
            {[
              { id: 'light', label: 'Light', Icon: Sun },
              { id: 'dark', label: 'Dark', Icon: Moon },
              { id: 'auto', label: 'Auto', Icon: Monitor },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => update({ theme: id as SettingsType['theme'] })}
                className={[
                  'pill flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all',
                  settings.theme === id
                    ? 'bg-gradient-to-br from-accent-blue/50 to-accent-violet/40 text-1 shadow-glow'
                    : 'text-2',
                ].join(' ')}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs text-3">Board style</p>
            <div className="flex gap-2">
              {BOARD_THEMES.map((b) => (
                <button
                  key={b}
                  onClick={() => update({ boardTheme: b })}
                  aria-label={b}
                  className={[
                    'h-9 w-9 overflow-hidden rounded-xl border transition-all',
                    settings.boardTheme === b ? 'ring-2 ring-accent-cyan' : 'border-white/10',
                  ].join(' ')}
                >
                  <span className="flex h-full w-full">
                    <span className="h-full w-1/2" style={{ background: boardSwatch(b, 'light') }} />
                    <span className="h-full w-1/2" style={{ background: boardSwatch(b, 'dark') }} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-3">Piece style</p>
            <div className="flex gap-2">
              {PIECE_STYLES.map((p) => (
                <button
                  key={p}
                  onClick={() => update({ pieceStyle: p })}
                  className={[
                    'pill flex-1 py-2 text-xs font-medium capitalize',
                    settings.pieceStyle === p ? 'text-1 shadow-glow' : 'text-3',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Game</p>
        <GlassCard padded={false} className="divide-y divide-white/5">
          <Row label="Show legal moves">
            <Toggle on={settings.showLegalMoves} onChange={(v) => update({ showLegalMoves: v })} />
          </Row>
          <Row label="Show coordinates">
            <Toggle on={settings.showCoordinates} onChange={(v) => update({ showCoordinates: v })} />
          </Row>
          <Row label="Move sounds">
            <Toggle on={settings.moveSounds} onChange={(v) => update({ moveSounds: v })} />
          </Row>
          <Row label="Animations">
            <Toggle on={settings.animations} onChange={(v) => update({ animations: v })} />
          </Row>
        </GlassCard>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Board orientation</p>
        <GlassCard>
          <div className="flex gap-2">
            {(['w', 'b'] as const).map((c) => (
              <button
                key={c}
                onClick={() => update({ boardOrientation: c })}
                className={[
                  'pill flex-1 py-2.5 text-sm font-medium',
                  settings.boardOrientation === c ? 'text-1 shadow-glow' : 'text-3',
                ].join(' ')}
              >
                {c === 'w' ? 'White at bottom' : 'Black at bottom'}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Clock preset</p>
        <GlassCard>
          <div className="flex gap-2">
            {CLOCKS.map((m) => (
              <button
                key={m}
                onClick={() => update({ clockMinutes: m })}
                className={[
                  'pill flex-1 py-2.5 text-sm font-medium',
                  settings.clockMinutes === m ? 'text-1 shadow-glow' : 'text-3',
                ].join(' ')}
              >
                {m}m
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <p className="pb-2 text-center text-[11px] text-3">
        Preferences are saved on this device and persist across sessions.
      </p>
    </div>
  );
}

function boardSwatch(theme: SettingsType['boardTheme'], shade: 'light' | 'dark'): string {
  const map: Record<SettingsType['boardTheme'], [string, string]> = {
    indigo: ['#DCE4FF', '#4F6BD8'],
    emerald: ['#E3F5EA', '#3E8E6E'],
    rose: ['#FBE7EF', '#C15A7B'],
    slate: ['#E6EAF2', '#4A5568'],
    wood: ['#EAD9B8', '#A9763F'],
  };
  return map[theme][shade === 'light' ? 0 : 1];
}
