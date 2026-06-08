/**
 * 选品跟踪详情页
 *
 * 功能：
 * - 跨平台数据趋势图
 * - 各平台生命周期状态
 * - 数据变化对比
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TrackerItem, PlatformId, PlatformSnapshot, LifeCycleStage } from '@/lib/platforms/types';
import { PLATFORM_NAMES, PLATFORM_ICONS } from '@/lib/platforms';
import { getTrackerItems, updateTrackerItem } from '@/lib/tracker/store';

const LIFECYCLE_COLORS: Record<LifeCycleStage, string> = {
  '上升期': 'bg-green-100 text-green-700 border-green-300',
  '爆发期': 'bg-red-100 text-red-700 border-red-300',
  '稳定期': 'bg-blue-100 text-blue-700 border-blue-300',
  '衰退期': 'bg-gray-100 text-gray-500 border-gray-300',
};

export default function TrackerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<TrackerItem | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);

  useEffect(() => {
    const found = getTrackerItems().find((i) => i.id === id) || null;
    setItem(found);
    if (found?.platforms[0]) setSelectedPlatform(found.platforms[0]);
  }, [id]);

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto text-center py-16">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  const handleStatusChange = (status: TrackerItem['status']) => {
    updateTrackerItem(id, { status });
    setItem({ ...item, status });
  };

  const handleCycleChange = (cycle: LifeCycleStage) => {
    updateTrackerItem(id, { lifeCycle: cycle });
    setItem({ ...item, lifeCycle: cycle });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/tracker" className="text-sm text-gray-500 hover:text-gray-700">
          ← 返回跟踪列表
        </Link>
        <span className="text-xs text-gray-400">
          更新于 {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* 标题 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{item.keyword}</h1>
          <span className="text-sm text-gray-400">{item.category}</span>
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${LIFECYCLE_COLORS[item.lifeCycle]}`}>
            {item.lifeCycle}
          </span>
        </div>

        {/* 平台标签 */}
        <div className="flex items-center gap-3">
          {item.platforms.map((p) => (
            <span key={p} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              {PLATFORM_ICONS[p]} {PLATFORM_NAMES[p]}
            </span>
          ))}
        </div>

        {/* 快捷操作 */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
          <span className="text-sm text-gray-500">状态：</span>
          {(['active', 'paused', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                item.status === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'active' ? '测品中' : s === 'paused' ? '暂停' : '归档'}
            </button>
          ))}
          <span className="text-sm text-gray-500 ml-4">周期：</span>
          {(['上升期', '爆发期', '稳定期', '衰退期'] as LifeCycleStage[]).map((c) => (
            <button
              key={c}
              onClick={() => handleCycleChange(c)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                item.lifeCycle === c
                  ? LIFECYCLE_COLORS[c]
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 平台切换 Tab */}
      <div className="flex gap-2 mb-4">
        {item.platforms.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPlatform(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPlatform === p
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {PLATFORM_ICONS[p]} {PLATFORM_NAMES[p]}
          </button>
        ))}
      </div>

      {/* 平台数据详情 */}
      {selectedPlatform && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {PLATFORM_ICONS[selectedPlatform]} {PLATFORM_NAMES[selectedPlatform]} 数据
          </h2>
          {(() => {
            const snap = item.snapshots[selectedPlatform];
            if (!snap) {
              return <p className="text-gray-400">暂无数据快照</p>;
            }
            return (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">内容数</div>
                  <div className="text-xl font-bold text-gray-900">{snap.contentCount || 0}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">互动量</div>
                  <div className="text-xl font-bold text-gray-900">{(snap.totalEngagement || 0).toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">搜索指数</div>
                  <div className="text-xl font-bold text-gray-900">{snap.searchIndex || '-'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">更新时间</div>
                  <div className="text-sm font-medium text-gray-700">
                    {snap.timestamp ? new Date(snap.timestamp).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 全平台概览 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">全平台数据对比</h2>
        <div className="space-y-3">
          {item.platforms.map((p) => {
            const snap = item.snapshots[p];
            return (
              <div key={p} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="w-20 text-sm font-medium text-gray-700">
                  {PLATFORM_ICONS[p]} {PLATFORM_NAMES[p]}
                </span>
                <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">笔记：</span>
                    <span className="text-gray-700">{snap?.contentCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">互动：</span>
                    <span className="text-gray-700">{(snap?.totalEngagement || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">指数：</span>
                    <span className="text-gray-700">{snap?.searchIndex || '-'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}