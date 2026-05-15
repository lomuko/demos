let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

export async function resumeAudio(): Promise<void> {
  const ctx = getCtx();
  if (ctx?.state === "suspended") await ctx.resume();
}

export function playBeep(freq: number, durationMs: number, type: "sine" | "square" = "square"): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.05);
}

/** displayIndex 0 = "3", 1 = "2", 2 = "1" */
export function playCountdownTick(displayIndex: number): void {
  const base = 520 + displayIndex * 75;
  playBeep(base, 90, "square");
}

export function playGoChime(): void {
  playBeep(660, 100, "square");
  setTimeout(() => playBeep(880, 140, "square"), 70);
}
