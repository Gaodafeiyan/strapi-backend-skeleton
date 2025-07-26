const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试API修复效果
async function testApiFixes() {
  console.log('=== 开始测试API修复效果 ===\n');

  // 1. 测试钱包API连接
  console.log('1. 测试钱包API连接...');
  try {
    const response = await axios.get(`${BASE_URL}/api/qianbao-yues/test`);
    console.log('✅ 钱包API连接正常');
    console.log('   响应:', response.data);
  } catch (error) {
    console.log('❌ 钱包API连接失败:', error.response?.data || error.message);
  }

  // 2. 测试登录
  console.log('\n2. 测试登录...');
  let token = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser001',
      password: '123456'
    });
    
    token = loginResponse.data.jwt;
    console.log('✅ 登录成功');
    console.log('   用户ID:', loginResponse.data.user.id);
    console.log('   用户名:', loginResponse.data.user.username);
  } catch (error) {
    console.log('❌ 登录失败:', error.response?.data || error.message);
  }

  // 3. 测试用户钱包（需要认证）
  if (token) {
    console.log('\n3. 测试用户钱包（需要认证）...');
    try {
      const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ 用户钱包获取成功');
      console.log('   钱包数据:', walletResponse.data);
    } catch (error) {
      console.log('❌ 用户钱包获取失败:', error.response?.data || error.message);
    }
  }

  // 4. 测试用户信息（需要认证）
  if (token) {
    console.log('\n4. 测试用户信息（需要认证）...');
    try {
      const userResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ 用户信息获取成功');
      console.log('   用户ID:', userResponse.data.id);
      console.log('   用户名:', userResponse.data.username);
    } catch (error) {
      console.log('❌ 用户信息获取失败:', error.response?.data || error.message);
    }
  }

  // 5. 测试通知API
  console.log('\n5. 测试通知API...');
  try {
    const noticeResponse = await axios.get(`${BASE_URL}/api/notices`);
    console.log('✅ 通知获取成功');
    console.log('   通知数量:', noticeResponse.data.data?.length || 0);
  } catch (error) {
    console.log('❌ 通知获取失败:', error.response?.data || error.message);
  }

  // 6. 测试认购计划API
  console.log('\n6. 测试认购计划API...');
  try {
    const planResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas`);
    console.log('✅ 认购计划获取成功');
    console.log('   计划数量:', planResponse.data.data?.length || 0);
  } catch (error) {
    console.log('❌ 认购计划获取失败:', error.response?.data || error.message);
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testApiFixes().catch(console.error); 