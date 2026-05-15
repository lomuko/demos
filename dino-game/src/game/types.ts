export type GamePhase = "boot" | "countdown" | "running" | "gameover";

export type ObstacleKind = "cactus" | "cactusTall" | "rock";

export interface Obstacle {
  x: number;
  kind: ObstacleKind;
  w: number;
  h: number;
  nearMissAwarded: boolean;
  cleared: boolean;
}

export interface Pickup {
  x: number;
  collected: boolean;
}

export interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface DinoState {
  y: number;
  vy: number;
  grounded: boolean;
}

export interface GameState {
  phase: GamePhase;
  /** Index in [3,2,1,GO] sequence */
  countdownStep: number;
  countdownStepEndsAt: number;
  reducedMotion: boolean;
  dino: DinoState;
  obstacles: Obstacle[];
  pickups: Pickup[];
  clouds: Cloud[];
  particles: Particle[];
  score: number;
  highScore: number;
  speed: number;
  nextSpawnIn: number;
  nightUntil: number;
  shakeUntil: number;
  floatText: string;
  floatTextUntil: number;
  combo: number;
  lastFrameMs: number;
  runningStartedAt: number;
  /** Set on game over when this run beat the stored best */
  wasNewRecord: boolean;
}
