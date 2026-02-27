import { useEffect, useRef } from 'react';
import { Button, Card, Space, Typography } from '@arco-design/web-react';
import type { LogsPanelProps } from './types';

const { Text } = Typography;

const LogsPanel = ({ logs, onClear }: LogsPanelProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = terminalRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <Card
      className="nc-card shadow-md nc-logs-card"
      title="运行日志"
      extra={
        <Space>
          <Button type="text" size="small" onClick={onClear}>
            清空
          </Button>
        </Space>
      }
    >
      <div className="nc-terminal" ref={terminalRef}>
        {logs.length === 0 ? (
          <Text type="secondary">暂无日志</Text>
        ) : (
          logs.map((line, idx) => (
            <div className="nc-terminal__line" key={idx}>
              <code>{line}</code>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default LogsPanel;
