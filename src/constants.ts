export const SIZE = 4;
export const STORAGE_KEY = 'game-2048-v3';

// 背景：使用 Semi 的主题浅色和背景色组成高定渐变
export const BG = 'linear-gradient(135deg, var(--semi-color-primary-light-default) 0%, var(--semi-color-bg-1) 50%, var(--semi-color-bg-2) 100%)';

// 玻璃态：使用 Semi 的背景色（白色）混合透明度，边框使用纯色，阴影使用 Semi 自带的高度阴影
export const GLASS_STYLE: React.CSSProperties = {
  // color-mix 让 --semi-color-bg-0（白色）呈现出 60% 的透明度
  background: 'color-mix(in srgb, var(--semi-color-bg-0) 60%, transparent)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid color-mix(in srgb, var(--semi-color-bg-0) 90%, transparent)',
  boxShadow: 'var(--semi-shadow-elevated)', // 使用 Semi 预设的高级阴影
};