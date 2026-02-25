import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from './user';
import type { SearchPayload, SearchResponse } from '@/type/search';

export const fetchSearch = async (payload: SearchPayload) => {
  const { data } = await api.post<SearchResponse>(`/api/sparta/pc/search?_=${Date.now()}`, payload);
  if (!data.success) {
    throw new Error(data.msg || '搜索请求失败');
  }
  return data.data;
};

export const useSearchQuery = (payload: SearchPayload | null) =>
  useQuery({
    queryKey: ['search', payload?.query, payload?.page, payload?.order],
    queryFn: () => {
      if (!payload) throw new Error('缺少搜索条件');
      return fetchSearch(payload);
    },
    enabled: Boolean(payload?.query),
    placeholderData: keepPreviousData,
    retry: 1,
  });
