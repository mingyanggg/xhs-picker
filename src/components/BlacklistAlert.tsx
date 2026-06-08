/**
 * 黑五类警告组件
 *
 * 显示跨平台黑五类警告信息
 */

'use client';

import { useState } from 'react';
import type { PlatformBlacklistWarning } from '@/lib/platforms/types';

interface BlacklistAlertProps {
  warnings: PlatformBlacklistWarning[];
  onDismiss?: () => void;
}

export default function BlacklistAlert({ warnings, onDismiss }: BlacklistAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || warnings.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // 按level分组
  const blockedWarnings = warnings.filter((w) => w.level === 'blocked');
  const restrictedWarnings = warnings.filter((w) => w.level === 'restricted');
  const warningWarnings = warnings.filter((w) => w.level === 'warning');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 标题栏 */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h2 className="text-xl font-bold text-white">黑五类关键词警告</h2>
                <p className="text-red-100 text-sm">该关键词涉及违规品类</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* 警告内容 */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 严格禁止的平台 */}
          {blockedWarnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <span className="text-xl">⛔</span>
                严格禁推平台（违规推广面临法律风险）
              </h3>
              {blockedWarnings.map((warning) => (
                <div
                  key={warning.platformId}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚫</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">
                        {warning.platformName}
                      </h4>
                      <p className="text-red-700 text-sm mt-1">
                        {warning.message}
                      </p>
                      <p className="text-red-600 text-xs mt-2">
                        原因：{warning.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 限制推广的平台 */}
          {restrictedWarnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                限制推广平台（需要资质）
              </h3>
              {restrictedWarnings.map((warning) => (
                <div
                  key={warning.platformId}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-800">
                        {warning.platformName}
                      </h4>
                      <p className="text-orange-700 text-sm mt-1">
                        {warning.message}
                      </p>
                      <p className="text-orange-600 text-xs mt-2">
                        原因：{warning.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 需要注意的平台 */}
          {warningWarnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">
                <span className="text-xl">💡</span>
                需要注意的平台
              </h3>
              {warningWarnings.map((warning) => (
                <div
                  key={warning.platformId}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📢</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">
                        {warning.platformName}
                      </h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        {warning.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 建议 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <span>💡</span> 建议
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• 选择非黑五类关键词进行选品分析</li>
              <li>• 如已获得相关推广资质，可在对应平台合规推广</li>
              <li>• 建议优先考虑严格禁推平台之外的替代品</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              我知道了
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              仍要继续分析
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}