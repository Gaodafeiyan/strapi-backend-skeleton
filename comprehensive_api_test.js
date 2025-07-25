const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = 'DEF678901';
const TEST_TIMEOUT = 15000;

// 测试用户数据
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'Test123456!',
  phone: '13800138000',
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
  await testEndpoint('GET', '/api/users-permissions/roles', null, '角色列表');
  await testEndpoint('GET', '/api/health', null, '健康检查');
}

// 2. 认证API测试
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
  await testEndpoint('POST', '/api/wallet-addresses', {
    address: '0x1234567890123456789012345678901234567890',
    type: 'ETH',
    label: '测试地址'
  }, '创建钱包地址', true);
}

// 5. 充值API测试
async function testRechargeAPIs() {
  console.log(colors.cyan('\n💳 测试充值API...'));
  
  await testEndpoint('GET', '/api/qianbao-chongzhis', null, '获取充值记录', true);
  await testEndpoint('POST', '/api/qianbao-chongzhis', {
    amount: '100',
    currency: 'USDT',
    paymentMethod: 'bank'
  }, '创建充值订单', true);
}

// 6. 提现API测试
async function testWithdrawAPIs() {
  console.log(colors.cyan('\n💸 测试提现API...'));
  
  await testEndpoint('GET', '/api/qianbao-tixians', null, '获取提现记录', true);
  await testEndpoint('POST', '/api/qianbao-tixians', {
    amount: '10',
    currency: 'USDT',
    address: '0x1234567890123456789012345678901234567890'
  }, '创建提现订单', true);
}

// 7. 认购计划API测试
async function testDinggouAPIs() {
  console.log(colors.cyan('\n📋 测试认购计划API...'));
  
  await testEndpoint('GET', '/api/dinggou-jihuas', null, '获取认购计划列表');
  await testEndpoint('GET', '/api/dinggou-jihuas/active', null, '获取活跃认购计划');
  await testEndpoint('POST', '/api/dinggou-jihuas', {
    name: '测试计划',
    description: '测试描述',
    targetAmount: '10000',
    currentAmount: '0',
    status: 'active'
  }, '创建认购计划', true);
}

// 8. 认购订单API测试
async function testDinggouOrderAPIs() {
  console.log(colors.cyan('\n📝 测试认购订单API...'));
  
  await testEndpoint('GET', '/api/dinggou-dingdans', null, '获取认购订单列表', true);
  await testEndpoint('POST', '/api/dinggou-dingdans', {
    jihuaId: 1,
    amount: '100',
    paymentMethod: 'wallet'
  }, '创建认购订单', true);
}

// 9. 邀请奖励API测试
async function testInviteAPIs() {
  console.log(colors.cyan('\n🎁 测试邀请奖励API...'));
  
  await testEndpoint('GET', '/api/yaoqing-jianglis', null, '获取邀请奖励列表', true);
  await testEndpoint('GET', '/api/yaoqing-jianglis/my-invites', null, '获取我的邀请记录', true);
  await testEndpoint('GET', '/api/yaoqing-jianglis/invite-stats', null, '获取邀请统计', true);
}

// 10. 抽奖API测试
async function testChoujiangAPIs() {
  console.log(colors.cyan('\n🎰 测试抽奖API...'));
  
  await testEndpoint('GET', '/api/choujiang-jihuis', null, '获取抽奖机会列表', true);
  await testEndpoint('GET', '/api/choujiang-jiangpins', null, '获取奖品列表');
  await testEndpoint('GET', '/api/choujiang-ji-lus', null, '获取抽奖记录', true);
  await testEndpoint('POST', '/api/choujiang-jihuis/draw', {
    jihuiId: 1
  }, '执行抽奖', true);
}

// 11. AI代币API测试
async function testAITokenAPIs() {
  console.log(colors.cyan('\n🤖 测试AI代币API...'));
  
  await testEndpoint('GET', '/api/ai-tokens', null, '获取AI代币列表');
  await testEndpoint('GET', '/api/ai-tokens/active', null, '获取活跃代币');
  await testEndpoint('GET', '/api/ai-tokens/market', null, '获取代币市场数据');
  await testEndpoint('POST', '/api/ai-tokens', {
    name: '测试代币',
    symbol: 'TEST',
    description: '测试代币描述',
    price: '0.01',
    status: 'active'
  }, '创建AI代币', true);
}

// 12. 代币奖励记录API测试
async function testTokenRewardAPIs() {
  console.log(colors.cyan('\n🏆 测试代币奖励记录API...'));
  
  await testEndpoint('GET', '/api/token-reward-records', null, '获取代币奖励记录', true);
  await testEndpoint('GET', '/api/token-reward-records/my-rewards', null, '获取我的奖励记录', true);
}

// 13. 商城API测试
async function testShopAPIs() {
  console.log(colors.cyan('\n🛒 测试商城API...'));
  
  await testEndpoint('GET', '/api/shop-products', null, '获取商品列表');
  await testEndpoint('GET', '/api/shop-carts', null, '获取购物车', true);
  await testEndpoint('POST', '/api/shop-carts', {
    productId: 1,
    quantity: 1
  }, '添加到购物车', true);
  await testEndpoint('GET', '/api/shop-orders', null, '获取订单列表', true);
  await testEndpoint('POST', '/api/shop-orders', {
    items: [{ productId: 1, quantity: 1 }],
    address: '测试地址'
  }, '创建订单', true);
}

// 14. 通知API测试
async function testNoticeAPIs() {
  console.log(colors.cyan('\n📢 测试通知API...'));
  
  await testEndpoint('GET', '/api/notices', null, '获取通知列表');
  await testEndpoint('GET', '/api/notices/active', null, '获取活跃通知');
  await testEndpoint('POST', '/api/notices', {
    title: '测试通知',
    content: '测试通知内容',
    type: 'system',
    status: 'active'
  }, '创建通知', true);
}

// 15. 内部消息API测试
async function testInternalMessageAPIs() {
  console.log(colors.cyan('\n💬 测试内部消息API...'));
  
  await testEndpoint('GET', '/api/internal-messages', null, '获取内部消息列表', true);
  await testEndpoint('POST', '/api/internal-messages', {
    title: '测试消息',
    content: '测试消息内容',
    recipientId: 1
  }, '发送内部消息', true);
}

// 16. 管理后台API测试
async function testAdminAPIs() {
  console.log(colors.cyan('\n⚙️ 测试管理后台API...'));
  
  await testEndpoint('GET', '/api/admin-dashboards', null, '获取管理仪表板', true);
  await testEndpoint('GET', '/api/admin-dashboards/stats', null, '获取统计数据', true);
}

// 17. 性能监控API测试
async function testPerformanceAPIs() {
  console.log(colors.cyan('\n📊 测试性能监控API...'));
  
  await testEndpoint('GET', '/api/performance-monitors', null, '获取性能监控数据', true);
  await testEndpoint('POST', '/api/performance-monitors', {
    endpoint: '/api/test',
    responseTime: 100,
    status: 200
  }, '记录性能数据', true);
}

// 18. 缓存API测试
async function testCacheAPIs() {
  console.log(colors.cyan('\n💾 测试缓存API...'));
  
  await testEndpoint('GET', '/api/caches', null, '获取缓存列表', true);
  await testEndpoint('POST', '/api/caches', {
    key: 'test_key',
    value: 'test_value',
    ttl: 3600
  }, '设置缓存', true);
  await testEndpoint('DELETE', '/api/caches/test_key', null, '删除缓存', true);
}

// 19. 队列API测试
async function testQueueAPIs() {
  console.log(colors.cyan('\n📋 测试队列API...'));
  
  await testEndpoint('GET', '/api/queues', null, '获取队列列表', true);
  await testEndpoint('GET', '/api/queues/status', null, '获取队列状态', true);
}

// 20. Webhook API测试
async function testWebhookAPIs() {
  console.log(colors.cyan('\n🔗 测试Webhook API...'));
  
  await testEndpoint('GET', '/api/webhooks', null, '获取Webhook列表', true);
  await testEndpoint('POST', '/api/webhooks', {
    url: 'https://example.com/webhook',
    events: ['user.created', 'order.completed'],
    secret: 'test_secret'
  }, '创建Webhook', true);
}

// 21. 用户管理API测试
async function testUserManagementAPIs() {
  console.log(colors.cyan('\n👥 测试用户管理API...'));
  
  await testEndpoint('GET', '/api/users', null, '获取用户列表', true);
  await testEndpoint('GET', '/api/users/count', null, '获取用户数量', true);
  await testEndpoint('PUT', `/api/users/${userId}`, {
    username: 'updated_username'
  }, '更新用户信息', true);
}

// 生成测试报告
function generateReport() {
  console.log(colors.magenta('\n📊 测试报告'));
  console.log(colors.magenta('='.repeat(50)));
  console.log(colors.cyan(`总测试数: ${testResults.total}`));
  console.log(colors.green(`通过: ${testResults.passed}`));
  console.log(colors.red(`失败: ${testResults.failed}`));
  console.log(colors.yellow(`跳过: ${testResults.skipped}`));
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  console.log(colors.cyan(`成功率: ${successRate}%`));
  
  if (testResults.errors.length > 0) {
    console.log(colors.red('\n❌ 错误详情:'));
    testResults.errors.forEach((error, index) => {
      console.log(colors.red(`${index + 1}. ${error}`));
    });
  }
  
  // 保存报告到文件
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results: testResults,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      successRate: successRate
    }
  };
  
  const reportPath = path.join(__dirname, `api_test_report_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colors.cyan(`\n📄 详细报告已保存到: ${reportPath}`));
}

// 主测试函数
async function runAllTests() {
  console.log(colors.blue('🚀 开始全面API测试'));
  console.log(colors.blue(`目标服务器: ${BASE_URL}`));
  console.log(colors.blue(`测试用户: ${testUser.username}`));
  console.log(colors.blue('='.repeat(50)));
  
  const startTime = Date.now();
  
  try {
    // 按顺序执行测试
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
    await testInternalMessageAPIs();
    await testAdminAPIs();
    await testPerformanceAPIs();
    await testCacheAPIs();
    await testQueueAPIs();
    await testWebhookAPIs();
    await testUserManagementAPIs();
    
    const totalTime = Date.now() - startTime;
    console.log(colors.blue(`\n⏱️ 总测试时间: ${totalTime}ms`));
    
    generateReport();
    
  } catch (error) {
    console.error(colors.red('测试过程中发生错误:'), error);
    generateReport();
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testEndpoint,
  testResults
}; 