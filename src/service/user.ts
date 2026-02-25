import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { NowcoderUserData, NowcoderUserResponse } from '@/type/user';

const api = axios.create({
  baseURL: 'https://gw-c.nowcoder.com',
  withCredentials: true,
});

export const getStoredNcUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('nc_userId');
};

export const fetchNowcoderUser = async (userId: string): Promise<NowcoderUserData> => {
  const { data } = await api.get<NowcoderUserResponse>(
    '/api/sparta/user/tracking/user-gio',
    {
      params: {
        userId,
        _: Date.now(),
      },
    }
  );

  if (!data.success) {
    throw new Error(data.msg || '接口返回失败');
  }

  return data.data ?? {};
};

export const useNowcoderUserQuery = () =>
  useQuery({
    queryKey: ['nowcoder-user'],
    queryFn: async () => {
      const userId = getStoredNcUserId();
      if (!userId) {
        throw new Error('localStorage 未找到 nc_userId，可先登录牛客或手动写入');
      }
      return fetchNowcoderUser(userId);
    },
    enabled: typeof window !== 'undefined',
    retry: 1,
  });
