/**
 * 视频号平台抓取器
 *
 * 功能：视频号无公开API，走generic接口封装
 * 方案：通过用户登录视频号助手后CDP读取数据
 * 降级：手动粘贴模式
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

const PLATFORM_ID: PlatformId = 'shipinhao';
const DISPLAY_NAME = '视频号';

// ============== 平台黑五类规则 ==============

const PLATFORM_BLACKLIST: BlacklistRule[] = [
  {
    id: 'shipinhao-block-1',
    keyword: '医疗器械',
    level: 'blocked',
    reason: '医疗器械推广需要资质',
    riskNote: '无资质推广违法',
    applicablePlatforms: ['shipinhao'],
  },
];

// ============== 平台特征备注（给AI用） ==============

const PLATFORM_NOTES = `
视频号平台特征（2026）：
- 用户画像：微信生态，中老年+高客单，依赖社交关系链
- 内容形式：短视频+直播，依托微信社交分发
- 互动特点：社交裂变能力强，但传播速度慢
- 爆款规律：
  1. 社交推荐：朋友圈分享带来持续流量
  2. 中老年用户：高客单、品质型产品适合
  3. 熟人经济：信任度高，复购率高
  4. 私域联动：视频号+公众号+小程序联动强
- 选品建议：
  1. 优先考虑高客单、高品质产品
  2. 适合中老年需求（健康、养老、旅游）
  3. 注重产品口碑和品牌背书
- 特别注意：
  - 视频号依赖微信生态，需要用户登录
  - 无公开搜索API，必须通过generic模式接入
`;

// ============== URL构建 ==============

// 视频号没有公开搜索API，返回空字符串
// 用户需要在内置浏览器中手动打开
function buildSearchUrl(keyword: string): string {
  // 视频号助手URL
  return '';
}

// ============== 抓取实现 ==============

async function scrape(
  keyword: string,
  category: Category
): Promise<ScrapedData> {
  // 视频号没有公开API，必须通过用户登录后的generic模式
  // 返回 pending 状态，提示用户通过内置浏览器操作

  return {
    status: 'pending',
    keyword,
    platformId: PLATFORM_ID,
    contents: [],
    products: [],
    scrapedAt: Date.now(),
    isManualMode: false,
    error: '视频号无公开API，请在内置浏览器中登录视频号助手后使用generic模式抓取',
  };
}

// ============== 导出平台接口 ==============

export const shipinhaoPlatform: Platform = {
  platformId: PLATFORM_ID,
  displayName: DISPLAY_NAME,
  searchUrl: buildSearchUrl,
  scrape,
  platformBlacklist: PLATFORM_BLACKLIST,
  platformNotes: PLATFORM_NOTES,
  fallbackToGeneric: true, // 总是回退到generic
};

export default shipinhaoPlatform;
export { scrape as scrapeShipinhao };