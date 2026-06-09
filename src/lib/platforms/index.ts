/**
 * 平台抽象层 - 客户端安全版本
 *
 * ⚠️ 此模块只导出类型和常量
 * ⚠️ 所有含 Playwright 的模块必须通过 /api/analyze 调用
 * ⚠️ 禁止在客户端组件中导入 server/ 目录
 */

import type { PlatformId } from './types';

// 导出类型
export type {
  Platform,
  PlatformId,
  Category,
  ScrapedData,
  ContentItem,
  ProductData,
} from './types';

// ============== 平台常量（无 Playwright 依赖） ==============

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
