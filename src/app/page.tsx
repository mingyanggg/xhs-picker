/**
 * XHS Picker v4.0 · 主界面
 *
 * 布局：3 栏 Linear 风格（Sidebar 240px + List 360px + Detail flex）
 * 设计基线：v4.0-mockup.html（那哥 6/9 23:00 拍板 OK）
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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

// ============== 类型 ==============

type TabId = 'pick' | 'source' | 'seller' | 'tracker' | 'manual' | 'settings';

interface NavItem {
  id: TabId;
  icon: string;
  label: string;
  count?: number;
}

interface NoteItem {
  id: string;
  title: string;
  author: string;
  likes: number;
  time: string;
}

// ============== 常量（设计 token） ==============

const TOKENS = {
  bgMain: '#FAF8F4',
  bgCard: '#FFFFFF',
  bgSidebar: '#F2EDE4',
  bgHover: '#F5F0E8',
  textPrimary: '#2C2620',
  textSecondary: '#8B6F47',
  textTertiary: '#B8A88A',
  accent: '#D97706',
  accentHover: '#B45309',
  border: '#E8D9C0',
  borderStrong: '#C4B190',
};

// ============== 导航数据 ==============

const NAV_ITEMS: NavItem[] = [
  { id: 'pick', icon: '🔍', label: '选品分析' },
  { id: 'source', icon: '🏭', label: '货源反查' },
  { id: 'seller', icon: '⭐', label: '商家评分' },
  { id: 'tracker', icon: '📌', label: '跟踪列表', count: 0 },
  { id: 'manual', icon: '📚', label: '选品手册' },
  { id: 'settings', icon: '⚙️', label: '设置' },
];

// ============== 组件 ==============

export default function Home() {
  // 状态
  const [activeNav, setActiveNav] = useState<TabId>('pick');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<PickReport | null>(null);
  const [showBlacklistAlert, setShowBlacklistAlert] = useState(false);
  const [blacklistWarnings, setBlacklistWarnings] = useState<PlatformBlacklistWarning[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // 搜索结果（模拟）
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // ⌘K 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 执行分析
  const handleAnalyze = useCallback(async () => {
    if (!keyword.trim() || !category) return;

    setIsAnalyzing(true);
    setShowBlacklistAlert(false);

    // 黑五类检测
    if (isBlacklisted(keyword)) {
      const warnings = getPlatformWarnings(keyword, ['xhs']);
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
          platforms: ['xhs'],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.report);
      // 模拟笔记列表
      setNotes(data.report.viralPotential?.[0]?.topAccounts?.map((a: any, i: number) => ({
        id: `note-${i}`,
        title: `${a.name} 的爆款笔记`,
        author: a.name,
        likes: a.avgEngagement || 0,
        time: '2小时前',
      })) || []);
    } catch {
      setReport(generateMockReport(keyword.trim(), category as Category, ['xhs']));
    } finally {
      setIsAnalyzing(false);
    }
  }, [keyword, category]);

  // 选品分析视图
  const renderPickView = () => (
    <div className="flex h-full">
      {/* 左：搜索条件 */}
      <div style={{ width: 360, borderRight: `1px solid ${TOKENS.border}`, padding: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>🔍 选品分析</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: TOKENS.textSecondary, marginBottom: 4 }}>
            关键词
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="输入品类关键词"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${TOKENS.border}`,
              borderRadius: 8,
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: TOKENS.textSecondary, marginBottom: 4 }}>
            品类
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${TOKENS.border}`,
              borderRadius: 8,
              fontSize: 13,
              background: TOKENS.bgCard,
              outline: 'none',
            }}
          >
            <option value="">选择品类</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !keyword || !category}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: isAnalyzing ? TOKENS.textTertiary : TOKENS.accent,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
          }}
        >
          {isAnalyzing ? '⏳ 分析中...' : '🔍 开始分析'}
        </button>
      </div>

      {/* 中：笔记列表 */}
      <div style={{ width: 360, borderRight: `1px solid ${TOKENS.border}`, overflow: 'auto' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${TOKENS.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>搜索结果</span>
            <span style={{ fontSize: 12, color: TOKENS.textTertiary }}>{notes.length} 条</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['全部', '爆款', '低粉'].map((f) => (
              <span
                key={f}
                style={{
                  padding: '3px 8px',
                  fontSize: 11,
                  borderRadius: 4,
                  background: f === '全部' ? TOKENS.accent : TOKENS.bgSidebar,
                  color: f === '全部' ? 'white' : TOKENS.textSecondary,
                  cursor: 'pointer',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => setSelectedNoteId(note.id)}
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${TOKENS.border}`,
              background: selectedNoteId === note.id ? TOKENS.bgHover : 'transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{note.title}</div>
            <div style={{ fontSize: 11, color: TOKENS.textTertiary }}>
              {note.author} · {note.likes} 赞 · {note.time}
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.textTertiary }}>
            输入关键词开始分析
          </div>
        )}
      </div>

      {/* 右：报告详情 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {report ? (
          <ReportCard report={report} onAddToTracker={() => addTrackerItem(keyword, category as Category, ['xhs'])} />
        ) : (
          <div style={{ textAlign: 'center', color: TOKENS.textTertiary, marginTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>输入关键词开始选品分析</div>
            <div style={{ fontSize: 12 }}>报告包含：市场概况 / 爆款潜力 / 选品建议 / 货源推荐</div>
          </div>
        )}
      </div>
    </div>
  );

  // 其他视图占位
  const renderPlaceholder = (title: string) => (
    <div style={{ textAlign: 'center', color: TOKENS.textTertiary, marginTop: 120 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
      <div style={{ fontSize: 16 }}>{title}</div>
      <div style={{ fontSize: 12, marginTop: 8 }}>功能开发中...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: TOKENS.bgMain, fontFamily: 'Inter, "PingFang SC", sans-serif' }}>
      {/* 顶栏 */}
      <header
        style={{
          height: 48,
          background: TOKENS.bgCard,
          borderBottom: `1px solid ${TOKENS.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              background: `linear-gradient(135deg, ${TOKENS.accent} 0%, #F59E0B 100%)`,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
            }}
          >
            🎯
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: TOKENS.accent }}>XHS Picker</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* 搜索触发器 ⌘K */}
        <button
          onClick={() => setShowCommandPalette(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: TOKENS.bgSidebar,
            border: `1px solid ${TOKENS.border}`,
            borderRadius: 8,
            color: TOKENS.textSecondary,
            fontSize: 13,
            cursor: 'pointer',
            minWidth: 240,
          }}
        >
          <span>🔍</span>
          <span>搜索...</span>
          <span
            style={{
              marginLeft: 'auto',
              padding: '2px 6px',
              background: TOKENS.bgCard,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            ⌘K
          </span>
        </button>

        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          <button style={{ padding: '6px 10px', border: 'none', background: 'transparent', color: TOKENS.textSecondary, cursor: 'pointer', borderRadius: 6 }}>
            ⚙️
          </button>
        </div>
      </header>

      {/* 主体布局 3 栏 */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: 'calc(100vh - 48px)' }}>
        {/* 左：Sidebar */}
        <nav style={{ background: TOKENS.bgSidebar, borderRight: `1px solid ${TOKENS.border}`, padding: '12px 8px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ padding: '4px 8px', fontSize: 11, color: TOKENS.textTertiary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              功能
            </div>
            {NAV_ITEMS.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 4,
                  color: activeNav === item.id ? TOKENS.accent : TOKENS.textSecondary,
                  background: activeNav === item.id ? 'rgba(217, 119, 6, 0.12)' : 'transparent',
                  fontWeight: activeNav === item.id ? 500 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginBottom: 2,
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '1px 6px',
                      background: TOKENS.bgCard,
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ padding: '4px 8px', fontSize: 11, color: TOKENS.textTertiary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              工具
            </div>
            {NAV_ITEMS.slice(4).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 4,
                  color: activeNav === item.id ? TOKENS.accent : TOKENS.textSecondary,
                  background: activeNav === item.id ? 'rgba(217, 119, 6, 0.12)' : 'transparent',
                  fontWeight: activeNav === item.id ? 500 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginBottom: 2,
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </nav>

        {/* 右：内容区 */}
        <main style={{ overflow: 'auto' }}>
          {activeNav === 'pick' && renderPickView()}
          {activeNav === 'source' && renderPlaceholder('货源反查')}
          {activeNav === 'seller' && renderPlaceholder('商家评分')}
          {activeNav === 'tracker' && renderPlaceholder('跟踪列表')}
          {activeNav === 'manual' && renderPlaceholder('选品手册')}
          {activeNav === 'settings' && renderPlaceholder('设置')}
        </main>
      </div>

      {/* ⌘K 命令面板 */}
      {showCommandPalette && (
        <div
          onClick={() => setShowCommandPalette(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 120,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 480,
              background: TOKENS.bgCard,
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(44, 38, 32, 0.12)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 16, borderBottom: `1px solid ${TOKENS.border}` }}>
              <input
                type="text"
                placeholder="输入命令或搜索..."
                autoFocus
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  background: 'transparent',
                }}
              />
            </div>
            <div style={{ padding: 8, maxHeight: 300, overflow: 'auto' }}>
              {[
                { icon: '🔍', label: '选品分析', action: () => { setActiveNav('pick'); setShowCommandPalette(false); } },
                { icon: '🏭', label: '货源反查', action: () => { setActiveNav('source'); setShowCommandPalette(false); } },
                { icon: '📌', label: '跟踪列表', action: () => { setActiveNav('tracker'); setShowCommandPalette(false); } },
              ].map((cmd, i) => (
                <div
                  key={i}
                  onClick={cmd.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.bgHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>{cmd.icon}</span>
                  <span>{cmd.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 黑五类警告 */}
      {showBlacklistAlert && (
        <BlacklistAlert
          warnings={blacklistWarnings}
          onDismiss={() => setShowBlacklistAlert(false)}
        />
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px', color: TOKENS.textTertiary, fontSize: 12 }}>
        XHS Picker v4.0 · 全平台AI选品工具 · Powered by DeepSeek
      </footer>
    </div>
  );
}