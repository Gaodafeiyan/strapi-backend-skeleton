#!/bin/bash

# 快速测试脚本 - 验证核心API功能
# 只依赖 curl，无需 jq

BASE_URL="http://118.107.4.158:1337"
API_BASE="$BASE_URL/api"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 开始快速API测试${NC}"
echo "=================================="

# 1. 测试服务器连接
echo -e "${BLUE}1. 测试服务器连接...${NC}"
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ 服务器连接正常${NC}"
else
    echo -e "${RED}❌ 服务器连接失败${NC}"
    exit 1
fi

# 2. 测试注册接口
echo -e "${BLUE}2. 测试注册接口...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/invite-register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser123",
        "email": "test123@example.com",
        "password": "123456",
        "inviteCode": "AN2CN12D"
    }')

echo "注册响应: $REGISTER_RESPONSE"
if echo "$REGISTER_RESPONSE" | grep -q "邀请码无效"; then
    echo -e "${GREEN}✅ 注册接口正常，验证逻辑工作${NC}"
else
    echo -e "${YELLOW}⚠️ 注册响应异常${NC}"
fi

# 3. 测试投资计划接口
echo -e "${BLUE}3. 测试投资计划接口...${NC}"
PLAN_RESPONSE=$(curl -s -X GET "$API_BASE/dinggou-jihuas")
echo "投资计划响应: $PLAN_RESPONSE"
if echo "$PLAN_RESPONSE" | grep -q "data"; then
    echo -e "${GREEN}✅ 投资计划接口正常${NC}"
else
    echo -e "${RED}❌ 投资计划接口异常${NC}"
fi

# 4. 测试钱包接口
echo -e "${BLUE}4. 测试钱包接口...${NC}"
WALLET_RESPONSE=$(curl -s -X GET "$API_BASE/qianbao-yues")
echo "钱包响应: $WALLET_RESPONSE"
if echo "$WALLET_RESPONSE" | grep -q "data"; then
    echo -e "${GREEN}✅ 钱包接口正常${NC}"
else
    echo -e "${RED}❌ 钱包接口异常${NC}"
fi

# 5. 测试订单接口
echo -e "${BLUE}5. 测试订单接口...${NC}"
ORDER_RESPONSE=$(curl -s -X GET "$API_BASE/dinggou-dingdans")
echo "订单响应: $ORDER_RESPONSE"
if echo "$ORDER_RESPONSE" | grep -q "data"; then
    echo -e "${GREEN}✅ 订单接口正常${NC}"
else
    echo -e "${RED}❌ 订单接口异常${NC}"
fi

# 6. 测试邀请奖励接口
echo -e "${BLUE}6. 测试邀请奖励接口...${NC}"
REWARD_RESPONSE=$(curl -s -X GET "$API_BASE/yaoqing-jianglis")
echo "邀请奖励响应: $REWARD_RESPONSE"
if echo "$REWARD_RESPONSE" | grep -q "data"; then
    echo -e "${GREEN}✅ 邀请奖励接口正常${NC}"
else
    echo -e "${RED}❌ 邀请奖励接口异常${NC}"
fi

# 7. 测试错误处理
echo -e "${BLUE}7. 测试错误处理...${NC}"
ERROR_RESPONSE=$(curl -s -X POST "$API_BASE/auth/invite-register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "ab",
        "email": "invalid-email",
        "password": "123",
        "inviteCode": "123"
    }')

echo "错误处理响应: $ERROR_RESPONSE"
if echo "$ERROR_RESPONSE" | grep -q "用户名至少3个字符"; then
    echo -e "${GREEN}✅ 错误处理正常${NC}"
else
    echo -e "${YELLOW}⚠️ 错误处理响应异常${NC}"
fi

echo ""
echo -e "${GREEN}🎉 快速测试完成！${NC}"
echo "==================================" 