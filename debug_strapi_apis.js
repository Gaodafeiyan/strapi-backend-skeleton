const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

async function debugStrapiAPIs() {
  console.log('🔍 调试Strapi API加载情况...\n');

  // 测试一些基本的Strapi端点
  const testEndpoints = [
    '/',
    '/admin',
    '/api',
    '/api/notices',
    '/api/qianbao-yues',
    '/api/dinggou-jihuas',
    '/api/ai-tokens',
    '/api/choujiang-ji-lus',
    '/api/yaoqing-jianglis',
    '/api/qianbao-chongzhis',
    '/api/qianbao-tixians',
    '/api/dinggou-dingdans',
  ];

  console.log('📋 测试所有端点:\n');

  for (const endpoint of testEndpoints) {
    try {
      console.log(`测试 ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true
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
  }

  // 测试一些可能存在的系统端点
  console.log('\n🔧 测试系统端点:\n');
  
  const systemEndpoints = [
    '/_health',
    '/health',
    '/api/health',
    '/admin/health',
    '/admin/information',
  ];

  for (const endpoint of systemEndpoints) {
    try {
      console.log(`测试 ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true
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
  }

  console.log('\n🎯 调试完成');
  console.log('\n💡 建议:');
  console.log('1. 检查Strapi启动日志中是否有API加载错误');
  console.log('2. 确认所有API的content-types配置正确');
  console.log('3. 尝试重启Strapi服务');
}

// 运行调试
debugStrapiAPIs().catch(console.error); 