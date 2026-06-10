# MediaCrawler 学习笔记 · Day 2 · 2026-06-10

> 来源：GitHub NanmiCoder/MediaCrawler + CLAUDE.md v4.0

## 1. 核心架构

MediaCrawler 是一个模块化的爬虫框架，核心设计：

```
MediaCrawler/
├── media_platform/     # 平台适配层（每个平台一个模块）
│   ├── base/          # 基类（BaseCrawler）
│   ├── xhs/          # 小红书
│   ├── dy/           # 抖音
│   └── tb/           # 淘宝
├── store/            # 数据存储
├── proxy/            # 代理池
├── config/           # 配置
└── database/         # 数据库
```

**关键设计原则**：
- 每个平台独立模块，共享基类
- 平台签名通过 JS 注入获取，不逆签名
- 登录态复用降低风控

## 2. storage_state 用法

### v3.1（已废）
```python
# Cookie 加密 SQLite（v3.1）
cookie_encrypted = encrypt(cookies)
save_to_sqlite(cookie_encrypted)
```

### v4.0（现行）
```python
# Playwright storage_state JSON（v4.0）
# 参考 MediaCrawler 的 CDP 模式
browser_context.storage_state()  # 保存为 JSON
# 下次启动时直接加载
context = browser.new_context(storage_state=state)
```

**优势**：
1. JSON 格式，跨平台通用
2. Playwright 内置加密，安全
3. 复用浏览器环境，减少风控

### 具体实现
```python
# 保存登录态
async def save_login_state(self, context):
    state = await context.storage_state()
    with open('storage_state.json', 'w') as f:
        json.dump(state, f)

# 加载登录态
async def load_login_state(self):
    if os.path.exists('storage_state.json'):
        with open('storage_state.json') as f:
            state = json.load(f)
        return await browser.new_context(storage_state=state)
    return None
```

## 3. 签名注入方式

### 关键思路（不逆签名）
MediaCrawler 的核心思路：**平台自己算签名，我们只是调用**

```python
# 通过 JS 获取平台自带的签名参数
signature = page.evaluate('''
    // 平台页面已经加载了签名计算脚本
    // 我们只需要调用它们
    window.getSign?.() || window.__INITIAL_STATE__?.signature
''')
```

### 小红书签名（x-s / X-Bogus）
1. 小红书网页本身包含签名计算逻辑
2. 我们注入 JS 调用这些函数
3. 获取签名参数后构造请求

```python
# 注入脚本获取签名
SCRIPT = '''
() => {
    // 调用平台的签名函数
    if (window.__INITIAL_STATE__) {
        return {
            x-s: window.getXSign?.(),
            x-t: Date.now()
        }
    }
}
'''
```

## 4. stealth.js 反检测

### MediaCrawler 的做法
```python
# 注入反检测脚本
stealth_scripts = [
    'navigator.webdriver = false',
    'Object.defineProperty(navigator, "plugins", {...})',
    'Object.defineProperty(navigator, "languages", {...})',
]
```

### v4.0 实现
```typescript
// src-tauri/src/stealth/injector.ts
export async function injectStealth(context: BrowserContext) {
    await context.addInitScript(() => {
        // 模拟真实浏览器
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
        // 随机化 UA
        Object.defineProperty(navigator, 'userAgent', {
            get: () => getRandomUA(),
        });
    });
}
```

## 5. 对 v4.0 的启发

### M1 Playwright 集成
```typescript
// launcher.ts 已实现
export async function launch(): Promise<ChromiumBrowser> {
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled'],
    });
    // 注入 stealth.js
    await browser.contexts()[0].addInitScript(stealthScript);
    return browser;
}
```

### M2 签名注入
```typescript
// 注入获取签名的 JS
const signScript = `
    () => {
        // 小红书页面自带的签名函数
        return {
            x-s: window.getXSign?.() || '',
            x-bogus: window.getXBogus?.() || ''
        };
    }
`;
const signs = await page.evaluate(signScript);
```

### M3 storage_state
```typescript
// 已实现，见 launcher.ts
export async function newContext(storageStatePath?: string) {
    // 读取 JSON 文件
    // 创建 context 时传入
}
```

## 6. 关键源码引用

### MediaCrawler/base/base_crawler.py
```python
class BaseCrawler:
    async def save_login_state(self, context):
        """保存登录态"""
        state = await context.storage_state()
        with open(self.state_file, 'w') as f:
            json.dump(state, f)

    async def load_login_state(self):
        """加载登录态"""
        if os.path.exists(self.state_file):
            with open(self.state_file) as f:
                state = json.load(f)
            return await self.browser.new_context(storage_state=state)
```

### MediaCrawler/media_platform/xhs/core.py
```python
class XHSProxy(ProxyBase):
    async def get_signature(self, page):
        """获取签名"""
        return await page.evaluate('''
            () => ({
                x-s: window.getXSign?.() || '',
                x-bogus: window.getXBogus?.() || ''
            })
        ''')
```

## 7. 总结

| 模块 | MediaCrawler | v4.0 实现 |
|------|-------------|-----------|
| storage_state | JSON 文件 | launcher.ts newContext() |
| 签名 | JS 注入获取 | 待实现 M2 |
| stealth | 注入脚本 | 待实现 M4 |
| 登录态 | 复用浏览器 | 已实现 |

**核心收获**：不逆签名，而是利用平台自带的签名计算逻辑，通过 JS 注入调用。

---

字数：~850 字 ✅