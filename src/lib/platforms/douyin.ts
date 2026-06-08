/**
 * 抖音平台抓取器
 *
 * 功能：抓取抖音搜索页的视频数据+互动量
 * 方案：CDP协议读取页面DOM数据（通过Tauri内置浏览器）
 * 降级：CDP失败时提供手动粘贴模式
 */

import type {
  Platform,
  PlatformId,
  Category,
  ScrapedData,
  ContentItem,
  BlacklistRule,
} from './types';

// ============== 平台信息 ==============

const PLATFORM_ID: PlatformId = 'douyin';
const DISPLAY_NAME = '抖音';

// ============== 平台黑五类规则 ==============

const PLATFORM_BLACKLIST: BlacklistRule[] = [
  {
    id: 'douyin-block-1',
    keyword: '医疗器械',
    level: 'blocked',
    reason: '医疗器械推广需要资质',
    riskNote: '无资质推广违法，可能面临法律诉讼',
    applicablePlatforms: ['douyin'],
  },
  {
    id: 'douyin-block-2',
    keyword: '医美',
    level: 'restricted',
    reason: '医美推广需资质',
    riskNote: '无资质推广可能面临平台处罚',
    applicablePlatforms: ['douyin'],
  },
];

// ============== 平台特征备注（给AI用） ==============

const PLATFORM_NOTES = `
抖音平台特征（2026）：
- 用户画像：算法推荐+直播间+短视频种草，新奇特+冲动消费品爆款率高
- 内容形式：短视频+直播，种草和转化一体化
- 互动特点：流量大但转化难，需要高质量内容
- 爆款规律：
  1. 新奇特产品：新颖、有话题性的产品容易爆
  2. 冲动消费：低客单、视觉冲击强的品转化率高
  3. 直播间带动：直播间热度带动短视频曝光
  4. 热点借势：紧跟热门话题容易获得流量
- 选品建议：
  1. 优先考虑有视觉冲击力的品
  2. 适合新奇特、季节性、热点性产品
  3. 注重产品的前3秒吸引力
`;

// ============== URL构建 ==============

function buildSearchUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://www.douyin.com/search/${encoded}`;
}

// ============== CDP读取辅助 ==============

async function fetchPageViaCDP(url: string): Promise<string> {
  // TODO: 实现CDP读取逻辑
  throw new Error('CDP读取需要Tauri内置浏览器配合，当前为占位实现');
}

// ============== 抓取实现 ==============

async function scrape(
  keyword: string,
  category: Category
): Promise<ScrapedData> {
  try {
    const searchUrl = buildSearchUrl(keyword);

    let pageHtml = '';
    let isManualMode = false;

    try {
      pageHtml = await fetchPageViaCDP(searchUrl);
    } catch {
      isManualMode = true;
    }

    // 解析页面数据
    let contents: ContentItem[] = [];
    let totalVideos = 0;
    let avgEngagement = 0;

    if (!isManualMode && pageHtml) {
      // 解析逻辑
    }

    const blueOceanRatio = totalVideos > 0 ? (1000 / totalVideos) : 0;

    return {
      status: isManualMode ? 'manual_fallback' : 'success',
      keyword,
      platformId: PLATFORM_ID,
      contents,
      products: [],
      blueOceanRatio,
      scrapedAt: Date.now(),
      isManualMode,
    };
  } catch (error) {
    return {
      status: 'failed',
      keyword,
      platformId: PLATFORM_ID,
      contents: [],
      products: [],
      scrapedAt: Date.now(),
      isManualMode: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// ============== 导出平台接口 ==============

export const douyinPlatform: Platform = {
  platformId: PLATFORM_ID,
  displayName: DISPLAY_NAME,
  searchUrl: buildSearchUrl,
  scrape,
  platformBlacklist: PLATFORM_BLACKLIST,
  platformNotes: PLATFORM_NOTES,
  fallbackToGeneric: true,
};

export default douyinPlatform;
export { scrape as scrapeDouyin };