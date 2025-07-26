const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = '7JDT6SHSN';

// 测试路由的函数
async function testRoutes() {
  console.log('🔧 开始测试路由...');
  
  const routes = [
    { path: '/api/qianbao-yues/user-wallet', method: 'GET', description: '用户钱包' },
    { path: '/api/qianbao-yues/token-balances', method: 'GET', description: '代币余额' },
    { path: '/api/qianbao-yues/token-reward-records', method: 'GET', description: '代币奖励记录' },
    { path: '/api/ai-tokens/market-data', method: 'GET', description: 'AI代币市场数据' },
    { path: '/api/ai-tokens/batch-prices', method: 'GET', description: '批量代币价格' }
  ];

  let token = null;

  // 先注册用户获取token
  try {
    console.log('🔑 注册用户获取token...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123456',
      inviteCode: INVITE_CODE
    });
    
    if (registerResponse.data.jwt) {
      token = registerResponse.data.jwt;
      console.log('✅ 用户注册成功，获取到token');
    }
  } catch (error) {
    console.log('⚠️ 注册失败，尝试登录...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: 'testuser',
        password: 'Test123456'
      });
      
      if (loginResponse.data.jwt) {
        token = loginResponse.data.jwt;
        console.log('✅ 登录成功，获取到token');
      }
    } catch (loginError) {
      console.log('❌ 登录也失败，使用无token测试');
    }
  }

  // 测试每个路由
  for (const route of routes) {
    try {
      console.log(`\n🔍 测试路由: ${route.path}`);
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios({
        method: route.method,
        url: `${BASE_URL}${route.path}`,
        headers,
        timeout: 10000
      });
      
      console.log(`✅ ${route.description}: ${response.status} - ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${route.description}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.error || error.message}`);
    }
  }
}

// 主函数
async function main() {
  try {
    // 测试路由
    await testRoutes();
    
    console.log('\n🎉 路由测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

main(); 