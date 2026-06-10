/**
 * Playwright 浏览器启动器
 *
 * 功能：
 * - launch(): 启动 Chromium + 注入 stealth.js 占位
 * - newContext(storageState): 加载登录态 JSON
 * - close(): 清理资源
 *
 * @module playwright/launcher
 */

import { chromium, Browser, BrowserContext, type ChromiumBrowser } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

/** 存储状态文件路径 */
const STORAGE_STATE_PATH = path.join(
  process.env.HOME || '/Users/michael',
  '.xhs-picker',
  'storage_state.json'
);

/** stealth.js 注入脚本路径（占位） */
const STEALTH_SCRIPT_PATH = path.join(
  __dirname,
  '..',
  'stealth',
  'stealth.js'
);

/** 浏览器实例缓存 */
let browserInstance: ChromiumBrowser | null = null;

/** 上下文缓存 */
const contextCache: Map<string, BrowserContext> = new Map();

/**
 * 启动 Chromium 浏览器
 *
 * @returns ChromiumBrowser 实例
 *
 * @example
 * const browser = await launch();
 */
export async function launch(): Promise<ChromiumBrowser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  // 检查 stealth.js 是否存在
  let stealthScript = '';
  if (fs.existsSync(STEALTH_SCRIPT_PATH)) {
    stealthScript = fs.readFileSync(STEALTH_SCRIPT_PATH, 'utf-8');
  }

  const browser = await chromium.launch({
    headless: false, // 开发模式显示窗口
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
    ],
  });

  browserInstance = browser as unknown as ChromiumBrowser;

  // 注入 stealth.js（如果存在）
  if (stealthScript) {
    const pages = await browser.pages();
    for (const page of pages) {
      await page.addInitScript(stealthScript);
    }
  }

  return browserInstance;
}

/**
 * 创建新浏览器上下文，加载存储状态
 *
 * @param storageStatePath - 存储状态文件路径（默认 ~/.xhs-picker/storage_state.json）
 * @returns BrowserContext 实例
 *
 * @example
 * const context = await newContext();
 * // 或指定路径
 * const context = await newContext('/path/to/state.json');
 */
export async function newContext(
  storageStatePath?: string
): Promise<BrowserContext> {
  const statePath = storageStatePath || STORAGE_STATE_PATH;

  // 确保目录存在
  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 读取存储状态（如果存在）
  let storageState: { cookies?: any[]; origins?: any[] } | null = null;
  if (fs.existsSync(statePath)) {
    try {
      const content = fs.readFileSync(statePath, 'utf-8');
      storageState = JSON.parse(content);
    } catch (e) {
      console.warn('读取 storage_state 失败，使用空状态:', e);
      storageState = null;
    }
  }

  const browser = await launch();

  // 创建上下文
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: getRandomUserAgent(),
    ...(storageState ? { storageState } : {}),
  });

  // 注入 stealth.js
  if (fs.existsSync(STEALTH_SCRIPT_PATH)) {
    const stealthScript = fs.readFileSync(STEALTH_SCRIPT_PATH, 'utf-8');
    await context.addInitScript(stealthScript);
  }

  // 缓存上下文
  const contextId = `ctx_${Date.now()}`;
  contextCache.set(contextId, context);

  // 监听关闭事件
  context.on('close', () => {
    contextCache.delete(contextId);
  });

  return context;
}

/**
 * 关闭浏览器及所有上下文
 *
 * @example
 * await close();
 */
export async function close(): Promise<void> {
  // 关闭所有缓存的上下文
  for (const [id, ctx] of contextCache) {
    try {
      await ctx.close();
    } catch (e) {
      console.warn(`关闭上下文 ${id} 失败:`, e);
    }
  }
  contextCache.clear();

  // 关闭浏览器
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (e) {
      console.warn('关闭浏览器失败:', e);
    }
    browserInstance = null;
  }
}

/**
 * 获取随机 User-Agent
 *
 * @returns macOS Chrome User-Agent
 */
function getRandomUserAgent(): string {
  const versions = [
    '124.0.6367.91',
    '124.0.6367.78',
    '124.0.6367.71',
  ];
  const version = versions[Math.floor(Math.random() * versions.length)];

  return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
}

/**
 * 检查浏览器是否运行中
 *
 * @returns boolean
 */
export function isRunning(): boolean {
  return browserInstance !== null && browserInstance.isConnected();
}

/**
 * 获取缓存的上下文数量
 *
 * @returns 上下文数量
 */
export function getContextCount(): number {
  return contextCache.size;
}

/**
 * 导出类型
 */
export type { ChromiumBrowser as PlaywrightBrowser };