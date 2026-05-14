# Neon Snake

A **Next.js** snake game with a modern dark UI, canvas rendering, and **browser-only persistence** via `localStorage`. Built with the App Router, **TypeScript**, **Tailwind CSS v4**, and the **Geist** font family.

## Location in this repo

This app lives in the **`snake`** folder next to other examples under `lomuko-examples`:

```text
lomuko-examples/
  snake/          ← this project
  ...
```

If your editor or terminal is open in a **sibling** folder (for example another sample under `lomuko-examples`), open the project as **`../snake`** or run:

```bash
cd ../snake
```

before `npm install` / `npm run dev`.

## Prerequisites

- **Node.js** 18.18+ (or the version required by your installed Next.js release)
- **npm** (or pnpm / yarn if you adapt the commands)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — use port **3000** unless your terminal shows a different one.

Other scripts:

| Command        | Description                 |
| -------------- | --------------------------- |
| `npm run dev`  | Development server          |
| `npm run build` | Production build           |
| `npm run start` | Run the production server |
| `npm run lint`  | ESLint                      |

## How to play

- **Move:** arrow keys or **W A S D**
- **Start:** **Play**, or press a movement key from the title screen
- **Countdown:** each round begins with **3 · 2 · 1 · GO** so you can put your hands on the keyboard before the snake moves
- **Pause / resume:** **Space** or **P** (only after **GO**, not during the countdown)
- **After game over:** **R** restarts once you are past the optional name step

While the **display name** field is focused (top-10 flow), movement keys are **not** captured globally so you can type names that use **W A S D** letters. **Enter** saves the score with the current name.

## Features

### Themes (3)

Visual palette for the board, snake, food, and eat flash:

| Theme    | Vibe                          |
| -------- | ----------------------------- |
| **Neon** | Cyan / pink on deep blue      |
| **Aurora** | Emerald / gold on deep green |
| **Ember** | Rose / violet on warm dark   |

### Board sizes (3)

Different grid dimensions and cell sizes (total canvas size changes):

| Size       | Grid   | Notes              |
| ---------- | ------ | ------------------ |
| **Compact** | 14×14 | Larger cells       |
| **Classic** | 18×18 | Balanced default   |
| **Arena**   | 22×22 | Bigger playfield   |

### Speed

**Chill**, **Normal**, and **Rush** change the tick rate.

### Portal walls

Optional **wrap** mode: leaving one edge enters the opposite side. **Self-collision** still ends the run.

### Scoring and records

- **Score** grows by **1** per food eaten (starting length is accounted for).
- **Best** reflects the highest score stored locally (see storage keys below).

### Hall of fame (top 10)

Up to **10** runs are kept locally, sorted by **score** (ties favor **newer** dates). Each entry stores:

- **Name** (you can skip and save as **Anonymous**)
- **Score**
- **ISO date** (shown in a short local format in the list)
- **Board size** used for that run

If your score would make the **top 10** and is **greater than zero**, the game-over overlay asks for a name before you continue. **Skip** still records the run as **Anonymous**.

A one-time migration may create a single **“Migrated best”** row if an older solo high score existed before the leaderboard was introduced.

## localStorage keys

All data stays on **this browser** and origin; clearing site data removes it.

| Key                         | Purpose |
| --------------------------- | ------- |
| `neon-snake-settings`       | JSON: `wrap`, `difficulty`, `theme`, `boardSize` |
| `neon-snake-leaderboard-v2` | JSON array: up to 10 `{ id, name, score, date, boardSize }` |
| `neon-snake-high-score`     | Numeric best score (kept in sync with the leaderboard and in-run highs; useful for older flows) |

## Project layout (high level)

- `app/` — App Router layout, home page, global styles
- `components/snake-game.tsx` — Game logic, canvas drawing, UI, and persistence

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)

