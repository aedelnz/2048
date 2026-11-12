import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { MOVE_ANIMATION_MS, STORAGE_KEY } from '../constants';
import { addRandomTile, canMove, computeMove, createInitialGame } from '../game';
import type { Direction, SavedGame } from '../types';

export function useGameLogic() {
  const initialGame = useMemo<SavedGame>(() => createInitialGame(), []);
  const [game, setGame] = useLocalStorage<SavedGame>(STORAGE_KEY, initialGame);

  const tiles = game?.tiles ?? initialGame.tiles;
  const score = Number.isFinite(game?.score) ? game.score : 0;
  const best = Math.max(Number.isFinite(game?.best) ? game.best : 0, score);
  const gameOver = useMemo(() => !canMove(tiles), [tiles]);

  // 保留最新值到 ref，避免 applyMove 的闭包陷阱
  const stateRef = useRef({ tiles, score, best, gameOver });
  useEffect(() => {
    stateRef.current = { tiles, score, best, gameOver };
  }, [tiles, score, best, gameOver]);

  const setGameRef = useRef(setGame);
  useEffect(() => {
    setGameRef.current = setGame;
  }, [setGame]);

  const isAnimatingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ✅ 组件卸载时清理定时器，避免泄漏
  useEffect(
    () => () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    },
    [],
  );

  const applyMove = useCallback((dir: Direction) => {
    if (isAnimatingRef.current) return;
    const {
      tiles: currentTiles,
      score: curScore,
      best: curBest,
      gameOver: over,
    } = stateRef.current;
    if (over) return;

    const { allTiles, gained, moved } = computeMove(currentTiles, dir);
    if (!moved) return;

    isAnimatingRef.current = true;
    const nextScore = curScore + gained;
    const nextBest = Math.max(curBest, nextScore);

    // 阶段 1：滑动动画
    setGameRef.current({ tiles: allTiles, score: nextScore, best: nextBest });

    // 阶段 2：动画结束后落地 + 生成新方块
    timerRef.current = setTimeout(() => {
      const aliveTiles = allTiles
        .filter((t) => !t.isRemoved)
        .map((t) => ({ ...t, isNew: false, isMerged: false }));
      addRandomTile(aliveTiles);

      setGameRef.current({ tiles: aliveTiles, score: nextScore, best: nextBest });
      isAnimatingRef.current = false;
    }, MOVE_ANIMATION_MS);
  }, []);

  const reset = useCallback(() => {
    // ✅ 修复隐患：reset 时取消未完成的动画，避免旧 timer 覆盖新状态
    if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    isAnimatingRef.current = false;
    setGameRef.current({
      ...createInitialGame(),
      best: stateRef.current.best,
    });
  }, []);

  return { tiles, score, best, gameOver, applyMove, reset };
}