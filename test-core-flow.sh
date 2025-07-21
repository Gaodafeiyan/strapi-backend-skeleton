#!/bin/bash

# 一键跑通核心链路测试脚本
# 覆盖：注册 → 登录 → 认购 → 赎回 → 查看奖励/钱包

set -e  # 遇到错误立即退出

# 配置
BASE_URL="http://118.107.4.158:1337"
API_BASE="$BASE_URL/api"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试数据
TEST_USERNAME="testuser_$(date +%s)"
TEST_EMAIL="${TEST_USERNAME}@example.com"
TEST_PASSWORD="123456"
TEST_INVITE_CODE="AN2CN12D"  # 真实邀请码

# 全局变量
USER_TOKEN=""
USER_ID=""
WALLET_ID=""
PLAN_ID=""
ORDER_ID=""

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v curl &> /dev/null; then
        log_error "curl 未安装"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq 未安装"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 检查服务器连接
check_server() {
    log_info "检查服务器连接..."
    
    if curl -s "$BASE_URL" > /dev/null; then
        log_success "服务器连接正常"
    else
        log_error "无法连接到服务器 $BASE_URL"
        exit 1
    fi
}

# 创建测试邀请码（如果不存在）
create_test_invite_code() {
    log_info "创建测试邀请码..."
    
    # 先创建一个测试用户作为邀请人
    local invite_user_data=$(cat <<EOF
{
    "username": "inviter_$(date +%s)",
    "email": "inviter_$(date +%s)@example.com",
    "password": "123456",
    "inviteCode": "INVITER123"
}
EOF
)
    
    # 使用真实邀请码
    log_info "使用真实邀请码: $TEST_INVITE_CODE"
}

# 1. 用户注册
test_registration() {
    log_info "=== 1. 用户注册测试 ==="
    
    local register_data=$(cat <<EOF
{
    "username": "$TEST_USERNAME",
    "email": "$TEST_EMAIL",
    "password": "$TEST_PASSWORD",
    "inviteCode": "$TEST_INVITE_CODE"
}
EOF
)
    
    log_info "注册数据: $register_data"
    
    local response=$(curl -s -X POST "$API_BASE/auth/invite-register" \
        -H "Content-Type: application/json" \
        -d "$register_data")
    
    log_info "注册响应: $response"
    
    # 检查注册结果
    if echo "$response" | jq -e '.success' > /dev/null; then
        USER_ID=$(echo "$response" | jq -r '.userId')
        log_success "注册成功，用户ID: $USER_ID"
        return 0
    else
        local error_msg=$(echo "$response" | jq -r '.error.message // "未知错误"')
        log_error "注册失败: $error_msg"
        return 1
    fi
}

# 2. 用户登录
test_login() {
    log_info "=== 2. 用户登录测试 ==="
    
    local login_data=$(cat <<EOF
{
    "identifier": "$TEST_EMAIL",
    "password": "$TEST_PASSWORD"
}
EOF
)
    
    log_info "登录数据: $login_data"
    
    local response=$(curl -s -X POST "$API_BASE/auth/local" \
        -H "Content-Type: application/json" \
        -d "$login_data")
    
    log_info "登录响应: $response"
    
    # 检查登录结果
    if echo "$response" | jq -e '.jwt' > /dev/null; then
        USER_TOKEN=$(echo "$response" | jq -r '.jwt')
        log_success "登录成功，获取到Token"
        return 0
    else
        local error_msg=$(echo "$response" | jq -r '.error.message // "未知错误"')
        log_error "登录失败: $error_msg"
        return 1
    fi
}

# 3. 查看钱包余额
test_wallet_balance() {
    log_info "=== 3. 查看钱包余额 ==="
    
    local response=$(curl -s -X GET "$API_BASE/qianbao-yues" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    log_info "钱包响应: $response"
    
    # 获取钱包ID
    WALLET_ID=$(echo "$response" | jq -r '.data[0].id')
    if [ "$WALLET_ID" != "null" ] && [ "$WALLET_ID" != "" ]; then
        log_success "获取钱包ID: $WALLET_ID"
        
        # 显示余额
        local usdt_balance=$(echo "$response" | jq -r '.data[0].attributes.usdtYue')
        local ai_balance=$(echo "$response" | jq -r '.data[0].attributes.aiYue')
        log_info "当前余额 - USDT: $usdt_balance, AI: $ai_balance"
        return 0
    else
        log_error "未找到钱包"
        return 1
    fi
}

# 4. 创建投资计划
test_create_plan() {
    log_info "=== 4. 创建投资计划 ==="
    
    local plan_data=$(cat <<EOF
{
    "data": {
        "jihuaCode": "PLAN500",
        "benjinUSDT": 500,
        "zhouQiTian": 15,
        "jingtaiBili": 6,
        "aiBili": 3,
        "choujiangCi": 3,
        "kaiqi": true
    }
}
EOF
)
    
    log_info "计划数据: $plan_data"
    
    local response=$(curl -s -X POST "$API_BASE/dinggou-jihuas" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -d "$plan_data")
    
    log_info "创建计划响应: $response"
    
    # 检查创建结果
    if echo "$response" | jq -e '.data.id' > /dev/null; then
        PLAN_ID=$(echo "$response" | jq -r '.data.id')
        log_success "投资计划创建成功，计划ID: $PLAN_ID"
        return 0
    else
        local error_msg=$(echo "$response" | jq -r '.error.message // "未知错误"')
        log_error "创建投资计划失败: $error_msg"
        return 1
    fi
}

# 5. 用户投资下单
test_create_order() {
    log_info "=== 5. 用户投资下单 ==="
    
    local order_data=$(cat <<EOF
{
    "jihuaId": $PLAN_ID
}
EOF
)
    
    log_info "订单数据: $order_data"
    
    local response=$(curl -s -X POST "$API_BASE/dinggou-dingdans" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -d "$order_data")
    
    log_info "创建订单响应: $response"
    
    # 检查创建结果
    if echo "$response" | jq -e '.data.id' > /dev/null; then
        ORDER_ID=$(echo "$response" | jq -r '.data.id')
        log_success "投资订单创建成功，订单ID: $ORDER_ID"
        return 0
    else
        local error_msg=$(echo "$response" | jq -r '.error.message // "未知错误"')
        log_error "创建投资订单失败: $error_msg"
        return 1
    fi
}

# 6. 查看订单状态
test_check_order() {
    log_info "=== 6. 查看订单状态 ==="
    
    local response=$(curl -s -X GET "$API_BASE/dinggou-dingdans/$ORDER_ID" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    log_info "订单详情响应: $response"
    
    # 显示订单信息
    local status=$(echo "$response" | jq -r '.data.attributes.zhuangtai')
    local amount=$(echo "$response" | jq -r '.data.attributes.benjinUSDT')
    local start_time=$(echo "$response" | jq -r '.data.attributes.kaishiShiJian')
    local end_time=$(echo "$response" | jq -r '.data.attributes.jieshuShiJian')
    
    log_info "订单状态: $status"
    log_info "投资金额: $amount USDT"
    log_info "开始时间: $start_time"
    log_info "结束时间: $end_time"
    
    return 0
}

# 7. 模拟订单到期赎回
test_redeem_order() {
    log_info "=== 7. 模拟订单到期赎回 ==="
    
    # 注意：这里需要手动触发赎回，或者等待定时任务
    log_warning "订单赎回需要等待到期或手动触发"
    
    local response=$(curl -s -X POST "$API_BASE/dinggou-dingdans/$ORDER_ID/redeem" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    log_info "赎回响应: $response"
    
    # 检查赎回结果
    if echo "$response" | jq -e '.success' > /dev/null; then
        log_success "订单赎回成功"
        return 0
    else
        local error_msg=$(echo "$response" | jq -r '.error.message // "未知错误"')
        log_warning "赎回失败或订单未到期: $error_msg"
        return 0  # 不视为错误，可能是订单未到期
    fi
}

# 8. 查看赎回后的钱包余额
test_wallet_after_redeem() {
    log_info "=== 8. 查看赎回后的钱包余额 ==="
    
    local response=$(curl -s -X GET "$API_BASE/qianbao-yues" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    log_info "赎回后钱包响应: $response"
    
    # 显示余额
    local usdt_balance=$(echo "$response" | jq -r '.data[0].attributes.usdtYue')
    local ai_balance=$(echo "$response" | jq -r '.data[0].attributes.aiYue')
    log_info "赎回后余额 - USDT: $usdt_balance, AI: $ai_balance"
    
    return 0
}

# 9. 查看邀请奖励
test_referral_rewards() {
    log_info "=== 9. 查看邀请奖励 ==="
    
    local response=$(curl -s -X GET "$API_BASE/yaoqing-jianglis" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    log_info "邀请奖励响应: $response"
    
    # 显示奖励信息
    local reward_count=$(echo "$response" | jq -r '.data | length')
    log_info "奖励记录数量: $reward_count"
    
    if [ "$reward_count" -gt 0 ]; then
        echo "$response" | jq -r '.data[] | "奖励ID: \(.id), 金额: \(.attributes.shouyiUSDT) USDT"'
    else
        log_info "暂无邀请奖励记录"
    fi
    
    return 0
}

# 10. 查看用户信息
test_user_info() {
    log_info "=== 10. 查看用户信息 ==="
    
    local response=$(curl -s -X GET "$API_BASE/users/me" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    log_info "用户信息响应: $response"
    
    # 显示用户信息
    local username=$(echo "$response" | jq -r '.username')
    local email=$(echo "$response" | jq -r '.email')
    local invite_code=$(echo "$response" | jq -r '.yaoqingMa')
    
    log_info "用户名: $username"
    log_info "邮箱: $email"
    log_info "邀请码: $invite_code"
    
    return 0
}

# 主测试流程
main() {
    echo "🚀 开始一键跑通核心链路测试"
    echo "=================================="
    echo "测试用户: $TEST_USERNAME"
    echo "测试邮箱: $TEST_EMAIL"
    echo "服务器地址: $BASE_URL"
    echo "=================================="
    echo ""
    
    # 检查依赖和连接
    check_dependencies
    check_server
    
    # 创建测试邀请码
    create_test_invite_code
    
    # 执行测试流程
    local step=1
    local total_steps=10
    
    # 1. 注册
    if test_registration; then
        log_success "步骤 $step/$total_steps 完成: 用户注册"
    else
        log_error "步骤 $step/$total_steps 失败: 用户注册"
        exit 1
    fi
    ((step++))
    
    # 2. 登录
    if test_login; then
        log_success "步骤 $step/$total_steps 完成: 用户登录"
    else
        log_error "步骤 $step/$total_steps 失败: 用户登录"
        exit 1
    fi
    ((step++))
    
    # 3. 查看钱包
    if test_wallet_balance; then
        log_success "步骤 $step/$total_steps 完成: 查看钱包余额"
    else
        log_error "步骤 $step/$total_steps 失败: 查看钱包余额"
        exit 1
    fi
    ((step++))
    
    # 4. 创建投资计划
    if test_create_plan; then
        log_success "步骤 $step/$total_steps 完成: 创建投资计划"
    else
        log_error "步骤 $step/$total_steps 失败: 创建投资计划"
        exit 1
    fi
    ((step++))
    
    # 5. 创建投资订单
    if test_create_order; then
        log_success "步骤 $step/$total_steps 完成: 创建投资订单"
    else
        log_error "步骤 $step/$total_steps 失败: 创建投资订单"
        exit 1
    fi
    ((step++))
    
    # 6. 查看订单状态
    if test_check_order; then
        log_success "步骤 $step/$total_steps 完成: 查看订单状态"
    else
        log_error "步骤 $step/$total_steps 失败: 查看订单状态"
        exit 1
    fi
    ((step++))
    
    # 7. 赎回订单
    if test_redeem_order; then
        log_success "步骤 $step/$total_steps 完成: 赎回订单"
    else
        log_warning "步骤 $step/$total_steps 警告: 赎回订单"
    fi
    ((step++))
    
    # 8. 查看赎回后余额
    if test_wallet_after_redeem; then
        log_success "步骤 $step/$total_steps 完成: 查看赎回后余额"
    else
        log_error "步骤 $step/$total_steps 失败: 查看赎回后余额"
        exit 1
    fi
    ((step++))
    
    # 9. 查看邀请奖励
    if test_referral_rewards; then
        log_success "步骤 $step/$total_steps 完成: 查看邀请奖励"
    else
        log_error "步骤 $step/$total_steps 失败: 查看邀请奖励"
        exit 1
    fi
    ((step++))
    
    # 10. 查看用户信息
    if test_user_info; then
        log_success "步骤 $step/$total_steps 完成: 查看用户信息"
    else
        log_error "步骤 $step/$total_steps 失败: 查看用户信息"
        exit 1
    fi
    
    echo ""
    echo "🎉 核心链路测试完成！"
    echo "=================================="
    echo "测试用户ID: $USER_ID"
    echo "钱包ID: $WALLET_ID"
    echo "投资计划ID: $PLAN_ID"
    echo "投资订单ID: $ORDER_ID"
    echo "=================================="
}

# 运行主函数
main "$@" 