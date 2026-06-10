#!/bin/bash
# ============================================
# M15 完整评分 · 7 维度 · 0-100 分
# 那哥 6/10 拍板 · Day2 同步建设
# ============================================
# 用法：bash scripts/self-check.sh
# 触发时机：每天 22:00 复盘 cron + 每个 must_pass 完成时 + 每周精修时

set +e

echo "=== 🎯 M15 完整评分 · 7 维度 · 0-100 分 ==="
echo ""

TOTAL=0

# 维度 1 · TypeScript 严格（15 分）
echo "→ [1/7] TypeScript 严格（15 分）..."
if command -v npx &> /dev/null && [ -f "package.json" ]; then
  npx tsc --noEmit 2>/tmp/tsc-self.log
  ERR_COUNT=$(grep -c "error TS" /tmp/tsc-self.log 2>/dev/null | head -1 | tr -d '\n' || echo "0")
  if [ -z "$ERR_COUNT" ]; then ERR_COUNT=0; fi
  if [ "$ERR_COUNT" -eq 0 ] 2>/dev/null; then
    SCORE1=15
  elif [ "$ERR_COUNT" -le 3 ] 2>/dev/null; then
    SCORE1=10
  elif [ "$ERR_COUNT" -le 10 ] 2>/dev/null; then
    SCORE1=5
  else
    SCORE1=0
  fi
else
  SCORE1=0
  echo "   （npx 未装或 package.json 缺失）"
fi
echo "   得分: $SCORE1 / 15"
TOTAL=$((TOTAL + SCORE1))
echo ""

# 维度 2 · 核心功能能用（20 分）
echo "→ [2/7] 核心功能能用（20 分）..."
if [ -d "node_modules/playwright" ] && [ -d "src-tauri/src/playwright" ]; then
  # 看 launcher.ts 是否存在
  if [ -f "src-tauri/src/playwright/launcher.ts" ]; then
    SCORE2=20
    echo "   launcher.ts 已建（待人工验证启动）"
  else
    SCORE2=10
    echo "   launcher.ts 未建（仅 Playwright 已装）"
  fi
elif [ -d "node_modules/playwright" ]; then
  SCORE2=10
  echo "   Playwright 已装但 launcher.ts 未建"
else
  SCORE2=0
  echo "   Playwright 未装（M1 待做）"
fi
echo "   得分: $SCORE2 / 20"
TOTAL=$((TOTAL + SCORE2))
echo ""

# 维度 3 · dev server 健康（10 分）
echo "→ [3/7] dev server 健康（10 分）..."
if lsof -i :3000 >/dev/null 2>&1; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    SCORE3=10
  else
    SCORE3=5
  fi
else
  SCORE3=0
fi
echo "   得分: $SCORE3 / 10"
TOTAL=$((TOTAL + SCORE3))
echo ""

# 维度 4 · UI mockup 对齐（15 分）
echo "→ [4/7] UI mockup 对齐（15 分）..."
if [ -f "v4.0-mockup.html" ] && [ -f "src/app/page.tsx" ]; then
  # 简单启发式：page.tsx 有 Linear 三栏布局关键 class？
  if grep -q "Sidebar\|sidebar\|CommandPalette" src/app/page.tsx 2>/dev/null; then
    SCORE4=15
  else
    SCORE4=5
    echo "   （page.tsx 还没对齐 mockup 的 Sidebar/CommandPalette）"
  fi
else
  SCORE4=0
fi
echo "   得分: $SCORE4 / 15"
TOTAL=$((TOTAL + SCORE4))
echo ""

# 维度 5 · must_pass 完成率（20 分）
echo "→ [5/7] must_pass 完成率（20 分）..."
# 计算 M1-M14 中已完成数（启发式：检查对应文件是否存在）
MP_DONE=0
MP_TOTAL=14
[ -d "src-tauri/src/playwright" ] && MP_DONE=$((MP_DONE + 1))
[ -d "src-tauri/src/signatures" ] && MP_DONE=$((MP_DONE + 1))
[ -d "src-tauri/src/auth" ] && MP_DONE=$((MP_DONE + 1))
[ -d "src-tauri/src/stealth" ] && MP_DONE=$((MP_DONE + 1))
[ -d "src-tauri/src/mcp" ] && MP_DONE=$((MP_DONE + 1))
[ -d "src-tauri/src/platform_crawler" ] && MP_DONE=$((MP_DONE + 1))
[ -f "src/lib/methods/source-matcher.ts" ] || [ -d "src/lib/methods" ] && MP_DONE=$((MP_DONE + 1))
[ -f "src/lib/analyzer.ts" ] && MP_DONE=$((MP_DONE + 1))
[ -d "src-tauri/src/scoring" ] && MP_DONE=$((MP_DONE + 1))
[ -d "src/lib/methods" ] && MP_DONE=$((MP_DONE + 1))
# M11 Tauri · M12 数据可视化 · M13 风险弹窗 · M14 国内外统一（启发式）
[ -d "src-tauri" ] && MP_DONE=$((MP_DONE + 1))
[ -f "src/components/ReportCard.tsx" ] && MP_DONE=$((MP_DONE + 1))
[ -f "src/components/RiskAlert.tsx" ] && MP_DONE=$((MP_DONE + 1))
grep -q "国内国外\|国内.*国外" CLAUDE.md 2>/dev/null && MP_DONE=$((MP_DONE + 1))

if [ "$MP_TOTAL" -gt 0 ]; then
  SCORE5=$((MP_DONE * 20 / MP_TOTAL))
  if [ "$SCORE5" -gt 20 ]; then SCORE5=20; fi
else
  SCORE5=0
fi
echo "   完成 $MP_DONE / $MP_TOTAL"
echo "   得分: $SCORE5 / 20"
TOTAL=$((TOTAL + SCORE5))
echo ""

# 维度 6 · 学习笔记产出（10 分）
echo "→ [6/7] 学习笔记产出（10 分）..."
TODAY=$(date +%Y-%m-%d)
TODAY_NOTE="学习笔记/${TODAY}-Day$(date +%u).md"
if [ -f "$TODAY_NOTE" ]; then
  WORD_COUNT=$(wc -m < "$TODAY_NOTE" | tr -d ' ')
  if [ "$WORD_COUNT" -ge 500 ]; then
    SCORE6=10
  else
    SCORE6=5
  fi
else
  SCORE6=0
fi
echo "   笔记文件: $TODAY_NOTE"
echo "   字数: ${WORD_COUNT:-0}"
echo "   得分: $SCORE6 / 10"
TOTAL=$((TOTAL + SCORE6))
echo ""

# 维度 7 · Git 提交规范（10 分）
echo "→ [7/7] Git 提交规范（10 分）..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  LAST_COMMIT=$(git log -1 --pretty=%B 2>/dev/null)
  if echo "$LAST_COMMIT" | grep -qE "Day[0-9]+|M[0-9]+"; then
    SCORE7=10
  elif [ -n "$LAST_COMMIT" ]; then
    SCORE7=5
  else
    SCORE7=0
  fi
else
  SCORE7=0
fi
echo "   最后 commit: ${LAST_COMMIT:0:50}..."
echo "   得分: $SCORE7 / 10"
TOTAL=$((TOTAL + SCORE7))
echo ""

# 总分判定
echo "============================================"
echo "🎯 M15 总分: $TOTAL / 100"
echo "============================================"

if [ "$TOTAL" -ge 90 ]; then
  echo "🟢 优秀（90-100）= 直接进 100 分精修阶段"
elif [ "$TOTAL" -ge 80 ]; then
  echo "🟡 良好（80-89）= 当日可交付，进下一轮迭代"
elif [ "$TOTAL" -ge 60 ]; then
  echo "🟠 及格（60-79）= 标记 3 个最低分维度，必须当日补完"
else
  echo "🔴 不及格（<60）= 强制回滚，重做当天任务"
  echo ""
  echo "卡点升级为 L3 · 请那哥介入（写 STUCK.md）"
fi

# 自动追加到 PROGRESS-v4.md
PROGRESS_FILE="PROGRESS-v4.md"
if [ -f "$PROGRESS_FILE" ]; then
  echo "" >> "$PROGRESS_FILE"
  echo "## 自检 · $(date '+%Y-%m-%d %H:%M') · ${TOTAL}分" >> "$PROGRESS_FILE"
  echo "- TypeScript: $SCORE1/15 · 核心功能: $SCORE2/20 · dev server: $SCORE3/10 · UI mockup: $SCORE4/15" >> "$PROGRESS_FILE"
  echo "- must_pass: $SCORE5/20 (完成 $MP_DONE/$MP_TOTAL) · 学习笔记: $SCORE6/10 · Git 规范: $SCORE7/10" >> "$PROGRESS_FILE"
  echo "- 总分: $TOTAL · 等级: $([ $TOTAL -ge 90 ] && echo '🟢优秀' || ([ $TOTAL -ge 80 ] && echo '🟡良好' || ([ $TOTAL -ge 60 ] && echo '🟠及格' || echo '🔴不及格')))" >> "$PROGRESS_FILE"
  echo "✅ 已追加到 PROGRESS-v4.md"
fi