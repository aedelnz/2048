import { useEffect, useMemo, useRef, useState } from 'react';

export const BREAKPOINTS = {
  xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
export interface Size { width: number; height: number; }

const SORTED = (Object.entries(BREAKPOINTS) as [Breakpoint, number][])
  .sort((a, b) => a[1] - b[1]);
const ZERO: Size = { width: 0, height: 0 };

const match = (w: number): Breakpoint =>
  SORTED.reduce<Breakpoint>((cur, [name, min]) => (w >= min ? name : cur), 'xs');

/** 元素模式：元素不存在返回 ZERO，避免误用视口宽度；视口模式读 window */
function readSize(id?: string): Size {
  if (typeof window === 'undefined') return ZERO;
  if (!id) return { width: window.innerWidth, height: window.innerHeight };
  const el = document.getElementById(id);
  // offsetWidth 是 border-box，RO 也用 border-box 对齐
  return el ? { width: el.offsetWidth, height: el.offsetHeight } : ZERO;
}

interface Snapshot { id?: string; size: Size; }

export function useBreakpoint(debounce = 100, elementId?: string) {
  // 用 state 保存「当前测量过的 elementId + 尺寸」，避免渲染期读写 ref
  const [snapshot, setSnapshot] = useState<Snapshot>(
    () => ({ id: elementId, size: readSize(elementId) })
  );

  // elementId 切换时，在渲染期派生新尺寸（官方推荐的 "adjust state during render"）
  if (snapshot.id !== elementId) {
    setSnapshot({ id: elementId, size: readSize(elementId) });
  }

  const size = snapshot.size;

  // debounce 只在 effect / RO 回调里读取，通过 ref 保存最新值，
  // 且只在 effect 中更新 ref，满足 react-hooks/refs 规则
  const debounceRef = useRef(debounce);
  useEffect(() => {
    debounceRef.current = debounce;
  }, [debounce]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0, tries = 0, cancelled = false;
    let observer: ResizeObserver | undefined;

    const commit = (next: Size) => {
      if (cancelled) return;
      setSnapshot(prev =>
        prev.size.width === next.width && prev.size.height === next.height
          ? prev
          : { ...prev, size: next }
      );
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => commit(readSize(elementId)), debounceRef.current);
    };

    const attach = () => {
      if (cancelled) return;

      // 视口模式：只需监听 window
      if (!elementId) {
        window.addEventListener('resize', schedule);
        commit(readSize());
        return;
      }

      const el = document.getElementById(elementId);
      if (!el) {
        // 元素未挂载：最多重试 1s
        if (tries++ < 60) raf = requestAnimationFrame(attach);
        else window.addEventListener('resize', schedule);
        return;
      }

      if (typeof ResizeObserver !== 'undefined') {
        // 直接用 entries，避免再读 offsetWidth 触发 reflow；border-box 与 offsetWidth 对齐
        observer = new ResizeObserver(([entry]) => {
          const box = entry.borderBoxSize?.[0];
          const next = box
            ? { width: box.inlineSize, height: box.blockSize }
            : { width: entry.contentRect.width, height: entry.contentRect.height };
          clearTimeout(timer);
          timer = setTimeout(() => commit(next), debounceRef.current);
        });
        observer.observe(el, { box: 'border-box' });
      } else {
        window.addEventListener('resize', schedule);
      }
      commit(readSize(elementId));
    };

    attach();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [elementId]); // debounce 走 ref，不参与依赖

  const { width, height } = size;
  const ready = width > 0 || height > 0;
  return {
    width, height,
    breakpoint: useMemo(() => match(width), [width]),
    ready,
    isMobile: ready && width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isPortrait: ready && height >= width,
  };
}