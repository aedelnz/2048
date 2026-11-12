import { GLASS_STYLE } from '../constants';
import type { ScoreSize } from '../types';

interface ScoreBoxProps {
  label: string;
  value: number;
  size?: ScoreSize;
}

export default function ScoreBox({ label, value, size = 'md' }: ScoreBoxProps) {
  const small = size === 'sm';
  return (
    <div
      style={{
        ...GLASS_STYLE,
        borderRadius: 'var(--semi-border-radius-large)',
        padding: small ? '4px 12px' : '6px 16px',
        minWidth: small ? 64 : 80,
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 1,
          color: 'var(--semi-color-text-2)',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: small ? 18 : 22,
          fontWeight: 700,
          color: 'var(--semi-color-text-0)',
          lineHeight: 1.1,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}