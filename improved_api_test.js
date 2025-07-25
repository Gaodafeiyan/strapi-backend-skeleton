const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = 'DEF678901';
const TEST_TIMEOUT = 15000;

// 改进的测试用户数据
const testUser = {
  username: `testuser_${Date.now()}`.substring(0, 15), // 确保长度合适
  email: `test_${Date.now()}@example.com`,
  password: 'Test123456!',
  inviteCode: INVITE_CODE
};

// 全局变量
let authToken = null;
let userId = null;
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: []
};

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`
};

// 改进的测试函数
async function testEndpoint(method, endpoint, data = null, description = '', requiresAuth = false, expectedStatus = null) {
  testResults.total++;
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: TEST_TIMEOUT,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (requiresAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // 改进的请求数据格式
    if (data) {
      if (method === 'POST' && !endpoint.includes('/auth/')) {
        // 对于POST请求，确保包含data字段
        config.data = { data };
      } else {
        config.data = data;
      }
    }

    const startTime = Date.now();
    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    const statusOk = expectedStatus ? response.status === expectedStatus : (response.status >= 200 && response.status < 300);
    
    if (statusOk) {
      console.log(colors.green(`✅ ${description || endpoint} - 成功 (${response.status}) - ${responseTime}ms`));
      testResults.passed++;
      return response.data;
    } else if (response.status === 401) {
      console.log(colors.yellow(`🔒 ${description || endpoint} - 需要认证 (${response.status}) - ${responseTime}ms`));
      testResults.skipped++;
    } else if (response.status === 404) {
      console.log(colors.red(`❌ ${description || endpoint} - 未找到 (${response.status}) - ${responseTime}ms`));
      testResults.failed++;
      testResults.errors.push(`${description || endpoint}: 404 Not Found`);
    } else {
      console.log(colors.red(`⚠️ ${description || endpoint} - 错误 (${response.status}) - ${responseTime}ms`));
      if (response.data) {
        console.log(colors.red(`   错误信息: ${JSON.stringify(response.data)}`));
      }
      testResults.failed++;
      testResults.errors.push(`${description || endpoint}: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(colors.red(`❌ ${description || endpoint} - 请求失败: ${error.message}`));
    testResults.failed++;
    testResults.errors.push(`${description || endpoint}: ${error.message}`);
  }
}

// 改进的认证测试
async function testAuthAPIs() {
  console.log(colors.cyan('\n🔐 测试认证API...'));
  
  // 邀请码注册
  const registerData = {
    username: testUser.username,
    email: testUser.email,
    password: testUser.password,
    inviteCode: testUser.inviteCode
  };
  
  const registerResult = await testEndpoint('POST', '/api/auth/invite-register', registerData, '邀请码注册');
  
  if (registerResult && registerResult.success) {
    userId = registerResult.userId;
    console.log(colors.green(`   注册成功，用户ID: ${userId}`));
  }
  
  // 登录
  const loginData = {
    identifier: testUser.email,
    password: testUser.password
  };
  
  const loginResult = await testEndpoint('POST', '/api/auth/local', loginData, '用户登录');
  
  if (loginResult && loginResult.jwt) {
    authToken = loginResult.jwt;
    console.log(colors.green(`   登录成功，获取到Token`));
  }
  
  // 获取当前用户信息
  await testEndpoint('GET', '/api/users/me', null, '获取当前用户信息', true);
}

// 改进的钱包API测试
async function testWalletAPIs() {
  console.log(colors.cyan('\n💰 测试钱包API...'));
  
  await testEndpoint('GET', '/api/qianbao-yues', null, '获取钱包列表', true);
  await testEndpoint('GET', '/api/qianbao-yues/user-wallet', null, '获取用户钱包', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-balances', null, '获取代币余额', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-reward-records', null, '获取代币赠送记录', true);
}

// 改进的钱包地址API测试
async function testWalletAddressAPIs() {
  console.log(colors.cyan('\n📍 测试钱包地址API...'));
  
  await testEndpoint('GET', '/api/wallet-addresses', null, '获取钱包地址列表', true);
  await testEndpoint('POST', '/api/wallet-addresses', {
    address: '0x1234567890123456789012345678901234567890',
    chain: 'ETH',
    asset: 'USDT',
    description: '测试地址'
  }, '创建钱包地址', true);
}

// 主测试函数
async function runImprovedTests() {
  console.log(colors.blue('🚀 开始改进的API测试'));
  console.log(colors.blue(`目标服务器: ${BASE_URL}`));
  console.log(colors.blue(`测试用户: ${testUser.username}`));
  console.log(colors.blue('='.repeat(50)));
  
  try {
    await testAuthAPIs();
    await testWalletAPIs();
    await testWalletAddressAPIs();
    
    // 生成报告
    console.log(colors.magenta('\n📊 测试报告'));
    console.log(colors.magenta('='.repeat(50)));
    console.log(colors.cyan(`总测试数: ${testResults.total}`));
    console.log(colors.green(`通过: ${testResults.passed}`));
    console.log(colors.red(`失败: ${testResults.failed}`));
    console.log(colors.yellow(`跳过: ${testResults.skipped}`));
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(colors.cyan(`成功率: ${successRate}%`));
    
  } catch (error) {
    console.error(colors.red('测试过程中发生错误:'), error);
  }
}

// 运行测试
if (require.main === module) {
  runImprovedTests().catch(console.error);
}

module.exports = {
  runImprovedTests,
  testEndpoint,
  testResults
};