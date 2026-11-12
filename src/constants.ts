export const SIZE = 4;
export const STORAGE_KEY = 'game-2048';
/** 滑动动画时长，全局唯一来源 */
export const MOVE_ANIMATION_MS = 130;
/** 滑动手势最小识别距离 */
export const SWIPE_THRESHOLD = 24;

export const BG =
  'linear-gradient(135deg, var(--semi-color-primary-light-default) 0%, var(--semi-color-bg-1) 50%, var(--semi-color-bg-2) 100%)';

export const GLASS_STYLE: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--semi-color-bg-0) 60%, transparent)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid color-mix(in srgb, var(--semi-color-bg-0) 90%, transparent)',
  boxShadow: 'var(--semi-shadow-elevated)',
};