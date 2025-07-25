const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

async function testAPIEndpoints() {
  console.log('🔍 测试API端点...\n');

  const endpoints = [
    '/api/notices',
    '/api/qianbao-yues/user-wallet',
    '/api/choujiang-ji-lus',
    '/api/dinggou-jihuas',
    '/api/ai-tokens',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`测试 ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true // 不抛出错误
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - 状态码: ${response.status}`);
      } else if (response.status === 401) {
        console.log(`🔒 ${endpoint} - 需要认证 (状态码: ${response.status})`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - 未找到 (状态码: ${response.status})`);
      } else {
        console.log(`⚠️ ${endpoint} - 其他错误 (状态码: ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - 请求失败: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 API端点测试完成');
}

// 运行测试
testAPIEndpoints().catch(console.error); 