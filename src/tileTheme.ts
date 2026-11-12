export const TILE_THEME: Record<number, { bg: string; fg: string }> = {
  0:    { bg: 'transparent',                          fg: 'transparent' },
  2:    { bg: 'rgba(var(--semi-light-blue-5), 1)',             fg: 'var(--semi-color-white)' },
  4:    { bg: 'rgba(var(--semi-blue-4), 1)', fg: 'var(--semi-color-white)' },
  8:    { bg: 'rgba(var(--semi-blue-5), 1)',  fg: 'var(--semi-color-white)' },
  16:   { bg: 'rgba(var(--semi-cyan-5), 1)',       fg: 'var(--semi-color-white)' },
  32:   { bg: 'rgba(var(--semi-cyan-6), 1)',             fg: 'var(--semi-color-white)' },
  64:   { bg: 'rgba(var(--semi-teal-6), 1)', fg: 'var(--semi-color-white)' },
  128:  { bg: 'rgba(var(--semi-green-6), 1)',       fg: 'var(--semi-color-white)' },
  256:  { bg: 'rgba(var(--semi-light-green-6), 1)',             fg: 'var(--semi-color-white)' },
  512:  { bg: 'rgba(var(--semi-orange-6), 1)',       fg: 'var(--semi-color-white)' },
  1024: { bg: 'rgba(var(--semi-red-5), 1)',             fg: 'var(--semi-color-white)' },
  2048: { bg: 'var(--semi-ai-general-5)',              fg: 'var(--semi-color-white)' },
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