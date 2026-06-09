/**
 * 1688 货源抓取器
 *
 * 功能：从 1688 搜索同款/相似款货源
 * 抓取数据：商品名称、价格、起订量、销量、商家信息
 *
 * 架构：CDP 通过 Tauri webview 提取
 */

import type { Platform, PlatformId, Category, ScrapedData, ProductData } from './types';

// ============== 平台信息 ==============

const PLATFORM_ID: PlatformId = 'source-1688';
const DISPLAY_NAME = '1688';

// ============== 黑五类规则 ==============

const PLATFORM_BLACKLIST: any[] = []; // 货源平台暂不设黑五类限制

// ============== 平台特征备注 ==============

const PLATFORM_NOTES = `
1688 平台特征：
- 货源平台，B端采购为主
- 起订量门槛、阶梯价格
- 工厂直供 vs 贸易商
`;

// ============== URL构建 ==============

function buildSearchUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://s.1688.com/youyuan/index.htm?keywords=${encoded}`;
}

// ============== 抓取实现 ==============

async function scrape(keyword: string, category: Category): Promise<ScrapedData> {
  // TODO: 货源抓取器骨架，后续通过 CDP 提取 1688 数据
  return {
    status: 'pending',
    keyword,
    platformId: PLATFORM_ID,
    contents: [],
    products: [],
    scrapedAt: Date.now(),
    isManualMode: true,
    error: '1688 货源抓取器开发中，请使用手动粘贴模式',
  };
}

// ============== 导出平台接口 ==============

export const source1688Platform: Platform = {
  platformId: PLATFORM_ID,
  displayName: DISPLAY_NAME,
  searchUrl: buildSearchUrl,
  scrape,
  platformBlacklist: PLATFORM_BLACKLIST,
  platformNotes: PLATFORM_NOTES,
  fallbackToGeneric: true,
};

export default source1688Platform;
