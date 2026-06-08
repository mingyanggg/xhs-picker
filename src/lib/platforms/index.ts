/**
 * 平台抽象层统一导出
 *
 * 统一导出所有平台抓取器，方便主流程调用
 */

import type { Platform, PlatformId } from './types';

// 导出各平台抓取器
export { xhsPlatform } from './xhs';
export { kuaishouPlatform, scrapeKuaishou } from './kuaishou';
export { douyinPlatform, scrapeDouyin } from './douyin';
export { shipinhaoPlatform, scrapeShipinhao } from './shipinhao';
export { genericPlatform, parseManualData, SCRAPE_TEMPLATES } from './generic';
import { genericPlatform as genericPlat } from './generic';
export { genericPlat as genericPlatformAlt };

// 导出类型
export type {
  Platform,
  PlatformId,
  Category,
  ScrapedData,
  ContentItem,
  ProductData,
} from './types';

// ============== 平台注册表 ==============

/** 平台注册表（用于动态获取平台实例） */
export const PLATFORMS: Record<PlatformId, Platform> = {
  xhs: require('./xhs').xhsPlatform,
  kuaishou: require('./kuaishou').kuaishouPlatform,
  douyin: require('./douyin').douyinPlatform,
  shipinhao: require('./shipinhao').shipinhaoPlatform,
  generic: require('./generic').genericPlatform,
};

/** 获取平台实例 */
export function getPlatform(platformId: PlatformId): Platform {
  return PLATFORMS[platformId];
}

/** 获取所有平台列表 */
export function getAllPlatforms(): Platform[] {
  return Object.values(PLATFORMS);
}

/** 平台ID到显示名称映射 */
export const PLATFORM_NAMES: Record<PlatformId, string> = {
  xhs: '小红书',
  kuaishou: '快手',
  douyin: '抖音',
  shipinhao: '视频号',
  generic: '通用',
};

/** 平台图标（emoji） */
export const PLATFORM_ICONS: Record<PlatformId, string> = {
  xhs: '📕',
  kuaishou: '📱',
  douyin: '🎵',
  shipinhao: '📹',
  generic: '🌐',
};