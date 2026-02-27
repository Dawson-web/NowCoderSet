import { Form, Message } from '@arco-design/web-react';
import { useMemo, useState } from 'react';
import { fetchSearch } from '@/service/search';
import { fetchDiscussDetailHtml, fetchMomentDetailHtml, extractMomentContentText } from '@/service/feed';
import type { SearchRecord } from '@/type/search';
import { filterContentType } from '@/utils';
import type { TaskItem, TaskSummary, ListDataItem } from './types';
import CrawlConfigCard from './CrawlConfigCard';
import ProgressAndActions from './ProgressAndActions';
import ArticleListCard from './ArticleListCard';

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

const toPlainText = (html?: string) => {
  if (!html) return '';
  try {
    return extractMomentContentText(html);
  } catch {
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

interface CrawlPanelProps {
  addLog: (message: string) => void;
}

const CrawlPanel = ({ addLog }: CrawlPanelProps) => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [running, setRunning] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState('');

  const updateTask = (taskId: string, patch: Partial<TaskItem>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
  };

  const handleExport = async (fmt?: 'markdown' | 'json') => {
    const { dedup = true, format = 'markdown', keyword, pages } = form.getFieldsValue();
    const exportFormat = fmt || format || 'markdown';

    const successTasks = dedupeTasks(
      tasks.filter((t) => t.status === 'success'),
      Boolean(dedup),
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

  const summary: TaskSummary = useMemo(() => {
    const total = tasks.length;
    const finished = tasks.filter((t) => t.status === 'success').length;
    const failed = tasks.filter((t) => t.status === 'failed').length;
    const done = finished + failed;
    const progress = total ? Math.round((done / total) * 100) : 0;
    return { total, finished, failed, pending: total - done, progress };
  }, [tasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((t) => !filterKeyword || t.title?.includes(filterKeyword)),
    [tasks, filterKeyword],
  );

  const listData: ListDataItem[] = useMemo(
    () =>
      filteredTasks.map((t, idx) => ({
        key: t.id || idx,
        title: t.title ?? '未命名',
        description: `${t.record?.data?.userBrief?.nickname ?? '匿名'} · ${t.rcType ?? '-'} · ${t.status}`,
        avatar: t.record?.data?.userBrief?.headImgUrl || 'https://static.nowcoder.com/img/logo.2c51d66.svg',
        likes: (t.record?.data as any)?.frequencyData?.likeCnt ?? 0,
        stars: idx + 1,
        url: t.url,
        rcType: t.rcType,
      })),
    [filteredTasks],
  );

  return (
    <div className="nc-tab-content">
      <CrawlConfigCard form={form} running={running} onStart={handleStart} />
      <ProgressAndActions
        summary={summary}
        hasTask={tasks.length > 0}
        onExportMarkdown={() => handleExport('markdown')}
        onExportJson={() => handleExport('json')}
        onClear={() => setTasks([])}
      />
      <ArticleListCard listData={listData} />
    </div>
  );
};

export default CrawlPanel;
