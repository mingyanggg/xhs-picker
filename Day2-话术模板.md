# Day 2 · Claude Code 启动话术（v4.0）

> 那哥 6/10 拍板 · 同步建设 M15-M17 质量门 + 加 UI mockup 对齐任务
> 用法：复制下方「第一段」+「第二段」按顺序发到 Claude Code

---

## 第一段 · 让 Claude Code 读宪法（先发）

```
今天开始 v4.0 Day2 工作。先做一件事：完整读完 /Users/michael/AI项目/xhs-picker/CLAUDE.md（v4.0 已同步），理解：
1. v4.0 14 条 must_pass（M1-M14）+ 3 条开发质量门（M15 评分系统 / M16 Debug / M17 100分迭代SOP）
2. 4 个必跑 self-check 的触发时机（完成 must_pass 后 / commit 前 / 22:00 cron / 遇到第 2 次同一错误）
3. 禁止项 18 条 + 工作流嵌入表
读完回复："CLAUDE.md 已读 v4.0 · M1-M17 全在 · 4 个触发时机记下"。
不要开始开发。
```

---

## 第二段 · Day2 任务清单（确认读完后再发）

```
OK，开始 Day2 · 4 小时任务。按 CLAUDE.md 的"标准回复模板"，每完成一项跑 bash scripts/self-check.sh 贴 M15 自检分数（必须按这个顺序做）。

【任务1 ·15min · 阻塞 · v4.0 基础设施验证】
- 确认 scripts/pre-commit.sh + scripts/self-check.sh + STUCK.md + 精修清单.md + v4.0-mockup.html 都在
- 跑一次 self-check.sh 看当前真实分数（昨天结果 50/100）
- 不要 commit，只贴分数

【任务2 ·15min · Playwright 安装 · M1 前置】
- pnpm add -D playwright @playwright/test
- pnpm exec playwright install chromium
- 完成后跑 self-check.sh 贴分数

【任务3 ·1h · M1 核心 · Playwright launcher.ts】
- 建 src-tauri/src/playwright/launcher.ts：
  · launch(): 启 chromium + 注入 stealth.js 占位（M4 后续补）
  · newContext(storageState): 加载 ~/.xhs-picker/storage_state.json（如不存在用 null）
  · close(): 清理
- 要求：TypeScript 严格 · 0 any · JSDoc 全
- 测试：能 npx tsx src-tauri/src/playwright/launcher.ts 启动 chromium · 不报错
- 完成后跑 self-check.sh 贴分数

【任务4 ·15min · M1 配套 · context.ts】
- 建 src-tauri/src/playwright/context.ts：
  · context 池管理（newContext 复用）
  · 健康检查（crashed 检测 + 重启）
- 完成后跑 self-check.sh 贴分数

【任务5 ·1.5h · 核心 UI 开发 · 对齐 mockup】  ← 那哥 6/10 加
- 浏览器打开 file:///Users/michael/AI项目/xhs-picker/v4.0-mockup.html 看设计基线
- 在 src/app/page.tsx 实现：
  · 左 sidebar 240px（导航：选品/货源/商家/跟踪/手册/设置）
  · 中列表 360px（搜索结果列表）
  · 右详情 flex（4 板块报告：市场概况/爆款潜力/选品建议/货源推荐）
  · ⌘K 调出命令面板（CommandPalette 组件）
- 暖色 token：bg #FAF8F4 / sidebar #F2EDE4 / text #2C2620 / accent #D97706 / border #E8D9C0
- 字体：Inter + PingFang SC + JetBrains Mono
- 圆角：8px（卡片）/ 4px（按钮）/ 12px（弹窗）
- UI 维度目标：15/15（从昨天 5/15 提升）
- 完成后跑 self-check.sh 贴分数

【任务6 ·30min · 学习 · MediaCrawler 必读 3 篇】
- github.com/NanmiCoder/MediaCrawler README
- base/base_crawler.py（看 storage_state 怎么用）
- media_platform/xhs/core.py（看签名怎么注入）
- 写 学习笔记/2026-06-10-Day2-MediaCrawler.md（≥500 字 + 引用源码）
- 完成后跑 self-check.sh 贴分数

【任务7 ·30min · 自检收尾】
- 再跑 self-check.sh · 目标 ≥80 分
- 如果 <80：标 3 个最低维度 · 当日补完 · 不要进 Day3
- git commit -m "Day2 · M1 Playwright + UI mockup 对齐 + 学习笔记 · self-check=X/100"
- 把 commit hash 贴出来

铁律（那哥 6/10 拍板）：
- 不跑 self-check = 我立即 /clear
- 跑完不贴分数 = 我立即说"贴分"
- 分数 <80 编造 ≥80 = 立即回滚
- 同一错误第 2 次出现 = 立即升级 L3 + 写 STUCK.md + 暂停等拍板

开始任务1。
```

---

## 时间分配

| 任务 | 时长 | 占比 | 累计 |
|---|---|---|---|
| 1 基础设施验证 | 15min | 6% | 15min |
| 2 Playwright 安装 | 15min | 6% | 30min |
| 3 M1 launcher.ts | 60min | 25% | 90min |
| 4 context.ts | 15min | 6% | 105min |
| **5 UI mockup 对齐** | **90min** | **38%** | **195min** |
| 6 MediaCrawler 学习 | 30min | 13% | 225min |
| 7 自检收尾 | 15min | 6% | 240min |
| **总计** | **240min** | **100%** | **4h** |

UI mockup 是今日最大头（38%）—— v4.0 的"新界面"最直观体现。

---

## 那哥使用步骤

1. 打开 VSCode · 终端 `cd /Users/michael/AI项目/xhs-picker`
2. 启动 Claude Code（如果是 VSCode 扩展则直接打开对话）
3. 复制「第一段」发出去 · 等回"已读"
4. 复制「第二段」发出去
5. 每完成一项任务，Claude Code 会自动贴 M15 分数
6. 你只回 "继续" 或 "补 STUCK"（不主动提醒跑 self-check）
7. 分数 <80 当日补完 · 不进 Day3