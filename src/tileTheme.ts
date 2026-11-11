export const TILE_THEME: Record<number, { bg: string; fg: string }> = {
  0:    { bg: 'transparent',                fg: 'transparent' },
  2:    { bg: 'var(--semi-color-bg-2)',     fg: 'var(--semi-color-text-0)' },
  4:    { bg: 'var(--semi-color-primary-light-default)', fg: 'var(--semi-color-text-0)' },
  8:    { bg: 'var(--semi-color-primary-light-active)',  fg: 'var(--semi-color-text-0)' },
  16:   { bg: 'var(--semi-color-primary-hover)', fg: 'var(--semi-color-white)' },
  32:   { bg: 'var(--semi-color-primary)',       fg: 'var(--semi-color-white)' },
  64:   { bg: 'var(--semi-color-success-light-default)', fg: 'var(--semi-color-white)' },
  128:  { bg: 'var(--semi-color-success-hover)', fg: 'var(--semi-color-white)' },
  256:  { bg: 'var(--semi-color-success)',       fg: 'var(--semi-color-white)' },
  512:  { bg: 'var(--semi-color-warning-hover)', fg: 'var(--semi-color-white)' },
  1024: { bg: 'var(--semi-color-warning)',       fg: 'var(--semi-color-white)' },
  2048: { bg: 'var(--semi-color-danger)',        fg: 'var(--semi-color-white)' },
};

export const TILE_DARK = {
  bg: 'var(--semi-color-danger)',
  fg: 'var(--semi-color-white)',
};

export const tileFontSize = (value: number, cellSize: number): number => {
  const len = String(value).length;
  const factor = len <= 1 ? 0.46 : len === 2 ? 0.42 : len === 3 ? 0.34 : 0.28;
  return Math.max(12, Math.round(cellSize * factor));
};