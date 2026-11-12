export type Direction = 'up' | 'down' | 'left' | 'right';
export type ScoreSize = 'sm' | 'md';

export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
  isRemoved?: boolean;
}

export interface SavedGame {
  tiles: Tile[];
  score: number;
  best: number;
}

export interface Layout {
  size: number;
  horizontal: boolean;
  sideWidth: number;
  outerPad: number;
  boardPad: number;
  gap: number;
  showHint: boolean;
  scoreSize: ScoreSize;
}