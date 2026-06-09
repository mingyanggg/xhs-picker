/**
 * 选品分析 API
 *
 * POST /api/analyze
 *
 * 请求体：
 * {
 *   keyword: string;          // 关键词
 *   category: Category;        // 品类
 *   platforms: PlatformId[];   // 目标平台
 *   scrapedData?: ContentItem[]; // 可选：已提取的真实数据
 * }
 *
 * 响应：
 * {
 *   report: PickReport;
 *   isBlacklisted: boolean;
 *   blacklistWarnings: PlatformBlacklistWarning[];
 *   scrapeStatus: Record<PlatformId, ScrapeStatus>;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  PlatformId,
  Category,
  ScrapedData,
} from '@/lib/platforms/types';
import { analyze, generateMockReport } from '@/lib/analyzer';
import { isBlacklisted, getPlatformWarnings } from '@/lib/blacklist';
import { getPlatform, scrapeAllPlatforms, PLATFORM_NAMES } from '@/lib/platforms/server/platforms';

// 有效的品类列表
const VALID_CATEGORIES: Category[] = [
  '实物商品',
  '功能性半标品',
  '虚拟产品',
  '知识付费',
  '大牌平替',
  '新奇特',
  '周期性',
  '男性蓝海',
  '高客单蓝海',
];

// 有效的平台列表（v3 只保留小红书）
const VALID_PLATFORMS: PlatformId[] = ['xhs', 'source-1688', 'source-pdd', 'source-taobao', 'generic'];

/**
 * 验证请求参数
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body.keyword || typeof body.keyword !== 'string') {
    return { valid: false, error: 'keyword 是必填项，类型为字符串' };
  }

  if (body.keyword.trim().length === 0) {
    return { valid: false, error: 'keyword 不能为空' };
  }

  if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
    return {
      valid: false,
      error: `category 必须是以下之一：${VALID_CATEGORIES.join('、')}`,
    };
  }

  if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
    return { valid: false, error: 'platforms 是必填项，至少选择一个平台' };
  }

  for (const platform of body.platforms) {
    if (!VALID_PLATFORMS.includes(platform)) {
      return {
        valid: false,
        error: `platforms 包含无效的平台：${platform}，有效值为：${VALID_PLATFORMS.join('、')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * POST /api/analyze
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json() as AnalyzeRequest;

    // 验证参数
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { keyword, category, platforms, scrapedData } = body;

    // 黑五类检测
    const blacklistCheck = isBlacklisted(keyword);
    let blacklistWarnings: any[] = [];

    if (blacklistCheck) {
      blacklistWarnings = getPlatformWarnings(keyword, platforms);
    }

    // 抓取各平台数据（如果有传入数据则跳过抓取）
    let scrapedDataList: ScrapedData[];
    let scrapeStatus: Record<PlatformId, string> = {} as any;

    if (scrapedData && scrapedData.length > 0) {
      // 使用传入的真实数据
      console.log(`使用传入的真实数据：${scrapedData.length} 条笔记`);
      scrapedDataList = [{
        status: 'success',
        keyword,
        platformId: 'xhs',
        contents: scrapedData,
        products: [],
        blueOceanRatio: scrapedData.length > 0 ? 1000 / scrapedData.length : 0,
        scrapedAt: Date.now(),
        isManualMode: false,
      }];
      scrapeStatus['xhs'] = 'success';
    } else {
      // 正常抓取各平台数据
      const result = await scrapeAllPlatforms(keyword, category, platforms);
      scrapedDataList = result.scrapedDataList;
      scrapeStatus = result.scrapeStatus;
    }

    // 调用AI分析（如果配置了API Key）
    let report;
    const hasApiKey = !!process.env.DEEPSEEK_API_KEY || !!process.env.ZHIPU_API_KEY;

    if (hasApiKey) {
      try {
        report = await analyze(keyword, category, platforms, scrapedDataList);
      } catch (error) {
        // AI调用失败，生成模拟报告
        console.error('AI分析失败，使用模拟报告：', error);
        report = generateMockReport(keyword, category, platforms);
      }
    } else {
      // 无API Key，使用模拟报告
      console.log('未配置 DEEPSEEK_API_KEY，使用模拟报告');
      report = generateMockReport(keyword, category, platforms);
    }

    // 构建响应
    const response: AnalyzeResponse = {
      report,
      isBlacklisted: blacklistCheck,
      blacklistWarnings,
      scrapeStatus: scrapeStatus as any,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('分析API错误：', error);
    return NextResponse.json(
      {
        error: '分析失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze - 健康检查
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '选品分析API运行中',
    endpoints: {
      POST: '/api/analyze',
      body: {
        keyword: 'string（必填）',
        category: 'string（必填，9大品类之一）',
        platforms: 'string[]（必填，至少一个平台）',
      },
    },
    validCategories: VALID_CATEGORIES,
    validPlatforms: VALID_PLATFORMS,
    platformNames: PLATFORM_NAMES,
  });
}