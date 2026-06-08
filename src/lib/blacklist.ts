/**
 * 黑五类关键词检测模块 - v2 按平台分类
 *
 * 功能：
 * - 关键词库覆盖：药品/医疗器械/增高/壮阳/蓝帽子/医美/风水占卜等
 * - 按平台分别定义拦截规则（小红书最严/抖音其次/快手相对宽松/视频号依赖微信生态）
 * - 输入检测 → 红色警告弹窗 → 说明各平台禁推原因
 */

import type {
  PlatformId,
  BlacklistRule,
  BlacklistLevel,
  PlatformBlacklistWarning,
} from './platforms/types';

// ============== 黑五类关键词库 ==============

/** 黑五类关键词 */
type BlacklistKeyword = {
  /** 关键词 */
  keyword: string;
  /** 变体（同义词/拼音/缩写） */
  variants: string[];
  /** 违规等级 */
  level: BlacklistLevel;
  /** 禁推原因 */
  reason: string;
  /** 风险说明 */
  riskNote: string;
  /** 适用的严格平台 */
  strictPlatforms: PlatformId[];
  /** 适用的宽松平台（相对宽松但仍需警告） */
  loosePlatforms: PlatformId[];
};

/** 黑五类关键词库 */
const BLACKLIST_KEYWORDS: BlacklistKeyword[] = [
  // 药品类
  {
    keyword: '减肥药',
    variants: ['减肥药', '瘦身药', '减肥胶囊', '减肥丸', '减肥片'],
    level: 'blocked',
    reason: '药品类属于严格管控，违规推广面临法律风险',
    riskNote: '违反《广告法》，可能面临罚款、下架、账号封禁',
    strictPlatforms: ['xhs', 'douyin', 'shipinhao'],
    loosePlatforms: ['kuaishou'],
  },
  {
    keyword: '壮阳',
    variants: ['壮阳', '壮阳药', '补肾', '延时', '助勃'],
    level: 'blocked',
    reason: '涉及虚假宣传和违规药品推广',
    riskNote: '违反《广告法》，可能面临法律诉讼',
    strictPlatforms: ['xhs', 'douyin', 'kuaishou', 'shipinhao'],
    loosePlatforms: [],
  },
  {
    keyword: '增高药',
    variants: ['增高药', '增高胶囊', '长高药', '增高产品', '增高丸'],
    level: 'blocked',
    reason: '虚假宣传，药品类严格管控',
    riskNote: '违反《广告法》，可能面临法律诉讼',
    strictPlatforms: ['xhs', 'douyin', 'kuaishou', 'shipinhao'],
    loosePlatforms: [],
  },

  // 医疗器械类
  {
    keyword: '医疗器械',
    variants: ['医疗器械', '医疗设备', '治疗仪', '理疗仪', '医疗器材'],
    level: 'blocked',
    reason: '医疗器械推广需要资质，违规推广面临法律风险',
    riskNote: '无资质推广医疗器械违法，可能面临刑事责任',
    strictPlatforms: ['xhs', 'douyin', 'kuaishou', 'shipinhao'],
    loosePlatforms: [],
  },
  {
    keyword: '隐形眼镜',
    variants: ['隐形眼镜', '美瞳', '角膜塑形镜', 'ok镜'],
    level: 'restricted',
    reason: '医疗器械类，需要资质才能推广',
    riskNote: '无资质推广可能面临平台处罚',
    strictPlatforms: ['xhs', 'douyin'],
    loosePlatforms: ['kuaishou', 'shipinhao'],
  },

  // 美容类
  {
    keyword: '美白针',
    variants: ['美白针', '溶脂针', '水光针', '玻尿酸注射'],
    level: 'blocked',
    reason: '医美类需要资质，涉及医疗行为',
    riskNote: '违规推广医美可能面临法律诉讼和平台封禁',
    strictPlatforms: ['xhs', 'douyin', 'kuaishou', 'shipinhao'],
    loosePlatforms: [],
  },
  {
    keyword: '私处美容',
    variants: ['私处美容', '私密护理', '缩阴', '私处美白'],
    level: 'blocked',
    reason: '涉及违规宣传和敏感内容',
    riskNote: '违反平台规定，可能面临封禁',
    strictPlatforms: ['xhs', 'douyin', 'kuaishou', 'shipinhao'],
    loosePlatforms: [],
  },

  // 保健食品类
  {
    keyword: '蓝帽子',
    variants: ['蓝帽子', '保健食品', '保健品', '蓝帽食品'],
    level: 'restricted',
    reason: '保健食品需有资质，虚假宣传违法',
    riskNote: '违规宣传保健食品可能面临罚款和平台处罚',
    strictPlatforms: ['xhs', 'douyin'],
    loosePlatforms: ['kuaishou', 'shipinhao'],
  },
  {
    keyword: '特殊配方奶粉',
    variants: ['特殊配方奶粉', '特殊医学奶粉', '氨基酸奶粉', '水解奶粉'],
    level: 'restricted',
    reason: '特殊医学用途食品需资质',
    riskNote: '违规推广可能面临法律诉讼',
    strictPlatforms: ['xhs', 'douyin', 'shipinhao'],
    loosePlatforms: ['kuaishou'],
  },

  // 医美全类目
  {
    keyword: '医美',
    variants: ['医美', '整容', '整形', '微整形', '整形手术'],
    level: 'restricted',
    reason: '医美推广需资质，不同平台政策不同',
    riskNote: '无资质推广医美项目违法',
    strictPlatforms: ['xhs', 'douyin', 'shipinhao'],
    loosePlatforms: ['kuaishou'],
  },
  {
    keyword: '玻尿酸',
    variants: ['玻尿酸', '肉毒素', '胶原蛋白注射'],
    level: 'restricted',
    reason: '医美注射类产品需资质',
    riskNote: '违规推广可能面临平台处罚',
    strictPlatforms: ['xhs', 'douyin'],
    loosePlatforms: ['kuaishou', 'shipinhao'],
  },

  // 风水占卜类
  {
    keyword: '风水',
    variants: ['风水', '算命', '占卜', '看相', '八字算命', '起名'],
    level: 'blocked',
    reason: '封建迷信内容违规',
    riskNote: '违反《广告法》，可能面临平台封禁',
    strictPlatforms: ['xhs', 'douyin', 'kuaishou', 'shipinhao'],
    loosePlatforms: [],
  },

  // 违法内容
  {
    keyword: '野生动物',
    variants: ['野生动物', '野味', '保护动物制品'],
    level: 'blocked',
    reason: '违法内容，触碰法律红线',
    riskNote: '可能面临刑事责任',
    strictPlatforms: ['xhs', 'douyin', 'kuaishou', 'shipinhao'],
    loosePlatforms: [],
  },

  // 减肥类（非药品但相关）
  {
    keyword: '减肥茶',
    variants: ['减肥茶', '瘦身茶', '代餐粉', '减肥奶昔'],
    level: 'warning',
    reason: '食品类减肥产品，虚假宣传风险高',
    riskNote: '效果夸大可能违反《广告法》',
    strictPlatforms: ['xhs', 'douyin'],
    loosePlatforms: ['kuaishou', 'shipinhao'],
  },
  {
    keyword: '瘦身',
    variants: ['瘦身', '减肥', '减脂', '燃脂'],
    level: 'warning',
    reason: '减肥类泛词，需结合上下文判断',
    riskNote: '可能触发平台审核',
    strictPlatforms: ['xhs', 'douyin'],
    loosePlatforms: ['kuaishou', 'shipinhao'],
  },

  // 美容仪类
  {
    keyword: '美容仪',
    variants: ['美容仪', '射频仪', '洁面仪', '脱毛仪'],
    level: 'warning',
    reason: '家用美容仪需有资质认证',
    riskNote: '无资质推广可能面临平台处罚',
    strictPlatforms: ['xhs', 'douyin'],
    loosePlatforms: ['kuaishou', 'shipinhao'],
  },
];

// ============== 平台名称映射 ==============

const PLATFORM_NAMES: Record<PlatformId, string> = {
  xhs: '小红书',
  kuaishou: '快手',
  douyin: '抖音',
  shipinhao: '视频号',
  generic: '通用',
};

// ============== 辅助函数 ==============

/**
 * 标准化文本（去除空格、转小写）
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '').trim();
}

/**
 * 检查关键词是否匹配
 */
function matchKeyword(input: string, keyword: BlacklistKeyword): boolean {
  const normalizedInput = normalizeText(input);

  // 检查主关键词
  if (normalizedInput.includes(normalizeText(keyword.keyword))) {
    return true;
  }

  // 检查变体
  for (const variant of keyword.variants) {
    if (normalizedInput.includes(normalizeText(variant))) {
      return true;
    }
  }

  return false;
}

/**
 * 获取匹配关键词的违规信息
 */
function getMatchedRule(
  input: string
): BlacklistKeyword | null {
  const normalizedInput = normalizeText(input);

  for (const keyword of BLACKLIST_KEYWORDS) {
    if (matchKeyword(normalizedInput, keyword)) {
      return keyword;
    }
  }

  return null;
}

// ============== 核心检测函数 ==============

/**
 * 检测关键词是否为黑五类
 *
 * @param keyword 用户输入的关键词
 * @returns 是否为黑五类
 */
export function isBlacklisted(keyword: string): boolean {
  return getMatchedRule(keyword) !== null;
}

/**
 * 获取黑五类违规信息
 *
 * @param keyword 用户输入的关键词
 * @returns 违规信息，如果非黑五类返回null
 */
export function getBlacklistInfo(keyword: string): BlacklistKeyword | null {
  return getMatchedRule(keyword);
}

/**
 * 获取针对特定平台的黑五类警告
 *
 * @param keyword 用户输入的关键词
 * @param platformIds 目标平台列表
 * @returns 各平台的黑五类警告
 */
export function getPlatformWarnings(
  keyword: string,
  platformIds: PlatformId[]
): PlatformBlacklistWarning[] {
  const matchedRule = getMatchedRule(keyword);

  if (!matchedRule) {
    return [];
  }

  const warnings: PlatformBlacklistWarning[] = [];

  for (const platformId of platformIds) {
    const isStrict = matchedRule.strictPlatforms.includes(platformId);
    const isLoose = matchedRule.loosePlatforms.includes(platformId);

    if (isStrict) {
      // 严格平台：blocked
      warnings.push({
        platformId,
        platformName: PLATFORM_NAMES[platformId],
        level: matchedRule.level,
        message: `⚠️ 【${PLATFORM_NAMES[platformId]}禁推】${matchedRule.keyword}属于${matchedRule.reason}，违规推广面临风险`,
        reason: matchedRule.reason,
      });
    } else if (isLoose) {
      // 相对宽松平台：warning
      warnings.push({
        platformId,
        platformName: PLATFORM_NAMES[platformId],
        level: 'warning',
        message: `⚡ 【${PLATFORM_NAMES[platformId]}注意】${matchedRule.keyword}需资质，建议谨慎推广`,
        reason: matchedRule.reason,
      });
    }
  }

  return warnings;
}

/**
 * 获取所有黑五类关键词列表（用于UI展示）
 */
export function getAllBlacklistKeywords(): { keyword: string; level: BlacklistLevel; reason: string }[] {
  return BLACKLIST_KEYWORDS.map((k) => ({
    keyword: k.keyword,
    level: k.level,
    reason: k.reason,
  }));
}

/**
 * 获取平台的黑五类规则
 *
 * @param platformId 平台ID
 * @returns 该平台的黑五类规则
 */
export function getPlatformBlacklistRules(platformId: PlatformId): BlacklistRule[] {
  const rules: BlacklistRule[] = [];

  for (const keyword of BLACKLIST_KEYWORDS) {
    const isStrict = keyword.strictPlatforms.includes(platformId);
    const isLoose = keyword.loosePlatforms.includes(platformId);

    if (isStrict || isLoose) {
      rules.push({
        id: `rule-${keyword.keyword}`,
        keyword: keyword.keyword,
        level: keyword.level,
        reason: keyword.reason,
        riskNote: keyword.riskNote,
        applicablePlatforms: [platformId],
      });
    }
  }

  return rules;
}

// ============== UI组件辅助 ==============

/**
 * 生成警告消息文本（用于显示）
 */
export function formatWarningMessage(warnings: PlatformBlacklistWarning[]): string {
  if (warnings.length === 0) {
    return '';
  }

  const lines = ['🚨 黑五类关键词检测警告\n'];

  for (const warning of warnings) {
    const emoji = warning.level === 'blocked' ? '⛔' : '⚡';
    lines.push(`${emoji} ${warning.platformName}：${warning.message}\n`);
  }

  lines.push('\n💡 建议：选择非黑五类关键词，或确保具备相关推广资质');

  return lines.join('');
}

/**
 * 检查关键词是否需要警告（非完全禁止）
 */
export function needsWarning(keyword: string, platformId: PlatformId): boolean {
  const matchedRule = getMatchedRule(keyword);
  if (!matchedRule) return false;

  return (
    matchedRule.strictPlatforms.includes(platformId) ||
    matchedRule.loosePlatforms.includes(platformId)
  );
}