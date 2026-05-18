import type { RenderPalette } from "./themes";

/** 
 * Rejilla de 22×26 píxeles:
 * . transparente, O silueta, B cuerpo, Y vientre, E ojo, T dientes
 */
const DINO_IDLE: string[] = [
  "......................",
  ".......OOOOOOOO.......",
  ".......OEEEEBBOO......",
  ".......OEEEEBBBBO.....",
  ".......OBBBBBBBBO.....",
  ".......OBBBBBBOOO.....",
  ".......OBBBBBBO.......",
  ".......OBBBBBBO.......",
  "......OOBBBBBBO.......",
  "....OOOBBBBBBBOOO.....",
  "...OOBBBBBBBBBBBBO....",
  "..OOBBBBBBBBBBBBBO....",
  ".OOBBBBYYBBBBBBBO.....",
  ".OBBBBBYYBBBBBBB      ", // Espacio para el bracito
  ".OBBBBBBBBBBBBBB..... ",
  "..OOBBBBBBBBBBBO......",
  "....OOBBBBBBBBO.......",
  "......OOOOOOOBO.......",
  "............OBO.......",
  "............OBO.......",
  "............OBOOO.....",
  "............OBO.O.....",
  "............OO..O.....",
  "............OO..O.....",
  "...........OOO.OOO....",
  "......................",
];

// Animación de carrera A: Pata izquierda levantada, derecha apoyada
const DINO_RUN_A: string[] = [
  "......................",
  ".......OOOOOOOO.......",
  ".......OEEEEBBOO......",
  ".......OEEEEBBBBO.....",
  ".......OBBBBBBBBO.....",
  ".......OBBBBBBOOO.....",
  ".......OBBBBBBO.......",
  ".......OBBBBBBO.......",
  "......OOBBBBBBO.......",
  "....OOOBBBBBBBOOO.....",
  "...OOBBBBBBBBBBBBO....",
  "..OOBBBBBBBBBBBOOO....",
  ".OOBBBBYYBBBBBBO..O...",
  ".OBBBBBYYBBBBBBO..OO..",
  ".OBBBBBBBBBBBBBO...O..",
  "..OOBBBBBBBBBBBO......",
  "....OOBBBBBBBBO.......",
  "......OOOOOOOBO.......",
  "............OBO.......",
  "............OOO.......",
  "............OBO.......",
  "............OBO.OO....",
  "............OO..OO....",
  "...........OO.........",
  "..........OOO.........",
  "......................",
];

// Animación de carrera B: Pata derecha levantada, izquierda apoyada
const DINO_RUN_B: string[] = [
  "......................",
  ".......OOOOOOOO.......",
  ".......OEEEEBBOO......",
  ".......OEEEEBBBBO.....",
  ".......OBBBBBBBBO.....",
  ".......OBBBBBBOOO.....",
  ".......OBBBBBBO.......",
  ".......OBBBBBBO.......",
  "......OOBBBBBBO.......",
  "....OOOBBBBBBBOOO.....",
  "...OOBBBBBBBBBBBBO....",
  "..OOBBBBBBBBBBBOOO....",
  ".OOBBBBYYBBBBBBO..O...",
  ".OBBBBBYYBBBBBBO..OO..",
  ".OBBBBBBBBBBBBBO...O..",
  "..OOBBBBBBBBBBBO......",
  "....OOBBBBBBBBO.......",
  "......OOOOOOOBO.......",
  "............OBO.......",
  "............OBO.......",
  "............OOO.......",
  "..............OOO.....",
  "...............OO.....",
  "...............OO.....",
  "..............OOO.....",
  "......................",
];

function pickSprite(grounded: boolean, now: number): string[] {
  if (!grounded) return DINO_IDLE;
  // Cambia de frame cada 120ms para que la animación sea fluida
  const frame = Math.floor(now / 120) % 2;
  return frame === 0 ? DINO_RUN_A : DINO_RUN_B;
}

export function drawDinoSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  pal: RenderPalette,
  grounded: boolean,
  now: number
): void {
  const grid = pickSprite(grounded, now);
  const px = scale;
  const colorMap: Record<string, string | null> = {
    ".": null,
    " ": null, // Por si acaso dejé algún espacio en blanco
    O: pal.dinoOutline,
    B: pal.dinoBody,
    Y: pal.dinoBelly,
    E: pal.dinoEye,
    T: "#fafafa", // Dientes
  };

  for (let row = 0; row < grid.length; row++) {
    const line = grid[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const fill = colorMap[ch];
      if (!fill) continue;
      ctx.fillStyle = fill;
      ctx.fillRect(x + col * px, y + row * px, px, px);
    }
  }
}