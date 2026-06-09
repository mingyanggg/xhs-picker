/**
 * 极致安全 - 数据层
 *
 * v3.1 核心：
 * - 假数据过滤
 * - 数据源标注
 * - 校验逻辑
 */

/**
 * 数据来源标注
 */
export interface DataSource {
  /** 来源平台 */
  platform: string;
  /** 采集时间 */
  timestamp: number;
  /** 数据ID */
  dataId?: string;
  /** 是否经过人工验证 */
  verified?: boolean;
}

/**
 * 标注数据来源
 */
export function annotateDataSource<T extends { id?: string }>(
  data: T[],
  platform: string
): (T & { _source: DataSource })[] {
  return data.map(item => ({
    ...item,
    _source: {
      platform,
      timestamp: Date.now(),
      dataId: item.id,
      verified: false,
    },
  }));
}

/**
 * 假数据/刷量检测
 *
 * 检测指标：
 * - 24h 内突然爆增 10x
 * - 互动数据异常（收藏 > 点赞）
 * - 账号信息缺失
 */
export interface FakeDataCheckResult {
  isSuspicious: boolean;
  score: number; // 0-100，可疑度
  reasons: string[];
}

export function detectFakeData(data: {
  /** 发布时间 */
  publishTime?: string;
  /** 24h 前数据 */
  previousData?: { likes?: number; collects?: number; comments?: number };
  /** 当前数据 */
  currentData?: { likes?: number; collects?: number; comments?: number };
  /** 账号信息 */
  account?: { nickname?: string; followers?: number };
}): FakeDataCheckResult {
  const reasons: string[] = [];
  let score = 0;

  // 检测 1：24h 暴增
  if (data.previousData && data.currentData) {
    const likeGrowth = data.currentData.likes && data.previousData.likes
      ? data.currentData.likes / data.previousData.likes
      : 1;

    if (likeGrowth > 10) {
      reasons.push(`24h 内点赞暴增 ${likeGrowth.toFixed(1)}x（疑似刷量）`);
      score += 40;
    }
  }

  // 检测 2：收藏异常（收藏 > 点赞通常说明数据有问题）
  if (data.currentData) {
    const { likes = 0, collects = 0 } = data.currentData;
    if (collects > 0 && likes > 0 && collects / likes > 5) {
      reasons.push(`收藏/点赞比异常（${(collects / likes).toFixed(1)}x）`);
      score += 30;
    }
  }

  // 检测 3：账号信息缺失
  if (!data.account?.nickname) {
    reasons.push('账号昵称缺失');
    score += 15;
  }

  if (!data.account?.followers || data.account.followers < 10) {
    reasons.push('粉丝数异常低');
    score += 15;
  }

  return {
    isSuspicious: score > 50,
    score,
    reasons,
  };
}

/**
 * 过滤可疑数据
 */
export function filterSuspiciousData<T extends { id?: string }>(
  data: T[],
  checkFn: (item: T) => FakeDataCheckResult
): { valid: T[]; suspicious: (T & { _check: FakeDataCheckResult })[] } {
  const valid: T[] = [];
  const suspicious: (T & { _check: FakeDataCheckResult })[] = [];

  for (const item of data) {
    const result = checkFn(item);
    if (result.isSuspicious) {
      suspicious.push({ ...item, _check: result } as T & { _check: FakeDataCheckResult });
    } else {
      valid.push(item);
    }
  }

  return { valid, suspicious };
}

/**
 * 数据校验：确保数据完整性
 */
export function validateDataIntegrity(data: {
  hasRequiredFields: boolean;
  hasValidUrl: boolean;
  hasValidEngagement: boolean;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.hasRequiredFields) {
    errors.push('缺少必填字段');
  }

  if (!data.hasValidUrl) {
    errors.push('URL 格式无效');
  }

  if (!data.hasValidEngagement) {
    errors.push('互动数据无效（负数或非数字）');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
