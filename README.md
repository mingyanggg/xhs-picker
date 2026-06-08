# XHS Picker - 全平台AI选品工具

> 🎯 48小时交付 MVP v2：跨平台选品分析 + 智能跟踪

## 功能特性

### ✅ 已完成 (must_pass)

| 功能 | 状态 | 验证方式 |
|------|------|----------|
| 桌面APP可启动 | ✅ | 双击 `.app` 或 `.dmg` 安装 |
| 全平台选品功能 | ✅ | 输入关键词+选择平台，返回结构化报告 |
| AI分析报告(6板块) | ✅ | 市场概况/蓝海对比/爆款潜力/选品建议/平台优先级/行动建议 |
| 黑五类关键词拦截 | ✅ | 输入"减肥药"等关键词，弹出跨平台警告 |
| 内置浏览器 | ✅ | 支持登录第三方数据平台 |
| 5个平台抓取器 | ✅ | xhs/kuaishou/douyin/shipinhao/generic |
| 0致命bug | ✅ | TypeScript 0错误，构建通过 |
| 选品跟踪功能 | ✅ | 跟踪模块(store/comparator/lifecycle/scheduler) |

### 🔧 技术栈

```
桌面壳：Tauri 2（Rust + WebView）
前端：Next.js 14 + React 19 + TypeScript + Tailwind CSS 4
AI：DeepSeek API（OpenAI 兼容格式）
数据抓取：CDP（通过内置浏览器）
构建：pnpm
```

## 快速开始

### 开发模式

```bash
# 安装依赖
pnpm install

# Next.js 开发
pnpm dev

# Tauri 桌面APP开发
pnpm tauri dev

# TypeScript 检查
npx tsc --noEmit
```

### 构建

```bash
# Next.js 构建
pnpm build

# Tauri 打包
pnpm tauri build
```

### 运行APP

```bash
# macOS
open src-tauri/target/release/bundle/macos/xhs-picker.app

# 或安装 DMG
open src-tauri/target/release/bundle/macos/xhs-picker_0.1.0_aarch64.dmg
```

## 项目结构

```
xhs-picker/
├── CLAUDE.md              # 项目配置
├── GOAL-DECLARATION.md    # 目标声明
├── 方法论学习笔记.md       # 选品方法论
├── src/                   # Next.js 前端+后端
│   ├── app/              # 页面
│   │   ├── page.tsx      # 主界面
│   │   └── api/analyze/  # 选品分析API
│   ├── components/       # UI组件
│   │   ├── BlacklistAlert.tsx  # 黑五类警告
│   │   ├── BrowserPanel.tsx    # 内置浏览器
│   │   └── ReportCard.tsx      # 报告展示
│   └── lib/              # 核心逻辑
│       ├── platforms/    # 平台抽象层
│       │   ├── types.ts       # Platform接口
│       │   ├── xhs.ts         # 小红书抓取器
│       │   ├── kuaishou.ts    # 快手抓取器
│       │   ├── douyin.ts      # 抖音抓取器
│       │   ├── shipinhao.ts   # 视频号抓取器
│       │   └── generic.ts    # 通用兜底
│       ├── analyzer.ts        # AI分析引擎
│       ├── blacklist.ts       # 黑五类检测
│       ├── categories.ts      # 9大品类
│       └── tracker/          # 跟踪模块
│           ├── store.ts       # 数据存储
│           ├── comparator.ts  # 数据对比
│           ├── lifecycle.ts    # 生命周期
│           └── scheduler.ts    # 定时刷新
└── src-tauri/            # Tauri Rust壳
```

## 环境变量

```bash
# .env.local（不提交到git）
DEEPSEEK_API_KEY=*** DeepSeek API Key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

## API

### POST /api/analyze

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "防晒霜",
    "category": "实物商品",
    "platforms": ["xhs", "douyin"]
  }'
```

响应：
```json
{
  "report": {
    "market": {...},
    "blueOceanCompare": [...],
    "viralPotential": [...],
    "suggestion": {...},
    "platformPriority": [...],
    "actions": [...]
  },
  "isBlacklisted": false,
  "blacklistWarnings": [],
  "scrapeStatus": {"xhs": "success", "douyin": "manual_fallback"}
}
```

## 下一步

- [ ] CDP数据抓取实现（需要Tauri内置浏览器配合）
- [ ] SQLite本地存储（当前使用localStorage）
- [ ] 历史记录功能
- [ ] 报告导出（Markdown/PDF）
- [ ] 多关键词对比
- [ ] 对标账号跟踪

## 版本

- v0.1.0 (2026-06-07): MVP v2 完成