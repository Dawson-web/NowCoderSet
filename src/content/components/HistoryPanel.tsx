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
  Tooltip,
  Typography,
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconDelete,
  IconCalendar,
  IconDownload,
  IconFile,
  IconSearch,
} from '@arco-design/web-react/icon';
import { useCrawlStore } from '@/store/crawlStore';
import type { CrawlHistoryItem, HistoryTaskItem } from '@/store/crawlStore';
import { extractMomentContentText } from '@/service/feed';
import { useCallback, useState } from 'react';

const { Text } = Typography;
const { Item: CollapseItem } = Collapse;

// 弹出层挂载到 sidebar 容器，确保 z-index 高于 sidebar
const getContainer = () =>
  document.getElementById('nowcoder-float-root') ?? document.body;

const formatTime = (ts: number) =>
  new Date(ts).toLocaleString('zh-CN', { hour12: false });

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

// 触发浏览器文件下载
const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// 处理任务内容：通过 extractMomentContentText 将 HTML 转为纯文本
const processTaskContent = (content?: string): string => {
  if (!content) {
    return '';
  }
  return extractMomentContentText(content);
};

// 导出为 JSON
const exportAsJson = (item: CrawlHistoryItem) => {
  const exportData = {
    keyword: item.keyword,
    pages: item.pages,
    dedup: item.dedup,
    format: item.format,
    startedAt: formatTime(item.startedAt),
    finishedAt: item.finishedAt ? formatTime(item.finishedAt) : null,
    totalTasks: item.tasks.length,
    successCount: item.tasks.filter((t) => t.status === 'success').length,
    failedCount: item.tasks.filter((t) => t.status === 'failed').length,
    tasks: item.tasks.map((t) => ({
      title: t.title,
      url: t.url,
      uuid: t.uuid,
      author: t.author ?? '匿名',
      rcType: t.rcType ?? '-',
      status: t.status,
      content: processTaskContent(t.content),
      error: t.error ?? null,
    })),
  };

  const filename = `crawl-${item.keyword || 'all'}-${formatDate(item.startedAt)}.json`;
  triggerDownload(JSON.stringify(exportData, null, 2), filename, 'application/json');
};

// 导出为 Markdown
const exportAsMarkdown = (item: CrawlHistoryItem) => {
  const successCount = item.tasks.filter((t) => t.status === 'success').length;
  const failedCount = item.tasks.filter((t) => t.status === 'failed').length;

  const lines: string[] = [
    `# 爬取记录 — ${item.keyword || '全部'}`,
    '',
    `- **时间**：${formatTime(item.startedAt)}${item.finishedAt ? ` ~ ${formatTime(item.finishedAt)}` : ''}`,
    `- **页数**：${item.pages}`,
    `- **去重**：${item.dedup ? '是' : '否'}`,
    `- **结果**：共 ${item.tasks.length} 条（${successCount} 成功，${failedCount} 失败）`,
    '',
    '---',
    '',
  ];

  item.tasks.forEach((t, idx) => {
    const statusIcon = t.status === 'success' ? '✅' : '❌';
    lines.push(`## ${idx + 1}. ${statusIcon} ${t.title}`);
    lines.push('');
    if (t.url) {
      lines.push(`- **链接**：[${t.url}](${t.url})`);
    }
    lines.push(`- **作者**：${t.author ?? '匿名'}`);
    lines.push(`- **类型**：${t.rcType ?? '-'}`);
    lines.push(`- **状态**：${t.status}`);
    if (t.error) {
      lines.push(`- **错误**：${t.error}`);
    }
    lines.push('');

    const content = processTaskContent(t.content);
    if (content) {
      lines.push('### 正文');
      lines.push('');
      lines.push(content);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  const filename = `crawl-${item.keyword || 'all'}-${formatDate(item.startedAt)}.md`;
  triggerDownload(lines.join('\n'), filename, 'text/markdown');
};

// 导出格式选择弹窗
const ExportModal = ({
  item,
  visible,
  onClose,
}: {
  item: CrawlHistoryItem | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const handleSelect = (format: 'json' | 'md') => {
    if (!item) {
      return;
    }
    if (format === 'json') {
      exportAsJson(item);
    } else {
      exportAsMarkdown(item);
    }
    onClose();
  };

  return (
    <Modal
      title="选择导出格式"
      visible={visible}
      onCancel={onClose}
      footer={null}
      autoFocus={false}
      getPopupContainer={getContainer}
      style={{ maxWidth: 360, zIndex: 2147483647 }}
      maskStyle={{ zIndex: 2147483646 }}
      wrapClassName="nc-modal-wrap"
    >
      <div className="flex flex-col gap-3 py-2">
        <Button
          type="primary"
          long
          icon={<IconFile />}
          onClick={() => handleSelect('json')}
        >
          导出为 JSON
        </Button>
        <Button
          type="outline"
          long
          icon={<IconFile />}
          onClick={() => handleSelect('md')}
        >
          导出为 Markdown
        </Button>
      </div>
    </Modal>
  );
};

// 任务详情中的结果列表
const TaskResultList = ({ tasks }: { tasks: HistoryTaskItem[] }) => (
  <List
    size="small"
    dataSource={tasks}
    className="nc-history-task-list"
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
            <span className="text-sm leading-snug">
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
    autoFocus={false}
    getPopupContainer={getContainer}
    style={{ maxWidth: 480, zIndex: 2147483647 }}
    maskStyle={{ zIndex: 2147483646 }}
    wrapClassName="nc-modal-wrap"
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

// 单条历史摘要 — 两行布局，更宽松
const HistorySummary = ({ item }: { item: CrawlHistoryItem }) => {
  const successCount = item.tasks.filter((t) => t.status === 'success').length;
  const failedCount = item.tasks.filter((t) => t.status === 'failed').length;

  return (
    <div className="flex flex-col gap-1.5 w-full py-1">
      {/* 第一行：时间 + 关键词 */}
      <div className="flex items-center gap-2">
        <IconCalendar className="text-gray-400 text-xs shrink-0" />
        <Text className="text-xs text-gray-400 shrink-0">{formatTime(item.startedAt)}</Text>
        <Tag size="small" color="arcoblue" className="shrink-0">
          <IconSearch className="mr-0.5" />{item.keyword || '全部'}
        </Tag>
      </div>
      {/* 第二行：统计信息 */}
      <div className="flex items-center gap-2">
        <Tag size="small" className="shrink-0" color="gray">
          <IconFile className="mr-0.5" />{item.pages} 页
        </Tag>
        {item.dedup && <Tag size="small" color="orange">去重</Tag>}
        <Tag size="small" color="green">{successCount} 成功</Tag>
        {failedCount > 0 && <Tag size="small" color="red">{failedCount} 失败</Tag>}
      </div>
    </div>
  );
};

const HistoryPanel = () => {
  const history = useCrawlStore((s) => s.history);
  const removeHistory = useCrawlStore((s) => s.removeHistory);
  const clearHistory = useCrawlStore((s) => s.clearHistory);

  const [logModalItem, setLogModalItem] = useState<CrawlHistoryItem | null>(null);
  const [exportModalItem, setExportModalItem] = useState<CrawlHistoryItem | null>(null);

  const handleRemove = useCallback((id: string) => {
    removeHistory(id);
  }, [removeHistory]);

  const handleClearAll = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

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
          onOk={handleClearAll}
          getPopupContainer={getContainer}
        >
          <Button size="small" type="text" status="danger" icon={<IconDelete />}>
            清空
          </Button>
        </Popconfirm>
      }
    >
      <div className="nc-history-scroll">
        <Collapse bordered={false} accordion className="nc-history-collapse">
          {history.map((item) => (
            <CollapseItem
              key={item.id}
              name={item.id}
              header={<HistorySummary item={item} />}
              extra={
                <Space size={4}>
                  <Tooltip content="查看日志" getPopupContainer={getContainer}>
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
                  </Tooltip>
                  <Tooltip content="导出记录" getPopupContainer={getContainer}>
                    <Button
                      size="mini"
                      type="text"
                      icon={<IconDownload />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExportModalItem(item);
                      }}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="确定删除该条记录？"
                    onOk={() => handleRemove(item.id)}
                    getPopupContainer={getContainer}
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

      <ExportModal
        item={exportModalItem}
        visible={!!exportModalItem}
        onClose={() => setExportModalItem(null)}
      />
    </Card>
  );
};

export default HistoryPanel;
