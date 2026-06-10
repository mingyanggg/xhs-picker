#!/bin/bash
# ============================================
# L1 自检 · pre-commit hook（M16 强制）
# 那哥 6/10 拍板 · Day2 M15-M17 同步建设
# ============================================
# 每次 git commit 前必跑
# 用法：bash scripts/pre-commit.sh
# 或者 git config core.hooksPath .githooks（自动触发）

set -e

echo "=== 🔧 L1 自检 · M16 Debug 机制 ==="
echo ""

# 1. TypeScript 类型检查（M15 维度 1）
echo "→ [1/4] TypeScript 类型检查..."
if command -v npx &> /dev/null && [ -f "package.json" ]; then
  if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.log | tail -5; then
    ERR_COUNT=$(grep -c "error TS" /tmp/tsc-output.log || echo "0")
    if [ "$ERR_COUNT" -gt 0 ]; then
      echo "❌ TypeScript 错误 $ERR_COUNT 个"
      echo "修复后再 commit（或者 git commit --no-verify 跳过）"
      exit 1
    fi
    echo "✅ TypeScript 0 错误"
  fi
else
  echo "⚠️ npx 未装或 package.json 不存在，跳过"
fi
echo ""

# 2. dev server 健康检查（M15 维度 3）
echo "→ [2/4] dev server 健康检查..."
if lsof -i :3000 >/dev/null 2>&1; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ dev server 在跑 · 3000 · 200 OK"
  else
    echo "⚠️ dev server 在跑但返回 $HTTP_CODE（不阻断 commit）"
  fi
else
  echo "⚠️ dev server 未跑（不阻断 commit · 提示：pnpm dev 启动）"
fi
echo ""

# 3. Playwright 安装检查（M15 维度 2 准备）
echo "→ [3/4] Playwright 安装检查..."
if command -v pnpm &> /dev/null && [ -d "node_modules/playwright" ]; then
  echo "✅ Playwright 已装"
else
  echo "⚠️ Playwright 未装（M1 需要：pnpm add -D playwright + pnpm exec playwright install chromium）"
fi
echo ""

# 4. 必须文件存在性检查
echo "→ [4/4] 必须文件存在性..."
MISSING=0
for f in CLAUDE.md GOAL-DECLARATION.md PROGRESS-v4.md; do
  if [ ! -f "$f" ]; then
    echo "❌ 缺少 $f"
    MISSING=$((MISSING + 1))
  fi
done
if [ "$MISSING" -eq 0 ]; then
  echo "✅ 3 个核心文件都在"
fi
echo ""

echo "=== ✅ L1 自检通过 ==="
echo "提示：完整评分请跑 bash scripts/self-check.sh"