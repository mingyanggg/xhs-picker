# 选品工具 v4.0 · 现状快照（2026-06-09）

> 用途：让 09:00 任务清单 cron 有依据
> 最后更新：2026-06-09 23:00（v4.0 路线最终拍板）
> 当前 owner：那哥

---

## 一句话现状

**v3.1 已废（17 条） / v4.0 启动（14 条 · 7.5h 决策完成）**。新路线：MediaCrawler 风格 Playwright + JS 注入签名 + storage_state 持久化 + stealth.js 反检测 + MCP Server + 暖色杂志风 UI（Linear/Raycast/TablePlus/Things 3 借鉴）。

---

## v1 / v2 / v3.1（历史归档）

| 版本 | 状态 | 备份 |
|---|---|---|
| v1 | ✅ 8 条 must_pass 全过 | `GOAL-DECLARATION.v1.bak` 23KB |
| v2 | ❌ 全平台 5 抓取器 0% 启动 | `GOAL-DECLARATION.v2.bak` 28KB |
| v3 | ❌ 10 条已被 v3.1 覆盖 | `PROGRESS-v3.md`（归档） |
| **v3.1** | ❌ **17 条已被 v4.0 覆盖** | `GOAL-DECLARATION.v3.1.bak` **31KB** |
| **v4.0** | 📝 **14 条 must_pass · 0 启动** | `GOAL-DECLARATION.md`（现行 18KB） |

---

## v4.0 核心方向（不要再问"做不做"）

**参考开源**（GitHub 真实数据）：
- **MediaCrawler**（NanmiCoder）· 50.9k ⭐ · Python + Playwright + JS 注入签名
- **XHS-Downloader**（JoeanAmier）· 11.5k ⭐ · Python + FastAPI + **mcp-server** + PyInstaller
- **moneymaker**（saqierma-cyber）· 2 ⭐ · **Tauri 2 + React 19**（同栈参考）
- **openclaw-xhs** · MCP 路线

**核心改变**：
| 维度 | v3.1 | v4.0 | 参考 |
|---|---|---|---|
| 抓取 | 自写 CDP + 逆签名 | **Playwright + JS 注入签名** | MediaCrawler |
| 架构 | Web UI 为主 | **MCP Server + Web UI** | XHS-Downloader |
| 反检测 | 频率自适应 | **stealth.js + 随机化** | MediaCrawler |
| 登录态 | Cookie 加密 SQLite | **Playwright storage_state JSON** | MediaCrawler |
| 栈 | TS + Tauri | **TS + Tauri 2 + React 19** | moneymaker |
| UI | 自定 | **Linear/Raycast/TablePlus/Things 3 借鉴** | 5 个国外软件 |

---

## v4.0 must_pass（14 条 · 收敛版）

**P0 阻塞（5 条 · 无这些工具不能用）**：
- **M1** Playwright 内核集成（替代 v3.1 的 CDP）
- **M2** JS 注入签名框架（x-s / X-Bogus 等）
- **M3** storage_state 持久化（替代 v3.1 加密 Cookie）
- **M4** stealth.js 反检测注入
- **M5** MCP Server（核心 · XHS-Downloader 路线）

**P1 核心（5 条 · 这些做完=工具可用）**：
- **M6** 多平台统一爬虫（小红书/1688/淘宝/拼多多）
- **M7** 货源反查（1688 优先 + 淘宝 + pdd）
- **M8** 极简 AI 选品分析（DeepSeek 单点 · 9 品类 × 4 板块）
- **M9** 商家可信度评分（双轨）
- **M10** 选品方法论注入（11 篇手册 + 飞书文章）

**P2 增强（4 条）**：
- **M11** Tauri 2 + React 19 桌面端
- **M12** 数据可视化报告（4 板块）
- **M13** 风险警告弹窗（M15 闲鱼方案必加）
- **M14** 国内国外统一架构

---

## v4.0 砍掉清单（不要做）

- ❌ 自己逆签名（x-s / X-Bogus）
- ❌ 频率自适应（v3.1 safety/network.ts）
- ❌ Cookie 加密 SQLite（v3.1 safety/account.ts）
- ❌ 跨平台对比逻辑
- ❌ 6 个第三方数据工具的闲鱼共享账号（降级 nice-to-have）
- ❌ 11 篇手册的对齐报告 + C 图（嵌入 prompt 即可）
- ❌ 渐进式登录（M17）
- ❌ M16 多模态（GLM-4V，P2 后期）
- ❌ 黑五类的"不引导引流方式"

---

## v4.0 工时与周期

| 模块 | 工时 |
|---|---|
| M1 Playwright | 4-6h |
| M2 JS 注入签名 | 6-8h |
| M3 storage_state | 3-4h |
| M4 stealth.js | 2-3h |
| M5 MCP Server | 4-6h |
| M6 多平台爬虫 | 8-12h |
| M7 货源反查 | 3-4h |
| M8 AI 选品 | 3-4h |
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

## 决策溯源（6/9 那哥拍板 · 全部成立）

| # | 决策 | 拍板 | 小米立场 |
|---|---|---|---|
| 1 | v3.1 → v4.0 大改 | ✅ | 强烈同意 |
| 2 | MediaCrawler 思路（Playwright + JS 注入） | ✅ | 强烈推荐 |
| 3 | XHS-Downloader MCP Server | ✅ | 同意 |
| 4 | stealth.js 反检测 | ✅ | 同意 |
| 5 | storage_state JSON 持久化 | ✅ | 同意 |
| 6 | 砍 M15 闲鱼方案（降级 nice-to-have） | ✅ | 强烈同意 |
| 7 | 砍 M16 多模态（P2 后期） | ✅ | 同意 |
| 8 | 砍 M17 强制登录 | ✅ | 同意 |
| 9 | Linear/Raycast/TablePlus/Things 3 UI 借鉴 | ✅ | 同意 |
| 10 | **v4.0-mockup.html 设计基线** | ✅ | **那哥 6/9 23:00 拍板 OK** |
| 11 | 加 M15 评分系统（自检 0-100·7 维度） | ✅ | 强烈同意（Day1 复盘暴露"无质量门"） |
| 12 | 加 M16 Debug 机制（L1/L2/L3 卡点分级） | ✅ | 强烈同意（STUCK 不再硬扛） |
| 13 | 加 M17 迭代到 100 分 SOP（80→100 闭环） | ✅ | 强烈同意（周末精修机制） |

---

## Day 2 任务清单（v4.0 版 · 推翻 v3.1）

### 🔧 阻塞 P0-1 · 开发质量门建设（30min · M15+M16+M17）
```
1. 建 scripts/pre-commit.sh（L1 自检）
2. 建 scripts/self-check.sh（M15 完整评分）
3. 建 STUCK.md（L3 求助模板）
4. 建 精修清单.md（M17 周末用）
5. git add scripts/ + commit "Day2 · M15-M17 质量门基础设施"
```

### 阻塞任务（30min）：dev server 修好
```
1. dev server 状态（已确认：3000 端口在跑 · node 25629）
2. 浏览器硬刷新（Cmd+Shift+R）
3. 如果还空白 → 查 .next/trace 找错误
4. 反馈给那哥
```

### 核心任务（1.5h · M1 Playwright 集成）
```
1. pnpm add -D playwright @playwright/test
2. pnpm exec playwright install chromium
3. src-tauri/src/playwright/launcher.ts
   - launch(): 启动 chromium with stealth
   - newContext(storageState): 加载上次登录态
   - close(): 清理
4. 测试：能启动浏览器 + 打开 xhs.com
```

### 学习任务（30min）
```
必读：
1. github.com/NanmiCoder/MediaCrawler README
2. base/base_crawler.py 看 storage_state 怎么用
3. media_platform/xhs/core.py 看签名怎么注入

学习笔记：学习笔记/2026-06-09-Day2-MediaCrawler.md
```

### 自检（30min）
```
1. npx tsc --noEmit → 0 错误
2. pnpm dev → 3000 端口持续监听
3. 浏览器刷新 → 看到新界面
4. Git commit Day 2
5. **跑 scripts/self-check.sh → M15 评分 ≥80 才算 Day2 通过**
```

---

## v4.0 已交付物（6/9 23:00 · 全部就位）

| 文件 | 大小 | 状态 |
|---|---|---|
| `GOAL-DECLARATION.md` | 18KB | ✅ v4.0 现行（含 UI 章节） |
| `GOAL-DECLARATION.v3.1.bak` | 31KB | ✅ 备份 |
| `PROGRESS-v4.md` | 5KB | ✅ 本文件 |
| `UI调研报告.md` | 7.5KB | ✅ 5 个国外软件调研 |
| `v4.0-mockup.html` | **26.8KB** | ✅ **那哥拍板 OK** |
| `CLAUDE.md` | 12KB | ⚠️ 待同步到 v4.0（明天 09:00 cron 触发时） |
| `DAY2-任务清单.md` | 7KB | ✅ v4.0 版 |
| `.hook-需求.md` | 1.5KB | ✅ 待启动 |
| `scripts/day1-status.sh` | 3.3KB | ✅ L1 hook |

---

## 关键时间节点

| 时间 | 任务 |
|---|---|
| 2026-06-09 23:00 | v4.0 立项完成 · 6/9 决策全部拍板 |
| 2026-06-10 09:00 | 第一份 v4.0 任务清单（基于 v4.0 现状） |
| Day 1-2 | Playwright 集成 + stealth.js + storage_state |
| Day 3-5 | M5 MCP Server + M2 JS 注入签名 |
| Week 2 | M6 多平台爬虫 + M7 货源反查 |
| Week 3 | M8 AI 选品 + M9 商家评分 + M10 方法论注入 |
| Week 4 | M11 Tauri 桌面 + M12 数据可视化 |
| Week 5 | M13 风险弹窗 + M14 国内外统一 |
| Week 6 | v1 回归 + 7 步自检 + 那哥验收 |

---

## Day 1 复盘（2026-06-09 22:00-23:30 · v4.0 决策日）

> 注：今日非开发日，是 v4.0 路线大改的「决策日」。4 小时实际花在拍板 10 个决策 + 写 6 个文件 + 5 个 UI 调研上。代码层只补了 1 个 commit（API Key 配真），其余全在文档层。

### 4 小时任务清单（实际打勾）

- [x] **战略决策** 拍板 v3.1 → v4.0 大改（推倒 17 条 must_pass，砍 30% 工时）
- [x] **技术路线** 决策 5 项：MediaCrawler / XHS-Downloader MCP / stealth.js / storage_state / 暖色杂志风 UI
- [x] **GOAL 文档** 写 v4.0 GOAL-DECLARATION.md（18KB · 14 条 must_pass）+ 备份 v3.1.bak（31KB）
- [x] **UI 调研** Linear / Raycast / TablePlus / Things 3 / PopClip 5 个软件 → 写 UI调研报告.md（7.5KB）
- [x] **Mockup** v4.0-mockup.html（26.8KB · 那哥 23:00 拍板 OK 作为设计基线）
- [x] **现状快照** PROGRESS-v4.md（5KB · v3.1 备份归档）
- [x] **任务清单** DAY2-任务清单.md（7KB · v4.0 版 · 推翻 v3.1 版）
- [x] **代码** DEEPSEEK_API_KEY 配真（commit `51ed766`）
- [x] **学习笔记** 2026-06-09-Day1.md（v3.1 架构 · 已成历史归档）

### 时间分配

| 维度 | 时长 | 占比 |
|---|---|---|
| 战略决策（拍板） | 1.0h | 25% |
| 文档产出（GOAL/UI/Mockup/PROGRESS） | 2.0h | 50% |
| 代码（API Key 配真） | 0.3h | 7% |
| 学习（5 个 UI 软件调研） | 0.5h | 13% |
| 其他（沟通/确认） | 0.2h | 5% |

### 关键卡点 + 解决思路

- **STUCK 1 · v3.1 刚立完就推翻** — 早上刚写完 v3.1 GOAL（17 条），晚上又拍 v4.0 大改。**解决思路**：决策时尊重那哥判断（v3.1 真的太重），但**新铁律已记下**——「立 GOAL 前必须先扫 GitHub 同栈项目」,本次代价是 1 个完整下午返工。
- **STUCK 2 · UI 设计基线拍板** — 5 个国外软件到底借鉴哪些？**解决思路**：借鉴清单先收敛（Linear 三栏+Raycast ⌘K+TablePlus 表格+Things 3 卡片），输出 v4.0-mockup.html 直接可看，那哥 23:00 拍 OK。
- **卡点 3 · v3.1 → v4.0 文档级联** — CLAUDE.md 还没同步到 v4.0 状态。**解决思路**：明天 09:00 cron 触发时同步,不阻塞今日。

### 关键收获

1. **决策成本比想象高** — 4 小时产出 6 个文件但只 0.3h 代码。说明「GOAL 立项」阶段文档量 ≥ 代码量,这是真坑。
2. **同栈参考 = 加速器** — 找到 saqierma-cyber/moneymaker（Tauri 2 + React 19）让 v4.0 技术选型直接收敛,省了至少 1 天调研。
3. **决策溯源机制好用** — 10 个拍板都留了「那哥拍板 / 小米立场」,未来回查无歧义。

### 明日 3 个最高价值任务（Day 2 · 2026-06-10）

1. **🎯 阻塞 P0 · dev server 验证（30min）** — 那哥浏览器刷新看到 v4.0-mockup 设计基线（非空白）。先做,否则后续都是空谈。
2. **🎯 核心 · M1 Playwright 集成（1.5h）** — launcher.ts（launch/newContext/close）+ stealth.js 注入 + storage_state 持久化 = v4.0 地基三件套。
3. **🎯 学习 · MediaCrawler 必读 3 篇（30min）** — README + base_crawler.py + xhs/core.py,学习笔记写到 `学习笔记/2026-06-10-Day2-MediaCrawler.md`。

### 完成判定（今晚）

- [x] v4.0 GOAL 立项（10 个拍板决策）
- [x] 14 条 must_pass 写定
- [x] 6 个文件就位
- [x] v4.0-mockup.html 那哥 OK
- [x] DAY2 任务清单生成
- [x] PROGRESS 现状快照

**当前状态**：🟢 v4.0 立项完成 · 6/9 决策全部拍板 · 14 条 must_pass 待启动
**明日 Day 2 重点**：M1 Playwright + stealth + storage_state = v4.0 地基
**下次更新**：明天 09:00 cron（v4.0 Day 2 任务清单 + 那哥浏览器验证）

## 自检 · 2026-06-10 07:55 · 35分
- TypeScript: 0/15 · 核心功能: 10/20 · dev server: 10/10 · UI mockup: 5/15
- must_pass: 5/20 (完成 4/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 35 · 等级: 🔴不及格

## 自检 · 2026-06-10 07:55 · 50分
- TypeScript: 15/15 · 核心功能: 10/20 · dev server: 10/10 · UI mockup: 5/15
- must_pass: 5/20 (完成 4/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 50 · 等级: 🔴不及格

## 自检 · 2026-06-10 08:20 · 50分
- TypeScript: 15/15 · 核心功能: 10/20 · dev server: 10/10 · UI mockup: 5/15
- must_pass: 5/20 (完成 4/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 50 · 等级: 🔴不及格

## 自检 · 2026-06-10 08:21 · 50分
- TypeScript: 15/15 · 核心功能: 10/20 · dev server: 10/10 · UI mockup: 5/15
- must_pass: 5/20 (完成 4/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 50 · 等级: 🔴不及格

## 自检 · 2026-06-10 08:23 · 62分
- TypeScript: 15/15 · 核心功能: 20/20 · dev server: 10/10 · UI mockup: 5/15
- must_pass: 7/20 (完成 5/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 62 · 等级: 🟠及格

## 自检 · 2026-06-10 08:24 · 62分
- TypeScript: 15/15 · 核心功能: 20/20 · dev server: 10/10 · UI mockup: 5/15
- must_pass: 7/20 (完成 5/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 62 · 等级: 🟠及格

## 自检 · 2026-06-10 08:27 · 72分
- TypeScript: 15/15 · 核心功能: 20/20 · dev server: 10/10 · UI mockup: 15/15
- must_pass: 7/20 (完成 5/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 72 · 等级: 🟠及格

## 自检 · 2026-06-10 08:28 · 72分
- TypeScript: 15/15 · 核心功能: 20/20 · dev server: 10/10 · UI mockup: 15/15
- must_pass: 7/20 (完成 5/14) · 学习笔记: 0/10 · Git 规范: 5/10
- 总分: 72 · 等级: 🟠及格
