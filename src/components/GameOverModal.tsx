import { Button, Modal, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

interface Props {
  visible: boolean;
  score: number;
  best: number;
  onRestart: () => void;
}

export default function GameOverModal({ visible, score, best, onRestart }: Props) {
  return (
    <Modal
      visible={visible}
      title="游戏结束"
      centered
      closable={false}
      maskClosable={false}
      zIndex={1100}
      onCancel={onRestart}
      footer={
        <Button theme="solid" type="primary" onClick={onRestart} style={{ flex: 1, borderRadius: 'var(--semi-border-radius-large)', height: 42 }}>
          再来一局
        </Button>
      }
    >
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <Text type="tertiary">本局得分</Text>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: 'var(--semi-color-primary)',
            margin: '16px 0',
          }}
        >
          {score}
        </div>
        <Text type="tertiary" size="small">
          最高分 {best}
        </Text>
      </div>
    </Modal>
  );
}