const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

async function debugRoutes() {
  console.log('🔍 调试Strapi路由注册情况...\n');

  // 测试各种API端点
  const endpoints = [
    '/api/notices',
    '/api/qianbao-yues',
    '/api/qianbao-yues/user-wallet',
    '/api/dinggou-jihuas',
    '/api/dinggou-dingdans',
    '/api/choujiang-ji-lus',
    '/api/yaoqing-jianglis',
    '/api/qianbao-chongzhis',
    '/api/qianbao-tixians',
    '/api/ai-tokens',
  ];

  console.log('📋 测试API端点状态:\n');

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

  // 测试管理面板
  try {
    console.log('测试管理面板...');
    const response = await axios.get(`${BASE_URL}/admin`, {
      timeout: 5000,
      validateStatus: () => true
    });
    console.log(`管理面板状态码: ${response.status}`);
  } catch (error) {
    console.log(`管理面板请求失败: ${error.message}`);
  }

  console.log('\n🎯 路由调试完成');
}

// 运行调试
debugRoutes().catch(console.error); 