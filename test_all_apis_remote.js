const axios = require('axios');
const fs = require('fs');

// 配置 - 使用远程服务器地址
const BASE_URL = 'http://118.107.4.158:1337';
const TEST_TIMEOUT = 15000;

// 测试用户数据
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'Test123456!',
  inviteCode: 'DEF678901'
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

// 测试函数
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

    if (data) {
      config.data = data;
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

// 1. 基础API测试
async function testBasicAPIs() {
  console.log(colors.cyan('\n🔍 测试基础API...'));
  
  await testEndpoint('GET', '/', null, '根路径');
  await testEndpoint('GET', '/admin', null, '管理后台');
  await testEndpoint('GET', '/api', null, 'API根路径');
  await testEndpoint('GET', '/api/users', null, '用户列表');
  await testEndpoint('GET', '/api/roles', null, '角色列表');
  await testEndpoint('GET', '/api/healths', null, '健康检查');
}

// 2. 认证API测试
async function testAuthAPIs() {
  console.log(colors.cyan('\n🔐 测试认证API...'));
  
  // 邀请码注册
  const registerResult = await testEndpoint('POST', '/auth/invite-register', {
    username: testUser.username,
    email: testUser.email,
    password: testUser.password,
    inviteCode: testUser.inviteCode
  }, '邀请码注册');
  
  if (registerResult && registerResult.success) {
    userId = registerResult.userId;
    console.log(colors.green(`   注册成功，用户ID: ${userId}`));
  }
  
  // 用户登录
  const loginResult = await testEndpoint('POST', '/api/auth/local', {
    identifier: testUser.email,
    password: testUser.password
  }, '用户登录');
  
  if (loginResult && loginResult.jwt) {
    authToken = loginResult.jwt;
    console.log(colors.green(`   登录成功，获取到Token`));
  }
  
  // 获取当前用户信息
  await testEndpoint('GET', '/api/users/me', null, '获取当前用户信息', true);
}

// 3. 钱包API测试
async function testWalletAPIs() {
  console.log(colors.cyan('\n💰 测试钱包API...'));
  
  await testEndpoint('GET', '/api/qianbao-yues', null, '获取钱包列表', true);
  await testEndpoint('GET', '/api/qianbao-yues/user-wallet', null, '获取用户钱包', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-balances', null, '获取代币余额', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-reward-records', null, '获取代币赠送记录', true);
}

// 4. 钱包地址API测试
async function testWalletAddressAPIs() {
  console.log(colors.cyan('\n📍 测试钱包地址API...'));
  
  await testEndpoint('GET', '/api/wallet-addresses', null, '获取钱包地址列表', true);
  
  // 测试创建钱包地址
  await testEndpoint('POST', '/api/wallet-addresses', {
    data: {
      address: '0x1234567890123456789012345678901234567890',
      chain: 'BSC',
      asset: 'USDT',
      description: '测试地址'
    }
  }, '创建钱包地址', true);
}

// 5. 充值API测试
async function testRechargeAPIs() {
  console.log(colors.cyan('\n💳 测试充值API...'));
  
  await testEndpoint('GET', '/api/qianbao-chongzhis', null, '获取充值记录', true);
  
  // 测试创建充值订单
  await testEndpoint('POST', '/api/qianbao-chongzhis', {
    data: {
      usdtJine: '100',
      yonghu: userId || 1
    }
  }, '创建充值订单', true);
  
  // 测试获取充值地址
  await testEndpoint('GET', '/api/qianbao-chongzhis/deposit-address', null, '获取充值地址', true);
}

// 6. 提现API测试
async function testWithdrawAPIs() {
  console.log(colors.cyan('\n💸 测试提现API...'));
  
  await testEndpoint('GET', '/api/qianbao-tixians', null, '获取提现记录', true);
  
  // 测试创建提现订单
  await testEndpoint('POST', '/api/qianbao-tixians', {
    data: {
      usdtJine: '50',
      tixianAddress: '0x1234567890123456789012345678901234567890'
    }
  }, '创建提现订单', true);
}

// 7. 投资计划API测试
async function testDinggouAPIs() {
  console.log(colors.cyan('\n📋 测试认购计划API...'));
  
  await testEndpoint('GET', '/api/dinggou-jihuas', null, '获取认购计划列表', true);
  await testEndpoint('GET', '/api/dinggou-jihuas/active', null, '获取活跃认购计划');
  
  // 测试创建认购计划
  await testEndpoint('POST', '/api/dinggou-jihuas', {
    data: {
      name: '测试投资计划',
      jine: '1000',
      qixian: 30,
      shouyi: '0.05'
    }
  }, '创建认购计划', true);
}

// 8. 投资订单API测试
async function testDinggouOrderAPIs() {
  console.log(colors.cyan('\n📝 测试认购订单API...'));
  
  await testEndpoint('GET', '/api/dinggou-dingdans', null, '获取认购订单列表', true);
  
  // 测试创建认购订单
  await testEndpoint('POST', '/api/dinggou-dingdans', {
    data: {
      jihuaId: 1
    }
  }, '创建认购订单', true);
}

// 9. 邀请奖励API测试
async function testInviteAPIs() {
  console.log(colors.cyan('\n🎁 测试邀请奖励API...'));
  
  await testEndpoint('GET', '/api/yaoqing-jianglis', null, '获取邀请奖励列表', true);
  await testEndpoint('GET', '/api/yaoqing-jianglis/my-invites', null, '获取我的邀请记录', true);
  await testEndpoint('GET', '/api/yaoqing-jianglis/stats', null, '获取邀请统计', true);
}

// 10. 抽奖API测试
async function testChoujiangAPIs() {
  console.log(colors.cyan('\n🎰 测试抽奖API...'));
  
  await testEndpoint('GET', '/api/choujiang-jihuis', null, '获取抽奖机会列表', true);
  await testEndpoint('GET', '/api/choujiang-jiangpins', null, '获取奖品列表');
  await testEndpoint('GET', '/api/choujiang-ji-lus', null, '获取抽奖记录', true);
  await testEndpoint('POST', '/api/choujiang-ji-lus/perform', null, '执行抽奖', true);
}

// 11. AI代币API测试
async function testAITokenAPIs() {
  console.log(colors.cyan('\n🤖 测试AI代币API...'));
  
  await testEndpoint('GET', '/api/ai-tokens', null, '获取AI代币列表');
  await testEndpoint('GET', '/api/ai-tokens/active', null, '获取活跃代币');
  await testEndpoint('GET', '/api/ai-tokens/1/price', null, '获取代币价格');
  await testEndpoint('GET', '/api/ai-tokens/prices/batch', null, '批量获取价格');
  await testEndpoint('GET', '/api/ai-tokens/market-data', null, '获取市场数据');
}

// 12. 代币奖励记录API测试
async function testTokenRewardAPIs() {
  console.log(colors.cyan('\n🎯 测试代币奖励记录API...'));
  
  await testEndpoint('GET', '/api/token-reward-records', null, '获取代币奖励记录列表', true);
  await testEndpoint('GET', '/api/token-reward-records/my-rewards', null, '获取我的奖励记录', true);
}

// 13. 商城API测试
async function testShopAPIs() {
  console.log(colors.cyan('\n🛒 测试商城API...'));
  
  await testEndpoint('GET', '/api/shop-products', null, '获取商品列表');
  await testEndpoint('GET', '/api/shop-carts', null, '获取购物车', true);
  await testEndpoint('GET', '/api/shop-orders', null, '获取订单列表', true);
}

// 14. 通知API测试
async function testNoticeAPIs() {
  console.log(colors.cyan('\n📢 测试通知API...'));
  
  await testEndpoint('GET', '/api/notices', null, '获取通知列表');
  await testEndpoint('GET', '/api/internal-messages', null, '获取内部消息', true);
}

// 15. 管理API测试
async function testAdminAPIs() {
  console.log(colors.cyan('\n⚙️ 测试管理API...'));
  
  await testEndpoint('GET', '/api/admin-dashboards', null, '获取管理面板数据', true);
  await testEndpoint('GET', '/api/performance-monitors', null, '获取性能监控数据', true);
}

// 16. 缓存和队列API测试
async function testSystemAPIs() {
  console.log(colors.cyan('\n🔧 测试系统API...'));
  
  await testEndpoint('GET', '/api/caches', null, '获取缓存状态', true);
  await testEndpoint('GET', '/api/queues', null, '获取队列状态', true);
  await testEndpoint('GET', '/api/webhooks', null, '获取Webhook列表', true);
}

// 17. 其他可能的API测试
async function testOtherAPIs() {
  console.log(colors.cyan('\n🔍 测试其他可能的API...'));
  
  // 测试一些可能存在的其他API
  await testEndpoint('GET', '/api/upload', null, '文件上传API');
  await testEndpoint('GET', '/api/email', null, '邮件API');
  await testEndpoint('GET', '/api/sms', null, '短信API');
  await testEndpoint('GET', '/api/payment', null, '支付API');
  await testEndpoint('GET', '/api/withdrawal', null, '提现API');
  await testEndpoint('GET', '/api/deposit', null, '充值API');
  await testEndpoint('GET', '/api/investment', null, '投资API');
  await testEndpoint('GET', '/api/lottery', null, '抽奖API');
  await testEndpoint('GET', '/api/reward', null, '奖励API');
  await testEndpoint('GET', '/api/notification', null, '通知API');
}

// 生成测试报告
function generateReport() {
  console.log(colors.cyan('\n📊 测试报告'));
  console.log(colors.cyan('='.repeat(50)));
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  
  console.log(colors.blue(`总测试数: ${testResults.total}`));
  console.log(colors.green(`通过: ${testResults.passed}`));
  console.log(colors.red(`失败: ${testResults.failed}`));
  console.log(colors.yellow(`跳过: ${testResults.skipped}`));
  console.log(colors.blue(`成功率: ${successRate}%`));
  
  if (testResults.errors.length > 0) {
    console.log(colors.red('\n❌ 错误详情:'));
    testResults.errors.forEach((error, index) => {
      console.log(colors.red(`${index + 1}. ${error}`));
    });
  }
  
  // 保存测试报告
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    testUser: testUser.username,
    results: testResults,
    summary: {
      successRate,
      totalTests: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped
    }
  };
  
  const reportFile = `api_test_report_remote_${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(colors.blue(`\n📄 测试报告已保存到: ${reportFile}`));
  
  // API状态评估
  console.log(colors.cyan('\n🎯 API状态评估:'));
  if (successRate >= 80) {
    console.log(colors.green('✅ 优秀！大部分API正常工作'));
  } else if (successRate >= 60) {
    console.log(colors.yellow('⚠️ 良好！部分API需要修复'));
  } else {
    console.log(colors.red('❌ 需要大量修复！API问题较多'));
  }
  
  // 具体问题分析
  console.log(colors.cyan('\n🔍 问题分析:'));
  const errorTypes = {};
  testResults.errors.forEach(error => {
    if (error.includes('404')) {
      errorTypes['404 Not Found'] = (errorTypes['404 Not Found'] || 0) + 1;
    } else if (error.includes('401')) {
      errorTypes['401 Unauthorized'] = (errorTypes['401 Unauthorized'] || 0) + 1;
    } else if (error.includes('500')) {
      errorTypes['500 Server Error'] = (errorTypes['500 Server Error'] || 0) + 1;
    } else {
      errorTypes['Other Errors'] = (errorTypes['Other Errors'] || 0) + 1;
    }
  });
  
  Object.entries(errorTypes).forEach(([type, count]) => {
    console.log(colors.red(`   ${type}: ${count}个`));
  });
}

// 运行所有测试
async function runAllTests() {
  console.log(colors.magenta('🚀 开始全面API排查测试'));
  console.log(colors.blue(`目标服务器: ${BASE_URL}`));
  console.log(colors.blue(`测试用户: ${testUser.username}`));
  console.log(colors.blue(`测试时间: ${new Date().toLocaleString()}`));
  
  try {
    await testBasicAPIs();
    await testAuthAPIs();
    await testWalletAPIs();
    await testWalletAddressAPIs();
    await testRechargeAPIs();
    await testWithdrawAPIs();
    await testDinggouAPIs();
    await testDinggouOrderAPIs();
    await testInviteAPIs();
    await testChoujiangAPIs();
    await testAITokenAPIs();
    await testTokenRewardAPIs();
    await testShopAPIs();
    await testNoticeAPIs();
    await testAdminAPIs();
    await testSystemAPIs();
    await testOtherAPIs();
    
    generateReport();
  } catch (error) {
    console.error(colors.red('测试过程中发生错误:'), error);
  }
}

// 执行测试
runAllTests(); 