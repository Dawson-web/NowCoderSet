import {
  Button,
  Card,
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
  Message,
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconDownload,
  IconMinusCircleFill,
  IconPause,
  IconPlayArrow,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { useMemo, useState } from 'react';
import UserInfoCard from './components/UserInfoCard';
import { fetchSearch } from '@/service/search';
import { fetchDiscussDetailHtml, fetchMomentDetailHtml, extractMomentContentText } from '@/service/feed';
import type { SearchRecord } from '@/type/search';
import type { CrawlTask } from '@/type/feed';
import { filterContentType } from '@/utils';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

const { Title, Text } = Typography;
const { Row, Col } = Grid;

type TaskItem = CrawlTask & {
  record: SearchRecord;
  content?: string;
  page?: number;
};

function FloatingPanel() {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState('腾讯');

  const addLog = (message: string) => {
    const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs((prev) => [`[${ts}] ${message}`, ...prev].slice(0, 200));
  };

  const getTaskId = (record: SearchRecord, page?: number, idx?: number) =>
    record.data?.contentId?.toString() ||
    record.data?.momentData?.uuid ||
    record.trackId ||
    `${record.rc_type || 'task'}-${page ?? 'p'}-${idx ?? 'i'}`;

  const buildTaskFromRecord = (record: SearchRecord, page: number, idx: number): TaskItem => {
    const title =
      filterContentType(record)?.title ||
      record.data?.contentData?.title ||
      record.title ||
      '未命名';
    const id = getTaskId(record, page, idx);

    const url =
      record.rc_type === 201
        ? `https://www.nowcoder.com/feed/main/detail/${record.data?.momentData?.uuid ?? ''}`
        : record.rc_type === 207
          ? `https://www.nowcoder.com/discuss/${record.data?.momentData?.uuid ?? record.data?.contentId ?? ''}`
          : '';

    return {
      id,
      title,
      status: 'pending',
      url,
      rcType: record.rc_type,
      createdAt: Date.now(),
      record,
      page,
    };
  };

  const updateTask = (taskId: string, patch: Partial<TaskItem>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
  };

  const toPlainText = (html?: string) => {
    if (!html) return '';
    try {
      return extractMomentContentText(html);
    } catch (e) {
      return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  };

  const dedupeTasks = (list: TaskItem[], dedup: boolean) => {
    if (!dedup) return list;
    const seen = new Set<string>();
    return list.filter((t) => {
      const key = t.url || t.title || t.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const downloadBlob = (data: string, filename: string, mime: string) => {
    const blob = new Blob([data], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (fmt?: 'markdown' | 'json') => {
    const { dedup = true, format = 'markdown', keyword, pages } = form.getFieldsValue();
    const exportFormat = fmt || format || 'markdown';

    const successTasks = dedupeTasks(
      tasks.filter((t) => t.status === 'success'),
      Boolean(dedup)
    );

    if (!successTasks.length) {
      Message.info('暂无可导出的成功内容');
      return;
    }

    const ts = new Date();
    const tsLabel = ts.toISOString().replace(/[-:T]/g, '').slice(0, 15);

    if (exportFormat === 'json') {
      const payload = successTasks.map((t) => ({
        id: t.id,
        title: t.title,
        rcType: t.rcType,
        url: t.url,
        author: t.record?.data?.userBrief?.nickname,
        content: toPlainText(t.content),
        createdAt: t.createdAt,
        finishedAt: t.finishedAt,
      }));
      downloadBlob(JSON.stringify(payload, null, 2), `nowcoder-export-${tsLabel}.json`, 'application/json');
      addLog('已导出 JSON 文件');
      return;
    }

    // markdown
    const lines: string[] = [];
    lines.push('# 牛客抓取导出');
    lines.push('');
    lines.push(`- 导出时间：${ts.toLocaleString()}`);
    lines.push(`- 关键词：${keyword || '（全部）'}`);
    lines.push(`- 抓取页数：${pages || '-'} 页`);
    lines.push(`- 结果数：${successTasks.length} 条`);
    lines.push(`- 去重：${dedup ? '是' : '否'}`);
    lines.push('');

    successTasks.forEach((t, idx) => {
      lines.push(`## ${idx + 1}. ${t.title || '未命名'}`);
      lines.push(`- 来源类型：${t.rcType ?? '-'}`);
      lines.push(`- 链接：${t.url || '-'}`);
      lines.push(`- 作者：${t.record?.data?.userBrief?.nickname ?? '-'}`);
      lines.push('');
      const contentText = toPlainText(t.content);
      lines.push(contentText || '*（正文为空）*');
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    downloadBlob(lines.join('\n'), `nowcoder-export-${tsLabel}.md`, 'text/markdown');
    addLog('已导出 Markdown 文件');
  };

  const handleStart = async () => {
    try {
      const { pages, keyword } = await form.validate();
      const pageCount = Math.max(1, Number(pages) || 1);
      const searchKey = (keyword ?? '').trim();

      setRunning(true);
      setLogs([]);
      setTasks([]);
      setFilterKeyword(searchKey);

      addLog(`开始抓取，关键词：${searchKey || '（全部）'}，页数：${pageCount}`);

      const stagedTasks: TaskItem[] = [];

      for (let p = 1; p <= pageCount; p += 1) {
        addLog(`搜索第 ${p} 页...`);
        const data = await fetchSearch({
          type: 'all',
          query: searchKey,
          page: p,
          tag: [],
          order: '',
          gioParams: {},
        });
        const records = data?.records ?? [];
        addLog(`第 ${p} 页返回 ${records.length} 条记录`);
        stagedTasks.push(...records.map((r, idx) => buildTaskFromRecord(r, p, idx)));
      }

      setTasks(stagedTasks);

      for (const task of stagedTasks) {
        const { record, id: taskId } = task;

        updateTask(taskId, { status: 'fetching' });
        const title =
          filterContentType(record)?.title || record.data?.contentData?.title || '未命名';

        try {
          let content = '';
          if (record.rc_type === 201) {
            const uuid = record.data?.momentData?.uuid ?? record.data?.contentId;
            if (!uuid) {
              throw new Error('缺少 contentData.id');
            }
            console.log(201, uuid, record)
            content = await fetchMomentDetailHtml(String(uuid));
          } else if (record.rc_type === 207) {
            const uuid = record.data?.momentData?.uuid ?? record.data?.contentId;
            if (!uuid) throw new Error('缺少 momentData.uuid');
            content = await fetchDiscussDetailHtml(String(uuid));
          } else {
            throw new Error(`暂不支持的 rc_type：${record.rc_type}`);
          }

          updateTask(taskId, { status: 'success', finishedAt: Date.now(), content });
          addLog(`成功抓取：《${title}》`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          updateTask(taskId, { status: 'failed', finishedAt: Date.now(), error: message });
          addLog(`抓取失败：《${title}》 - ${message}`);
        }
      }

      addLog('任务完成');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '启动任务失败';
      addLog(msg);
    } finally {
      setRunning(false);
    }
  };

  const summary = useMemo(() => {
    const total = tasks.length;
    const finished = tasks.filter((t) => t.status === 'success').length;
    const failed = tasks.filter((t) => t.status === 'failed').length;
    const done = finished + failed;
    const progress = total ? Math.round((done / total) * 100) : 0;
    return {
      total,
      finished,
      failed,
      pending: total - done,
      progress,
    };
  }, [tasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((t) => !filterKeyword || t.title?.includes(filterKeyword)),
    [tasks, filterKeyword]
  );

  return (
    <main className="popup nc-trancy">
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div className="nc-hero">
          <div className="nc-hero__logo">NC</div>
          <div className="nc-hero__text">
            <Title heading={4} style={{ margin: 0 }}>
              NowCoder Panel
            </Title>
            <Text type="secondary">更圆润的采集助手</Text>
          </div>
          <Button type="primary" size="small" className="nc-glass-btn" icon={<IconPlayArrow />}>
            新建任务
          </Button>
        </div>

        <Grid.Row gutter={12}>
          <Col span={12}>
            <Card className="nc-card nc-pill" bodyStyle={{ padding: 14 }}>
              <div className="nc-pill__icon success">✔</div>
              <div className="nc-pill__text">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  已完成
                </Text>
                <Title heading={3} style={{ margin: 0 }}>
                  {summary.finished}
                </Title>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className="nc-card nc-pill" bodyStyle={{ padding: 14 }}>
              <div className="nc-pill__icon purple">☁</div>
              <div className="nc-pill__text">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  待抓取
                </Text>
                <Title heading={3} style={{ margin: 0 }}>
                  {summary.pending}
                </Title>
              </div>
            </Card>
          </Col>
        </Grid.Row>

        <UserInfoCard />

        <Card
          className="nc-card"
          title="抓取配置"
          extra={
            <Space>
              <Button type="primary" icon={<IconPlayArrow />} onClick={handleStart} loading={running}>
                开始抓取
              </Button>
              <Button type="outline" icon={<IconPause />} disabled>
                暂停
              </Button>
              <Button icon={<IconDownload />} onClick={() => handleExport()}>
                导出结果
              </Button>
            </Space>
          }
        >
          <Form
            layout="vertical"
            form={form}
            initialValues={{
              pages: 1,
              keyword: '腾讯',
              dedup: true,
              format: 'markdown',
            }}
          >
            <Grid.Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="最大页数"
                  field="pages"
                  rules={[
                    { required: true, message: '请填写最大页数' },
                    {
                      validator: (_value, cb) => {
                        const num = Number(_value);
                        if (Number.isNaN(num) || num <= 0) {
                          cb('请输入大于 0 的数字');
                        } else {
                          cb();
                        }
                      },
                    },
                  ]}
                >
                  <Input placeholder="例如 3 页" inputMode="numeric" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="关键字过滤（可选）"
                  field="keyword"
                  tooltip="匹配标题或正文关键字"
                >
                  <Input placeholder="算法 / 秋招 / Java..." allowClear />
                </Form.Item>
              </Col>
            </Grid.Row>

            <Grid.Row gutter={12}>
              <Col span={12}>
                <Form.Item label="导出格式" field="format" >
                  <Radio.Group type="button" className="flex">
                    <Radio value="markdown">Markdown</Radio>
                    <Radio value="json">JSON</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="是否去重"
                  field="dedup"
                  triggerPropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Grid.Row>
          </Form>
        </Card>

        <Row gutter={12}>
          <Col span={12}>
            <Card className="nc-card" title="进度概览" bordered={false}>
              <div className="progress-row">
                <Progress type='circle' percent={summary.progress} />

                <div className="progress-stats">
                  <Text type="primary"><IconMinusCircleFill className='mr-1' />进行中：{summary.pending}</Text>
                  <Text type="success"><IconCheckCircleFill className='mr-1' />已完成：{summary.finished}</Text>
                  <Text type="error"><IconCloseCircleFill className='mr-1' />已失败：{summary.failed}</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className="nc-card" title="常用操作" bordered={false}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Button long type="outline" icon={<IconDownload />} onClick={() => handleExport('markdown')} disabled={!tasks.length}>
                  导出 Markdown
                </Button>
                <Button long icon={<IconDownload />} onClick={() => handleExport('json')} disabled={!tasks.length}>
                  导出 JSON
                </Button>
                <Button long type="text" icon={<IconRefresh />} onClick={() => setTasks([])}>
                  清空列表
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card
          className="nc-card"
          title="文章列表"
          extra={
            <Space>
              <Input
                allowClear
                placeholder="输入关键词（如：腾讯）"
                value={filterKeyword}
                onChange={(v) => setFilterKeyword(v)}
                style={{ width: 180 }}
              />
              <Button type="text" icon={<IconRefresh />} onClick={() => setFilterKeyword('')}>
                重置
              </Button>
            </Space>
          }
        >
          <Table<TaskItem>
            size="small"
            loading={running && tasks.length === 0}
            pagination={false}
            rowKey={(row) => row.id}
            data={filteredTasks}
            columns={[
              {
                title: '标题',
                width: 200,
                render: (_col, record) => (
                  <Text ellipsis>{record.title ?? '-'}</Text>
                ),
              },
              {
                title: '作者',
                width: 120,
                render: (_col, record) => record.record?.data?.userBrief?.nickname ?? '-',
              },
              {
                title: '来源',
                width: 80,
                render: (_col, record) => <Tag color="purple">{record.rcType || '-'}</Tag>,
              },
              {
                title: '状态',
                width: 110,
                render: (_col, record) => {
                  const color =
                    record.status === 'success'
                      ? 'green'
                      : record.status === 'failed'
                        ? 'red'
                        : record.status === 'fetching'
                          ? 'arcoblue'
                          : 'orangered';
                  const text =
                    record.status === 'pending'
                      ? '待抓取'
                      : record.status === 'fetching'
                        ? '抓取中'
                        : record.status === 'success'
                          ? '成功'
                          : '失败';
                  return <Tag color={color}>{text}</Tag>;
                },
              },
              {
                title: '链接',
                width: 140,
                render: (_col, record) =>
                  record.url ? (
                    <a href={record.url} target="_blank" rel="noreferrer">
                      查看
                    </a>
                  ) : (
                    '-'
                  ),
              },
            ]}
          />
        </Card>

        <Card
          title="运行日志"
          extra={
            <Button type="text" size="small" onClick={() => setLogs([])}>
              清空
            </Button>
          }
        >
          <List
            size="small"
            dataSource={logs}
            render={(item, idx) => <List.Item key={idx}>{item}</List.Item>}
          />
        </Card>
      </Space>
    </main>
  );
}

export default FloatingPanel;
