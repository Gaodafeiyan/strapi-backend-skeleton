const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 模拟用户登录获取token
async function loginAndTest() {
  console.log('🔍 开始测试带认证的API接口...\n');

  try {
    // 1. 先尝试登录获取token
    console.log('1. 尝试登录获取token...');
    let token = null;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: 'test@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.jwt) {
        token = loginResponse.data.jwt;
        console.log('✅ 登录成功，获取到token');
      }
    } catch (error) {
      console.log('❌ 登录失败:', error.response?.status, error.response?.data);
      console.log('   尝试使用默认token...');
      // 使用一个测试token
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM1MjQ5NjAwLCJleHAiOjE3MzUzMzYwMDB9.test';
    }

    // 2. 测试用户钱包API（带认证）
    console.log('\n2. 测试用户钱包API（带认证）...');
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, { headers });
      console.log('✅ 获取用户钱包成功:', response.status);
      console.log('   数据:', response.data);
    } catch (error) {
      console.log('❌ 获取用户钱包失败:', error.response?.status, error.response?.data);
    }

    // 3. 测试代币余额API（带认证）
    console.log('\n3. 测试代币余额API（带认证）...');
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await axios.get(`${BASE_URL}/api/qianbao-yues/token-balances`, { headers });
      console.log('✅ 获取代币余额成功:', response.status);
      console.log('   数据:', response.data);
    } catch (error) {
      console.log('❌ 获取代币余额失败:', error.response?.status, error.response?.data);
    }

    // 4. 测试认购订单API（带认证）
    console.log('\n4. 测试认购订单API（带认证）...');
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await axios.get(`${BASE_URL}/api/dinggou-dingdans`, { headers });
      console.log('✅ 获取认购订单成功:', response.status);
      console.log('   数据:', response.data);
    } catch (error) {
      console.log('❌ 获取认购订单失败:', error.response?.status, error.response?.data);
    }

    // 5. 测试所有可用的API路由
    console.log('\n5. 测试所有API路由...');
    const testRoutes = [
      '/api/dinggou-jihuas/active',
      '/api/dinggou-jihuas',
      '/api/dinggou-dingdans',
      '/api/qianbao-yues',
      '/api/qianbao-yues/user-wallet',
      '/api/qianbao-yues/token-balances',
      '/api/notices/active',
      '/api/health',
      '/api/ai-tokens',
      '/api/ai-tokens/active'
    ];

    for (const route of testRoutes) {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await axios.get(`${BASE_URL}${route}`, { headers });
        console.log(`✅ ${route}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${route}: ${error.response?.status} - ${error.response?.data?.error?.message || 'Unknown error'}`);
      }
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
loginAndTest(); 