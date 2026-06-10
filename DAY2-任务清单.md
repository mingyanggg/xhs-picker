# 选品工具 v4.0 · Day 2 任务清单

> 生成：2026-06-09 23:00（v4.0 路线 · 推翻 v3.1）
> 状态：🟢 那哥拍板 v4.0 全认
> 预计工时：2.5-3h

---

## 🎯 Day 2 目标（一句话）

**M1 Playwright 集成 + stealth.js 注入 + storage_state 持久化骨架 = v4.0 的"地基三件套"**

---

## ⏰ 时间分配（2.5h 总）

| 时段 | 时长 | 任务 |
|---|---|---|
| 23:00-23:30 | 30min | 阻塞：dev server 修复 + 浏览器验证 |
| 23:30-00:30 | 1h | M1 Playwright 内核集成（launcher.ts） |
| 00:30-01:00 | 30min | M3 storage_state 持久化骨架 |
| 01:00-01:30 | 30min | 自检 + Git commit |
| 01:30-02:00 | 30min | 学习：MediaCrawler 必读 3 篇 |

---

## 1️⃣ 阻塞任务（30min · 先做）

### dev server 状态（那哥反馈"空白" · 实际是浏览器问题）

**已确认**：
- ✅ `next-server (v14.2.35) PID 25629` 在跑
- ✅ `*.3000 LISTEN`
- ✅ 2 次 handle-request 成功（编译完成）

**那哥操作**：
```
1. 浏览器硬刷新（Cmd+Shift+R）
2. 如果还空白 → 打开浏览器 DevTools Console 看错误
3. 截图发给我 / 或者复制 console.error
```

**claude code 协助**（如果那哥浏览器还不显示）：
```
1. 查 .next/trace 找最后编译错误
2. 杀进程：pkill -f "next dev"
3. 清缓存：rm -rf .next
4. 重启：pnpm dev
5. 等编译完成日志 "ready in"
```

---

## 2️⃣ M1 Playwright 集成（1h · 核心）

### 2.1 安装（5min）

```bash
cd /Users/michael/AI项目/xhs-picker/
pnpm add -D playwright @playwright/test
pnpm exec playwright install chromium
```

### 2.2 创建 launcher.ts（30min）

**路径**：`src-tauri/src/playwright/launcher.ts`

**核心结构**：
```typescript
import { chromium, Browser, BrowserContext } from 'playwright';

export class PlaywrightLauncher {
  private browser: Browser | null = null;
  
  async launch(): Promise<Browser> {
    // 启动 chromium with stealth + 随机化
    this.browser = await chromium.launch({
      headless: false,  // 有头模式（调试时）
      args: [
        '--disable-blink-features=AutomationControlled',  // 抹掉 WebDriver
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
    return this.browser;
  }
  
  async newContext(storageStatePath?: string): Promise<BrowserContext> {
    // 加载上次登录态
    const context = await this.browser!.newContext({
      storageState: storageStatePath,
      viewport: { width: 1280, height: 800 },  // 真实用户尺寸
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ...',  // 真实 UA
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
    });
    
    // 注入 stealth.js（参考 MediaCrawler）
    await context.addInitScript({
      path: require.resolve('../stealth/stealth.min.js'),
    });
    
    return context;
  }
  
  async close() {
    if (this.browser) await this.browser.close();
  }
}
```

**注意**：
- 路径 `src-tauri/src/` 不是 `src/`（Tauri 后端 = Rust 端）
- 但 launcher.ts 用 TypeScript → 放 `src-tauri/src/playwright/launcher.ts` 还是 `src/lib/playwright/`？
- **建议**：`src/lib/playwright/launcher.ts`（前端用，Rust 端不直接调）

### 2.3 创建 stealth.min.js（10min）

**下载**：
```bash
cd src/lib/playwright/
curl -o stealth.min.js https://raw.githubusercontent.com/berstend/puppeteer-extra/master/packages/puppeteer-extra-plugin-stealth/stealth.min.js
```

**或复制 MediaCrawler 的 stealth 注入脚本**（更稳）：
- 参考：`MediaCrawler/media_platform/xhs/core.py` 里的 `stealth_js_path` 用法
- 简化版直接 npm 装 `puppeteer-extra-plugin-stealth`，导出 stealth 代码

### 2.4 测试（15min）

**创建** `tests/playwright.test.ts`：
```typescript
import { PlaywrightLauncher } from '../src/lib/playwright/launcher';

describe('Playwright Launcher', () => {
  it('should launch chromium and open xiaohongshu.com', async () => {
    const launcher = new PlaywrightLauncher();
    const browser = await launcher.launch();
    const context = await launcher.newContext();
    const page = await context.newPage();
    
    await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const title = await page.title();
    expect(title).toContain('小红书');
    
    await launcher.close();
  }, 60000);
});
```

**运行**：
```bash
pnpm test tests/playwright.test.ts
```

**通过条件**：
- chromium 启动成功（无报错）
- stealth 注入成功
- 打开 xhs.com 不被识别为 WebDriver
- 返回正常 HTML

---

## 3️⃣ M3 storage_state 持久化骨架（30min）

### 3.1 创建 storage_state.ts（20min）

**路径**：`src/lib/auth/storage_state.ts`

**核心结构**：
```typescript
import { promises as fs } from 'fs';
import { join } from 'path';
import { app } from 'electron';  // Tauri 用 @tauri-apps/api

const STORAGE_DIR = app.getPath('userData');  // ~/.xhs-picker/
const STATE_FILE = join(STORAGE_DIR, 'storage_state.json');

export interface StorageState {
  cookies: any[];  // Playwright cookie 格式
  origins: any[];  // localStorage / sessionStorage
}

export class StorageStateManager {
  
  async save(context: any): Promise<void> {
    // 序列化当前登录态
    const state = await context.storageState();
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  }
  
  async load(): Promise<StorageState | null> {
    // 读取上次的登录态
    try {
      const data = await fs.readFile(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;  // 首次使用，无历史
    }
  }
  
  async clear(): Promise<void> {
    // 用户主动登出
    await fs.unlink(STATE_FILE).catch(() => {});
  }
  
  exists(): boolean {
    try {
      require('fs').statSync(STATE_FILE);
      return true;
    } catch {
      return false;
    }
  }
}
```

### 3.2 集成到 launcher（10min）

修改 `launcher.ts` 的 `newContext`：
```typescript
async newContext(): Promise<BrowserContext> {
  const manager = new StorageStateManager();
  const state = await manager.load();
  
  const context = await this.browser!.newContext({
    storageState: state || undefined,  // 有就用，没有就 undefined
    viewport: { width: 1280, height: 800 },
    userAgent: '...',
    // ...
  });
  
  return context;
}
```

**新增方法**：
```typescript
async loginAndSave(context: BrowserContext): Promise<void> {
  // 用户扫码登录 → 等待跳转 → 保存
  // 实际逻辑：context.storageState() → fs.writeFile
  const manager = new StorageStateManager();
  await manager.save(context);
}
```

---

## 4️⃣ 自检（30min）

### 4.1 编译检查

```bash
cd /Users/michael/AI项目/xhs-picker/
npx tsc --noEmit  # 必须 0 错误
```

### 4.2 单元测试

```bash
pnpm test  # 跑所有测试
```

### 4.3 手动验证

```
1. pnpm dev（dev server 已运行）
2. 浏览器 Cmd+Shift+R 刷新
3. 看到主界面（v4.0-mockup.html 的设计）
4. 数据源状态：未登录小红书（红灯）
```

### 4.4 Git commit

```bash
git add -A
git commit -m "🎯 Day 2: M1 Playwright 集成 + M3 storage_state 骨架 + stealth.js 注入"
git push origin main
```

---

## 5️⃣ 学习任务（30min · 必做）

### 必读 3 篇

1. **MediaCrawler README**（10min）
   - 重点：架构、登录方式、签名注入原理
   - URL：https://github.com/NanmiCoder/MediaCrawler

2. **`base/base_crawler.py`**（10min）
   - 重点：`storage_state` 怎么用、登录态怎么持久化
   - 看懂 Pyhton 版 → 翻译成 TypeScript

3. **`media_platform/xhs/core.py`**（10min）
   - 重点：签名怎么注入、JS 上下文怎么调用
   - 提取关键方法名，TypeScript 实现时对照

### 学习笔记

**路径**：`学习笔记/2026-06-09-Day2-MediaCrawler.md`

**必含 3 部分**：
1. **关键收获**：3 个核心方法（launch / context / storageState）
2. **TypeScript 翻译**：Python → TS 的关键差异（异步 / 类型 / 类）
3. **明日要问的问题**：claude code 写完后我要问它的 1-2 个细节

---

## 6️⃣ Day 2 完成判定

- [ ] Playwright 集成跑通（chromium 启动 + 打开 xhs.com）
- [ ] stealth.js 注入成功（不被识别 WebDriver）
- [ ] storage_state 持久化骨架完成（save/load/clear）
- [ ] TypeScript 编译 0 错误
- [ ] Git commit Day 2 完成
- [ ] 学习笔记 Day 2 写完
- [ ] 那哥浏览器看到新界面（非空白）

---

## 7️⃣ Day 3 任务预告（明天 09:00 cron 触发）

- **M2 JS 注入签名框架**（6-8h · 大头）
- **M4 stealth.js 完整版**（不是骨架）
- 预计 3-4h

---

## ⚠️ 风险与回退

| 风险 | 概率 | 回退 |
|---|---|---|
| pnpm install 失败 | 中 | 用 npm i --save-dev |
| chromium 启动失败（缺依赖） | 中 | `pnpm exec playwright install-deps` |
| stealth.js 注入失败 | 中 | 临时用 fake-ua（v3.1 降级方案） |
| storage_state 路径权限问题 | 低 | 改用 app.getPath('temp') |
| 浏览器那哥看到空白 | 已确认不是 dev server 问题 | 硬刷新 + 看 console |
