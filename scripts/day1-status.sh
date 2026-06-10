#!/bin/bash
# day1-status.sh — 一键查 claude code 真实进度
# 3 大数据源：git 提交 + 端口探针 + .claude 状态文件
# 用法：在项目根目录跑 `bash scripts/day1-status.sh`

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "============================================"
echo "  Day 1 进度查询 · $(date '+%Y-%m-%d %H:%M:%S')"
echo "  项目：xhs-picker (v3.1)"
echo "============================================"
echo ""

# ===== 1️⃣ Git 进度 =====
echo "📊 [1/3] Git 提交记录（最新 10 条）"
echo "-----------------------------------"
git log --oneline -10 2>&1 | head -12
echo ""

# ===== 2️⃣ 端口探针 =====
echo "🔌 [2/3] 端口探针（3000 Next.js / 1420 Tauri / 9223 CDP / 5173 Vite）"
echo "-----------------------------------"
for port_info in "3000:Next.js" "1420:Tauri" "9223:CDP" "5173:Vite"; do
  port="${port_info%%:*}"
  name="${port_info##*:}"
  if lsof -i :$port -sTCP:LISTEN >/dev/null 2>&1; then
    process=$(lsof -i :$port -sTCP:LISTEN 2>/dev/null | tail -1 | awk '{print $1, $2}')
    echo "  ✅ $port ($name) — $process"
  else
    echo "  ❌ $port ($name) — 未监听"
  fi
done
echo ""

# ===== 3️⃣ .claude / .goal-state 状态文件 =====
echo "📁 [3/3] Claude Code / Goal Coding 状态文件"
echo "-----------------------------------"
STATE_FILES=(
  ".claude/state.json"
  ".claude/status.json"
  ".claude/last_command.txt"
  ".claude/session.json"
  ".goal-state/state.json"
  ".goal-state/goal.json"
  "学习笔记/$(date '+%Y-%m-%d')-*.md"
  "学习笔记/2026-06-09*.md"
)
FOUND=0
for pattern in "${STATE_FILES[@]}"; do
  for file in $pattern; do
    if [ -f "$file" ]; then
      echo "  📄 $file"
      echo "     mtime: $(stat -f '%Sm' "$file" 2>/dev/null || stat -c '%y' "$file" 2>/dev/null)"
      echo "     size:  $(wc -c < "$file" | tr -d ' ') bytes"
      FOUND=1
    fi
  done
done
if [ $FOUND -eq 0 ]; then
  echo "  ⚠️  未找到状态文件（claude code 可能没创建或位置不同）"
fi
echo ""

# ===== 4️⃣ 当天变更文件（基于 git diff）=====
echo "📝 [4/4] 今天的代码变更（git status + 24h 内修改的文件）"
echo "-----------------------------------"
git status --short 2>&1 | head -20
echo "--- 最近 24h 修改的文件 ---"
find "$PROJECT_ROOT" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
  -mtime -1 \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  2>/dev/null | head -20
echo ""

# ===== 5️⃣ 关键文件 mtime 概览 =====
echo "🎯 [5/5] 关键文件最后修改时间"
echo "-----------------------------------"
KEY_FILES=(
  "CLAUDE.md"
  "GOAL-DECLARATION.md"
  "PROGRESS-v3.1.md"
  "src/lib/analyzer.ts"
  "src/app/api/analyze/route.ts"
  ".env.local"
  "package.json"
)
for f in "${KEY_FILES[@]}"; do
  if [ -f "$f" ]; then
    mtime=$(stat -f '%Sm' "$f" 2>/dev/null || stat -c '%y' "$f" 2>/dev/null)
    size=$(wc -c < "$f" | tr -d ' ')
    printf "  %-40s %s (%s bytes)\n" "$f" "$mtime" "$size"
  else
    printf "  %-40s ❌ 不存在\n" "$f"
  fi
done

echo ""
echo "============================================"
echo "  查询完成 · 复制上面输出问小米分析"
echo "============================================"
