export type GameThemeId = "neon" | "sunset" | "jade";

export const THEME_STORAGE_KEY = "dino-theme";
export const DEFAULT_THEME: GameThemeId = "neon";

export interface GameTheme {
  id: GameThemeId;
  label: string;
  skyTop: string;
  skyBot: string;
  ground: string;
  groundStripe: string;
  cloud: string;
  text: string;
  accent: string;
  cactus: string;
  cactusHighlight: string;
  rock: string;
  rockShadow: string;
  coin: string;
  coinShine: string;
  dinoBody: string;
  dinoBelly: string;
  dinoEye: string;
  dinoOutline: string;
  night: {
    skyTop: string;
    skyBot: string;
    ground: string;
    groundStripe: string;
    cloud: string;
    text: string;
  };
}

export const GAME_THEMES: Record<GameThemeId, GameTheme> = {
  neon: {
    id: "neon",
    label: "Neon",
    skyTop: "#0c0a1f",
    skyBot: "#1a1040",
    ground: "#2d1b4e",
    groundStripe: "#7c3aed",
    cloud: "#4c1d95",
    text: "#e9d5ff",
    accent: "#22d3ee",
    cactus: "#34d399",
    cactusHighlight: "#6ee7b7",
    rock: "#64748b",
    rockShadow: "#475569",
    coin: "#fbbf24",
    coinShine: "#fef08a",
    dinoBody: "#a78bfa",
    dinoBelly: "#c4b5fd",
    dinoEye: "#22d3ee",
    dinoOutline: "#5b21b6",
    night: {
      skyTop: "#020617",
      skyBot: "#0f172a",
      ground: "#1e1b4b",
      groundStripe: "#06b6d4",
      cloud: "#312e81",
      text: "#cffafe",
    },
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    skyTop: "#fff1e6",
    skyBot: "#fecdd3",
    ground: "#fdba74",
    groundStripe: "#fb923c",
    cloud: "#fda4af",
    text: "#7c2d12",
    accent: "#ea580c",
    cactus: "#15803d",
    cactusHighlight: "#4ade80",
    rock: "#a8a29e",
    rockShadow: "#78716c",
    coin: "#facc15",
    coinShine: "#fef9c3",
    dinoBody: "#f97316",
    dinoBelly: "#fdba74",
    dinoEye: "#1c1917",
    dinoOutline: "#9a3412",
    night: {
      skyTop: "#312e81",
      skyBot: "#4c1d95",
      ground: "#7c2d12",
      groundStripe: "#f97316",
      cloud: "#6b21a8",
      text: "#fde68a",
    },
  },
  jade: {
    id: "jade",
    label: "Jade",
    skyTop: "#ecfdf5",
    skyBot: "#ccfbf1",
    ground: "#5eead4",
    groundStripe: "#14b8a6",
    cloud: "#99f6e4",
    text: "#134e4a",
    accent: "#0d9488",
    cactus: "#047857",
    cactusHighlight: "#34d399",
    rock: "#94a3b8",
    rockShadow: "#64748b",
    coin: "#eab308",
    coinShine: "#fef08a",
    dinoBody: "#0f766e",
    dinoBelly: "#5eead4",
    dinoEye: "#f0fdfa",
    dinoOutline: "#115e59",
    night: {
      skyTop: "#042f2e",
      skyBot: "#134e4a",
      ground: "#0f766e",
      groundStripe: "#2dd4bf",
      cloud: "#115e59",
      text: "#ccfbf1",
    },
  },
};

export const THEME_LIST: GameThemeId[] = ["neon", "sunset", "jade"];

export function loadStoredTheme(): GameThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (v && v in GAME_THEMES) return v as GameThemeId;
  return DEFAULT_THEME;
}

export function saveTheme(id: GameThemeId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* ignore quota / private mode */
  }
}

export interface RenderPalette {
  skyTop: string;
  skyBot: string;
  ground: string;
  groundStripe: string;
  cloud: string;
  text: string;
  accent: string;
  cactus: string;
  cactusHighlight: string;
  rock: string;
  rockShadow: string;
  coin: string;
  coinShine: string;
  dinoBody: string;
  dinoBelly: string;
  dinoEye: string;
  dinoOutline: string;
}

export function paletteForTheme(themeId: GameThemeId, night: boolean): RenderPalette {
  const t = GAME_THEMES[themeId];
  if (!night) {
    return {
      skyTop: t.skyTop,
      skyBot: t.skyBot,
      ground: t.ground,
      groundStripe: t.groundStripe,
      cloud: t.cloud,
      text: t.text,
      accent: t.accent,
      cactus: t.cactus,
      cactusHighlight: t.cactusHighlight,
      rock: t.rock,
      rockShadow: t.rockShadow,
      coin: t.coin,
      coinShine: t.coinShine,
      dinoBody: t.dinoBody,
      dinoBelly: t.dinoBelly,
      dinoEye: t.dinoEye,
      dinoOutline: t.dinoOutline,
    };
  }
  const n = t.night;
  return {
    skyTop: n.skyTop,
    skyBot: n.skyBot,
    ground: n.ground,
    groundStripe: n.groundStripe,
    cloud: n.cloud,
    text: n.text,
    accent: t.accent,
    cactus: t.cactusHighlight,
    cactusHighlight: t.cactus,
    rock: t.rockShadow,
    rockShadow: t.rock,
    coin: t.coin,
    coinShine: t.coinShine,
    dinoBody: t.dinoBelly,
    dinoBelly: t.dinoBody,
    dinoEye: t.dinoEye,
    dinoOutline: t.dinoOutline,
  };
}
