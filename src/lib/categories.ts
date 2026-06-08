/**
 * 9大品类定义
 *
 * 每个品类关联不同的AI分析维度和评估权重
 */

import type { Category } from './platforms/types';

/** 品类信息 */
export interface CategoryInfo {
  /** 品类ID */
  id: Category;
  /** 显示名称 */
  displayName: string;
  /** 描述 */
  description: string;
  /** 适用平台（某些品类在特定平台表现更好） */
  suitablePlatforms: string[];
  /** 核心评估维度 */
  evaluationDimensions: string[];
  /** AI分析时的权重配置 */
  weights: {
    /** 蓝海权重 */
    blueOcean: number;
    /** 爆款潜力权重 */
    viralPotential: number;
    /** 竞争度权重 */
    competition: number;
    /** 用户匹配度权重 */
    userMatch: number;
  };
  /** 示例关键词 */
  exampleKeywords: string[];
}

/** 9大品类定义 */
export const CATEGORIES: Record<Category, CategoryInfo> = {
  '实物商品': {
    id: '实物商品',
    displayName: '实物商品',
    description: '标品+半标品，如美妆/服饰/家居/食品等看得见摸得着的商品',
    suitablePlatforms: ['小红书', '抖音', '快手', '视频号'],
    evaluationDimensions: ['互动量趋势', '销量数据', '价格区间', '竞品数量'],
    weights: { blueOcean: 0.3, viralPotential: 0.3, competition: 0.2, userMatch: 0.2 },
    exampleKeywords: ['防晒霜', '瑜伽服', '收纳盒', '零食'],
  },
  '功能性半标品': {
    id: '功能性半标品',
    displayName: '功能性半标品',
    description: '满足特定需求的产品，如减肥/防晒/收纳等功能性商品',
    suitablePlatforms: ['小红书', '抖音', '快手'],
    evaluationDimensions: ['功能需求度', '替代品竞争', '用户痛点', '效果可视化'],
    weights: { blueOcean: 0.35, viralPotential: 0.25, competition: 0.2, userMatch: 0.2 },
    exampleKeywords: ['防晒帽', '减肥零食', '收纳神器', '体态矫正'],
  },
  '虚拟产品': {
    id: '虚拟产品',
    displayName: '虚拟产品',
    description: '教程/模板/素材/软件等非实物产品',
    suitablePlatforms: ['小红书', '抖音', 'B站'],
    evaluationDimensions: ['版权风险', '竞争者数量', '需求量', '定价空间'],
    weights: { blueOcean: 0.3, viralPotential: 0.2, competition: 0.3, userMatch: 0.2 },
    exampleKeywords: ['PPT模板', '简历模板', '剪辑素材', '壁纸'],
  },
  '知识付费': {
    id: '知识付费',
    displayName: '知识付费',
    description: '课程/咨询/服务等知识型产品',
    suitablePlatforms: ['小红书', '抖音', 'B站', '知乎'],
    evaluationDimensions: ['知识深度', '受众范围', '差异化', '变现路径'],
    weights: { blueOcean: 0.25, viralPotential: 0.2, competition: 0.25, userMatch: 0.3 },
    exampleKeywords: ['小红书运营课', '摄影教程', '英语学习', '理财知识'],
  },
  '大牌平替': {
    id: '大牌平替',
    displayName: '大牌平替',
    description: '帮用户省钱的大牌替代品，平价但品质接近',
    suitablePlatforms: ['小红书', '抖音'],
    evaluationDimensions: ['平替空间', '大牌关联度', '价格敏感度', '学生党覆盖'],
    weights: { blueOcean: 0.25, viralPotential: 0.35, competition: 0.2, userMatch: 0.2 },
    exampleKeywords: ['平价替代', '学生党', '大牌同款', '性价比'],
  },
  '新奇特': {
    id: '新奇特',
    displayName: '新奇特',
    description: '有真实需求的新奇产品，差异化强但市场未知',
    suitablePlatforms: ['小红书', '抖音', '快手'],
    evaluationDimensions: ['新奇度', '真实需求', '传播潜力', '供应链稳定'],
    weights: { blueOcean: 0.4, viralPotential: 0.3, competition: 0.1, userMatch: 0.2 },
    exampleKeywords: ['露营灯', '创意家居', '奇怪玩具', '黑科技产品'],
  },
  '周期性': {
    id: '周期性',
    displayName: '周期性/季节性',
    description: '每年固定时间段需求暴增的产品',
    suitablePlatforms: ['小红书', '抖音', '快手', '视频号'],
    evaluationDimensions: ['季节性强度', '周期长度', '提前布局空间', '复购率'],
    weights: { blueOcean: 0.3, viralPotential: 0.3, competition: 0.2, userMatch: 0.2 },
    exampleKeywords: ['防晒霜', '圣诞礼物', '开学必备', '年货'],
  },
  '男性蓝海': {
    id: '男性蓝海',
    displayName: '男性蓝海',
    description: '小红书男性用户少但需求在，竞争少机会多',
    suitablePlatforms: ['小红书', '抖音', '快手'],
    evaluationDimensions: ['男性需求度', '现有竞争', '种草难度', '客单价'],
    weights: { blueOcean: 0.4, viralPotential: 0.2, competition: 0.2, userMatch: 0.2 },
    exampleKeywords: ['男士护肤', '男生穿搭', '数码产品', '健身器材'],
  },
  '高客单蓝海': {
    id: '高客单蓝海',
    displayName: '高客单蓝海',
    description: '小众高端产品，高利润但转化难',
    suitablePlatforms: ['小红书', '抖音', '视频号'],
    evaluationDimensions: ['高客单可行性', '受众购买力', '信任建立难度', '利润空间'],
    weights: { blueOcean: 0.3, viralPotential: 0.2, competition: 0.2, userMatch: 0.3 },
    exampleKeywords: ['户外装备', '设计师品牌', '轻奢品', '艺术品'],
  },
};

/** 获取所有品类列表 */
export function getAllCategories(): Category[] {
  return Object.keys(CATEGORIES) as Category[];
}

/** 根据ID获取品类信息 */
export function getCategoryInfo(category: Category): CategoryInfo {
  return CATEGORIES[category];
}

/** 品类选项（用于UI下拉） */
export const CATEGORY_OPTIONS = getAllCategories().map((cat) => ({
  value: cat,
  label: CATEGORIES[cat].displayName,
  description: CATEGORIES[cat].description,
}));