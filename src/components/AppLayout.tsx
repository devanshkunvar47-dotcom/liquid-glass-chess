import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import type { Screen } from '../types';

export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden>
      <div className="aurora-blob b1 animate-aurora" />
      <div className="aurora-blob b2 animate-aurora-slow" />
      <div className="aurora-blob b3 animate-aurora" />
    </div>
  );
}

export function AppLayout({
  children,
  active,
  onNavigate,
  showNav = true,
}: {
  children: ReactNode;
  active: Screen;
  onNavigate: (s: Screen) => void;
  showNav?: boolean;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <AuroraBackground />
      <main
        className={[
          'relative z-10 mx-auto w-full max-w-2xl flex-1 px-4',
          showNav ? 'pb-28' : 'pb-6',
        ].join(' ')}
      >
        {children}
      </main>
      {showNav && <BottomNav active={active} onNavigate={onNavigate} />}
    </div>
  );
}
