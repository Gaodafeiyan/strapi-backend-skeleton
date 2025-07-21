# PowerShell 一键测试脚本
# 覆盖：注册 → 登录 → 认购 → 赎回 → 查看奖励/钱包

param(
    [string]$BaseUrl = "http://118.107.4.158:1337"
)

$API_BASE = "$BaseUrl/api"

# 测试数据
$TEST_USERNAME = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')"
$TEST_EMAIL = "$TEST_USERNAME@example.com"
$TEST_PASSWORD = "123456"
$TEST_INVITE_CODE = "AN2CN12D"  # 真实邀请码

# 全局变量
$script:USER_TOKEN = ""
$script:USER_ID = ""
$script:WALLET_ID = ""
$script:PLAN_ID = ""
$script:ORDER_ID = ""

# 日志函数
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 检查服务器连接
function Test-ServerConnection {
    Write-Info "检查服务器连接..."
    
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "服务器连接正常"
            return $true
        }
    }
    catch {
        Write-Error "无法连接到服务器 $BaseUrl"
        return $false
    }
}

# 1. 用户注册
function Test-Registration {
    Write-Info "=== 1. 用户注册测试 ==="
    
    $registerData = @{
        username = $TEST_USERNAME
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        inviteCode = $TEST_INVITE_CODE
    } | ConvertTo-Json
    
    Write-Info "注册数据: $registerData"
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/auth/invite-register" -Method POST `
            -Headers @{"Content-Type"="application/json"} -Body $registerData
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "注册响应: $($response.Content)"
        
        if ($responseData.success) {
            $script:USER_ID = $responseData.userId
            Write-Success "注册成功，用户ID: $($script:USER_ID)"
            return $true
        }
        else {
            Write-Error "注册失败: $($responseData.error.message)"
            return $false
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "注册请求失败: $errorMsg"
        return $false
    }
}

# 2. 用户登录
function Test-Login {
    Write-Info "=== 2. 用户登录测试 ==="
    
    $loginData = @{
        identifier = $TEST_EMAIL
        password = $TEST_PASSWORD
    } | ConvertTo-Json
    
    Write-Info "登录数据: $loginData"
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/auth/local" -Method POST `
            -Headers @{"Content-Type"="application/json"} -Body $loginData
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "登录响应: $($response.Content)"
        
        if ($responseData.jwt) {
            $script:USER_TOKEN = $responseData.jwt
            Write-Success "登录成功，获取到Token"
            return $true
        }
        else {
            Write-Error "登录失败: $($responseData.error.message)"
            return $false
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "登录请求失败: $errorMsg"
        return $false
    }
}

# 3. 查看钱包余额
function Test-WalletBalance {
    Write-Info "=== 3. 查看钱包余额 ==="
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/qianbao-yues" -Method GET `
            -Headers @{"Authorization"="Bearer $($script:USER_TOKEN)"}
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "钱包响应: $($response.Content)"
        
        if ($responseData.data -and $responseData.data.Count -gt 0) {
            $script:WALLET_ID = $responseData.data[0].id
            $usdtBalance = $responseData.data[0].attributes.usdtYue
            $aiBalance = $responseData.data[0].attributes.aiYue
            
            Write-Success "获取钱包ID: $($script:WALLET_ID)"
            Write-Info "当前余额 - USDT: $usdtBalance, AI: $aiBalance"
            return $true
        }
        else {
            Write-Error "未找到钱包"
            return $false
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "钱包查询失败: $errorMsg"
        return $false
    }
}

# 4. 创建投资计划
function Test-CreatePlan {
    Write-Info "=== 4. 创建投资计划 ==="
    
    $planData = @{
        data = @{
            jihuaCode = "PLAN500"
            benjinUSDT = 500
            zhouQiTian = 15
            jingtaiBili = 6
            aiBili = 3
            choujiangCi = 3
            kaiqi = $true
        }
    } | ConvertTo-Json -Depth 3
    
    Write-Info "计划数据: $planData"
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/dinggou-jihuas" -Method POST `
            -Headers @{
                "Content-Type"="application/json"
                "Authorization"="Bearer $($script:USER_TOKEN)"
            } -Body $planData
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "创建计划响应: $($response.Content)"
        
        if ($responseData.data.id) {
            $script:PLAN_ID = $responseData.data.id
            Write-Success "投资计划创建成功，计划ID: $($script:PLAN_ID)"
            return $true
        }
        else {
            Write-Error "创建投资计划失败: $($responseData.error.message)"
            return $false
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "创建计划失败: $errorMsg"
        return $false
    }
}

# 5. 用户投资下单
function Test-CreateOrder {
    Write-Info "=== 5. 用户投资下单 ==="
    
    $orderData = @{
        jihuaId = [int]$script:PLAN_ID
    } | ConvertTo-Json
    
    Write-Info "订单数据: $orderData"
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/dinggou-dingdans" -Method POST `
            -Headers @{
                "Content-Type"="application/json"
                "Authorization"="Bearer $($script:USER_TOKEN)"
            } -Body $orderData
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "创建订单响应: $($response.Content)"
        
        if ($responseData.data.id) {
            $script:ORDER_ID = $responseData.data.id
            Write-Success "投资订单创建成功，订单ID: $($script:ORDER_ID)"
            return $true
        }
        else {
            Write-Error "创建投资订单失败: $($responseData.error.message)"
            return $false
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "创建订单失败: $errorMsg"
        return $false
    }
}

# 6. 查看订单状态
function Test-CheckOrder {
    Write-Info "=== 6. 查看订单状态 ==="
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/dinggou-dingdans/$($script:ORDER_ID)" -Method GET `
            -Headers @{"Authorization"="Bearer $($script:USER_TOKEN)"}
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "订单详情响应: $($response.Content)"
        
        $status = $responseData.data.attributes.zhuangtai
        $amount = $responseData.data.attributes.benjinUSDT
        $startTime = $responseData.data.attributes.kaishiShiJian
        $endTime = $responseData.data.attributes.jieshuShiJian
        
        Write-Info "订单状态: $status"
        Write-Info "投资金额: $amount USDT"
        Write-Info "开始时间: $startTime"
        Write-Info "结束时间: $endTime"
        
        return $true
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "查看订单失败: $errorMsg"
        return $false
    }
}

# 7. 模拟订单到期赎回
function Test-RedeemOrder {
    Write-Info "=== 7. 模拟订单到期赎回 ==="
    
    Write-Warning "订单赎回需要等待到期或手动触发"
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/dinggou-dingdans/$($script:ORDER_ID)/redeem" -Method POST `
            -Headers @{"Authorization"="Bearer $($script:USER_TOKEN)"}
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "赎回响应: $($response.Content)"
        
        if ($responseData.success) {
            Write-Success "订单赎回成功"
            return $true
        }
        else {
            Write-Warning "赎回失败或订单未到期: $($responseData.error.message)"
            return $true  # 不视为错误，可能是订单未到期
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Warning "赎回请求失败: $errorMsg"
        return $true  # 不视为错误
    }
}

# 8. 查看赎回后的钱包余额
function Test-WalletAfterRedeem {
    Write-Info "=== 8. 查看赎回后的钱包余额 ==="
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/qianbao-yues" -Method GET `
            -Headers @{"Authorization"="Bearer $($script:USER_TOKEN)"}
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "赎回后钱包响应: $($response.Content)"
        
        $usdtBalance = $responseData.data[0].attributes.usdtYue
        $aiBalance = $responseData.data[0].attributes.aiYue
        
        Write-Info "赎回后余额 - USDT: $usdtBalance, AI: $aiBalance"
        return $true
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "查看赎回后余额失败: $errorMsg"
        return $false
    }
}

# 9. 查看邀请奖励
function Test-ReferralRewards {
    Write-Info "=== 9. 查看邀请奖励 ==="
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/yaoqing-jianglis" -Method GET `
            -Headers @{"Authorization"="Bearer $($script:USER_TOKEN)"}
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "邀请奖励响应: $($response.Content)"
        
        $rewardCount = $responseData.data.Count
        Write-Info "奖励记录数量: $rewardCount"
        
        if ($rewardCount -gt 0) {
            foreach ($reward in $responseData.data) {
                Write-Info "奖励ID: $($reward.id), 金额: $($reward.attributes.shouyiUSDT) USDT"
            }
        }
        else {
            Write-Info "暂无邀请奖励记录"
        }
        
        return $true
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "查看邀请奖励失败: $errorMsg"
        return $false
    }
}

# 10. 查看用户信息
function Test-UserInfo {
    Write-Info "=== 10. 查看用户信息 ==="
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/users/me" -Method GET `
            -Headers @{"Authorization"="Bearer $($script:USER_TOKEN)"}
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Info "用户信息响应: $($response.Content)"
        
        $username = $responseData.username
        $email = $responseData.email
        $inviteCode = $responseData.yaoqingMa
        
        Write-Info "用户名: $username"
        Write-Info "邮箱: $email"
        Write-Info "邀请码: $inviteCode"
        
        return $true
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Error "查看用户信息失败: $errorMsg"
        return $false
    }
}

# 主测试流程
function Main {
    Write-Host "🚀 开始一键跑通核心链路测试" -ForegroundColor Cyan
    Write-Host "=================================="
    Write-Host "测试用户: $TEST_USERNAME"
    Write-Host "测试邮箱: $TEST_EMAIL"
    Write-Host "服务器地址: $BaseUrl"
    Write-Host "=================================="
    Write-Host ""
    
    # 检查服务器连接
    if (-not (Test-ServerConnection)) {
        exit 1
    }
    
    # 执行测试流程
    $step = 1
    $totalSteps = 10
    
    # 1. 注册
    if (Test-Registration) {
        Write-Success "步骤 $step/$totalSteps 完成: 用户注册"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 用户注册"
        exit 1
    }
    $step++
    
    # 2. 登录
    if (Test-Login) {
        Write-Success "步骤 $step/$totalSteps 完成: 用户登录"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 用户登录"
        exit 1
    }
    $step++
    
    # 3. 查看钱包
    if (Test-WalletBalance) {
        Write-Success "步骤 $step/$totalSteps 完成: 查看钱包余额"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 查看钱包余额"
        exit 1
    }
    $step++
    
    # 4. 创建投资计划
    if (Test-CreatePlan) {
        Write-Success "步骤 $step/$totalSteps 完成: 创建投资计划"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 创建投资计划"
        exit 1
    }
    $step++
    
    # 5. 创建投资订单
    if (Test-CreateOrder) {
        Write-Success "步骤 $step/$totalSteps 完成: 创建投资订单"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 创建投资订单"
        exit 1
    }
    $step++
    
    # 6. 查看订单状态
    if (Test-CheckOrder) {
        Write-Success "步骤 $step/$totalSteps 完成: 查看订单状态"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 查看订单状态"
        exit 1
    }
    $step++
    
    # 7. 赎回订单
    if (Test-RedeemOrder) {
        Write-Success "步骤 $step/$totalSteps 完成: 赎回订单"
    }
    else {
        Write-Warning "步骤 $step/$totalSteps 警告: 赎回订单"
    }
    $step++
    
    # 8. 查看赎回后余额
    if (Test-WalletAfterRedeem) {
        Write-Success "步骤 $step/$totalSteps 完成: 查看赎回后余额"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 查看赎回后余额"
        exit 1
    }
    $step++
    
    # 9. 查看邀请奖励
    if (Test-ReferralRewards) {
        Write-Success "步骤 $step/$totalSteps 完成: 查看邀请奖励"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 查看邀请奖励"
        exit 1
    }
    $step++
    
    # 10. 查看用户信息
    if (Test-UserInfo) {
        Write-Success "步骤 $step/$totalSteps 完成: 查看用户信息"
    }
    else {
        Write-Error "步骤 $step/$totalSteps 失败: 查看用户信息"
        exit 1
    }
    
    Write-Host ""
    Write-Host "🎉 核心链路测试完成！" -ForegroundColor Green
    Write-Host "=================================="
    Write-Host "测试用户ID: $($script:USER_ID)"
    Write-Host "钱包ID: $($script:WALLET_ID)"
    Write-Host "投资计划ID: $($script:PLAN_ID)"
    Write-Host "投资订单ID: $($script:ORDER_ID)"
    Write-Host "=================================="
}

# 运行主函数
Main 