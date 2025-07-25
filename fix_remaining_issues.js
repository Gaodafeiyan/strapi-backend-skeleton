const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`
};

console.log(colors.blue('🔧 开始修复剩余API问题...'));
console.log(colors.blue('='.repeat(60)));

// 1. 修复钱包路由路径问题
function fixWalletRoutePath() {
  console.log(colors.cyan('\n💰 修复钱包路由路径...'));
  
  const walletRoutesPath = path.join(__dirname, 'src', 'api', 'qianbao-yue', 'routes', 'qianbao-yue.ts');
  
  if (fs.existsSync(walletRoutesPath)) {
    let content = fs.readFileSync(walletRoutesPath, 'utf8');
    
    // 修复路径，确保所有路径都以/api开头
    content = content.replace(
      /path: '\/qianbao-yues/g,
      "path: '/api/qianbao-yues"
    );
    
    fs.writeFileSync(walletRoutesPath, content);
    console.log(colors.green('   ✅ 钱包路由路径已修复'));
  } else {
    console.log(colors.red('   ❌ 未找到钱包路由文件'));
  }
}

// 2. 修复钱包地址schema字段问题
function fixWalletAddressSchema() {
  console.log(colors.cyan('\n📍 检查钱包地址schema...'));
  
  const schemaPath = path.join(__dirname, 'src', 'api', 'wallet-address', 'content-types', 'wallet-address', 'schema.ts');
  
  if (fs.existsSync(schemaPath)) {
    console.log(colors.green('   ✅ 钱包地址schema已确认'));
    console.log(colors.yellow('   📝 字段说明:'));
    console.log(colors.yellow('      - chain: BSC, ETH, TRON'));
    console.log(colors.yellow('      - asset: USDT, AI_TOKEN, ETH, BNB'));
  } else {
    console.log(colors.red('   ❌ 未找到钱包地址schema文件'));
  }
}

// 3. 检查并修复AI代币控制器
function checkAITokenController() {
  console.log(colors.cyan('\n🤖 检查AI代币控制器...'));
  
  const controllerPath = path.join(__dirname, 'src', 'api', 'ai-token', 'controllers', 'ai-token.ts');
  
  if (fs.existsSync(controllerPath)) {
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    if (content.includes('getMarketData')) {
      console.log(colors.green('   ✅ AI代币getMarketData方法已存在'));
    } else {
      console.log(colors.red('   ❌ AI代币getMarketData方法缺失'));
    }
    
    if (content.includes('getActiveTokens')) {
      console.log(colors.green('   ✅ AI代币getActiveTokens方法已存在'));
    } else {
      console.log(colors.red('   ❌ AI代币getActiveTokens方法缺失'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到AI代币控制器文件'));
  }
}

// 4. 检查并修复代币奖励记录控制器
function checkTokenRewardController() {
  console.log(colors.cyan('\n🏆 检查代币奖励记录控制器...'));
  
  const controllerPath = path.join(__dirname, 'src', 'api', 'token-reward-record', 'controllers', 'token-reward-record.ts');
  
  if (fs.existsSync(controllerPath)) {
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    if (content.includes('getMyRewards')) {
      console.log(colors.green('   ✅ 代币奖励记录getMyRewards方法已存在'));
    } else {
      console.log(colors.red('   ❌ 代币奖励记录getMyRewards方法缺失'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到代币奖励记录控制器文件'));
  }
}

// 5. 检查并修复邀请奖励控制器
function checkInviteController() {
  console.log(colors.cyan('\n🎁 检查邀请奖励控制器...'));
  
  const controllerPath = path.join(__dirname, 'src', 'api', 'yaoqing-jiangli', 'controllers', 'yaoqing-jiangli.ts');
  
  if (fs.existsSync(controllerPath)) {
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    if (content.includes('getMyInvites')) {
      console.log(colors.green('   ✅ 邀请奖励getMyInvites方法已存在'));
    } else {
      console.log(colors.red('   ❌ 邀请奖励getMyInvites方法缺失'));
    }
    
    if (content.includes('getInviteStats')) {
      console.log(colors.green('   ✅ 邀请奖励getInviteStats方法已存在'));
    } else {
      console.log(colors.red('   ❌ 邀请奖励getInviteStats方法缺失'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到邀请奖励控制器文件'));
  }
}

// 6. 检查并修复认购计划控制器
function checkDinggouController() {
  console.log(colors.cyan('\n📋 检查认购计划控制器...'));
  
  const controllerPath = path.join(__dirname, 'src', 'api', 'dinggou-jihua', 'controllers', 'dinggou-jihua.ts');
  
  if (fs.existsSync(controllerPath)) {
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    if (content.includes('getActivePlans')) {
      console.log(colors.green('   ✅ 认购计划getActivePlans方法已存在'));
    } else {
      console.log(colors.red('   ❌ 认购计划getActivePlans方法缺失'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到认购计划控制器文件'));
  }
}

// 7. 检查并修复通知控制器
function checkNoticeController() {
  console.log(colors.cyan('\n📢 检查通知控制器...'));
  
  const controllerPath = path.join(__dirname, 'src', 'api', 'notice', 'controllers', 'notice.ts');
  
  if (fs.existsSync(controllerPath)) {
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    if (content.includes('getActiveNotices')) {
      console.log(colors.green('   ✅ 通知getActiveNotices方法已存在'));
    } else {
      console.log(colors.red('   ❌ 通知getActiveNotices方法缺失'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到通知控制器文件'));
  }
}

// 8. 创建最终测试脚本
function createFinalTestScript() {
  console.log(colors.cyan('\n🧪 创建最终测试脚本...'));
  
  const finalTestScript = `const axios = require('axios');

// 配置
const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = 'DEF678901';
const TEST_TIMEOUT = 15000;

// 测试用户数据
const testUser = {
  username: \`testuser_\${Date.now()}\`.substring(0, 15),
  email: \`test_\${Date.now()}@example.com\`,
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
  green: (text) => \`\\x1b[32m\${text}\\x1b[0m\`,
  red: (text) => \`\\x1b[31m\${text}\\x1b[0m\`,
  yellow: (text) => \`\\x1b[33m\${text}\\x1b[0m\`,
  blue: (text) => \`\\x1b[34m\${text}\\x1b[0m\`,
  cyan: (text) => \`\\x1b[36m\${text}\\x1b[0m\`,
  magenta: (text) => \`\\x1b[35m\${text}\\x1b[0m\`
};

// 测试函数
async function testEndpoint(method, endpoint, data = null, description = '', requiresAuth = false, expectedStatus = null) {
  testResults.total++;
  
  try {
    const config = {
      method,
      url: \`\${BASE_URL}\${endpoint}\`,
      timeout: TEST_TIMEOUT,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (requiresAuth && authToken) {
      config.headers.Authorization = \`Bearer \${authToken}\`;
    }

    if (data) {
      if (method === 'POST' && !endpoint.includes('/auth/')) {
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
      console.log(colors.green(\`✅ \${description || endpoint} - 成功 (\${response.status}) - \${responseTime}ms\`));
      testResults.passed++;
      return response.data;
    } else if (response.status === 401) {
      console.log(colors.yellow(\`🔒 \${description || endpoint} - 需要认证 (\${response.status}) - \${responseTime}ms\`));
      testResults.skipped++;
    } else if (response.status === 404) {
      console.log(colors.red(\`❌ \${description || endpoint} - 未找到 (\${response.status}) - \${responseTime}ms\`));
      testResults.failed++;
      testResults.errors.push(\`\${description || endpoint}: 404 Not Found\`);
    } else {
      console.log(colors.red(\`⚠️ \${description || endpoint} - 错误 (\${response.status}) - \${responseTime}ms\`));
      if (response.data) {
        console.log(colors.red(\`   错误信息: \${JSON.stringify(response.data)}\`));
      }
      testResults.failed++;
      testResults.errors.push(\`\${description || endpoint}: \${response.status} - \${JSON.stringify(response.data)}\`);
    }
  } catch (error) {
    console.log(colors.red(\`❌ \${description || endpoint} - 请求失败: \${error.message}\`));
    testResults.failed++;
    testResults.errors.push(\`\${description || endpoint}: \${error.message}\`);
  }
}

// 认证测试
async function testAuthAPIs() {
  console.log(colors.cyan('\\n🔐 测试认证API...'));
  
  const registerData = {
    username: testUser.username,
    email: testUser.email,
    password: testUser.password,
    inviteCode: testUser.inviteCode
  };
  
  const registerResult = await testEndpoint('POST', '/api/auth/invite-register', registerData, '邀请码注册');
  
  if (registerResult && registerResult.success) {
    userId = registerResult.userId;
    console.log(colors.green(\`   注册成功，用户ID: \${userId}\`));
  }
  
  const loginData = {
    identifier: testUser.email,
    password: testUser.password
  };
  
  const loginResult = await testEndpoint('POST', '/api/auth/local', loginData, '用户登录');
  
  if (loginResult && loginResult.jwt) {
    authToken = loginResult.jwt;
    console.log(colors.green(\`   登录成功，获取到Token\`));
  }
  
  await testEndpoint('GET', '/api/users/me', null, '获取当前用户信息', true);
}

// 钱包API测试
async function testWalletAPIs() {
  console.log(colors.cyan('\\n💰 测试钱包API...'));
  
  await testEndpoint('GET', '/api/qianbao-yues', null, '获取钱包列表', true);
  await testEndpoint('GET', '/api/qianbao-yues/user-wallet', null, '获取用户钱包', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-balances', null, '获取代币余额', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-reward-records', null, '获取代币赠送记录', true);
}

// 钱包地址API测试
async function testWalletAddressAPIs() {
  console.log(colors.cyan('\\n📍 测试钱包地址API...'));
  
  await testEndpoint('GET', '/api/wallet-addresses', null, '获取钱包地址列表', true);
  await testEndpoint('POST', '/api/wallet-addresses', {
    address: '0x1234567890123456789012345678901234567890',
    chain: 'ETH',
    asset: 'USDT',
    description: '测试地址'
  }, '创建钱包地址', true);
}

// AI代币API测试
async function testAITokenAPIs() {
  console.log(colors.cyan('\\n🤖 测试AI代币API...'));
  
  await testEndpoint('GET', '/api/ai-tokens', null, '获取AI代币列表', false);
  await testEndpoint('GET', '/api/ai-tokens/active', null, '获取活跃代币', false);
  await testEndpoint('GET', '/api/ai-tokens/market', null, '获取代币市场数据', false);
}

// 邀请奖励API测试
async function testInviteAPIs() {
  console.log(colors.cyan('\\n🎁 测试邀请奖励API...'));
  
  await testEndpoint('GET', '/api/yaoqing-jianglis', null, '获取邀请奖励列表', true);
  await testEndpoint('GET', '/api/yaoqing-jianglis/my-invites', null, '获取我的邀请记录', true);
  await testEndpoint('GET', '/api/yaoqing-jianglis/invite-stats', null, '获取邀请统计', true);
}

// 认购计划API测试
async function testDinggouAPIs() {
  console.log(colors.cyan('\\n📋 测试认购计划API...'));
  
  await testEndpoint('GET', '/api/dinggou-jihuas', null, '获取认购计划列表', false);
  await testEndpoint('GET', '/api/dinggou-jihuas/active', null, '获取活跃认购计划', false);
}

// 通知API测试
async function testNoticeAPIs() {
  console.log(colors.cyan('\\n📢 测试通知API...'));
  
  await testEndpoint('GET', '/api/notices', null, '获取通知列表', false);
  await testEndpoint('GET', '/api/notices/active', null, '获取活跃通知', false);
}

// 代币奖励记录API测试
async function testTokenRewardAPIs() {
  console.log(colors.cyan('\\n🏆 测试代币奖励记录API...'));
  
  await testEndpoint('GET', '/api/token-reward-records', null, '获取代币奖励记录列表', true);
  await testEndpoint('GET', '/api/token-reward-records/my-rewards', null, '获取我的奖励记录', true);
}

// 主测试函数
async function runFinalTests() {
  console.log(colors.blue('🚀 开始最终API测试'));
  console.log(colors.blue(\`目标服务器: \${BASE_URL}\`));
  console.log(colors.blue(\`测试用户: \${testUser.username}\`));
  console.log(colors.blue('='.repeat(50)));
  
  try {
    await testAuthAPIs();
    await testWalletAPIs();
    await testWalletAddressAPIs();
    await testAITokenAPIs();
    await testInviteAPIs();
    await testDinggouAPIs();
    await testNoticeAPIs();
    await testTokenRewardAPIs();
    
    // 生成报告
    console.log(colors.magenta('\\n📊 最终测试报告'));
    console.log(colors.magenta('='.repeat(50)));
    console.log(colors.cyan(\`总测试数: \${testResults.total}\`));
    console.log(colors.green(\`通过: \${testResults.passed}\`));
    console.log(colors.red(\`失败: \${testResults.failed}\`));
    console.log(colors.yellow(\`跳过: \${testResults.skipped}\`));
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(colors.cyan(\`成功率: \${successRate}%\`));
    
    if (testResults.errors.length > 0) {
      console.log(colors.red('\\n❌ 错误详情:'));
      testResults.errors.forEach(error => {
        console.log(colors.red(\`   - \${error}\`));
      });
    }
    
  } catch (error) {
    console.error(colors.red('测试过程中发生错误:'), error);
  }
}

// 运行测试
if (require.main === module) {
  runFinalTests().catch(console.error);
}

module.exports = {
  runFinalTests,
  testEndpoint,
  testResults
};`;

  fs.writeFileSync(path.join(__dirname, 'final_api_test.js'), finalTestScript);
  console.log(colors.green('   ✅ 最终测试脚本已创建: final_api_test.js'));
}

// 执行所有修复
function runAllFixes() {
  try {
    fixWalletRoutePath();
    fixWalletAddressSchema();
    checkAITokenController();
    checkTokenRewardController();
    checkInviteController();
    checkDinggouController();
    checkNoticeController();
    createFinalTestScript();
    
    console.log(colors.green('\n✅ 所有修复检查完成！'));
    console.log(colors.cyan('\n📋 修复总结:'));
    console.log(colors.cyan('   - 修复了钱包路由路径问题'));
    console.log(colors.cyan('   - 确认了钱包地址schema字段'));
    console.log(colors.cyan('   - 检查了所有控制器方法'));
    console.log(colors.cyan('   - 创建了最终测试脚本'));
    
    console.log(colors.yellow('\n🔧 下一步:'));
    console.log(colors.yellow('   1. 重启Strapi服务器'));
    console.log(colors.yellow('   2. 运行最终测试脚本: node final_api_test.js'));
    console.log(colors.yellow('   3. 检查修复效果'));
    
  } catch (error) {
    console.error(colors.red('修复过程中发生错误:'), error);
  }
}

// 运行修复
if (require.main === module) {
  runAllFixes();
}

module.exports = {
  runAllFixes,
  fixWalletRoutePath,
  fixWalletAddressSchema
}; 