/**
 * 极致安全 - IP 层
 *
 * v3.1 核心：
 * - 请求频率自适应（≤人类操作）
 * - 代理池支持
 * - 不向外部服务器上报用户数据
 *
 * 决策溯源：6/9 那哥拍板
 */

/**
 * 请求频率配置
 * 模拟人类操作速度，避免触发反爬
 */
export interface RateLimitConfig {
  /** 最小请求间隔（毫秒） */
  minInterval: number;
  /** 最大请求间隔（毫秒） */
  maxInterval: number;
  /** 每次操作后随机增加延迟 */
  jitter: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  minInterval: 3000,    // 3 秒（人类阅读速度）
  maxInterval: 8000,    // 8 秒
  jitter: 2000,         // ±2 秒随机抖动
};

/**
 * 获取下一个安全的请求延迟
 */
export function getNextRequestDelay(config: RateLimitConfig = DEFAULT_RATE_LIMIT): number {
  const baseDelay = config.minInterval + Math.random() * (config.maxInterval - config.minInterval);
  const jitterValue = (Math.random() - 0.5) * 2 * config.jitter;
  return Math.max(config.minInterval, baseDelay + jitterValue);
}

/**
 * 请求节流器
 */
export class RequestThrottler {
  private lastRequestTime = 0;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_RATE_LIMIT) {
    this.config = config;
  }

  /**
   * 等待直到可以发起下一个请求
   */
  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const delay = getNextRequestDelay(this.config);

    if (elapsed < delay) {
      await new Promise(resolve => setTimeout(resolve, delay - elapsed));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * 获取距离下次可请求的剩余时间
   */
  getRemainingDelay(): number {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const delay = getNextRequestDelay(this.config);
    return Math.max(0, delay - elapsed);
  }
}

/**
 * 代理池配置
 */
export interface ProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * 代理选择策略
 */
export interface ProxySelector {
  getNextProxy(): ProxyConfig | null;
  reportFailure(proxy: ProxyConfig): void;
  reportSuccess(proxy: ProxyConfig): void;
}

/**
 * 简单轮询代理选择器
 */
export class RoundRobinProxySelector implements ProxySelector {
  private proxies: ProxyConfig[] = [];
  private currentIndex = 0;
  private failureCounts: Map<string, number> = new Map();

  constructor(proxies: ProxyConfig[] = []) {
    this.proxies = proxies;
  }

  getNextProxy(): ProxyConfig | null {
    if (this.proxies.length === 0) return null;

    // 跳过连续失败的代理
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex % this.proxies.length];
      const failures = this.failureCounts.get(`${proxy.host}:${proxy.port}`) || 0;

      if (failures < 3) {
        this.currentIndex++;
        return proxy;
      }

      this.currentIndex++;
      attempts++;
    }

    return null; // 所有代理都失败
  }

  reportFailure(proxy: ProxyConfig): void {
    const key = `${proxy.host}:${proxy.port}`;
    const count = this.failureCounts.get(key) || 0;
    this.failureCounts.set(key, count + 1);
  }

  reportSuccess(proxy: ProxyConfig): void {
    const key = `${proxy.host}:${proxy.port}`;
    this.failureCounts.set(key, 0);
  }
}

/**
 * 隐私声明：不向外部服务器上报用户数据
 */
export const PRIVACY_POLICY = {
  dataCollection: false,      // 不采集用户数据
  externalReporting: false,    // 不上报任何数据到外部
  localStorageOnly: true,     // 仅本地存储
  cloudSync: false,           // 不云端同步
};
