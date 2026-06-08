/**
 * AI选品分析引擎
 *
 * 功能：
 * - 调用 DeepSeek API（OpenAI 兼容）进行选品分析
 * - 按9品类 × 5平台双维度差异化prompt
 * - 输出6板块结构化JSON报告
 *
 * 数据流：
 * 1. 收集各平台抓取的数据
 * 2. 构建差异化prompt（品类特征 × 平台特征）
 * 3. 调用 DeepSeek API
 * 4. 解析返回的JSON报告
 */

import type {
  Category,
  PlatformId,
  ScrapedData,
  PickReport,
  PlatformBlueOcean,
  PlatformViral,
  PlatformRecommend,
  MarketOverview,
  PickSuggestion,
  ActionItem,
} from './platforms/types';
import { CATEGORIES, getCategoryInfo } from './categories';
import { PLATFORM_NAMES } from './platforms';

// ============== 环境变量 ==============
// ============== 环境变量 ==============
// 默认值走 DeepSeek（OpenAI 兼容），通过环境变量可覆盖到任意智谱/MiniMax/OpenAI 等
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.ZHIPU_API_KEY || '';
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

// ============== Prompt构建 ==============

/**
 * 构建选品分析的系统提示词
 */
function buildSystemPrompt(): string {
  return `你是小红书/全平台AI选品助手，专注于帮助副业卖家进行跨平台选品分析。

## 你的能力
- 分析各平台（小红书/快手/抖音/视频号）的选品数据
- 评估蓝海指数、爆款潜力、平台适合度
- 给出具体的选品建议和行动方案

## 分析报告结构（必须严格按此JSON格式输出）
{
  "market": { // 市场概况
    "category": "品类",
    "keyword": "关键词",
    "totalContentCount": {"xhs": 数字, "kuaishou": 数字, "douyin": 数字, "shipinhao": 数字},
    "avgEngagement": {"xhs": 数字, "kuaishou": 数字, "douyin": 数字, "shipinhao": 数字},
    "searchIndex": {"xhs": 数字, "kuaishou": 数字, "douyin": 数字, "shipinhao": 数字},
    "analyzedAt": 时间戳
  },
  "blueOceanCompare": [ // 全平台蓝海对比（每个平台一行）
    {
      "platformId": "xhs",
      "platformName": "小红书",
      "blueOceanScore": 1-10,
      "supplyDemandRatio": 数字,
      "competitionLevel": "低/中/高",
      "reason": "判断依据"
    }
  ],
  "viralPotential": [ // 各平台爆款潜力
    {
      "platformId": "xhs",
      "platformName": "小红书",
      "viralScore": 1-10,
      "lowFollowerViralCount": 数字,
      "topAccounts": [{"name": "账号名", "followers": 数字, "contentCount": 数字, "avgEngagement": 数字}],
      "viralFeatures": ["特征1", "特征2"],
      "suggestion": "爆款建议"
    }
  ],
  "suggestion": { // 选品建议
    "recommendScore": 1-5,
    "direction": "建议方向",
    "targetAudience": "适合人群",
    "cautions": ["注意1", "注意2"],
    "expectedReturn": "预期收益",
    "brands": ["品牌1", "品牌2", "品牌3"],
    "subCategories": ["二级品类1", "二级品类2", "二级品类3"],
    "priceRanges": [
      {"min": 数字, "max": 数字, "description": "区间描述", "example": "代表产品"}
    ],
    "commissionRanges": [
      {"min": 数字, "max": 数字, "scenario": "适用场景", "platform": "平台名"}
    ]
  },
  "platformPriority": [ // 平台推荐优先级
    {
      "platformId": "xhs",
      "platformName": "小红书",
      "priority": 1,
      "reason": "推荐理由",
      "suitableFeatures": ["特点1", "特点2"],
      "expectedEffect": "预估效果"
    }
  ],
  "actions": [ // 行动建议
    {
      "order": 1,
      "action": "行动标题",
      "steps": ["步骤1", "步骤2"],
      "expectedResult": "预期结果",
      "priority": "高/中/低"
    }
  ]
}

## 输出要求
- 必须输出有效的JSON格式
- 所有字段都必须有值，不能为空
- 蓝海评分和爆款评分用1-10数字
- 推荐指数用1-5星
- 行动建议至少3条`;
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(
  keyword: string,
  category: Category,
  platforms: PlatformId[],
  scrapedDataList: ScrapedData[]
): string {
  // 获取品类信息
  const categoryInfo = getCategoryInfo(category);

  // 构建平台数据摘要
  const platformDataSummary = platforms.map((platformId) => {
    const data = scrapedDataList.find((d) => d.platformId === platformId);
    const platformName = PLATFORM_NAMES[platformId];

    if (!data || data.status === 'failed' || data.status === 'pending') {
      return `${platformName}：暂无数据（${data?.error || '抓取失败'}）`;
    }

    const contentCount = data.contents.length;
    const avgEngagement =
      data.contents.length > 0
        ? Math.round(
            data.contents.reduce((sum, c) => sum + c.engagement.total, 0) /
              data.contents.length
          )
        : 0;
    const blueOceanRatio = data.blueOceanRatio?.toFixed(2) || '未知';

    return `${platformName}：
  - 内容数量：${contentCount}
  - 平均互动量：${avgEngagement}
  - 蓝海指数：${blueOceanRatio}
  - 抓取状态：${data.status}`;
  }).join('\n\n');

  return `## 选品任务

**关键词**：${keyword}
**品类**：${category} - ${categoryInfo.description}
**目标平台**：${platforms.map((p) => PLATFORM_NAMES[p]).join('、')}

## 品类特征
${categoryInfo.evaluationDimensions.map((d) => `- ${d}`).join('\n')}
评估权重：蓝海${categoryInfo.weights.blueOcean} / 爆款${categoryInfo.weights.viralPotential} / 竞争${categoryInfo.weights.competition} / 用户匹配${categoryInfo.weights.userMatch}

## 各平台数据

${platformDataSummary}

## 请分析（必须输出以下 4 类具体选品数据，缺一不可）
1. **具体品牌**：基于品类给出 3+ 个真实存在的品牌名（不能编造）
2. **二级品类细分**：3+ 个具体的产品细分（不能只写大品类）
3. **价格区间**：3+ 档价格带，每档含数字区间 + 典型代表产品
4. **佣金比例**：3+ 档佣金区间，每档含百分比 + 适用场景 + 典型平台

哪个平台最适合这个品类？（基于蓝海指数、爆款潜力、用户匹配度）
这个品类的蓝海程度如何？
各平台的爆款特征是什么？
给出具体的选品建议和3条行动方案`;
}

// ============== API调用 ==============

interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ZhipuRequest {
  model: string;
  messages: ZhipuMessage[];
  temperature?: number;
  max_tokens?: number;
}

/**
 * 调用 DeepSeek API（OpenAI 兼容）
 */
async function callZhipuAPI(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'deepseek-v4-flash'
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY 未配置');
  }

  const request: ZhipuRequest = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 调用失败：${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // 解析响应
  if (result.error) {
    throw new Error(`DeepSeek API 错误：${result.error.message || result.error}`);
  }

  return result.choices?.[0]?.message?.content || '';
}

// ============== 响应解析 ==============

/**
 * 解析AI返回的JSON报告
 */
function parseReport(jsonStr: string): PickReport {
  // 尝试提取JSON（处理markdown代码块）
  let cleaned = jsonStr.trim();

  // 移除markdown代码块
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  // 尝试解析JSON
  try {
    const parsed = JSON.parse(cleaned);
    return parsed as PickReport;
  } catch {
    // JSON解析失败，尝试修复
    throw new Error(`AI响应不是有效的JSON格式：${jsonStr.slice(0, 200)}`);
  }
}

// ============== 主分析函数 ==============

/**
 * 分析选品
 *
 * @param keyword 关键词
 * @param category 品类
 * @param platforms 目标平台列表
 * @param scrapedDataList 各平台抓取的数据
 * @returns 选品分析报告
 */
export async function analyze(
  keyword: string,
  category: Category,
  platforms: PlatformId[],
  scrapedDataList: ScrapedData[]
): Promise<PickReport> {
  // 构建提示词
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(keyword, category, platforms, scrapedDataList);

  // 调用AI
  const aiResponse = await callZhipuAPI(systemPrompt, userPrompt);

  // 解析报告
  const report = parseReport(aiResponse);

  // 补充元数据
  report.market = report.market || {
    category,
    keyword,
    totalContentCount: {},
    avgEngagement: {},
    searchIndex: {},
    analyzedAt: Date.now(),
  };
  report.generatedAt = Date.now();

  return report;
}

/**
 * 生成模拟报告（用于开发测试，无API时）
 */
export function generateMockReport(
  keyword: string,
  category: Category,
  platforms: PlatformId[]
): PickReport {
  const now = Date.now();

  const market: MarketOverview = {
    category,
    keyword,
    totalContentCount: Object.fromEntries(
      platforms.map((p) => [p, Math.floor(Math.random() * 10000)])
    ) as Record<PlatformId, number>,
    avgEngagement: Object.fromEntries(
      platforms.map((p) => [p, Math.floor(Math.random() * 500)])
    ) as Record<PlatformId, number>,
    searchIndex: Object.fromEntries(
      platforms.map((p) => [p, Math.floor(Math.random() * 10000)])
    ) as Record<PlatformId, number>,
    analyzedAt: now,
  };

  const blueOceanCompare: PlatformBlueOcean[] = platforms.map((p, i) => ({
    platformId: p,
    platformName: PLATFORM_NAMES[p],
    blueOceanScore: Math.floor(Math.random() * 5) + 5,
    supplyDemandRatio: Math.random() * 2 + 0.5,
    competitionLevel: ['低', '中', '高'][Math.floor(Math.random() * 3)] as any,
    reason: '基于蓝海指数和竞品密度综合判断',
  }));

  const viralPotential: PlatformViral[] = platforms.map((p) => ({
    platformId: p,
    platformName: PLATFORM_NAMES[p],
    viralScore: Math.floor(Math.random() * 5) + 5,
    lowFollowerViralCount: Math.floor(Math.random() * 20),
    topAccounts: [
      {
        name: '示例账号',
        followers: Math.floor(Math.random() * 10000),
        contentCount: Math.floor(Math.random() * 100),
        avgEngagement: Math.floor(Math.random() * 500),
      },
    ],
    viralFeatures: ['低粉爆款', '真实测评'],
    suggestion: '建议关注低粉爆款账号的选品策略',
  }));

  const suggestion: PickSuggestion = {
    recommendScore: Math.floor(Math.random() * 2) + 3,
    direction: `以${category}为核心，建议从性价比角度切入`,
    targetAudience: '25-35岁女性，有一定消费能力',
    cautions: ['注意平台规则', '避免夸大宣传'],
    expectedReturn: '月销1000-3000单',
    brands: ['示例品牌A', '示例品牌B', '示例品牌C', '示例品牌D'],
    subCategories: ['二级品类1', '二级品类2', '二级品类3', '二级品类4'],
    priceRanges: [
      { min: 0, max: 50, description: '入门尝鲜价', example: '平价替代品' },
      { min: 50, max: 200, description: '主流消费带', example: '中端品牌' },
      { min: 200, max: 800, description: '品质升级带', example: '中高端品牌' },
    ],
    commissionRanges: [
      { min: 5, max: 15, scenario: '高客单低佣金', platform: '小红书' },
      { min: 15, max: 30, scenario: '中客单中佣金', platform: '抖音/快手' },
      { min: 30, max: 50, scenario: '低客单高佣金', platform: '淘宝客' },
    ],
  };

  const platformPriority: PlatformRecommend[] = platforms
    .map((p, i) => ({
      platformId: p,
      platformName: PLATFORM_NAMES[p],
      priority: i + 1,
      reason: '基于平台特性和品类匹配度',
      suitableFeatures: ['用户活跃', '流量大'],
      expectedEffect: '曝光量10000+/天',
    }))
    .sort(() => Math.random() - 0.5);

  const actions: ActionItem[] = [
    {
      order: 1,
      action: '搜索对标账号',
      steps: ['在小红书搜索关键词', '找到低粉爆款账号', '分析其选品策略'],
      expectedResult: '找到3-5个可学习的对标账号',
      priority: '高',
    },
    {
      order: 2,
      action: '优化内容方向',
      steps: ['参考对标账号的内容形式', '制作3个不同风格的笔记', '测试数据反馈'],
      expectedResult: '找到最适合的内容风格',
      priority: '中',
    },
    {
      order: 3,
      action: '建立选品漏斗',
      steps: ['记录每日选品数据', '跟踪7天数据变化', '淘汰表现差的品'],
      expectedResult: '建立稳定的选品漏斗池',
      priority: '中',
    },
  ];

  return {
    market,
    blueOceanCompare,
    viralPotential,
    suggestion,
    platformPriority,
    actions,
    generatedAt: now,
  };
}

// ============== 导出 ==============

export default analyze;
export { callZhipuAPI, parseReport, buildSystemPrompt, buildUserPrompt };