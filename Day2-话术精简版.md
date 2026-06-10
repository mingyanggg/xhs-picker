# Day 2 · Claude Code 启动话术（精简版）

> 那哥 6/10 拍板 · 直接复制粘贴用
> 文件位置：/Users/michael/AI项目/xhs-picker/Day2-话术精简版.md

---

## 第一段（先发）

```
今天开始 v4.0 Day2 工作。先完整读完 /Users/michael/AI项目/xhs-picker/CLAUDE.md（v4.0 已同步），理解：14 条 must_pass（M1-M14）+ 3 条开发质量门（M15 评分 / M16 Debug / M17 100分迭代）+ 4 个必跑 self-check 触发时机（完成 must_pass 后 / commit 前 / 22:00 cron / 第 2 次同一错误）+ 18 条禁止项。

读完回复："CLAUDE.md 已读 v4.0 · M1-M17 全在"。不要开始开发。
```

---

## 第二段（回"已读"后再发）

```
OK，开始 Day2。按顺序做，每完成一项跑 bash scripts/self-check.sh 贴 M15 自检分数。

【任务1 · 基础设施验证】
确认 scripts/pre-commit.sh + scripts/self-check.sh + STUCK.md + 精修清单.md + v4.0-mockup.html 都在。跑 self-check.sh 看真实分（昨天 50/100）。不要 commit，只贴分。

【任务2 · Playwright 安装】
pnpm add -D playwright @playwright/test && pnpm exec playwright install chromium。完成后跑 self-check.sh 贴分。

【任务3 · M1 核心 · launcher.ts】
建 src-tauri/src/playwright/launcher.ts：
- launch(): 启 chromium + 注入 stealth.js 占位
- newContext(storageState): 加载 ~/.xhs-picker/storage_state.json（无则 null）
- close(): 清理
要求：TS 严格 · 0 any · JSDoc 全。测：npx tsx 启动 chromium 不报错。完成后跑 self-check.sh 贴分。

【任务4 · context.ts】
src-tauri/src/playwright/context.ts：context 池管理 + 健康检查。完成后跑 self-check.sh 贴分。

【任务5 · 核心 UI · 对齐 mockup】 ⭐ 今日最大头
先浏览器打开 file:///Users/michael/AI项目/xhs-picker/v4.0-mockup.html 看设计基线。然后在 src/app/page.tsx 实现：
- 左 sidebar 240px（导航：选品/货源/商家/跟踪/手册/设置）
- 中列表 360px（搜索结果）
- 右详情 flex（4 板块报告：市场概况/爆款潜力/选品建议/货源推荐）
- ⌘K 调出命令面板
- 暖色 token：bg #FAF8F4 / sidebar #F2EDE4 / text #2C2620 / accent #D97706 / border #E8D9C0
- 字体：Inter + PingFang SC + JetBrains Mono
- 圆角：8px 卡 / 4px 按钮 / 12px 弹窗
UI 维度目标：15/15（昨天 5/15）。完成后跑 self-check.sh 贴分。

【任务6 · 学习】
读 MediaCrawler README + base_crawler.py（storage_state 怎么用）+ xhs/core.py（签名怎么注入）。写 学习笔记/2026-06-10-Day2-MediaCrawler.md（≥500 字 + 引用源码）。完成后跑 self-check.sh 贴分。

【任务7 · 收尾】
再跑 self-check.sh · 目标 ≥80 分。<80 标 3 个最低维度当日补完。git commit -m "Day2 · M1 Playwright + UI mockup 对齐 + 学习笔记 · self-check=X/100"。把 commit hash 贴出来。

铁律（那哥 6/10 拍板）：不跑 self-check = /clear · 跑完不贴分 = 我说"贴分" · <80 编造 ≥80 = 立即回滚 · 同一错误第 2 次 = 立即写 STUCK.md + 暂停等拍板。

开始任务 1。
```

---

## 使用步骤

1. `cd /Users/michael/AI项目/xhs-picker`
2. 启动 Claude Code
3. 复制「第一段」发出 · 等回"已读"
4. 复制「第二段」发出
5. 每完成一项任务 Claude Code 会自动贴 M15 分数
6. 只回"继续"或"补 STUCK"（不主动提醒跑 self-check）
7. 分数 <80 当日补完 · 不进 Day3