import { SIZE } from './constants';
import type { Tile, Direction, SavedGame } from './types'; // ✅ 补全 SavedGame 导入

// ✅ 修复 ID 冲突：使用随机字符串，即使刷新页面也不会重复
const genId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const createTile = (row: number, col: number, value: number): Tile => ({
  id: genId(),
  value,
  row,
  col,
  isNew: true,
});

export const createInitialGame = (): SavedGame => {
  const tiles = [createTile(0, 0, 2), createTile(0, 1, 2)];
  return { tiles, score: 0, best: 0 };
};

export const addRandomTile = (tiles: Tile[]) => {
  const occupied = new Set(tiles.filter(t => !t.isRemoved).map(t => `${t.row}-${t.col}`));
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!occupied.has(`${r}-${c}`)) empties.push([r, c]);
    }
  }
  if (!empties.length) return;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  tiles.push(createTile(r, c, Math.random() < 0.9 ? 2 : 4));
};

export const canMove = (tiles: Tile[]) => {
  const active = tiles.filter(t => !t.isRemoved);
  if (active.length < SIZE * SIZE) return true;
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  active.forEach(t => { grid[t.row][t.col] = t; });
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = grid[r][c];
      if (c + 1 < SIZE && t?.value === grid[r][c + 1]?.value) return true;
      if (r + 1 < SIZE && t?.value === grid[r + 1][c]?.value) return true;
    }
  }
  return false;
};

export const computeMove = (oldTiles: Tile[], dir: Direction) => {
  const activeTiles = oldTiles.filter(t => !t.isRemoved).map(t => ({ ...t, isNew: false, isMerged: false }));
  const grid: (Tile | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  activeTiles.forEach(t => { grid[t.row][t.col] = t; });

  let gained = 0;
  let moved = false;
  const toRemove: Tile[] = [];

  const processLine = (lineTiles: (Tile | null)[]) => {
    const items = lineTiles.filter((t): t is Tile => t !== null);
    const result: Tile[] = [];

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      const next = items[i + 1];

      if (next && current.value === next.value) {
        const mergedValue = current.value * 2;
        gained += mergedValue;
        
        current.value = mergedValue;
        current.isMerged = true;
        result.push(current);

        next.row = current.row;
        next.col = current.col;
        next.isRemoved = true;
        toRemove.push(next);
        
        i++; 
        moved = true;
      } else {
        result.push(current);
      }
    }
    while (result.length < SIZE) result.push(null as any);
    return result;
  };

  const applyProcess = (r: number, c: number, t: Tile | null) => {
    if (t) {
      if (t.row !== r || t.col !== c) moved = true;
      t.row = r;
      t.col = c;
      grid[r][c] = t;
    } else {
      if (grid[r][c] !== null) moved = true;
      grid[r][c] = null;
    }
  };

  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < SIZE; r++) {
      let row = grid[r];
      if (dir === 'right') row = row.slice().reverse();
      const processed = processLine(row);
      if (dir === 'right') processed.reverse();
      for (let c = 0; c < SIZE; c++) applyProcess(r, c, processed[c]);
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      let col = grid.map(row => row[c]);
      if (dir === 'down') col = col.slice().reverse();
      const processed = processLine(col);
      if (dir === 'down') processed.reverse();
      for (let r = 0; r < SIZE; r++) applyProcess(r, c, processed[r]);
    }
  }

  const allTiles: Tile[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c]) allTiles.push(grid[r][c]!);
    }
  }
  allTiles.push(...toRemove);

  return { allTiles, gained, moved };
};