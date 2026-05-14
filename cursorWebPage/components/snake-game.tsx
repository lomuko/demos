"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_HIGH = "neon-snake-high-score";
const STORAGE_SETTINGS = "neon-snake-settings";
const STORAGE_LEADERBOARD = "neon-snake-leaderboard-v2";

const INITIAL_LENGTH = 3;
const INITIAL_TICK = { chill: 160, normal: 110, rush: 72 } as const;

const BOARD_PRESETS = {
  compact: { grid: 14, cell: 18 },
  classic: { grid: 18, cell: 16 },
  arena: { grid: 22, cell: 15 },
} as const;

type BoardSizeId = keyof typeof BOARD_PRESETS;
type ThemeId = "neon" | "aurora" | "ember";
type Difficulty = keyof typeof INITIAL_TICK;
type Vec = { x: number; y: number };

type LeaderEntry = {
  id: string;
  name: string;
  score: number;
  date: string;
  boardSize: BoardSizeId;
};

type Settings = {
  wrap: boolean;
  difficulty: Difficulty;
  theme: ThemeId;
  boardSize: BoardSizeId;
};

type ThemePalette = {
  boardBg: string;
  gridStroke: string;
  flash: (alpha: number) => string;
  head0: string;
  head1: string;
  bodyLo: string;
  bodyHi: string;
  foodCore: string;
  foodGlow: string;
};

const THEMES: Record<ThemeId, ThemePalette> = {
  neon: {
    boardBg: "#0b1220",
    gridStroke: "rgba(148, 163, 184, 0.06)",
    flash: (a) => `rgba(34, 211, 238, ${0.08 * a})`,
    head0: "#ecfeff",
    head1: "#22d3ee",
    bodyLo: "rgba(6, 182, 212, %t%)",
    bodyHi: "rgba(8, 145, 178, %t%)",
    foodCore: "#fbcfe8",
    foodGlow: "rgba(244, 114, 182, 0.9)",
  },
  aurora: {
    boardBg: "#07120f",
    gridStroke: "rgba(167, 243, 208, 0.07)",
    flash: (a) => `rgba(52, 211, 153, ${0.1 * a})`,
    head0: "#ecfdf5",
    head1: "#34d399",
    bodyLo: "rgba(16, 185, 129, %t%)",
    bodyHi: "rgba(5, 150, 105, %t%)",
    foodCore: "#fde68a",
    foodGlow: "rgba(250, 204, 21, 0.85)",
  },
  ember: {
    boardBg: "#14080c",
    gridStroke: "rgba(251, 207, 232, 0.06)",
    flash: (a) => `rgba(251, 113, 133, ${0.09 * a})`,
    head0: "#fff1f2",
    head1: "#fb7185",
    bodyLo: "rgba(244, 63, 94, %t%)",
    bodyHi: "rgba(190, 18, 60, %t%)",
    foodCore: "#c4b5fd",
    foodGlow: "rgba(167, 139, 250, 0.9)",
  },
};

function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_HIGH);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function saveHighScore(n: number) {
  window.localStorage.setItem(STORAGE_HIGH, String(n));
}

function loadLeaderboard(): LeaderEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_LEADERBOARD);
    let list: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const parsed = (list as Partial<LeaderEntry>[])
      .filter(
        (e) =>
          e &&
          typeof e.id === "string" &&
          typeof e.name === "string" &&
          typeof e.score === "number" &&
          typeof e.date === "string",
      )
      .map((e) => ({
        id: e.id!,
        name: e.name!,
        score: Math.max(0, Math.floor(e.score!)),
        date: e.date!,
        boardSize:
          e.boardSize === "compact" ||
          e.boardSize === "classic" ||
          e.boardSize === "arena"
            ? e.boardSize
            : ("classic" satisfies BoardSizeId),
      }));
    const sorted = sortLeaderboard(parsed);
    if (sorted.length === 0) {
      const leg = loadHighScore();
      if (leg > 0) {
        return [
          {
            id: crypto.randomUUID(),
            name: "Migrated best",
            score: leg,
            date: new Date(0).toISOString(),
            boardSize: "classic",
          },
        ];
      }
    }
    return sorted.slice(0, 10);
  } catch {
    return [];
  }
}

function sortLeaderboard(entries: LeaderEntry[]): LeaderEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function saveLeaderboard(entries: LeaderEntry[]) {
  const sorted = sortLeaderboard(entries).slice(0, 10);
  window.localStorage.setItem(STORAGE_LEADERBOARD, JSON.stringify(sorted));
  const top = sorted[0]?.score ?? 0;
  saveHighScore(top);
}

function qualifiesForLeaderboard(score: number, entries: LeaderEntry[]): boolean {
  const ghost: LeaderEntry = {
    id: "__qualify__",
    name: "",
    score,
    date: new Date().toISOString(),
    boardSize: "classic",
  };
  const sorted = sortLeaderboard([...entries, ghost]);
  const rank = sorted.findIndex((e) => e.id === "__qualify__");
  return rank >= 0 && rank < 10;
}

function loadSettings(): Settings {
  if (typeof window === "undefined") {
    return {
      wrap: false,
      difficulty: "normal",
      theme: "neon",
      boardSize: "classic",
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_SETTINGS);
    if (!raw) {
      return {
        wrap: false,
        difficulty: "normal",
        theme: "neon",
        boardSize: "classic",
      };
    }
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const difficulty =
      parsed.difficulty === "chill" ||
      parsed.difficulty === "normal" ||
      parsed.difficulty === "rush"
        ? parsed.difficulty
        : "normal";
    const theme =
      parsed.theme === "neon" ||
      parsed.theme === "aurora" ||
      parsed.theme === "ember"
        ? parsed.theme
        : "neon";
    const boardSize =
      parsed.boardSize === "compact" ||
      parsed.boardSize === "classic" ||
      parsed.boardSize === "arena"
        ? parsed.boardSize
        : "classic";
    return {
      wrap: Boolean(parsed.wrap),
      difficulty,
      theme,
      boardSize,
    };
  } catch {
    return {
      wrap: false,
      difficulty: "normal",
      theme: "neon",
      boardSize: "classic",
    };
  }
}

function saveSettings(s: Settings) {
  window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(s));
}

function randomFood(occupied: Set<string>, grid: number): Vec {
  for (;;) {
    const x = Math.floor(Math.random() * grid);
    const y = Math.floor(Math.random() * grid);
    const key = `${x},${y}`;
    if (!occupied.has(key)) return { x, y };
  }
}

function wrapCoord(v: number, grid: number): number {
  if (v < 0) return grid - 1;
  if (v >= grid) return 0;
  return v;
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [postGamePhase, setPostGamePhase] = useState<"idle" | "naming" | "done">(
    "idle",
  );
  const [playerName, setPlayerName] = useState("");
  const [settings, setSettings] = useState<Settings>({
    wrap: false,
    difficulty: "normal",
    theme: "neon",
    boardSize: "classic",
  });

  const snakeRef = useRef<Vec[]>([]);
  const dirRef = useRef<Vec>({ x: 1, y: 0 });
  const pendingDirRef = useRef<Vec | null>(null);
  const foodRef = useRef<Vec>({ x: 0, y: 0 });
  const tickRef = useRef(0);
  const lastFrameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const eatFlashRef = useRef(0);
  const gridRef = useRef(BOARD_PRESETS.classic.grid);
  const cellRef = useRef(BOARD_PRESETS.classic.cell);

  const { grid: activeGrid, cell: activeCell } = BOARD_PRESETS[settings.boardSize];
  const canvasPx = activeGrid * activeCell;

  const resetGame = useCallback(() => {
    const { grid, cell } = BOARD_PRESETS[settings.boardSize];
    gridRef.current = grid;
    cellRef.current = cell;
    const mid = Math.floor(grid / 2);
    const startX = Math.floor(grid / 4);
    snakeRef.current = Array.from({ length: INITIAL_LENGTH }, (_, i) => ({
      x: startX - i,
      y: mid,
    }));
    dirRef.current = { x: 1, y: 0 };
    pendingDirRef.current = null;
    const occupied = new Set(snakeRef.current.map((p) => `${p.x},${p.y}`));
    foodRef.current = randomFood(occupied, grid);
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setNewRecord(false);
    setPostGamePhase("idle");
    setPlayerName("");
    setStarted(true);
    tickRef.current = 0;
    lastFrameRef.current =
      typeof performance !== "undefined" ? performance.now() : 0;
  }, [settings.boardSize]);

  useEffect(() => {
    const lb = loadLeaderboard();
    setLeaderboard(lb);
    setHighScore(Math.max(loadHighScore(), lb[0]?.score ?? 0));
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!gameOver) {
      setPostGamePhase("idle");
      return;
    }
    setPostGamePhase((prev) => {
      if (prev !== "idle") return prev;
      return qualifiesForLeaderboard(score, leaderboard) ? "naming" : "done";
    });
  }, [gameOver, score, leaderboard]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grid = gridRef.current;
    const cell = cellRef.current;
    const canvasSize = grid * cell;
    const theme = THEMES[settings.theme];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = theme.boardBg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.strokeStyle = theme.gridStroke;
    ctx.lineWidth = 1;
    for (let i = 0; i <= grid; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell + 0.5, 0);
      ctx.lineTo(i * cell + 0.5, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell + 0.5);
      ctx.lineTo(canvasSize, i * cell + 0.5);
      ctx.stroke();
    }

    const flash = eatFlashRef.current;
    if (flash > 0) {
      const a = Math.min(1, flash / 12);
      ctx.fillStyle = theme.flash(a);
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      const px = seg.x * cell;
      const py = seg.y * cell;
      const pad = i === 0 ? 2 : 3;
      const r = i === 0 ? 5 : 4;
      const g = ctx.createLinearGradient(px, py, px + cell, py + cell);
      if (i === 0) {
        g.addColorStop(0, theme.head0);
        g.addColorStop(1, theme.head1);
      } else {
        const t = i / Math.max(snake.length - 1, 1);
        const a0 = 0.45 + 0.45 * (1 - t);
        const a1 = 0.35 + 0.35 * (1 - t);
        g.addColorStop(
          0,
          theme.bodyLo.replace("%t%", String(Math.round(a0 * 100) / 100)),
        );
        g.addColorStop(
          1,
          theme.bodyHi.replace("%t%", String(Math.round(a1 * 100) / 100)),
        );
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(px + pad, py + pad, cell - pad * 2, cell - pad * 2, r);
      ctx.fill();
    });

    const food = foodRef.current;
    const fx = food.x * cell + cell / 2;
    const fy = food.y * cell + cell / 2;
    const pulse = 0.85 + 0.15 * Math.sin(Date.now() / 200);
    ctx.shadowColor = theme.foodGlow;
    ctx.shadowBlur = 18 * pulse;
    ctx.fillStyle = theme.foodCore;
    ctx.beginPath();
    ctx.arc(fx, fy, cell * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [settings.theme]);

  useEffect(() => {
    const tickMs = INITIAL_TICK[settings.difficulty];
    const wrap = settings.wrap;

    const step = (): boolean => {
      const grid = gridRef.current;
      if (pendingDirRef.current) {
        const next = pendingDirRef.current;
        const cur = dirRef.current;
        if (next.x !== -cur.x || next.y !== -cur.y) {
          dirRef.current = next;
        }
        pendingDirRef.current = null;
      }

      const dir = dirRef.current;
      const head = snakeRef.current[0];
      if (!head) return true;

      let nx = head.x + dir.x;
      let ny = head.y + dir.y;

      if (wrap) {
        nx = wrapCoord(nx, grid);
        ny = wrapCoord(ny, grid);
      } else if (nx < 0 || ny < 0 || nx >= grid || ny >= grid) {
        setGameOver(true);
        setStarted(false);
        return false;
      }

      const newHead: Vec = { x: nx, y: ny };
      const body = snakeRef.current;
      const selfHit = body.some((s) => s.x === nx && s.y === ny);
      if (selfHit) {
        setGameOver(true);
        setStarted(false);
        return false;
      }

      const ate = nx === foodRef.current.x && ny === foodRef.current.y;
      const nextSnake = [newHead, ...body];
      if (!ate) nextSnake.pop();
      else {
        eatFlashRef.current = 14;
        const nextScore = nextSnake.length - INITIAL_LENGTH;
        setScore(nextScore);
        setLeaderboard((prevLb) => {
          const best = prevLb[0]?.score ?? loadHighScore();
          if (nextScore > best) {
            setNewRecord(true);
          }
          return prevLb;
        });
        const occ = new Set(nextSnake.map((p) => `${p.x},${p.y}`));
        foodRef.current = randomFood(occ, grid);
      }

      snakeRef.current = nextSnake;
      return true;
    };

    const loop = (now: number) => {
      const playing = started && !gameOver && !paused;
      if (playing) {
        tickRef.current += now - lastFrameRef.current;
        while (tickRef.current >= tickMs) {
          tickRef.current -= tickMs;
          if (!step()) break;
        }
      }
      lastFrameRef.current = now;
      if (eatFlashRef.current > 0) eatFlashRef.current -= 1;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver, paused, settings.difficulty, settings.wrap, draw]);

  const submitLeaderName = useCallback(
    (useAnonymous: boolean) => {
      const nameRaw = useAnonymous
        ? "Anonymous"
        : playerName.trim() || "Anonymous";
      const name =
        nameRaw.length > 24 ? `${nameRaw.slice(0, 24)}…` : nameRaw;
      const entry: LeaderEntry = {
        id: crypto.randomUUID(),
        name,
        score,
        date: new Date().toISOString(),
        boardSize: settings.boardSize,
      };
      setLeaderboard((prev) => {
        const next = sortLeaderboard([...prev, entry]).slice(0, 10);
        saveLeaderboard(next);
        setHighScore(next[0]?.score ?? 0);
        return next;
      });
      setPostGamePhase("done");
    },
    [playerName, score, settings.boardSize],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver && postGamePhase === "naming" && e.key === "Enter") {
        e.preventDefault();
        submitLeaderName(false);
        return;
      }
      const key = e.key.toLowerCase();
      const map: Record<string, Vec> = {
        arrowup: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      if (key in map) {
        e.preventDefault();
        if (!started && !gameOver) {
          resetGame();
        }
        pendingDirRef.current = map[key];
      } else if (key === " " || key === "p") {
        e.preventDefault();
        if (started && !gameOver) setPaused((p) => !p);
      } else if (key === "r" && gameOver && postGamePhase !== "naming") {
        e.preventDefault();
        resetGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, gameOver, resetGame, postGamePhase, submitLeaderName]);

  const difficultyBtn = (d: Difficulty, label: string) => (
    <button
      key={d}
      type="button"
      disabled={started && !gameOver}
      onClick={() => setSettings((s) => ({ ...s, difficulty: d }))}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        settings.difficulty === d
          ? "bg-cyan-500/25 text-cyan-100 ring-1 ring-cyan-400/50"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      } disabled:opacity-40`}
    >
      {label}
    </button>
  );

  const themeBtn = (t: ThemeId, label: string, sw: string) => (
    <button
      key={t}
      type="button"
      disabled={started && !gameOver}
      onClick={() => setSettings((s) => ({ ...s, theme: t }))}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
        settings.theme === t
          ? "bg-white/10 text-white ring-1 ring-white/25"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      } disabled:opacity-40`}
    >
      <span className={`h-3 w-3 rounded-full ${sw}`} aria-hidden />
      {label}
    </button>
  );

  const sizeBtn = (b: BoardSizeId, label: string, sub: string) => (
    <button
      key={b}
      type="button"
      disabled={started && !gameOver}
      onClick={() => setSettings((s) => ({ ...s, boardSize: b }))}
      className={`rounded-2xl border px-3 py-2 text-left text-xs transition ${
        settings.boardSize === b
          ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-50"
          : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]"
      } disabled:opacity-40`}
    >
      <span className="block font-semibold">{label}</span>
      <span className="mt-0.5 block text-[10px] text-slate-500">{sub}</span>
    </button>
  );

  const boardLabel: Record<BoardSizeId, string> = {
    compact: "Compact",
    classic: "Classic",
    arena: "Arena",
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
            <span className="text-slate-500">Score</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-white">
              {score}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
            <span className="text-fuchsia-300/80">Best</span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {highScore}
            </span>
          </span>
          {newRecord && score > 0 && (
            <span className="animate-pulse rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
              New personal best
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-slate-300">
            Space
          </kbd>
          <span>pause</span>
        </div>
      </div>

      <div className="relative mx-auto w-fit">
        <canvas
          ref={canvasRef}
          className="rounded-2xl border border-white/10 shadow-[0_20px_60px_-20px_rgba(34,211,238,0.35)]"
          width={canvasPx}
          height={canvasPx}
          role="img"
          aria-label="Snake game board"
        />

        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/75 px-6 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-200">Ready?</p>
            <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-slate-400">
              Press any arrow key or{" "}
              <span className="text-slate-300">W A S D</span> to start. Eat the
              glowing orbs. Do not bite yourself
              {!settings.wrap ? " or the walls" : ""}.
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="mt-5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              Play
            </button>
          </div>
        )}

        {paused && started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/70 backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">Paused</p>
            <button
              type="button"
              onClick={() => setPaused(false)}
              className="mt-4 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
            >
              Resume
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-2xl bg-slate-950/85 px-4 py-6 text-center backdrop-blur-md sm:px-6">
            <p className="text-lg font-semibold text-white">Game over</p>
            <p className="mt-2 text-sm text-slate-400">
              You scored{" "}
              <span className="font-mono font-semibold text-cyan-300">
                {score}
              </span>
              .
            </p>

            {postGamePhase === "naming" && (
              <div className="mt-5 w-full max-w-[280px] text-left">
                <p className="text-center text-xs text-emerald-200/90">
                  Top 10 — add your name
                </p>
                <p className="mt-1 text-center text-[10px] text-slate-500">
                  Date is saved automatically with your entry.
                </p>
                <label className="mt-3 block text-[11px] font-medium text-slate-400">
                  Display name
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={32}
                    placeholder="Player"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-cyan-500/30 placeholder:text-slate-600 focus:ring-2"
                    autoFocus
                  />
                </label>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => submitLeaderName(false)}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    Save score
                  </button>
                  <button
                    type="button"
                    onClick={() => submitLeaderName(true)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    Skip (Anonymous)
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-500">
                  Press Enter to save
                </p>
              </div>
            )}

            {postGamePhase !== "naming" && (
              <>
                <button
                  type="button"
                  onClick={resetGame}
                  className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Play again
                </button>
                <p className="mt-3 text-[11px] text-slate-500">
                  Tip: press <kbd className="font-mono text-slate-400">R</kbd>{" "}
                  after game over.
                </p>
              </>
            )}

            {postGamePhase === "done" && score > 0 && (
              <p className="mt-4 text-xs text-emerald-300/90">
                Saved to local hall of fame.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Board size
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {sizeBtn(
              "compact",
              "Compact",
              `${BOARD_PRESETS.compact.grid}×${BOARD_PRESETS.compact.grid} · larger cells`,
            )}
            {sizeBtn(
              "classic",
              "Classic",
              `${BOARD_PRESETS.classic.grid}×${BOARD_PRESETS.classic.grid} · balanced`,
            )}
            {sizeBtn(
              "arena",
              "Arena",
              `${BOARD_PRESETS.arena.grid}×${BOARD_PRESETS.arena.grid} · big field`,
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Theme
          </p>
          <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-black/20 p-1">
            {themeBtn("neon", "Neon", "bg-gradient-to-br from-cyan-400 to-fuchsia-500")}
            {themeBtn(
              "aurora",
              "Aurora",
              "bg-gradient-to-br from-emerald-400 to-lime-300",
            )}
            {themeBtn(
              "ember",
              "Ember",
              "bg-gradient-to-br from-rose-500 to-violet-500",
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Speed
          </p>
          <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-black/20 p-1">
            {difficultyBtn("chill", "Chill")}
            {difficultyBtn("normal", "Normal")}
            {difficultyBtn("rush", "Rush")}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]">
          <div>
            <p className="text-sm font-medium text-slate-200">Portal walls</p>
            <p className="text-xs text-slate-500">
              Leave one edge, enter the opposite. Still deadly if you collide
              with your body.
            </p>
          </div>
          <input
            type="checkbox"
            className="peer sr-only"
            checked={settings.wrap}
            disabled={started && !gameOver}
            onChange={(e) =>
              setSettings((s) => ({ ...s, wrap: e.target.checked }))
            }
          />
          <span
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              settings.wrap ? "bg-cyan-500/40" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                settings.wrap ? "translate-x-5" : ""
              }`}
            />
          </span>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hall of fame
          </p>
          <span className="text-[10px] text-slate-500">Top 10 · local only</span>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-center text-xs text-slate-500">
            No scores yet. Play a round to fill the board.
          </p>
        ) : (
          <ul className="space-y-2">
            {leaderboard.map((row, i) => (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs"
              >
                <span className="w-5 shrink-0 text-center font-mono text-slate-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-100">{row.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {formatShortDate(row.date)} · {boardLabel[row.boardSize]}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-cyan-200">
                  {row.score}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
        Controls: arrows or WASD · Pause: Space / P · After game over: R to
        restart (after saving your name)
      </p>
    </div>
  );
}
