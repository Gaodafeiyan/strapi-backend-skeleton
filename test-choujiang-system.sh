#!/bin/bash

# 抽奖系统测试脚本
BASE_URL="http://localhost:1337"
TOKEN=""

echo "🎰 抽奖系统测试开始..."

# 1. 用户登录
echo "1. 用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/local" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.jwt')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ 登录成功，用户ID: $USER_ID"

# 2. 获取抽奖奖品列表
echo "2. 获取抽奖奖品列表..."
PRIZES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/prizes" \
  -H "Authorization: Bearer $TOKEN")

echo "奖品列表:"
echo $PRIZES_RESPONSE | jq '.'

# 3. 检查用户抽奖机会
echo "3. 检查用户抽奖机会..."
JIHUI_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/check-jihui" \
  -H "Authorization: Bearer $TOKEN")

echo "抽奖机会状态:"
echo $JIHUI_RESPONSE | jq '.'

# 4. 获取用户抽奖机会详情
echo "4. 获取用户抽奖机会详情..."
JIHUI_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/jihui" \
  -H "Authorization: Bearer $TOKEN")

echo "抽奖机会详情:"
echo $JIHUI_DETAIL_RESPONSE | jq '.'

# 5. 如果有抽奖机会，执行抽奖
JIHUI_COUNT=$(echo $JIHUI_RESPONSE | jq '.data.totalRemaining')

if [ "$JIHUI_COUNT" -gt 0 ]; then
  echo "5. 执行抽奖..."
  
  # 获取第一个可用的抽奖机会ID
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
    echo "❌ 没有可用的抽奖机会ID"
  fi
else
  echo "⚠️  没有可用的抽奖机会"
fi

# 6. 获取用户抽奖记录
echo "6. 获取用户抽奖记录..."
RECORDS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/records" \
  -H "Authorization: Bearer $TOKEN")

echo "抽奖记录:"
echo $RECORDS_RESPONSE | jq '.'

echo "🎰 抽奖系统测试完成！" 