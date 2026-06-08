/**
 * 跟踪模块 - 数据对比计算
 *
 * 功能：
 * - 计算数据变化（delta、changeRate、trend）
 * - 跨平台数据对比
 * - 单平台趋势分析
 */

import type {
  PlatformSnapshot,
  DataChange,
  PlatformId,
  TrendDirection,
} from '../platforms/types';

// ============== 变化计算 ==============

/**
 * 计算单指标变化
 */
export function calculateChange(
  oldValue: number,
  newValue: number
): DataChange {
  const delta = newValue - oldValue;
  const changeRate = oldValue > 0 ? (delta / oldValue) * 100 : 0;

  let trend: TrendDirection;
  if (Math.abs(delta) < 0.01) {
    trend = 'stable';
  } else if (delta > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return {
    delta,
    changeRate,
    trend,
    comparedAt: Date.now(),
  };
}

/**
 * 计算快照之间的所有变化
 */
export function compareSnapshots(
  oldSnapshot: PlatformSnapshot,
  newSnapshot: PlatformSnapshot
): {
  contentCount: DataChange;
  avgEngagement: DataChange;
  totalEngagement: DataChange;
  searchIndex: DataChange | null;
  lowFollowerViral: DataChange;
} {
  return {
    contentCount: calculateChange(
      oldSnapshot.contentCount,
      newSnapshot.contentCount
    ),
    avgEngagement: calculateChange(
      oldSnapshot.avgEngagement,
      newSnapshot.avgEngagement
    ),
    totalEngagement: calculateChange(
      oldSnapshot.totalEngagement,
      newSnapshot.totalEngagement
    ),
    searchIndex:
      oldSnapshot.searchIndex !== undefined &&
      newSnapshot.searchIndex !== undefined
        ? calculateChange(oldSnapshot.searchIndex, newSnapshot.searchIndex)
        : null,
    lowFollowerViral: calculateChange(
      oldSnapshot.lowFollowerViralCount,
      newSnapshot.lowFollowerViralCount
    ),
  };
}

// ============== 跨平台对比 ==============

/**
 * 跨平台数据对比
 */
export function comparePlatforms(
  snapshots: Record<PlatformId, PlatformSnapshot>
): {
  platformRankings: {
    platformId: PlatformId;
    totalScore: number;
    growthScore: number;
    engagementScore: number;
  }[];
  bestPlatform: PlatformId;
  worstPlatform: PlatformId;
} {
  const rankings = Object.entries(snapshots).map(([platformId, snapshot]) => {
    // 计算各维度分数
    const growthScore =
      snapshot.contentCount > 0
        ? Math.min(snapshot.contentCount / 100, 10)
        : 0;
    const engagementScore =
      snapshot.avgEngagement > 0
        ? Math.min(snapshot.avgEngagement / 100, 10)
        : 0;

    // 总分 = 增长分数 * 0.5 + 互动分数 * 0.5
    const totalScore = growthScore * 0.5 + engagementScore * 0.5;

    return {
      platformId: platformId as PlatformId,
      totalScore,
      growthScore,
      engagementScore,
    };
  });

  // 按总分排序
  rankings.sort((a, b) => b.totalScore - a.totalScore);

  return {
    platformRankings: rankings,
    bestPlatform: rankings[0]?.platformId || 'xhs',
    worstPlatform: rankings[rankings.length - 1]?.platformId || 'xhs',
  };
}

// ============== 趋势分析 ==============

/**
 * 分析趋势方向
 */
export function analyzeTrend(
  changes: DataChange[]
): {
  overallTrend: TrendDirection;
  accelerating: boolean;
  avgChangeRate: number;
} {
  if (changes.length === 0) {
    return {
      overallTrend: 'stable',
      accelerating: false,
      avgChangeRate: 0,
    };
  }

  // 计算平均变化率
  const avgChangeRate =
    changes.reduce((sum, c) => sum + c.changeRate, 0) / changes.length;

  // 判断整体趋势
  let upCount = 0;
  let downCount = 0;

  changes.forEach((c) => {
    if (c.trend === 'up') upCount++;
    if (c.trend === 'down') downCount++;
  });

  let overallTrend: TrendDirection;
  if (upCount > downCount * 2) {
    overallTrend = 'up';
  } else if (downCount > upCount * 2) {
    overallTrend = 'down';
  } else {
    overallTrend = 'stable';
  }

  // 判断是否加速（最近的变化率是否大于平均）
  const lastChange = changes[changes.length - 1];
  const accelerating = lastChange
    ? Math.abs(lastChange.changeRate) > Math.abs(avgChangeRate)
    : false;

  return {
    overallTrend,
    accelerating,
    avgChangeRate,
  };
}

/**
 * 计算增长潜力评分
 */
export function calculateGrowthPotential(
  currentSnapshot: PlatformSnapshot,
  historicalSnapshots: PlatformSnapshot[]
): {
  score: number; // 0-100
  rating: '高' | '中' | '低';
  prediction: string;
} {
  if (historicalSnapshots.length < 2) {
    return {
      score: 50,
      rating: '中',
      prediction: '数据不足，无法准确预测',
    };
  }

  // 计算历史增长趋势
  const contentGrowth =
    (currentSnapshot.contentCount -
      historicalSnapshots[0].contentCount) /
    historicalSnapshots[0].contentCount;
  const engagementGrowth =
    (currentSnapshot.avgEngagement -
      historicalSnapshots[0].avgEngagement) /
    historicalSnapshots[0].avgEngagement;

  // 综合评分
  const score = Math.min(
    100,
    Math.max(
      0,
      50 +
        contentGrowth * 25 +
        engagementGrowth * 25
    )
  );

  const rating = score >= 70 ? '高' : score >= 40 ? '中' : '低';

  let prediction: string;
  if (score >= 70) {
    prediction = '增长潜力高，建议重点关注';
  } else if (score >= 40) {
    prediction = '增长潜力中等，保持观察';
  } else {
    prediction = '增长潜力低，考虑调整策略';
  }

  return { score, rating, prediction };
}

// ============== 格式化输出 ==============

/**
 * 格式化变化率显示
 */
export function formatChangeRate(changeRate: number): string {
  const sign = changeRate >= 0 ? '+' : '';
  return `${sign}${changeRate.toFixed(1)}%`;
}

/**
 * 格式化趋势图标
 */
export function formatTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return '📈';
    case 'down':
      return '📉';
    case 'stable':
      return '➡️';
  }
}

/**
 * 生成变化摘要文本
 */
export function generateChangeSummary(
  platformId: PlatformId,
  changes: ReturnType<typeof compareSnapshots>
): string {
  const parts: string[] = [];

  if (changes.contentCount.trend !== 'stable') {
    parts.push(
      `内容数${formatTrendIcon(changes.contentCount.trend)}${formatChangeRate(changes.contentCount.changeRate)}`
    );
  }

  if (changes.avgEngagement.trend !== 'stable') {
    parts.push(
      `互动量${formatTrendIcon(changes.avgEngagement.trend)}${formatChangeRate(changes.avgEngagement.changeRate)}`
    );
  }

  if (parts.length === 0) {
    return '数据稳定';
  }

  return parts.join(' | ');
}