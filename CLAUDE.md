# CLAUDE.md — 全平台AI选品工具 MVP v2

> 本文件供 Claude Code 读取，定义项目架构、约束和开发规范。

## 项目概述

**项目名称**：XHS Picker（小红书AI选品工具）
**项目类型**：桌面端 SaaS 工具（Tauri 2）
**目标**：MVP v2，48小时交付全平台AI选品桌面APP

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
├── CLAUDE.md              ← 本文件
├── GOAL-DECLARATION.md    ← 目标声明（验收标准）
├── 方法论学习笔记.md       ← 选品方法论提炼
├── src-tauri/             ← Tauri Rust 壳
├── src/                   ← Next.js 前端+后端
│   ├── app/               ← 页面
│   │   ├── page.tsx       ← 主界面
│   │   └── tracker/       ← 跟踪模块
│   ├── components/        ← UI组件
│   ├── lib/               ← 核心逻辑
│   │   ├── platforms/     ← 平台抽象层（v2核心）
│   │   │   ├── types.ts    ← Platform 接口定义
│   │   │   ├── xhs.ts      ← 小红书抓取器
│   │   │   ├── kuaishou.ts ← 快手抓取器
│   │   │   ├── douyin.ts   ← 抖音抓取器
│   │   │   ├── shipinhao.ts← 视频号抓取器
│   │   │   └── generic.ts  ← 通用兜底
│   │   ├── analyzer.ts     ← AI分析引擎
│   │   ├── blacklist.ts    ← 黑五类拦截
│   │   ├── categories.ts   ← 9大品类
│   │   └── tracker/       ← 跟踪模块
│   └── api/               ← API路由
│       └── analyze/       ← 选品分析API
├── public/                ← 静态资源
└── package.json
```

## 核心模块

### 1. 平台抽象层（lib/platforms/）
- **types.ts**：Platform 接口定义（必含：platformId/displayName/scrape/platformBlacklist/platformNotes/fallbackToGeneric）
- **xhs.ts**：小红书搜索页 → CDP抓取笔记列表+互动数据+商品链接
- **kuaishou.ts**：快手搜索 → CDP抓取视频数据+互动量
- **douyin.ts**：抖音搜索 → CDP抓取视频数据+互动量
- **shipinhao.ts**：视频号 → generic接口封装
- **generic.ts**：通用兜底 → CDP读取用户登录后的任意平台DOM

### 2. AI分析（lib/analyzer.ts）
- 调用 DeepSeek API（OpenAI 兼容）
- 按9品类 × 5平台双维度差异化prompt
- 输出结构化JSON：6板块报告（市场概况/蓝海对比/爆款潜力/选品建议/平台优先级/行动建议）

### 3. 黑五类拦截（lib/blacklist.ts）
- 关键词库覆盖：药品/医疗器械/增高/壮阳/蓝帽子/医美/风水占卜
- 按平台分别定义拦截规则（小红书最严/抖音其次/快手相对宽松/视频号依赖微信生态）
- 输入检测 → 红色警告弹窗 → 说明各平台禁推原因

### 4. 品类体系（lib/categories.ts）
- 9大一级品类定义
- 每个品类关联不同的AI分析维度和评估权重

### 5. 跟踪模块（lib/tracker/）
- **store.ts**：SQLite本地存储，跟踪列表+跨平台数据快照
- **scheduler.ts**：定时刷新调度
- **comparator.ts**：跨平台数据对比计算
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
  
禁止:
  - "不调用任何需要用户付费的API"
  - "不在代码中硬编码API Key（用环境变量）"
  - "不做服务端存储（MVP阶段纯本地）"
  - "不做用户注册/登录系统（MVP不需要）"
  - "不做移动端适配（先桌面端 Mac+Win）"
  - "不引入付费SaaS依赖"
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

## API设计

### POST /api/analyze
```typescript
// 请求
{
  keyword: string;          // 用户输入的关键词
  category: Category;       // 9大品类之一
  platforms: PlatformId[];  // 目标平台列表 ['xhs', 'douyin', ...]
}

// 响应
{
  report: {
    market: MarketOverview;      // 市场概况
    blueOceanCompare: PlatformBlueOcean[];  // 全平台蓝海对比
    viralPotential: PlatformViral[];  // 各平台爆款潜力
    suggestion: PickSuggestion;  // 选品建议
    platformPriority: PlatformRecommend[];  // 平台推荐优先级
    actions: ActionItem[];       // 行动建议
  };
  isBlacklisted: boolean;        // 是否黑五类
  blacklistWarning?: PlatformBlacklistWarning[];  // 按平台的警告
}
```

## 关键参考文件

- `GOAL-DECLARATION.md`：验收标准和约束（8条must_pass）
- `方法论学习笔记.md`：选品方法论文档