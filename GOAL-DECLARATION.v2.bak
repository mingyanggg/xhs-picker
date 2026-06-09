# Goal Declaration — 全平台AI选品工具 MVP v2

> 🎯 Goal Coding, not Vibe Coding.
> 那哥只写一次 goal，AI 跑完叫那哥验收。
> v2 升级：从单平台(小红书) → 全平台(小红书+快手+抖音+视频号+其它)
> v2 升级：从"工程交付清单" → "**产品形态 + 方法论注入 + AI 自检迭代**"三位一体

---

## 1. goal（一句话终点）

**做一个给"一人公司 / 小微企业创业者"用的本地化 AI 选品工具**：
- 用户输入关键词 + 选择品类 + 选择目标平台
- 工具自动跨平台抓数据，按 10 个脱敏方法（v2.0 + v2.1）输出可执行的下一步
- 自带浏览器窗口支持用户登录第三方数据平台增强数据
- 提供选品跟踪 + 漏斗池 + 1-3-7 数据周期 + 跨平台对比
- **产品灵魂**：把 11 篇选品方法论的 100+ 操盘手经验，**结构化成可执行的产品功能**（不是写在 prompt 里的一句话）

**v2 相对 v1 的 4 个关键升级**：

| 维度 | v1 | v2 |
|---|---|---|
| 产品灵魂 | "AI 给报告" | **"10 个脱敏方法 + AI 反向评估"** |
| 跟踪业务 | 单平台数据 | **日更选品池 + 1-3-7 数据周期 + 相似款跟踪** |
| AI 角色 | 出报告 | **出候选 + 主动反向评估 + 留 1 个给用户拍板** |
| 协作方式 | code 写完人工验 | **AI 自检 7 步 + 失败自动迭代 + 阻塞通知** |

---

## 2. acceptance（验收标准）

### 2.1 must_pass（v1 8 条，保留全部）

```yaml
must_pass:
  - name: "桌面APP可启动"
    verify: "双击 .dmg/.exe 安装后能打开，看到工具主界面"

  - name: "全平台选品功能可用"
    verify: "输入品类关键词（如'防晒霜'），选择品类 + 选择目标平台(可多选小红书/快手/抖音/视频号/其它)，工具自动跨平台抓取数据并返回结构化选品分析"

  - name: "AI分析报告完整(含跨平台维度+具体选品数据)"
    verify: |
      报告必须包含 6 大板块，每个板块的数据字段必须满足：
      1. 市场概况(market)：每平台 totalContentCount + avgEngagement + searchIndex
      2. 全平台蓝海对比(blueOceanCompare)：每平台含 blueOceanScore(1-10) + supplyDemandRatio + competitionLevel
      3. 各平台爆款潜力(viralPotential)：每平台含 viralScore(1-10) + lowFollowerViralCount(>=0) + topAccounts(>=3) + viralFeatures
      4. 选品建议(suggestion)：brands >=3 + subCategories >=3 + priceRanges >=3 + commissionRanges >=3 + recommendScore + direction + targetAudience + cautions + expectedReturn
      5. 平台推荐优先级(platformPriority)：1-5 排序 + reason + suitableFeatures + expectedEffect
      6. 行动建议(actions)：>=3 条，每条 order+action+steps(>=3)+expectedResult+priority

  - name: "黑五类关键词拦截(跨平台)"
    verify: "输入黑五类关键词（减肥药/壮阳/丰胸/医疗器械/增高药/医美/蓝帽子/风水占卜）时，工具弹出⚠️红色警告，按平台分别说明禁推/限流原因"

  - name: "内置浏览器可登录第三方"
    verify: "工具内有浏览器窗口，用户可登录千瓜/灰豚/蝉妈妈/快手小店/抖音电商/视频号助手等任意第三方平台，登录后工具能通过CDP协议读取页面数据增强选品分析"

  - name: "4个专用抓取器 + 1个通用兜底"
    verify: "scraper/platforms/ 目录下至少包含 xhs.ts + kuaishou.ts + douyin.ts + shipinhao.ts + generic.ts 五个模块，每个模块能独立运行(降级方案:CDP失败时可用手动粘贴模式)"

  - name: "无致命bug"
    verify: "连续操作 5 次全平台选品分析(每次跨2+平台)，0次崩溃/白屏"

  - name: "选品跟踪功能可用(跨平台)"
    verify: "选品报告可一键加入跟踪列表，工具能记录该品在每个目标平台的初始数据快照，并在下次刷新时显示各平台数据变化趋势 + 跨平台对比曲线"
```

### 2.2 v2 新增 must_pass（10 条，**方法论注入 + AI 灵魂**）

```yaml
v2_must_pass:
  # ──── 第一组：核心流程方法（小红书端到端）────
  - id: M1
    name: "6 步选品法可执行入口"
    method_source: "生财 11 篇选品手册 · 02 通用底层逻辑"
    verify: |
      主界面提供 6 Tab 流程：找对标 → 拆节点 → 匹配能力 → 1:1 模仿 → 做最佳 → 超越
      - 找对标 Tab：输品类 → 出 20 个对标账号（按平台分别）
      - 拆节点 Tab：选 1 个对标 → 拆 SKU/价格带/视频模板
      - 匹配能力 Tab：问 7-10 题（钱/时间/供应链/可拍视频/可出镜/可承接流量）→ 输出"你能做的品"白名单
      - 1:1 模仿 Tab：上品日历 + 模仿素材库
      - 做最佳 Tab：跨平台对比 + 单平台趋势
      - 超越 Tab：差异化切入点建议
    必须通过：6 Tab 全部能跑通（小红书优先）

  - id: M2
    name: "蓝海三要素检验"
    method_source: "生财 11 篇 · 02 通用底层逻辑 · 刘小排蓝海三部曲"
    verify: |
      任何品/账号出报告前，必须经过三要素检验：
      - 稳定流量 ✓（直播间不温不火、每天 2000 访客等）
      - 产品很差 ✓（"差"是相对用户能力，不是绝对差）
      - 稳定变现 ✓（每天 100 单、CPS 每天净利润 300+ 等）
      工具出 3 个勾选框，AI 给"判定理由 + 证据来源"

  - id: M3
    name: "小众需求挖掘"
    method_source: "生财 11 篇 · 02/08/09 · 古辛小众需求"
    verify: |
      提供 3 个反向输入维度：
      - 地域维度：输入 1 个小地域 → 输出当地特色品
      - 职业维度：输入 1 个小职业（参考 1838 个职业）→ 输出该职业相关品
      - 文化维度：输入 1 个小众文化/爱好 → 输出周边品
      每个维度至少输出 5 个候选品

  - id: M4
    name: "低门槛对标筛选"
    method_source: "生财 11 篇 · 04 小红书选品 · @书豪低粉爆款法"
    verify: |
      过滤条件可调（3 个阈值）：
      - 粉丝数阈值：默认 200，可选 200/500/1000/2000
      - 互动阈值：默认 7 天 100 赞
      - 销量阈值：默认 100
      输品类 → 出符合 3 阈值的小红书对标账号列表（按销量排序）
      注：阈值必须可调，因为小红书/抖音/快手门槛不同

  - id: M5
    name: "日更选品池"
    method_source: "生财 11 篇 · 04 小红书选品 · @袁漏斗池"
    verify: |
      跟踪模块的核心业务规则：
      - 每天 3+ 新品入库
      - 每个品分配 3 条笔记（ABC 测试）
      - 出单的品 → 自动盯相似款（反查其他平台同款）
      - 上品日历 UI（早 8/9:30/11:30/14/16/18/20/21/22 共 9 时点提醒）
      注：这是"v1 跟踪模块"必须升级的核心规则

  - id: M6
    name: "垂直店铺 4 步"
    method_source: "生财 11 篇 · 08 淘宝选品 · @刘小排烤红薯理论"
    verify: |
      给开店用户提供 4 步流程工具：
      - 找体系：输品类 → 输出 3-5 个体系候选（按蓝海指数排序）
      - 做火炉：选 1 体系 → 选引流款 → 计算"做到第一需要多少销量"
      - 烤红薯：自动铺同体系高度相关品（小几十个）
      - 做利润品：选 1 个红薯 → 自动拍全网独一无二头图方案 + 加价建议

  - id: M7
    name: "AI 反向评估（灵魂功能）"
    method_source: "那哥独家 + 11 篇方法论通用"
    verify: |
      AI 角色 = 主动找缺陷，不是给建议：
      - AI 出 3 个候选品
      - AI 主动砍掉 1 个（说明理由 + 引用 11 篇原文）
      - 用户手动砍掉 1 个（AI 给候选理由 vs 砍掉理由对比表）
      - 留 1 个（AI 给"这个品可能踩的 5 个坑"清单）
      输出格式：3 候选 → 1 AI 砍 → 1 用户砍 → 1 入选 + 风险清单
      注：这是 11 篇里没有的独家方法，必须第一个做

  # ──── 第二组：数据/规则层（v2.1，并行不阻塞）────
  - id: M8
    name: "1-3-7 数据周期"
    method_source: "生财 11 篇 · 05 视频号选品 · 137 法则"
    verify: |
      每个跟踪品显示 1/3/7 天数据看板：
      - 1 天：曝光/点击/加购
      - 3 天：首次转化/初步判断
      - 7 天：数据稳定期决策点（7 天 0 销自动标红 + 建议放弃）
      跨平台时每个平台独立 1/3/7 看板

  - id: M9
    name: "供需比值筛选"
    method_source: "生财 11 篇 · 04 小红书选品 · 笔记数/互动量比值法"
    verify: |
      自动计算：比值 = 互动总量 / 笔记数
      - 比值越小 = 越蓝海
      - 输品类 → 出比值排序列表（小红书/抖音/快手各 1 份）
      - 比值 < 0.01 自动标红"超蓝海"

  - id: M10
    name: "抖音 11 入口"
    method_source: "生财 11 篇 · 03 抖音选品"
    verify: |
      11 个独立 fetcher 按钮：
      1. 蝉妈妈带货视频榜 2. 抖查查达人榜 3. 抖音商品综合排序
      4. 巨量算数关键词趋势 5. 热门视频（3 天最多赞）6. 精选联盟商品
      7. 精选联盟店铺 8. 蝉妈妈类目选品 9. 抖小鸭/抖小宝
      10. pdd 潜力榜 11. 抖音"求购"搜索
      每个 fetcher 独立可用，11 个全跑通 = 通过

  # ──── v3 暂不做，仅预留接口 ────
  # M11 商业模型打分（@Junday 投资模型）— v3
  # M12 LTV 飞轮（耗材 + 搭卖 + 软件增值）— v3
  # M13 7 步品评估（亚马逊 30%/卖家<30/listing<100）— v3
  # M14 B2B 选品边界（多功能 ≠ 多买家）— v3
```

---

## 3. budget（预算边界）

**那哥原话：不要考虑交付时间**——改为"**目标全列，让 code 跑，调试 + 不断 fine tune**"。

```yaml
budget:
  max_hours: null            # 不设硬截止
  max_steps: null            # 不设步骤上限
  max_iterations: 10         # 每个 must_pass 最多自动迭代 10 次
  stop_conditions:
    - "所有 must_pass + v2_must_pass 通过 → 完成，通知那哥验收"
    - "连续 5 轮无进展 → 暂停 + Telegram 通知那哥"
    - "同一 must_pass 连续 10 次失败 → 暂停 + 等那哥调整"
    - "触及外部付费API(超过免费额度) → 暂停 + 等那哥确认"
```

---

## 4. deliverables（交付物）

```
~/AI项目/xhs-picker/
├── README.md                  # 项目说明 + 构建命令
├── CLAUDE.md                  # Claude Code 项目配置
├── 方法论学习笔记.md           # 选品方法论提炼（已完成 v1）
├── GOAL-DECLARATION.md        # 本文件（v2）
├── GOAL-DECLARATION.v1.bak    # v1 备份
│
├── src-tauri/                 # Tauri 2 桌面端壳
│   ├── src/main.rs            # Rust 主入口
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                       # 前端 + 后端
│   ├── app/
│   │   ├── page.tsx           # 主界面（6 Tab 流程 + 关键词 + 平台多选 + 报告）
│   │   ├── tracker/           # 跟踪模块
│   │   │   ├── page.tsx       # 跨平台跟踪列表（日更选品池）
│   │   │   └── [id]/page.tsx  # 单品跟踪详情（1-3-7 数据周期 + 跨平台对比）
│   │   └── components/
│   │       ├── SixStepTabs.tsx     # 【v2 新增】6 步选品法 Tab
│   │       ├── BlueOceanCheck.tsx  # 【v2 新增】蓝海三要素检验
│   │       ├── NicheFinder.tsx     # 【v2 新增】小众需求挖掘
│   │       ├── LowBarrierFilter.tsx# 【v2 新增】低门槛对标筛选
│   │       ├── DailyPool.tsx       # 【v2 新增】日更选品池
│   │       ├── VerticalShop.tsx   # 【v2 新增】垂直店铺 4 步
│   │       ├── AIReview.tsx        # 【v2 新增】AI 反向评估（灵魂）
│   │       ├── PeriodBoard.tsx     # 【v2 新增】1-3-7 数据周期
│   │       ├── RatioFilter.tsx     # 【v2 新增】供需比值筛选
│   │       ├── Douyin11Entry.tsx   # 【v2 新增】抖音 11 入口
│   │       ├── BlacklistAlert.tsx  # 黑五类跨平台警告
│   │       ├── BrowserPanel.tsx    # 内置浏览器窗口
│   │       ├── ReportCard.tsx      # 选品报告展示(6板块)
│   │       └── PlatformCompare.tsx # 跨平台蓝海对比表
│   │
│   ├── lib/
│   │   ├── platforms/             # 平台层（v2 核心）
│   │   │   ├── types.ts           # Platform 接口定义
│   │   │   ├── xhs.ts             # 小红书专用抓取器
│   │   │   ├── kuaishou.ts        # 快手专用抓取器
│   │   │   ├── douyin.ts          # 抖音专用抓取器
│   │   │   ├── shipinhao.ts       # 视频号专用抓取器
│   │   │   └── generic.ts         # 通用兜底
│   │   ├── methods/               # 【v2 新增】10 个脱敏方法库
│   │   │   ├── six-step.ts        # M1 6 步选品法
│   │   │   ├── blue-ocean.ts      # M2 蓝海三要素
│   │   │   ├── niche-finder.ts    # M3 小众需求
│   │   │   ├── low-barrier.ts     # M4 低门槛对标
│   │   │   ├── daily-pool.ts      # M5 日更选品池
│   │   │   ├── vertical-shop.ts   # M6 垂直店铺 4 步
│   │   │   ├── ai-review.ts       # M7 AI 反向评估
│   │   │   ├── period-board.ts    # M8 1-3-7 数据周期
│   │   │   ├── ratio-filter.ts    # M9 供需比值
│   │   │   ├── douyin11.ts        # M10 抖音 11 入口
│   │   │   └── index.ts           # 统一导出
│   │   ├── analyzer.ts            # AI 选品分析
│   │   ├── blacklist.ts           # 黑五类关键词库
│   │   ├── categories.ts          # 9 大品类定义
│   │   ├── tracker/               # 跟踪模块
│   │   │   ├── store.ts           # 本地存储
│   │   │   ├── scheduler.ts       # 定时刷新
│   │   │   ├── comparator.ts      # 跨平台对比
│   │   │   └── lifecycle.ts       # 生命周期判断
│   │   └── types.ts
│   │
│   └── api/
│       └── analyze/               # 选品分析 API
│
├── tests/                        # 【v2 新增】AI 自动测试
│   ├── self-check.sh             # 7 步自检脚本
│   ├── test-methods/             # 10 个方法的单元测试
│   └── fixtures/                 # 测试数据
│
├── scripts/                      # 【v2 新增】开发工具脚本
│   ├── reinstall.sh              # 一键重装 .app
│   ├── verify-methods.sh         # 方法库自动验证
│   └── debug-tui.sh              # 调试 TUI 命令
│
└── .goal-state/                  # 【v2 新增】Goal Coding 状态存档
    ├── current.md                # 当前进度
    ├── failures.log              # 失败日志
    └── iterations/               # 每次迭代的代码快照
```

**v2 相对 v1 的目录变化**：
- 新增 `lib/methods/` 目录（10 个脱敏方法库）
- 新增 10 个 v2 组件（6 Tab + AI 反向评估 + 1-3-7 + 供需比值 + 抖音 11 入口）
- 新增 `tests/`（AI 自检 + 单元测试）
- 新增 `scripts/`（开发工具）
- 新增 `.goal-state/`（Goal Coding 状态存档）

---

## 5. constraints（约束条件）

```yaml
constraints:
  must:
    - "技术栈：Tauri 2 + Next.js + TypeScript + Tailwind CSS"
    - "内置浏览器用 Tauri webview + CDP 协议"
    - "AI 调用：开发期 DeepSeek；运行时支持用户自带 API Key（智谱/MiniMax/DeepSeek 任选）"
    - "免费数据抓取：CDP 方案（每平台独立抓取器 + 1 个 generic 兜底）"
    - "付费数据抓取：用户自带账号 + 工具内置浏览器登录后 CDP 读取"
    - "所有代码在 Claude Code 中开发"
    - "platforms/ 目录：所有平台实现统一 Platform 接口"
    - "**v2 新增**：methods/ 目录：10 个脱敏方法全部用 TypeScript 实现，**每个方法独立可调用**"
    - "**v2 新增**：方法库必须可独立测试（unit test）"
    - "**v2 新增**：AI 反向评估（M7）必须能引用 11 篇方法论原文做依据"
  must_not:
    - "不引入付费 SaaS 依赖"
    - "不存储用户隐私数据"
    - "不碰黑五类产品推广（只警告）"
    - "不假设每个平台都一定能抓到数据（必须有降级方案）"
    - "不中转/不存储/不代理用户的 API Key"
    - "**v2 新增**：方法/UI 命名不出现生财有术圈友网名（脱敏）"
    - "**v2 新增**：方法库实现不直接 copy 11 篇原文（用 TypeScript 结构化表达）"
    - "**v2 新增**：must_pass v1 的 8 条不删（向后兼容）"
```

---

## 6. context（上下文）

```yaml
context:
  # 方法论基础（v2 重大升级）
  - "**v2 核心**：生财有术 11 篇选品手册已完整录入，路径 ~/Documents/Obsidian Vault/iCloud/_Base/AI变现/知识库/选品手册/"
  - "11 篇：00-写在前面 + 01-选品基础概述 + 02-选品通用底层逻辑 + 03-抖音选品 + 04-小红书选品 + 05-视频号选品 + 06-快团团选品 + 07-TikTok选品 + 08-淘宝选品 + 09-闲鱼选品 + 10-亚马逊选品 + 11-其他选品方法"
  - "v2 提取的 10 个脱敏方法映射在 methods/ 目录"
  - "v3 预提取的 4 个高级方法（商业模型/LTV/亚马逊 7 步/B2B 边界）暂不实现"
  - "Storybound 案例：67 天做出付费 SaaS，Tauri 桌面客户端，先自用再卖"

  # 品类体系
  - "9 大一级品类：实物商品/功能性半标品/虚拟产品/知识付费/大牌平替/新奇特/周期性/男性蓝海/高客单蓝海"

  # 黑五类拦截
  - "传统黑五类：药品/医疗器械/丰胸/减肥/增高"
  - "扩展黑五类（小红书 2026 新规）：蓝帽子保健食品/特殊配方奶粉/医美全类目/医疗器械全类目/壮阳/私处美容/风水占卜"
  - "按平台分别定义（小红书最严/抖音其次/快手相对宽松/视频号依赖微信生态审核）"

  # 全平台抽象
  - "5 个平台：xhs / kuaishou / douyin / shipinhao / generic"
  - "Platform interface 必含：platformId / displayName / searchUrl / scrape / platformBlacklist / platformNotes / fallbackToGeneric"

  # 平台特征
  - "小红书：30+ 女性为主，种草+测评+大牌平替强，知识付费高"
  - "快手：下沉市场+三农+日用百货爆款率高，老铁经济"
  - "抖音：算法+直播间+短视频，新奇特+冲动消费品"
  - "视频号：微信生态，中老年+高客单，无公开搜索 API 必须 generic 接入"
  - "其它(B站/知乎/微博)：长内容/垂类知识，走 generic 接入"

  # 数据源
  - "免费源（自动）：每平台搜索页(CDP) + 通用第三方数据源(CDP)"
  - "付费源（用户登录）：千瓜(小红书)/灰豚(快手)/蝉妈妈(抖音)/视频号助手/其他(generic读取)"

  # v2 灵魂
  - "**v2 核心产品哲学**：工具 = 操盘手知识的可执行入口"
  - "**v2 独家方法**：AI 反向评估（M7）是 11 篇没有的，必须第一个做"
  - "**v2 协作方式**：Goal Coding + AI 自检 + 失败自动迭代（详见 section 7）"

  # 技术基础
  - "DeepSeek API Key：~/AI项目/xhs-picker/.env.local（开发用，OpenAI 兼容格式）"
  - "已有 CDP 方案：Chrome 9223 端口"
  - "参考案例：Storybound 用 Tauri 2 + React 19 + TypeScript + Rust"
```

---

## 7. AI 自检 + 迭代机制（v2 灵魂，**那哥原话"不断 fine tune"**）

那哥原话："**这项任务是 AI 生成的，我们可能需要进行调试**"——v2 必须内置**AI 自检 + 失败自动迭代**机制。

### 7.1 7 步自检流程（每个 must_pass 跑完后必须走）

```yaml
self_check:
  step_1_syntax:
    name: "TypeScript 语法检查"
    command: "npx tsc --noEmit"
    pass: "0 errors"
    fail_action: "自动修复 import / 类型错误，最多重试 3 次"

  step_2_build:
    name: "Next.js 构建检查"
    command: "pnpm build --no-lint"
    pass: "Build success"
    fail_action: "自动修复 build error，最多重试 3 次"

  step_3_unit_test:
    name: "方法库单元测试"
    command: "pnpm test src/lib/methods/"
    pass: "All tests passed"
    fail_action: "回滚到上一个通过版本 + 通知那哥"

  step_4_runtime:
    name: "运行时验证（启动 app + 走 1 次主流程）"
    command: "scripts/runtime-check.sh"
    pass: "0 崩溃 / 0 白屏 / 主流程跑通"
    fail_action: "捕获 stack trace + 自动重试 2 次 + 失败通知那哥"

  step_5_method_invoke:
    name: "方法库独立调用验证"
    command: "每个 method 函数独立调用一次，输出符合 method spec"
    pass: "10 个方法全部能独立输出"
    fail_action: "逐个方法 debug + 修复"

  step_6_ai_review:
    name: "AI 反向评估专项验证（M7）"
    command: "输入 1 个测试品 → AI 必须输出 3 候选 + AI 砍 1 + 用户砍 1 + 入选 1 + 风险清单"
    pass: "5 段输出全部完整 + 引用 11 篇原文"
    fail_action: "检查 prompt 模板 + 重新调优"

  step_7_e2e:
    name: "端到端流程验证（5 次全平台选品）"
    command: "连续 5 次跨 2+ 平台选品分析，0 崩溃"
    pass: "5/5 成功"
    fail_action: "捕获错误堆栈 + 逐次重试 + 失败通知那哥"
```

### 7.2 失败自动迭代规则

```yaml
iteration:
  max_iterations: 10          # 每个 must_pass 最多 10 次自动迭代
  log_path: ".goal-state/iterations/<must_pass_id>_<n>.log"
  failure_pattern_detection:
    - "同一错误连续 3 次 → 暂停 + 通知那哥"
    - "不同错误连续 5 次 → 暂停 + 通知那哥"
    - "tsc 报 > 10 个新错误 → 暂停 + 通知那哥"
  success_pattern:
    - "连续 3 次 7 步全过 → must_pass 标记 PASS"
    - "记录 PASS 时间戳到 .goal-state/current.md"
```

### 7.3 升级机制（v1 7 条 + v2 新增 4 条）

```yaml
escalation:
  # v1 保留
  - trigger: "小红书/快手/抖音数据抓取被封/需要验证码"
    action: "暂停 + Telegram 截图通知那哥"
  - trigger: "视频号抓取无公开 API"
    action: "确认走 generic 兜底(用户登录+CDP读取)"
  - trigger: "Tauri 编译环境搭建失败"
    action: "降级为 Electron + 通知那哥"
  - trigger: "任意平台反爬检测导致数据无法读取"
    action: "降级为手动粘贴模式 + 记录反爬策略"
  - trigger: "触及任何外部付费操作"
    action: "暂停 + 等那哥确认"
  - trigger: "DeepSeek API 限速 429"
    action: "自动降级 glm-4.7-flash，如果也限速则暂停"
  - trigger: "48 小时截止时仅完成部分平台抓取"
    action: "已完成平台全功能交付，未完成平台走 generic 兜底"

  # v2 新增
  - trigger: "方法库 10 个方法中 1 个连续 10 次自检失败"
    action: "标记该方法为 STUCK + 跳过 + 其他方法继续 + 通知那哥"
  - trigger: "AI 反向评估（M7）3 次输出都不引用 11 篇原文"
    action: "检查 prompt 模板 + 暂停 + 通知那哥手动调整"
  - trigger: "Tauri webview 加载小红书 5 次失败"
    action: "切换到 generic 兜底 + 通知那哥"
  - trigger: "v1 8 条 must_pass 中 1 条回归失败"
    action: "立即修复（v2 不能破坏 v1）+ 通知那哥"
```

---

## 8. checkpoints（中间检查点）

```yaml
checkpoints:
  - id: C0
    after: "v2 GOAL 写入 + 备份 v1 + 通知那哥"
    notify: "✅ Checkpoint 0: v2 GOAL 已就位"

  - id: C1
    after: "methods/ 目录骨架完成（10 个方法文件 + index.ts）"
    notify: "✅ Checkpoint 1: 10 个脱敏方法骨架就位"

  - id: C2
    after: "M1 6 步选品法 端到端跑通（小红书）"
    notify: "✅ Checkpoint 2: M1 6 步选品法可用"

  - id: C3
    after: "M7 AI 反向评估 端到端跑通"
    notify: "✅ Checkpoint 3: M7 AI 反向评估可用（灵魂功能）"

  - id: C4
    after: "M1-M7 全部跑通（小红书端到端）"
    notify: "✅ Checkpoint 4: 第一组 7 个方法全通"

  - id: C5
    after: "M8-M10 全部跑通（v2.1 第二组）"
    notify: "✅ Checkpoint 5: v2.0 全部 10 个方法可用"

  - id: C6
    after: "7 步自检全过 + E2E 5/5 成功"
    notify: "✅ Checkpoint 6: 自检全过 + 等那哥验收"

  - id: C7
    after: "那哥验收通过"
    notify: "🎉 v2.0 交付完成 + 启动 v3 计划（M11-M14）"
```

---

## 9. v2 升级变更摘要

| 维度 | v1 | v2 |
|---|---|---|
| 产品灵魂 | 工程交付清单 | **10 个脱敏方法 + AI 反向评估** |
| must_pass | 8 条 | **8 + 10 = 18 条**（v1 8 条 + v2 10 条） |
| 新增目录 | — | `lib/methods/` + `tests/` + `scripts/` + `.goal-state/` |
| 协作方式 | code 写完人工验 | **AI 7 步自检 + 失败自动迭代** |
| 升级场景 | 7 个 | **11 个**（新增 4 个 v2 触发） |
| 检查点 | 4 个 | **8 个**（C0-C7） |
| 交付时间 | 48 小时硬截止 | **不设硬截止**（那哥原话） |
| 方法论来源 | 二手《方法论学习笔记》 | **11 篇原手册**（生财有术 8 月航海） |
| AI 角色 | 出报告 | **出候选 + 主动反向评估 + 用户拍板** |
| 跟踪业务 | 跨平台数据 | **日更选品池 + 1-3-7 数据周期 + 相似款跟踪** |

---

## 10. v2 风险提示

| 风险 | 概率 | 缓解策略 |
|---|---|---|
| 11 篇方法论的"去 IP 化重命名"不彻底 | 中 | v2 自检 step_5 强制 grep **`src/` 和 `components/` 下的代码**（盗坤/刘小排/古辛/袁/书豪/叶子/佳佳/Junday/小马丁/七叔/小焦 等），代码里出现 1 个就 fail。**GOAL 文档的 `method_source` 字段允许保留网名做内部溯源**（这是给 code 看的来源标注，不是产品对外命名）|
| AI 反向评估引用 11 篇原文失败 | 高 | prompt 模板内置 11 篇原文摘要 + 自检 step_6 强制验证引用 |
| Tauri webview 加载小红书不稳定 | 高 | 降级为 generic 兜底 + 通知那哥 |
| 10 个方法库实现工作量超预期 | 中 | **不设硬截止** + 失败自动迭代 + 阻塞通知 |
| v1 8 条 must_pass 回归失败 | 低 | 自检 step_1 强制跑 v1 验收脚本 |

---

## 11. 质量自检清单

- [x] **goal**：10 个脱敏方法 + 4 平台 CDP + AI 反向评估
- [x] **acceptance**：v1 8 条 must_pass 全部保留 + v2 10 条新方法可验证
- [x] **budget**：不设硬截止 + max_iterations 10 + stop_conditions 4 个
- [x] **deliverables**：Tauri 2 + methods/ 库 + tests/ + scripts/ + .goal-state/
- [x] **constraints**：v1 全部保留 + v2 新增 3 条（脱敏/不复制原文/不破坏 v1）
- [x] **context**：11 篇原手册路径 + 10 个方法来源标注 + 平台特征
- [x] **escalation**：7 个 v1 升级 + 4 个 v2 新增升级
- [x] **AI 自检**：7 步自检 + 失败自动迭代 + 阻塞通知
- [x] **checkpoints**：8 个（C0-C7）
- [x] **v2 边界纪律**：本工具是选品工具 + 方法论注入工具，不混入 B2B 交付能力
- [x] **v2 边界纪律**：不混入客户接触脚本（那是工具完成之后的事）
- [x] **v2 反 AI 痕迹**：所有目标可量化（10 个方法 / 7 步自检 / 11 升级 / 8 checkpoints）
- [x] **v2 协作方式**：Goal Coding + AI 自检 + 不断 fine tune（那哥原话）

---

## 12. 执行步骤预览（v2，**不设步骤上限**）

v2 不再是固定 20 步——改为"**目标驱动**"：每个 must_pass 跑通 7 步自检才算完成。code 可以自由调整步骤数。

```
Step 0:  v1 备份 + v2 GOAL 写入 + .goal-state/ 初始化
Step 1:  methods/ 目录骨架（10 个方法文件 + index.ts）
Step 2:  M1 6 步选品法 端到端（小红书优先）
Step 3:  M2-M6 顺序跑通（5 个方法）
Step 4:  M7 AI 反向评估 端到端（灵魂功能）
Step 5:  M8-M10 v2.1 第二组
Step 6:  v1 8 条 must_pass 回归测试（不能破坏）
Step 7:  7 步自检全过 + E2E 5/5 成功
Step 8:  通知那哥验收
```

---

**v2 灵魂一句话**：**把 11 篇选品方法论的 100+ 操盘手经验，结构化成可执行的产品功能，让没读过 11 篇的人也能用上"操盘手级"的方法。**

---

> **给 code 的最后一句话**：**你不用急着跑通，先把 7 步自检搭起来（tests/self-check.sh + .goal-state/ 状态机），再开始动代码。每完成 1 个 must_pass 走 1 轮 7 步自检，失败自动迭代，10 次还失败就停下来通知那哥。那哥不设硬截止，要的是"不断 fine tune 出来的优秀产品"，不是"48 小时赶出来的半成品"。**
