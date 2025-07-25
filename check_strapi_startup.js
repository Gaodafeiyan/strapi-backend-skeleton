const { spawn } = require('child_process');
const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

async function checkStrapiStartup() {
  console.log('🔍 检查Strapi启动情况...\n');

  // 等待Strapi启动
  console.log('等待Strapi启动...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 测试基本连接
  try {
    console.log('测试Strapi连接...');
    const response = await axios.get(`${BASE_URL}`, {
      timeout: 10000,
      validateStatus: () => true
    });
    console.log(`Strapi响应状态码: ${response.status}`);
  } catch (error) {
    console.log(`Strapi连接失败: ${error.message}`);
  }

  // 测试管理面板
  try {
    console.log('测试管理面板...');
    const response = await axios.get(`${BASE_URL}/admin`, {
      timeout: 10000,
      validateStatus: () => true
    });
    console.log(`管理面板状态码: ${response.status}`);
  } catch (error) {
    console.log(`管理面板连接失败: ${error.message}`);
  }

  // 测试API端点
  const testEndpoints = [
    '/api/notices',
    '/api/qianbao-yues',
    '/api/dinggou-jihuas',
    '/api/ai-tokens'
  ];

  console.log('\n📋 测试API端点:\n');

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

  console.log('\n🎯 检查完成');
}

// 运行检查
checkStrapiStartup().catch(console.error); 