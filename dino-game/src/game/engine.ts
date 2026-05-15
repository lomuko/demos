import {
  BASE_SPEED,
  COUNTDOWN_GO_MS_NORMAL,
  COUNTDOWN_GO_MS_REDUCED,
  COUNTDOWN_MS_NORMAL,
  COUNTDOWN_MS_REDUCED,
  DINO_FOOT_Y,
  DINO_H,
  DINO_W,
  DINO_X,
  GAME_H,
  GAME_W,
  GROUND_Y,
  GRAVITY,
  HIGH_SCORE_KEY,
  JUMP_V0,
  MAX_SPEED,
  NIGHT_DURATION_MS,
  NIGHT_SCORE_INTERVAL,
} from "./constants";
import { drawDinoSprite } from "./sprites";
import { paletteForTheme, type GameThemeId } from "./themes";
import type { Cloud, GameState, Obstacle, ObstacleKind } from "./types";
import type { RenderPalette } from "./themes";

const DINO_HIT_INSET = 6;
const OBS_HIT_INSET = 4;

function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(HIGH_SCORE_KEY);
  const n = v ? Number.parseInt(v, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function persistHighScoreIfNeeded(s: GameState): void {
  const floor = Math.floor(s.score);
  if (floor > s.highScore) {
    s.highScore = floor;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(floor));
    }
  }
}

function obstacleDims(kind: ObstacleKind): { w: number; h: number } {
  switch (kind) {
    case "cactus":
      return { w: 28, h: 52 };
    case "cactusTall":
      return { w: 34, h: 72 };
    case "rock":
      return { w: 36, h: 28 };
    default:
      return { w: 28, h: 52 };
  }
}

function randomKind(): ObstacleKind {
  const r = Math.random();
  if (r < 0.45) return "cactus";
  if (r < 0.78) return "rock";
  return "cactusTall";
}

function makeClouds(): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * GAME_W * 1.2,
      y: 24 + Math.random() * 70,
      w: 60 + Math.random() * 50,
      h: 18 + Math.random() * 10,
      speed: 18 + Math.random() * 22,
    });
  }
  return clouds;
}

export function createInitialState(reducedMotion: boolean): GameState {
  return {
    phase: "boot",
    countdownStep: 0,
    countdownStepEndsAt: 0,
    reducedMotion,
    dino: { y: DINO_FOOT_Y - DINO_H, vy: 0, grounded: true },
    obstacles: [],
    pickups: [],
    clouds: makeClouds(),
    particles: [],
    score: 0,
    highScore: loadHighScore(),
    speed: BASE_SPEED,
    nextSpawnIn: 0.9 + Math.random() * 0.6,
    nightUntil: 0,
    shakeUntil: 0,
    floatText: "",
    floatTextUntil: 0,
    combo: 0,
    lastFrameMs: 0,
    runningStartedAt: 0,
    wasNewRecord: false,
  };
}

function stepDurationMs(s: GameState, isGo: boolean): number {
  if (s.reducedMotion) return isGo ? COUNTDOWN_GO_MS_REDUCED : COUNTDOWN_MS_REDUCED;
  return isGo ? COUNTDOWN_GO_MS_NORMAL : COUNTDOWN_MS_NORMAL;
}

export function beginCountdown(s: GameState, now: number): void {
  s.phase = "countdown";
  s.countdownStep = 0;
  s.countdownStepEndsAt = now + stepDurationMs(s, false);
  s.obstacles = [];
  s.pickups = [];
  s.particles = [];
  s.dino = { y: DINO_FOOT_Y - DINO_H, vy: 0, grounded: true };
  s.wasNewRecord = false;
}

export function beginRunning(s: GameState, now: number): void {
  s.phase = "running";
  s.score = 0;
  s.speed = BASE_SPEED;
  s.nextSpawnIn = 0.75 + Math.random() * 0.5;
  s.obstacles = [];
  s.pickups = [];
  s.combo = 0;
  s.runningStartedAt = now;
  s.lastFrameMs = now;
}

function dinoRect(s: GameState) {
  return {
    x: DINO_X + DINO_HIT_INSET,
    y: s.dino.y + DINO_HIT_INSET,
    w: DINO_W - DINO_HIT_INSET * 2,
    h: DINO_H - DINO_HIT_INSET * 2,
  };
}

function obstacleRect(o: Obstacle) {
  const yTop = DINO_FOOT_Y - o.h;
  return {
    x: o.x + OBS_HIT_INSET,
    y: yTop + OBS_HIT_INSET,
    w: o.w - OBS_HIT_INSET * 2,
    h: o.h - OBS_HIT_INSET * 2,
  };
}

function aabb(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function pushParticles(s: GameState, x: number, y: number, color: string, n: number): void {
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = 90 + Math.random() * 200;
    s.particles.push({
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 80,
      life: 0.35 + Math.random() * 0.25,
      color,
    });
  }
}

function maybeSpawnPickup(s: GameState): void {
  s.pickups.push({ x: GAME_W + 50 + Math.random() * 100, collected: false });
}

function spawnObstacle(s: GameState): void {
  const kind = randomKind();
  const { w, h } = obstacleDims(kind);
  s.obstacles.push({
    x: GAME_W + 40 + Math.random() * 80,
    kind,
    w,
    h,
    nearMissAwarded: false,
    cleared: false,
  });
  if (Math.random() < 0.15) maybeSpawnPickup(s);
}

function jump(s: GameState): void {
  if (s.phase !== "running") return;
  if (s.dino.grounded) {
    s.dino.vy = JUMP_V0;
    s.dino.grounded = false;
  }
}

/** Space / tap: phase transitions + jump */
export function handleAction(s: GameState, now: number): void {
  if (s.phase === "boot") {
    beginCountdown(s, now);
    return;
  }
  if (s.phase === "gameover") {
    beginCountdown(s, now);
    return;
  }
  if (s.phase === "running") {
    jump(s);
  }
}

export interface UpdateOptions {
  now: number;
  onCountdownTick?: (step: number, label: string) => void;
}

export function updateGame(s: GameState, opts: UpdateOptions): void {
  const { now, onCountdownTick } = opts;
  const dt = s.lastFrameMs ? Math.min(0.05, (now - s.lastFrameMs) / 1000) : 0;
  s.lastFrameMs = now;

  if (s.floatTextUntil && now > s.floatTextUntil) {
    s.floatText = "";
    s.floatTextUntil = 0;
  }

  if (s.shakeUntil && now > s.shakeUntil) s.shakeUntil = 0;

  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += GRAVITY * 0.35 * dt;
    if (p.life <= 0) s.particles.splice(i, 1);
  }

  for (const c of s.clouds) {
    c.x -= c.speed * dt;
    if (c.x + c.w < -20) c.x = GAME_W + 40 + Math.random() * 120;
  }

  if (s.phase === "countdown") {
    const labels = ["3", "2", "1", "GO"];
    if (now >= s.countdownStepEndsAt) {
      if (s.countdownStep >= 3) {
        beginRunning(s, now);
      } else {
        s.countdownStep += 1;
        const label = labels[s.countdownStep];
        onCountdownTick?.(s.countdownStep, label);
        const isGo = s.countdownStep >= 3;
        s.countdownStepEndsAt = now + stepDurationMs(s, isGo);
      }
    }
    return;
  }

  if (s.phase !== "running") return;

  const prevScoreFloor = Math.floor(s.score);
  s.score += s.speed * dt * 0.12;
  const scoreFloor = Math.floor(s.score);

  if (scoreFloor > 0 && scoreFloor % NIGHT_SCORE_INTERVAL === 0 && prevScoreFloor !== scoreFloor) {
    s.nightUntil = now + NIGHT_DURATION_MS;
  }
  if (s.nightUntil && now > s.nightUntil) s.nightUntil = 0;

  s.speed = Math.min(MAX_SPEED, BASE_SPEED + scoreFloor * 0.85);

  s.dino.vy += GRAVITY * dt;
  s.dino.y += s.dino.vy * dt;
  const groundTop = DINO_FOOT_Y - DINO_H;
  if (s.dino.y >= groundTop) {
    s.dino.y = groundTop;
    s.dino.vy = 0;
    s.dino.grounded = true;
  }

  s.nextSpawnIn -= dt;
  if (s.nextSpawnIn <= 0) {
    spawnObstacle(s);
    const minGap = Math.max(0.38, 0.95 - scoreFloor * 0.004);
    const maxGap = Math.max(minGap + 0.2, 1.35 - scoreFloor * 0.003);
    s.nextSpawnIn = minGap + Math.random() * (maxGap - minGap);
  }

  const dr = dinoRect(s);

  for (const p of s.pickups) {
    if (p.collected) continue;
    p.x -= s.speed * dt;
    const pr = { x: p.x - 10, y: DINO_FOOT_Y - 22, w: 20, h: 20 };
    if (aabb(dr.x, dr.y, dr.w, dr.h, pr.x, pr.y, pr.w, pr.h)) {
      p.collected = true;
      s.score += 42;
      s.combo += 1;
      s.floatText = "+42 COIN";
      s.floatTextUntil = now + 900;
      pushParticles(s, p.x, pr.y + 6, "#fbbf24", 14);
    } else if (p.x < -30) {
      p.collected = true;
    }
  }
  s.pickups = s.pickups.filter((p) => !p.collected || p.x > -60);

  for (const o of s.obstacles) {
    o.x -= s.speed * dt;
    const or = obstacleRect(o);

    if (!o.cleared && o.x + o.w < DINO_X - 4) {
      o.cleared = true;
      const gapY = Math.abs(dr.y + dr.h / 2 - (or.y + or.h / 2));
      const gapX = Math.min(Math.abs(dr.x - (or.x + or.w)), Math.abs(dr.x + dr.w - or.x));
      if (!o.nearMissAwarded && gapY < 26 && gapX < 18) {
        o.nearMissAwarded = true;
        const bonus = 8 + Math.min(20, s.combo * 2);
        s.score += bonus;
        s.combo += 1;
        s.floatText = `NEAR MISS +${bonus}`;
        s.floatTextUntil = now + 650;
        pushParticles(s, DINO_X + DINO_W * 0.5, s.dino.y + 10, "#38bdf8", 8);
      }
    }

    if (aabb(dr.x, dr.y, dr.w, dr.h, or.x, or.y, or.w, or.h)) {
      s.phase = "gameover";
      s.shakeUntil = now + 420;
      const prevBest = s.highScore;
      s.wasNewRecord = Math.floor(s.score) > prevBest;
      persistHighScoreIfNeeded(s);
      pushParticles(s, dr.x + dr.w * 0.5, dr.y + dr.h * 0.5, "#ef4444", 18);
      return;
    }
  }

  s.obstacles = s.obstacles.filter((o) => o.x > -120);
}

function drawCactus(ctx: CanvasRenderingContext2D, o: Obstacle, pal: RenderPalette) {
  const top = DINO_FOOT_Y - o.h;
  ctx.fillStyle = pal.cactus;
  ctx.fillRect(o.x + o.w * 0.35, top, o.w * 0.3, o.h);
  if (o.kind !== "rock") {
    ctx.fillStyle = pal.cactusHighlight;
    ctx.fillRect(o.x, top + o.h * 0.35, o.w * 0.45, o.h * 0.12);
    ctx.fillRect(o.x + o.w * 0.55, top + o.h * 0.5, o.w * 0.45, o.h * 0.12);
  }
}

function drawRock(ctx: CanvasRenderingContext2D, o: Obstacle, pal: RenderPalette) {
  const top = DINO_FOOT_Y - o.h;
  ctx.fillStyle = pal.rockShadow;
  ctx.beginPath();
  ctx.moveTo(o.x, DINO_FOOT_Y);
  ctx.lineTo(o.x + o.w * 0.2, top + o.h * 0.35);
  ctx.lineTo(o.x + o.w * 0.55, top);
  ctx.lineTo(o.x + o.w, top + o.h * 0.25);
  ctx.lineTo(o.x + o.w, DINO_FOOT_Y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.rock;
  ctx.beginPath();
  ctx.moveTo(o.x + 4, DINO_FOOT_Y);
  ctx.lineTo(o.x + o.w * 0.25, top + o.h * 0.4);
  ctx.lineTo(o.x + o.w * 0.5, top + 4);
  ctx.lineTo(o.x + o.w - 6, top + o.h * 0.3);
  ctx.lineTo(o.x + o.w - 4, DINO_FOOT_Y);
  ctx.closePath();
  ctx.fill();
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  now: number,
  cssW: number,
  cssH: number,
  themeId: GameThemeId
): void {
  const scale = Math.min(cssW / GAME_W, cssH / GAME_H);
  const ox = (cssW - GAME_W * scale) / 2;
  const oy = (cssH - GAME_H * scale) / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  let sx = 0;
  let sy = 0;
  if (s.shakeUntil && now < s.shakeUntil) {
    const t = (s.shakeUntil - now) / 420;
    sx = (Math.random() - 0.5) * 10 * t;
    sy = (Math.random() - 0.5) * 6 * t;
  }

  ctx.translate(ox + sx, oy + sy);
  ctx.scale(scale, scale);

  const night = Boolean(s.nightUntil && now < s.nightUntil);
  const pal = paletteForTheme(themeId, night);
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, pal.skyTop);
  g.addColorStop(1, pal.skyBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, GAME_W, GROUND_Y);

  ctx.fillStyle = pal.cloud;
  for (const c of s.clouds) {
    ctx.fillRect(c.x, c.y, c.w, c.h);
  }

  ctx.fillStyle = pal.ground;
  ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
  ctx.strokeStyle = pal.groundStripe;
  ctx.lineWidth = 2;
  for (let x = -((now * 0.05) % 40); x < GAME_W + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 6);
    ctx.lineTo(x + 18, GROUND_Y + 22);
    ctx.stroke();
  }

  for (const p of s.pickups) {
    if (p.collected) continue;
    const cy = DINO_FOOT_Y - 16;
    ctx.fillStyle = pal.coin;
    ctx.beginPath();
    ctx.arc(p.x, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.coinShine;
    ctx.beginPath();
    ctx.arc(p.x - 3, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const o of s.obstacles) {
    if (o.kind === "rock") drawRock(ctx, o, pal);
    else drawCactus(ctx, o, pal);
  }

  const spriteScale = Math.min(DINO_W / 22, DINO_H / 26);
  const spriteH = 26 * spriteScale;
  const dinoDrawY = DINO_FOOT_Y - spriteH;
  drawDinoSprite(ctx, DINO_X, dinoDrawY, spriteScale, pal, s.dino.grounded, now);

  for (const p of s.particles) {
    ctx.globalAlpha = Math.max(0, p.life * 2.5);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = pal.text;
  ctx.font = "bold 20px ui-monospace, monospace";
  const scoreTxt = `SCORE ${Math.floor(s.score).toString().padStart(5, "0")}`;
  ctx.fillText(scoreTxt, GAME_W - 200, 28);
  ctx.font = "14px ui-monospace, monospace";
  const hi = Math.max(s.highScore, Math.floor(s.score));
  ctx.fillText(`HI ${hi.toString().padStart(5, "0")}`, GAME_W - 200, 48);

  if (s.floatText) {
    ctx.font = "bold 16px ui-monospace, monospace";
    ctx.fillStyle = pal.accent;
    ctx.fillText(s.floatText, GAME_W / 2 - 60, 78);
  }

  ctx.restore();
}

export function countdownOverlayLabel(s: GameState, now: number): string | null {
  if (s.phase !== "countdown") return null;
  if (now >= s.countdownStepEndsAt) return null;
  const labels = ["3", "2", "1", "GO"];
  return labels[s.countdownStep] ?? "3";
}
