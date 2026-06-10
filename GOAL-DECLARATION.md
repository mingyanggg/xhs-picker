# GOAL-DECLARATION v4.0 · 选品工具（MediaCrawler 路线大改版）

> 生成：2026-06-09 22:30（那哥要求"大改"）
> 状态：🟡 草案，等那哥拍板
> 推翻：v3.1 17 条 must_pass（备份：`GOAL-DECLARATION.v3.1.bak` 31KB）
> 路线：MediaCrawler（Playwright + JS 注入签名）+ XHS-Downloader（MCP Server）+ saqierma-cyber/moneymaker（Tauri 2 + React 19）

---

## 🎯 v4.0 三大根本性改变

| 维度 | v3.1（旧） | v4.0（新） | 参考 |
|---|---|---|---|
| **抓取方式** | 自己写 CDP + 逆签名 | **Playwright + JS 注入平台自带签名** | MediaCrawler |
| **架构定位** | Web UI + 后端 | **MCP Server + Web UI 双模式** | XHS-Downloader (mcp-server) + openclaw-xhs |
| **反检测** | 频率自适应 | **stealth.js 注入 + 随机化 UA + 行为间隔** | MediaCrawler stealth plugin |
| **登录态** | Cookie 加密 | **Playwright storage_state 序列化 JSON** | MediaCrawler base/base_crawler.py |
| **栈一致性** | 用了 Python 参考但代码是 TS | **100% Tauri 2 + React 19 + TS** | saqierma-cyber/moneymaker（同样栈） |

---

## 🎨 v4.0 界面设计（基于国外软件调研）

### 5 个借鉴对象（参考度评级）

| 软件 | 参考度 | 核心借鉴 |
|---|---|---|
| **Linear** | ⭐⭐⭐⭐⭐ | 三栏布局（侧栏+列表+详情）+ ⌘K + 极简白 |
| **Raycast** | ⭐⭐⭐⭐⭐ | 全屏命令面板 + 实时搜索 + 快捷键提示 |
| **TablePlus** | ⭐⭐⭐⭐ | 表格对比 + inline edit + safe mode + 多 tab |
| **Things 3** | ⭐⭐⭐⭐ | 卡片折叠/展开 + 进度条 + 留白 + 暖色调 |
| **PopClip** | ⭐⭐⭐ | 上下文菜单 + 系统级集成 + 一键操作 |

### 设计语言（暖色杂志风 + 极简）

**色调 token**（`米白+暖橙+深棕`）：
```
--bg-main: #FAF8F4  ← 主背景
--bg-card: #FFFFFF  ← 卡片
--bg-sidebar: #F2EDE4  ← 侧栏
--text-primary: #2C2620  ← 主文字（深棕）
--text-secondary: #8B6F47  ← 副文字（暖棕）
--accent-primary: #D97706  ← 主强调（暖橙）
--warning: #DC2626  ← 警告（红）
--success: #059669  ← 成功（绿）
--border-light: #E8D9C0  ← 边框（浅棕）
```

**字体**：
- 主字体：Inter（英文）+ PingFang SC（中文）
- 代码字体：JetBrains Mono
- 标题 24px / 正文 14px / 辅助 12px

**布局规则**（3 栏 Linear 风格）：
- 左 sidebar 240px + 中列表 360px + 右详情 flex
- 卡片间距 16-24px
- 圆角 8px（卡片） / 4px（按钮） / 12px（弹窗）
- 阴影 0 1px 2px（极淡） / 0 8px 24px（弹窗）

**交互原则**：
- 键盘优先（所有操作有快捷键）
- 即时反馈（操作 ≤100ms 出 loading）
- 错误友好（toast 通知，不用 alert）
- 离线可用（本地存储）

### 组件库（v4.0 新增 `src/ui/`）

| 组件 | 来源 | 用法 |
|---|---|---|
| `Sidebar.tsx` | Linear | 主界面左侧 |
| `CommandPalette.tsx` | Linear + Raycast | ⌘K 调出 |
| `ScoreCard.tsx` | Things 3 | 评分卡（爆款潜力 78/100） |
| `SourceCompare.tsx` | TablePlus | 货源对比表 |
| `InlineEdit.tsx` | TablePlus | inline 编辑 |
| `RiskAlert.tsx` | Things 3 | 风险警告弹窗 |
| `ProgressBar.tsx` | Things 3 | 进度条 |
| `Tag.tsx` | Linear | 标签/状态 |
| `ContextMenu.tsx` | PopClip | 右键菜单 |
| `EmptyState.tsx` | Linear | 空状态 |

### 真实可交互 Mockup（设计基线）

📐 **v4.0-mockup.html**（26.8KB）已生成
- 路径：`/Users/michael/AI项目/xhs-picker/v4.0-mockup.html`
- 那哥直接 `open v4.0-mockup.html` 即可在浏览器查看
- 包含完整 3 栏布局 / 4 板块报告 / 风险警告 / 数据源状态 / ⌘K 命令面板
- **那哥 6/9 拍板 OK，作为 v4.0 UI 设计的最终基线**

### 借鉴 vs 不学（已拍板）

| 软件 | 借鉴 | 不学 |
|---|---|---|
| Linear | 三栏 / ⌘K / 极简白 / 状态色 | 冷色调（用暖色） |
| Raycast | 全屏命令面板 / 实时搜索 / 快捷键 | 暗色（用亮色） |
| TablePlus | 表格对比 / inline edit / safe mode | 复杂工具栏 |
| Things 3 | 卡片折叠 / 进度条 / 留白 | 多层级 |
| PopClip | 上下文菜单 / 系统集成 | 多动作堆叠 |

详细 UI 调研报告：`UI调研报告.md`（7.5KB）

---

## 📋 v4.0 must_pass（14 条 · 收敛版）

### 🔴 P0 阻塞（无这些工具不能用）

**M1. Playwright 内核集成（替代 v3.1 的 CDP）**
- Tauri webview + Playwright（不是自写 CDP）
- 驱动真实浏览器，绕过逆向签名
- 路径：`src-tauri/src/playwright/launcher.ts`

**M2. JS 注入签名框架（x-s / X-Bogus 等）**
- 不在浏览器外逆签名，直接调平台 JS 上下文
- 动态加载各平台签名函数（小红书/抖音/1688/淘宝）
- 路径：`src-tauri/src/signatures/injector.ts`

**M3. storage_state 持久化（替代 v3.1 加密 Cookie）**
- 扫码登录 → 序列化 Playwright storage_state → 存 `~/.xhs-picker/storage_state.json`
- 下次启动直接 restore，免扫码
- 路径：`src-tauri/src/auth/storage_state.ts`

**M4. stealth.js 反检测注入（替代 v3.1 频率自适应）**
- Playwright 启动时注入 stealth.js
- 随机化 User-Agent + viewport + 时区
- 模拟真实用户行为间隔（无固定 delay）
- 路径：`src-tauri/src/stealth/injector.ts`

**M5. MCP Server（核心 · XHS-Downloader 路线）**
- 工具本身就是 MCP Server，可被 Claude/Cursor/Cline 调用
- 暴露工具：`analyze_keyword` / `fetch_xhs_notes` / `reverse_source` / `analyze_image`
- 路径：`src-tauri/src/mcp/server.ts`（用 `@modelcontextprotocol/sdk`）

---

### 🟡 P1 核心（这些做完=工具可用）

**M6. 多平台统一爬虫（基于 MediaCrawler）**
- 统一 `platform_crawler.ts` 接口：登录 / 抓搜索 / 抓笔记 / 抓评论
- 当前支持：小红书 / 1688 / 淘宝 / 拼多多
- 未来可扩：抖音 / B站 / 微博（v5+）

**M7. 货源反查（1688 优先 + 淘宝 + pdd）**
- 用户在小红书选中候选品 → 工具调用 M6 多平台爬虫
- 输出：同款 / 相似款 / 售价 / 起订量 / 销量 / 商家名
- 价格透明度排序（1688 优先）

**M8. 极简 AI 选品分析（DeepSeek 单点）**
- 9 品类 prompt 收敛（v3.1 复用）
- 4 板块报告：市场概况 / 爆款潜力 / 选品建议 / 货源推荐
- 多模态（M16）**降级为 P2 后期**

**M9. 商家可信度评分（双轨）**
- 小红书商家 0-100 分（基于销量 + 评价 + 经营时长）
- 货源商家 0-100 分（基于销量 + 评价 + 经营时长 + 风险标记）

**M10. 选品方法论注入（11 篇手册 + 飞书文章）**
- 9 品类 × 11 篇手册方法论嵌入 prompt
- 飞书文章 3 大核心：品类区分 / 封面二阶段 / 卖点重组 4 步
- 文件：`方法论手册脱敏版/`

---

### 🟢 P2 增强（不阻塞上线，但能提升品质）

**M11. Tauri 2 + React 19 桌面端**
- Web UI 模式（开发时）
- Tauri 桌面端（生产时）
- 跨平台打包：macOS .dmg / Windows .exe
- 路径：`src-tauri/` + `src/`

**M12. 数据可视化报告（4 板块）**
- 市场概况：折线图 / 饼图
- 爆款潜力：进度条 / 评分卡
- 选品建议：列表 + 高亮
- 货源推荐：对比表（3 平台并排）

**M13. 风险警告弹窗（M15 闲鱼方案必加）**
- 用户首次添加"千瓜/灰豚/蝉妈妈"弹风险警告
- 强制勾选"已知风险"才能继续
- **决策溯源**：6/9 那哥拍板闲鱼 + 小米 3 次反对（保留）

**M14. 国内国外统一架构**
- 国内：MediaCrawler 路线（Playwright + JS 注入）
- 国外：API 优先 + WebView 补充（参考 saqierma-cyber/moneymaker）
- 共用：UI / 数据层 / 报告生成

---

## 🚫 v4.0 砍掉清单（明确不做）

- ❌ 自己逆签名（x-s、X-Bogus 等）— **维护成本极高，平台一更新就崩**
- ❌ 频率自适应（v3.1 safety/network.ts）— **stealth.js + 行为间隔更优**
- ❌ Cookie 加密 SQLite（v3.1 safety/account.ts）— **Playwright storage_state 加密 JSON 更稳**
- ❌ 跨平台对比逻辑
- ❌ 6 个第三方数据工具的闲鱼共享账号（M15 风险太大，**降级为 nice-to-have**）
- ❌ 11 篇手册的对齐报告 + C 图（v3.1 那一堆可视化）— **方法论嵌入 prompt 即可**
- ❌ 渐进式登录（M17）— **首次启动引导保留，但砍掉强制至少 1 个**（用户能跑就行）
- ❌ M16 多模态（GLM-4V）— **P2 后期**
- ❌ 黑五类的"不引导引流方式" — **降级为只警告不拦截**

---

## 📁 v4.0 目录结构（推翻 v3.1）

```
~/AI项目/xhs-picker/
├── CLAUDE.md                        ← v4.0 配置
├── GOAL-DECLARATION.md              ← 本文件
├── PROGRESS-v4.md                   ← v4 进度
│
├── src-tauri/                       ← Tauri 2 Rust 壳
│   └── src/
│       ├── playwright/              ← 【新】Playwright 集成
│       │   ├── launcher.ts          ← M1
│       │   └── context.ts
│       ├── signatures/              ← 【新】JS 注入签名
│       │   ├── injector.ts          ← M2
│       │   └── xhs.ts / dy.ts / tb.ts
│       ├── auth/                    ← 【新】登录态
│       │   ├── storage_state.ts     ← M3
│       │   └── qr_login.ts
│       ├── stealth/                 ← 【新】反检测
│       │   ├── injector.ts          ← M4
│       │   └── stealth.js
│       ├── mcp/                     ← 【新】MCP Server
│       │   ├── server.ts            ← M5
│       │   └── tools/               ← 4 个工具实现
│       ├── platform_crawler/        ← 【新】多平台统一爬虫
│       │   ├── base.ts              ← M6
│       │   ├── xhs.ts
│       │   ├── source-1688.ts
│       │   ├── source-taobao.ts
│       │   └── source-pdd.ts
│       └── scoring/                 ← 【新】商家可信度评分
│           ├── xhs_seller.ts        ← M9
│           └── source_seller.ts
│
├── src/                             ← React 19 前端
│   ├── app/
│   │   ├── page.tsx                 ← 主界面（4 板块）
│   │   └── api/
│   │       └── analyze/route.ts
│   ├── components/
│   │   ├── ReportCard.tsx           ← M12
│   │   ├── SourceCompare.tsx
│   │   └── ProfitCalculator.tsx
│   ├── lib/
│   │   ├── analyzer.ts              ← M8
│   │   ├── blacklist.ts
│   │   ├── categories.ts            ← 9 大品类
│   │   └── methods/                 ← M10 方法论注入
│   │       ├── xhs-x2-通用底层.ts
│   │       ├── xhs-x4-灰豚商品榜.ts
│   │       ├── xhs-x8-漏斗池.ts
│   │       └── fs-飞书-卖点重组.ts
│   └── ui/                          ← 【新】UI 组件库（参考 Linear）
│       ├── Sidebar.tsx
│       ├── CommandPalette.tsx
│       ├── ScoreCard.tsx
│       └── RiskAlert.tsx
│
├── 学习笔记/                        ← 每天 1-2h 学习
│   ├── 2026-06-09-Day1.md
│   ├── 2026-06-09-Day2.md          ← Day 2 必含 MediaCrawler 学习
│   └── ...
│
├── .hook-需求.md                    ← 后期 hook 机制
└── scripts/
    └── day1-status.sh
```

---

## 🛠 v4.0 真实工时

| 模块 | 工时 |
|---|---|
| M1 Playwright 集成 | 4-6h |
| M2 JS 注入签名 | 6-8h |
| M3 storage_state | 3-4h |
| M4 stealth.js | 2-3h |
| M5 MCP Server | 4-6h |
| M6 多平台爬虫 | 8-12h |
| M7 货源反查 | 3-4h |
| M8 AI 选品 | 3-4h（v3.1 复用） |
| M9 商家评分 | 4-5h |
| M10 方法论注入 | 3-4h |
| M11 Tauri 桌面 | 6-8h |
| M12 数据可视化 | 4-5h |
| M13 风险弹窗 | 1-2h |
| M14 国内外统一 | 2-3h |
| **总计** | **53-74h** |
| **学习（30%）** | **+16-22h** |
| **总工时** | **69-96h** |
| **按 4h/天** | **17-24 个工作日（4-6 周）** |

比 v3.1 的 99-126h 略少（M15/M16/M17 砍掉，M5 MCP 替代部分工作）。

---

## 🎨 v4.0 界面设计（基于国外软件调研）

### 借鉴对象

| 软件 | 借鉴点 | 适用模块 |
|---|---|---|
| **Linear** | 左侧 sidebar + 右侧详情 + 命令面板搜索 | 主界面 + 全局搜索 |
| **Raycast** | 命令面板 + 快捷键 + 实时预览 | 关键词搜索 + 数据源切换 |
| **TablePlus** | 高级筛选 + inline edit + 多 tab | 货源对比 + 商家评分 |
| **Things 3** | 列表 + 进度条 + 简洁卡片 | 选品报告 + 风险警告 |
| **PopClip** | 选中即弹 + 一键操作 | 小红书笔记 URL → 反查 |

### 界面草图（4 板块布局）

```
┌─────────────────────────────────────────────────────────────┐
│  XHS Picker  ⌘K  [搜索]              [数据源: ✓]  [设置]    │  ← 顶栏（Linear 风格）
├──────────┬──────────────────────────────────────────────────┤
│          │  🔍 防晒霜                            [分析]      │  ← 搜索框
│  📊 选品 │ ┌──────────────────────────────────────────────┐ │
│  📦 货源 │ │ 1. 市场概况                                  │ │
│  🏪 商家 │ │    市场规模: ¥2.3亿 / 增速 35% / 竞争密度 7   │ │
│  📈 跟踪 │ ├──────────────────────────────────────────────┤ │
│  📚 手册 │ │ 2. 爆款潜力                                  │ │
│  ⚙️ 设置 │ │    潜力评分: 78/100  ▓▓▓▓▓▓▓▓░░             │ │
│          │ │    上升期 / 爆发期 / 稳定期 / 衰退期         │ │
│  ⌘+K    │ ├──────────────────────────────────────────────┤ │
│  命令面板 │ │ 3. 选品建议                                  │ │
│          │ │    • 品类: 【有颜】/【有用】                  │ │
│          │ │    • 客单价: 99-299 元                       │ │
│          │ │    • 痛点vs痒点: 痛点                        │ │
│          │ ├──────────────────────────────────────────────┤ │
│          │ │ 4. 货源推荐 (1688/淘宝/pdd)                  │ │
│          │ │    1688: ¥18-25 / 1000+ 同款 / 评分 85        │ │
│          │ │    淘宝: ¥35-45 / 500+ 同款 / 评分 78         │ │
│          │ │    pdd:  ¥12-18 / 2000+ 同款 / 评分 62 (降级) │ │
│          │ └──────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 🚀 v4.0 Day 2 任务清单（重写 · 推翻 v3.1）

### 阻塞任务（30min）：dev server 修好

```
1. 确认 3000 端口：lsof -i :3000 → node 25629 在跑 ✅
2. 浏览器硬刷新（Cmd+Shift+R）
3. 如果还是空白 → 查 .next/trace 找错误
4. 反馈给那哥
```

### 核心任务（1.5h）：M1 Playwright 集成

```
1. pnpm add -D playwright @playwright/test
2. pnpm exec playwright install chromium
3. src-tauri/src/playwright/launcher.ts
   - launch(): 启动 chromium with stealth
   - newContext(storageState): 加载上次登录态
   - close(): 清理
4. 测试：能启动浏览器 + 打开 xhs.com
```

### 学习任务（30min）：MediaCrawler 阅读

```
必读：
1. github.com/NanmiCoder/MediaCrawler README
2. base/base_crawler.py 看 storage_state 怎么用
3. media_platform/xhs/core.py 看签名怎么注入

学习笔记路径：学习笔记/2026-06-09-Day2-MediaCrawler.md
```

### 自检（30min）

```
1. npx tsc --noEmit → 0 错误
2. pnpm dev → 3000 端口持续监听
3. 浏览器刷新 → 看到新界面
4. Git commit Day 2
```

---

## 📌 v4.0 决策溯源

| 决策 | 那哥拍板 | 小米立场 | 备注 |
|---|---|---|---|
| v3.1 → v4.0 大改 | ✅（那哥 6/9 原话"新界面没区别，方式不合理，要大改"） | **强烈同意** | 之前路线有问题 |
| 引入 MediaCrawler 思路（Playwright + JS 注入） | ✅ | **强烈推荐** | GitHub 50.9k star 验证过 |
| 引入 MCP Server（XHS-Downloader 路线） | ✅ | 同意 | AI 时代必经之路 |
| stealth.js 反检测 | ✅ | 同意 | 主流方案 |
| storage_state JSON 持久化 | ✅ | 同意 | 比 Cookie 加密 SQLite 更稳 |
| 砍 M15 闲鱼方案 | ✅ | **强烈同意** | 风险太大，做 nice-to-have |
| 砍 M16 多模态 | ✅ | 同意 | P2 后期 |
| 砍 M17 强制登录 | ✅ | 同意 | 用户能跑就行 |
| 借鉴 Linear/Raycast/TablePlus 界面 | ✅ | 同意 | 国外成熟产品 |
| **加 M15 评分系统（自检 0-100·7维度）** | ✅ 那哥 6/10 拍板 | 强烈同意 | Day1 复盘暴露"无质量门"问题 |
| **加 M16 Debug 机制（L1/L2/L3 三级卡点分级）** | ✅ 那哥 6/10 拍板 | 强烈同意 | STUCK 不再硬扛 |
| **加 M17 迭代到100分 SOP（80→100 两阶段闭环）** | ✅ 那哥 6/10 拍板 | 强烈同意 | 周末精修机制 |

---

## 立即执行的 3 件事（不靠助手看完所有资料）

1. ✅ **GOAL v3.1 已备份** → `GOAL-DECLARATION.v3.1.bak` 31KB
2. ✅ **GOAL v4.0 草案已写** → `GOAL-DECLARATION.md`（等那哥拍板）
3. 🟡 **Day 2 任务清单已重写**（基于 v4.0 路线）
4. 🟡 **dev server 修复指令**（给 claude code：硬刷新 + 看 .next/trace）

---

**那哥，2 个直接问题回我**：

1. **GOAL v4.0 这版你认吗？** = 接受大改 / 还是要调整某些点
2. **Day 2 任务清单你认吗？** = Playwright 集成优先 / 还是先做别的

**直接回"全认"或列 1-2 个不认的点**，3 秒搞定。
