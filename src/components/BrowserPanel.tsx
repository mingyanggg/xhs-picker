/**
 * 内置浏览器面板组件
 *
 * 功能：
 * - 提供嵌入的浏览器窗口
 * - 支持用户登录各平台及第三方数据平台
 * - 通过 Tauri CDP 协议读取页面数据
 */

'use client';

import { useState } from 'react';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

interface BrowserPanelProps {
  onExtract?: () => void;
  isExtracting?: boolean;
  extractStatus?: string | null;
  extractedCount?: number;
}

export default function BrowserPanel({
  onExtract,
  isExtracting = false,
  extractStatus,
  extractedCount = 0,
}: BrowserPanelProps) {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'default', title: '新标签页', url: '', isLoading: false },
  ]);
  const [activeTabId, setActiveTabId] = useState('default');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleNavigate = (url: string) => {
    if (!url) return;

    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    setIsNavigating(true);
    setCurrentUrl(fullUrl);

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, url: fullUrl, title: fullUrl, isLoading: true }
          : tab
      )
    );

    setTimeout(() => {
      setIsNavigating(false);
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, isLoading: false } : tab
        )
      );
    }, 1500);
  };

  const handleNewTab = () => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: '新标签页',
      url: '',
      isLoading: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setCurrentUrl('');
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length === 1) return;

    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
      return newTabs;
    });
  };

  const quickUrls = [
    { name: '小红书', url: 'https://www.xiaohongshu.com/explore' },
    { name: '抖音', url: 'https://www.douyin.com/discover' },
    { name: '快手', url: 'https://www.kuaishou.com' },
    { name: '千瓜', url: 'https://www.qianhua.io' },
    { name: '灰豚', url: 'https://www.huitun.com' },
    { name: '蝉妈妈', url: 'https://www.chanmm.com' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* 标签栏 */}
      <div className="flex items-center bg-gray-200 px-2 py-1 gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-t-lg cursor-pointer min-w-[120px] max-w-[200px] ${
              tab.id === activeTabId ? 'bg-white' : 'bg-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="text-sm truncate flex-1">{tab.title || '新标签页'}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(tab.id);
                }}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleNewTab}
          className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-lg"
        >
          +
        </button>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 border-b">
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleNavigate(currentUrl);
            }
          }}
          placeholder="输入网址..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          onClick={() => handleNavigate(currentUrl)}
          disabled={isNavigating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isNavigating ? '加载中...' : '前往'}
        </button>

        {/* 提取数据按钮 */}
        <button
          onClick={onExtract}
          disabled={isExtracting || !activeTab?.url}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="提取当前页面数据用于AI分析"
        >
          {isExtracting ? (
            <>
              <span className="animate-spin">⏳</span>
              提取中...
            </>
          ) : (
            <>
              📊 提取数据
              {extractedCount > 0 && (
                <span className="bg-white text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                  {extractedCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* 提取状态提示 */}
      {extractStatus && (
        <div className={`px-4 py-2 text-sm ${
          extractStatus.includes('✅') ? 'bg-green-100 text-green-800' :
          extractStatus.includes('❌') ? 'bg-red-100 text-red-800' :
          extractStatus.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {extractStatus}
        </div>
      )}

      {/* 快捷入口 */}
      <div className="flex items-center gap-2 p-2 bg-white border-b overflow-x-auto">
        <span className="text-sm text-gray-500 whitespace-nowrap">快捷入口：</span>
        {quickUrls.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigate(item.url)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm whitespace-nowrap"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* 浏览器内容区 */}
      <div className="flex-1 bg-white relative">
        {activeTab?.url ? (
          <iframe
            src={activeTab.url}
            className="w-full h-full border-0"
            title={activeTab.title}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-6xl mb-4">🌐</span>
            <p className="text-lg">输入网址开始浏览</p>
            <p className="text-sm mt-2">或使用上方快捷入口登录数据平台</p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md text-center">
              <p className="text-blue-700 text-sm">
                💡 使用方法：先在浏览器中登录小红书 → 搜索关键词 → 点击「提取数据」
              </p>
            </div>
          </div>
        )}

        {/* 加载指示器 */}
        {isNavigating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-2 text-gray-600">加载中...</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        💡 提示：在内置浏览器中登录小红书后，搜索关键词并点击「提取数据」读取真实笔记
      </div>
    </div>
  );
}
