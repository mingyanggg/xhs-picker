/**
 * XHS Picker - 全平台AI选品工具
 * 主界面
 *
 * 功能：
 * - 关键词输入 + 品类选择 + 平台多选
 * - AI选品分析报告展示（6板块）
 * - 内置浏览器窗口（用户登录 → 提取真实数据 → AI分析）
 * - 黑五类警告弹窗
 * - 选品跟踪功能
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type {
  Category,
  PlatformId,
  PickReport,
  PlatformBlacklistWarning,
  ContentItem,
} from '@/lib/platforms/types';
import { PLATFORM_NAMES, PLATFORM_ICONS } from '@/lib/platforms';
import { CATEGORY_OPTIONS } from '@/lib/categories';
import { isBlacklisted, getPlatformWarnings } from '@/lib/blacklist';
import { generateMockReport } from '@/lib/analyzer';
import { addTrackerItem } from '@/lib/tracker/store';
import BlacklistAlert from '@/components/BlacklistAlert';
import ReportCard from '@/components/ReportCard';
import BrowserPanel from '@/components/BrowserPanel';

// 平台选项（v3 只保留小红书）
const PLATFORM_OPTIONS: { id: PlatformId; name: string }[] = [
  { id: 'xhs', name: '小红书' },
];

// ============== 类型 ==============

interface PageData {
  notes: Array<{
    id: string;
    title: string;
    likes: number;
    collects: number;
    comments: number;
    shares: number;
    author: string;
    url: string;
  }>;
  keyword: string;
  url: string;
  error?: string;
}

// ============== 工具函数 ==============

function convertToContentItem(note: PageData['notes'][0]): ContentItem {
  return {
    id: note.id,
    title: note.title,
    url: note.url,
    publishTime: '',
    engagement: {
      likes: note.likes,
      collects: note.collects,
      comments: note.comments,
      shares: note.shares,
      total: note.likes + note.collects + note.comments + note.shares,
    },
    account: {
      id: '',
      name: note.author,
      nickname: note.author,
      avatar: '',
      followers: 0,
      contentCount: 0,
      avgEngagement: 0,
    },
    isLowFollowerViral: false,
  };
}

// ============== 组件 ==============

export default function Home() {
  // 状态 - 分析
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['xhs']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<PickReport | null>(null);
  const [blacklistWarnings, setBlacklistWarnings] = useState<PlatformBlacklistWarning[]>([]);
  const [showBlacklistAlert, setShowBlacklistAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 状态 - 提取
  const [activeTab, setActiveTab] = useState<'analyze' | 'browser' | 'tracker'>('analyze');
  const [extractedData, setExtractedData] = useState<ContentItem[] | null>(null);
  const [extractedKeyword, setExtractedKeyword] = useState('');
  const [extractStatus, setExtractStatus] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // 监听 page-data 事件
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setup = async () => {
      unlisten = await listen<PageData>('page-data', (event) => {
        const data = event.payload;

        if (data.error === 'need_login') {
          setExtractStatus('⚠️ 请先登录小红书，再提取数据');
          setIsExtracting(false);
          return;
        }

        if (data.error) {
          setExtractStatus(`❌ 提取失败: ${data.error}`);
          setIsExtracting(false);
          return;
        }

        if (!data.notes || data.notes.length === 0) {
          setExtractStatus('⚠️ 未找到笔记数据，请确认页面已加载完成');
          setIsExtracting(false);
          return;
        }

        // 转换数据
        const contents = data.notes.map(convertToContentItem);
        const kw = data.keyword || keyword;

        setExtractedData(contents);
        setExtractedKeyword(kw);
        setExtractStatus(`✅ 成功提取 ${contents.length} 条笔记！`);
        setIsExtracting(false);

        // 自动用提取的数据分析
        if (kw) {
          setKeyword(kw);
          const cat = category || '功能性半标品';
          handleAnalyzeWithData(contents, kw, cat as Category);
        }
      });
    };

    setup();
    return () => { unlisten?.(); };
  }, [keyword, category]);

  // 切换平台选择
  const togglePlatform = (platformId: PlatformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        return prev.filter((p) => p !== platformId);
      }
      return [...prev, platformId];
    });
  };

  // 提取页面数据
  const handleExtractData = async () => {
    setIsExtracting(true);
    setExtractStatus('📤 正在提取页面数据...');
    setExtractedData(null);

    try {
      await invoke('extract_page_data');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractStatus(`❌ 调用失败: ${msg}`);
      setIsExtracting(false);
    }
  };

  // 执行分析（传入真实数据）
  const handleAnalyzeWithData = async (
    data: ContentItem[],
    kw: string,
    cat: Category
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: kw,
          category: cat,
          platforms: selectedPlatforms,
          scrapedData: data, // 传入真实数据
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || '分析失败');
      } else {
        setReport(result.report);
      }
    } catch (err) {
      // 网络失败时降级为本地 mock
      setReport(generateMockReport(kw, cat, selectedPlatforms));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 执行分析（无真实数据）
  const handleAnalyze = async () => {
    // 验证输入
    if (!keyword.trim()) {
      setError('请输入关键词');
      return;
    }
    if (!category) {
      setError('请选择品类');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('请选择至少一个平台');
      return;
    }

    // 有提取数据时用提取数据
    if (extractedData && extractedKeyword) {
      await handleAnalyzeWithData(extractedData, extractedKeyword, category as Category);
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setReport(null);

    // 黑五类检测
    if (isBlacklisted(keyword)) {
      const warnings = getPlatformWarnings(keyword, selectedPlatforms);
      setBlacklistWarnings(warnings);
      setShowBlacklistAlert(true);
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          category,
          platforms: selectedPlatforms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '分析失败');
      } else {
        setReport(data.report);
      }
    } catch (err) {
      // 网络失败时降级为本地 mock
      setReport(generateMockReport(keyword.trim(), category as Category, selectedPlatforms));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 添加到跟踪列表
  const handleAddToTracker = () => {
    if (!report) return;
    addTrackerItem(keyword, category as Category, selectedPlatforms);
    alert('已加入跟踪列表');
  };

  // 关闭黑五类警告
  const handleDismissBlacklist = useCallback(() => {
    setShowBlacklistAlert(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 XHS Picker
              </h1>
              <span className="text-sm text-gray-500">全平台AI选品工具</span>
            </div>

            {/* Tab 切换 */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analyze'
                    ? 'bg-white text-orange-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔍 选品分析
              </button>
              <button
                onClick={() => setActiveTab('browser')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'browser'
                    ? 'bg-white text-orange-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🌐 内置浏览器
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'tracker'
                    ? 'bg-white text-orange-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📌 跟踪列表
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'analyze' && (
          <div className="space-y-8">
            {/* 搜索区域 */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📝 输入选品信息</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 关键词输入 */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关键词 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="输入品类关键词，如：防晒霜"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                {/* 品类选择 */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    品类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                  >
                    <option value="">选择品类</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 平台选择 */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标平台 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((platform) => (
                      <label
                        key={platform.id}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={() => togglePlatform(platform.id)}
                          className="accent-orange-500"
                        />
                        <span>{PLATFORM_ICONS[platform.id]}</span>
                        <span className="text-sm">{platform.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 提取状态提示 */}
              {extractStatus && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  extractStatus.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' :
                  extractStatus.includes('❌') ? 'bg-red-50 border border-red-200 text-red-700' :
                  'bg-blue-50 border border-blue-200 text-blue-700'
                }`}>
                  {extractStatus}
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* 分析按钮 */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      分析中...
                    </>
                  ) : (
                    <>
                      🔍 开始分析
                    </>
                  )}
                </button>
              </div>

              {/* 提取数据提示 */}
              {extractedData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    📊 已提取 {extractedData.length} 条真实笔记数据，将用于 AI 分析
                  </p>
                </div>
              )}
            </section>

            {/* 报告区域 */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              {report ? (
                <ReportCard report={report} onAddToTracker={handleAddToTracker} />
              ) : (
                <div className="text-center py-16">
                  <span className="text-6xl mb-4 block">📊</span>
                  <p className="text-xl text-gray-500 mb-2">
                    输入关键词并选择平台后，这里将显示分析结果
                  </p>
                  <p className="text-sm text-gray-400">
                    报告包含：市场概况 / 蓝海对比 / 爆款潜力 / 选品建议 / 平台优先级 / 行动建议
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'browser' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <BrowserPanel
              onExtract={handleExtractData}
              isExtracting={isExtracting}
              extractStatus={extractStatus}
              extractedCount={extractedData?.length || 0}
            />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">📌</span>
              <p className="text-xl text-gray-500 mb-2">跟踪列表（功能开发中）</p>
              <p className="text-sm text-gray-400">
                将在后续版本中实现：跨平台数据监控、生命周期追踪、趋势对比
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 黑五类警告弹窗 */}
      {showBlacklistAlert && (
        <BlacklistAlert warnings={blacklistWarnings} onDismiss={handleDismissBlacklist} />
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-500">
        <p>XHS Picker v0.1.0 · 全平台AI选品工具</p>
        <p className="mt-1 text-xs text-gray-400">Powered by DeepSeek</p>
      </footer>
    </div>
  );
}
