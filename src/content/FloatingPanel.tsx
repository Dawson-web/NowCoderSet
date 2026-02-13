import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Radio,
  Space,
  Tag,
  Typography,
} from '@arco-design/web-react';
import { IconMinus, IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import { useEffect, useMemo, useRef, useState } from 'react';

const { Title, Text } = Typography;

type Mode = 'single' | 'list';

const fakeStats = {
  total: 12,
  finished: 4,
  failed: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const FloatingPanel = () => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<Mode>('single');
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState(() => ({
    x: window.innerWidth - 360,
    y: window.innerHeight - 420,
  }));

  // Drag to move
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let startX = 0;
    let startY = 0;
    let dragging = false;

    const onMouseDown = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (!e.target.closest('.nc-floating-drag')) return;
      dragging = true;
      startX = e.clientX - pos.x;
      startY = e.clientY - pos.y;
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPos((prev) => {
        const nextX = clamp(e.clientX - startX, 8, window.innerWidth - 320);
        const nextY = clamp(e.clientY - startY, 8, window.innerHeight - 120);
        return { ...prev, x: nextX, y: nextY };
      });
    };

    const onMouseUp = () => {
      dragging = false;
      document.body.style.userSelect = '';
    };

    panel.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      panel.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [pos.x, pos.y]);

  const summaryTag = useMemo(() => {
    const progress = Math.round((fakeStats.finished / fakeStats.total) * 100);
    return (
      <Tag color="arcoblue" bordered>
        进度 {progress}% · 完成 {fakeStats.finished}/{fakeStats.total}
      </Tag>
    );
  }, []);

  return (
    <div
      ref={panelRef}
      className={`nc-floating-panel ${collapsed ? 'collapsed' : ''}`}
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="nc-floating-header nc-floating-drag">
        <Space align="center" size={6}>
          <Title heading={6} style={{ margin: 0 }}>
            牛客爬取助手
          </Title>
          {summaryTag}
        </Space>
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={collapsed ? <IconPlus /> : <IconMinus />}
            onClick={() => setCollapsed((c) => !c)}
          />
          <Button
            type="text"
            size="small"
            icon={<IconRefresh />}
            onClick={() => window.location.reload()}
          />
        </Space>
      </div>

      {!collapsed && (
        <div className="nc-floating-body">
          <Card
            size="small"
            bordered={false}
            bodyStyle={{ padding: 12 }}
            title="抓取配置"
            extra={
              <Radio.Group
                type="button"
                size="mini"
                value={mode}
                onChange={(v) => setMode(v as Mode)}
              >
                <Radio value="single">单帖</Radio>
                <Radio value="list">列表</Radio>
              </Radio.Group>
            }
          >
            <Form layout="vertical" size="small">
              <Form.Item label="目标链接" field="target">
                <Input
                  placeholder="https://www.nowcoder.com/discuss/xxxx"
                  allowClear
                />
              </Form.Item>
              {mode === 'list' && (
                <Form.Item label="页数限制" field="pages">
                  <Input placeholder="例如 3" allowClear />
                </Form.Item>
              )}
              <Form.Item label="关键字过滤（可选）" field="keyword">
                <Input placeholder="算法 / 秋招 / Java..." allowClear />
              </Form.Item>
              <Divider margin={10} />
              <Space>
                <Button type="primary" size="small">
                  开始
                </Button>
                <Button size="small">暂停</Button>
              </Space>
            </Form>
          </Card>

          <Divider margin={10} />

          <Card
            size="small"
            title="简要状态"
            bordered={false}
            bodyStyle={{ padding: 12 }}
          >
            <Space direction="vertical" size={6}>
              <Text>任务总数：{fakeStats.total}</Text>
              <Text type="success">已完成：{fakeStats.finished}</Text>
              <Text type="danger">失败：{fakeStats.failed}</Text>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FloatingPanel;
