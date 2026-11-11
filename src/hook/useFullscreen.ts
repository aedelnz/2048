// useFullscreen.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

/* ============================================================
 * 常量：跨浏览器前缀方法 / 属性 / 事件名
 * ============================================================ */

export const PREFIXES = {
  request: ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'],
  exit:    ['exitFullscreen', 'webkitExitFullscreen', 'webkitCancelFullScreen', 'mozCancelFullScreen', 'msExitFullscreen'],
  element: ['fullscreenElement', 'webkitFullscreenElement', 'mozFullScreenElement', 'msFullscreenElement'],
  enabled: ['fullscreenEnabled', 'webkitFullscreenEnabled', 'mozFullScreenEnabled', 'msFullscreenEnabled'],
  events:  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'],
} as const;

export type FullscreenMode = 'idle' | 'native' | 'fallback';

export interface UseFullscreenOptions {
  page?: boolean;
  zIndex?: number;
  lockScroll?: boolean;
  background?: string;
  onChange?: (active: boolean, mode: 'native' | 'fallback' | null) => void;
}

export interface UseFullscreenReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  mode: FullscreenMode;
  isFullscreen: boolean;
  isNative: boolean;
  isFallback: boolean;
  supported: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
}

/* ============================================================
 * 纯工具：DOM 层面探测，无 React 依赖
 * ============================================================ */

const doc = (): any => (typeof document === 'undefined' ? null : document);
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function pickValue(obj: any, keys: readonly string[]): any {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] != null) return obj[k];
  return undefined;
}

function pickMethod(obj: any, keys: readonly string[]): ((...a: any[]) => any) | undefined {
  if (!obj) return undefined;
  for (const k of keys) if (typeof obj[k] === 'function') return obj[k].bind(obj);
  return undefined;
}

/** 原生全屏是否可用（视口模式） */
function readSupport(): boolean {
  const d = doc();
  if (!d) return false;
  const flag = pickValue(d, PREFIXES.enabled);
  if (typeof flag === 'boolean') return flag;
  return !!pickMethod(d.documentElement, PREFIXES.request);
}

function readFullscreenElement(): Element | null {
  return (pickValue(doc(), PREFIXES.element) as Element) ?? null;
}

/* ============================================================
 * 样式快照：用于 CSS 降级时安全还原
 * ============================================================ */

const STYLE_KEYS = [
  'position', 'top', 'left', 'right', 'bottom', 'width', 'height',
  'margin', 'zIndex', 'background', 'overflow', 'borderRadius',
] as const;

type StyleSnapshot = Record<string, string>;

const readStyle = (el: HTMLElement): StyleSnapshot => {
  const s: StyleSnapshot = {};
  STYLE_KEYS.forEach(k => (s[k] = (el.style as any)[k]));
  return s;
};

const applyStyle = (el: HTMLElement, s: StyleSnapshot | null) => {
  if (s) Object.keys(s).forEach(k => ((el.style as any)[k] = s[k]));
};

/* ============================================================
 * 降级控制器
 * ============================================================ */

interface FallbackCfg {
  zIndex: number;
  background: string;
  lockScroll: boolean;
}

function createFallback() {
  let target: HTMLElement | null = null;
  let targetStyle: StyleSnapshot | null = null;
  let bodyStyle: StyleSnapshot | null = null;
  let scrollY = 0;

  const restoreAll = () => {
    if (target) { applyStyle(target, targetStyle); target = null; targetStyle = null; }
    if (bodyStyle) {
      applyStyle(document.body, bodyStyle);
      bodyStyle = null;
      window.scrollTo(0, scrollY);
    }
  };

  return {
    get active() { return target !== null; },

    enter(el: HTMLElement, cfg: FallbackCfg) {
      if (target === el) return;
      restoreAll();
      target = el;
      targetStyle = readStyle(el);
      Object.assign(el.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        width: '100vw', height: '100vh', margin: '0', overflow: 'auto',
        zIndex: String(cfg.zIndex), borderRadius: '0', background: cfg.background,
      });
      if (cfg.lockScroll && el !== document.documentElement) {
        scrollY = window.scrollY || 0;
        bodyStyle = readStyle(document.body);
        Object.assign(document.body.style, {
          overflow: 'hidden', position: 'fixed',
          top: `-${scrollY}px`, left: '0', right: '0', width: '100%',
        });
      }
    },

    exit: restoreAll,
  };
}

/* ============================================================
 * Hook：编排
 * ============================================================ */

export function useFullscreen<T extends HTMLElement = HTMLDivElement>(
  options: UseFullscreenOptions = {}
): UseFullscreenReturn<T> {
  const {
    page = false, zIndex = 9999, lockScroll = true, background = '#000', onChange,
  } = options;

  /* ---- 状态 ---- */
  const [mode, setMode] = useState<FullscreenMode>('idle');
  
  // ✅ 修复点：直接惰性初始化，只在首次渲染计算一次，不再需要 effect 和 setter
  const [supported] = useState(readSupport);

  const modeRef = useRef<FullscreenMode>('idle');
  const ref = useRef<T>(null);
  const fallbackRef = useRef(createFallback());

  const optionsRef = useRef({ page, zIndex, lockScroll, background, onChange });
  useEffect(() => {
    optionsRef.current = { page, zIndex, lockScroll, background, onChange };
  }, [page, zIndex, lockScroll, background, onChange]);

  /* ---- 派生值 ---- */
  const isFullscreen = mode !== 'idle';
  const isNative = mode === 'native';
  const isFallback = mode === 'fallback';

  /* ---- 唯一状态出口 ---- */
  const transition = useCallback((next: FullscreenMode) => {
    if (modeRef.current === next) return;
    modeRef.current = next;
    setMode(next);
    optionsRef.current.onChange?.(
      next !== 'idle',
      next === 'idle' ? null : next,
    );
  }, []);

  /* ---- 目标元素：整页 or ref 元素 ---- */
  const getTarget = useCallback((): HTMLElement | null => {
    if (optionsRef.current.page) return document.documentElement;
    return ref.current;
  }, []);

  /* ---- 进入 ---- */
  const enter = useCallback(async () => {
    const el = getTarget();
    if (!el || modeRef.current !== 'idle') return;

    const request = pickMethod(el, PREFIXES.request);
    if (request) {
      try {
        await request({ navigationUI: 'hide' });
        await wait(60);
        if (readFullscreenElement()) return transition('native');
      } catch {
        /* 非用户手势 / iframe 未 allow → 走降级 */
      }
    }

    if (el instanceof HTMLVideoElement
        && typeof (el as any).webkitEnterFullscreen === 'function') {
      (el as any).webkitEnterFullscreen();
      return transition('native');
    }

    const { zIndex, lockScroll, background } = optionsRef.current;
    fallbackRef.current.enter(el, { zIndex, lockScroll, background });
    transition('fallback');
  }, [getTarget, transition]);

  /* ---- 退出 ---- */
  const exit = useCallback(async () => {
    if (modeRef.current === 'fallback') {
      fallbackRef.current.exit();
      return transition('idle');
    }
    if (modeRef.current === 'native') {
      const fn = pickMethod(doc(), PREFIXES.exit);
      if (fn) try { await fn(); } catch { /* ignore */ }
      transition('idle');
    }
  }, [transition]);

  /* ---- 切换 ---- */
  const toggle = useCallback(
    () => (modeRef.current === 'idle' ? enter() : exit()),
    [enter, exit],
  );

  /* ---- 原生全屏事件同步 ---- */
  useEffect(() => {
    const d = doc();
    if (!d) return;

    const handler = () => {
      const fsEl = readFullscreenElement();
      const el = getTarget();
      const isMine = !!fsEl && !!el && (fsEl === el || fsEl.contains(el));
      if (isMine) transition('native');
      else if (modeRef.current === 'native') transition('idle');
    };

    PREFIXES.events.forEach(e => d.addEventListener(e, handler));
    return () => PREFIXES.events.forEach(e => d.removeEventListener(e, handler));
  }, [getTarget, transition]);

  /* ---- 降级模式 ESC 退出 ---- */
  useEffect(() => {
    if (mode !== 'fallback') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        fallbackRef.current.exit();
        transition('idle');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, transition]);

  /* ---- 卸载清理 ---- */
  useEffect(() => () => { fallbackRef.current.exit(); }, []);

  /* ---- 返回值 ---- */
  return useMemo(() => ({
    ref,
    mode,
    isFullscreen,
    isNative,
    isFallback,
    supported,
    enter,
    exit,
    toggle,
  }), [mode, isFullscreen, isNative, isFallback, supported, enter, exit, toggle]);
}

export default useFullscreen;