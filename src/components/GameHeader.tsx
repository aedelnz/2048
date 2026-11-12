import { Button, Typography } from '@douyinfe/semi-ui';
import { IconExpand } from '@douyinfe/semi-icons';
import ScoreBox from './ScoreBox';
import { GLASS_STYLE } from '../constants';
import type { Layout } from '../types';

const { Title } = Typography;

interface Props {
  layout: Layout;
  isMobile: boolean;
  isFullscreen: boolean;
  score: number;
  best: number;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

export default function GameHeader({
  layout,
  isMobile,
  isFullscreen,
  score,
  best,
  onReset,
  onToggleFullscreen,
}: Props) {
  const fullscreenLabel = isFullscreen ? '退出' : '全屏';

  if (layout.horizontal) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 12,
          width: layout.sideWidth,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Title
            heading={1}
            style={{
              margin: 0,
              color: 'var(--semi-color-primary)',
              fontSize: 26,
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            2048
          </Title>
          <div style={{ display: 'flex', gap: 6 }}>
            <ScoreBox label="得分" value={score} size="sm" />
            <ScoreBox label="最高" value={best} size="sm" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button theme="solid" type="primary" onClick={onReset} size="small" block style={{ borderRadius: 'var(--semi-border-radius-large)' }}>
            新游戏
          </Button>
          <Button
            theme="solid"
            icon={<IconExpand />}
            onClick={onToggleFullscreen}
            size="small"
            block
            style={{ ...GLASS_STYLE, color: 'var(--semi-color-text-0)', borderRadius: 'var(--semi-border-radius-large)' }}
          >
            {fullscreenLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Title
          heading={1}
          style={{
            margin: 0,
            color: 'var(--semi-color-primary)',
            letterSpacing: 2,
            fontSize: isMobile ? 32 : 38,
            lineHeight: 1,
          }}
        >
          2048
        </Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <ScoreBox label="得分" value={score} size={layout.scoreSize} />
          <ScoreBox label="最高" value={best} size={layout.scoreSize} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button
          theme="solid"
          type="primary"
          onClick={onReset}
          style={{ flex: 1, borderRadius: 'var(--semi-border-radius-large)', height: 42 }}
        >
          新游戏
        </Button>
        <Button
          icon={<IconExpand />}
          onClick={onToggleFullscreen}
          style={{
            ...GLASS_STYLE,
            color: 'var(--semi-color-text-0)',
            borderRadius: 'var(--semi-border-radius-large)',
            width: 110,
            height: 42,
          }}
        >
          {fullscreenLabel}
        </Button>
      </div>
    </div>
  );
}