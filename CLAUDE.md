# CLAUDE.md — 小红书专用 AI 选品 + 货源对接工具 v3.1

> 本文件供 Claude Code 读取，定义项目架构、约束和开发规范。
> **当前版本：v3.1（2026-06-09 立项）**——v3 已升级为 v3.1，17 条 must_pass

## 项目概述

**项目名称**：XHS Picker（小红书AI选品 + 货源对接工具）
**项目类型**：桌面端 SaaS 工具（Tauri 2）
**目标**：v3.1 现行——小红书单平台做透 + 货源反查（1688/拼多多/淘宝）+ 极致安全 4 层级 + 6 个第三方工具 + 渐进式登录 + 11 篇手册完整对齐 + 飞书文章方法论注入 + 多模态分析

## v3.1 核心方向（**不要按 v1/v2/v3 思路**）

- ✅ **只做小红书**（砍掉抖音/快手/视频号作为选品目标）
- ✅ **货源反查**（小红书选品 → 1688/拼多多/淘宝反查同款/相似款 + 利润）
- ✅ **极致安全 4 层级**（账号/IP/数据/降级）
- ✅ **AI 算法筛选货源**（基于 11 篇选品手册脱敏版）
- ✅ **商家可信度评分**（0-100 分 + 分项明细，双轨制）
- ✅ **黑五类不推广不提供货源**（沿用 v1 + 新增"不引导引流方式"）
- ✅ **学习产出必写笔记**（每天 1-2h 学习 → `学习笔记/` 目录）
- ✅ **6 个第三方工具集成**（M15：千瓜/灰豚/蝉妈妈/巨量算数/抖音精选联盟/小红书APP）
- ✅ **多模态分析**（M16：GLM-4V 首选/DeepSeek-VL2 备选）
- ✅ **渐进式登录**（M17：首次启动引导 + 强制至少 1 个数据源）
- ✅ **飞书文章方法论注入**（M13 测品 v2：品类区分+封面二阶段+卖点重组 4 步 SOP）

## 技术栈

```
桌面壳：Tauri 2（Rust + WebView）
前端：Next.js 14 + React 19 + TypeScript + Tailwind CSS 4
后端：Next.js API Routes（轻量，无独立后端）
本地存储：SQLite（via better-sqlite3，跟踪数据+历史记录）
AI：DeepSeek API（OpenAI 兼容格式）
数据抓取：CDP（Chrome DevTools Protocol）via webview 内嵌浏览器
构建：pnpm
```

## 目录结构

```
~/AI项目/xhs-picker/
├── CLAUDE.md              ← 本文件（v3 已更新）
├── GOAL-DECLARATION.md    ← 目标声明（v3 现行，19.4KB）
├── GOAL-DECLARATION.v1.bak ← v1 备份
├── GOAL-DECLARATION.v2.bak ← v2 备份
├── 方法论学习笔记.md       ← 选品方法论（v3 重构为小红书专用）
├── PROGRESS.md            ← v1 进度
├── PROGRESS-v3.md         ← v3 进度
│
├── src-tauri/             ← Tauri Rust 壳
├── src/
│   ├── app/               ← 页面
│   │   ├── page.tsx       ← 主界面（小红书选品 + 货源反查入口）
│   │   └── tracker/       ← 跟踪模块（小红书单平台）
│   ├── components/        ← UI组件
│   │   ├── SearchBox.tsx          # 关键词输入
│   │   ├── ReportCard.tsx         # 选品报告（4 板块）
│   │   ├── SourceCompare.tsx      # 货源对比表（1688/拼多多/淘宝）
│   │   ├── ProfitCalculator.tsx   # 利润空间计算
│   │   ├── ReliabilityBadge.tsx   # 商家可信度评分
│   │   ├── BlacklistAlert.tsx     # 黑五类警告（不提供货源）
│   │   ├── BrowserPanel.tsx       # 内置浏览器（小红书+货源平台）
│   │   └── SafetyIndicator.tsx    # 极致安全状态指示
│   ├── lib/               ← 核心逻辑
│   │   ├── platforms/     ← 平台层（v3 收敛为小红书+3 货源）
│   │   │   ├── types.ts    ← Platform 接口定义
│   │   │   ├── xhs.ts      ← 小红书专用抓取器（v3 极致优化）
│   │   │   ├── source-1688.ts # 1688 货源抓取
│   │   │   ├── source-pdd.ts  # 拼多多货源抓取
│   │   │   ├── source-taobao.ts # 淘宝货源抓取
│   │   │   └── generic.ts   ← 通用兜底（降级方案）
│   │   ├── methods/       ← 【v3 新增】AI 算法筛选货源
│   │   │   ├── source-matcher.ts # 从方法论匹配货源平台
│   │   │   ├── profit-calculator.ts # 利润空间算法
│   │   │   ├── reliability-scorer.ts # 商家可信度评分
│   │   │   ├── fake-data-detector.ts # 假数据/刷量检测
│   │   │   └── index.ts
│   │   ├── safety/        ← 【v3 新增】极致安全 4 层级
│   │   │   ├── account.ts # 账号层（Cookie 加密 + 风控检测）
│   │   │   ├── network.ts # IP 层（频率自适应 + 代理池）
│   │   │   ├── data-integrity.ts # 数据层（假数据过滤 + 校验）
│   │   │   └── fallback.ts # 降级层（手动粘贴模式）
│   │   ├── analyzer.ts    ← AI 选品分析（小红书专用）
│   │   ├── blacklist.ts   ← 黑五类关键词库
│   │   ├── categories.ts  ← 9 大品类定义
│   │   └── tracker/       ← 跟踪模块（小红书单平台）
│   │       ├── store.ts
│   │       ├── scheduler.ts
│   │       └── lifecycle.ts
│   └── api/               ← API 路由
│       ├── analyze/       ← 选品分析 API
│       └── source/        ← 【v3 新增】货源反查 API
│
├── 学习笔记/              ← 【v3 新增】每天 1-2h 学习产出
│   ├── 2026-06-09-深海圈AI编程.md
│   └── ...
│
├── tests/                 ← 自检 + 单元测试
└── .goal-state/           ← Goal Coding 状态存档
```

## v3.1 砍掉清单（**不要做**）

- ❌ platforms/kuaishou.ts（已删）
- ❌ platforms/douyin.ts（已删）
- ❌ platforms/shipinhao.ts（已删）
- ❌ 跨平台对比逻辑
- ❌ 平台推荐优先级
- ❌ v2 旧 M5/M6/M10（跨平台方法）
- ❌ 工具直接提供账号获取渠道（用户在闲鱼自行购买）
- ❌ 工具中转/存储/代理用户 API Key
- ❌ 假数据/刷量数据未标记直接出报告
- ❌ CDP 失败时反复重试（必须立即降级）

## v3 新增清单（**必须做**）

- ✅ platforms/source-1688.ts / source-pdd.ts / source-taobao.ts
- ✅ lib/methods/（5 个 AI 算法文件）
- ✅ lib/safety/（4 个极致安全模块）
- ✅ api/source/（货源反查 API）
- ✅ 学习笔记/（每天 1-2h 学习产出强制写入）

## 极致安全 4 层级（v3 灵魂）

| 层级 | 实现 | 文件 |
|---|---|---|
| **账号层** | Cookie 加密 + 风控检测 + 不共用账号 | `lib/safety/account.ts` |
| **IP 层** | 请求频率自适应（≤人类操作）+ 代理池支持 | `lib/safety/network.ts` |
| **数据层** | 假数据过滤 + 数据源标注 + 校验逻辑 | `lib/safety/data-integrity.ts` |
| **降级层** | CDP 失败立即降级手动模式，不反复重试 | `lib/safety/fallback.ts` |

## 黑五类处理（v3 升级）

- ❌ **不推广**（沿用 v1）
- ❌ **不提供货源搜索**（v3 新增）
- ❌ **不引导引流方式**（v3 新增）
- ✅ 只警告 + 拦截

## 核心模块

### 1. 平台抽象层（lib/platforms/）—— v3 收敛

- **types.ts**：Platform 接口定义（必含：platformId/displayName/scrape/platformBlacklist/platformNotes/fallbackToGeneric）
- **xhs.ts**：小红书搜索页 → CDP抓取笔记列表+互动数据+商品链接（**v3 极致优化**）
- **source-1688.ts**：1688 货源搜索 → CDP抓取同款/相似款+售价+起订量
- **source-pdd.ts**：拼多多货源搜索 → CDP抓取
- **source-taobao.ts**：淘宝货源搜索 → CDP抓取
- **generic.ts**：通用兜底（任何平台可接入，**降级方案**）

### 2. AI 分析（lib/analyzer.ts）
- 调用 DeepSeek API（OpenAI 兼容）
- 按 9 品类 × **小红书专用** prompt（v3 收敛）
- 输出结构化 JSON：4 板块报告（市场概况/爆款潜力/选品建议/货源推荐）

### 3. AI 算法筛选货源（lib/methods/）—— v3 新增

- **source-matcher.ts**：从 11 篇选品手册方法论匹配货源平台
- **profit-calculator.ts**：利润空间算法（售价 - 成本 - 物流 - 平台费）
- **reliability-scorer.ts**：商家可信度评分（销量 + 评价 + 经营时长 + AI 风险）
- **fake-data-detector.ts**：假数据/刷量检测（24h 突然爆 10x → 标记"疑似刷量"）

### 4. 极致安全（lib/safety/）—— v3 灵魂

- **account.ts**：Cookie 加密 + 自动风控检测
- **network.ts**：请求频率自适应（≤人类操作）+ 代理池支持
- **data-integrity.ts**：假数据过滤 + 数据源标注
- **fallback.ts**：CDP 失败 → 手动粘贴模式

### 5. 黑五类拦截（lib/blacklist.ts）
- 关键词库覆盖：药品/医疗器械/增高/壮阳/蓝帽子/医美/风水占卜
- **v3 升级**：不推广 + 不提供货源 + 不引导引流方式

### 6. 品类体系（lib/categories.ts）
- 9 大一级品类定义
- 每个品类关联不同的 AI 分析维度和评估权重

### 7. 跟踪模块（lib/tracker/）—— v3 收敛为小红书单平台
- **store.ts**：SQLite 本地存储
- **scheduler.ts**：定时刷新调度
- **lifecycle.ts**：生命周期判断（上升期/爆发期/稳定期/衰退期）

## 开发约束

```yaml
必须:
  - "所有代码必须有 TypeScript 类型定义"
  - "CDP抓取失败时必须有降级方案（手动粘贴）"
  - "AI分析结果必须是结构化JSON，不是自由文本"
  - "黑五类关键词检测必须在用户输入时即时触发"
  - "本地存储使用SQLite，不用localStorage（数据量大）"
  - "platforms/ 目录下所有平台实现统一 Platform 接口"
  - "极致安全 4 层级全部实现（账号/IP/数据/降级）"
  - "学习产出：每天 1-2h 学习必须写到 学习笔记/ 目录"
  - "数据源标注：每个数据字段必须有来源（笔记 ID / 商家 ID / 采集时间）"
  - "降级优先：CDP 失败时立即降级为手动粘贴，不反复重试"

禁止:
  - "不调用任何需要用户付费的API"
  - "不在代码中硬编码API Key（用环境变量）"
  - "不做服务端存储（MVP阶段纯本地）"
  - "不做用户注册/登录系统（MVP不需要）"
  - "不做移动端适配（先桌面端 Mac+Win）"
  - "不引入付费SaaS依赖"
  - "不抓取抖音/快手/视频号作为选品目标（v3 砍掉）"
  - "不向外部服务器上报用户数据（极致安全约束）"
  - "不返回假数据/刷量数据未标记的选品报告"
  - "不中转/不存储/不代理用户的 API Key"
```

## 环境变量

```bash
# .env.local（不提交到git）
DEEPSEEK_API_KEY=*** DeepSeek API Key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

## 测试命令

```bash
pnpm dev              # Next.js 开发模式
pnpm build            # Next.js 构建
pnpm tauri dev        # Tauri桌面APP开发模式
pnpm tauri build      # 打包桌面APP（.dmg/.exe）
npx tsc --noEmit      # TypeScript类型检查（必须0错误）
```

## API 设计

### POST /api/analyze（小红书选品）

```typescript
// 请求
{
  keyword: string;          // 用户输入的关键词
  category: Category;       // 9大品类之一
}

// 响应
{
  report: {
    market: MarketOverview;
    viralPotential: ViralPotential;
    suggestion: PickSuggestion;
    sourceRecommendation: SourceRecommend[];  // 【v3 新增】货源推荐
  };
  isBlacklisted: boolean;
  blacklistWarning?: BlacklistWarning;
}
```

### POST /api/source（货源反查）—— v3 新增

```typescript
// 请求
{
  productName: string;       // 小红书选中的候选品
  productUrl: string;        // 小红书笔记 URL（用于反查同款）
  targetSources: SourceId[]; // ['1688', 'pdd', 'taobao']
}

// 响应
{
  sources: SourceResult[];   // 货源列表（含售价/起订量/利润）
  profit: ProfitAnalysis;    // 利润空间分析
  reliability: ReliabilityScore[]; // 商家可信度评分
  fakeDataWarnings: string[]; // 假数据警告
}
```

## 关键参考文件

- `GOAL-DECLARATION.md`：验收标准（v3 现行，10 条 must_pass + 极致安全 4 层级）
- `GOAL-DECLARATION.v1.bak`：v1 备份（已完成 8/8）
- `GOAL-DECLARATION.v2.bak`：v2 备份（已废）
- `PROGRESS-v3.md`：v3 进度（现状快照）
- `方法论学习笔记.md`：选品方法论文档（v3 重构为小红书专用）
- `学习笔记/`：每天 1-2h 学习产出（v3 新增）

## v3.1 真实工时估算

- 总工时：**99-126 小时**（v3 60-80h + v3.1 新增 35-40h + M17 4-6h）
- 按 4h/天：25-32 个工作日（**6 周**）
- 时间分配：70% 开发 + 30% 学习

## v3.1 决策溯源（6/9 那哥拍板，claude code 不要质疑）

| 决策 | 那哥拍板 | 小米立场 | 备注 |
|---|---|---|---|
| v3 → v3.1 升级 | ✅ | 同意 | 11 篇手册对齐+飞书文章注入 |
| M15 第三方工具登录 = 闲鱼共享账号 | ✅ | **3 次明确反对** | 工具必须弹风险警告，用户勾选"已知风险"才能继续 |
| M15 工具集成 = Tauri webview + CDP 9223 | ✅ | 同意 | 不用系统 Chrome |
| M17 登录流程 = 首次启动引导 + 强制至少 1 个 | ✅ | 同意 | 备选 B（懒登录）+ C（混合）被否 |
| M16 多模态 = 智谱 GLM-4V 首选 | ✅ | 同意 | DeepSeek-VL2 备选/MiniMax 不推荐 |
| M13 飞书文章 3 大核心并入 | ✅ | 同意 | 品类区分+封面二阶段+卖点重组 4 步 SOP |

## v3 风险与缓解

| 风险 | 概率 | 缓解 |
|---|---|---|
| 1688/拼多多/淘宝反爬升级 | 高 | 极致安全 4 层级 + 手动降级 |
| DeepSeek API key 未配真（v1 遗留） | 中 | Day 1 优先配 |
| 11 篇手册路径需确认 | 低 | 那哥原话已确认 |
| 极致安全 4 层级工作量大 | 中 | 优先级排序：账号>IP>数据>降级 |
