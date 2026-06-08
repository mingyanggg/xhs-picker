/**
 * 通用兜底接入器
 *
 * 功能：
 * - 作为所有平台的兜底接入器
 * - 读取用户在内置浏览器中登录后的任意平台页面DOM数据
 * - 支持视频号、B站、知乎等没有公开API的平台
 * - 支持第三方数据平台（千瓜、灰豚、蝉妈妈等）
 *
 * 方案：CDP协议读取页面DOM数据
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

const PLATFORM_ID: PlatformId = 'generic';
const DISPLAY_NAME = '通用';

// ============== 平台黑五类规则 ==============

const PLATFORM_BLACKLIST: BlacklistRule[] = [];

// ============== 平台特征备注（给AI用） ==============

const PLATFORM_NOTES = `
通用模式说明：
- 用于没有公开API的平台（视频号、B站、知乎等）
- 用于读取用户登录的第三方数据平台数据
- 通过内置浏览器CDP读取页面DOM数据
- 支持的平台：
  1. 视频号：登录视频号助手
  2. B站：登录哔哩哔哩创作中心
  3. 知乎：登录知乎创作者中心
  4. 千瓜：登录千瓜数据
  5. 灰豚：登录灰豚数据
  6. 蝉妈妈：登录蝉妈妈数据
  7. 其他：用户自定义平台
- 降级方案：手动粘贴数据
`;

// ============== URL构建 ==============

// generic模式的URL是动态的，由用户在浏览器中打开
function buildSearchUrl(keyword: string): string {
  // 返回空字符串，URL由用户在内置浏览器中手动指定
  return '';
}

// ============== CDP读取辅助 ==============

/**
 * 通过CDP读取页面DOM数据
 *
 * 支持的读取模式：
 * - text: 读取文本内容
 * - html: 读取HTML内容
 * - attribute: 读取指定属性
 * - value: 读取表单值
 */
async function readPageContent(
  selector: string,
  mode: 'text' | 'html' | 'attribute' = 'text',
  attributeName?: string
): Promise<string | string[]> {
  // TODO: 实现CDP读取逻辑
  // 需要Tauri内置浏览器配合
  throw new Error('CDP读取需要Tauri内置浏览器配合');
}

// ============== 预定义的抓取模板 ==============

/** 预定义的抓取模板 */
export const SCRAPE_TEMPLATES = {
  /** 千瓜数据 */
  qiangua: {
    name: '千瓜数据',
    selectors: {
      notesCount: '.notes-count',
      engagement: '.engagement-total',
      accounts: '.account-list .account-item',
    },
  },
  /** 灰豚数据 */
  huitun: {
    name: '灰豚数据',
    selectors: {
      productRank: '.product-rank .item',
      salesCount: '.sales-count',
    },
  },
  /** 蝉妈妈 */
  chanmama: {
    name: '蝉妈妈',
    selectors: {
      viralProducts: '.viral-products .product',
      salesVolume: '.sales-volume',
    },
  },
};

// ============== 抓取实现 ==============

async function scrape(
  keyword: string,
  category: Category
): Promise<ScrapedData> {
  try {
    // generic模式需要用户提供具体的URL和数据源
    // 这里返回待处理状态，提示用户在浏览器中操作

    return {
      status: 'pending',
      keyword,
      platformId: PLATFORM_ID,
      contents: [],
      products: [],
      scrapedAt: Date.now(),
      isManualMode: false,
      error: 'generic模式：请在内置浏览器中打开目标页面，然后使用CDP读取数据',
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

// ============== 手动数据解析 ==============

/**
 * 解析手动粘贴的数据
 *
 * 支持的格式：
 * - JSON格式的结构化数据
 * - 纯文本（尝试自动解析）
 */
export function parseManualData(
  rawData: string,
  platformId: PlatformId
): { contents: ContentItem[]; products: any[] } {
  try {
    // 尝试解析JSON
    const parsed = JSON.parse(rawData);

    if (Array.isArray(parsed)) {
      // 直接是数组，假设是内容列表
      return {
        contents: parsed.map((item, index) => ({
          id: item.id || `manual-${index}`,
          title: item.title || item.text || '',
          url: item.url || '',
          publishTime: item.publishTime || item.date || '',
          engagement: item.engagement || {
            likes: item.likes || 0,
            collects: item.collects || 0,
            comments: item.comments || 0,
            shares: item.shares || 0,
            total: item.total || 0,
          },
          productUrl: item.productUrl || item.product_url || '',
          account: item.account || {
            name: item.author || item.accountName || '未知',
            followers: item.followers || 0,
            contentCount: item.contentCount || 0,
            avgEngagement: item.avgEngagement || 0,
          },
          isLowFollowerViral:
            (item.followers || 0) < 2000 && (item.engagement?.total || 0) > 100,
        })),
        products: [],
      };
    }

    return { contents: [], products: [] };
  } catch {
    // JSON解析失败，尝试纯文本解析
    // 这里可以添加更多的解析逻辑
    return { contents: [], products: [] };
  }
}

// ============== 导出平台接口 ==============

export const genericPlatform: Platform = {
  platformId: PLATFORM_ID,
  displayName: DISPLAY_NAME,
  searchUrl: buildSearchUrl,
  scrape,
  platformBlacklist: PLATFORM_BLACKLIST,
  platformNotes: PLATFORM_NOTES,
  fallbackToGeneric: false, // 已经是兜底，不需要再回退
};

export default genericPlatform;