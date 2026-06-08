/**
 * 跟踪模块 - 生命周期判断
 *
 * 功能：
 * - 基于数据趋势判断生命周期阶段
 * - 支持按平台独立判断
 * - 支持整体综合判断
 */

import type {
  LifeCycleStage,
  PlatformId,
  PlatformSnapshot,
  DataChange,
} from '../platforms/types';

// ============== 生命周期阈值 ==============

/** 生命周期判断阈值配置 */
interface LifecycleThresholds {
  /** 内容增长率阈值（百分比） */
  contentGrowthRate: number;
  /** 互动增长率阈值（百分比） */
  engagementGrowthRate: number;
  /** 下降率阈值（百分比） */
  declineRate: number;
}

const DEFAULT_THRESHOLDS: LifecycleThresholds = {
  contentGrowthRate: 10, // 内容增长超过10%
  engagementGrowthRate: 15, // 互动增长超过15%
  declineRate: -10, // 下降超过10%
};

// ============== 单平台判断 ==============

/**
 * 判断单平台的生命周期阶段
 */
export function determinePlatformLifecycle(
  currentSnapshot: PlatformSnapshot,
  previousSnapshot: PlatformSnapshot | null,
  thresholds: LifecycleThresholds = DEFAULT_THRESHOLDS
): LifeCycleStage {
  // 如果没有历史数据，默认为上升期
  if (!previousSnapshot) {
    return '上升期';
  }

  const contentGrowth =
    ((currentSnapshot.contentCount - previousSnapshot.contentCount) /
      previousSnapshot.contentCount) *
    100;

  const engagementGrowth =
    ((currentSnapshot.avgEngagement - previousSnapshot.avgEngagement) /
      previousSnapshot.avgEngagement) *
    100;

  // 判断阶段
  if (
    contentGrowth >= thresholds.contentGrowthRate &&
    engagementGrowth >= thresholds.engagementGrowthRate
  ) {
    return '爆发期';
  }

  if (
    contentGrowth >= thresholds.contentGrowthRate / 2 &&
    engagementGrowth >= thresholds.engagementGrowthRate / 2
  ) {
    return '上升期';
  }

  if (
    contentGrowth <= thresholds.declineRate ||
    engagementGrowth <= thresholds.declineRate
  ) {
    return '衰退期';
  }

  return '稳定期';
}

// ============== 综合判断 ==============

/**
 * 综合多平台数据判断整体生命周期
 *
 * 规则：
 * - 3个以上平台处于爆发期 → 爆发期
 * - 3个以上平台处于上升期 → 上升期
 * - 3个以上平台处于衰退期 → 衰退期
 * - 其他情况 → 稳定期
 */
export function determineOverallLifecycle(
  platformLifecycles: Record<PlatformId, LifeCycleStage>
): LifeCycleStage {
  const counts: Record<LifeCycleStage, number> = {
    '上升期': 0,
    '爆发期': 0,
    '稳定期': 0,
    '衰退期': 0,
  };

  Object.values(platformLifecycles).forEach((stage) => {
    counts[stage]++;
  });

  const total = Object.values(platformLifecycles).length;

  // 3个以上平台处于同一阶段
  if (counts['爆发期'] >= Math.ceil(total / 2)) {
    return '爆发期';
  }

  if (counts['上升期'] >= Math.ceil(total / 2)) {
    return '上升期';
  }

  if (counts['衰退期'] >= Math.ceil(total / 2)) {
    return '衰退期';
  }

  return '稳定期';
}

// ============== 趋势预测 ==============

/**
 * 预测下一个生命周期阶段
 */
export function predictNextLifecycle(
  currentStage: LifeCycleStage,
  recentChanges: DataChange[]
): LifeCycleStage {
  // 分析最近变化趋势
  const avgChangeRate =
    recentChanges.length > 0
      ? recentChanges.reduce((sum, c) => sum + c.changeRate, 0) /
        recentChanges.length
      : 0;

  // 基于当前阶段和变化趋势预测
  switch (currentStage) {
    case '上升期':
      if (avgChangeRate > 20) return '爆发期';
      if (avgChangeRate < 0) return '稳定期';
      return '上升期';

    case '爆发期':
      if (avgChangeRate < 5) return '稳定期';
      if (avgChangeRate < 0) return '衰退期';
      return '爆发期';

    case '稳定期':
      if (avgChangeRate > 10) return '上升期';
      if (avgChangeRate < -10) return '衰退期';
      return '稳定期';

    case '衰退期':
      if (avgChangeRate > 10) return '上升期';
      return '衰退期';
  }
}

// ============== 生命周期描述 ==============

/**
 * 生命周期阶段描述
 */
export const LIFECYCLE_DESCRIPTIONS: Record<
  LifeCycleStage,
  {
    title: string;
    emoji: string;
    description: string;
    action: string;
  }
> = {
  '上升期': {
    title: '上升期',
    emoji: '🚀',
    description: '数据稳步增长，是入场的好时机',
    action: '建议加快布局，跟上增长趋势',
  },
  '爆发期': {
    title: '爆发期',
    emoji: '🔥',
    description: '数据快速增长，市场热度高涨',
    action: '建议立即入场，抓住红利期',
  },
  '稳定期': {
    title: '稳定期',
    emoji: '⚖️',
    description: '数据趋于平稳，市场竞争激烈',
    action: '建议差异化竞争，寻找细分机会',
  },
  '衰退期': {
    title: '衰退期',
    emoji: '📉',
    description: '数据持续下滑，市场需求减少',
    action: '建议考虑调整或退出，寻找替代品',
  },
};

/**
 * 获取生命周期描述
 */
export function getLifecycleDescription(stage: LifeCycleStage): string {
  return LIFECYCLE_DESCRIPTIONS[stage].description;
}

/**
 * 获取生命周期建议行动
 */
export function getLifecycleAction(stage: LifeCycleStage): string {
  return LIFECYCLE_DESCRIPTIONS[stage].action;
}

// ============== 颜色映射 ==============

/**
 * 生命周期颜色（用于UI）
 */
export const LIFECYCLE_COLORS: Record<LifeCycleStage, string> = {
  '上升期': 'text-blue-600 bg-blue-50 border-blue-200',
  '爆发期': 'text-orange-600 bg-orange-50 border-orange-200',
  '稳定期': 'text-green-600 bg-green-50 border-green-200',
  '衰退期': 'text-red-600 bg-red-50 border-red-200',
};

/**
 * 获取生命周期对应的颜色类
 */
export function getLifecycleColor(stage: LifeCycleStage): string {
  return LIFECYCLE_COLORS[stage];
}