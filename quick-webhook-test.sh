#!/bin/bash

# 快速Webhook测试脚本
BASE_URL="http://localhost:1337"

echo "🚀 开始快速Webhook测试..."

# 测试1: 充值确认
echo "📝 测试1: 充值确认"
curl -X POST "$BASE_URL/api/webhook/transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xabc123",
    "status": "success",
    "type": "recharge"
  }' | jq '.'

echo -e "\n"

# 测试2: 提现确认
echo "📝 测试2: 提现确认"
curl -X POST "$BASE_URL/api/webhook/transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xdef456",
    "status": "success",
    "type": "withdrawal"
  }' | jq '.'

echo -e "\n"

# 测试3: 失败处理
echo "📝 测试3: 失败处理"
curl -X POST "$BASE_URL/api/webhook/transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xghi789",
    "status": "failed",
    "type": "recharge"
  }' | jq '.'

echo -e "\n"

# 测试4: 幂等性测试
echo "📝 测试4: 幂等性测试"
curl -X POST "$BASE_URL/api/webhook/transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xabc123",
    "status": "success",
    "type": "recharge"
  }' | jq '.'

echo -e "\n"

# 测试5: 参数验证
echo "📝 测试5: 参数验证"
curl -X POST "$BASE_URL/api/webhook/transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xinvalid"
  }' | jq '.'

echo -e "\n"

echo "✅ 快速测试完成！" 