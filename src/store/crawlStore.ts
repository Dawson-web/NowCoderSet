import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 持久化存储的任务结果项（精简版，不存 SearchRecord 原始数据避免 localStorage 爆满）
export interface HistoryTaskItem {
  id: string;
  uuid: string;
  title: string;
  status: 'pending' | 'fetching' | 'success' | 'failed';
  url: string;
  rcType?: number;
  author?: string;
  content?: string;
  createdAt: number;
  finishedAt?: number;
  error?: string;
}

// 一次爬取任务的完整记录
export interface CrawlHistoryItem {
  id: string;
  keyword: string;
  pages: number;
  dedup: boolean;
  format: string;
  tasks: HistoryTaskItem[];
  logs: string[];
  startedAt: number;
  finishedAt?: number;
}

interface CrawlStoreState {
  history: CrawlHistoryItem[];
  addHistory: (item: CrawlHistoryItem) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryUuids: () => Set<string>;
}

export const useCrawlStore = create<CrawlStoreState>()(
  persist(
    (set, get) => ({
      history: [],

      addHistory: (item) => {
        set((state) => ({
          history: [item, ...state.history],
        }));
      },

      removeHistory: (id) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getHistoryUuids: () => {
        const uuids = new Set<string>();
        for (const h of get().history) {
          for (const t of h.tasks) {
            if (t.uuid && t.status === 'success') {
              uuids.add(t.uuid);
            }
          }
        }
        return uuids;
      },
    }),
    {
      name: 'nc-crawl-store',
    },
  ),
);
