# Goal Declaration — 全平台AI选品工具 MVP v2

> 🎯 Goal Coding, not Vibe Coding.
> 那哥只写一次 goal，AI 跑完叫那哥验收。
> v2 升级：从单平台(小红书) → 全平台(小红书+快手+抖音+视频号+其它)

---

## 1. goal（一句话终点）

**2天内交付一个桌面端全平台AI选品工具 MVP v2**：用户输入关键词+选择品类+选择目标平台(可多选)，工具自动跨平台聚合数据，AI对比分析后输出结构化选品报告(全平台蓝海对比+各平台爆款潜力+平台推荐优先级+行动建议)，自带浏览器窗口支持用户登录各平台及第三方数据平台增强数据。同时提供跨平台选品跟踪功能：已选品的持续多平台数据监控、对标账号的跨平台跟踪对比、选品漏斗池管理、品生命周期状态追踪。

**v2 相对 v1 的关键升级**：
- 测试范围：小红书单平台 → 小红书/快手/抖音/视频号 + 其它（4+通用）
- 报告维度：单平台分析 → **跨平台对比分析**
- 平台抽象层：把"平台"作为一等公民，每个平台独立抓取器+独立prompt
- generic 升级：作为视频号/其它平台的兜底接入通道

---

## 2. acceptance（验收标准）

### must_pass（必须通过，少一条不算完成）

```yaml
must_pass:
  - name: "桌面APP可启动"
    verify: "双击 .dmg/.exe 安装后能打开，看到工具主界面"

  - name: "全平台选品功能可用"
    verify: "输入品类关键词（如'防晒霜'），选择品类 + 选择目标平台(可多选小红书/快手/抖音/视频号/其它)，工具自动跨平台抓取数据并返回结构化选品分析"

  - name: "AI分析报告完整(含跨平台维度+具体选品数据)"
    verify: |
      报告必须包含 6 大板块，每个板块的数据字段必须满足：
      1. 市场概况(market)：每平台 totalContentCount + avgEngagement + searchIndex 三个数字字段全有
      2. 全平台蓝海对比(blueOceanCompare)：每平台含 blueOceanScore(1-10) + supplyDemandRatio + competitionLevel
      3. 各平台爆款潜力(viralPotential)：每平台含 viralScore(1-10) + lowFollowerViralCount(>=0) + topAccounts(>=3 个含 name/followers) + viralFeatures
      4. 选品建议(suggestion)：必须包含 4 个新字段——
         - brands: >=3 个具体品牌名（如"雅诗兰黛/花西子/完美日记"）
         - subCategories: >=3 个二级品类细分（如"防晒霜/精华液/口红"）
         - priceRanges: >=3 档价格区间（每档含 min/max 数字 + 描述）
         - commissionRanges: >=3 档佣金比例（每档含 min/max 百分比 + 适用场景）
         + 原有的 recommendScore + direction + targetAudience + cautions + expectedReturn
      5. 平台推荐优先级(platformPriority)：1-5 排序 + reason + suitableFeatures + expectedEffect
      6. 行动建议(actions)：>=3 条，每条 order+action+steps(>=3步)+expectedResult(可量化)+priority
      验收命令：报告 JSON 里 brands 数组长度 >=3 AND subCategories >=3 AND priceRanges >=3 AND commissionRanges >=3

  - name: "黑五类关键词拦截(跨平台)"
    verify: "输入黑五类关键词（减肥药/壮阳/丰胸/医疗器械/增高药/医美/蓝帽子/风水占卜）时，工具弹出⚠️红色警告，说明该品类在小红书/快手/抖音/视频号各平台属于禁推/限流品(按平台分别说明)"

  - name: "内置浏览器可登录第三方"
    verify: "工具内有浏览器窗口，用户可登录千瓜/灰豚/蝉妈妈/快手小店/抖音电商/视频号助手等任意第三方平台，登录后工具能通过CDP协议读取页面数据增强选品分析"

  - name: "4个专用抓取器 + 1个通用兜底"
    verify: "scraper/platforms/ 目录下至少包含 xhs.ts + kuaishou.ts + douyin.ts + shipinhao.ts + generic.ts 五个模块，每个模块能独立运行(降级方案:CDP失败时可用手动粘贴模式)"

  - name: "无致命bug"
    verify: "连续操作 5 次全平台选品分析(每次跨2+平台)，0次崩溃/白屏"

  - name: "选品跟踪功能可用(跨平台)"
    verify: "选品报告可一键加入跟踪列表，工具能记录该品在每个目标平台的初始数据快照(笔记数/视频数/互动量/搜索指数)，并在下次刷新时显示各平台数据变化趋势 + 跨平台对比曲线"
```

### nice_to_have（锦上添花，不计入48小时硬约束）

```yaml
nice_to_have:
  - name: "报告导出"
    verify: "选品报告可导出为 Markdown / 图片 / PDF"

  - name: "历史记录"
    verify: "能看到过去24h的选品搜索记录"

  - name: "多关键词对比"
    verify: "支持同时输入 2-3 个关键词做横向对比(可在同一平台也可跨平台)"

  - name: "一键生成带货笔记/视频选题"
    verify: "基于选品结果，自动按平台生成 3 个带货内容选题方向(小红书笔记/快手视频/抖音脚本/视频号文案各自独立)"

  - name: "对标账号跟踪(跨平台)"
    verify: "添加对标账号后，工具定期抓取其在各平台的粉丝数/作品互动/带货商品变化，显示跨平台对比趋势图"

  - name: "选品漏斗池"
    verify: "漏斗池展示所有已选品的状态(测试中/出单中/衰退期/已放弃)，每天提醒该测哪些新品、该放弃哪些旧品"

  - name: "品生命周期追踪(跨平台)"
    verify: "对已选品标记生命周期阶段(上升期/爆发期/稳定期/衰退期)，基于各平台数据趋势自动判断"

  - name: "AI智能平台推荐"
    verify: "输入品类+预算+团队配置，AI 推荐最优入驻平台组合(基于该品历史爆款数据 + 团队能力匹配度)"
```

---

## 3. budget（预算边界）

```yaml
budget:
  max_hours: 48          # 2天硬性截止
  max_steps: 20          # 最多20个开发步骤
  stop_conditions:
    - "所有 must_pass 通过 → 完成，通知那哥验收"
    - "连续 3 轮无进展 → 暂停 + Telegram通知那哥"
    - "连续 5 次同一验收失败 → 暂停 + Telegram通知那哥"
    - "触及外部付费API(超过免费额度) → 暂停 + 等那哥确认"
```

**关于 48 小时约束的诚实评估**：
- must_pass 从 v1 的 7 条升级到 v2 的 8 条
- 新增 1 条 must_pass：4 平台抓取器 + generic 兜底
- 风险点：4 个专用抓取器在 48 小时内全部跑通 CDP 抓取**几乎不可能**
- **降级预案**：先保证架构完整（5 个文件骨架 + 接口对齐），具体抓取实现按 xhs → kuaishou → douyin → shipinhao 优先级递推，**shipinhao 和 kuaishou 如果来不及就只做 generic 兜底**（v2 补齐）
- nice_to_have 全部 v2 完成

---

## 4. deliverables（交付物）

```
~/AI项目/xhs-picker/
├── README.md                  # 项目说明 + 构建命令
├── CLAUDE.md                  # Claude Code 项目配置
├── 方法论学习笔记.md           # 选品方法论提炼（已完成）
├── GOAL-DECLARATION.md        # 本文件（v2）
├── src-tauri/                 # Tauri 2 桌面端壳
│   ├── src/
│   │   └── main.rs            # Rust 主入口
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                       # 前端 + 后端
│   ├── app/                   # 界面页面
│   │   ├── page.tsx           # 主界面（关键词+品类+平台多选+报告+内置浏览器）
│   │   ├── tracker/           # 跟踪模块页面
│   │   │   ├── page.tsx       # 跨平台跟踪列表（漏斗池）
│   │   │   └── [id]/page.tsx  # 单品跟踪详情（跨平台数据趋势）
│   │   └── components/
│   │       ├── SearchBox.tsx      # 关键词+品类+平台多选
│   │       ├── PlatformTabs.tsx   # 平台切换 Tab
│   │       ├── ReportCard.tsx     # 选品报告展示(6板块)
│   │       ├── PlatformCompare.tsx # 跨平台蓝海对比表
│   │       ├── BlacklistAlert.tsx # 黑五类跨平台警告
│   │       ├── BrowserPanel.tsx   # 内置浏览器窗口
│   │       ├── TrackerList.tsx    # 跟踪列表（漏斗池视图）
│   │       ├── TrendChart.tsx     # 跨平台数据趋势图
│   │       └── LifeCycleBadge.tsx # 生命周期状态标签
│   ├── lib/
│   │   ├── platforms/             # 平台层（v2 新核心）
│   │   │   ├── types.ts           # Platform 接口定义
│   │   │   ├── xhs.ts             # 小红书专用抓取器
│   │   │   ├── kuaishou.ts        # 快手专用抓取器
│   │   │   ├── douyin.ts          # 抖音专用抓取器
│   │   │   ├── shipinhao.ts       # 视频号专用抓取器
│   │   │   └── generic.ts         # 通用兜底(任何平台可接入)
│   │   ├── analyzer.ts            # AI选品分析(支持跨平台prompt)
│   │   ├── blacklist.ts           # 黑五类关键词库(按平台分类)
│   │   ├── categories.ts          # 9大品类定义
│   │   ├── tracker/               # 跟踪模块(支持跨平台)
│   │   │   ├── store.ts           # 本地存储(跟踪列表+历史快照+平台维度)
│   │   │   ├── scheduler.ts       # 定时刷新调度
│   │   │   ├── comparator.ts      # 数据对比计算(跨平台对比+单平台趋势)
│   │   │   └── lifecycle.ts       # 生命周期判断(按平台独立判断)
│   │   └── types.ts               # TypeScript类型定义
│   └── api/
│       └── analyze/               # 选品分析API(多平台参数)
```

**v2 相对 v1 的目录变化**：
- `lib/scraper/` 重命名为 `lib/platforms/`（语义更准：平台层而非"数据抓取脚本"）
- 新增 `platforms/types.ts`（平台接口抽象）
- `generic.ts` 从"通用第三方数据平台"升级为"通用兜底接入器"（视频号/其它平台都走它）
- `tracker/comparator.ts` 升级支持跨平台对比
- `analyzer.ts` 升级支持按平台差异化的 prompt
- `blacklist.ts` 按平台分别定义黑五类规则
- 新增 `components/PlatformTabs.tsx`（平台切换 Tab）
- 新增 `components/PlatformCompare.tsx`（跨平台对比组件）

---

## 5. constraints（约束条件）

```yaml
constraints:
  must:
    - "技术栈：Tauri 2 + Next.js + TypeScript + Tailwind CSS（桌面APP交付）"
    - "内置浏览器用 Tauri 的 webview 或嵌入 Chromium（支持用户登录各平台及第三方数据平台）"
    - "AI调用：开发期用 DeepSeek（API 完全兼容 OpenAI 格式，URL 改 https://api.deepseek.com/v1/chat/completions 即可）；运行时支持用户自带 API Key（智谱/MiniMax/DeepSeek 任选其一），用户在工具设置页填入自己的 Key 后即可调用对应模型"
    - "免费数据抓取：CDP方案（每平台独立抓取器 + 1个generic兜底）"
    - "付费数据抓取：用户自带账号，工具内置浏览器登录后通过CDP读取"
    - "所有代码在 Claude Code 中开发"
    - "平台抽象：platforms/ 目录下所有平台实现统一接口(Platform interface)"
    - "AI分析：每个平台有独立的prompt特征描述，跨平台对比时输出推荐优先级"
  must_not:
    - "不做用户注册/登录系统（MVP不需要）"
    - "不做支付系统（MVP不需要）"
    - "不做移动端适配（先桌面端 Mac+Win）"
    - "不引入付费SaaS依赖"
    - "不存储用户隐私数据"
    - "不碰黑五类产品的推广（只做警告拦截）"
    - "不假设每个平台都一定能抓到数据（必须有降级方案：手动粘贴 / 平台维度跳过）"
    - "不中转/不存储/不代理用户的 API Key（MVP 阶段不实现订阅/计费/Key 池）"
    - "不做 API Key 用量监控、不做配额管理、不做多用户 Key 路由"
```

---

## 6. context（上下文）

```yaml
context:
  # 方法论基础
  - "选品方法论已完成提炼，见 ~/AI项目/xhs-picker/方法论学习笔记.md"
  - "11篇选品手册在 Obsidian _Base/AI变现/知识库/选品手册/"
  - "Storybound案例已分析：67天做出付费SaaS，Tauri桌面客户端，先自用再卖"

  # 品类体系
  - "9大一级品类：实物商品/功能性半标品/虚拟产品/知识付费/大牌平替/新奇特/周期性/男性蓝海/高客单蓝海"

  # 黑五类拦截
  - "传统黑五类：药品/医疗器械/丰胸/减肥/增高"
  - "扩展黑五类（小红书2026新规）：蓝帽子保健食品/特殊配方奶粉/医美全类目/医疗器械全类目/壮阳/私处美容/风水占卜"
  - "黑五类关键词库需覆盖：减肥药/瘦身茶/壮阳药/丰胸产品/增高鞋/增高药/医疗器械/保健品/蓝帽子/风水/算命..."
  - "v2 升级：黑五类按平台分别定义（小红书最严 / 抖音其次 / 快手相对宽松 / 视频号依赖微信生态审核）"

  # 全平台抽象（v2 核心）
  - "平台层（platforms/）设计为统一接口，每个平台实现 Platform interface"
  - "Platform interface 必含字段：platformId / displayName / searchUrl / scrape(searchTerm, category) / platformBlacklist / platformNotes"
  - "v2 支持的 5 个平台：xhs / kuaishou / douyin / shipinhao / generic(兜底)"

  # 平台特征（v2 新增上下文）
  - "小红书：30+女性为主，种草+测评+大牌平替强，知识付费高，单价敏感"
  - "快手：下沉市场+三农+日用百货爆款率高，老铁经济，直播带货强势"
  - "抖音：算法推荐+直播间+短视频种草，新奇特+冲动消费品爆款率高"
  - "视频号：微信生态，中老年+高客单，依赖社交关系链，无公开搜索API必须generic接入"
  - "其它(B站/知乎/微博)：长内容/垂类知识，可走generic接入"

  # 数据源
  - "免费源（自动）：每平台搜索页(CDP) + 通用第三方数据源(CDP)"
  - "付费源（用户登录）：千瓜(小红书)/灰豚(快手)/蝉妈妈(抖音)/视频号助手/其他(generic读取)"

  # 反爬技术方案
  - "核心：Tauri嵌入webview → 用户在webview中登录 → 工具通过CDP协议读取DOM数据"
  - "优势：用户自己的浏览器环境+Cookie，反爬识别概率极低"
  - "风险点：部分平台有自动化检测（navigator.webdriver），需要反检测注入"
  - "降级方案：如果CDP读取失败，提供手动复制粘贴的数据输入方式"
  - "v2 升级：每平台独立的反爬策略（视频号必须用generic因为无公开API）"

  # 报告产出（v2 升级）
  - "结构化报告6板块：市场概况 / 全平台蓝海对比 / 各平台爆款潜力 / 选品建议 / 平台推荐优先级 / 行动建议"
  - "导出：Markdown/图片/PDF"
  - "新增：跨平台蓝海对比表(每个平台的爆款笔记数/竞争度/匹配度评分)"
  - "新增：平台推荐优先级(AI 输出 1-5 排序 + 理由)"

  # 跟踪功能（v2 升级跨平台维度）
  - "选品漏斗池：每天加3个新品(可跨平台同时测)，根据数据反馈决定放弃/继续（来源：@袁）"
  - "生命周期管理：每个品每个平台都有独立生命周期，整体+分平台双轨判断（来源：@袁）"
  - "对标账号监控：持续观察对标账号的跨平台数据变化，学习其内容策略（来源：六步法）"
  - "竞品跟踪：出单的品多关注相似款，做了一点改变和升级的相似品重点关注（来源：@袁）"
  - "测品闭环：测多个封面+标题，根据数据反馈调整（来源：@书豪）"
  - "跟踪数据维度：笔记数变化/视频数变化/互动量变化/搜索指数变化/销量变化/粉丝数变化/生命周期阶段/平台维度"
  - "v2 升级：跨平台同一品数据曲线对比图(一眼看出哪个平台跑得更好)"

  # 技术基础
  - "DeepSeek API Key：那哥在 ~/AI项目/xhs-picker/.env.local 配置（开发用，OpenAI 兼容格式）；Claude Code 开发时只读 key 名称不读 key 值"
  - "已有CDP方案：Chrome 9223端口"
  - "参考案例：Storybound 用 Tauri 2 + React 19 + TypeScript + Rust"
```

---

## 7. checkpoints（中间检查点）

```yaml
checkpoints:
  - after_step: 4   # 平台抽象层完成(types.ts + Platform interface)
    save_state: true
    notify: "✅ Step 1：项目初始化+平台抽象层完成，准备开发5个抓取器"

  - after_step: 11  # 5个抓取器骨架完成
    save_state: true
    notify: "✅ Step 2：5个平台抓取器(4专用+1通用)骨架完成，准备开发AI分析"

  - after_step: 16  # 核心功能开发完成
    save_state: true
    notify: "✅ Step 3：跨平台AI分析+UI+跟踪模块开发完毕，准备测试"

  - after_step: 19  # 测试+修复完成
    save_state: true
    notify: "✅ Step 4：测试通过，准备交付验收"
```

**v2 调整**：检查点从 3 个增到 4 个，第 4 步专门给"5 个抓取器骨架完成"一个检查点（这是 v2 的新核心，必须单独把控）。

---

## 8. escalation（升级机制）

```yaml
escalation:
  - trigger: "小红书/快手/抖音数据抓取被封/需要验证码"
    action: "暂停 + Telegram截图通知那哥"

  - trigger: "视频号抓取无公开API"
    action: "确认走generic兜底(用户登录+CDP读取)，不投入专用抓取器研发"

  - trigger: "Tauri编译环境搭建失败"
    action: "降级为Electron（包体大但环境成熟）+ 通知那哥"

  - trigger: "任意平台反爬检测导致数据无法读取"
    action: "降级为手动粘贴模式 + 记录反爬策略供后续优化"

  - trigger: "触及任何外部付费操作"
    action: "暂停 + 等那哥确认"

  - trigger: "DeepSeek API 限速 429"
    action: "自动降级glm-4.7-flash，如果也限速则暂停等待"

  - trigger: "48小时截止时仅完成部分平台抓取"
    action: "已完成平台（小红书优先）全功能交付，未完成平台走generic兜底，v2.1补齐"
```

**v2 新增 2 个升级场景**：
- 视频号走 generic 兜底（无公开 API）
- 48 小时截止时按平台优先级递推交付

---

## 执行步骤预览（v2）

```
Step 1:  GitHub模板选型（Tauri 2 SaaS boilerplate）
Step 2:  克隆 + 初始化 + 确认桌面APP可启动
Step 3:  写 CLAUDE.md + categories.ts + blacklist.ts(按平台分类)
Step 4:  【v2 新增】设计 Platform interface + platforms/types.ts + lib/types.ts 增加 Platform 维度
Step 5:  开发黑五类关键词检测模块(支持按平台分别返回警告)
Step 6:  【v2 新增】开发 platforms/xhs.ts（小红书专用抓取器）
Step 7:  【v2 新增】开发 platforms/kuaishou.ts（快手专用抓取器）
Step 8:  【v2 新增】开发 platforms/douyin.ts（抖音专用抓取器）
Step 9:  【v2 新增】开发 platforms/shipinhao.ts（视频号 - 优先走generic接口封装）
Step 10: 【v2 新增】开发 platforms/generic.ts（通用兜底接入器，CDP读取用户登录后任意平台DOM）
Step 11: 设计AI选品分析Prompt(按9品类+5平台双维度差异化)
Step 12: 开发API路由（/api/analyze 支持多平台参数）
Step 13: 开发前端主界面(关键词+品类+平台多选+6板块报告展示+跨平台对比表)
Step 14: 开发黑五类跨平台警告组件
Step 15: 开发内置浏览器窗口组件(支持平台切换)
Step 16: 开发跟踪模块(支持跨平台维度+平台独立快照)
Step 17: 开发跟踪列表页(漏斗池+跨平台趋势图)
Step 18: 集成测试(全链路 5 平台)
Step 19: Bug修复 + UI微调
Step 20: 打包 .dmg + .exe + README + 通知那哥验收
```

**v2 关键变化**：
- Step 4 拆出"平台抽象层"作为独立步骤
- Step 6-10 拆出 5 个独立抓取器步骤（每个 Step 1 个文件）
- Step 11 AI prompt 升级"按品类+平台双维度"
- Step 13 UI 升级支持平台多选+跨平台对比
- Step 16 跟踪模块升级跨平台

---

## 平台抽象接口设计（v2 核心新增）

```typescript
// lib/platforms/types.ts
export interface Platform {
  platformId: 'xhs' | 'kuaishou' | 'douyin' | 'shipinhao' | 'generic';
  displayName: string;          // "小红书" / "快手" / ...
  searchUrl: (keyword: string) => string;  // 平台搜索页 URL
  scrape: (keyword: string, category: Category) => Promise<ScrapedData>;  // 抓取实现
  platformBlacklist: BlacklistRule[];  // 平台特定黑五类规则
  platformNotes: string;        // 平台爆款规律/选品建议(给AI prompt用)
  fallbackToGeneric: boolean;   // 抓取失败时是否回退到 generic
}
```

**这个接口的意义**：
- 5 个平台实现同一接口
- 主流程不关心具体平台，只调用 `platform.scrape()`
- 新增平台只需新增一个文件，无需改主流程
- generic 是特殊平台：searchUrl 是动态的（用户在浏览器里打开任意 URL）

---

## 质量自检清单 ✅

- [x] **goal**：全平台选品工具（5 平台）+ 跨平台跟踪
- [x] **acceptance**：8 条 must_pass 全部可验证（含跨平台维度）
- [x] **acceptance**：must_pass(8) + nice_to_have(8) 分层
- [x] **acceptance**：黑五类跨平台拦截是 must_pass
- [x] **acceptance**：内置浏览器 + CDP 通用兜底是 must_pass
- [x] **acceptance**：4 平台抓取器 + 1 通用兜底是 must_pass
- [x] **acceptance**：选品跟踪跨平台是 must_pass
- [x] **budget**：max_hours(48) + max_steps(20) + stop_conditions(4) + 48h降级预案
- [x] **deliverables**：Tauri 2 桌面端，platforms/ 抽象层，跨平台UI
- [x] **constraints**：明确说不做什么 + 黑五类不碰 + 平台抽象约束
- [x] **context**：平台特征 + 跨平台黑五类 + Platform interface + 6 板块报告
- [x] **escalation**：7 个升级场景（含视频号走generic + 48h 降级）
- [x] **反AI痕迹**：无形容词，全部量化
- [x] **v2 边界纪律**：本工具是选品工具，不混入 B2B 交付能力（那是其他工具的事）
- [x] **v2 边界纪律**：本工具不混入客户接触脚本（那是工具完成之后的事）

---

## v2 升级变更摘要（给那哥的对照表）

| 维度 | v1（小红书单平台） | v2（全平台） |
|---|---|---|
| 测试平台 | 小红书 1 个 | 小红书/快手/抖音/视频号 + 其它 5 个 |
| 抓取器 | scraper/ 4 文件 | platforms/ 5 文件 + 统一接口 |
| 报告板块 | 5 板块 | **6 板块**（增加"全平台蓝海对比"+ "平台推荐优先级"） |
| AI prompt | 按 9 品类 | **按 9 品类 × 5 平台双维度** |
| 跟踪维度 | 单平台 | **跨平台**（每个品每个平台独立快照） |
| 黑五类 | 单一关键词库 | **按平台分别定义** |
| must_pass | 7 条 | **8 条** |
| nice_to_have | 7 条 | **8 条**（增加"AI 智能平台推荐"） |
| 检查点 | 3 个 | **4 个**（增加"5 抓取器骨架"独立检查点） |
| 升级场景 | 5 个 | **7 个**（增加视频号走 generic + 48h 降级） |
| Step 数 | 20 步 | 20 步（内部重新分配） |

**v2 风险提示**：
- 4 个专用抓取器在 48 小时内全部跑通 CDP 抓取**几乎不可能**
- 降级预案已写入 stop_conditions：xhs 优先，generic 兜底
- video 平台（视频号/抖音/快手）的反爬 2026 比小红书还严，**大概率要走 generic + 用户登录**
- **真实预期**：v2 完整版 7-10 天，48 小时能交的是"架构完整 + 小红书端到端 + 其它平台 generic 兜底"
