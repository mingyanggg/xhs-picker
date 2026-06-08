/**
 * 小红书数据抓取 - Playwright 无头浏览器方案
 *
 * 架构：用户登录内置浏览器 → 工具读取 DOM/cookies → 提取真实数据
 * 当前：服务端 Playwright 无头模式（用户登录后可增强）
 */

import { chromium, Browser } from 'playwright';
import type { ContentItem } from './types';

interface ScrapedNotes {
  contents: ContentItem[];
  totalNotes: number;
  avgEngagement: number;
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--no-sandbox'],
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser && browser.isConnected()) {
    await browser.close();
    browser = null;
  }
}

export async function scrapeXHS(keyword: string): Promise<ScrapedNotes> {
  const br = await getBrowser();
  const page = await br.newPage();

  try {
    const url = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(4000);

    // 方法1：从页面全局 state 提取
    const fromState = await page.evaluate(() => {
      const state = (window as any).__INITIAL_STATE__;
      if (!state) return null;
      const items = state?.noteSearch?.items || state?.search?.notes || [];
      return items.slice(0, 20);
    });

    if (fromState && fromState.length > 0) {
      const contents: ContentItem[] = fromState.map((item: any) => {
        const n = item.note || item;
        const eng = n.interactionInfo || n;
        return {
          id: n.id || '',
          title: n.title || n.displayTitle || '',
          url: n.id ? `https://www.xiaohongshu.com/discovery/item/${n.id}` : '',
          publishTime: n.time || n.lastUpdateTime || '',
          engagement: {
            likes: eng.likedCount || eng.liked_count || 0,
            collects: eng.collectedCount || eng.collected_count || 0,
            comments: eng.commentCount || eng.comment_count || 0,
            shares: eng.shareCount || eng.share_count || 0,
            total: 0,
          },
          account: {
            id: n.user?.userId || n.creator?.userId || '',
            nickname: n.user?.nickname || n.creator?.nickname || '',
            avatar: n.user?.avatar || n.creator?.avatar || '',
            followers: n.user?.followers || n.creator?.followers || 0,
          },
          isLowFollowerViral: false,
        };
      }).filter((c: ContentItem) => c.id);

      if (contents.length > 0) {
        const total = contents.reduce((sum, c) => sum + c.engagement.likes, 0);
        return { contents, totalNotes: contents.length, avgEngagement: Math.round(total / contents.length) };
      }
    }

    // 方法2：拦截网络请求
    const notes = await extractViaNetwork(page);
    if (notes.length > 0) {
      const total = notes.reduce((sum, c) => sum + c.engagement.likes, 0);
      return { contents: notes, totalNotes: notes.length, avgEngagement: Math.round(total / notes.length) };
    }

    return { contents: [], totalNotes: 0, avgEngagement: 0 };

  } catch (e) {
    console.error('小红书抓取失败:', e);
    return { contents: [], totalNotes: 0, avgEngagement: 0 };
  } finally {
    await page.close();
  }
}

async function extractViaNetwork(page: any): Promise<ContentItem[]> {
  try {
    const [resp] = await Promise.all([
      page.waitForResponse((r: any) => r.url().includes('search') && r.url().includes('note'), { timeout: 8000 }).catch(() => null),
      page.reload({ waitUntil: 'domcontentloaded' }),
    ]);
    if (!resp) return [];
    const data = await resp.json().catch(() => null);
    const items = data?.data?.items || data?.items || [];
    return items.map((item: any) => ({
      id: item.id || '',
      title: item.title || '',
      url: item.id ? `https://www.xiaohongshu.com/discovery/item/${item.id}` : '',
      publishTime: item.time || '',
      engagement: {
        likes: item.likedCount || 0,
        collects: item.collectedCount || 0,
        comments: item.commentCount || 0,
        shares: item.shareCount || 0,
        total: 0,
      },
      account: {
        id: item.user?.userId || '',
        nickname: item.user?.nickname || '',
        avatar: item.user?.avatar || '',
        followers: item.user?.followers || 0,
      },
      isLowFollowerViral: false,
    })).filter((c: ContentItem) => c.id);
  } catch { return []; }
}
