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

console.log(colors.blue('🔧 开始修复API问题...'));
console.log(colors.blue('='.repeat(60)));

// 1. 修复认证控制器中的用户名验证问题
function fixAuthController() {
  console.log(colors.cyan('\n🔐 修复认证控制器...'));
  
  const authControllerPath = path.join(__dirname, 'src', 'api', 'auth', 'controllers', 'auth.ts');
  
  if (fs.existsSync(authControllerPath)) {
    let content = fs.readFileSync(authControllerPath, 'utf8');
    
    // 修复用户名验证逻辑
    const usernameValidationFix = `
        // 输入验证和清理
        const cleanUsername = sanitizeInput(username);
        const cleanEmail = sanitizeInput(email);
        const cleanInviteCode = sanitizeInput(inviteCode);
        
        // 修复用户名长度验证 - 允许更短的用户名
        if (!cleanUsername || cleanUsername.length < 2) {
          return ctx.badRequest('用户名至少2个字符');
        }
        
        if (cleanUsername.length > 30) {
          return ctx.badRequest('用户名最多30个字符');
        }
        
        if (!validateEmail(cleanEmail)) {
          return ctx.badRequest('邮箱格式无效');
        }
        
        if (!validatePassword(password)) {
          return ctx.badRequest('密码至少6个字符');
        }
        
        if (!validateInviteCode(cleanInviteCode)) {
          return ctx.badRequest('邀请码格式无效');
        }`;
    
    // 替换原有的验证逻辑
    content = content.replace(
      /\/\/ 输入验证和清理[\s\S]*?if \(!validateInviteCode\(cleanInviteCode\)\) \{[\s\S]*?\}/,
      usernameValidationFix
    );
    
    fs.writeFileSync(authControllerPath, content);
    console.log(colors.green('   ✅ 认证控制器用户名验证已修复'));
  } else {
    console.log(colors.red('   ❌ 未找到认证控制器文件'));
  }
}

// 2. 修复钱包控制器中的自定义方法路由
function fixWalletController() {
  console.log(colors.cyan('\n💰 修复钱包控制器路由...'));
  
  const walletRoutesPath = path.join(__dirname, 'src', 'api', 'qianbao-yue', 'routes', 'qianbao-yue.ts');
  
  if (fs.existsSync(walletRoutesPath)) {
    let content = fs.readFileSync(walletRoutesPath, 'utf8');
    
    // 添加缺失的自定义路由
    const customRoutes = `
  {
    method: 'GET',
    path: '/api/qianbao-yues/user-wallet',
    handler: 'qianbao-yue.getUserWallet',
    config: { auth: { scope: ['authenticated'] } },
  },
  {
    method: 'GET',
    path: '/api/qianbao-yues/token-balances',
    handler: 'qianbao-yue.getTokenBalances',
    config: { auth: { scope: ['authenticated'] } },
  },
  {
    method: 'GET',
    path: '/api/qianbao-yues/token-reward-records',
    handler: 'qianbao-yue.getTokenRewardRecords',
    config: { auth: { scope: ['authenticated'] } },
  },`;
    
    // 在routes数组中添加自定义路由
    if (!content.includes('user-wallet')) {
      content = content.replace(
        /routes: \[/,
        `routes: [${customRoutes}`
      );
      fs.writeFileSync(walletRoutesPath, content);
      console.log(colors.green('   ✅ 钱包自定义路由已添加'));
    } else {
      console.log(colors.yellow('   ⚠️ 钱包路由已存在'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到钱包路由文件'));
  }
}

// 3. 修复钱包地址控制器
function fixWalletAddressController() {
  console.log(colors.cyan('\n📍 修复钱包地址控制器...'));
  
  const walletAddressControllerPath = path.join(__dirname, 'src', 'api', 'wallet-address', 'controllers', 'wallet-address.ts');
  
  if (fs.existsSync(walletAddressControllerPath)) {
    let content = fs.readFileSync(walletAddressControllerPath, 'utf8');
    
    // 添加数据验证中间件
    const createMethodFix = `
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        
        if (!data) {
          return ctx.badRequest('缺少data字段');
        }
        
        const { address, type, label } = data;
        
        if (!address) {
          return ctx.badRequest('钱包地址不能为空');
        }
        
        if (!type) {
          return ctx.badRequest('钱包类型不能为空');
        }
        
        // 创建钱包地址
        const walletAddress = await strapi.entityService.create('api::wallet-address.wallet-address', {
          data: {
            address,
            type,
            label: label || '',
            yonghu: ctx.state.user.id
          }
        });
        
        ctx.body = { data: walletAddress };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },`;
    
    // 检查是否已有create方法
    if (!content.includes('async create(')) {
      // 在现有方法后添加create方法
      content = content.replace(
        /export default factories\.createCoreController\([\s\S]*?\)\);/,
        `export default factories.createCoreController(
  'api::wallet-address.wallet-address',
  ({ strapi }) => ({
    // 继承默认的CRUD操作
    ${createMethodFix}
  })
);`
      );
      
      fs.writeFileSync(walletAddressControllerPath, content);
      console.log(colors.green('   ✅ 钱包地址创建方法已添加'));
    } else {
      console.log(colors.yellow('   ⚠️ 钱包地址创建方法已存在'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到钱包地址控制器文件'));
  }
}

// 4. 修复认购计划路由
function fixDinggouRoutes() {
  console.log(colors.cyan('\n📋 修复认购计划路由...'));
  
  const dinggouRoutesPath = path.join(__dirname, 'src', 'api', 'dinggou-jihua', 'routes', 'dinggou-jihua.ts');
  
  if (fs.existsSync(dinggouRoutesPath)) {
    let content = fs.readFileSync(dinggouRoutesPath, 'utf8');
    
    // 添加活跃认购计划路由
    const activeRoute = `
  {
    method: 'GET',
    path: '/api/dinggou-jihuas/active',
    handler: 'dinggou-jihua.getActivePlans',
    config: { auth: false },
  },`;
    
    if (!content.includes('active')) {
      content = content.replace(
        /routes: \[/,
        `routes: [${activeRoute}`
      );
      fs.writeFileSync(dinggouRoutesPath, content);
      console.log(colors.green('   ✅ 活跃认购计划路由已添加'));
    } else {
      console.log(colors.yellow('   ⚠️ 活跃认购计划路由已存在'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到认购计划路由文件'));
  }
}

// 5. 修复邀请奖励路由
function fixInviteRoutes() {
  console.log(colors.cyan('\n🎁 修复邀请奖励路由...'));
  
  const inviteRoutesPath = path.join(__dirname, 'src', 'api', 'yaoqing-jiangli', 'routes', 'yaoqing-jiangli.ts');
  
  if (fs.existsSync(inviteRoutesPath)) {
    let content = fs.readFileSync(inviteRoutesPath, 'utf8');
    
    // 添加自定义路由
    const customRoutes = `
  {
    method: 'GET',
    path: '/api/yaoqing-jianglis/my-invites',
    handler: 'yaoqing-jiangli.getMyInvites',
    config: { auth: { scope: ['authenticated'] } },
  },
  {
    method: 'GET',
    path: '/api/yaoqing-jianglis/invite-stats',
    handler: 'yaoqing-jiangli.getInviteStats',
    config: { auth: { scope: ['authenticated'] } },
  },`;
    
    if (!content.includes('my-invites')) {
      content = content.replace(
        /routes: \[/,
        `routes: [${customRoutes}`
      );
      fs.writeFileSync(inviteRoutesPath, content);
      console.log(colors.green('   ✅ 邀请奖励自定义路由已添加'));
    } else {
      console.log(colors.yellow('   ⚠️ 邀请奖励自定义路由已存在'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到邀请奖励路由文件'));
  }
}

// 6. 修复AI代币路由
function fixAITokenRoutes() {
  console.log(colors.cyan('\n🤖 修复AI代币路由...'));
  
  const aiTokenRoutesPath = path.join(__dirname, 'src', 'api', 'ai-token', 'routes', 'ai-token.ts');
  
  if (fs.existsSync(aiTokenRoutesPath)) {
    let content = fs.readFileSync(aiTokenRoutesPath, 'utf8');
    
    // 添加自定义路由
    const customRoutes = `
  {
    method: 'GET',
    path: '/api/ai-tokens/active',
    handler: 'ai-token.getActiveTokens',
    config: { auth: false },
  },
  {
    method: 'GET',
    path: '/api/ai-tokens/market',
    handler: 'ai-token.getMarketData',
    config: { auth: false },
  },`;
    
    if (!content.includes('active')) {
      content = content.replace(
        /routes: \[/,
        `routes: [${customRoutes}`
      );
      fs.writeFileSync(aiTokenRoutesPath, content);
      console.log(colors.green('   ✅ AI代币自定义路由已添加'));
    } else {
      console.log(colors.yellow('   ⚠️ AI代币自定义路由已存在'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到AI代币路由文件'));
  }
}

// 7. 修复通知路由
function fixNoticeRoutes() {
  console.log(colors.cyan('\n📢 修复通知路由...'));
  
  const noticeRoutesPath = path.join(__dirname, 'src', 'api', 'notice', 'routes', 'notice.ts');
  
  if (fs.existsSync(noticeRoutesPath)) {
    let content = fs.readFileSync(noticeRoutesPath, 'utf8');
    
    // 添加活跃通知路由
    const activeRoute = `
  {
    method: 'GET',
    path: '/api/notices/active',
    handler: 'notice.getActiveNotices',
    config: { auth: false },
  },`;
    
    if (!content.includes('active')) {
      content = content.replace(
        /routes: \[/,
        `routes: [${activeRoute}`
      );
      fs.writeFileSync(noticeRoutesPath, content);
      console.log(colors.green('   ✅ 活跃通知路由已添加'));
    } else {
      console.log(colors.yellow('   ⚠️ 活跃通知路由已存在'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到通知路由文件'));
  }
}

// 8. 修复代币奖励记录路由
function fixTokenRewardRoutes() {
  console.log(colors.cyan('\n🏆 修复代币奖励记录路由...'));
  
  const tokenRewardRoutesPath = path.join(__dirname, 'src', 'api', 'token-reward-record', 'routes', 'token-reward-record.ts');
  
  if (fs.existsSync(tokenRewardRoutesPath)) {
    let content = fs.readFileSync(tokenRewardRoutesPath, 'utf8');
    
    // 添加我的奖励记录路由
    const myRewardsRoute = `
  {
    method: 'GET',
    path: '/api/token-reward-records/my-rewards',
    handler: 'token-reward-record.getMyRewards',
    config: { auth: { scope: ['authenticated'] } },
  },`;
    
    if (!content.includes('my-rewards')) {
      content = content.replace(
        /routes: \[/,
        `routes: [${myRewardsRoute}`
      );
      fs.writeFileSync(tokenRewardRoutesPath, content);
      console.log(colors.green('   ✅ 我的奖励记录路由已添加'));
    } else {
      console.log(colors.yellow('   ⚠️ 我的奖励记录路由已存在'));
    }
  } else {
    console.log(colors.red('   ❌ 未找到代币奖励记录路由文件'));
  }
}

// 9. 创建改进的测试脚本
function createImprovedTestScript() {
  console.log(colors.cyan('\n🧪 创建改进的测试脚本...'));
  
  const improvedTestScript = `const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = 'DEF678901';
const TEST_TIMEOUT = 15000;

// 改进的测试用户数据
const testUser = {
  username: \`testuser_\${Date.now()}\`.substring(0, 15), // 确保长度合适
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

// 改进的测试函数
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

// 改进的认证测试
async function testAuthAPIs() {
  console.log(colors.cyan('\\n🔐 测试认证API...'));
  
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
    console.log(colors.green(\`   注册成功，用户ID: \${userId}\`));
  }
  
  // 登录
  const loginData = {
    identifier: testUser.email,
    password: testUser.password
  };
  
  const loginResult = await testEndpoint('POST', '/api/auth/local', loginData, '用户登录');
  
  if (loginResult && loginResult.jwt) {
    authToken = loginResult.jwt;
    console.log(colors.green(\`   登录成功，获取到Token\`));
  }
  
  // 获取当前用户信息
  await testEndpoint('GET', '/api/users/me', null, '获取当前用户信息', true);
}

// 改进的钱包API测试
async function testWalletAPIs() {
  console.log(colors.cyan('\\n💰 测试钱包API...'));
  
  await testEndpoint('GET', '/api/qianbao-yues', null, '获取钱包列表', true);
  await testEndpoint('GET', '/api/qianbao-yues/user-wallet', null, '获取用户钱包', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-balances', null, '获取代币余额', true);
  await testEndpoint('GET', '/api/qianbao-yues/token-reward-records', null, '获取代币赠送记录', true);
}

// 改进的钱包地址API测试
async function testWalletAddressAPIs() {
  console.log(colors.cyan('\\n📍 测试钱包地址API...'));
  
  await testEndpoint('GET', '/api/wallet-addresses', null, '获取钱包地址列表', true);
  await testEndpoint('POST', '/api/wallet-addresses', {
    address: '0x1234567890123456789012345678901234567890',
    type: 'ETH',
    label: '测试地址'
  }, '创建钱包地址', true);
}

// 主测试函数
async function runImprovedTests() {
  console.log(colors.blue('🚀 开始改进的API测试'));
  console.log(colors.blue(\`目标服务器: \${BASE_URL}\`));
  console.log(colors.blue(\`测试用户: \${testUser.username}\`));
  console.log(colors.blue('='.repeat(50)));
  
  try {
    await testAuthAPIs();
    await testWalletAPIs();
    await testWalletAddressAPIs();
    
    // 生成报告
    console.log(colors.magenta('\\n📊 测试报告'));
    console.log(colors.magenta('='.repeat(50)));
    console.log(colors.cyan(\`总测试数: \${testResults.total}\`));
    console.log(colors.green(\`通过: \${testResults.passed}\`));
    console.log(colors.red(\`失败: \${testResults.failed}\`));
    console.log(colors.yellow(\`跳过: \${testResults.skipped}\`));
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(colors.cyan(\`成功率: \${successRate}%\`));
    
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
};`;

  fs.writeFileSync(path.join(__dirname, 'improved_api_test.js'), improvedTestScript);
  console.log(colors.green('   ✅ 改进的测试脚本已创建: improved_api_test.js'));
}

// 执行所有修复
function runAllFixes() {
  try {
    fixAuthController();
    fixWalletController();
    fixWalletAddressController();
    fixDinggouRoutes();
    fixInviteRoutes();
    fixAITokenRoutes();
    fixNoticeRoutes();
    fixTokenRewardRoutes();
    createImprovedTestScript();
    
    console.log(colors.green('\n✅ 所有修复完成！'));
    console.log(colors.cyan('\n📋 修复总结:'));
    console.log(colors.cyan('   - 修复了认证控制器的用户名验证'));
    console.log(colors.cyan('   - 添加了缺失的自定义路由'));
    console.log(colors.cyan('   - 修复了钱包地址创建的数据格式'));
    console.log(colors.cyan('   - 创建了改进的测试脚本'));
    
    console.log(colors.yellow('\n🔧 下一步:'));
    console.log(colors.yellow('   1. 重启Strapi服务器'));
    console.log(colors.yellow('   2. 运行改进的测试脚本: node improved_api_test.js'));
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
  fixAuthController,
  fixWalletController,
  fixWalletAddressController
}; 