export type Direction = 'up' | 'down' | 'left' | 'right';

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