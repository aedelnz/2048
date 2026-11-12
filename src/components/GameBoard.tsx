import AnimatedTile from './AnimatedTile';
import { GLASS_STYLE, SIZE } from '../constants';
import type { Layout, Tile } from '../types';

interface Props {
  tiles: Tile[];
  layout: Layout;
  cellSize: number;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export default function GameBoard({ tiles, layout, cellSize, onTouchStart, onTouchEnd }: Props) {
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'relative',
        width: layout.size,
        height: layout.size,
        borderRadius: 'var(--semi-border-radius-large)',
        ...GLASS_STYLE,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: layout.boardPad,
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${SIZE}, 1fr)`,
          gap: layout.gap,
        }}
      >
        {Array.from({ length: SIZE * SIZE }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--semi-color-fill-0)',
              borderRadius: 'var(--semi-border-radius-medium)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06), inset 0 -1px 0 var(--semi-color-bg-0)',
              border: '1px solid var(--semi-color-border)',
            }}
          />
        ))}
      </div>

      {tiles.map((tile) => (
        <AnimatedTile
          key={tile.id}
          tile={tile}
          cellSize={cellSize}
          gap={layout.gap}
          boardPad={layout.boardPad}
        />
      ))}
    </div>
  );
}