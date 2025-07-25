const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = 'DEF678901';

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

console.log(colors.blue(`🎯 开始测试邀请码: ${INVITE_CODE}\n`));

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0
};

// 测试函数
async function testEndpoint(method, endpoint, data = null, description = '') {
  testResults.total++;
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
      validateStatus: () => true
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(colors.green(`✅ ${description} - 成功 (${response.status})`));
      testResults.passed++;
      return response.data;
    } else {
      console.log(colors.red(`❌ ${description} - 失败 (${response.status})`));
      if (response.data && response.data.error) {
        console.log(colors.red(`   错误: ${JSON.stringify(response.data.error)}`));
      }
      testResults.failed++;
    }
  } catch (error) {
    console.log(colors.red(`❌ ${description} - 请求失败: ${error.message}`));
    testResults.failed++;
  }
}

// 1. 测试邀请码验证
async function testInviteCodeValidation() {
  console.log(colors.cyan('🔍 测试邀请码验证...'));
  
  // 测试邀请码是否存在
  await testEndpoint('GET', `/api/yaoqing-jianglis?filters[invite_code][$eq]=${INVITE_CODE}`, null, '查询邀请码是否存在');
  
  // 测试邀请码验证接口（如果存在）
  await testEndpoint('POST', '/api/yaoqing-jianglis/validate', {
    invite_code: INVITE_CODE
  }, '验证邀请码');
  
  // 测试邀请码使用接口
  await testEndpoint('POST', '/api/yaoqing-jianglis/use', {
    invite_code: INVITE_CODE,
    user_id: 1
  }, '使用邀请码');
}

// 2. 测试用户注册时使用邀请码
async function testRegistrationWithInviteCode() {
  console.log(colors.cyan('\n👤 测试注册时使用邀请码...'));
  
  const testUsers = [
    {
      username: `invite_user_1_${Date.now()}`,
      email: `invite1_${Date.now()}@example.com`,
      password: 'Test123456!',
      invite_code: INVITE_CODE
    },
    {
      username: `invite_user_2_${Date.now()}`,
      email: `invite2_${Date.now()}@example.com`,
      password: 'Test123456!',
      invite_code: INVITE_CODE
    }
  ];

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(colors.yellow(`\n测试用户 ${i + 1}: ${user.username}`));
    
    // 测试注册
    const registerResult = await testEndpoint('POST', '/api/auth/local/register', user, `用户注册 (${user.username})`);
    
    if (registerResult && registerResult.jwt) {
      console.log(colors.green(`🔑 注册成功，获取到JWT令牌`));
      
      // 测试登录
      await testEndpoint('POST', '/api/auth/local', {
        identifier: user.email,
        password: user.password
      }, `用户登录 (${user.username})`);
      
      // 测试获取用户信息
      await testEndpoint('GET', '/api/users/me', null, `获取用户信息 (${user.username})`, {
        headers: { Authorization: `Bearer ${registerResult.jwt}` }
      });
    }
  }
}

// 3. 测试邀请奖励系统
async function testInviteRewardSystem() {
  console.log(colors.cyan('\n🎁 测试邀请奖励系统...'));
  
  // 获取邀请奖励列表
  await testEndpoint('GET', '/api/yaoqing-jianglis', null, '获取邀请奖励列表');
  
  // 创建邀请奖励记录
  await testEndpoint('POST', '/api/yaoqing-jianglis', {
    data: {
      invite_code: INVITE_CODE,
      inviter_id: 1,
      invitee_id: 2,
      reward_amount: 100,
      reward_type: 'token',
      status: 'pending'
    }
  }, '创建邀请奖励记录');
  
  // 测试邀请码统计
  await testEndpoint('GET', `/api/yaoqing-jianglis?filters[invite_code][$eq]=${INVITE_CODE}&populate=*`, null, '获取邀请码详细信息');
}

// 4. 测试邀请码管理功能
async function testInviteCodeManagement() {
  console.log(colors.cyan('\n⚙️ 测试邀请码管理功能...'));
  
  // 创建新邀请码
  await testEndpoint('POST', '/api/yaoqing-jianglis', {
    data: {
      invite_code: `TEST_${Date.now()}`,
      inviter_id: 1,
      max_uses: 10,
      used_count: 0,
      reward_amount: 50,
      reward_type: 'token',
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后过期
    }
  }, '创建新邀请码');
  
  // 更新邀请码
  await testEndpoint('PUT', '/api/yaoqing-jianglis/1', {
    data: {
      max_uses: 20,
      reward_amount: 100
    }
  }, '更新邀请码');
  
  // 删除邀请码
  await testEndpoint('DELETE', '/api/yaoqing-jianglis/1', null, '删除邀请码');
}

// 5. 测试邀请码相关的其他接口
async function testRelatedEndpoints() {
  console.log(colors.cyan('\n🔗 测试相关接口...'));
  
  // 测试用户邀请关系
  await testEndpoint('GET', '/api/users?populate[0]=inviter&populate[1]=invitees', null, '获取用户邀请关系');
  
  // 测试邀请统计
  await testEndpoint('GET', '/api/yaoqing-jianglis/statistics', null, '获取邀请统计信息');
  
  // 测试邀请排行榜
  await testEndpoint('GET', '/api/yaoqing-jianglis/leaderboard', null, '获取邀请排行榜');
}

// 6. 测试邀请码错误情况
async function testErrorCases() {
  console.log(colors.cyan('\n⚠️ 测试错误情况...'));
  
  // 测试无效邀请码
  await testEndpoint('POST', '/api/auth/local/register', {
    username: 'invalid_user',
    email: 'invalid@example.com',
    password: 'Test123456!',
    invite_code: 'INVALID_CODE'
  }, '使用无效邀请码注册');
  
  // 测试已过期的邀请码
  await testEndpoint('POST', '/api/auth/local/register', {
    username: 'expired_user',
    email: 'expired@example.com',
    password: 'Test123456!',
    invite_code: 'EXPIRED_CODE'
  }, '使用过期邀请码注册');
  
  // 测试已满额的邀请码
  await testEndpoint('POST', '/api/auth/local/register', {
    username: 'full_user',
    email: 'full@example.com',
    password: 'Test123456!',
    invite_code: 'FULL_CODE'
  }, '使用已满额邀请码注册');
}

// 7. 测试邀请码API文档
async function testAPIDocumentation() {
  console.log(colors.cyan('\n📚 测试API文档...'));
  
  // 测试邀请码相关的API端点
  const endpoints = [
    '/api/yaoqing-jianglis',
    '/api/yaoqing-jianglis/1',
    '/api/yaoqing-jianglis/validate',
    '/api/yaoqing-jianglis/use',
    '/api/yaoqing-jianglis/statistics',
    '/api/yaoqing-jianglis/leaderboard'
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint('GET', endpoint, null, `测试端点: ${endpoint}`);
  }
}

// 主测试函数
async function runInviteCodeTests() {
  try {
    await testInviteCodeValidation();
    await testRegistrationWithInviteCode();
    await testInviteRewardSystem();
    await testInviteCodeManagement();
    await testRelatedEndpoints();
    await testErrorCases();
    await testAPIDocumentation();
    
    // 输出测试结果统计
    console.log(colors.cyan('\n📊 邀请码测试结果统计:'));
    console.log(colors.green(`✅ 通过: ${testResults.passed}`));
    console.log(colors.red(`❌ 失败: ${testResults.failed}`));
    console.log(colors.blue(`📈 总计: ${testResults.total}`));
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(colors.cyan(`📊 成功率: ${successRate}%`));
    
    // 输出邀请码测试总结
    console.log(colors.blue('\n🎯 邀请码测试总结:'));
    console.log(colors.yellow(`📝 测试的邀请码: ${INVITE_CODE}`));
    
    if (testResults.failed === 0) {
      console.log(colors.green('🎉 邀请码功能测试全部通过！'));
    } else {
      console.log(colors.yellow('⚠️ 部分邀请码功能测试失败，需要检查相关接口。'));
    }
    
    // 输出建议
    console.log(colors.cyan('\n💡 邀请码功能建议:'));
    const suggestions = [
      '确保邀请码验证逻辑正确',
      '检查邀请奖励发放机制',
      '验证邀请码使用限制',
      '测试邀请码过期处理',
      '完善邀请码统计功能'
    ];
    
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
    
  } catch (error) {
    console.error(colors.red('❌ 邀请码测试过程中发生错误:'), error);
  }
}

// 运行测试
runInviteCodeTests(); 