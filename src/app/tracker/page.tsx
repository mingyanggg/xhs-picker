/**
 * 选品跟踪列表页
 *
 * 功能：
 * - 漏斗池视图（active/paused/archived）
 * - 跨平台数据概览
 * - 生命周期状态追踪
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { TrackerItem, LifeCycleStage, PlatformId } from '@/lib/platforms/types';
import { PLATFORM_NAMES, PLATFORM_ICONS } from '@/lib/platforms';
import { getTrackerItems, addTrackerItem, deleteTrackerItem, updateTrackerItem } from '@/lib/tracker/store';

const LIFECYCLE_COLORS: Record<LifeCycleStage, string> = {
  '上升期': 'bg-green-100 text-green-700',
  '爆发期': 'bg-red-100 text-red-700',
  '稳定期': 'bg-blue-100 text-blue-700',
  '衰退期': 'bg-gray-100 text-gray-500',
};

const STATUS_TABS = [
  { id: 'all', label: '全部' },
  { id: 'active', label: '测品中' },
  { id: 'paused', label: '暂停' },
  { id: 'archived', label: '已归档' },
] as const;

export default function TrackerPage() {
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setItems(getTrackerItems());
  }, []);

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const handleArchive = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      updateTrackerItem(id, { status: item.status === 'archived' ? 'active' : 'archived' });
      setItems(getTrackerItems());
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除该跟踪项？')) {
      deleteTrackerItem(id);
      setItems(getTrackerItems());
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📌 选品跟踪</h1>
          <p className="text-sm text-gray-500 mt-1">跟踪已选品的跨平台数据变化</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
        >
          ← 返回分析
        </Link>
      </div>

      {/* 状态 Tab */}
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className="ml-1 text-xs opacity-70">
                ({items.filter((i) => i.status === tab.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['上升期', '爆发期', '稳定期', '衰退期'] as LifeCycleStage[]).map((stage) => {
          const count = items.filter((i) => i.lifeCycle === stage && i.status === 'active').length;
          return (
            <div key={stage} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className={`text-xs font-medium px-2 py-1 rounded ${LIFECYCLE_COLORS[stage]} inline-block mb-2`}>
                {stage}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-400">个品</div>
            </div>
          );
        })}
      </div>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <span className="text-5xl mb-4 block">📦</span>
          <p className="text-gray-500">
            {filter === 'all' ? '暂无跟踪项' : `没有${STATUS_TABS.find((t) => t.id === filter)?.label}的品`}
          </p>
          <p className="text-sm text-gray-400 mt-1">在分析报告中点击「加入跟踪」即可添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border hover:border-orange-200 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 标题行 */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${LIFECYCLE_COLORS[item.lifeCycle]}`}>
                      {item.lifeCycle}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'active' ? 'bg-green-50 text-green-600' :
                      item.status === 'paused' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {item.status === 'active' ? '测品中' : item.status === 'paused' ? '暂停' : '已归档'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.keyword}</span>
                    <span className="text-xs text-gray-400">{item.category}</span>
                  </div>

                  {/* 平台标签 */}
                  <div className="flex items-center gap-2 mb-3">
                    {item.platforms.map((p) => (
                      <span key={p} className="text-sm text-gray-500">
                        {PLATFORM_ICONS[p]} {PLATFORM_NAMES[p]}
                      </span>
                    ))}
                  </div>

                  {/*平台数据快照 */}
                  <div className="grid grid-cols-5 gap-2">
                    {item.platforms.map((p) => {
                      const snap = item.snapshots[p];
                      return (
                        <div key={p} className="text-xs text-gray-500">
                          <span className="mr-1">{PLATFORM_ICONS[p]}</span>
                          {snap ? (
                            <>
    <span className="text-gray-700">笔记{snap.contentCount || 0}</span>
                              <span className="mx-1 text-gray-300">|</span>
                              <span className="text-gray-700">互动{(snap.totalEngagement || 0).toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">暂无数据</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/tracker/${item.id}`}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-sm transition-colors"
                  >
                    详情 →
                  </Link>
                  <button
                    onClick={() => handleArchive(item.id)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-sm transition-colors"
                  >
                    {item.status === 'archived' ? '恢复' : '归档'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}