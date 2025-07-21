# PowerShell 测试真实邀请码 AN2CN12D
param(
    [string]$BaseUrl = "http://118.107.4.158:1337"
)

$API_BASE = "$BaseUrl/api"

# 测试数据
$TEST_USERNAME = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')"
$TEST_EMAIL = "$TEST_USERNAME@example.com"
$TEST_PASSWORD = "123456"
$REAL_INVITE_CODE = "AN2CN12D"

Write-Host "🧪 测试真实邀请码 AN2CN12D" -ForegroundColor Cyan
Write-Host "=================================="
Write-Host "测试用户: $TEST_USERNAME"
Write-Host "测试邮箱: $TEST_EMAIL"
Write-Host "真实邀请码: $REAL_INVITE_CODE"
Write-Host ""

# 1. 测试真实邀请码注册
Write-Host "1. 测试真实邀请码注册..." -ForegroundColor Blue

$registerData = @{
    username = $TEST_USERNAME
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
    inviteCode = $REAL_INVITE_CODE
} | ConvertTo-Json

Write-Host "注册数据: $registerData"

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/auth/invite-register" -Method POST `
        -Headers @{"Content-Type"="application/json"} -Body $registerData
    
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "注册响应: $($response.Content)"
    
    if ($responseData.success) {
        Write-Host "✅ 真实邀请码注册成功！" -ForegroundColor Green
        
        $USER_ID = $responseData.userId
        $NEW_INVITE_CODE = $responseData.inviteCode
        
        Write-Host "用户ID: $USER_ID"
        Write-Host "生成的邀请码: $NEW_INVITE_CODE"
        
        # 2. 测试登录
        Write-Host "2. 测试登录..." -ForegroundColor Blue
        
        $loginData = @{
            identifier = $TEST_EMAIL
            password = $TEST_PASSWORD
        } | ConvertTo-Json
        
        $loginResponse = Invoke-WebRequest -Uri "$API_BASE/auth/local" -Method POST `
            -Headers @{"Content-Type"="application/json"} -Body $loginData
        
        $loginData = $loginResponse.Content | ConvertFrom-Json
        Write-Host "登录响应: $($loginResponse.Content)"
        
        if ($loginData.jwt) {
            Write-Host "✅ 登录成功！" -ForegroundColor Green
            
            $JWT_TOKEN = $loginData.jwt
            Write-Host "JWT Token: $($JWT_TOKEN.Substring(0, [Math]::Min(20, $JWT_TOKEN.Length)))..."
            
            # 3. 查看钱包
            Write-Host "3. 查看钱包..." -ForegroundColor Blue
            
            $walletResponse = Invoke-WebRequest -Uri "$API_BASE/qianbao-yues" -Method GET `
                -Headers @{"Authorization"="Bearer $JWT_TOKEN"}
            
            $walletData = $walletResponse.Content | ConvertFrom-Json
            Write-Host "钱包响应: $($walletResponse.Content)"
            
            if ($walletData.data -and $walletData.data.Count -gt 0) {
                Write-Host "✅ 钱包查询成功！" -ForegroundColor Green
                
                $USDT_BALANCE = $walletData.data[0].attributes.usdtYue
                $AI_BALANCE = $walletData.data[0].attributes.aiYue
                
                Write-Host "USDT余额: $USDT_BALANCE"
                Write-Host "AI余额: $AI_BALANCE"
            }
            else {
                Write-Host "❌ 钱包查询失败" -ForegroundColor Red
            }
            
            # 4. 查看用户信息
            Write-Host "4. 查看用户信息..." -ForegroundColor Blue
            
            $userResponse = Invoke-WebRequest -Uri "$API_BASE/users/me" -Method GET `
                -Headers @{"Authorization"="Bearer $JWT_TOKEN"}
            
            $userData = $userResponse.Content | ConvertFrom-Json
            Write-Host "用户信息响应: $($userResponse.Content)"
            
            if ($userData.username) {
                Write-Host "✅ 用户信息查询成功！" -ForegroundColor Green
                
                Write-Host "用户名: $($userData.username)"
                Write-Host "邮箱: $($userData.email)"
                Write-Host "用户邀请码: $($userData.yaoqingMa)"
            }
            else {
                Write-Host "❌ 用户信息查询失败" -ForegroundColor Red
            }
        }
        else {
            Write-Host "❌ 登录失败" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ 真实邀请码注册失败" -ForegroundColor Red
        Write-Host "错误信息: $($responseData.error.message)"
    }
}
catch {
    Write-Host "❌ 注册请求失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 真实邀请码测试完成！" -ForegroundColor Green
Write-Host "==================================" 