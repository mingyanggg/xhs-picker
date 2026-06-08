#!/bin/bash
# 那哥用：验证 API key 是否配好 + 报告字段是否完整
set -e
cd ~/AI项目/xhs-picker

echo "=== 1. .env.local 存在性检查 ==="
if [ -f .env.local ]; then
  echo "✅ .env.local 存在"
  KEY=$(grep "DEEPSEEK_API_KEY" .env.local | cut -d'=' -f2 | head -1)
  if [ -z "$KEY" ] || [ "$KEY" = "***" ]; then
    echo "❌ DEEPSEEK_API_KEY 是空的或占位符"
  else
    echo "✅ DEEPSEEK_API_KEY 已配置（前 8 位：${KEY:0:8}...）"
  fi
else
  echo "❌ .env.local 不存在，需要创建"
fi

echo ""
echo "=== 2. 启动 Next.js 跑一次真分析 ==="
echo "（这会真调 DeepSeek API，需要 5-15 秒）"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword":"防晒霜","category":"实物商品","platforms":["xhs","douyin"]}' 2>&1)
echo "$RESPONSE" | head -c 500
echo "..."

echo ""
echo "=== 3. 验证报告必须字段 ==="
HAS_BRANDS=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); s=d.get('report',{}).get('suggestion',{}); print(len(s.get('brands',[])))" 2>/dev/null || echo "0")
HAS_SUBCAT=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); s=d.get('report',{}).get('suggestion',{}); print(len(s.get('subCategories',[])))" 2>/dev/null || echo "0")
HAS_PRICE=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); s=d.get('report',{}).get('suggestion',{}); print(len(s.get('priceRanges',[])))" 2>/dev/null || echo "0")
HAS_COMM=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); s=d.get('report',{}).get('suggestion',{}); print(len(s.get('commissionRanges',[])))" 2>/dev/null || echo "0")

echo "  brands: $HAS_BRANDS 个（要求 >=3）"
echo "  subCategories: $HAS_SUBCAT 个（要求 >=3）"
echo "  priceRanges: $HAS_PRICE 档（要求 >=3）"
echo "  commissionRanges: $HAS_COMM 档（要求 >=3）"

if [ "$HAS_BRANDS" -ge 3 ] && [ "$HAS_SUBCAT" -ge 3 ] && [ "$HAS_PRICE" -ge 3 ] && [ "$HAS_COMM" -ge 3 ]; then
  echo ""
  echo "🎉 所有字段达标！选品报告能用了"
else
  echo ""
  echo "⚠️ 字段没全，可能原因：API key 没配 / API 报错走了 mock / prompt 没生效"
fi
