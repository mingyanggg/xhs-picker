/**
 * Platform 接口定义 - v2 全平台抽象层核心
 *
 * 设计原则：
 * - 5个平台实现同一接口
 * - 主流程不关心具体平台，只调用 platform.scrape()
 * - 新增平台只需新增一个文件，无需改主流程
 * - generic 是特殊平台：searchUrl 是动态的（用户在浏览器里打开任意URL）
 */

// ============== 枚举定义 ==============

/** 支持的平台ID */
export type PlatformId = 'xhs' | 'kuaishou' | 'douyin' | 'shipinhao' | 'generic';

/** 9大一级品类 */
export type Category =
  | '实物商品'
  | '功能性半标品'
  | '虚拟产品'
  | '知识付费'
  | '大牌平替'
  | '新奇特'
  | '周期性'
  | '男性蓝海'
  | '高客单蓝海';

/** 生命周期阶段 */
export type LifeCycleStage = '上升期' | '爆发期' | '稳定期' | '衰退期';

/** 数据变化趋势 */
export type TrendDirection = 'up' | 'down' | 'stable';

/** 抓取状态 */
export type ScrapeStatus = 'success' | 'failed' | 'manual_fallback' | 'pending';

// ============== 数据结构定义 ==============

/** 抓取的数据点 */
export interface DataPoint {
  /** 数值 */
  value: number;
  /** 时间戳 */
  timestamp: number;
  /** 来源平台 */
  platformId: PlatformId;
}

/** 平台互动数据 */
export interface EngagementData {
  /** 点赞数 */
  likes: number;
  /** 收藏数 */
  collects: number;
  /** 评论数 */
  comments: number;
  /** 分享数 */
  shares: number;
  /** 总互动量 */
  total: number;
}

/** 账号基础信息 */
export interface AccountInfo {
  /** 账号ID */
  id?: string;
  /** 账号名称 */
  name: string;
  /** 昵称（别名） */
  nickname?: string;
  /** 头像 */
  avatar?: string;
  /** 粉丝数 */
  followers: number;
  /** 笔记/视频数 */
  contentCount: number;
  /** 平均互动量 */
  avgEngagement: number;
}

/** 单条内容（笔记/视频） */
export interface ContentItem {
  /** 内容ID */
  id: string;
  /** 标题 */
  title: string;
  /** 链接 */
  url: string;
  /** 发布时间 */
  publishTime: string;
  /** 互动数据 */
  engagement: EngagementData;
  /** 关联商品链接（如果有） */
  productUrl?: string;
  /** 发布账号 */
  account: AccountInfo;
  /** 是否低粉爆款（粉丝<2000 且 互动>100） */
  isLowFollowerViral: boolean;
}

/** 搜索指数数据（来自巨量算数等） */
export interface SearchIndex {
  /** 搜索指数 */
  index: number;
  /** 内容分 */
  contentScore: number;
  /** 传播分 */
  spreadScore: number;
  /** 搜索分 */
  searchScore: number;
  /** 数据来源 */
  source: string;
}

/** 竞品/商品数据 */
export interface ProductData {
  /** 商品名称 */
  name: string;
  /** 价格 */
  price: number;
  /** 销量 */
  sales: number;
  /** 评价数 */
  reviews: number;
  /** 平台 */
  platform: PlatformId;
}

/** 抓取结果 */
export interface ScrapedData {
  /** 抓取状态 */
  status: ScrapeStatus;
  /** 关键词 */
  keyword: string;
  /** 平台ID */
  platformId: PlatformId;
  /** 内容列表 */
  contents: ContentItem[];
  /** 搜索指数 */
  searchIndex?: SearchIndex;
  /** 商品数据 */
  products: ProductData[];
  /** 蓝海指标：笔记数/互动量比值（越小越蓝海） */
  blueOceanRatio?: number;
  /** 抓取时间 */
  scrapedAt: number;
  /** 错误信息（如果失败） */
  error?: string;
  /** 降级模式（手动粘贴数据） */
  isManualMode: boolean;
  /** 手动粘贴的数据（降级时使用） */
  manualData?: string;
}

/** 数据变化 */
export interface DataChange {
  /** 变化值 */
  delta: number;
  /** 变化率（百分比） */
  changeRate: number;
  /** 趋势方向 */
  trend: TrendDirection;
  /** 对比时间点 */
  comparedAt: number;
}

/** 跨平台快照 */
export interface PlatformSnapshot {
  /** 平台ID */
  platformId: PlatformId;
  /** 快照时间 */
  timestamp: number;
  /** 内容数量 */
  contentCount: number;
  /** 平均互动量 */
  avgEngagement: number;
  /** 总互动量 */
  totalEngagement: number;
  /** 搜索指数 */
  searchIndex?: number;
  /** 低粉爆款数 */
  lowFollowerViralCount: number;
}

// ============== 黑五类定义 ==============

/** 黑五类违规等级 */
export type BlacklistLevel = 'blocked' | 'restricted' | 'warning';

/** 黑五类规则 */
export interface BlacklistRule {
  /** 规则ID */
  id: string;
  /** 关键词 */
  keyword: string;
  /** 违规等级 */
  level: BlacklistLevel;
  /** 禁推原因 */
  reason: string;
  /** 风险说明 */
  riskNote: string;
  /** 适用的平台列表 */
  applicablePlatforms: PlatformId[];
}

/** 平台黑五类警告 */
export interface PlatformBlacklistWarning {
  /** 平台ID */
  platformId: PlatformId;
  /** 平台名称 */
  platformName: string;
  /** 违规等级 */
  level: BlacklistLevel;
  /** 警告信息 */
  message: string;
  /** 禁推原因 */
  reason: string;
}

// ============== AI分析报告结构 ==============

/** 市场概况 */
export interface MarketOverview {
  /** 品类 */
  category: Category;
  /** 关键词 */
  keyword: string;
  /** 各平台笔记/视频总数 */
  totalContentCount: Record<PlatformId, number>;
  /** 各平台平均互动量 */
  avgEngagement: Record<PlatformId, number>;
  /** 各平台搜索指数 */
  searchIndex: Record<PlatformId, number>;
  /** 分析时间 */
  analyzedAt: number;
}

/** 单平台蓝海数据 */
export interface PlatformBlueOcean {
  /** 平台ID */
  platformId: PlatformId;
  /** 平台名称 */
  platformName: string;
  /** 蓝海评分（1-10） */
  blueOceanScore: number;
  /** 供需比（搜索指数/笔记数） */
  supplyDemandRatio: number;
  /** 竞品密度 */
  competitionLevel: '低' | '中' | '高';
  /** 蓝海判断依据 */
  reason: string;
}

/** 单平台爆款潜力 */
export interface PlatformViral {
  /** 平台ID */
  platformId: PlatformId;
  /** 平台名称 */
  platformName: string;
  /** 爆款潜力评分（1-10） */
  viralScore: number;
  /** 低粉爆款案例数 */
  lowFollowerViralCount: number;
  /** TOP对标账号列表 */
  topAccounts: AccountInfo[];
  /** 爆款特征描述 */
  viralFeatures: string[];
  /** 建议的爆款方向 */
  suggestion: string;
}

/** 价格区间 */
export interface PriceRange {
  /** 最低价（人民币元） */
  min: number;
  /** 最高价（人民币元） */
  max: number;
  /** 区间描述 */
  description: string;
  /** 典型代表产品/品牌 */
  example?: string;
}

/** 佣金比例区间 */
export interface CommissionRange {
  /** 最低佣金比例（百分比，如 10 表示 10%） */
  min: number;
  /** 最高佣金比例（百分比） */
  max: number;
  /** 适用场景描述 */
  scenario: string;
  /** 典型平台/带货渠道 */
  platform?: string;
}

/** 选品建议 */
export interface PickSuggestion {
  /** 推荐指数（1-5星） */
  recommendScore: number;
  /** 建议方向 */
  direction: string;
  /** 适合人群 */
  targetAudience: string;
  /** 注意事项 */
  cautions: string[];
  /** 预期收益 */
  expectedReturn?: string;
  /** 推荐品牌（>=3 个具体品牌名） */
  brands: string[];
  /** 二级品类细分（>=3 个） */
  subCategories: string[];
  /** 价格区间（>=3 档） */
  priceRanges: PriceRange[];
  /** 佣金比例区间（>=3 档） */
  commissionRanges: CommissionRange[];
}

/** 平台推荐 */
export interface PlatformRecommend {
  /** 平台ID */
  platformId: PlatformId;
  /** 平台名称 */
  platformName: string;
  /** 推荐优先级（1最高） */
  priority: number;
  /** 推荐理由 */
  reason: string;
  /** 适合的品类特征 */
  suitableFeatures: string[];
  /** 预估效果 */
  expectedEffect?: string;
}

/** 行动建议项 */
export interface ActionItem {
  /** 序号 */
  order: number;
  /** 行动描述 */
  action: string;
  /** 具体步骤 */
  steps: string[];
  /** 预期结果 */
  expectedResult: string;
  /** 优先级 */
  priority: '高' | '中' | '低';
}

/** 完整选品报告 */
export interface PickReport {
  /** 市场概况 */
  market: MarketOverview;
  /** 全平台蓝海对比 */
  blueOceanCompare: PlatformBlueOcean[];
  /** 各平台爆款潜力 */
  viralPotential: PlatformViral[];
  /** 选品建议 */
  suggestion: PickSuggestion;
  /** 平台推荐优先级 */
  platformPriority: PlatformRecommend[];
  /** 行动建议 */
  actions: ActionItem[];
  /** 报告生成时间 */
  generatedAt: number;
}

// ============== 跟踪模块定义 ==============

/** 跟踪项目 */
export interface TrackerItem {
  /** 跟踪ID */
  id: string;
  /** 关键词 */
  keyword: string;
  /** 品类 */
  category: Category;
  /** 目标平台列表 */
  platforms: PlatformId[];
  /** 创建时间 */
  createdAt: number;
  /** 最后更新时间 */
  updatedAt: number;
  /** 生命周期阶段 */
  lifeCycle: LifeCycleStage;
  /** 生命周期变更历史 */
  lifeCycleHistory: { stage: LifeCycleStage; changedAt: number }[];
  /** 各平台最新快照 */
  snapshots: Record<PlatformId, PlatformSnapshot>;
  /** 备注 */
  note?: string;
  /** 状态 */
  status: 'active' | 'paused' | 'archived';
}

/** 跟踪数据变化记录 */
export interface TrackerChangeLog {
  /** 跟踪ID */
  trackerId: string;
  /** 变化记录列表 */
  changes: {
    platformId: PlatformId;
    metric: string;
    oldValue: number;
    newValue: number;
    changeRate: number;
    recordedAt: number;
  }[];
}

// ============== Platform 接口 ==============

/**
 * 平台抓取器接口
 *
 * 所有平台抓取器必须实现此接口
 */
export interface Platform {
  /** 平台ID */
  platformId: PlatformId;
  /** 显示名称 */
  displayName: string;
  /** 搜索URL（generic平台返回空字符串） */
  searchUrl: (keyword: string) => string;
  /** 抓取数据 */
  scrape: (keyword: string, category: Category) => Promise<ScrapedData>;
  /** 平台黑五类规则 */
  platformBlacklist: BlacklistRule[];
  /** 平台爆款规律备注（给AI prompt用） */
  platformNotes: string;
  /** 抓取失败时是否回退到generic */
  fallbackToGeneric: boolean;
}

// ============== API 请求/响应 ==============

/** 分析请求 */
export interface AnalyzeRequest {
  /** 用户输入的关键词 */
  keyword: string;
  /** 品类 */
  category: Category;
  /** 目标平台列表 */
  platforms: PlatformId[];
  /** 可选：手动粘贴的数据（降级模式） */
  manualData?: Partial<Record<PlatformId, string>>;
  /** 可选：已提取的真实数据（来自内置浏览器） */
  scrapedData?: ContentItem[];
}

/** 分析响应 */
export interface AnalyzeResponse {
  /** 选品报告 */
  report: PickReport;
  /** 是否黑五类 */
  isBlacklisted: boolean;
  /** 黑五类警告（按平台） */
  blacklistWarnings: PlatformBlacklistWarning[];
  /** 各平台抓取状态 */
  scrapeStatus: Record<PlatformId, ScrapeStatus>;
  /** 错误信息（如果有） */
  errors?: Record<PlatformId, string>;
}

// ============== 内置浏览器相关 ==============

/** 浏览器标签页 */
export interface BrowserTab {
  /** 标签ID */
  id: string;
  /** 标题 */
  title: string;
  /** URL */
  url: string;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 登录状态检测结果 */
  loginCheckResult?: string;
}

/** CDP 读取请求 */
export interface CDPReadRequest {
  /** 读取哪个标签页 */
  tabId: string;
  /** CSS选择器 */
  selector: string;
  /** 读取模式 */
  mode: 'text' | 'html' | 'attribute' | 'value';
  /** 属性名（当mode=attribute时） */
  attributeName?: string;
}

/** CDP 读取响应 */
export interface CDPReadResponse {
  /** 是否成功 */
  success: boolean;
  /** 读取到的数据 */
  data?: string | string[];
  /** 错误信息 */
  error?: string;
}