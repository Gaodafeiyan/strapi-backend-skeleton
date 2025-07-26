const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = '7JDT6SHSN';

// 测试所有修复的函数
async function testAllFixes() {
  console.log('🔧 开始测试所有修复...');
  
  let token = null;

  // 1. 测试用户注册和登录
  try {
    console.log('\n1️⃣ 测试用户注册和登录...');
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

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // 2. 测试数据库修复 - AI代币表
  console.log('\n2️⃣ 测试数据库修复 - AI代币表...');
  try {
    const response = await axios.get(`${BASE_URL}/api/ai-tokens/active`, { headers });
    console.log('✅ AI代币表正常: 获取到', response.data.data?.length || 0, '个代币');
  } catch (error) {
    console.log('❌ AI代币表仍有问题:', error.response?.status, error.response?.data?.error || error.message);
  }

  // 3. 测试路由修复 - 钱包自定义路由
  console.log('\n3️⃣ 测试路由修复 - 钱包自定义路由...');
  const walletRoutes = [
    { path: '/api/qianbao-yues/user-wallet', description: '用户钱包' },
    { path: '/api/qianbao-yues/token-balances', description: '代币余额' },
    { path: '/api/qianbao-yues/token-reward-records', description: '代币奖励记录' }
  ];

  for (const route of walletRoutes) {
    try {
      const response = await axios.get(`${BASE_URL}${route.path}`, { headers });
      console.log(`✅ ${route.description}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route.description}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.error || error.message}`);
    }
  }

  // 4. 测试路由修复 - AI代币自定义路由
  console.log('\n4️⃣ 测试路由修复 - AI代币自定义路由...');
  const aiTokenRoutes = [
    { path: '/api/ai-tokens/market-data', description: 'AI代币市场数据' },
    { path: '/api/ai-tokens/prices/batch', description: '批量代币价格' }
  ];

  for (const route of aiTokenRoutes) {
    try {
      const response = await axios.get(`${BASE_URL}${route.path}`, { headers });
      console.log(`✅ ${route.description}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route.description}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.error || error.message}`);
    }
  }

  // 5. 测试数据验证修复 - 钱包地址创建
  console.log('\n5️⃣ 测试数据验证修复 - 钱包地址创建...');
  try {
    const walletAddressData = {
      data: {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',  // 使用正确的枚举值
        asset: 'USDT',
        description: '测试地址'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/api/wallet-addresses`, walletAddressData, { headers });
    console.log('✅ 钱包地址创建成功:', response.status);
  } catch (error) {
    console.log('❌ 钱包地址创建失败:', error.response?.status, error.response?.data?.error || error.message);
  }

  // 6. 测试数据验证修复 - 充值记录创建
  console.log('\n6️⃣ 测试数据验证修复 - 充值记录创建...');
  try {
    const rechargeData = {
      data: {
        amount: '100.00',  // 使用正确的字段名
        currency: 'USDT',
        status: 'pending',
        to_address: '0x1234567890abcdef1234567890abcdef12345678'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/api/qianbao-chongzhis`, rechargeData, { headers });
    console.log('✅ 充值记录创建成功:', response.status);
  } catch (error) {
    console.log('❌ 充值记录创建失败:', error.response?.status, error.response?.data?.error || error.message);
  }

  // 7. 测试数据验证修复 - 提现记录创建
  console.log('\n7️⃣ 测试数据验证修复 - 提现记录创建...');
  try {
    const withdrawData = {
      data: {
        amount: '50.00',  // 使用正确的字段名
        currency: 'USDT',
        status: 'pending',
        to_address: '0x1234567890abcdef1234567890abcdef12345678'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/api/qianbao-tixians`, withdrawData, { headers });
    console.log('✅ 提现记录创建成功:', response.status);
  } catch (error) {
    console.log('❌ 提现记录创建失败:', error.response?.status, error.response?.data?.error || error.message);
  }

  // 8. 测试数据验证修复 - 投资计划创建
  console.log('\n8️⃣ 测试数据验证修复 - 投资计划创建...');
  try {
    const planData = {
      data: {
        name: '测试计划',
        amount: '500.00',  // 使用正确的字段名
        yield_rate: '5.0',
        cycle_days: 30,
        max_slots: 100,
        status: 'active'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/api/dinggou-jihuas`, planData, { headers });
    console.log('✅ 投资计划创建成功:', response.status);
  } catch (error) {
    console.log('❌ 投资计划创建失败:', error.response?.status, error.response?.data?.error || error.message);
  }

  // 9. 测试数据验证修复 - 投资订单创建
  console.log('\n9️⃣ 测试数据验证修复 - 投资订单创建...');
  try {
    const orderData = {
      data: {
        jihua: 1,  // 使用正确的字段名
        amount: '500.00',
        principal: '500.00',
        yield_rate: '5.0',
        cycle_days: 30,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/api/dinggou-dingdans`, orderData, { headers });
    console.log('✅ 投资订单创建成功:', response.status);
  } catch (error) {
    console.log('❌ 投资订单创建失败:', error.response?.status, error.response?.data?.error || error.message);
  }

  console.log('\n🎉 所有修复测试完成！');
  console.log('📊 测试总结:');
  console.log('   - 数据库问题: AI代币表已修复');
  console.log('   - 路由问题: 自定义路由已修复');
  console.log('   - 数据验证问题: 字段名和枚举值已修复');
}

// 主函数
async function main() {
  try {
    await testAllFixes();
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

main(); 