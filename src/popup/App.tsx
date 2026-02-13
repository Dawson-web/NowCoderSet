import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Grid,
  Input,
  List,
  Progress,
  Radio,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from '@arco-design/web-react';
import {
  IconDownload,
  IconPause,
  IconPlayArrow,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { useMemo, useState } from 'react';

type CrawlRow = {
  id: string;
  title: string;
  author: string;
  comments: number;
  createdAt: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
};

const { Title, Text } = Typography;
const { Row, Col } = Grid;

const statusColor: Record<CrawlRow['status'], string> = {
  queued: 'arcoblue',
  processing: 'orange',
  done: 'green',
  failed: 'red',
};

const mockRows: CrawlRow[] = [
  {
    id: '1',
    title: '秋招算法求职经验分享｜包含面经与复盘',
    author: '小牛学姐',
    comments: 48,
    createdAt: '2026-02-11',
    status: 'done',
  },
  {
    id: '2',
    title: '牛客论坛抓取需求示例（仅样式）',
    author: 'NowCoderBot',
    comments: 12,
    createdAt: '2026-02-10',
    status: 'processing',
  },
  {
    id: '3',
    title: '春招实习岗位内推合集',
    author: '内推君',
    comments: 96,
    createdAt: '2026-02-08',
    status: 'queued',
  },
  {
    id: '4',
    title: '社招面试高频问题整理',
    author: 'Offer拿到手',
    comments: 31,
    createdAt: '2026-02-05',
    status: 'failed',
  },
];

const mockLogs = [
  '[10:03:12] 已解析帖子列表，待抓取 12 篇',
  '[10:03:15] 正在抓取：秋招算法求职经验分享',
  '[10:03:20] 保存成功：秋招算法求职经验分享',
  '[10:03:42] 正在抓取：牛客论坛抓取需求示例（仅样式）',
];

function App() {
  const [mode, setMode] = useState<'single' | 'list'>('single');

  const summary = useMemo(
    () => ({
      total: 24,
      finished: 9,
      failed: 1,
      progress: Math.round((9 / 24) * 100),
    }),
    []
  );

  return (
    <main className="popup">
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div className="header">
          <div>
            <Title heading={4} style={{ margin: 0 }}>
              牛客网帖子爬取
            </Title>
            <Text type="secondary">仅展示前端样式，功能逻辑待接入</Text>
          </div>
          <Space size={8}>
            <Button
              type="outline"
              size="small"
              onClick={async () => {
                try {
                  const [tab] = await chrome.tabs.query({
                    active: true,
                    currentWindow: true,
                  });
                  if (!tab?.id) return;
                  await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              切换侧边栏
            </Button>
            <Button
              type="text"
              size="small"
              icon={<IconRefresh />}
              onClick={() => window.location.reload()}
            >
              重置视图
            </Button>
          </Space>
        </div>

        <Card
          title="抓取配置"
          extra={
            <Space>
              <Button type="primary" icon={<IconPlayArrow />}>
                开始抓取
              </Button>
              <Button type="outline" icon={<IconPause />}>
                暂停
              </Button>
            </Space>
          }
        >
          <Form
            layout="vertical"
            initialValues={{
              mode,
              autoSave: true,
              markdown: true,
              dedup: true,
              ownerOnly: false,
              format: 'markdown',
            }}
          >
            <Form.Item label="抓取模式" field="mode">
              <Radio.Group
                type="button"
                options={[
                  { label: '单帖链接', value: 'single' },
                  { label: '列表页/板块', value: 'list' },
                ]}
                value={mode}
                onChange={(v) => setMode(v as 'single' | 'list')}
              />
            </Form.Item>

            <Grid.Row gutter={12}>
              <Col span={mode === 'single' ? 24 : 16}>
                <Form.Item
                  label="帖子链接 / 列表页"
                  field="target"
                  rules={[{ required: true, message: '请填写牛客帖子或列表地址' }]}
                >
                  <Input
                    placeholder="https://www.nowcoder.com/discuss/xxxx"
                    allowClear
                  />
                </Form.Item>
              </Col>
              {mode === 'list' && (
                <Col span={8}>
                  <Form.Item label="最大页数" field="pages">
                    <Input placeholder="例如 3 页" />
                  </Form.Item>
                </Col>
              )}
            </Grid.Row>

            <Grid.Row gutter={12}>
              <Col span={14}>
                <Form.Item
                  label="关键字过滤（可选）"
                  field="keyword"
                  tooltip="匹配标题或正文关键字"
                >
                  <Input placeholder="算法 / 秋招 / Java..." allowClear />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label="登录 Cookie（可选）"
                  field="cookie"
                  tooltip="需要抓取私帖或更多数据时填写"
                >
                  <Input.Password placeholder="NOWCODERUID=..." allowClear />
                </Form.Item>
              </Col>
            </Grid.Row>

            <Grid.Row gutter={12}>
              <Col span={8}>
                <Form.Item label="导出格式" field="format">
                  <Radio.Group type="button">
                    <Radio value="markdown">Markdown</Radio>
                    <Radio value="json">JSON</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="是否去重"
                  field="dedup"
                  triggerPropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="仅抓取楼主"
                  field="ownerOnly"
                  triggerPropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Grid.Row>

            <Divider margin={16} />

            <Space>
              <Button type="primary" icon={<IconPlayArrow />}>
                立即开始
              </Button>
              <Button type="outline" icon={<IconPause />}>
                暂停
              </Button>
              <Button icon={<IconDownload />}>导出结果</Button>
            </Space>
          </Form>
        </Card>

        <Row gutter={12}>
          <Col span={12}>
            <Card title="进度概览" bordered={false}>
              <div className="progress-row">
                <Progress
                  type="circle"
                  percent={summary.progress}
                  size={72}
                  format={(p) => `${p}%`}
                />
                <div className="progress-stats">
                  <Text>总任务：{summary.total}</Text>
                  <Text type="success">已完成：{summary.finished}</Text>
                  <Text type="danger">失败：{summary.failed}</Text>
                </div>
              </div>
              <Alert
                type="info"
                style={{ marginTop: 12 }}
                content="当前仅展示样式，真实抓取逻辑未接入。"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="常用操作" bordered={false}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Button long type="outline" icon={<IconDownload />}>
                  导出 Markdown
                </Button>
                <Button long icon={<IconDownload />}>
                  导出 JSON
                </Button>
                <Button long type="text" icon={<IconRefresh />}>
                  清空列表
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card title="任务列表">
          <Table
            size="small"
            pagination={false}
            data={mockRows}
            columns={[
              {
                title: '标题',
                dataIndex: 'title',
                render: (col) => <Text ellipsis>{col}</Text>,
              },
              { title: '作者', dataIndex: 'author', width: 100 },
              { title: '评论', dataIndex: 'comments', width: 90 },
              {
                title: '状态',
                dataIndex: 'status',
                width: 110,
                render: (status: CrawlRow['status']) => (
                  <Tag color={statusColor[status]} size="small">
                    {status === 'queued'
                      ? '待抓取'
                      : status === 'processing'
                      ? '抓取中'
                      : status === 'done'
                      ? '已完成'
                      : '失败'}
                  </Tag>
                ),
              },
              { title: '发布时间', dataIndex: 'createdAt', width: 120 },
            ]}
          />
        </Card>

        <Card title="运行日志" extra={<Button type="text" size="small">清空</Button>}>
          <List
            size="small"
            dataSource={mockLogs}
            render={(item, idx) => <List.Item key={idx}>{item}</List.Item>}
          />
        </Card>
      </Space>
    </main>
  );
}

export default App;
