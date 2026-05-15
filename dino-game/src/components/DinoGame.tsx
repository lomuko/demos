"use client";

import { useEffect, useRef, useState } from "react";
import { playCountdownTick, playGoChime, resumeAudio } from "@/game/audio";
import {
  countdownOverlayLabel,
  createInitialState,
  drawGame,
  handleAction,
  updateGame,
} from "@/game/engine";
import type { GameState } from "@/game/types";
import {
  GAME_THEMES,
  loadStoredTheme,
  saveTheme,
  THEME_LIST,
  type GameThemeId,
} from "@/game/themes";

function usePrefersReducedMotion(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setV(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return v;
}

export function DinoGame() {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const soundOnRef = useRef(true);
  const themeRef = useRef<GameThemeId>(loadStoredTheme());
  const [soundOn, setSoundOn] = useState(true);
  const [themeId, setThemeId] = useState<GameThemeId>(() => loadStoredTheme());
  type Overlay =
    | { kind: "boot" }
    | { kind: "gameover"; score: number; newBest: boolean }
    | null;
  const [overlay, setOverlay] = useState<Overlay>({ kind: "boot" });

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    themeRef.current = themeId;
    saveTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    stateRef.current = createInitialState(reducedMotion);
    return () => {
      stateRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const s = stateRef.current;
      if (!s) return;
      if (s.phase === "boot") setOverlay({ kind: "boot" });
      else if (s.phase === "gameover") {
        setOverlay({
          kind: "gameover",
          score: Math.floor(s.score),
          newBest: s.wasNewRecord,
        });
      } else setOverlay(null);
    });
    return () => cancelAnimationFrame(id);
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width * dpr));
      const h = Math.max(200, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      e.preventDefault();
      const s = stateRef.current;
      if (!s) return;
      if (soundOnRef.current) void resumeAudio();
      const prev = s.phase;
      handleAction(s, performance.now());
      if ((prev === "boot" || prev === "gameover") && s.phase === "countdown" && soundOnRef.current) {
        playCountdownTick(0);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const loop = (now: number) => {
      const s = stateRef.current;
      if (s) {
        const prevPhase = s.phase;
        updateGame(s, {
          now,
          onCountdownTick: (_step, label) => {
            if (!soundOnRef.current) return;
            void resumeAudio();
            if (label === "GO") playGoChime();
            else if (label === "2") playCountdownTick(1);
            else if (label === "1") playCountdownTick(2);
          },
        });
        if (s.phase !== prevPhase) {
          if (s.phase === "boot") setOverlay({ kind: "boot" });
          else if (s.phase === "gameover") {
            setOverlay({
              kind: "gameover",
              score: Math.floor(s.score),
              newBest: s.wasNewRecord,
            });
          } else setOverlay(null);
        }
        drawGame(ctx, s, now, canvas.width, canvas.height, themeRef.current);

        const label = countdownOverlayLabel(s, now);
        if (label) {
          const accent = GAME_THEMES[themeRef.current].accent;
          drawHudOverlay(ctx, canvas.width, canvas.height, label, accent);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, themeId]);

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const s = stateRef.current;
    if (!s) return;
    if (soundOnRef.current) void resumeAudio();
    const prev = s.phase;
    handleAction(s, performance.now());
    if ((prev === "boot" || prev === "gameover") && s.phase === "countdown" && soundOnRef.current) {
      playCountdownTick(0);
    }
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-800">
            Space
          </kbd>{" "}
          to jump, start, and retry. Tap the game on touch devices.
        </p>
        <button
          type="button"
          onClick={() => {
            setSoundOn((v) => !v);
            void resumeAudio();
          }}
          className="rounded-md border border-zinc-300 px-3 py-1 font-medium text-zinc-800 focus:outline focus:ring-2 focus:ring-amber-500 dark:border-zinc-600 dark:text-zinc-100"
        >
          Sound: {soundOn ? "on" : "off"}
        </button>
      </div>
      <div className="relative aspect-[920/280] w-full overflow-hidden rounded-lg border-2 border-zinc-800 bg-zinc-900 shadow-lg dark:border-zinc-600">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-pointer touch-manipulation"
          onPointerDown={onCanvasPointerDown}
          aria-label="The Dinosaur Game canvas. Press Space to start."
          role="application"
        />
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/35 px-4 text-center text-white">
            <h2 className="font-mono text-xl font-bold tracking-wide">
              {overlay.kind === "boot" ? "Press Space to start" : "Game Over"}
            </h2>
            {overlay.kind === "gameover" && (
              <p className="font-mono text-sm">
                Score {overlay.score}
                {overlay.newBest ? " · New best!" : ""}
              </p>
            )}
            <p className="font-mono text-xs text-zinc-200">
              Space to {overlay.kind === "boot" ? "play" : "try again"}
            </p>
          </div>
        )}
      </div>
      <p className="text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
        Near misses, coins, night mode, and a shaky game over — arcade style.
      </p>
    </div>
  );
}

function drawHudOverlay(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  countdownLabel: string,
  accent: string
) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = accent;
  ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
  ctx.lineWidth = 6;
  ctx.font = `bold ${Math.min(cw, ch) * 0.22}px ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = cw / 2;
  const cy = ch / 2;
  ctx.strokeText(countdownLabel, cx, cy);
  ctx.fillText(countdownLabel, cx, cy);
  ctx.restore();
}
