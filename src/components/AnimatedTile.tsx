import { memo } from 'react';
import { TILE_DARK, TILE_THEME, tileFontSize } from '../tileTheme';
import type { Tile } from '../types';

interface Props {
  tile: Tile;
  cellSize: number;
  gap: number;
  boardPad: number;
}

function AnimatedTile({ tile, cellSize, gap, boardPad }: Props) {
  const { row, col, value, isNew, isMerged, isRemoved } = tile;
  const theme = TILE_THEME[value] ?? TILE_DARK;

  const x = boardPad + col * (cellSize + gap);
  const y = boardPad + row * (cellSize + gap);

  const animation = isMerged
    ? 'pop 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 120ms both'
    : isNew
      ? 'appear 200ms ease-out both'
      : 'none';

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
          borderRadius: 'var(--semi-border-radius-medium)',
          background: theme.bg,
          color: theme.fg,
          fontWeight: 700,
          fontSize: tileFontSize(value, cellSize),
          lineHeight: 1,
          boxShadow:
            'inset 0px -1px 2px color-mix(in srgb, var(--semi-color-bg-0) 80%, transparent)',
          animation,
          border: '1px solid var(--semi-color-border)',
          
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default memo(AnimatedTile);