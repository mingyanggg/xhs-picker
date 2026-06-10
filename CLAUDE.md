# CLAUDE.md — XHS Picker v4.0（MediaCrawler 路线）

> 本文件供 Claude Code 读取，定义项目架构、约束和开发规范。
> **当前版本：v4.0（2026-06-09 22:30 那哥拍板大改）**——v3.1 已废，14 条 must_pass
> **不要按 v1 / v2 / v3 / v3.1 思路做事**

## 一句话定义

**XHS Picker** 是一个 Tauri 2 桌面工具，为那哥自己用。输入关键词 → 在小红书做选品分析 → 反查 1688/淘宝/拼多多货源 → 用 MCP Server 协议暴露给 Claude/Cursor/Cline 调用。
**路线**：MediaCrawler 风格（Playwright + JS 注入平台自带签名，不逆签名） + XHS-Downloader 风格（工具本身就是 MCP Server） + 暖色杂志风 UI（Linear/Raycast/TablePlus/Things 3 借鉴）。

---

## v4.0 vs v3.1 核心改变（必须知道的 5 条）

| 维度 | v3.1（旧·废） | v4.0（新·现行） |
|---|---|---|
| **抓取方式** | 自己写 CDP + 逆签名（x-s / X-Bogus） | **Playwright + JS 注入平台自带签名** |
| **架构定位** | Web UI 为主 | **MCP Server + Web UI 双模式** |
| **反检测** | 频率自适应 | **stealth.js 注入 + 随机化 UA + 行为间隔** |
| **登录态** | Cookie 加密 SQLite | **Playwright storage_state 序列化 JSON** |
| **栈一致性** | TS 用了 Python 参考 | **100% Tauri 2 + React 19 + TS**（同栈 saqierma-cyber/moneymaker） |

---

## v4.0 must_pass（14 条 · 决策溯源：GOAL-DECLARATION.md）

### 🔴 P0 阻塞（5 条 · 无这些工具不能用）

- **M1** Playwright 内核集成 → `src-tauri/src/playwright/launcher.ts`
- **M2** JS 注入签名框架（x-s / X-Bogus）→ `src-tauri/src/signatures/injector.ts`
- **M3** storage_state 持久化 → `src-tauri/src/auth/storage_state.ts`
- **M4** stealth.js 反检测注入 → `src-tauri/src/stealth/injector.ts`
- **M5** MCP Server（核心 · 用 `@modelcontextprotocol/sdk`）→ `src-tauri/src/mcp/server.ts`，暴露 4 个工具：`analyze_keyword` / `fetch_xhs_notes` / `reverse_source` / `analyze_image`

### 🟡 P1 核心（5 条 · 做完 = 工具可用）

- **M6** 多平台统一爬虫（小红书 / 1688 / 淘宝 / 拼多多）→ `src-tauri/src/platform_crawler/`
- **M7** 货源反查（1688 优先 → 淘宝 → pdd）
- **M8** 极简 AI 选品分析（DeepSeek 单点 · 9 品类 × 4 板块报告）→ `src/lib/analyzer.ts`
- **M9** 商家可信度评分（双轨：小红书商家 / 货源商家）→ `src-tauri/src/scoring/`
- **M10** 选品方法论注入（11 篇手册 + 飞书文章）→ `src/lib/methods/`

### 🟢 P2 增强（4 条 · 不阻塞上线）

- **M11** Tauri 2 + React 19 桌面端打包（.dmg / .exe）
- **M12** 数据可视化报告（折线图 / 评分卡 / 对比表）
- **M13** 风险警告弹窗（M15 闲鱼方案必加 · 那哥拍板 + 小米 3 次反对保留）
- **M14** 国内国外统一架构（国内 Playwright · 国外 API 优先 · 共用 UI/数据/报告）

### 🔧 P0 同步建设 · 开发质量门（那哥 6/10 拍板 · Day2 加）

- **M15·评分系统**（自检 0-100 分 · 7 维度 · 每轮必跑）
- **M16·Debug 机制**（L1 自动 / L2 半自动 / L3 求助 · 卡点分级）
- **M17·迭代到 100 分 SOP**（80 分能用 → 100 分好用到不想换）

---

## 🚫 v4.0 砍掉清单（不要做 · 重要）

- ❌ **自己逆签名**（x-s / X-Bogus）—— 维护成本极高，平台一更新就崩
- ❌ **频率自适应**（v3.1 `lib/safety/network.ts`）—— stealth.js + 行为间隔更优
- ❌ **Cookie 加密 SQLite**（v3.1 `lib/safety/account.ts`）—— storage_state 加密 JSON 更稳
- ❌ **跨平台对比逻辑**
- ❌ **6 个第三方工具的闲鱼共享账号**（M15 风险太大，降级 nice-to-have）
- ❌ **11 篇手册的对齐报告 + C 图** —— 方法论嵌入 prompt 即可
- ❌ **渐进式登录**（M17）—— 首次启动引导保留，砍掉强制至少 1 个
- ❌ **M16 多模态**（GLM-4V）—— P2 后期
- ❌ **黑五类的"不引导引流方式"** —— 降级为只警告不拦截

---

## 技术栈（100% 同栈 · 参考 saqierma-cyber/moneymaker）

```
桌面壳：Tauri 2（Rust + WebView）
前端：Next.js 14 + React 19 + TypeScript + Tailwind CSS 4
后端：Next.js API Routes（MVP 轻量，无独立后端）
本地存储：SQLite（via better-sqlite3）
AI：DeepSeek API（OpenAI 兼容格式）
抓取：Playwright + JS 注入（替代 v3.1 的 CDP + 逆签名）
MCP：@modelcontextprotocol/sdk
构建：pnpm
```

---

## 目录结构（v4.0 现行）

```
~/AI项目/xhs-picker/
├── CLAUDE.md                        ← 本文件（v4.0 配置）
├── GOAL-DECLARATION.md              ← v4.0 现行（14 条 must_pass）
├── GOAL-DECLARATION.v3.1.bak        ← v3.1 备份（31KB·已废）
├── GOAL-DECLARATION.v2.bak          ← v2 备份
├── GOAL-DECLARATION.v1.bak          ← v1 备份（8 条全过）
├── PROGRESS-v4.md                   ← v4 现状快照
├── UI调研报告.md                     ← 5 个国外软件调研（7.5KB）
├── v4.0-mockup.html                 ← 设计基线（26.8KB · 那哥 23:00 拍 OK）
├── DAY2-任务清单.md                  ← Day 2 v4.0 任务清单
│
├── src-tauri/                       ← Tauri 2 Rust 壳
│   └── src/
│       ├── playwright/              ← 【新】Playwright 集成
│       │   ├── launcher.ts          ← M1
│       │   └── context.ts
│       ├── signatures/              ← 【新】JS 注入签名
│       │   ├── injector.ts          ← M2
│       │   ├── xhs.ts / dy.ts / tb.ts
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
│       │   ├── xhs.ts / source-1688.ts / source-taobao.ts / source-pdd.ts
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
│       ├── Sidebar.tsx              ← Linear 三栏
│       ├── CommandPalette.tsx       ← ⌘K（Raycast）
│       ├── ScoreCard.tsx            ← Things 3
│       ├── SourceCompare.tsx        ← TablePlus
│       ├── RiskAlert.tsx            ← Things 3
│       └── EmptyState.tsx
│
├── 学习笔记/                        ← 每天 1-2h 学习产出
│   ├── 2026-06-09-Day1.md
│   └── 2026-06-10-Day2-MediaCrawler.md  ← Day 2 必含
│
└── .hook-需求.md                    ← 后期 hook 机制
```

---

## 🎨 v4.0 界面设计（基线 = v4.0-mockup.html）

### 借鉴 vs 不学（已拍板）

| 软件 | 借鉴 | 不学 |
|---|---|---|
| **Linear** | 三栏布局 / ⌘K / 极简白 / 状态色 | 冷色调（用暖色） |
| **Raycast** | 全屏命令面板 / 实时搜索 / 快捷键 | 暗色（用亮色） |
| **TablePlus** | 表格对比 / inline edit / safe mode | 复杂工具栏 |
| **Things 3** | 卡片折叠 / 进度条 / 留白 | 多层级 |
| **PopClip** | 上下文菜单 / 系统集成 | 多动作堆叠 |

### 色调 token（米白+暖橙+深棕 · 暖色杂志风）

```css
--bg-main: #FAF8F4;       /* 主背景 */
--bg-card: #FFFFFF;       /* 卡片 */
--bg-sidebar: #F2EDE4;    /* 侧栏 */
--text-primary: #2C2620;  /* 主文字（深棕） */
--text-secondary: #8B6F47;/* 副文字（暖棕） */
--accent-primary: #D97706;/* 主强调（暖橙） */
--warning: #DC2626;
--success: #059669;
--border-light: #E8D9C0;  /* 边框（浅棕） */
```

### 布局规则（3 栏 Linear 风格）

- 左 sidebar 240px + 中列表 360px + 右详情 flex
- 卡片间距 16-24px
- 圆角 8px（卡片） / 4px（按钮） / 12px（弹窗）
- 阴影 0 1px 2px（极淡） / 0 8px 24px（弹窗）
- 字体：Inter（英文）+ PingFang SC（中文）+ JetBrains Mono（代码）
- 标题 24px / 正文 14px / 辅助 12px

### 交互原则

- 键盘优先（所有操作有快捷键）
- 即时反馈（操作 ≤100ms 出 loading）
- 错误友好（toast，不用 alert）
- 离线可用（本地存储）

---

## 🔧 开发质量门（M15 + M16 + M17 · 那哥 6/10 拍板 · Day2 同步建设）

> **为什么加**：Day1 复盘已暴露问题——4h 产出 6 文件但 0.3h 代码，根本原因是**没有质量门**，开发完没自检就过了判定。三件套 = 给 Day2-Day24 装上刹车，避免"做完了但不能用"。
> **目标**：每轮开发结束自动算分 · 卡点自动分级 · 80 分能用到 100 分好用闭环。

### M15 · 评分系统（每轮自检 0-100 分 · 7 维度 · 自动跑）

**触发时机**：每天 22:00 复盘 cron + 每次 `git commit` 前（pre-commit hook）+ 每个 must_pass 完成时。

| # | 维度 | 满分 | 评分规则 |
|---|---|---|---|
| 1 | **TypeScript 严格** | 15 | `npx tsc --noEmit` 0 错=15；1-3 错=10；4-10 错=5；>10 错=0 |
| 2 | **核心功能能用** | 20 | Playwright 启动 + xhs.com 打开 =20；启动但超时 =10；启动失败 =0 |
| 3 | **dev server 健康** | 10 | 3000 端口持续监听 + 返回 200 =10；监听但超时 =5；未运行 =0 |
| 4 | **UI mockup 对齐** | 15 | 对照 `v4.0-mockup.html` 视觉差异 ≤10%=15；≤30%=10；≤50%=5；>50%=0 |
| 5 | **must_pass 完成率** | 20 | 当日完成的 must_pass / 当日计划完成数 ×20（0 完成=0） |
| 6 | **学习笔记产出** | 10 | 当日学习笔记 ≥500 字 + 引用源码 =10；<500 字 =5；未写 =0 |
| 7 | **Git 提交规范** | 10 | commit message 带 `DayX / Mx` 标签 =10；无标签但合规 =5；散乱 =0 |

**总分判定**：
- **90-100 · 🟢 优秀** = 直接进 100 分精修阶段
- **80-89 · 🟡 良好** = 当日可交付，进下一轮迭代
- **60-79 · 🟠 及格** = 标记 3 个最低分维度，必须当日补完
- **<60 · 🔴 不及格** = **强制回滚**，重做当天任务，不进 Day+1

**输出位置**：每次自检结果自动追加到 `PROGRESS-v4.md` 末尾（`## 自检 · Day X · YYYY-MM-DD · Z分` 标题块）。

### M16 · Debug 机制（L1 / L2 / L3 三级 · 卡点分级自动触发）

**卡点分级标准**：
| 等级 | 触发条件 | 处理方式 | 那哥介入 |
|---|---|---|---|
| **🟢 L1 轻微** | 单文件错误 / 单行 TS 错 / 端口冲突 / 拼写错 | Claude Code 自修（pre-commit hook 自动跑） | 不打扰 |
| **🟡 L2 中等** | 模块级错误（Playwright 启动失败 / 签名注入失败 / MCP 协议不响应） | 触发 `.next/trace` 自动分析 + 重试 1 次 | 22:00 复盘 cron 报告里标出 |
| **🔴 L3 STUCK** | 同一卡点连续 2 轮未解 / 涉及第三方 API 权限 / 平台签名变更 | **立即暂停** + 写入 `STUCK.md` + 那哥拍板（继续/跳过/求助） | **当下打断** |

**L1 自动检查清单**（pre-commit hook `scripts/pre-commit.sh`）：
```bash
#!/bin/bash
# 每次 commit 前必跑
set -e
echo "=== L1 自检 ==="
npx tsc --noEmit || { echo "❌ TS 错"; exit 1; }
lsof -i :3000 >/dev/null 2>&1 || echo "⚠️ dev server 未跑（不阻断 commit）"
pnpm exec playwright --version >/dev/null 2>&1 || echo "⚠️ Playwright 未装（不阻断 commit）"
echo "✅ L1 通过"
```

**L2 半自动**：当 Playwright/MCP/签名注入失败时，Claude Code 必跑：
```bash
# 1. 看错误
cat .next/trace 2>/dev/null | tail -50
# 2. 看进程
lsof -i :3000 && lsof -i :9223
# 3. 看日志
tail -30 src-tauri/logs/*.log 2>/dev/null
```
如果 1 轮重试仍失败 → 升级 L3。

**L3 求助模板**（写到 `STUCK.md`）：
```markdown
## STUCK · YYYY-MM-DD HH:MM · 等级 L3
- **卡点**：（一句话）
- **已尝试**：（列出 2-3 个方法）
- **错误信息**：（粘贴原始错误）
- **影响**：（阻塞哪个 must_pass）
- **建议**：（继续 / 跳过 / 求助外部）
- **那哥拍板**：（待填）
```

### M17 · 迭代到 100 分 SOP（80 分能用 → 100 分好用到不想换）

**两阶段闭环**：

**阶段 1：80 分能用（Day X · 当日 22:00 前）**
1. 完成当日 must_pass
2. 跑 L1 自检 → 必须 ≥80 分
3. 如未达 → 标 3 个最低维度 → 当日补完
4. 写当日学习笔记 → Git commit → 22:00 复盘 cron

**阶段 2：80→100 分精修（每周末 · 周六/周日 · 2h/天）**
| 维度 | 80 分标准 | 100 分标准 |
|---|---|---|
| TS | 0 错 | 0 错 + 0 warning + 关键路径有单测 |
| 核心功能 | 能用 | 用得顺手（启动 <3s / 不闪退 / 错误友好） |
| UI | 对齐 mockup 80% | 对齐 mockup 100% + 动画/快捷键全配 |
| must_pass | 当日全过 | 全过 + 边界 case 测过 |
| 学习笔记 | 写了 | 写了 + 提炼出可复用模式 |
| Git | 标签合规 | 标签合规 + CHANGELOG.md 维护 |
| 文档 | 跟上 | 跟上 + 给未来自己的"避坑笔记" |

**精修触发条件**：
- Week 结束 · 当前模块评分 <100 分
- 那哥明确说"用着不爽" → 立即进入精修
- 12:30 / 22:00 复盘 cron 标出"低于 100 分的维度" → 写入 `精修清单.md`

**不进 100 分精修的 3 个例外**（避免过度精修）：
1. 当前模块评分 ≥95 分 · 那哥用着没抱怨 → 跳过
2. 工时预算耗尽 80% → 跳过 P2 维度
3. 那哥明确"这个就够" → 跳过

---

## 开发约束（v4.0）

```yaml
必须:
  - "Playwright 启动浏览器时必须注入 stealth.js（不是频率自适应）"
  - "登录态用 storage_state JSON 持久化（不是 SQLite 加密 Cookie）"
  - "签名通过 JS 注入平台上下文（不逆签名）"
  - "MCP Server 用 @modelcontextprotocol/sdk，4 个工具必须实现"
  - "黑五类：只警告不拦截，不推广不提供货源不引导引流（v3.1 升级砍掉引导引流）"
  - "学习产出：每天 1-2h 必须写到 学习笔记/ 目录"
  - "数据源标注：每个字段必须有来源（笔记 ID / 商家 ID / 采集时间）"
  - "降级优先：CDP 失败时立即降级手动粘贴，不反复重试（保留 v3.1）"
  - "极致安全：账号/IP/数据/降级 4 层级都要有，但实现方式 = stealth.js + storage_state"
  - "UI 必须参照 v4.0-mockup.html（那哥拍板 OK 的设计基线）"

禁止:
  - "不调用任何需要用户付费的API"
  - "不在代码中硬编码 API Key（用环境变量）"
  - "不做服务端存储（MVP 阶段纯本地）"
  - "不做用户注册/登录系统（MVP 不需要）"
  - "不做移动端适配（先桌面端 Mac+Win）"
  - "不引入付费 SaaS 依赖"
  - "不抓取抖音/快手/视频号作为选品目标（v3 砍掉·v4 保留）"
  - "不向外部服务器上报用户数据（极致安全约束）"
  - "不返回假数据/刷量数据未标记的选品报告"
  - "不中转/不存储/不代理用户的 API Key"
  - "不自己逆签名（v4 明确砍掉）"
  - "不写频率自适应（v4 明确砍掉）"
  - "不写 Cookie 加密 SQLite（v4 明确砍掉）"
  - "不做跨平台对比逻辑（v4 明确砍掉）"
  - "不做渐进式登录的强制至少 1 个（v4 砍掉 M17）"
  - "不自检 80 分以下就进 Day+1（M15 强制 · <60 必回滚）"
  - "不绕过 L1 pre-commit hook 直接 commit（M16 强制）"
  - "不忽略 L3 STUCK 卡点硬扛（M16 · 必须暂停+求助）"
  - "不做过度精修：评分已 ≥95 + 那哥无抱怨就跳过（M17 例外条款）"

### 🔁 Claude Code 工作流嵌入（M15-M17 强制 · 6/10 那哥拍板）

> **关键**：以下 4 个时刻 Claude Code **必须主动跑自检**，不是那哥提醒，是 Claude Code 自己执行：

| # | 触发时机 | Claude Code 必做的事 | 必跑的脚本 |
|---|---|---|---|
| 1 | **完成任意一个 must_pass（M1-M14）后** | 跑 self-check.sh + 把分数贴出来 + 标 STUCK 项（如有） | `bash scripts/self-check.sh` |
| 2 | **准备 `git commit` 前** | 跑 pre-commit.sh（不通过则禁止 commit） | `bash scripts/pre-commit.sh` |
| 3 | **每日 22:00 复盘 cron 触发时** | 跑 self-check.sh + 把分数 + 7 维度明细追加到 PROGRESS-v4.md 末尾 | `bash scripts/self-check.sh` |
| 4 | **遇到同一错误第 2 次时** | 升级 L3 · 立即写 STUCK.md + 暂停 + 通知那哥拍板 | 手动写 STUCK.md |

**Claude Code 标准回复模板**（完成 must_pass 后必须输出）：

```
✅ Mx 已完成 · M15 自检 Y/100
- TS: a/15 · 核心: b/20 · dev: c/10 · UI: d/15 · must_pass: e/20 · 笔记: f/10 · Git: g/10
- STUCK 项:（如有 · 无则写"无"）
- 下一步:（接 Mx+1 还是先补 STUCK）
```

**判定规则**（写进 Claude Code prompt 不靠它记）：
- Y ≥ 90 = 🟢 优秀 · 进 100 分精修
- 80 ≤ Y < 90 = 🟡 良好 · 当日可交付
- 60 ≤ Y < 80 = 🟠 及格 · 标 3 个最低维度 · 当日补完
- Y < 60 = 🔴 不及格 · **回滚当天任务** · 不进 Day+1

**禁止项**（那哥拍板，违反=回滚）：
- ❌ Claude Code 不主动跑 self-check.sh = 那哥立即 /clear 重启
- ❌ 跑完不贴分数 = 那哥立即指出"贴分"
- ❌ 分数 <80 编造 ≥80 = 那哥立即发现并回滚
```

---

## 环境变量

```bash
# .env.local（不提交到 git）
DEEPSEEK_API_KEY=*** DeepSeek API Key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
# 那哥 6/9 反馈"已配好"，状态 ✅
```

---

## 测试命令

```bash
pnpm dev              # Next.js 开发模式（端口 3000）
pnpm build            # Next.js 构建
pnpm tauri dev        # Tauri 桌面 APP 开发模式
pnpm tauri build      # 打包桌面 APP（.dmg/.exe）
npx tsc --noEmit      # TypeScript 类型检查（必须 0 错误 · M15 评分维度 1）
pnpm exec playwright install chromium  # 安装 Playwright Chromium
bash scripts/pre-commit.sh             # L1 自检（commit 前必跑 · M16 强制）
bash scripts/self-check.sh             # M15 完整评分（22:00 cron + commit 前）
```

---

## API 设计

### POST /api/analyze（小红书选品）

```typescript
// 请求
{ keyword: string; category: Category; }
// 响应
{
  report: {
    market: MarketOverview;
    viralPotential: ViralPotential;
    suggestion: PickSuggestion;
    sourceRecommendation: SourceRecommend[];  // M7 货源推荐
  };
  isBlacklisted: boolean;
  blacklistWarning?: BlacklistWarning;
}
```

### MCP Server 暴露的 4 个工具（M5）

```typescript
analyze_keyword(keyword: string, category: string) → Report
fetch_xhs_notes(keyword: string, limit: number) → Note[]
reverse_source(productName: string, targetSources: string[]) → SourceResult[]
analyze_image(imageUrl: string, prompt: string) → Analysis
```

---

## 关键参考文件

| 文件 | 用途 |
|---|---|
| `GOAL-DECLARATION.md` | **v4.0 现行·14 条 must_pass·权威** |
| `GOAL-DECLARATION.v3.1.bak` | v3.1 备份（已废·仅供溯源） |
| `PROGRESS-v4.md` | v4 现状快照 + Day 2 任务清单 |
| `UI调研报告.md` | 5 个国外软件调研细节 |
| `v4.0-mockup.html` | **设计基线·那哥 6/9 23:00 拍 OK** |
| `DAY2-任务清单.md` | Day 2 v4.0 任务清单 |
| `学习笔记/` | 每天学习产出（强制） |

---

## v4.0 工时估算

| 模块 | 工时 |
|---|---|
| M1 Playwright | 4-6h |
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
| **学习 30%** | **+16-22h** |
| **总工时** | **69-96h（vs v3.1 99-126h，砍 30%）** |
| **4h/天** | **17-24 个工作日（4-6 周）** |

---

## v4.0 决策溯源（6/9 那哥拍板 · 全部成立 · 不要质疑）

| # | 决策 | 拍板 | 小米立场 |
|---|---|---|---|
| 1 | v3.1 → v4.0 大改 | ✅ 那哥原话"新界面没区别，方式不合理，要大改" | 强烈同意 |
| 2 | MediaCrawler 思路（Playwright + JS 注入） | ✅ | 强烈推荐（GitHub 50.9k star 验证） |
| 3 | XHS-Downloader MCP Server | ✅ | 同意（AI 时代必经之路） |
| 4 | stealth.js 反检测 | ✅ | 同意（主流方案） |
| 5 | storage_state JSON 持久化 | ✅ | 同意（比 Cookie 加密 SQLite 更稳） |
| 6 | 砍 M15 闲鱼方案（降级 nice-to-have） | ✅ | 强烈同意（风险太大） |
| 7 | 砍 M16 多模态（P2 后期） | ✅ | 同意 |
| 8 | 砍 M17 强制登录 | ✅ | 同意 |
| 9 | Linear/Raycast/TablePlus/Things 3 UI 借鉴 | ✅ | 同意 |
| 10 | **v4.0-mockup.html 设计基线** | ✅ 那哥 6/9 23:00 拍板 OK | 强烈推荐 |

---

## Day 2 任务清单（2026-06-10）

### 阻塞 P0 · dev server 验证（30min）
1. `lsof -i :3000` 确认端口在跑
2. 浏览器硬刷新（Cmd+Shift+R）
3. 看到 v4.0-mockup 设计基线（非空白）
4. 查 `.next/trace` 找错误（如果还空白）

### 核心 · M1 Playwright 集成（1.5h）
1. `pnpm add -D playwright @playwright/test`
2. `pnpm exec playwright install chromium`
3. `src-tauri/src/playwright/launcher.ts`
   - `launch()`: 启动 chromium with stealth
   - `newContext(storageState)`: 加载上次登录态
   - `close()`: 清理
4. 测试：能启动浏览器 + 打开 xhs.com

### 学习 · MediaCrawler 阅读（30min）
1. github.com/NanmiCoder/MediaCrawler README
2. `base/base_crawler.py` 看 storage_state 怎么用
3. `media_platform/xhs/core.py` 看签名怎么注入
4. 学习笔记：`学习笔记/2026-06-10-Day2-MediaCrawler.md`

### 自检（30min）
1. `npx tsc --noEmit` → 0 错误
2. `pnpm dev` → 3000 端口持续监听
3. 浏览器刷新 → 看到新界面
4. Git commit Day 2