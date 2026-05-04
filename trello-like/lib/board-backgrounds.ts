export const BOARD_BACKGROUND_PATTERNS = [
  {
    id: "none",
    name: "None",
    backgroundImage: "none",
    backgroundSize: "auto",
  },
  {
    id: "dots",
    name: "Dots",
    backgroundImage: "radial-gradient(circle, rgba(31, 41, 55, 0.22) 1px, transparent 1px)",
    backgroundSize: "18px 18px",
  },
  {
    id: "grid",
    name: "Grid",
    backgroundImage: "linear-gradient(rgba(31, 41, 55, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(31, 41, 55, 0.14) 1px, transparent 1px)",
    backgroundSize: "22px 22px",
  },
  {
    id: "stripes",
    name: "Stripes",
    backgroundImage: "linear-gradient(135deg, rgba(37, 99, 235, 0.16) 25%, transparent 25%, transparent 50%, rgba(37, 99, 235, 0.16) 50%, rgba(37, 99, 235, 0.16) 75%, transparent 75%, transparent)",
    backgroundSize: "24px 24px",
  },
  {
    id: "diagonal",
    name: "Diagonal",
    backgroundImage: "linear-gradient(45deg, rgba(17, 24, 39, 0.12) 12.5%, transparent 12.5%, transparent 50%, rgba(17, 24, 39, 0.12) 50%, rgba(17, 24, 39, 0.12) 62.5%, transparent 62.5%, transparent)",
    backgroundSize: "18px 18px",
  },
  {
    id: "crosshatch",
    name: "Crosshatch",
    backgroundImage: "linear-gradient(45deg, rgba(16, 185, 129, 0.13) 25%, transparent 25%), linear-gradient(-45deg, rgba(16, 185, 129, 0.13) 25%, transparent 25%)",
    backgroundSize: "20px 20px",
  },
] as const;

export type BoardBackgroundPattern = typeof BOARD_BACKGROUND_PATTERNS[number]["id"];

export function isBoardBackgroundPattern(value: string): value is BoardBackgroundPattern {
  return BOARD_BACKGROUND_PATTERNS.some((pattern) => pattern.id === value);
}

export function getBoardBackgroundPattern(patternId?: string | null) {
  return BOARD_BACKGROUND_PATTERNS.find((pattern) => pattern.id === patternId) || BOARD_BACKGROUND_PATTERNS[0];
}
