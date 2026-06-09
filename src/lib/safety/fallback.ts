/**
 * 极致安全 - 降级层
 *
 * v3.1 核心：CDP 失败立即降级为手动模式，不反复重试
 *
 * 决策溯源：6/9 那哥拍板
 */

/**
 * 降级模式类型
 */
export type FallbackMode = 'normal' | 'manual' | 'degraded';

/**
 * 降级原因
 */
export type FallbackReason =
  | 'cdp_error'           // CDP 执行错误
  | 'timeout'             // 超时
  | 'rate_limited'        // 触发频率限制
  | 'account_risk'        // 账号风险
  | 'user_request';       // 用户主动降级

/**
 * 降级配置
 */
export interface FallbackConfig {
  /** 最大重试次数（默认 0，立即降级） */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 是否启用自动降级 */
  autoFallback: boolean;
}

const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  maxRetries: 0,        // v3.1 决策：立即降级，不重试
  retryDelay: 0,
  autoFallback: true,
};

/**
 * 降级状态
 */
export interface FallbackState {
  mode: FallbackMode;
  reason: FallbackReason | null;
  occurredAt: number;
  retryCount: number;
}

/**
 * 降级管理器
 */
export class FallbackManager {
  private state: FallbackState = {
    mode: 'normal',
    reason: null,
    occurredAt: 0,
    retryCount: 0,
  };
  private config: FallbackConfig;

  constructor(config: FallbackConfig = DEFAULT_FALLBACK_CONFIG) {
    this.config = config;
  }

  /**
   * 检查是否应该降级
   */
  shouldFallback(): boolean {
    if (this.state.mode !== 'normal') {
      return false; // 已经降级
    }

    return this.state.retryCount >= this.config.maxRetries;
  }

  /**
   * 触发降级
   */
  triggerFallback(reason: FallbackReason): FallbackState {
    this.state = {
      mode: reason === 'user_request' ? 'manual' : 'degraded',
      reason,
      occurredAt: Date.now(),
      retryCount: 0,
    };

    return this.state;
  }

  /**
   * 增加重试计数
   */
  incrementRetry(): void {
    this.state.retryCount++;
  }

  /**
   * 获取当前状态
   */
  getState(): FallbackState {
    return { ...this.state };
  }

  /**
   * 重置为正常模式
   */
  reset(): void {
    this.state = {
      mode: 'normal',
      reason: null,
      occurredAt: 0,
      retryCount: 0,
    };
  }

  /**
   * 获取降级提示消息
   */
  getFallbackMessage(): string {
    switch (this.state.reason) {
      case 'cdp_error':
        return '⚠️ 数据抓取失败，已降级为手动模式。请手动复制数据粘贴使用。';
      case 'timeout':
        return '⚠️ 数据抓取超时，已降级为手动模式。请手动复制数据粘贴使用。';
      case 'rate_limited':
        return '⚠️ 触发平台频率限制，已降级为手动模式。建议稍后再试。';
      case 'account_risk':
        return '⚠️ 账号存在风险，已降级为手动模式。请检查账号状态。';
      case 'user_request':
        return '📝 已切换为手动模式。请手动粘贴数据进行选品分析。';
      default:
        return '📝 已切换为手动模式。请手动粘贴数据进行选品分析。';
    }
  }

  /**
   * 获取模式标签
   */
  getModeLabel(): string {
    switch (this.state.mode) {
      case 'normal':
        return '🟢 正常模式';
      case 'manual':
        return '🟡 手动模式';
      case 'degraded':
        return '🔴 降级模式';
    }
  }
}

// ============== 全局降级管理器实例 ==============

let globalFallbackManager: FallbackManager | null = null;

export function getFallbackManager(): FallbackManager {
  if (!globalFallbackManager) {
    globalFallbackManager = new FallbackManager();
  }
  return globalFallbackManager;
}
