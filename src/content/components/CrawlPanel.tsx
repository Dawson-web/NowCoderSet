import { Form, Message } from '@arco-design/web-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { fetchSearch } from '@/service/search';
import { fetchDiscussDetailHtml, fetchMomentDetailHtml, extractMomentContentText } from '@/service/feed';
import type { SearchRecord } from '@/type/search';
import { filterContentType } from '@/utils';
import { useCrawlStore } from '@/store/crawlStore';
import type { HistoryTaskItem } from '@/store/crawlStore';
import type { TaskItem, TaskSummary, ListDataItem } from './types';
import CrawlConfigCard from './CrawlConfigCard';
import ProgressAndActions from './ProgressAndActions';
import ArticleListCard from './ArticleListCard';

// 从 SearchRecord 中提取 uuid
const extractUuid = (record: SearchRecord): string =>
  record.data?.momentData?.uuid ||
  record.data?.contentData?.uuid ||
  record.data?.contentId?.toString() ||
  '';

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
  const uuid = extractUuid(record);

  const url =
    record.rc_type === 201
      ? `https://www.nowcoder.com/feed/main/detail/${record.data?.momentData?.uuid ?? ''}`
      : record.rc_type === 207
        ? `https://www.nowcoder.com/discuss/${record.data?.momentData?.uuid ?? record.data?.contentId ?? ''}`
        : '';

  return {
    id,
    uuid,
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
  getLogs: () => string[];
}

const CrawlPanel = ({ addLog, getLogs }: CrawlPanelProps) => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [running, setRunning] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState('');

  // 使用 ref 追踪最新 tasks，避免闭包陈旧问题
  const tasksRef = useRef<TaskItem[]>([]);

  const addHistory = useCrawlStore((s) => s.addHistory);
  const getHistoryUuids = useCrawlStore((s) => s.getHistoryUuids);

  const updateTask = useCallback((taskId: string, patch: Partial<TaskItem>) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
      tasksRef.current = next;
      return next;
    });
  }, []);

  const handleExport = async (fmt?: 'markdown' | 'json') => {
    const { dedup = true, format = 'markdown', keyword, pages } = form.getFieldsValue();
    const exportFormat = fmt || format || 'markdown';

    const successTasks = tasks.filter((t) => t.status === 'success');

    if (!successTasks.length) {
      Message.info('暂无可导出的成功内容');
      return;
    }

    const ts = new Date();
    const tsLabel = ts.toISOString().replace(/[-:T]/g, '').slice(0, 15);

    if (exportFormat === 'json') {
      const payload = successTasks.map((t) => ({
        id: t.id,
        uuid: t.uuid,
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
      const { pages, keyword, dedup, format } = await form.validate();
      const pageCount = Math.max(1, Number(pages) || 1);
      const searchKey = (keyword ?? '').trim();
      const enableDedup = Boolean(dedup);

      setRunning(true);
      setTasks([]);
      tasksRef.current = [];
      setFilterKeyword(searchKey);

      const historyId = `crawl-${Date.now()}`;
      const startedAt = Date.now();

      addLog(`开始抓取，关键词：${searchKey || '（全部）'}，页数：${pageCount}`);

      // 获取历史 uuid 集合用于去重
      const existingUuids = enableDedup ? getHistoryUuids() : new Set<string>();
      let skippedCount = 0;

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

        for (let idx = 0; idx < records.length; idx += 1) {
          const record = records[idx];
          const uuid = extractUuid(record);

          // uuid 去重：跳过历史中已存在的
          if (enableDedup && uuid && existingUuids.has(uuid)) {
            skippedCount += 1;
            continue;
          }

          const task = buildTaskFromRecord(record, p, idx);
          stagedTasks.push(task);

          // 将当次 uuid 也加入集合，避免本次内部重复
          if (uuid) {
            existingUuids.add(uuid);
          }
        }
      }

      if (skippedCount > 0) {
        addLog(`去重跳过 ${skippedCount} 条已存在的记录`);
      }

      setTasks(stagedTasks);
      tasksRef.current = stagedTasks;

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

      // 将本次任务写入持久化历史
      const finalTasks = tasksRef.current;
      const historyTasks: HistoryTaskItem[] = finalTasks.map((t) => ({
        id: t.id,
        uuid: t.uuid || extractUuid(t.record),
        title: t.title,
        status: t.status,
        url: t.url,
        rcType: t.rcType,
        author: t.record?.data?.userBrief?.nickname,
        content: t.content,
        createdAt: t.createdAt,
        finishedAt: t.finishedAt,
        error: t.error,
      }));

      addHistory({
        id: historyId,
        keyword: searchKey,
        pages: pageCount,
        dedup: enableDedup,
        format: format || 'markdown',
        tasks: historyTasks,
        logs: getLogs(),
        startedAt,
        finishedAt: Date.now(),
      });

      addLog('已保存到历史记录');
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
