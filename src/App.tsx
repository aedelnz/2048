import { useEffect } from 'react';
import { Typography } from '@douyinfe/semi-ui';
import { useBreakpoint } from './hook/useBreakpoint';
import { useFullscreen } from './hook/useFullscreen';
import { useGameLogic } from './hook/useGameLogic';
import { useBoardLayout } from './hook/useBoardLayout';
import { useSwipeControls } from './hook/useSwipeControls';
import GameHeader from './components/GameHeader';
import GameBoard from './components/GameBoard';
import GameOverModal from './components/GameOverModal';
import { BG, SIZE } from './constants';
import './App.css';

const { Text } = Typography;

export default function App() {
  const { width, height, isMobile, isTablet } = useBreakpoint();
  const {
    ref: fsRef,
    isFullscreen,
    toggle: toggleFullscreen,
    exit: exitFullscreen,
  } = useFullscreen<HTMLDivElement>({ background: 'transparent' });

  const { tiles, score, best, gameOver, applyMove, reset } = useGameLogic();
  const layout = useBoardLayout({ width, height, isMobile, isTablet, isFullscreen });
  const { onTouchStart, onTouchEnd } = useSwipeControls(applyMove);

  const cellSize = Math.max(
    0,
    (layout.size - layout.boardPad * 2 - layout.gap * (SIZE - 1)) / SIZE,
  );

  useEffect(() => {
    if (gameOver && isFullscreen) exitFullscreen();
  }, [gameOver, isFullscreen, exitFullscreen]);

  return (
    <>
      <div
        ref={fsRef}
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: layout.horizontal || !isMobile ? 'center' : 'flex-start',
          padding: layout.outerPad,
          paddingTop: layout.horizontal || !isMobile ? layout.outerPad : 48,
          background: BG,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: layout.horizontal ? 'row' : 'column',
            alignItems: layout.horizontal ? 'stretch' : 'center',
            gap: layout.horizontal ? 20 : 16,
            width: layout.horizontal ? undefined : layout.size,
            maxWidth: '100%',
          }}
        >
          <GameHeader
            layout={layout}
            isMobile={isMobile}
            isFullscreen={isFullscreen}
            score={score}
            best={best}
            onReset={reset}
            onToggleFullscreen={toggleFullscreen}
          />

          <GameBoard
            tiles={tiles}
            layout={layout}
            cellSize={cellSize}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          />

          {!layout.horizontal && layout.showHint && (
            <Text style={{ color: 'var(--semi-color-text-2)', fontSize: 13, fontWeight: 500 }}>
              {isMobile ? '滑动屏幕移动方块' : '方向键 / WASD 移动'}
            </Text>
          )}
        </div>
      </div>

      <GameOverModal visible={gameOver} score={score} best={best} onRestart={reset} />
    </>
  );
}