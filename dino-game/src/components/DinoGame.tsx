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
  /** ResizeObserver target: never the canvas (mutating canvas size retriggers observers). */
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const lastCanvasPxRef = useRef({ w: 0, h: 0 });
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
    const syncId = requestAnimationFrame(() => {
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
    return () => {
      cancelAnimationFrame(syncId);
      stateRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let alive = true;
    let measureRaf = 0;

    const applyMeasure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = wrap.getBoundingClientRect();
      const rw = Math.max(1, r.width);
      const rh = Math.max(1, r.height);
      const w = Math.max(320, Math.round(rw * dpr));
      const h = Math.max(200, Math.round(rh * dpr));
      const prev = lastCanvasPxRef.current;
      if (prev.w === w && prev.h === h) return;
      lastCanvasPxRef.current = { w, h };
      canvas.width = w;
      canvas.height = h;
    };

    const scheduleMeasure = () => {
      if (measureRaf !== 0) return;
      measureRaf = requestAnimationFrame(() => {
        measureRaf = 0;
        if (!alive) return;
        applyMeasure();
      });
    };

    const onWinResize = () => scheduleMeasure();
    window.addEventListener("resize", onWinResize);

    const onKeyDown = (e: KeyboardEvent) => {
      const isSpace =
        e.code === "Space" ||
        e.key === " " ||
        e.key === "Spacebar";
    
      if (!isSpace) return;
    
      if (e.repeat) return;
    
      e.preventDefault();
    
      const s = stateRef.current;
      if (!s) return;
    
      if (soundOnRef.current) void resumeAudio();
    
      const prev = s.phase;
    
      handleAction(s, performance.now());
    
      if (
        (prev === "boot" || prev === "gameover") &&
        s.phase === "countdown" &&
        soundOnRef.current
      ) {
        playCountdownTick(0);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const loop = (now: number) => {
      if (!alive) return;
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
        if (canvas.width > 0 && canvas.height > 0) {
          drawGame(ctx, s, now, canvas.width, canvas.height, themeRef.current);

          const label = countdownOverlayLabel(s, now);
          if (label) {
            const accent = GAME_THEMES[themeRef.current].accent;
            drawHudOverlay(ctx, canvas.width, canvas.height, label, accent);
          }
        }
      }
      if (alive) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    let layoutOuterRaf = 0;
    let layoutInnerRaf = 0;
    const startLoopAfterLayout = () => {
      applyMeasure();
      rafRef.current = requestAnimationFrame(loop);
    };
    layoutOuterRaf = requestAnimationFrame(() => {
      layoutInnerRaf = requestAnimationFrame(() => {
        layoutInnerRaf = 0;
        if (!alive) return;
        startLoopAfterLayout();
      });
    });

    return () => {
      alive = false;
      window.removeEventListener("resize", onWinResize);
      if (measureRaf !== 0) {
        cancelAnimationFrame(measureRaf);
        measureRaf = 0;
      }
      if (layoutInnerRaf !== 0) {
        cancelAnimationFrame(layoutInnerRaf);
        layoutInnerRaf = 0;
      }
      if (layoutOuterRaf !== 0) {
        cancelAnimationFrame(layoutOuterRaf);
        layoutOuterRaf = 0;
      }
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current?.focus();

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
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
        <p>
          <kbd className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-200">
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
          className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1 font-medium text-slate-200 focus:outline focus:ring-2 focus:ring-violet-500"
        >
          Sound: {soundOn ? "on" : "off"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Color theme">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Theme</span>
        {THEME_LIST.map((id) => {
          const t = GAME_THEMES[id];
          const active = themeId === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setThemeId(id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                active
                  ? "border-transparent text-white shadow-md"
                  : "border-slate-600 bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${t.skyTop}, ${t.ground})`,
                      boxShadow: `0 0 0 2px ${t.accent}`,
                    }
                  : undefined
              }
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: t.accent }}
                aria-hidden
              />
              {t.label}
            </button>
          );
        })}
      </div>
      <div
        className="relative aspect-[920/280] min-h-[200px] w-full overflow-hidden rounded-xl border-2 bg-black shadow-xl"
        style={{ borderColor: GAME_THEMES[themeId].accent }}
      >
        <div ref={canvasWrapRef} className="h-full w-full min-h-0">
          <canvas
            ref={canvasRef}
            className="block h-full w-full min-h-0 cursor-pointer touch-manipulation"
            onPointerDown={onCanvasPointerDown}
            aria-label="The Dinosaur Game canvas. Press Space to start."
            role="application"
          />
        </div>
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
      <p className="text-center font-mono text-xs text-slate-500">
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
