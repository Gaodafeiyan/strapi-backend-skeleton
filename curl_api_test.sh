#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://118.107.4.158:1337"
JWT_TOKEN=""

echo -e "${BLUE}🚀 开始测试所有API接口...${NC}"
echo -e "${BLUE}================================${NC}"

# 测试函数
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local requires_auth=$5
    
    echo -e "\n${YELLOW}📝 测试: $description${NC}"
    echo -e "${BLUE}   $method $endpoint${NC}"
    
    local curl_cmd="curl -s -w '\nHTTP状态码: %{http_code}\n响应时间: %{time_total}s\n'"
    
    if [ "$requires_auth" = "true" ] && [ -n "$JWT_TOKEN" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $JWT_TOKEN'"
    fi
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
        fi
    fi
    
    curl_cmd="$curl_cmd -X $method '$BASE_URL$endpoint'"
    
    local response=$(eval $curl_cmd)
    local status_code=$(echo "$response" | grep "HTTP状态码:" | cut -d' ' -f2)
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}   ✅ 成功 ($status_code)${NC}"
    elif [ "$status_code" -eq 401 ]; then
        echo -e "${YELLOW}   ⚠️ 需要认证 ($status_code)${NC}"
    elif [ "$status_code" -eq 404 ]; then
        echo -e "${RED}   ❌ 未找到 ($status_code)${NC}"
    else
        echo -e "${RED}   ❌ 错误 ($status_code)${NC}"
    fi
    
    echo "$response" | head -20
    echo ""
}

# 1. 测试邀请码注册
echo -e "${BLUE}🔐 测试认证相关接口...${NC}"
test_endpoint "POST" "/api/auth/invite-register" '{
  "username": "testuser123",
  "email": "test123@example.com",
  "password": "123456",
  "inviteCode": "TEST123"
}' "邀请码注册" false

# 2. 测试登录
login_response=$(curl -s -X POST "$BASE_URL/api/auth/local" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser123",
    "password": "123456"
  }')

echo -e "\n${YELLOW}📝 测试: 用户登录${NC}"
echo -e "${BLUE}   POST /api/auth/local${NC}"

if echo "$login_response" | grep -q "jwt"; then
    JWT_TOKEN=$(echo "$login_response" | grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}   ✅ 登录成功，获取到JWT Token${NC}"
    echo "$login_response" | head -10
else
    echo -e "${RED}   ❌ 登录失败${NC}"
    echo "$login_response"
fi

echo ""

# 3. 测试用户信息
test_endpoint "GET" "/api/users/me" "" "获取用户信息" true

# 4. 测试钱包相关接口
echo -e "${BLUE}💰 测试钱包相关接口...${NC}"
test_endpoint "GET" "/api/qianbao-yues/user-wallet" "" "获取用户钱包" true
test_endpoint "GET" "/api/qianbao-yues/token-balances" "" "获取代币余额" true
test_endpoint "GET" "/api/qianbao-yues/token-reward-records" "" "获取代币赠送记录" true

# 5. 测试钱包地址接口
echo -e "${BLUE}🏦 测试钱包地址接口...${NC}"
test_endpoint "GET" "/api/wallet-addresses" "" "获取钱包地址列表" true
test_endpoint "POST" "/api/wallet-addresses" '{
  "data": {
    "address": "0x1234567890123456789012345678901234567890",
    "chain": "ETH",
    "asset": "USDT",
    "description": "测试地址"
  }
}' "创建钱包地址" true
test_endpoint "GET" "/api/wallet-addresses/best/ETH/USDT" "" "获取最佳钱包地址" true

# 6. 测试AI代币接口
echo -e "${BLUE}🤖 测试AI代币接口...${NC}"
test_endpoint "GET" "/api/ai-tokens" "" "获取AI代币列表" false
test_endpoint "GET" "/api/ai-tokens/market" "" "获取代币市场数据" false

# 7. 测试邀请奖励接口
echo -e "${BLUE}🎁 测试邀请奖励接口...${NC}"
test_endpoint "GET" "/api/yaoqing-jianglis/my-invites" "" "获取我的邀请记录" true
test_endpoint "GET" "/api/yaoqing-jianglis/invite-stats" "" "获取邀请统计" true

# 8. 测试认购计划接口
echo -e "${BLUE}📋 测试认购计划接口...${NC}"
test_endpoint "GET" "/api/dinggou-jihuas" "" "获取认购计划列表" false
test_endpoint "GET" "/api/dinggou-jihuas/active" "" "获取活跃认购计划" false

# 9. 测试通知接口
echo -e "${BLUE}📢 测试通知接口...${NC}"
test_endpoint "GET" "/api/notices" "" "获取通知列表" false
test_endpoint "GET" "/api/notices/active" "" "获取活跃通知" false

# 10. 测试代币奖励记录接口
echo -e "${BLUE}🏆 测试代币奖励记录接口...${NC}"
test_endpoint "GET" "/api/token-reward-records" "" "获取代币奖励记录列表" true
test_endpoint "GET" "/api/token-reward-records/my-rewards" "" "获取我的奖励记录" true

# 11. 测试充值接口
echo -e "${BLUE}💳 测试充值接口...${NC}"
test_endpoint "GET" "/api/qianbao-chongzhis/deposit-address?chain=ETH&asset=USDT" "" "获取充值地址" true
test_endpoint "POST" "/api/qianbao-chongzhis/confirm-recharge" '{
  "txHash": "0x1234567890abcdef",
  "amount": "100.00"
}' "确认充值" true

# 12. 测试提现接口
echo -e "${BLUE}💸 测试提现接口...${NC}"
test_endpoint "GET" "/api/qianbao-tixians" "" "获取提现记录列表" true
test_endpoint "POST" "/api/qianbao-tixians/1/broadcast" "" "广播提现" true

# 13. 测试Webhook接口
echo -e "${BLUE}🔗 测试Webhook接口...${NC}"
test_endpoint "POST" "/api/webhooks/handle-transaction" '{
  "txHash": "0x1234567890abcdef",
  "status": "confirmed",
  "data": {
    "amount": "100.00",
    "from": "0x1234567890123456789012345678901234567890",
    "to": "0x0987654321098765432109876543210987654321"
  }
}' "处理交易Webhook" false

# 14. 测试队列接口
echo -e "${BLUE}📊 测试队列接口...${NC}"
test_endpoint "GET" "/api/queues" "" "获取队列列表" true
test_endpoint "GET" "/api/queues/status" "" "获取队列状态" true

# 15. 测试性能监控接口
echo -e "${BLUE}📈 测试性能监控接口...${NC}"
test_endpoint "GET" "/api/performance-monitors" "" "获取性能监控列表" true
test_endpoint "GET" "/api/performance-monitors/system-metrics" "" "获取系统指标" true

# 16. 测试商城相关接口
echo -e "${BLUE}🛍️ 测试商城相关接口...${NC}"
test_endpoint "GET" "/api/shop-products" "" "获取商品列表" false
test_endpoint "GET" "/api/shop-products/hot" "" "获取热门商品" false
test_endpoint "GET" "/api/shop-products/recommended" "" "获取推荐商品" false
test_endpoint "GET" "/api/shop-products/search?q=test" "" "搜索商品" false

# 17. 测试购物车接口
echo -e "${BLUE}🛒 测试购物车接口...${NC}"
test_endpoint "GET" "/api/shop-carts" "" "获取购物车列表" true
test_endpoint "POST" "/api/shop-carts/add-to-cart" '{
  "productId": 1,
  "quantity": 2
}' "添加到购物车" true
test_endpoint "GET" "/api/shop-carts/my-cart" "" "获取我的购物车" true

# 18. 测试订单接口
echo -e "${BLUE}📦 测试订单接口...${NC}"
test_endpoint "GET" "/api/shop-orders" "" "获取订单列表" true
test_endpoint "GET" "/api/shop-orders/my-orders" "" "获取我的订单" true
test_endpoint "POST" "/api/shop-orders/1/pay" '{
  "paymentMethod": "USDT"
}' "支付订单" true

# 19. 测试抽奖接口
echo -e "${BLUE}🎰 测试抽奖接口...${NC}"
test_endpoint "GET" "/api/choujiang-jiangpins" "" "获取抽奖奖品列表" false

echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}🎉 API接口测试完成！${NC}"
echo -e "${BLUE}================================${NC}"

# 生成测试报告
echo -e "\n${YELLOW}📊 测试总结:${NC}"
echo -e "   - 基础URL: $BASE_URL"
echo -e "   - 认证状态: $([ -n "$JWT_TOKEN" ] && echo "已登录" || echo "未登录")"
echo -e "   - 测试时间: $(date)"
echo "" 