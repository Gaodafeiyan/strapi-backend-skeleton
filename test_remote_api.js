const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testRemoteAPIEndpoints() {
  console.log('🔍 测试远程服务器API端点...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  const endpoints = [
    '/api/notices',
    '/api/qianbao-yues/user-wallet',
    '/api/choujiang-ji-lus',
    '/api/dinggou-jihuas',
    '/api/ai-tokens',
    '/api/auth/invite-register',
    '/api/qianbao-yues/token-balances',
    '/api/qianbao-yues/token-rewards',
    '/api/yaoqing-jianglis',
    '/api/qianbao-chongzhis',
    '/api/qianbao-tixians',
    '/api/wallet-addresses',
    '/api/shop-products',
    '/api/shop-carts',
    '/api/shop-orders',
    '/api/choujiang-jihuis',
    '/api/choujiang-jiangpins',
    '/api/dinggou-dingdans',
    '/api/token-reward-records',
    '/api/internal-messages',
    '/api/admin-dashboards',
    '/api/performance-monitors',
    '/api/caches',
    '/api/queues',
    '/api/webhooks',
    '/api/health'
  ];

  const results = {
    success: [],
    auth_required: [],
    not_found: [],
    error: []
  };

  for (const endpoint of endpoints) {
    try {
      console.log(`测试 ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 10000,
        validateStatus: () => true // 不抛出错误
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - 状态码: ${response.status}`);
        results.success.push(endpoint);
      } else if (response.status === 401) {
        console.log(`🔒 ${endpoint} - 需要认证 (状态码: ${response.status})`);
        results.auth_required.push(endpoint);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - 未找到 (状态码: ${response.status})`);
        results.not_found.push(endpoint);
      } else {
        console.log(`⚠️ ${endpoint} - 其他错误 (状态码: ${response.status})`);
        results.error.push({ endpoint, status: response.status });
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - 请求失败: ${error.message}`);
      results.error.push({ endpoint, error: error.message });
    }
    console.log('');
  }

  // 输出测试结果摘要
  console.log('📊 测试结果摘要:');
  console.log(`✅ 成功的API: ${results.success.length}个`);
  console.log(`🔒 需要认证的API: ${results.auth_required.length}个`);
  console.log(`❌ 未找到的API: ${results.not_found.length}个`);
  console.log(`⚠️ 其他错误的API: ${results.error.length}个`);
  
  console.log('\n🎯 可用的API端点:');
  results.success.forEach(endpoint => {
    console.log(`  ✅ ${endpoint}`);
  });
  
  console.log('\n🔒 需要认证的API端点:');
  results.auth_required.forEach(endpoint => {
    console.log(`  🔒 ${endpoint}`);
  });

  console.log('\n🎯 API端点测试完成');
}

// 运行测试
testRemoteAPIEndpoints().catch(console.error); 