// Tiny WebAudio click/blip generator — no external assets, works offline
// inside the Android WebView.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function blip(freq: number, duration: number, type: OscillatorType, gain = 0.06): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sound = {
  move(): void {
    blip(320, 0.09, 'sine', 0.05);
  },
  capture(): void {
    blip(180, 0.14, 'triangle', 0.07);
  },
  check(): void {
    blip(660, 0.12, 'square', 0.045);
  },
  win(): void {
    blip(523, 0.12, 'sine');
    setTimeout(() => blip(659, 0.12, 'sine'), 120);
    setTimeout(() => blip(784, 0.18, 'sine'), 240);
  },
  lose(): void {
    blip(392, 0.16, 'sine');
    setTimeout(() => blip(294, 0.22, 'sine'), 150);
  },
  tick(): void {
    blip(880, 0.04, 'square', 0.03);
  },
};

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}
