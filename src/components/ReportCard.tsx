/**
 * 选品报告展示组件
 *
 * 显示6板块结构化报告：
 * - 市场概况
 * - 全平台蓝海对比
 * - 各平台爆款潜力
 * - 选品建议
 * - 平台推荐优先级
 * - 行动建议
 */

'use client';

import type { PickReport, PlatformId } from '@/lib/platforms/types';
import { PLATFORM_NAMES, PLATFORM_ICONS } from '@/lib/platforms';

interface ReportCardProps {
  report: PickReport;
  onAddToTracker?: () => void;
}

export default function ReportCard({ report, onAddToTracker }: ReportCardProps) {
  // 星级渲染
  const renderStars = (score: number, max: number = 5) => {
    const stars = Math.round(score);
    return (
      <div className="flex items-center gap-1">
        {[...Array(max)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < stars ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">({score}/{max})</span>
      </div>
    );
  };

  // 蓝海评分渲染（1-10分）
  const renderBlueOceanScore = (score: number) => {
    const color =
      score >= 8 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
    return (
      <span className={`font-bold ${color}`}>{score}/10</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 报告头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 选品分析报告：{report.market.keyword}
          </h2>
          <p className="text-gray-500 mt-1">
            品类：{report.market.category} · 分析时间：{new Date(report.generatedAt).toLocaleString('zh-CN')}
          </p>
        </div>
        <button
          onClick={onAddToTracker}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
        >
          <span>📌</span>
          加入跟踪列表
        </button>
      </div>

      {/* 1. 市场概况 */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span> 市场概况
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(report.market.totalContentCount).map(([platform, count]) => (
            <div key={platform} className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">{PLATFORM_ICONS[platform as PlatformId]}</div>
              <div className="text-sm text-gray-500">{PLATFORM_NAMES[platform as PlatformId]}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-400">内容数</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 全平台蓝海对比 */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🌊</span> 全平台蓝海对比
        </h3>
        <div className="space-y-3">
          {report.blueOceanCompare
            .sort((a, b) => b.blueOceanScore - a.blueOceanScore)
            .map((item) => (
              <div
                key={item.platformId}
                className="bg-white rounded-lg p-4 flex items-center gap-4"
              >
                <div className="text-2xl">{PLATFORM_ICONS[item.platformId]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{item.platformName}</span>
                    <span className="text-sm text-gray-500">
                      竞争度：
                      <span
                        className={
                          item.competitionLevel === '低'
                            ? 'text-green-600'
                            : item.competitionLevel === '中'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {item.competitionLevel}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span>蓝海评分：{renderBlueOceanScore(item.blueOceanScore)}</span>
                    <span className="text-sm text-gray-500">
                      供需比：{item.supplyDemandRatio.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 3. 各平台爆款潜力 */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span> 各平台爆款潜力
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.viralPotential.map((item) => (
            <div key={item.platformId} className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{PLATFORM_ICONS[item.platformId]}</span>
                  <span className="font-semibold">{item.platformName}</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {item.viralScore}/10
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                低粉爆款案例：{item.lowFollowerViralCount}个
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {item.viralFeatures.map((feature, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">{item.suggestion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 选品建议 */}
      <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> 选品建议
        </h3>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-600">推荐指数</span>
            {renderStars(report.suggestion.recommendScore)}
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-700">建议方向：</span>
              <span className="text-gray-600">{report.suggestion.direction}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">适合人群：</span>
              <span className="text-gray-600">{report.suggestion.targetAudience}</span>
            </div>
            {report.suggestion.expectedReturn && (
              <div>
                <span className="font-semibold text-gray-700">预期收益：</span>
                <span className="text-green-600 font-semibold">
                  {report.suggestion.expectedReturn}
                </span>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">注意事项：</span>
              <ul className="mt-1 space-y-1">
                {report.suggestion.cautions.map((caution, i) => (
                  <li key={i} className="text-gray-600 flex items-start gap-2">
                    <span className="text-orange-500">⚠️</span>
                    {caution}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 平台推荐优先级 */}
      <section className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span> 平台推荐优先级
        </h3>
        <div className="space-y-3">
          {report.platformPriority
            .sort((a, b) => a.priority - b.priority)
            .map((item) => (
              <div
                key={item.platformId}
                className="bg-white rounded-lg p-4 flex items-start gap-4"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    item.priority === 1
                      ? 'bg-yellow-500'
                      : item.priority === 2
                      ? 'bg-gray-400'
                      : item.priority === 3
                      ? 'bg-orange-400'
                      : 'bg-gray-300'
                  }`}
                >
                  {item.priority}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{PLATFORM_ICONS[item.platformId]}</span>
                    <span className="font-semibold">{item.platformName}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.suitableFeatures.map((feature, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 6. 行动建议 */}
      <section className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span> 行动建议
        </h3>
        <div className="space-y-4">
          {report.actions.map((action) => (
            <div
              key={action.order}
              className="bg-white rounded-lg p-4 flex items-start gap-4"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  action.priority === '高'
                    ? 'bg-red-500'
                    : action.priority === '中'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
              >
                {action.order}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{action.action}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      action.priority === '高'
                        ? 'bg-red-100 text-red-700'
                        : action.priority === '中'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {action.priority}优先级
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">步骤：</span>
                  <ol className="mt-1 space-y-1 list-decimal list-inside">
                    {action.steps.map((step, i) => (
                      <li key={i} className="text-gray-600 text-sm">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  ✅ 预期结果：{action.expectedResult}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}