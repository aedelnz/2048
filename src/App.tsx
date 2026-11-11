import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Modal, Typography } from '@douyinfe/semi-ui';
import { IconExpand } from '@douyinfe/semi-icons';
import { useBreakpoint } from './hook/useBreakpoint';
import { useLocalStorage } from './hook/useLocalStorage';
import { useFullscreen } from './hook/useFullscreen';
import AnimatedTile from './AnimatedTile';
import { GLASS_STYLE, SIZE, STORAGE_KEY, BG } from './constants';
import { computeMove, canMove, createInitialGame, addRandomTile } from './game';
import type { SavedGame, Direction } from './types';
import './App.css';

const { Title, Text } = Typography;

function ScoreBox({ label, value, size }: { label: string; value: number; size: 'sm' | 'md' }) {
  const small = size === 'sm';
  return (
    <div style={{ ...GLASS_STYLE, borderRadius: 10, padding: small ? '4px 12px' : '6px 16px', minWidth: small ? 64 : 80, textAlign: 'center', flexShrink: 0 }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--semi-color-text-2)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: small ? 18 : 22, fontWeight: 700, color: 'var(--semi-color-text-0)', lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

export default function App() {
  const { width, height, isMobile, isTablet } = useBreakpoint();
  const { ref: fsRef, isFullscreen, toggle: toggleFullscreen, exit: exitFullscreen } = useFullscreen<HTMLDivElement>({ background: 'transparent' });

  const initialGame = useMemo<SavedGame>(() => createInitialGame(), []);
  const [game, setGame] = useLocalStorage<SavedGame>(STORAGE_KEY, initialGame);

  const tiles = game?.tiles || initialGame.tiles;
  const score = Number.isFinite(game?.score) ? game.score : 0;
  const best = Math.max(Number.isFinite(game?.best) ? game.best : 0, score);
  const gameOver = useMemo(() => !canMove(tiles), [tiles]);

  const stateRef = useRef({ tiles, score, best, gameOver });
  useEffect(() => { stateRef.current = { tiles, score, best, gameOver }; }, [tiles, score, best, gameOver]);

  const setGameRef = useRef(setGame);
  useEffect(() => { setGameRef.current = setGame; }, [setGame]);

  const isAnimatingRef = useRef(false);

  const applyMove = useCallback((dir: Direction) => {
    if (isAnimatingRef.current) return;
    const { tiles: currentTiles, score: curScore, best: curBest, gameOver: over } = stateRef.current;
    if (over) return;

    const { allTiles, gained, moved } = computeMove(currentTiles, dir);
    if (!moved) return;

    isAnimatingRef.current = true;
    const nextScore = curScore + gained;
    const nextBest = Math.max(curBest, nextScore);

    // 阶段 1：触发滑动动画
    setGameRef.current({ tiles: allTiles, score: nextScore, best: nextBest });

    // 阶段 2：130ms 后，直接基于 allTiles 计算最终状态，不依赖 prev
    setTimeout(() => {
      // 提取存活方块并重置动画状态
      const aliveTiles = allTiles
        .filter(t => !t.isRemoved)
        .map(t => ({ ...t, isNew: false, isMerged: false }));
      
      // 生成新方块
      addRandomTile(aliveTiles);

      // ✅ 直接传入完整对象，彻底避免闭包覆盖 Bug
      setGameRef.current({
        tiles: aliveTiles,
        score: nextScore,
        best: nextBest
      });
      
      isAnimatingRef.current = false;
    }, 130);
  }, []);

  const reset = useCallback(() => {
    isAnimatingRef.current = false;
    setGameRef.current({ ...createInitialGame(), best: stateRef.current.best });
  }, []);

  useEffect(() => {
    const KEY_MAP: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
    const onKeyDown = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key] ?? KEY_MAP[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      applyMove(dir);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applyMove]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) applyMove(dx > 0 ? 'right' : 'left');
    else applyMove(dy > 0 ? 'down' : 'up');
  };

  useEffect(() => {
    if (gameOver && isFullscreen) exitFullscreen();
  }, [gameOver, isFullscreen, exitFullscreen]);

  const isLandscape = width > height;
  const layout = useMemo(() => {
    const outerPad = isMobile ? 16 : 24;
    const gap = 16;
    const availW = Math.max(0, width - outerPad * 2);
    const availH = Math.max(0, height - outerPad * 2);

    if (!width || !height) return { size: 320, horizontal: false, sideWidth: 0, outerPad, boardPad: 8, gap: 6, showHint: false, scoreSize: 'md' as 'sm' | 'md' };

    const sideWidth = isMobile ? 150 : 170;
    const canHorizontal = (isMobile || isTablet) && isLandscape && (availW - sideWidth - gap) >= 220 && availH >= 180;

    if (canHorizontal) {
      const size = Math.min(availH, availW - sideWidth - gap);
      return { size, horizontal: true, sideWidth, outerPad, boardPad: 6, gap: 5, showHint: true, scoreSize: 'sm' as const };
    }

    const size = Math.max(200, Math.min(availW, availH - (isMobile ? 120 : 140) - (height < 720 ? 0 : 40), isFullscreen ? 900 : isMobile ? 520 : isTablet ? 600 : 540));
    return { size, horizontal: false, sideWidth: 0, outerPad, boardPad: isMobile ? 8 : 10, gap: isMobile ? 6 : 8, showHint: height >= 720, scoreSize: (isMobile && size < 340 ? 'sm' : 'md') as 'sm' | 'md' };
  }, [width, height, isMobile, isTablet, isLandscape, isFullscreen]);

  const cellSize = Math.max(0, (layout.size - layout.boardPad * 2 - layout.gap * (SIZE - 1)) / SIZE);

  return (
    <>
      <div
        ref={fsRef}
        style={{
          minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: layout.horizontal || !isMobile ? 'center' : 'flex-start',
          padding: layout.outerPad, paddingTop: layout.horizontal || !isMobile ? layout.outerPad : 48,
          background: BG, overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: layout.horizontal ? 'row' : 'column', alignItems: layout.horizontal ? 'stretch' : 'center', gap: layout.horizontal ? 20 : 16, width: layout.horizontal ? undefined : layout.size, maxWidth: '100%' }}>
          
          {/* 信息列 */}
          {layout.horizontal ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12, width: layout.sideWidth, flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Title heading={3} style={{ margin: 0, color: 'var(--semi-color-primary)', fontSize: 24, letterSpacing: 2, lineHeight: 1 }}>2048</Title>
                <div style={{ display: 'flex', gap: 6 }}><ScoreBox label="得分" value={score} size="sm" /><ScoreBox label="最高" value={best} size="sm" /></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button theme="solid" type="primary" onClick={reset} size="small" block style={{ borderRadius: 10 }}>新游戏</Button>
                <Button icon={<IconExpand />} onClick={toggleFullscreen} size="small" block style={{ ...GLASS_STYLE, color: 'var(--semi-color-text-0)' }}>{isFullscreen ? '退出' : '全屏'}</Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Title heading={1} style={{ margin: 0, color: 'var(--semi-color-primary)', letterSpacing: 2, fontSize: isMobile ? 32 : 38, lineHeight: 1 }}>2048</Title>
                <div style={{ display: 'flex', gap: 8 }}><ScoreBox label="得分" value={score} size={layout.scoreSize} /><ScoreBox label="最高" value={best} size={layout.scoreSize} /></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button theme="solid" type="primary" onClick={reset} style={{ flex: 1, borderRadius: 10, height: 42 }}>新游戏</Button>
                <Button icon={<IconExpand />} onClick={toggleFullscreen} style={{ ...GLASS_STYLE, color: 'var(--semi-color-text-0)', width: 110, height: 42 }}>{isFullscreen ? '退出' : '全屏'}</Button>
              </div>
            </div>
          )}

          {/* 棋盘区域 */}
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              position: 'relative',
              width: layout.size, height: layout.size,
              borderRadius: 16, ...GLASS_STYLE,
              touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', flexShrink: 0,
            }}
          >
            {/* 底层网格背景 */}
            <div style={{ position: 'absolute', inset: layout.boardPad, display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gridTemplateRows: `repeat(${SIZE}, 1fr)`, gap: layout.gap }}>
              {Array.from({ length: SIZE * SIZE }).map((_, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 8 }} />
              ))}
            </div>

            {/* 动态方块 */}
            {tiles.map(tile => (
              <AnimatedTile key={tile.id} tile={tile} cellSize={cellSize} gap={layout.gap} boardPad={layout.boardPad} />
            ))}
          </div>

          {!layout.horizontal && layout.showHint && (
            <Text style={{ color: 'var(--semi-color-text-2)', fontSize: 13, fontWeight: 500 }}>
              {isMobile ? '滑动屏幕移动方块' : '方向键 / WASD 移动'}
            </Text>
          )}
        </div>
      </div>

      <Modal visible={gameOver} title="游戏结束" centered closable={false} maskClosable={false} zIndex={1100} onCancel={reset} footer={<Button theme="solid" type="primary" onClick={reset}>再来一局</Button>}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <Text type="tertiary">本局得分</Text>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--semi-color-primary)', margin: '6px 0' }}>{score}</div>
          <Text type="tertiary" size="small">最高分 {best}</Text>
        </div>
      </Modal>
    </>
  );
}