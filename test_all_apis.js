const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试用户数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123456!',
  phone: '13800138000'
};

let authToken = null;
let userId = null;

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// 测试函数
async function testEndpoint(method, endpoint, data = null, description = '', requiresAuth = false) {
  testResults.total++;
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
      validateStatus: () => true
    };

    if (requiresAuth && authToken) {
      config.headers = { Authorization: `Bearer ${authToken}` };
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(colors.green(`✅ ${description || endpoint} - 成功 (${response.status})`));
      testResults.passed++;
      return response.data;
    } else if (response.status === 401) {
      console.log(colors.yellow(`🔒 ${description || endpoint} - 需要认证 (${response.status})`));
      testResults.skipped++;
    } else if (response.status === 404) {
      console.log(colors.red(`❌ ${description || endpoint} - 未找到 (${response.status})`));
      testResults.failed++;
    } else {
      console.log(colors.red(`⚠️ ${description || endpoint} - 错误 (${response.status})`));
      testResults.failed++;
    }
  } catch (error) {
    console.log(colors.red(`❌ ${description || endpoint} - 请求失败: ${error.message}`));
    testResults.failed++;
  }
}

// 1. 测试基础API
async function testBasicAPIs() {
  console.log(colors.cyan('\n🔍 测试基础API...'));
  
  await testEndpoint('GET', '/', null, '根路径');
  await testEndpoint('GET', '/admin', null, '管理后台');
  await testEndpoint('GET', '/api', null, 'API根路径');
  await testEndpoint('GET', '/api/users', null, '用户列表');
  await testEndpoint('GET', '/api/users-permissions/roles', null, '角色列表');
}

// 2. 测试认证相关API
async function testAuthAPIs() {
  console.log(colors.cyan('\n🔐 测试认证API...'));
  
  // 注册
  const registerData = {
    username: testUser.username,
    email: testUser.email,
    password: testUser.password,
    phone: testUser.phone
  };
  
  const registerResult = await testEndpoint('POST', '/api/auth/local/register', registerData, '用户注册');
  
  if (registerResult && registerResult.jwt) {
    authToken = registerResult.jwt;
    userId = registerResult.user.id;
    console.log(colors.green(`🔑 获取到认证令牌，用户ID: ${userId}`));
  }
  
  // 登录
  const loginData = {
    identifier: testUser.email,
    password: testUser.password
  };
  
  await testEndpoint('POST', '/api/auth/local', loginData, '用户登录');
  
  // 忘记密码
  await testEndpoint('POST', '/api/auth/forgot-password', {
    email: testUser.email
  }, '忘记密码');
}

// 3. 测试通知API
async function testNoticeAPIs() {
  console.log(colors.cyan('\n📢 测试通知API...'));
  
  await testEndpoint('GET', '/api/notices', null, '获取通知列表', true);
  await testEndpoint('GET', '/api/notices/1', null, '获取单个通知', true);
  await testEndpoint('POST', '/api/notices', {
    data: {
      title: '测试通知',
      content: '这是一个测试通知',
      type: 'system'
    }
  }, '创建通知', true);
}

// 4. 测试钱包相关API
async function testWalletAPIs() {
  console.log(colors.cyan('\n💰 测试钱包API...'));
  
  await testEndpoint('GET', '/api/qianbao-yues', null, '获取钱包余额', true);
  await testEndpoint('GET', '/api/wallet-addresses', null, '获取钱包地址', true);
  await testEndpoint('POST', '/api/wallet-addresses', {
    data: {
      address: '0x1234567890abcdef',
      type: 'eth'
    }
  }, '添加钱包地址', true);
  
  // 充值
  await testEndpoint('POST', '/api/qianbao-chongzhis', {
    data: {
      amount: 100,
      currency: 'USDT',
      address: '0x1234567890abcdef'
    }
  }, '创建充值记录', true);
  
  // 提现
  await testEndpoint('POST', '/api/qianbao-tixians', {
    data: {
      amount: 50,
      currency: 'USDT',
      address: '0x1234567890abcdef'
    }
  }, '创建提现记录', true);
}

// 5. 测试认购计划API
async function testDinggouAPIs() {
  console.log(colors.cyan('\n📋 测试认购计划API...'));
  
  await testEndpoint('GET', '/api/dinggou-jihuas', null, '获取认购计划列表');
  await testEndpoint('GET', '/api/dinggou-jihuas/1', null, '获取单个认购计划');
  await testEndpoint('POST', '/api/dinggou-jihuas', {
    data: {
      name: '测试计划',
      description: '测试认购计划',
      price: 100,
      total_supply: 1000,
      status: 'active'
    }
  }, '创建认购计划', true);
  
  // 认购订单
  await testEndpoint('GET', '/api/dinggou-dingdans', null, '获取认购订单列表', true);
  await testEndpoint('POST', '/api/dinggou-dingdans', {
    data: {
      jihua_id: 1,
      quantity: 10,
      total_amount: 1000
    }
  }, '创建认购订单', true);
}

// 6. 测试邀请奖励API
async function testInviteAPIs() {
  console.log(colors.cyan('\n🎁 测试邀请奖励API...'));
  
  await testEndpoint('GET', '/api/yaoqing-jianglis', null, '获取邀请奖励列表', true);
  await testEndpoint('POST', '/api/yaoqing-jianglis', {
    data: {
      inviter_id: 1,
      invitee_id: 2,
      reward_amount: 10,
      reward_type: 'token'
    }
  }, '创建邀请奖励记录', true);
}

// 7. 测试抽奖系统API
async function testChoujiangAPIs() {
  console.log(colors.cyan('\n🎰 测试抽奖系统API...'));
  
  await testEndpoint('GET', '/api/choujiang-jihuis', null, '获取抽奖机会', true);
  await testEndpoint('GET', '/api/choujiang-jiangpins', null, '获取奖品列表');
  await testEndpoint('GET', '/api/choujiang-ji-lus', null, '获取抽奖记录', true);
  await testEndpoint('POST', '/api/choujiang-ji-lus', {
    data: {
      user_id: userId,
      jiangpin_id: 1,
      status: 'pending'
    }
  }, '创建抽奖记录', true);
}

// 8. 测试AI代币系统API
async function testAITokenAPIs() {
  console.log(colors.cyan('\n🤖 测试AI代币系统API...'));
  
  await testEndpoint('GET', '/api/ai-tokens', null, '获取AI代币列表', true);
  await testEndpoint('POST', '/api/ai-tokens', {
    data: {
      name: '测试AI代币',
      symbol: 'TEST',
      total_supply: 1000000,
      price: 1.0
    }
  }, '创建AI代币', true);
}

// 9. 测试商城系统API
async function testShopAPIs() {
  console.log(colors.cyan('\n🛒 测试商城系统API...'));
  
  // 商品
  await testEndpoint('GET', '/api/shop-products', null, '获取商品列表');
  await testEndpoint('GET', '/api/shop-products/1', null, '获取单个商品');
  await testEndpoint('POST', '/api/shop-products', {
    data: {
      name: '测试商品',
      description: '测试商品描述',
      price: 99.99,
      stock: 100
    }
  }, '创建商品', true);
  
  // 购物车
  await testEndpoint('GET', '/api/shop-carts', null, '获取购物车', true);
  await testEndpoint('POST', '/api/shop-carts', {
    data: {
      product_id: 1,
      quantity: 2
    }
  }, '添加到购物车', true);
  
  // 订单
  await testEndpoint('GET', '/api/shop-orders', null, '获取订单列表', true);
  await testEndpoint('POST', '/api/shop-orders', {
    data: {
      items: [{ product_id: 1, quantity: 1 }],
      total_amount: 99.99
    }
  }, '创建订单', true);
}

// 10. 测试其他API
async function testOtherAPIs() {
  console.log(colors.cyan('\n🔧 测试其他API...'));
  
  await testEndpoint('GET', '/api/health', null, '健康检查');
  await testEndpoint('GET', '/api/performance-monitors', null, '性能监控', true);
  await testEndpoint('GET', '/api/internal-messages', null, '内部消息', true);
  await testEndpoint('GET', '/api/admin-dashboards', null, '管理仪表板', true);
  await testEndpoint('GET', '/api/caches', null, '缓存管理', true);
  await testEndpoint('GET', '/api/token-reward-records', null, '代币奖励记录', true);
  await testEndpoint('GET', '/api/queues', null, '队列管理', true);
  await testEndpoint('GET', '/api/webhooks', null, 'Webhook管理', true);
}

// 11. 测试用户管理API
async function testUserManagementAPIs() {
  console.log(colors.cyan('\n👥 测试用户管理API...'));
  
  await testEndpoint('GET', '/api/users/me', null, '获取当前用户信息', true);
  await testEndpoint('PUT', '/api/users/me', {
    username: 'updateduser',
    email: 'updated@example.com'
  }, '更新用户信息', true);
  
  if (userId) {
    await testEndpoint('GET', `/api/users/${userId}`, null, '获取指定用户信息', true);
  }
}

// 主测试函数
async function runAllTests() {
  console.log(colors.blue('🚀 开始全面测试后端API...\n'));
  
  try {
    await testBasicAPIs();
    await testAuthAPIs();
    await testNoticeAPIs();
    await testWalletAPIs();
    await testDinggouAPIs();
    await testInviteAPIs();
    await testChoujiangAPIs();
    await testAITokenAPIs();
    await testShopAPIs();
    await testOtherAPIs();
    await testUserManagementAPIs();
    
    // 输出测试结果统计
    console.log(colors.cyan('\n📊 测试结果统计:'));
    console.log(colors.green(`✅ 通过: ${testResults.passed}`));
    console.log(colors.red(`❌ 失败: ${testResults.failed}`));
    console.log(colors.yellow(`⏭️ 跳过: ${testResults.skipped}`));
    console.log(colors.blue(`📈 总计: ${testResults.total}`));
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(colors.cyan(`📊 成功率: ${successRate}%`));
    
    if (testResults.failed === 0) {
      console.log(colors.green('\n🎉 所有API测试完成！'));
    } else {
      console.log(colors.yellow('\n⚠️ 部分API测试失败，请检查相关接口。'));
    }
    
  } catch (error) {
    console.error(colors.red('❌ 测试过程中发生错误:'), error);
  }
}

// 运行测试
runAllTests(); 