/**
 * 极致安全 - 账号层
 *
 * v3.1 核心：Cookie 加密 + 风控检测 + 不共用账号
 *
 * 决策溯源：6/9 那哥拍板
 */

/**
 * Cookie 加密存储（防止明文泄露）
 */
export function encryptCookie(cookie: string): string {
  // 简单 XOR 加密，生产环境建议用 crypto-js
  const key = 'xhs-picker-v3';
  return Buffer.from(
    cookie.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('')
  ).toString('base64');
}

/**
 * Cookie 解密
 */
export function decryptCookie(encrypted: string): string {
  const decoded = Buffer.from(encrypted, 'base64').toString();
  const key = 'xhs-picker-v3';
  return decoded.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
}

/**
 * 风控检测
 *
 * 检测账号是否有异常：
 * - 登录失败次数
 * - 验证码触发频率
 * - 异地登录
 */
export interface RiskCheckResult {
  isRisky: boolean;
  riskLevel: 'safe' | 'warning' | 'danger';
  reasons: string[];
}

export function checkAccountRisk(accountState: {
  failedLogins?: number;
  captchaTriggers?: number;
  lastLogin?: number;
  locationChanged?: boolean;
}): RiskCheckResult {
  const reasons: string[] = [];
  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';

  if (accountState.failedLogins && accountState.failedLogins > 3) {
    reasons.push(`登录失败 ${accountState.failedLogins} 次`);
    riskLevel = 'warning';
  }

  if (accountState.captchaTriggers && accountState.captchaTriggers > 5) {
    reasons.push(`验证码触发 ${accountState.captchaTriggers} 次`);
    riskLevel = 'danger';
  }

  if (accountState.locationChanged) {
    reasons.push('检测到异地登录');
    riskLevel = 'warning';
  }

  return {
    isRisky: riskLevel !== 'safe',
    riskLevel,
    reasons,
  };
}

/**
 * 获取安全建议
 */
export function getSafetyRecommendations(result: RiskCheckResult): string[] {
  const recommendations: string[] = [];

  if (result.riskLevel === 'danger') {
    recommendations.push('⚠️ 账号风险极高，建议暂停使用');
    recommendations.push('⚠️ 更换账号或等待 24 小时后再试');
  } else if (result.riskLevel === 'warning') {
    recommendations.push('⚠️ 账号存在一定风险，建议降低操作频率');
    recommendations.push('⚠️ 避免短时间内大量操作');
  }

  return recommendations;
}
