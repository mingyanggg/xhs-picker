/**
 * 小红书平台抓取器
 *
 * 方案：Playwright 无头浏览器渲染 SPA 后提取真实数据
 * 降级：Playwright 失败时返回空数据（让 AI 用已有 context 分析）
 */

import type {
  Platform,
  PlatformId,
  Category,
  ScrapedData,
  ContentItem,
  BlacklistRule,
} from './types';
import { scrapeXHS } from './xhs-scraper';

// ============== 平台信息 ==============

const PLATFORM_ID: PlatformId = 'xhs';
const DISPLAY_NAME = '小红书';

// ============== 黑五类规则 ==============

const PLATFORM_BLACKLIST: BlacklistRule[] = [
  {
    id: 'xhs-block-1',
    keyword: '医疗器械',
    level: 'blocked',
    reason: '医疗器械推广需要资质',
    riskNote: '无资质推广违法，可能面临法律诉讼',
    applicablePlatforms: ['xhs'],
  },
];

// ============== 平台特征备注（给AI用） ==============

const PLATFORM_NOTES = `
小红书平台特征（2026）：
- 用户画像：30+女性为主，种草+测评+大牌平替强
- 内容形式：图文笔记为主，视频笔记增长快
- 互动特点：收藏率高，用户决策周期长
- 爆款规律：低粉爆款、测评类、大牌平替、季节性
`;

// ============== URL构建 ==============

function buildSearchUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://www.xiaohongshu.com/search_result?keyword=${encoded}`;
}

// ============== 抓取实现 ==============

async function scrape(keyword: string, category: Category): Promise<ScrapedData> {
  try {
    // 调用 Playwright 抓取真实数据
    const { contents, totalNotes, avgEngagement } = await scrapeXHS(keyword);

    // 计算蓝海指数 = 搜索指数 / 笔记数（比值越小越蓝海）
    const blueOceanRatio = totalNotes > 0 ? (1000 / totalNotes) : 0;

    return {
      status: contents.length > 0 ? 'success' : 'manual_fallback',
      keyword,
      platformId: PLATFORM_ID,
      contents,
      products: [],
      blueOceanRatio,
      scrapedAt: Date.now(),
      isManualMode: contents.length === 0,
    };
  } catch (error) {
    return {
      status: 'failed',
      keyword,
      platformId: PLATFORM_ID,
      contents: [],
      products: [],
      scrapedAt: Date.now(),
      isManualMode: true,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// ============== 导出平台接口 ==============

export const xhsPlatform: Platform = {
  platformId: PLATFORM_ID,
  displayName: DISPLAY_NAME,
  searchUrl: buildSearchUrl,
  scrape,
  platformBlacklist: PLATFORM_BLACKLIST,
  platformNotes: PLATFORM_NOTES,
  fallbackToGeneric: true,
};

export default xhsPlatform;
