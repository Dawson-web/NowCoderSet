import {
  Avatar,
  Button,
  Card,
  Collapse,
  Empty,
  List,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconDelete,
  IconCalendar,
  IconSearch,
} from '@arco-design/web-react/icon';
import { useCrawlStore } from '@/store/crawlStore';
import type { CrawlHistoryItem, HistoryTaskItem } from '@/store/crawlStore';
import { useState } from 'react';

const { Text, Title } = Typography;
const { CollapseItem } = Collapse;

const formatTime = (ts: number) =>
  new Date(ts).toLocaleString('zh-CN', { hour12: false });

// 任务详情弹窗中的结果列表
const TaskResultList = ({ tasks }: { tasks: HistoryTaskItem[] }) => (
  <List
    size="small"
    dataSource={tasks}
    render={(item) => (
      <List.Item key={item.id}>
        <List.Item.Meta
          avatar={
            <Avatar size={28} className={item.status === 'success' ? 'bg-green-500' : 'bg-red-400'}>
              {item.status === 'success'
                ? <IconCheckCircleFill />
                : <IconCloseCircleFill />
              }
            </Avatar>
          }
          title={
            <span className="text-sm">
              {item.url
                ? <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{item.title}</a>
                : item.title
              }
            </span>
          }
          description={
            <span className="text-xs text-gray-400">
              {item.author ?? '匿名'} · {item.rcType ?? '-'}
              {item.error && <span className="text-red-400 ml-2">{item.error}</span>}
            </span>
          }
        />
      </List.Item>
    )}
  />
);

// 历史任务日志弹窗
const LogDetailModal = ({ logs, visible, onClose }: { logs: string[]; visible: boolean; onClose: () => void }) => (
  <Modal
    title="任务日志"
    visible={visible}
    onCancel={onClose}
    footer={null}
    style={{ maxWidth: 480 }}
    autoFocus={false}
  >
    <div className="nc-terminal" style={{ maxHeight: 360 }}>
      {logs.map((line, idx) => (
        <div className="nc-terminal__line" key={idx}>
          <code>{line}</code>
        </div>
      ))}
    </div>
  </Modal>
);

// 单条历史摘要行
const HistorySummary = ({ item }: { item: CrawlHistoryItem }) => {
  const successCount = item.tasks.filter((t) => t.status === 'success').length;
  const failedCount = item.tasks.filter((t) => t.status === 'failed').length;

  return (
    <div className="flex items-center gap-2 flex-wrap w-full">
      <IconCalendar className="text-gray-400 text-xs shrink-0" />
      <Text className="text-xs text-gray-400 shrink-0">{formatTime(item.startedAt)}</Text>
      <Tag size="small" color="arcoblue" className="shrink-0">
        <IconSearch className="mr-0.5" />{item.keyword || '全部'}
      </Tag>
      <Text className="text-xs text-gray-400 shrink-0">{item.pages}页</Text>
      {item.dedup && <Tag size="small" color="orange">去重</Tag>}
      <div className="flex-1" />
      <Tag size="small" color="green">{successCount} 成功</Tag>
      {failedCount > 0 && <Tag size="small" color="red">{failedCount} 失败</Tag>}
    </div>
  );
};

const HistoryPanel = () => {
  const history = useCrawlStore((s) => s.history);
  const removeHistory = useCrawlStore((s) => s.removeHistory);
  const clearHistory = useCrawlStore((s) => s.clearHistory);

  const [logModalItem, setLogModalItem] = useState<CrawlHistoryItem | null>(null);

  if (history.length === 0) {
    return (
      <Card className="nc-card shadow-md" title="历史记录">
        <Empty description="暂无历史记录" />
      </Card>
    );
  }

  return (
    <Card
      className="nc-card shadow-md nc-history-card"
      title={`历史记录（${history.length}）`}
      extra={
        <Popconfirm
          title="确定清空全部历史记录？"
          onOk={clearHistory}
        >
          <Button size="small" type="text" status="danger" icon={<IconDelete />}>
            清空
          </Button>
        </Popconfirm>
      }
    >
      <div className="nc-history-scroll">
        <Collapse bordered={false} accordion>
          {history.map((item) => (
            <CollapseItem
              key={item.id}
              name={item.id}
              header={<HistorySummary item={item} />}
              extra={
                <Space size={4}>
                  <Button
                    size="mini"
                    type="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLogModalItem(item);
                    }}
                  >
                    日志
                  </Button>
                  <Popconfirm
                    title="确定删除该条记录？"
                    onOk={() => removeHistory(item.id)}
                  >
                    <Button
                      size="mini"
                      type="text"
                      status="danger"
                      icon={<IconDelete />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </Space>
              }
            >
              <TaskResultList tasks={item.tasks} />
            </CollapseItem>
          ))}
        </Collapse>
      </div>

      <LogDetailModal
        logs={logModalItem?.logs ?? []}
        visible={!!logModalItem}
        onClose={() => setLogModalItem(null)}
      />
    </Card>
  );
};

export default HistoryPanel;
