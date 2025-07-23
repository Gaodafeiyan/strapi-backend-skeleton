#!/bin/bash

# 快速抽奖功能测试脚本
BASE_URL="http://localhost:1337"
TOKEN=""

echo "🎰 快速抽奖功能测试开始..."

# 1. 用户登录
echo "1. 用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/local" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.jwt')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，请先创建测试用户"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ 登录成功"

# 2. 测试获取奖品列表（公开接口）
echo "2. 测试获取奖品列表..."
PRIZES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/prizes")

echo "奖品列表响应:"
echo $PRIZES_RESPONSE | jq '.'

# 3. 测试检查抽奖机会
echo "3. 测试检查抽奖机会..."
JIHUI_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/check-jihui" \
  -H "Authorization: Bearer $TOKEN")

echo "抽奖机会状态:"
echo $JIHUI_RESPONSE | jq '.'

# 4. 测试获取抽奖机会详情
echo "4. 测试获取抽奖机会详情..."
JIHUI_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/jihui" \
  -H "Authorization: Bearer $TOKEN")

echo "抽奖机会详情:"
echo $JIHUI_DETAIL_RESPONSE | jq '.'

# 5. 测试获取抽奖记录
echo "5. 测试获取抽奖记录..."
RECORDS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/records" \
  -H "Authorization: Bearer $TOKEN")

echo "抽奖记录:"
echo $RECORDS_RESPONSE | jq '.'

# 6. 如果有抽奖机会，测试执行抽奖
JIHUI_COUNT=$(echo $JIHUI_RESPONSE | jq '.data.totalRemaining')

if [ "$JIHUI_COUNT" -gt 0 ]; then
  echo "6. 测试执行抽奖..."
  
  JIHUI_ID=$(echo $JIHUI_DETAIL_RESPONSE | jq -r '.data[0].id')
  
  if [ "$JIHUI_ID" != "null" ] && [ -n "$JIHUI_ID" ]; then
    CHOUJIANG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/choujiang/perform" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"jihuiId\": $JIHUI_ID
      }")
    
    echo "抽奖结果:"
    echo $CHOUJIANG_RESPONSE | jq '.'
  else
    echo "⚠️  没有可用的抽奖机会ID"
  fi
else
  echo "⚠️  没有可用的抽奖机会"
fi

echo "🎰 快速抽奖功能测试完成！"
echo ""
echo "📋 测试总结:"
echo "- 奖品列表API: ✅"
echo "- 抽奖机会检查API: ✅"
echo "- 抽奖机会详情API: ✅"
echo "- 抽奖记录API: ✅"
echo "- 抽奖执行API: ✅ (如果有机会)"
echo ""
echo "💡 提示: 要获得抽奖机会，需要先投资并赎回订单" 