const axios = require('axios');

const baseURL = 'http://localhost:1337';

async function testEndpoints() {
  console.log('🧪 开始测试API端点...\n');
  
  const endpoints = [
    { path: '/api/ai-tokens/active', method: 'GET', auth: false },
    { path: '/api/qianbao-yues/user-wallet', method: 'GET', auth: true },
    { path: '/api/dinggou-jihuas/active', method: 'GET', auth: false },
    { path: '/api/dinggou-dingdans', method: 'GET', auth: true },
    { path: '/api/yaoqing-jianglis/stats', method: 'GET', auth: true },
    { path: '/api/choujiang-ji-lus/perform', method: 'POST', auth: true },
    { path: '/api/webhooks', method: 'GET', auth: false },
    { path: '/api/ai-tokens/1/price', method: 'GET', auth: false },
    { path: '/api/ai-tokens/prices/batch', method: 'GET', auth: false },
  ];

  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${baseURL}${endpoint.path}`,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      // 如果需要认证，添加token（这里需要实际的token）
      if (endpoint.auth) {
        config.headers.Authorization = 'Bearer YOUR_TOKEN_HERE';
      }
      
      const response = await axios(config);
      console.log(`✅ ${endpoint.method} ${endpoint.path}: ${response.status}`);
    } catch (error) {
      const status = error.response?.status || 'Network Error';
      const message = error.response?.data?.error?.message || error.message;
      console.log(`❌ ${endpoint.method} ${endpoint.path}: ${status} - ${message}`);
    }
  }
}

testEndpoints();
