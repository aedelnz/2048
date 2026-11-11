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

  // 计算绝对定位位置
  const x = boardPad + col * (cellSize + gap);
  const y = boardPad + row * (cellSize + gap);

  return (
    <div
      style={{
        position: 'absolute',
        // 使用 translate3d 触发 GPU 硬件加速，滑动更流畅
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: cellSize,
        height: cellSize,
        // 采用 cubic-bezier 让滑动带有轻微的减速手感，时长 120ms
        transition: 'transform 120ms cubic-bezier(0.2, 0, 0.2, 1)',
        willChange: 'transform',
        // 合并的块层级升高，被吃掉的块层级降低
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
          boxShadow: 'inset 0 1px 1px rgba(255,255,255, 0.8)',
          
          // 动画编排：
          // pop 延迟 120ms 播放（等滑动结束），使用 both 保持初始状态
          // appear 无需延迟，因为它是 130ms 后才由 React 挂载进 DOM 的
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