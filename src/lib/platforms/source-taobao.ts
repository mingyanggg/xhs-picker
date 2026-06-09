/**
 * 淘宝货源抓取器
 *
 * 功能：从淘宝搜索同款/相似款货源
 * 抓取数据：商品名称、价格、销量、店铺信息
 *
 * 架构：CDP 通过 Tauri webview 提取
 */

import type { Platform, PlatformId, Category, ScrapedData } from './types';

const PLATFORM_ID: PlatformId = 'source-taobao';
const DISPLAY_NAME = '淘宝';
const PLATFORM_BLACKLIST: any[] = [];
const PLATFORM_NOTES = `
淘宝平台特征：
- 综合电商平台，品类全
- 有天猫旗舰店、品牌授权
- 价格带覆盖广
`;

function buildSearchUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://s.taobao.com/search?q=${encoded}`;
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
    error: '淘宝货源抓取器开发中，请使用手动粘贴模式',
  };
}

export const sourceTaobaoPlatform: Platform = {
  platformId: PLATFORM_ID,
  displayName: DISPLAY_NAME,
  searchUrl: buildSearchUrl,
  scrape,
  platformBlacklist: PLATFORM_BLACKLIST,
  platformNotes: PLATFORM_NOTES,
  fallbackToGeneric: true,
};

export default sourceTaobaoPlatform;
