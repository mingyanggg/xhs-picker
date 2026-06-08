import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XHS Picker - 全平台AI选品工具",
  description: "跨平台选品分析 + 智能跟踪",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}