const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

// 测试配置
const TEST_CONFIG = {
  adminToken: '', // 需要管理员token
  userToken: '', // 需要用户token
  testOrderId: 1, // 测试订单ID
};

async function testAITokenSystem() {
  console.log('🚀 开始测试AI代币系统...\n');

  try {
    // 1. 测试获取活跃代币
    console.log('1. 测试获取活跃代币...');
    const activeTokensResponse = await axios.get(`${BASE_URL}/ai-tokens/active`);
    console.log('✅ 活跃代币获取成功:', activeTokensResponse.data.data.length, '个代币');
    
    // 2. 测试获取代币价格
    if (activeTokensResponse.data.data.length > 0) {
      const firstToken = activeTokensResponse.data.data[0];
      console.log(`\n2. 测试获取代币价格 (${firstToken.symbol})...`);
      const priceResponse = await axios.get(`${BASE_URL}/ai-tokens/${firstToken.id}/price`);
      console.log('✅ 代币价格获取成功:', priceResponse.data.data.price);
    }

    // 3. 测试批量获取价格
    console.log('\n3. 测试批量获取价格...');
    const batchPricesResponse = await axios.get(`${BASE_URL}/ai-tokens/prices/batch`);
    console.log('✅ 批量价格获取成功:', Object.keys(batchPricesResponse.data.data).length, '个代币');

    // 4. 测试用户代币余额（需要用户token）
    if (TEST_CONFIG.userToken) {
      console.log('\n4. 测试用户代币余额...');
      const tokenBalancesResponse = await axios.get(`${BASE_URL}/qianbao-yues/token-balances`, {
        headers: { Authorization: `Bearer ${TEST_CONFIG.userToken}` }
      });
      console.log('✅ 用户代币余额获取成功:', tokenBalancesResponse.data.data.length, '个代币');
    }

    // 5. 测试用户代币赠送记录（需要用户token）
    if (TEST_CONFIG.userToken) {
      console.log('\n5. 测试用户代币赠送记录...');
      const rewardRecordsResponse = await axios.get(`${BASE_URL}/qianbao-yues/token-rewards`, {
        headers: { Authorization: `Bearer ${TEST_CONFIG.userToken}` }
      });
      console.log('✅ 用户代币赠送记录获取成功:', rewardRecordsResponse.data.data.length, '条记录');
    }

    // 6. 测试投资订单赎回（模拟AI代币赠送）
    console.log('\n6. 测试投资订单赎回（包含AI代币赠送）...');
    const redeemResponse = await axios.post(`${BASE_URL}/dinggou-dingdans/${TEST_CONFIG.testOrderId}/redeem`, {}, {
      headers: { Authorization: `Bearer ${TEST_CONFIG.userToken}` }
    });
    
    if (redeemResponse.data.success) {
      console.log('✅ 订单赎回成功');
      if (redeemResponse.data.data.selectedToken) {
        console.log('🎁 AI代币赠送成功:', {
          token: redeemResponse.data.data.selectedToken.name,
          symbol: redeemResponse.data.data.selectedToken.symbol,
          amount: redeemResponse.data.data.selectedToken.amount,
          usdtValue: redeemResponse.data.data.selectedToken.usdtValue
        });
      }
    }

    console.log('\n🎉 AI代币系统测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 提示: 需要设置有效的用户token才能测试完整功能');
      console.log('请在TEST_CONFIG中设置userToken');
    }
  }
}

// 测试权重随机选择算法
function testWeightedRandomSelection() {
  console.log('\n🎲 测试权重随机选择算法...');
  
  const tokens = [
    { id: 1, name: 'RNDR', weight: 30 },
    { id: 2, name: 'NOS', weight: 25 },
    { id: 3, name: 'SNS', weight: 20 },
    { id: 4, name: 'NMR', weight: 15 },
    { id: 5, name: 'CGPT', weight: 10 }
  ];

  const results = {};
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    const totalWeight = tokens.reduce((sum, token) => sum + token.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const token of tokens) {
      random -= token.weight;
      if (random <= 0) {
        results[token.name] = (results[token.name] || 0) + 1;
        break;
      }
    }
  }

  console.log('权重随机选择结果 (1000次):');
  tokens.forEach(token => {
    const count = results[token.name] || 0;
    const percentage = ((count / iterations) * 100).toFixed(2);
    console.log(`${token.name}: ${count}次 (${percentage}%) - 权重: ${token.weight}`);
  });
}

// 运行测试
async function runTests() {
  console.log('🧪 AI代币系统测试套件\n');
  
  // 测试权重随机选择
  testWeightedRandomSelection();
  
  // 测试API功能
  await testAITokenSystem();
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAITokenSystem, testWeightedRandomSelection }; 