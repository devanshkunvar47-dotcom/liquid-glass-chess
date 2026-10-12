import { useState } from 'react';
import { Globe, Plus, LogIn, AlertTriangle, Users } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function Online() {
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="safe-top space-y-4 pt-4">
      <h1 className="text-lg font-bold text-1">Online Multiplayer</h1>

      <GlassCard className="text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 animate-float items-center justify-center rounded-full bg-gradient-to-br from-accent-violet/60 to-accent-blue/40 shadow-glow">
          <Globe size={40} className="text-white" />
        </div>
        <p className="text-base font-semibold text-1">Find Your Opponent</p>
        <p className="mt-1 text-sm text-2">Play real players from around the world.</p>
        <button
          onClick={() => setNotice('Online matchmaking needs a configured backend (e.g. Supabase or Firebase). See the README to enable it.')}
          className="mt-4 w-full rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet py-3.5 text-sm font-semibold text-white shadow-glow"
        >
          Quick Match
        </button>
      </GlassCard>

      {notice && (
        <div className="glass flex items-start gap-2 rounded-2xl p-3 text-sm text-amber-200">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setNotice('Room creation requires the real-time backend. Configure it to enable this.')}
          className="text-left"
        >
          <GlassCard hover className="h-full">
            <Plus size={20} className="mb-2 text-accent-cyan" />
            <p className="text-sm font-semibold text-1">Create Room</p>
            <p className="mt-0.5 text-[11px] text-3">Custom game settings</p>
          </GlassCard>
        </button>
        <button
          onClick={() => setNotice('Joining a room requires the real-time backend. Configure it to enable this.')}
          className="text-left"
        >
          <GlassCard hover className="h-full">
            <LogIn size={20} className="mb-2 text-accent-violet" />
            <p className="text-sm font-semibold text-1">Join Room</p>
            <p className="mt-0.5 text-[11px] text-3">Enter a room code</p>
          </GlassCard>
        </button>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            maxLength={6}
            className="pill w-full bg-transparent px-4 py-3 text-sm tracking-widest text-1 outline-none placeholder:text-3"
          />
          <button
            onClick={() => setNotice('Room joining requires the real-time backend. Configure it to enable this.')}
            className="pill shrink-0 px-4 py-3 text-sm font-semibold text-2"
          >
            Join
          </button>
        </div>
      </GlassCard>

      <GlassCard className="flex items-start gap-3">
        <Users size={18} className="mt-0.5 shrink-0 text-accent-cyan" />
        <p className="text-[12px] leading-relaxed text-2">
          Online play is not simulated. Real matchmaking, move sync, clocks and presence require a
          backend such as Supabase or Firebase — this build ships without one, so online modes are
          disabled rather than faked. Local and vs-Computer play work fully offline.
        </p>
      </GlassCard>
    </div>
  );
}
