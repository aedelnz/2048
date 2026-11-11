import { TILE_DARK, TILE_THEME, tileFontSize } from './tileTheme';
import type { Tile } from './types';

interface Props {
  tile: Tile;
  cellSize: number;
  gap: number;
  boardPad: number;
}

export default function AnimatedTile({ tile, cellSize, gap, boardPad }: Props) {
  const { row, col, value, isNew, isMerged, isRemoved } = tile;
  const theme = TILE_THEME[value] ?? TILE_DARK;

  const x = boardPad + col * (cellSize + gap);
  const y = boardPad + row * (cellSize + gap);

  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: cellSize,
        height: cellSize,
        transition: 'transform 120ms cubic-bezier(0.2, 0, 0.2, 1)',
        willChange: 'transform',
        zIndex: isMerged ? 3 : isRemoved ? 1 : 2,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: theme.bg,
          color: theme.fg,
          fontWeight: 700,
          fontSize: tileFontSize(value, cellSize),
          lineHeight: 1,
          // ✅ 使用 Semi 的白色变量来制作内发光边缘
          boxShadow: 'inset 0 1px 1px color-mix(in srgb, var(--semi-color-bg-0) 80%, transparent)',
          animation: isMerged 
            ? 'pop 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 120ms both' 
            : isNew 
            ? 'appear 200ms ease-out both' 
            : 'none',
        }}
      >
        {value}
      </div>
    </div>
  );
}