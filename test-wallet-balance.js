const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const TEST_USER = {
  username: 'testuser_' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'testpass123'
};

async function testWalletBalance() {
  console.log('=== 钱包余额功能测试开始 ===\n');

  try {
    // 1. 注册新用户
    console.log('1. 注册新用户...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, TEST_USER);
    const { jwt, user } = registerResponse.data;
    console.log('✅ 用户注册成功:', { userId: user.id, username: user.username });

    // 2. 等待一下让钱包创建完成
    console.log('\n2. 等待钱包创建...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 获取用户钱包
    console.log('\n3. 获取用户钱包...');
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    
    if (walletResponse.data.data) {
      const wallet = walletResponse.data.data;
      console.log('✅ 钱包获取成功:', {
        walletId: wallet.id,
        usdtYue: wallet.usdtYue,
        aiYue: wallet.aiYue,
        aiTokenBalances: wallet.aiTokenBalances
      });
    } else {
      console.log('❌ 钱包不存在');
    }

    // 4. 获取代币余额详情
    console.log('\n4. 获取代币余额详情...');
    try {
      const tokenBalancesResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/token-balances`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      console.log('✅ 代币余额获取成功:', tokenBalancesResponse.data.data);
    } catch (error) {
      console.log('⚠️ 代币余额获取失败:', error.response?.data || error.message);
    }

    // 5. 测试充值功能（模拟）
    console.log('\n5. 测试充值功能...');
    try {
      const rechargeResponse = await axios.post(`${BASE_URL}/api/qianbao-chongzhis`, {
        data: {
          usdtJine: '100.00',
          zhuangtai: 'pending'
        }
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      console.log('✅ 充值记录创建成功:', rechargeResponse.data.data);
    } catch (error) {
      console.log('⚠️ 充值记录创建失败:', error.response?.data || error.message);
    }

    // 6. 再次获取钱包余额
    console.log('\n6. 再次获取钱包余额...');
    const walletResponse2 = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    
    if (walletResponse2.data.data) {
      const wallet = walletResponse2.data.data;
      console.log('✅ 钱包余额:', {
        usdtYue: wallet.usdtYue,
        aiYue: wallet.aiYue
      });
    }

    console.log('\n=== 钱包余额功能测试完成 ===');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testWalletBalance(); 