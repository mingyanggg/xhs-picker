/**
 * 数据提取器组件
 *
 * 架构：iframe 加载同源 Next.js 页面 → 该页面提取平台数据 → postMessage 传回父组件
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { ContentItem } from '@/lib/platforms/types';

interface ExtractorMessage {
  type: 'extraction-complete' | 'extraction-error' | 'status';
  data?: ContentItem[];
  keyword?: string;
  platform?: string;
  message?: string;
}

interface DataExtractorProps {
  url: string;
  keyword: string;
  platform: string;
  onDataExtracted: (data: ContentItem[], keyword: string, platform: string) => void;
  onError: (msg: string) => void;
  onStatus: (msg: string) => void;
}

export default function DataExtractor({
  url,
  keyword,
  platform,
  onDataExtracted,
  onError,
  onStatus,
}: DataExtractorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtractorMessage>) => {
      if (event.data?.type === 'extraction-complete' && event.data.data) {
        onDataExtracted(event.data.data, event.data.keyword || keyword, event.data.platform || platform);
      } else if (event.data?.type === 'extraction-error') {
        onError(event.data.message || '提取失败');
      } else if (event.data?.type === 'status') {
        onStatus(event.data.message || '');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [keyword, platform, onDataExtracted, onError, onStatus]);

  // 构造提取器 URL（加载提取逻辑页面）
  const extractorUrl = `/extractor?url=${encodeURIComponent(url)}&keyword=${encodeURIComponent(keyword)}&platform=${encodeURIComponent(platform)}`;

  return (
    <iframe
      ref={iframeRef}
      src={extractorUrl}
      className="w-full h-full border-0"
      title="数据提取器"
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  );
}
