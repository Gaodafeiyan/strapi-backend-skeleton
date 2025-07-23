#!/bin/bash

# 完整抽奖流程测试脚本
BASE_URL="http://localhost:1337"
TOKEN=""
USER_ID=""

echo "🎰 完整抽奖流程测试开始..."

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

# 2. 获取用户钱包余额
echo "2. 获取用户钱包余额..."
WALLET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/qianbao-yue/me" \
  -H "Authorization: Bearer $TOKEN")

echo "钱包余额:"
echo $WALLET_RESPONSE | jq '.'

# 3. 获取投资计划列表
echo "3. 获取投资计划列表..."
PLANS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/dinggou-jihuas" \
  -H "Authorization: Bearer $TOKEN")

echo "投资计划:"
echo $PLANS_RESPONSE | jq '.'

# 4. 创建投资订单（如果有足够余额）
PLAN_ID=$(echo $PLANS_RESPONSE | jq -r '.data[0].id')
PLAN_AMOUNT=$(echo $PLANS_RESPONSE | jq -r '.data[0].attributes.benjinUSDT')
WALLET_BALANCE=$(echo $WALLET_RESPONSE | jq -r '.data.attributes.usdtYue')

if [ "$PLAN_ID" != "null" ] && [ "$WALLET_BALANCE" -ge "$PLAN_AMOUNT" ]; then
  echo "4. 创建投资订单..."
  ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/dinggou-dingdans" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"data\": {
        \"jihuaId\": $PLAN_ID
      }
    }")
  
  ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.id')
  echo "订单创建结果:"
  echo $ORDER_RESPONSE | jq '.'
  
  if [ "$ORDER_ID" != "null" ]; then
    echo "✅ 订单创建成功，订单ID: $ORDER_ID"
    
    # 5. 强制赎回订单（测试模式）
    echo "5. 强制赎回订单（测试模式）..."
    REDEEM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/dinggou-dingdans/$ORDER_ID/redeem" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "force": true,
        "testMode": true
      }')
    
    echo "赎回结果:"
    echo $REDEEM_RESPONSE | jq '.'
    
    # 6. 检查抽奖机会是否创建
    echo "6. 检查抽奖机会..."
    sleep 2
    JIHUI_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/check-jihui" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "抽奖机会状态:"
    echo $JIHUI_RESPONSE | jq '.'
    
    # 7. 如果有抽奖机会，执行抽奖
    JIHUI_COUNT=$(echo $JIHUI_RESPONSE | jq '.data.totalRemaining')
    
    if [ "$JIHUI_COUNT" -gt 0 ]; then
      echo "7. 执行抽奖..."
      
      # 获取抽奖机会详情
      JIHUI_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/jihui" \
        -H "Authorization: Bearer $TOKEN")
      
      JIHUI_ID=$(echo $JIHUI_DETAIL_RESPONSE | jq -r '.data[0].id')
      
      if [ "$JIHUI_ID" != "null" ] && [ -n "$JIHUI_ID" ]; then
        # 执行抽奖
        CHOUJIANG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/choujiang/perform" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"jihuiId\": $JIHUI_ID
          }")
        
        echo "抽奖结果:"
        echo $CHOUJIANG_RESPONSE | jq '.'
        
        # 8. 获取抽奖记录
        echo "8. 获取抽奖记录..."
        RECORDS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/choujiang/records" \
          -H "Authorization: Bearer $TOKEN")
        
        echo "抽奖记录:"
        echo $RECORDS_RESPONSE | jq '.'
        
        # 9. 检查钱包余额变化
        echo "9. 检查钱包余额变化..."
        sleep 2
        NEW_WALLET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/qianbao-yue/me" \
          -H "Authorization: Bearer $TOKEN")
        
        echo "新的钱包余额:"
        echo $NEW_WALLET_RESPONSE | jq '.'
      fi
    else
      echo "⚠️  没有抽奖机会"
    fi
  else
    echo "❌ 订单创建失败"
  fi
else
  echo "⚠️  钱包余额不足或没有可用计划"
  echo "钱包余额: $WALLET_BALANCE"
  echo "计划金额: $PLAN_AMOUNT"
fi

echo "🎰 完整抽奖流程测试完成！" 