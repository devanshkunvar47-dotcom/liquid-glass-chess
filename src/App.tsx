import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppLayout } from './components/AppLayout';
import { GlassCard } from './components/GlassCard';
import { GameModeSelector } from './components/GameModeSelector';
import { Home } from './screens/Home';
import { GameScreen } from './screens/GameScreen';
import { Puzzles } from './screens/Puzzles';
import { History } from './screens/History';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Online } from './screens/Online';
import { Leaderboard } from './screens/Leaderboard';
import { Analysis } from './screens/Analysis';
import { ThemeProvider } from './context/ThemeProvider';
import {
  addGame,
  loadHistory,
  loadProfile,
  saveProfile,
  type Profile as ProfileType,
} from './lib/storage';
import type { Color, Difficulty, GameMode, GameRecord, Screen } from './types';

const PUZZLE_STREAK_KEY = 'lgc.puzzleStreak';

function AppInner() {
  const [screen, setScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<ProfileType>(() => loadProfile());
  const [history, setHistory] = useState<GameRecord[]>(() => loadHistory());
  const [puzzleStreak, setPuzzleStreak] = useState<number>(() =>
    Number(localStorage.getItem(PUZZLE_STREAK_KEY) ?? 0),
  );

  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<Color>('w');

  const [gameConfig, setGameConfig] = useState<{ mode: GameMode; difficulty: Difficulty; color: Color } | null>(
    null,
  );

  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => localStorage.setItem(PUZZLE_STREAK_KEY, String(puzzleStreak)), [puzzleStreak]);

  const startMode = (mode: GameMode) => {
    if (mode === 'online') {
      setScreen('online');
      return;
    }
    if (mode === 'computer') {
      setPendingMode('computer');
      return;
    }
    setGameConfig({ mode: 'local', difficulty: 'medium', color: 'w' });
    setScreen('game');
  };

  const handleRecord = (rec: GameRecord) => {
    setHistory(addGame(rec));
    setProfile((p) => {
      const wins = p.wins + (rec.result === 'win' ? 1 : 0);
      const draws = p.draws + (rec.result === 'draw' ? 1 : 0);
      const losses = p.losses + (rec.result === 'loss' ? 1 : 0);
      const streak = rec.result === 'win' ? p.streak + 1 : 0;
      const rating = Math.max(100, p.rating + (rec.result === 'win' ? 12 : rec.result === 'loss' ? -10 : 2));
      const xpGain = rec.result === 'win' ? 40 : rec.result === 'draw' ? 20 : 10;
      let xp = p.xp + xpGain;
      let level = p.level;
      while (xp >= 500 * level) {
        xp -= 500 * level;
        level += 1;
      }
      return {
        ...p,
        games: p.games + 1,
        wins,
        draws,
        losses,
        streak,
        bestStreak: Math.max(p.bestStreak, streak),
        rating,
        xp,
        level,
      };
    });
  };

  const handleSolve = (solved: boolean) => {
    setPuzzleStreak((s) => (solved ? s + 1 : 0));
  };

  const navActive: Screen = useMemo(() => {
    if (['game'].includes(screen)) return 'home';
    if (screen === 'analysis') return 'profile';
    if (screen === 'leaderboard') return 'profile';
    if (screen === 'online') return 'home';
    return screen;
  }, [screen]);

  const showNav = screen !== 'game';

  return (
    <AppLayout active={navActive} onNavigate={setScreen} showNav={showNav}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {screen === 'home' && (
            <Home profile={profile} history={history} onNavigate={setScreen} onStart={startMode} />
          )}
          {screen === 'game' && gameConfig && (
            <GameScreen
              mode={gameConfig.mode}
              difficulty={gameConfig.difficulty}
              playerColor={gameConfig.color}
              onExit={() => setScreen('home')}
              onRecord={handleRecord}
            />
          )}
          {screen === 'puzzles' && <Puzzles streak={puzzleStreak} onSolve={handleSolve} />}
          {screen === 'history' && <History history={history} />}
          {screen === 'profile' && <Profile profile={profile} history={history} onNavigate={setScreen} />}
          {screen === 'settings' && <Settings />}
          {screen === 'online' && <Online />}
          {screen === 'leaderboard' && <Leaderboard profile={profile} />}
          {screen === 'analysis' && <Analysis history={history} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {pendingMode === 'computer' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPendingMode(null)}
          >
            <motion.div
              className="glass glass-strong w-full max-w-sm rounded-[28px] p-5"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-base font-bold text-1">Play vs Computer</h2>
              <GameModeSelector
                difficulty={difficulty}
                onDifficulty={setDifficulty}
                playerColor={playerColor}
                onPlayerColor={setPlayerColor}
                onStart={() => {
                  setGameConfig({ mode: 'computer', difficulty, color: playerColor });
                  setPendingMode(null);
                  setScreen('game');
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
