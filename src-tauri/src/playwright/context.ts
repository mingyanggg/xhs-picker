/**
 * Playwright 上下文池管理
 *
 * 功能：
 * - 上下文池管理（复用/限制/健康检查）
 * - 自动清理过期上下文
 * - 并发控制
 *
 * @module playwright/context
 */

import { chromium, BrowserContext, type ChromiumBrowser } from 'playwright';
import { launch, close, isRunning } from './launcher';

/** 上下文配置 */
interface ContextConfig {
  /** 最大并发上下文数 */
  maxContexts: number;
  /** 上下文超时时间（ms） */
  timeout: number;
  /** 最大空闲时间（ms） */
  maxIdleTime: number;
}

/** 上下文元数据 */
interface ContextMeta {
  context: BrowserContext;
  createdAt: number;
  lastUsedAt: number;
  pageCount: number;
}

/** 默认配置 */
const DEFAULT_CONFIG: ContextConfig = {
  maxContexts: 5,
  timeout: 30000,
  maxIdleTime: 60000,
};

/** 上下文池 */
class ContextPool {
  private pool: Map<string, ContextMeta> = new Map();
  private config: ContextConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<ContextConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupTimer();
  }

  /**
   * 获取或创建上下文
   *
   * @param key - 上下文标识键
   * @returns BrowserContext
   *
   * @example
   * const ctx = await contextPool.acquire('xhs-search');
   */
  async acquire(key: string): Promise<BrowserContext> {
    // 检查是否已有
    if (this.pool.has(key)) {
      const meta = this.pool.get(key)!;
      meta.lastUsedAt = Date.now();
      return meta.context;
    }

    // 检查池是否已满
    if (this.pool.size >= this.config.maxContexts) {
      // 清理最久未使用的上下文
      await this.evictOldest();
    }

    // 创建新上下文
    const browser = await launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });

    const meta: ContextMeta = {
      context,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      pageCount: 0,
    };

    this.pool.set(key, meta);

    // 监听页面创建
    context.on('page', () => {
      meta.pageCount++;
    });

    return context;
  }

  /**
   * 释放上下文（不关闭，只标记为空闲）
   *
   * @param key - 上下文标识键
   */
  release(key: string): void {
    const meta = this.pool.get(key);
    if (meta) {
      meta.lastUsedAt = Date.now();
    }
  }

  /**
   * 关闭并移除上下文
   *
   * @param key - 上下文标识键
   */
  async remove(key: string): Promise<void> {
    const meta = this.pool.get(key);
    if (meta) {
      try {
        await meta.context.close();
      } catch (e) {
        console.warn(`关闭上下文 ${key} 失败:`, e);
      }
      this.pool.delete(key);
    }
  }

  /**
   * 清理最久未使用的上下文
   */
  private async evictOldest(): Promise<void> {
    let oldest: { key: string; meta: ContextMeta } | null = null;

    for (const [key, meta] of this.pool) {
      if (!oldest || meta.lastUsedAt < oldest.meta.lastUsedAt) {
        oldest = { key, meta };
      }
    }

    if (oldest) {
      await this.remove(oldest.key);
    }
  }

  /**
   * 健康检查
   *
   * @returns 健康状态
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    poolSize: number;
    maxContexts: number;
    contextDetails: Array<{ key: string; idle: number; pages: number }>;
  }> {
    const now = Date.now();
    const details: Array<{ key: string; idle: number; pages: number }> = [];

    for (const [key, meta] of this.pool) {
      details.push({
        key,
        idle: Math.round((now - meta.lastUsedAt) / 1000),
        pages: meta.pageCount,
      });
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (this.pool.size >= this.config.maxContexts) {
      status = 'degraded';
    }
    if (this.pool.size === 0) {
      status = 'unhealthy';
    }

    return {
      status,
      poolSize: this.pool.size,
      maxContexts: this.config.maxContexts,
      contextDetails: details,
    };
  }

  /**
   * 清理过期上下文（定时任务）
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(async () => {
      const now = Date.now();

      for (const [key, meta] of this.pool) {
        if (now - meta.lastUsedAt > this.config.maxIdleTime) {
          console.log(`清理过期上下文: ${key}`);
          await this.remove(key);
        }
      }
    }, this.config.timeout);
  }

  /**
   * 关闭所有上下文
   */
  async closeAll(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    for (const key of this.pool.keys()) {
      await this.remove(key);
    }

    await close();
  }

  /**
   * 获取当前池大小
   */
  get size(): number {
    return this.pool.size;
  }
}

/** 单例实例 */
let contextPoolInstance: ContextPool | null = null;

/**
 * 获取上下文池单例
 *
 * @returns ContextPool
 *
 * @example
 * const pool = getContextPool();
 * const ctx = await pool.acquire('xhs');
 */
export function getContextPool(): ContextPool {
  if (!contextPoolInstance) {
    contextPoolInstance = new ContextPool();
  }
  return contextPoolInstance;
}

/**
 * 创建新上下文池（用于测试）
 *
 * @param config - 配置
 * @returns ContextPool
 */
export function createContextPool(config?: Partial<ContextConfig>): ContextPool {
  return new ContextPool(config);
}

export type { ContextConfig, ContextMeta };