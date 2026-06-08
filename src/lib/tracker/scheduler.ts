/**
 * 跟踪模块 - 定时刷新调度
 *
 * 功能：
 * - 管理定时刷新任务
 * - 支持按项目设置刷新间隔
 * - 支持暂停/恢复刷新
 */

import type { TrackerItem } from '../platforms/types';

// ============== 配置 ==============

/** 刷新间隔选项（毫秒） */
export const REFRESH_INTERVALS = {
  '1小时': 60 * 60 * 1000,
  '3小时': 3 * 60 * 60 * 1000,
  '6小时': 6 * 60 * 60 * 1000,
  '12小时': 12 * 60 * 60 * 1000,
  '24小时': 24 * 60 * 60 * 1000,
} as const;

export type RefreshIntervalKey = keyof typeof REFRESH_INTERVALS;

/** 刷新任务状态 */
export type SchedulerStatus = 'idle' | 'running' | 'paused';

// ============== 调度器状态 ==============

interface SchedulerState {
  status: SchedulerStatus;
  lastRun: number | null;
  nextRun: number | null;
  tasks: Map<string, NodeJS.Timeout>;
}

/** 调度器单例 */
let schedulerState: SchedulerState = {
  status: 'idle',
  lastRun: null,
  nextRun: null,
  tasks: new Map(),
};

// ============== 调度器操作 ==============

/**
 * 启动调度器
 */
export function startScheduler(
  onRefresh: (trackerId: string) => Promise<void>
): void {
  if (schedulerState.status === 'running') {
    console.warn('调度器已在运行中');
    return;
  }

  schedulerState.status = 'running';
  console.log('✅ 调度器已启动');
}

/**
 * 停止调度器
 */
export function stopScheduler(): void {
  // 清除所有定时任务
  schedulerState.tasks.forEach((timeout) => {
    clearTimeout(timeout);
  });
  schedulerState.tasks.clear();

  schedulerState.status = 'idle';
  schedulerState.nextRun = null;

  console.log('⏹️ 调度器已停止');
}

/**
 * 暂停调度器
 */
export function pauseScheduler(): void {
  schedulerState.status = 'paused';
  console.log('⏸️ 调度器已暂停');
}

/**
 * 恢复调度器
 */
export function resumeScheduler(): void {
  schedulerState.status = 'running';
  console.log('▶️ 调度器已恢复');
}

/**
 * 获取调度器状态
 */
export function getSchedulerStatus(): SchedulerStatus {
  return schedulerState.status;
}

// ============== 任务管理 ==============

/**
 * 添加刷新任务
 */
export function addRefreshTask(
  trackerId: string,
  interval: RefreshIntervalKey,
  onRefresh: () => Promise<void>
): void {
  // 如果已有该任务，先清除
  if (schedulerState.tasks.has(trackerId)) {
    clearRefreshTask(trackerId);
  }

  // 创建定时任务
  const intervalMs = REFRESH_INTERVALS[interval];
  const timeout = setInterval(async () => {
    if (schedulerState.status === 'running') {
      try {
        await onRefresh();
        schedulerState.lastRun = Date.now();
      } catch (error) {
        console.error(`刷新任务失败: ${trackerId}`, error);
      }
    }
  }, intervalMs);

  schedulerState.tasks.set(trackerId, timeout);
  console.log(`📅 已添加刷新任务: ${trackerId}, 间隔: ${interval}`);
}

/**
 * 清除刷新任务
 */
export function clearRefreshTask(trackerId: string): void {
  const timeout = schedulerState.tasks.get(trackerId);
  if (timeout) {
    clearInterval(timeout);
    schedulerState.tasks.delete(trackerId);
    console.log(`🗑️ 已清除刷新任务: ${trackerId}`);
  }
}

/**
 * 更新刷新间隔
 */
export function updateRefreshInterval(
  trackerId: string,
  newInterval: RefreshIntervalKey,
  onRefresh: () => Promise<void>
): void {
  clearRefreshTask(trackerId);
  addRefreshTask(trackerId, newInterval, onRefresh);
}

/**
 * 获取所有活跃任务数
 */
export function getActiveTaskCount(): number {
  return schedulerState.tasks.size;
}

// ============== 手动刷新 ==============

/**
 * 手动触发刷新
 */
export async function triggerManualRefresh(
  trackerId: string,
  onRefresh: () => Promise<void>
): Promise<boolean> {
  try {
    await onRefresh();
    schedulerState.lastRun = Date.now();
    return true;
  } catch (error) {
    console.error(`手动刷新失败: ${trackerId}`, error);
    return false;
  }
}

// ============== 统计 ==============

/**
 * 获取调度器统计信息
 */
export function getSchedulerStats(): {
  status: SchedulerStatus;
  activeTasks: number;
  lastRun: number | null;
  nextRun: number | null;
} {
  return {
    status: schedulerState.status,
    activeTasks: schedulerState.tasks.size,
    lastRun: schedulerState.lastRun,
    nextRun: schedulerState.nextRun,
  };
}