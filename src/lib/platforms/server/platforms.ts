/**
 * 服务端平台抓取器（包含 Playwright 依赖）
 *
 * ⚠️ 此文件只能被服务端代码导入，不能被客户端使用
 */

import type { Platform, PlatformId, Category, ScrapedData } from '../types';
import { xhsPlatform } from '../xhs';
import { source1688Platform } from '../source-1688';
import { sourcePddPlatform } from '../source-pdd';
import { sourceTaobaoPlatform } from '../source-taobao';
import { PLATFORM_NAMES } from '../index';

// ============== 平台注册表 ==============

/** 平台注册表（服务端专用） */
const PLATFORMS: Record<PlatformId, Platform> = {
  xhs: xhsPlatform,
  'source-1688': source1688Platform,
  'source-pdd': sourcePddPlatform,
  'source-taobao': sourceTaobaoPlatform,
  generic: { platformId: 'generic', displayName: '通用', searchUrl: () => '', scrape: async () => ({ status: 'pending', keyword: '', platformId: 'generic', contents: [], products: [], scrapedAt: 0, isManualMode: true }), platformBlacklist: [], platformNotes: '', fallbackToGeneric: false },
};

/** 获取平台实例 */
export function getPlatform(platformId: PlatformId): Platform {
  return PLATFORMS[platformId];
}

/** 获取所有平台列表 */
export function getAllPlatforms(): Platform[] {
  return Object.values(PLATFORMS);
}

export { PLATFORM_NAMES };

/**
 * 并行抓取各平台数据（服务端专用）
 */
export async function scrapeAllPlatforms(
  keyword: string,
  category: Category,
  platforms: PlatformId[]
): Promise<{
  scrapedDataList: ScrapedData[];
  scrapeStatus: Record<PlatformId, string>;
}> {
  const results = await Promise.allSettled(
    platforms.map(async (platformId) => {
      const platform = getPlatform(platformId);
      return await platform.scrape(keyword, category);
    })
  );

  const scrapedDataList: ScrapedData[] = [];
  const scrapeStatus: Record<PlatformId, string> = {} as any;

  results.forEach((result, index) => {
    const platformId = platforms[index];

    if (result.status === 'fulfilled') {
      scrapedDataList.push(result.value);
      scrapeStatus[platformId] = result.value.status;
    } else {
      const failedData: ScrapedData = {
        status: 'failed',
        keyword,
        platformId,
        contents: [],
        products: [],
        scrapedAt: Date.now(),
        isManualMode: false,
        error: result.reason?.message || '未知错误',
      };
      scrapedDataList.push(failedData);
      scrapeStatus[platformId] = 'failed';
    }
  });

  return { scrapedDataList, scrapeStatus };
}
