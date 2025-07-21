#!/bin/bash

# 测试真实邀请码 AN2CN12D
BASE_URL="http://118.107.4.158:1337"
API_BASE="$BASE_URL/api"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 测试真实邀请码 AN2CN12D${NC}"
echo "=================================="

# 生成唯一用户名
TEST_USERNAME="testuser_$(date +%s)"
TEST_EMAIL="${TEST_USERNAME}@example.com"
TEST_PASSWORD="123456"
REAL_INVITE_CODE="AN2CN12D"

echo "测试用户: $TEST_USERNAME"
echo "测试邮箱: $TEST_EMAIL"
echo "真实邀请码: $REAL_INVITE_CODE"
echo ""

# 1. 测试真实邀请码注册
echo -e "${BLUE}1. 测试真实邀请码注册...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/invite-register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"inviteCode\": \"$REAL_INVITE_CODE\"
    }")

echo "注册响应: $REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ 真实邀请码注册成功！${NC}"
    
    # 提取用户ID和生成的邀请码
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"userId":[0-9]*' | cut -d':' -f2)
    NEW_INVITE_CODE=$(echo "$REGISTER_RESPONSE" | grep -o '"inviteCode":"[^"]*"' | cut -d'"' -f4)
    
    echo "用户ID: $USER_ID"
    echo "生成的邀请码: $NEW_INVITE_CODE"
    
    # 2. 测试登录
    echo -e "${BLUE}2. 测试登录...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/local" \
        -H "Content-Type: application/json" \
        -d "{
            \"identifier\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    echo "登录响应: $LOGIN_RESPONSE"
    
    if echo "$LOGIN_RESPONSE" | grep -q "jwt"; then
        echo -e "${GREEN}✅ 登录成功！${NC}"
        
        # 提取JWT Token
        JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)
        echo "JWT Token: ${JWT_TOKEN:0:20}..."
        
        # 3. 查看钱包
        echo -e "${BLUE}3. 查看钱包...${NC}"
        WALLET_RESPONSE=$(curl -s -X GET "$API_BASE/qianbao-yues" \
            -H "Authorization: Bearer $JWT_TOKEN")
        
        echo "钱包响应: $WALLET_RESPONSE"
        
        if echo "$WALLET_RESPONSE" | grep -q "data"; then
            echo -e "${GREEN}✅ 钱包查询成功！${NC}"
            
            # 显示余额
            USDT_BALANCE=$(echo "$WALLET_RESPONSE" | grep -o '"usdtYue":"[^"]*"' | cut -d'"' -f4)
            AI_BALANCE=$(echo "$WALLET_RESPONSE" | grep -o '"aiYue":"[^"]*"' | cut -d'"' -f4)
            echo "USDT余额: $USDT_BALANCE"
            echo "AI余额: $AI_BALANCE"
        else
            echo -e "${RED}❌ 钱包查询失败${NC}"
        fi
        
        # 4. 查看用户信息
        echo -e "${BLUE}4. 查看用户信息...${NC}"
        USER_RESPONSE=$(curl -s -X GET "$API_BASE/users/me" \
            -H "Authorization: Bearer $JWT_TOKEN")
        
        echo "用户信息响应: $USER_RESPONSE"
        
        if echo "$USER_RESPONSE" | grep -q "username"; then
            echo -e "${GREEN}✅ 用户信息查询成功！${NC}"
            
            # 显示用户信息
            USERNAME=$(echo "$USER_RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
            EMAIL=$(echo "$USER_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
            USER_INVITE_CODE=$(echo "$USER_RESPONSE" | grep -o '"yaoqingMa":"[^"]*"' | cut -d'"' -f4)
            
            echo "用户名: $USERNAME"
            echo "邮箱: $EMAIL"
            echo "用户邀请码: $USER_INVITE_CODE"
        else
            echo -e "${RED}❌ 用户信息查询失败${NC}"
        fi
        
    else
        echo -e "${RED}❌ 登录失败${NC}"
    fi
    
else
    echo -e "${RED}❌ 真实邀请码注册失败${NC}"
    ERROR_MSG=$(echo "$REGISTER_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo "错误信息: $ERROR_MSG"
fi

echo ""
echo -e "${GREEN}🎉 真实邀请码测试完成！${NC}"
echo "==================================" 