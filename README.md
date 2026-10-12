# Liquid Glass Chess

A premium, futuristic chess app with an Apple-inspired **Liquid Glass** interface — translucent
panels, backdrop blur, animated aurora lighting — built as a real, playable game on top of a genuine
chess rules engine, and shipped as an **Android APK**.

The visual language is inspired by the glass aesthetic of [BitChord](https://github.com/kushagrasinghx/BitChord)
(dark midnight palette, neon blue/cyan/violet accents, soft layered glass).

---

## Features

**Playable, real chess**
- Full official rules via [`chess.js`](https://github.com/jhlywa/chess.js): legal move generation,
  check, checkmate, stalemate, castling, en passant, promotion, and all draw conditions.
- Tap-to-select / tap-to-move **and** drag-and-drop, on mobile and desktop.
- Legal-move hints, last-move highlight, check indicator, board flip, coordinates.
- Move sounds (WebAudio, no assets) and haptic feedback where supported.
- Chess clocks with active-turn glow, captured pieces and material advantage.

**Game modes**
- **Play vs Computer** — five difficulty levels driven by a built-in alpha-beta minimax engine
  (`src/lib/ai.ts`). It is a real engine, not a scripted opponent — but it is **not Stockfish**.
- **Local Multiplayer** — two players, one device.
- **Online Multiplayer** — UI is present but **disabled**, because real matchmaking/move-sync needs a
  backend (Supabase/Firebase) that this build does not ship. It is not faked.
- **Puzzles** — tactical puzzles whose solutions are validated against the rules engine in the test
  suite, with hints and a streak counter.
- **Game Analysis** — step through a saved game with an evaluation bar from the built-in engine.

**Screens**
Home dashboard, Game, Puzzles, History, Profile, Settings, Online, Leaderboard, Analysis, plus a
game-over modal and a promotion picker. Preferences and game history persist in `localStorage`.

---

## Tech stack

| Layer      | Choice |
|------------|--------|
| UI         | React 18 + TypeScript, Vite |
| Styling    | Tailwind CSS + a hand-built glass design system (`src/index.css`) |
| Animation  | Framer Motion |
| Icons      | lucide-react |
| Chess      | chess.js (rules) + custom minimax engine (opponent & analysis) |
| Native     | Capacitor 6 (Android) |
| CI         | GitHub Actions → debug APK artifact |

---

## Project structure

```
src/
  components/   GlassCard, AppLayout, BottomNav, ChessBoard, PlayerPanel,
                ChessClock, MoveHistory, GameControls, GameOverModal,
                GameModeSelector
  context/      ThemeProvider (settings + light/dark/auto theme)
  lib/          ai.ts (engine), puzzles.ts, chess-utils.ts, storage.ts,
                sound.ts, puzzles.test.ts
  screens/      Home, GameScreen, Puzzles, History, Profile, Settings,
                Online, Leaderboard, Analysis
  types.ts
```

---

## Run locally (web)

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # validates chess logic + puzzle lines
npm run build      # type-check + production bundle into dist/
```

## Build the Android APK

### Option A — automatic (recommended)

Push to `main`, or run the **Build Android APK** workflow manually from the *Actions* tab
(`workflow_dispatch`). When it finishes, download the `liquid-glass-chess-debug-apk` artifact from
the run summary — that's a ready-to-install `app-debug.apk`.

### Option B — locally

Requires Node 20, JDK 17 and the Android SDK.

```bash
npm install
npm run build
npx cap add android     # first time only
npx cap sync android
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Install on a device with `adb install app-debug.apk`.

---

## Honest limitations

- **Online multiplayer is not functional.** It requires a real-time backend; the UI says so instead
  of simulating opponents.
- **The engine is not Stockfish.** It is a self-contained minimax that runs fully offline. Strong,
  but not a grandmaster.
- **The leaderboard is local-only** — it reflects your own saved games, and does not invent players.
- Promotion is chosen via a picker for the player; the engine auto-promotes to a queen.
- This is a **debug** APK (unsigned for release). For the Play Store you'd add a signing config and
  build `assembleRelease` / an AAB.

---

## License

MIT — see [LICENSE](./LICENSE).
