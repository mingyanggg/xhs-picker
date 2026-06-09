/**
 * 拼多多货源抓取器
 *
 * 功能：从拼多多搜索同款/相似款货源
 * 抓取数据：商品名称、价格、销量、店铺信息
 *
 * 架构：CDP 通过 Tauri webview 提取
 */

import type { Platform, PlatformId, Category, ScrapedData } from './types';

const PLATFORM_ID: PlatformId = 'source-pdd';
const DISPLAY_NAME = '拼多多';
const PLATFORM_BLACKLIST: any[] = [];
const PLATFORM_NOTES = `
拼多多平台特征：
- C端拼团模式，价格低
- 工厂直供多，白牌为主
- 低价走量
`;

function buildSearchUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://youhui.pinduoduo.com/search-result?keyword=${encoded}`;
}

async function scrape(keyword: string, category: Category): Promise<ScrapedData> {
  return {
    status: 'pending',
    keyword,
    platformId: PLATFORM_ID,
    contents: [],
    products: [],
    scrapedAt: Date.now(),
    isManualMode: true,
    error: '拼多多货源抓取器开发中，请使用手动粘贴模式',
  };
}

export const sourcePddPlatform: Platform = {
  platformId: PLATFORM_ID,
  displayName: DISPLAY_NAME,
  searchUrl: buildSearchUrl,
  scrape,
  platformBlacklist: PLATFORM_BLACKLIST,
  platformNotes: PLATFORM_NOTES,
  fallbackToGeneric: true,
};

export default sourcePddPlatform;
