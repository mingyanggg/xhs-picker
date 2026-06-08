/**
 * 跟踪模块 - 数据存储
 *
 * 功能：
 * - 跟踪列表管理
 * - 跨平台数据快照存储
 * - 历史数据记录
 *
 * 使用 SQLite 本地存储
 */

import type {
  TrackerItem,
  PlatformId,
  Category,
  LifeCycleStage,
  PlatformSnapshot,
} from '../platforms/types';

// ============== 存储键 ==============

const STORAGE_KEY = 'xhs-picker-tracker';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `tracker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============== 存储操作 ==============

/**
 * 获取所有跟踪项目
 */
export function getTrackerItems(): TrackerItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * 保存跟踪项目列表
 */
function saveTrackerItems(items: TrackerItem[]): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * 添加跟踪项目
 */
export function addTrackerItem(
  keyword: string,
  category: Category,
  platforms: PlatformId[],
  initialSnapshots?: Record<PlatformId, PlatformSnapshot>
): TrackerItem {
  const items = getTrackerItems();

  const newItem: TrackerItem = {
    id: generateId(),
    keyword,
    category,
    platforms,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lifeCycle: '上升期',
    lifeCycleHistory: [{ stage: '上升期', changedAt: Date.now() }],
    snapshots: initialSnapshots || ({} as Record<PlatformId, PlatformSnapshot>),
    status: 'active',
  };

  items.push(newItem);
  saveTrackerItems(items);

  return newItem;
}

/**
 * 更新跟踪项目
 */
export function updateTrackerItem(
  id: string,
  updates: Partial<TrackerItem>
): TrackerItem | null {
  const items = getTrackerItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) return null;

  const updated = {
    ...items[index],
    ...updates,
    updatedAt: Date.now(),
  };

  items[index] = updated;
  saveTrackerItems(items);

  return updated;
}

/**
 * 删除跟踪项目
 */
export function deleteTrackerItem(id: string): boolean {
  const items = getTrackerItems();
  const filtered = items.filter((item) => item.id !== id);

  if (filtered.length === items.length) return false;

  saveTrackerItems(filtered);
  return true;
}

/**
 * 更新平台快照
 */
export function updateSnapshot(
  trackerId: string,
  platformId: PlatformId,
  snapshot: PlatformSnapshot
): void {
  const item = getTrackerItems().find((i) => i.id === trackerId);
  if (!item) return;

  const updatedSnapshots = {
    ...item.snapshots,
    [platformId]: snapshot,
  };

  updateTrackerItem(trackerId, { snapshots: updatedSnapshots });
}

/**
 * 更新生命周期阶段
 */
export function updateLifeCycle(
  trackerId: string,
  newStage: LifeCycleStage
): void {
  const item = getTrackerItems().find((i) => i.id === trackerId);
  if (!item) return;

  if (item.lifeCycle === newStage) return;

  const history = [
    ...item.lifeCycleHistory,
    { stage: newStage, changedAt: Date.now() },
  ];

  updateTrackerItem(trackerId, {
    lifeCycle: newStage,
    lifeCycleHistory: history,
  });
}

/**
 * 归档跟踪项目
 */
export function archiveTrackerItem(id: string): void {
  updateTrackerItem(id, { status: 'archived' });
}

/**
 * 恢复跟踪项目
 */
export function restoreTrackerItem(id: string): void {
  updateTrackerItem(id, { status: 'active' });
}

/**
 * 获取活跃的跟踪项目
 */
export function getActiveTrackers(): TrackerItem[] {
  return getTrackerItems().filter((item) => item.status === 'active');
}

/**
 * 获取已归档的跟踪项目
 */
export function getArchivedTrackers(): TrackerItem[] {
  return getTrackerItems().filter((item) => item.status === 'archived');
}

/**
 * 统计各生命周期的项目数
 */
export function getLifeCycleStats(): Record<LifeCycleStage, number> {
  const items = getActiveTrackers();

  const stats: Record<LifeCycleStage, number> = {
    '上升期': 0,
    '爆发期': 0,
    '稳定期': 0,
    '衰退期': 0,
  };

  items.forEach((item) => {
    stats[item.lifeCycle]++;
  });

  return stats;
}

// ============== 数据导出 ==============

/**
 * 导出跟踪数据为JSON
 */
export function exportTrackerData(): string {
  const items = getTrackerItems();
  return JSON.stringify(items, null, 2);
}

/**
 * 导入跟踪数据
 */
export function importTrackerData(jsonString: string): boolean {
  try {
    const items = JSON.parse(jsonString);
    if (!Array.isArray(items)) return false;

    // 验证数据结构
    for (const item of items) {
      if (!item.id || !item.keyword || !item.category) {
        return false;
      }
    }

    saveTrackerItems(items);
    return true;
  } catch {
    return false;
  }
}