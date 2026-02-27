import type { SearchRecord } from '@/type/search';
import type { CrawlTask } from '@/type/feed';
import type { FormInstance } from '@arco-design/web-react';

export type TaskItem = CrawlTask & {
  record: SearchRecord;
  uuid?: string;
  content?: string;
  page?: number;
};

export interface TaskSummary {
  total: number;
  finished: number;
  failed: number;
  pending: number;
  progress: number;
}

export interface ListDataItem {
  key: string | number;
  title: string;
  description: string;
  avatar: string;
  likes: number;
  stars: number;
  url: string;
  rcType?: number;
}

export interface CrawlConfigCardProps {
  form: FormInstance;
  running: boolean;
  onStart: () => void;
}

export interface ProgressAndActionsProps {
  summary: TaskSummary;
  hasTask: boolean;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onClear: () => void;
}

export interface ArticleListCardProps {
  listData: ListDataItem[];
}

export interface LogsPanelProps {
  logs: string[];
  onClear: () => void;
}
