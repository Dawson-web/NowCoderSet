import axios from 'axios';
import type { MomentDetailData, MomentDetailResponse } from '@/type/feed';

// 独立的 axios 实例，基于 www.nowcoder.com 域名；仅封装请求，不在此处接入 UI。
const feedApi = axios.create({
  baseURL: 'https://www.nowcoder.com',
  withCredentials: true,
});

/**
 * 从帖子详情页的 HTML 中提取正文文本（基于 feed-content-text 容器）。
 * 使用正则匹配，不依赖 DOM。
 */
export const extractMomentContentText = (html: string): string => {
  try {
    console.log('【调试】进入extractMomentContentText，HTML长度：', html?.length || 0);
    if (!html) {
      console.log('【调试】HTML为空，返回空字符串');
      return '';
    }

    // 步骤1：创建临时DOM容器（重点：包裹try-catch）
    let tempContainer: HTMLDivElement;
    try {
      tempContainer = document.createElement('div');
      tempContainer.innerHTML = html;
      console.log('【调试】DOM解析完成');
    } catch (e) {
      console.error('【调试】DOM解析失败：', e);
      return html.replace(/<[^>]+>/g, '').trim(); // 兜底：直接去标签
    }

    // 步骤2：移除无关元素
    try {
      const irrelevantSelectors = [
        'header', 'footer', '.nc-nav-header', '.el-header',
        '.el-footer', '.hot-rank', '.creator-rank', '.discuss-topic',
        '.sidebar', '.nc-footer', '.el-aside', '[class*="nav"]',
        '[class*="rank"]', '[class*="footer"]', '[class*="header"]',
        '[data-v-2c883f16]'
      ];
      irrelevantSelectors.forEach(selector => {
        const elements = tempContainer.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
      console.log('【调试】无关元素移除完成');
    } catch (e) {
      console.error('【调试】移除无关元素失败：', e);
    }

    // 步骤3：定位正文
    let targetHtml = '';
    try {
      const feedContent = tempContainer.querySelector('.post-content-box');
      if (feedContent) {
        targetHtml = feedContent.innerHTML;
        console.log('【调试】找到.feed-content-text，长度：', targetHtml.length);
      } else {
        const contentContainer = tempContainer.querySelector('[class*="feed-content"]') ||
          tempContainer.querySelector('.el-main') ||
          tempContainer.querySelector('#jsApp .el-container > div:last-child');
        targetHtml = contentContainer ? contentContainer.innerHTML : tempContainer.innerHTML;
        console.log('【调试】使用备选容器，长度：', targetHtml.length);
      }
    } catch (e) {
      console.error('【调试】定位正文失败：', e);
      targetHtml = tempContainer.innerHTML;
    }

    if (!targetHtml) {
      console.log('【调试】目标HTML为空，返回空字符串');
      return '';
    }

    // 步骤4：文本处理
    let result = '';
    try {
      // 解码实体
      const tempEl = document.createElement('textarea');
      tempEl.innerHTML = targetHtml;
      const decoded = tempEl.value.replace(/\u00a0/g, ' ');

      // 移除脚本/样式
      const stripScriptsStyles = decoded
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

      // 处理换行和标签
      const withNewlines = stripScriptsStyles
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n\n')
        .replace(/<\/?(h[1-6]|li|tr)[^>]*>/gi, '\n');

      // 去标签+清理空格
      result = withNewlines
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s+/g, ' ')
        .replace(/\n /g, '\n')
        .trim();

      console.log('【调试】文本处理完成，结果长度：', result.length);
    } catch (e) {
      console.error('【调试】文本处理失败：', e);
      result = targetHtml.replace(/<[^>]+>/g, '').trim(); // 兜底
    }

    return result;
  } catch (error) {
    // 捕获所有未预期的错误
    console.error('【extractMomentContentText 总错误】：', error);
    return html ? html.replace(/<[^>]+>/g, '').trim() : ''; // 最终兜底
  }
};
/**
 * 直接获取帖子详情页 HTML，用于在前端自行解析正文。
 */
export const fetchMomentDetailHtml = async (uuid: string): Promise<string> => {
  if (!uuid) {
    throw new Error('缺少帖子 uuid');
  }

  const { data } = await feedApi.get<string>(`/feed/main/detail/${uuid}?sourceSSR=search`, {
    params: { _: Date.now() },
    responseType: 'text',
  });

  return data;
};

/**
 * 通过讨论帖/帖子 UUID 获取 HTML 内容。
 * rc_type = 207 场景使用。
 */
export const fetchDiscussDetailHtml = async (uuid: string): Promise<string> => {
  if (!uuid) {
    throw new Error('缺少讨论帖 uuid');
  }

  const { data } = await feedApi.get<string>(`/discuss/${uuid}`, {
    params: { _: Date.now() },
    responseType: 'text',
  });

  return data;
};
