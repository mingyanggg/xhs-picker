/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // 排除 Playwright 原生模块
  experimental: {
    serverComponentsExternalPackages: ['playwright', '@playwright/test', 'fsevents'],
  },
};

export default nextConfig;
