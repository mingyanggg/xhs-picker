/**
 * Tauri Webview 数据提取 Hook
 *
 * 架构：前端调用 Rust 命令 → webview 执行 JS 提取数据 → emit 事件回传
 */

import { useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { ContentItem } from '@/lib/platforms/types';

interface PageData {
  notes: Array<{
    id: string;
    title: string;
    likes: number;
    collects: number;
    comments: number;
    shares: number;
    author: string;
    url: string;
  }>;
  keyword: string;
  url: string;
  error?: string;
}

interface UsePageDataExtractorOptions {
  onDataExtracted?: (data: ContentItem[], keyword: string) => void;
  onError?: (msg: string) => void;
  onStatus?: (msg: string) => void;
}

/**
 * 转换 Tauri 提取的原始数据为 ContentItem 格式
 */
function convertToContentItem(note: PageData['notes'][0]): ContentItem {
  return {
    id: note.id,
    title: note.title,
    url: note.url,
    publishTime: '',
    engagement: {
      likes: note.likes,
      collects: note.collects,
      comments: note.comments,
      shares: note.shares,
      total: note.likes + note.collects + note.comments + note.shares,
    },
    account: {
      id: '',
      name: note.author,
      nickname: note.author,
      avatar: '',
      followers: 0,
      contentCount: 0,
      avgEngagement: 0,
    },
    isLowFollowerViral: false,
  };
}

/**
 * 提取 Tauri webview 页面数据的 Hook
 */
export function usePageDataExtractor(options: UsePageDataExtractorOptions = {}) {
  const { onDataExtracted, onError, onStatus } = options;
  const unlistenRef = useRef<UnlistenFn | null>(null);

  // 监听 page-data 事件
  useEffect(() => {
    const setup = async () => {
      unlistenRef.current = await listen<PageData>('page-data', (event) => {
        const data = event.payload;

        if (data.error === 'need_login') {
          onError?.('请先登录小红书，再提取数据');
          onStatus?.('请在浏览器中登录后再点击「提取数据」');
          return;
        }

        if (data.error) {
          onError?.(`提取失败: ${data.error}`);
          onStatus?.(`错误: ${data.error}`);
          return;
        }

        if (!data.notes || data.notes.length === 0) {
          onError?.('未找到笔记数据，请确认页面已加载完成');
          onStatus?.('页面数据为空，尝试刷新页面');
          return;
        }

        // 转换数据格式
        const contents = data.notes.map(convertToContentItem);
        const keyword = data.keyword || '';

        onStatus?.(`成功提取 ${contents.length} 条笔记`);
        onDataExtracted?.(contents, keyword);
      });
    };

    setup();

    return () => {
      unlistenRef.current?.();
    };
  }, [onDataExtracted, onError, onStatus]);

  // 调用提取命令
  const extractPageData = useCallback(async (): Promise<boolean> => {
    try {
      onStatus?.('正在提取页面数据...');
      await invoke('extract_page_data');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onError?.(`调用失败: ${msg}`);
      return false;
    }
  }, [onStatus, onError]);

  return { extractPageData };
}
